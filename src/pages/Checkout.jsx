import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { recordCouponUsage } from '../lib/couponUtils';
import CouponInput from '../components/CouponInput';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart, appliedCoupon, discount, finalTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const shipping = 0;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setLoading(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      alert('Razorpay SDK failed to load. Please check your connection.');
      setLoading(false);
      return;
    }

    const paymentAmount = finalTotal;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount: paymentAmount * 100,
      currency: 'INR',
      name: 'UrbanThread',
      description: `Order of ${cartItems.length} item(s)`,
      handler: async function (response) {
        // Save order to Supabase
        try {
          const { data: orderData } = await supabase.from('orders').insert({
            user_id: user?.id || null,
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              image_url: item.image_url
            })),
            total: paymentAmount,
            payment_id: response.razorpay_payment_id,
            status: 'confirmed',
            shipping_address: form,
            coupon_code: appliedCoupon?.code || null,
            discount: discount || 0,
          }).select().single();

          // Record coupon usage
          if (appliedCoupon && user?.id && orderData) {
            await recordCouponUsage(appliedCoupon.id, user.id, orderData.id);
          }
        } catch (err) {
          console.error('Error saving order:', err);
        }

        clearCart();
        setOrderPlaced(true);
      },
      prefill: {
        name: form.fullName,
        email: form.email,
        contact: form.phone,
      },
      theme: {
        color: '#2979FF',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => {
      alert('Payment failed. Please try again.');
    });
    rzp.open();
    setLoading(false);
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page page-enter">
        <div className="container">
          <div className="order-success animate-scale-in">
            <CheckCircle size={64} color="var(--success)" />
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for shopping with UrbanThread. Your order is being processed.</p>
            {discount > 0 && (
              <p className="order-success-savings">
                <Sparkles size={16} /> You saved ₹{discount.toLocaleString('en-IN')} with coupon!
              </p>
            )}
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page page-enter">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <form className="checkout-layout" onSubmit={handlePayment}>
          <div className="checkout-form-section">
            <h2 className="checkout-section-title">Shipping Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" name="fullName" className="form-input" value={form.fullName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" name="email" className="form-input" value={form.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input type="tel" name="phone" className="form-input" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Address *</label>
              <textarea name="address" className="form-input" rows="3" value={form.address} onChange={handleChange} required></textarea>
            </div>
            <div className="form-row form-row-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input type="text" name="city" className="form-input" value={form.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input type="text" name="state" className="form-input" value={form.state} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input type="text" name="pincode" className="form-input" value={form.pincode} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="checkout-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="checkout-items">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.size}`} className="checkout-item">
                  <img src={item.image_url} alt={item.name} className="checkout-item-img" />
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.name}</span>
                    <span className="checkout-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="checkout-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            {/* Coupon Section */}
            <div className="summary-divider"></div>
            <CouponInput />

            {appliedCoupon && (
              <>
                <div className="summary-divider"></div>
                <div className="summary-row summary-discount">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>−₹{discount.toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-savings">
                  <Sparkles size={14} />
                  You're saving ₹{discount.toLocaleString('en-IN')}!
                </div>
              </>
            )}

            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              <Lock size={16} />
              {loading ? 'Processing...' : `Pay ₹${finalTotal.toLocaleString('en-IN')}`}
            </button>
            <p className="secure-note">
              <Lock size={14} /> Secured by Razorpay
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
