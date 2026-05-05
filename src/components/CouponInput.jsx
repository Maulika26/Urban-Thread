import { useState, useEffect } from 'react';
import { Tag, X, ChevronDown, ChevronUp, Sparkles, Clock, Check, AlertCircle, Percent, BadgeIndianRupee } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchAvailableCoupons, findBestCoupon, calculateDiscount } from '../lib/couponUtils';
import './CouponInput.css';

export default function CouponInput() {
  const { user } = useAuth();
  const {
    cartItems, cartTotal, appliedCoupon, discount,
    applyCoupon, removeCoupon, couponLoading, couponError, setCouponError
  } = useCart();

  const [code, setCode] = useState('');
  const [showCoupons, setShowCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [bestCouponId, setBestCouponId] = useState(null);

  useEffect(() => {
    if (showCoupons) {
      loadCoupons();
    }
  }, [showCoupons, user?.id]);

  const loadCoupons = async () => {
    setLoadingCoupons(true);
    const coupons = await fetchAvailableCoupons(user?.id);
    setAvailableCoupons(coupons);

    const best = findBestCoupon(coupons, cartItems, cartTotal);
    setBestCouponId(best?.id || null);

    setLoadingCoupons(false);
  };

  const handleApply = async () => {
    if (!code.trim()) return;
    await applyCoupon(code.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  const handleSelectCoupon = async (couponCode) => {
    setCode(couponCode);
    await applyCoupon(couponCode);
    setShowCoupons(false);
  };

  const handleRemove = () => {
    setCode('');
    removeCoupon();
  };

  const getTimeRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const diff = new Date(expiryDate) - new Date();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 7) return null; // Only show countdown for < 7 days
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <div className="coupon-section">
      {appliedCoupon ? (
        <div className="coupon-applied">
          <div className="coupon-applied-header">
            <div className="coupon-applied-icon">
              <Check size={16} />
            </div>
            <div className="coupon-applied-info">
              <span className="coupon-applied-code">{appliedCoupon.code}</span>
              <span className="coupon-applied-savings">
                You save ₹{discount.toLocaleString('en-IN')}
              </span>
            </div>
            <button className="coupon-remove-btn" onClick={handleRemove} title="Remove coupon">
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="coupon-input-wrapper">
          <div className="coupon-input-row">
            <div className="coupon-input-field">
              <Tag size={16} className="coupon-input-icon" />
              <input
                type="text"
                placeholder="Enter coupon code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (couponError) setCouponError(null);
                }}
                onKeyDown={handleKeyDown}
                className="coupon-input"
                id="coupon-code-input"
              />
            </div>
            <button
              className="btn btn-primary coupon-apply-btn"
              onClick={handleApply}
              disabled={couponLoading || !code.trim()}
            >
              {couponLoading ? (
                <div className="coupon-spinner" />
              ) : (
                'Apply'
              )}
            </button>
          </div>

          {couponError && (
            <div className="coupon-error animate-fade-in">
              <AlertCircle size={14} />
              <span>{couponError}</span>
            </div>
          )}
        </div>
      )}

      {/* Available Coupons Toggle */}
      <button
        className="available-coupons-toggle"
        onClick={() => setShowCoupons(!showCoupons)}
      >
        <Sparkles size={14} />
        <span>View available coupons</span>
        {showCoupons ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Available Coupons Panel */}
      {showCoupons && (
        <div className="available-coupons-panel animate-fade-in">
          {loadingCoupons ? (
            <div className="coupons-loading">
              <div className="coupon-spinner" />
              <span>Loading coupons...</span>
            </div>
          ) : availableCoupons.length === 0 ? (
            <div className="no-coupons">
              <Tag size={20} />
              <span>No coupons available right now</span>
            </div>
          ) : (
            <div className="coupons-list">
              {availableCoupons.map(coupon => {
                const { discountAmount } = calculateDiscount(coupon, cartTotal, cartItems);
                const timeLeft = getTimeRemaining(coupon.expiry_date);
                const isBest = coupon.id === bestCouponId;
                const isApplicable = !coupon.min_order_value || cartTotal >= coupon.min_order_value;

                return (
                  <div
                    key={coupon.id}
                    className={`coupon-card ${isBest ? 'coupon-card-best' : ''} ${!isApplicable ? 'coupon-card-disabled' : ''}`}
                  >
                    {isBest && (
                      <div className="best-deal-badge">
                        <Sparkles size={10} /> Best Deal
                      </div>
                    )}
                    <div className="coupon-card-left">
                      <div className="coupon-card-icon">
                        {coupon.discount_type === 'percentage' ? (
                          <Percent size={18} />
                        ) : (
                          <BadgeIndianRupee size={18} />
                        )}
                      </div>
                      <div className="coupon-card-details">
                        <div className="coupon-card-code">{coupon.code}</div>
                        <div className="coupon-card-desc">
                          {coupon.discount_type === 'flat'
                            ? `₹${coupon.discount_value} off`
                            : `${coupon.discount_value}% off${coupon.max_discount ? ` (up to ₹${coupon.max_discount})` : ''}`
                          }
                          {coupon.min_order_value > 0 && (
                            <span className="coupon-card-min"> • Min ₹{coupon.min_order_value.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        {coupon.applicable_categories && coupon.applicable_categories.length > 0 && (
                          <div className="coupon-card-categories">
                            On: {coupon.applicable_categories.join(', ')}
                          </div>
                        )}
                        {timeLeft && (
                          <div className="coupon-card-timer">
                            <Clock size={11} />
                            <span>{timeLeft}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="coupon-card-right">
                      {isApplicable && discountAmount > 0 && (
                        <div className="coupon-card-saving">Save ₹{discountAmount.toLocaleString('en-IN')}</div>
                      )}
                      <button
                        className="btn btn-sm coupon-card-apply"
                        onClick={() => handleSelectCoupon(coupon.code)}
                        disabled={!isApplicable || appliedCoupon?.id === coupon.id}
                      >
                        {appliedCoupon?.id === coupon.id ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
