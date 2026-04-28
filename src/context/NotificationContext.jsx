import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

const STORAGE_KEY = 'urbanthread_notifications';
const SEEN_KEY = 'urbanthread_seen_notifications';

function loadNotifications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

function loadSeenIds() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY)) || [];
  } catch {
    return [];
  }
}

function saveSeenIds(ids) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
}

const STATUS_LABELS = {
  confirmed: 'Order Confirmed',
  processing: 'Order is Being Processed',
  shipped: 'Order Shipped',
  delivered: 'Order Delivered',
};

const STATUS_MESSAGES = {
  confirmed: (id) => `Your Order #${id} has been confirmed and is being prepared.`,
  processing: (id) => `Your Order #${id} is now being processed and packed.`,
  shipped: (id) => `Great news! Your Order #${id} has been shipped and is on its way.`,
  delivered: (id) => `Your Order #${id} has been delivered. Enjoy your purchase!`,
};

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [seenIds, setSeenIds] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    if (user) {
      setNotifications(loadNotifications());
      setSeenIds(loadSeenIds());
    } else {
      setNotifications([]);
      setSeenIds([]);
    }
  }, [user]);

  // Compute unread count
  useEffect(() => {
    const count = notifications.filter(n => !seenIds.includes(n.id)).length;
    setUnreadCount(count);
  }, [notifications, seenIds]);

  // Check for all order updates - delivery status + return/refund
  const checkForUpdates = useCallback(async () => {
    if (!user) return;

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !orders) return;

    const newNotifications = [];
    
    orders.forEach(order => {
      const orderId = order.payment_id?.slice(-8)?.toUpperCase() || order.id.slice(0, 8);
      const statusHistory = order.status_history || {};

      // === Delivery Status Notifications ===
      const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
      
      statusOrder.forEach(status => {
        // Generate notification if order has reached this status
        const currentIdx = statusOrder.indexOf(order.status);
        const statusIdx = statusOrder.indexOf(status);
        
        if (statusIdx <= currentIdx) {
          const statusNotifId = `status-${status}-${order.id}`;
          const timestamp = statusHistory[status] || order.created_at;
          
          newNotifications.push({
            id: statusNotifId,
            type: `status_${status}`,
            orderId: order.id,
            orderShortId: orderId,
            title: STATUS_LABELS[status],
            message: STATUS_MESSAGES[status](orderId),
            timestamp: timestamp,
            icon: status,
          });
        }
      });

      // === Return/Refund Notifications ===
      const returnReq = order.return_request;
      if (!returnReq) return;

      // Notification for return approved
      if (returnReq.status === 'approved') {
        const approvalId = `return-approved-${order.id}`;
        newNotifications.push({
          id: approvalId,
          type: 'return_approved',
          orderId: order.id,
          orderShortId: orderId,
          title: 'Return Approved',
          message: `Your return request for Order #${orderId} has been approved.`,
          timestamp: returnReq.processed_at || new Date().toISOString(),
          icon: 'check-circle',
        });

        // Notification for refund processed
        if (returnReq.refund_status === 'processed') {
          const refundId = `refund-processed-${order.id}`;
          newNotifications.push({
            id: refundId,
            type: 'refund_processed',
            orderId: order.id,
            orderShortId: orderId,
            title: 'Refund Initiated',
            message: `Refund of ₹${returnReq.refund_amount?.toLocaleString('en-IN')} for Order #${orderId} has been initiated. It will reflect in 5-7 business days.`,
            timestamp: returnReq.refund_processed_at || returnReq.processed_at || new Date().toISOString(),
            icon: 'wallet',
            refundAmount: returnReq.refund_amount,
          });
        }
      }

      // Notification for return rejected
      if (returnReq.status === 'rejected') {
        const rejectId = `return-rejected-${order.id}`;
        newNotifications.push({
          id: rejectId,
          type: 'return_rejected',
          orderId: order.id,
          orderShortId: orderId,
          title: 'Return Rejected',
          message: `Your return request for Order #${orderId} has been rejected.`,
          timestamp: returnReq.processed_at || new Date().toISOString(),
          icon: 'x-circle',
        });
      }
    });

    // Sort by timestamp descending
    newNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setNotifications(newNotifications);
    saveNotifications(newNotifications);
  }, [user]);

  // Poll for updates and set up realtime subscription
  useEffect(() => {
    if (!user) return;

    // Initial check
    checkForUpdates();

    // Set up realtime subscription for order changes
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Re-check when any of user's orders are updated
          checkForUpdates();
        }
      )
      .subscribe();

    // Also poll every 30 seconds as fallback
    const interval = setInterval(checkForUpdates, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user, checkForUpdates]);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setSeenIds(allIds);
    saveSeenIds(allIds);
  }, [notifications]);

  const markAsRead = useCallback((notificationId) => {
    setSeenIds(prev => {
      const updated = [...new Set([...prev, notificationId])];
      saveSeenIds(updated);
      return updated;
    });
  }, []);

  const dismissNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
    // Also mark as seen
    markAsRead(notificationId);
  }, [markAsRead]);

  const isUnread = useCallback((notificationId) => {
    return !seenIds.includes(notificationId);
  }, [seenIds]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAllAsRead,
      markAsRead,
      dismissNotification,
      isUnread,
      checkForUpdates,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
