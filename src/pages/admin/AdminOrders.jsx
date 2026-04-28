import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, MapPin, ChevronDown, ChevronUp, Search, Filter, RefreshCw, CircleDot, User, Mail, Phone, CornerUpLeft, Check, X, Wallet, IndianRupee } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Admin.css';
import './AdminOrders.css';

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'var(--success)' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'var(--info)' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'var(--accent)' },
  { value: 'delivered', label: 'Delivered', icon: MapPin, color: 'var(--success)' },
];

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AdminOrderCard({ order, onStatusUpdate, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [showRefundPanel, setShowRefundPanel] = useState(false);
  const [refundAmount, setRefundAmount] = useState(order.total || 0);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setUpdating(true);

    // Build status_history with timestamps for each status change
    const statusHistory = order.status_history || {};
    statusHistory[newStatus] = new Date().toISOString();

    const { error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        status_history: statusHistory
      })
      .eq('id', order.id);

    if (!error) {
      setCurrentStatus(newStatus);
      onStatusUpdate(order.id, newStatus, statusHistory);
    } else {
      alert('Failed to update status. Please try again.');
    }
    setUpdating(false);
  };

  const handleReturnAction = async (status) => {
    setUpdating(true);
    
    const updatedReturnRequest = {
      ...order.return_request,
      status: status,
      processed_at: new Date().toISOString()
    };

    // Only auto-set refund for approval if NOT using separate refund panel
    // We no longer auto-initiate refund - admin does it manually

    const { error } = await supabase
      .from('orders')
      .update({
        return_request: updatedReturnRequest
      })
      .eq('id', order.id);

    if (!error) {
      if (status === 'approved') {
        alert('Return request approved. You can now initiate the refund below.');
        setShowRefundPanel(true);
      } else {
        alert('Return request rejected.');
      }
      onRefresh();
    } else {
      alert('Failed to process return request.');
    }
    setUpdating(false);
  };

  const handleInitiateRefund = async () => {
    if (!refundAmount || refundAmount <= 0) {
      alert('Please enter a valid refund amount.');
      return;
    }
    if (refundAmount > order.total) {
      alert('Refund amount cannot exceed the order total.');
      return;
    }

    setUpdating(true);

    const updatedReturnRequest = {
      ...order.return_request,
      refund_status: 'processed',
      refund_amount: Number(refundAmount),
      refund_processed_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('orders')
      .update({
        return_request: updatedReturnRequest
      })
      .eq('id', order.id);

    if (!error) {
      alert(`Refund of ₹${Number(refundAmount).toLocaleString('en-IN')} has been initiated successfully.`);
      setShowRefundPanel(false);
      onRefresh();
    } else {
      alert('Failed to initiate refund.');
    }
    setUpdating(false);
  };

  const items = order.items || [];
  const address = order.shipping_address || {};
  const returnReq = order.return_request;
  const isRefundPending = returnReq?.status === 'approved' && returnReq?.refund_status !== 'processed';
  const isRefundDone = returnReq?.refund_status === 'processed';

  return (
    <div className={`admin-order-card ${expanded ? 'admin-order-expanded' : ''}`}>
      <div className="admin-order-header" onClick={() => setExpanded(!expanded)}>
        <div className="admin-order-left">
          <div className="admin-order-id-section">
            <span className="admin-order-id">#{order.payment_id?.slice(-8)?.toUpperCase() || 'N/A'}</span>
            <span className="admin-order-date">
              <Clock size={12} />
              {formatDate(order.created_at)}
            </span>
          </div>
        </div>

        <div className="admin-order-center">
          <span className="admin-order-customer">
            <User size={13} />
            {address.fullName || 'Unknown'}
          </span>
          <span className="admin-order-amount">₹{order.total?.toLocaleString('en-IN')}</span>
        </div>

        <div className="admin-order-right">
          <span className={`order-status-badge status-${currentStatus}`}>
            <CircleDot size={10} />
            {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label || currentStatus}
          </span>
          {returnReq && (
            <span className={`return-status-badge status-${returnReq.status}`}>
              <CornerUpLeft size={9} />
              Return: {returnReq.status}
            </span>
          )}
          <button className="order-expand-btn" aria-label="Toggle details">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="admin-order-body animate-fade-in">
          {/* Status Update Section */}
          <div className="status-update-section">
            <h4 className="status-update-title">Update Delivery Status</h4>
            <p className="status-update-subtitle">Click a status to update. The customer will be notified automatically.</p>
            <div className="status-steps">
              {STATUS_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = currentStatus === option.value;
                const currentIdx = STATUS_OPTIONS.findIndex(s => s.value === currentStatus);
                const optionIdx = STATUS_OPTIONS.findIndex(s => s.value === option.value);
                const isPast = optionIdx < currentIdx;
                const statusTime = order.status_history?.[option.value];

                return (
                  <button
                    key={option.value}
                    className={`status-step-btn ${isActive ? 'status-step-active' : ''} ${isPast ? 'status-step-past' : ''}`}
                    style={{ '--step-color': option.color }}
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(option.value); }}
                    disabled={updating}
                    title={`Set to ${option.label}`}
                  >
                    <div className="status-step-icon">
                      <Icon size={18} />
                    </div>
                    <span className="status-step-label">{option.label}</span>
                    {isActive && <span className="status-step-current">Current</span>}
                    {statusTime && <span className="status-step-time">{new Date(statusTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                  </button>
                );
              })}
            </div>
            {updating && <p className="status-updating-msg">Updating status...</p>}
          </div>

          {/* Order Items */}
          <div className="admin-order-items">
            <h4>Items ({items.length})</h4>
            <div className="admin-items-list">
              {items.map((item, idx) => (
                <div key={idx} className="admin-item-row">
                  <div className="admin-item-info">
                    <span className="admin-item-name">{item.name}</span>
                    <div className="admin-item-meta">
                      <span className="admin-item-qty">× {item.quantity}</span>
                      {item.size && <span className="admin-item-size-badge">Size: {item.size}</span>}
                    </div>
                  </div>
                  <span className="admin-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Return Request Details */}
          {returnReq && (
            <div className="admin-return-section">
              <div className="admin-return-header">
                <h4><CornerUpLeft size={16} /> Return Request</h4>
                <span className={`return-status-badge status-${returnReq.status}`}>
                  {returnReq.status}
                </span>
              </div>
              <div className="admin-return-body">
                <p><strong>Reason:</strong> {returnReq.reason?.replace(/_/g, ' ')}</p>
                {returnReq.details && <p><strong>Details:</strong> {returnReq.details}</p>}
                {returnReq.processed_at && (
                  <p className="admin-return-processed">Processed on {formatDate(returnReq.processed_at)}</p>
                )}
                
                {/* Pending → Approve / Reject buttons */}
                {returnReq.status === 'pending' && (
                  <div className="admin-return-actions">
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleReturnAction('approved'); }}
                      disabled={updating}
                    >
                      <Check size={14} /> Approve Return
                    </button>
                    <button 
                      className="btn btn-error btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleReturnAction('rejected'); }}
                      disabled={updating}
                    >
                      <X size={14} /> Reject Return
                    </button>
                  </div>
                )}

                {/* Refund Section — shows after approval */}
                {returnReq.status === 'approved' && (
                  <div className="admin-refund-section">
                    {isRefundDone ? (
                      <div className="admin-refund-done">
                        <div className="admin-refund-done-icon">
                          <CheckCircle size={20} />
                        </div>
                        <div className="admin-refund-done-info">
                          <span className="admin-refund-done-title">Refund Processed</span>
                          <span className="admin-refund-done-amount">₹{returnReq.refund_amount?.toLocaleString('en-IN')} refunded</span>
                          {returnReq.refund_processed_at && (
                            <span className="admin-refund-done-date">on {formatDate(returnReq.refund_processed_at)}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="admin-refund-panel">
                        <div className="admin-refund-panel-header">
                          <Wallet size={18} />
                          <h5>Initiate Refund</h5>
                        </div>
                        <div className="admin-refund-panel-body">
                          <div className="admin-refund-input-group">
                            <label className="form-label">Refund Amount (₹)</label>
                            <div className="admin-refund-input-wrapper">
                              <IndianRupee size={16} className="admin-refund-currency-icon" />
                              <input
                                type="number"
                                className="form-input admin-refund-input"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                                min="1"
                                max={order.total}
                                step="1"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <span className="admin-refund-max">Max: ₹{order.total?.toLocaleString('en-IN')}</span>
                          </div>
                          <button
                            className="btn btn-primary btn-sm admin-refund-btn"
                            onClick={(e) => { e.stopPropagation(); handleInitiateRefund(); }}
                            disabled={updating}
                          >
                            <Wallet size={14} />
                            {updating ? 'Processing...' : 'Initiate Refund'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer & Address */}
          <div className="admin-order-details-grid">
            <div className="admin-detail-card">
              <h4>Customer Details</h4>
              <div className="admin-detail-rows">
                <div className="admin-detail-row">
                  <User size={14} />
                  <span>{address.fullName || '—'}</span>
                </div>
                <div className="admin-detail-row">
                  <Mail size={14} />
                  <span>{address.email || '—'}</span>
                </div>
                <div className="admin-detail-row">
                  <Phone size={14} />
                  <span>{address.phone || '—'}</span>
                </div>
              </div>
            </div>
            <div className="admin-detail-card">
              <h4>Shipping Address</h4>
              <p className="admin-address-text">
                {address.address || '—'}<br />
                {address.city}{address.state ? `, ${address.state}` : ''}{address.pincode ? ` - ${address.pincode}` : ''}
              </p>
            </div>
            <div className="admin-detail-card">
              <h4>Payment</h4>
              <div className="admin-detail-rows">
                <div className="admin-detail-row">
                  <span className="detail-label">Payment ID</span>
                  <span className="detail-value-mono">{order.payment_id || '—'}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="detail-label">Total</span>
                  <span className="detail-value-bold">₹{order.total?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const handleStatusUpdate = (orderId, newStatus, statusHistory) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus, status_history: statusHistory || o.status_history } : o)
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      searchQuery === '' ||
      order.payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: orders.length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="admin-page page-enter">
      <div className="container">
        <Link to="/admin" className="back-link">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <div className="admin-header">
          <div>
            <h1 className="admin-title">Manage Orders</h1>
            <p className="admin-subtitle">View and update delivery status for all orders</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchOrders}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="order-filter-tabs">
          {[
            { value: 'all', label: 'All Orders' },
            ...STATUS_OPTIONS.map(s => ({ value: s.value, label: s.label })),
          ].map(tab => (
            <button
              key={tab.value}
              className={`order-filter-tab ${filterStatus === tab.value ? 'filter-tab-active' : ''}`}
              onClick={() => setFilterStatus(tab.value)}
            >
              {tab.label}
              <span className="filter-tab-count">{statusCounts[tab.value]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              className="form-input admin-search-input"
              placeholder="Search by name, email, or payment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="page-loader"><div className="spinner"></div></div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <Package size={64} />
            <h3>No orders found</h3>
            <p>{searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or filter.' : 'No orders have been placed yet.'}</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {filteredOrders.map(order => (
              <AdminOrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                onRefresh={fetchOrders}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
