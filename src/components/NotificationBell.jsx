import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Wallet, XCircle, ArrowRight, X, BellOff, Package, Truck, MapPin } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import './NotificationBell.css';

function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getNotificationIcon(type) {
  switch (type) {
    case 'status_confirmed':
      return { Icon: CheckCircle, className: 'notification-icon-confirmed' };
    case 'status_processing':
      return { Icon: Package, className: 'notification-icon-processing' };
    case 'status_shipped':
      return { Icon: Truck, className: 'notification-icon-shipped' };
    case 'status_delivered':
      return { Icon: MapPin, className: 'notification-icon-delivered' };
    case 'return_approved':
      return { Icon: CheckCircle, className: 'notification-icon-approved' };
    case 'refund_processed':
      return { Icon: Wallet, className: 'notification-icon-refund' };
    case 'return_rejected':
      return { Icon: XCircle, className: 'notification-icon-rejected' };
    default:
      return { Icon: Bell, className: 'notification-icon-approved' };
  }
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, markAsRead, dismissNotification, isUnread } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setOpen(false);
    navigate('/orders');
  };

  const handleDismiss = (e, notificationId) => {
    e.stopPropagation();
    dismissNotification(notificationId);
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        className="btn-icon nav-action-btn"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown animate-fade-in-down">
          <div className="notification-dropdown-header">
            <span className="notification-dropdown-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="notification-mark-read" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <BellOff size={36} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => {
                const { Icon, className } = getNotificationIcon(notification.type);
                const unread = isUnread(notification.id);

                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${unread ? 'notification-item-unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={`notification-icon ${className}`}>
                      <Icon size={18} />
                    </div>
                    <div className="notification-content">
                      <div className="notification-title-row">
                        <span className="notification-title">{notification.title}</span>
                        <span className="notification-time">{formatTimeAgo(notification.timestamp)}</span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                    </div>
                    <button
                      className="notification-dismiss"
                      onClick={(e) => handleDismiss(e, notification.id)}
                      aria-label="Dismiss"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <Link
                to="/orders"
                className="notification-view-all"
                onClick={() => setOpen(false)}
              >
                View all orders <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
