import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, MapPin, ChevronDown, ChevronUp, ShoppingBag, ArrowRight, Box, CircleDot, Star, X, MessageSquare, CornerUpLeft, Wallet, AlertCircle, BellRing, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import './Orders.css';

const STATUS_CONFIG = {
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    color: 'var(--success)',
    step: 1,
  },
  processing: {
    label: 'Processing',
    icon: Package,
    color: 'var(--info)',
    step: 2,
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: 'var(--accent)',
    step: 3,
  },
  delivered: {
    label: 'Delivered',
    icon: MapPin,
    color: 'var(--success)',
    step: 4,
  },
};

const TIMELINE_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusStep(status) {
  return STATUS_CONFIG[status]?.step || 1;
}

function StarRating({ rating, setRating, interactive = false, size = 18 }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(star)}
          className={`star-btn ${star <= rating ? 'star-filled' : 'star-empty'}`}
        >
          <Star size={size} fill={star <= rating ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

function OrderCard({ order, onReview, onReturn }) {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.confirmed;
  const StatusIcon = statusInfo.icon;
  const currentStep = getStatusStep(order.status);
  const items = order.items || [];

  return (
    <div className={`order-card ${expanded ? 'order-card-expanded' : ''}`}>
      <div className="order-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="order-header-left">
          <div className="order-icon-wrapper" style={{ '--status-color': statusInfo.color }}>
            <StatusIcon size={20} />
          </div>
          <div className="order-header-info">
            <span className="order-id">Order #{order.payment_id?.slice(-8)?.toUpperCase() || 'N/A'}</span>
            <span className="order-date">
              <Clock size={13} />
              {formatDate(order.created_at)} at {formatTime(order.created_at)}
            </span>
          </div>
        </div>
        <div className="order-header-right">
          <div className="order-header-meta">
            <span className={`order-status-badge status-${order.status}`}>
              <CircleDot size={10} />
              {statusInfo.label}
            </span>
            <span className="order-total">₹{order.total?.toLocaleString('en-IN')}</span>
          </div>
          <button className="order-expand-btn" aria-label="Toggle details">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="order-card-body animate-fade-in">
          {/* Progress Timeline */}
          <div className="order-timeline">
            {TIMELINE_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isDelivered = order.status === 'delivered';
              const isCompleted = isDelivered || currentStep > index + 1;
              const isCurrent = !isDelivered && currentStep === index + 1;
              return (
                <div
                  key={step.key}
                  className={`timeline-step ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''}`}
                >
                  <div className="timeline-icon">
                    <StepIcon size={16} />
                  </div>
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div className={`timeline-connector ${isCompleted ? 'connector-completed' : ''}`} />
                  )}
                  <span className="timeline-label">{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Order Items */}
          <div className="order-items-section">
            <h4 className="order-items-title">
              <Box size={16} /> Items ({items.length})
            </h4>
            <div className="order-items-list">
              {items.map((item, idx) => (
                <div key={idx} className="order-item">
                  <div className="order-item-image-container">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="order-item-image" />
                    ) : (
                      <div className="order-item-image-placeholder">
                        <Box size={20} />
                      </div>
                    )}
                  </div>
                  <div className="order-item-info-row">
                    <div className="order-item-info">
                      <span className="order-item-name">{item.name}</span>
                      <div className="order-item-meta">
                        <span className="order-item-qty">Qty: {item.quantity}</span>
                        {item.size && <span className="order-item-size">Size: {item.size}</span>}
                      </div>
                    </div>
                    {order.status === 'delivered' && (
                      <button 
                        className="btn btn-ghost btn-xs review-item-btn"
                        onClick={(e) => { e.stopPropagation(); onReview(order, item); }}
                      >
                        <Star size={14} /> Rate & Review
                      </button>
                    )}
                  </div>
                  <span className="order-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="order-address-section">
              <h4 className="order-address-title">
                <MapPin size={16} /> Shipping Address
              </h4>
              <p className="order-address-text">
                {order.shipping_address.fullName}<br />
                {order.shipping_address.address}<br />
                {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}<br />
                {order.shipping_address.phone && `Phone: ${order.shipping_address.phone}`}
              </p>
            </div>
          )}

          {/* Return Request Status */}
          {order.return_request && (
            <div className={`order-return-status-section return-section-${order.return_request.status} animate-fade-in`}>
              <div className="order-return-header">
                <h4 className="order-return-title">
                  <CornerUpLeft size={16} /> Return Request
                </h4>
                <span className={`return-status-badge status-${order.return_request.status}`}>
                  {order.return_request.status === 'approved' && <CheckCircle size={10} />}
                  {order.return_request.status === 'rejected' && <AlertCircle size={10} />}
                  {order.return_request.status === 'pending' && <Clock size={10} />}
                  {order.return_request.status}
                </span>
              </div>
              <div className="order-return-content">
                <p><strong>Reason:</strong> {order.return_request.reason?.replace(/_/g, ' ')}</p>
                {order.return_request.details && <p><strong>Details:</strong> {order.return_request.details}</p>}
                {order.return_request.processed_at && (
                  <p className="return-processed-date">
                    Processed on {formatDate(order.return_request.processed_at)}
                  </p>
                )}
                
                {/* Approved - Refund Timeline */}
                {order.return_request.status === 'approved' && (
                  <div className="refund-timeline animate-fade-in">
                    <div className="refund-timeline-step refund-step-done">
                      <div className="refund-step-icon"><CheckCircle size={14} /></div>
                      <div className="refund-step-info">
                        <span className="refund-step-label">Return Approved</span>
                        <span className="refund-step-date">{order.return_request.processed_at ? formatDate(order.return_request.processed_at) : ''}</span>
                      </div>
                    </div>
                    <div className="refund-timeline-connector refund-connector-done" />
                    <div className={`refund-timeline-step ${order.return_request.refund_status === 'processed' ? 'refund-step-done' : 'refund-step-pending'}`}>
                      <div className="refund-step-icon"><Wallet size={14} /></div>
                      <div className="refund-step-info">
                        <span className="refund-step-label">Refund Initiated</span>
                        <span className="refund-step-amount">₹{order.return_request.refund_amount?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className={`refund-timeline-connector ${order.return_request.refund_status === 'processed' ? 'refund-connector-done' : ''}`} />
                    <div className="refund-timeline-step refund-step-pending">
                      <div className="refund-step-icon"><IndianRupee size={14} /></div>
                      <div className="refund-step-info">
                        <span className="refund-step-label">Credit to Account</span>
                        <span className="refund-step-date">5-7 business days</span>
                      </div>
                    </div>
                  </div>
                )}

                {order.return_request.refund_status === 'processed' && (
                  <div className="refund-info-box animate-fade-in">
                    <p className="refund-success-text">
                      <CheckCircle size={14} /> Refund of ₹{order.return_request.refund_amount?.toLocaleString('en-IN')} has been initiated
                    </p>
                    <p className="refund-subtext">The amount will be credited to your original payment method within 5-7 business days.</p>
                  </div>
                )}

                {/* Rejected message */}
                {order.return_request.status === 'rejected' && (
                  <div className="return-rejected-box animate-fade-in">
                    <p className="return-rejected-text">
                      <AlertCircle size={14} /> Your return request was not approved.
                    </p>
                    <p className="return-rejected-subtext">If you believe this was an error, you may submit a new return request or contact our support team.</p>
                  </div>
                )}

                {/* Pending message */}
                {order.return_request.status === 'pending' && (
                  <div className="return-pending-box animate-fade-in">
                    <p className="return-pending-text">
                      <Clock size={14} /> Your return request is under review.
                    </p>
                    <p className="return-pending-subtext">We'll notify you once our team has processed your request. This usually takes 1-2 business days.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary Footer */}
          <div className="order-summary-footer">
            <div className="order-summary-row">
              <span>Payment ID</span>
              <span className="order-payment-id">{order.payment_id || 'N/A'}</span>
            </div>
            <div className="order-summary-row order-summary-total">
              <span>Total Paid</span>
              <span>₹{order.total?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {order.status === 'delivered' && (!order.return_request || order.return_request.status === 'rejected') && (
            <div className="order-actions-footer">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => onReturn(order)}
              >
                <CornerUpLeft size={16} /> {order.return_request?.status === 'rejected' ? 'Try Return Again' : 'Return Item'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllAsRead, dismissNotification, isUnread } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dismissedBanners, setDismissedBanners] = useState([]);
  
  const [reviewForm, setReviewForm] = useState({
    productId: '',
    rating: 0,
    comment: ''
  });

  const [returnForm, setReturnForm] = useState({
    reason: '',
    details: ''
  });

  useEffect(() => {
    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // For existing orders that don't have image_url in their JSONB snapshot, 
      // we'll try to fetch the current images from the products table.
      const ordersWithImages = await Promise.all(data.map(async (order) => {
        const enrichedItems = await Promise.all(order.items.map(async (item) => {
          if (!item.image_url) {
            const { data: productData } = await supabase
              .from('products')
              .select('image_url')
              .eq('id', item.id)
              .single();
            return { ...item, image_url: productData?.image_url };
          }
          return item;
        }));
        return { ...order, items: enrichedItems };
      }));
      
      setOrders(ordersWithImages);
    }
    setLoading(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        product_id: reviewForm.productId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      if (error) throw error;
      setShowReviewModal(false);
      setReviewForm({ productId: '', rating: 0, comment: '' });
      alert('Thank you for your review!');
    } catch (err) {
      alert(err.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          return_request: {
            reason: returnForm.reason,
            details: returnForm.details,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        })
        .eq('id', selectedOrder.id);
      
      if (error) throw error;
      setShowReturnModal(false);
      setReturnForm({ reason: '', details: '' });
      fetchOrders(); // Refresh to show return status maybe?
      alert('Return request submitted successfully.');
    } catch (err) {
      alert(err.message || 'Error requesting return');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="orders-page page-enter">
        <div className="container">
          <div className="page-loader"><div className="spinner"></div></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="orders-page page-enter">
        <div className="container">
          <div className="empty-state">
            <Package size={64} />
            <h3>Please log in</h3>
            <p>You need to be logged in to view your orders.</p>
            <Link to="/login" className="btn btn-primary">
              Login <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page page-enter">
        <div className="container">
          <div className="empty-state">
            <ShoppingBag size={64} />
            <h3>No orders yet</h3>
            <p>Once you place an order, you'll be able to track it here.</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page page-enter">
      <div className="container">
        <div className="orders-header">
          <h1 className="orders-title">My Orders</h1>
          <span className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Notification Banners */}
        {notifications.length > 0 && (
          <div className="order-notification-banners">
            {notifications
              .filter(n => !dismissedBanners.includes(n.id))
              .map(notification => (
                <div
                  key={notification.id}
                  className={`order-notification-banner banner-${notification.type} ${isUnread(notification.id) ? 'banner-unread' : ''} animate-fade-in-up`}
                >
                  <div className="banner-icon">
                    {notification.type === 'return_approved' && <CheckCircle size={20} />}
                    {notification.type === 'refund_processed' && <Wallet size={20} />}
                    {notification.type === 'return_rejected' && <AlertCircle size={20} />}
                    {notification.type === 'status_confirmed' && <CheckCircle size={20} />}
                    {notification.type === 'status_processing' && <Package size={20} />}
                    {notification.type === 'status_shipped' && <Truck size={20} />}
                    {notification.type === 'status_delivered' && <MapPin size={20} />}
                  </div>
                  <div className="banner-content">
                    <span className="banner-title">{notification.title}</span>
                    <span className="banner-message">{notification.message}</span>
                  </div>
                  <button
                    className="banner-dismiss"
                    onClick={() => {
                      setDismissedBanners(prev => [...prev, notification.id]);
                      dismissNotification(notification.id);
                    }}
                    aria-label="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
          </div>
        )}

        <div className="orders-list">
          {orders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onReview={(o, item) => {
                setSelectedOrder(o);
                setReviewForm({
                  productId: item.id,
                  productName: item.name,
                  rating: 0,
                  comment: ''
                });
                setShowReviewModal(true);
              }}
              onReturn={(o) => {
                setSelectedOrder(o);
                setShowReturnModal(true);
              }}
            />
          ))}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedOrder && (
          <div className="modal-overlay">
            <div className="modal-content animate-scale-in">
              <div className="modal-header">
                <h3>Rate & Review</h3>
                <button className="modal-close" onClick={() => setShowReviewModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <div className="review-product-info">
                  <span className="label">Reviewing:</span>
                  <span className="product-name">{reviewForm.productName}</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <StarRating 
                    rating={reviewForm.rating} 
                    setRating={(r) => setReviewForm({...reviewForm, rating: r})} 
                    interactive 
                    size={28}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Your Review</label>
                  <textarea 
                    className="form-input" 
                    rows="4" 
                    placeholder="Tell us what you liked or disliked..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && selectedOrder && (
          <div className="modal-overlay">
            <div className="modal-content animate-scale-in">
              <div className="modal-header">
                <h3>Request Return</h3>
                <button className="modal-close" onClick={() => setShowReturnModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form className="review-form" onSubmit={handleReturnSubmit}>
                <p className="return-policy-note">
                  Returns are only accepted within 7 days of delivery.
                </p>
                <div className="form-group">
                  <label className="form-label">Reason for Return</label>
                  <select 
                    className="form-input"
                    value={returnForm.reason}
                    onChange={(e) => setReturnForm({...returnForm, reason: e.target.value})}
                    required
                  >
                    <option value="">Select a reason...</option>
                    <option value="size_too_small">Size too small</option>
                    <option value="size_too_large">Size too large</option>
                    <option value="defective">Defective/Damaged</option>
                    <option value="wrong_item">Received wrong item</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {returnForm.reason === 'other' ? 'Please specify reason *' : 'Additional Details'}
                  </label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    placeholder={returnForm.reason === 'other' ? "Please explain the reason for return..." : "Provide more information..."}
                    value={returnForm.details}
                    onChange={(e) => setReturnForm({...returnForm, details: e.target.value})}
                    required={returnForm.reason === 'other'}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Request Return'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
