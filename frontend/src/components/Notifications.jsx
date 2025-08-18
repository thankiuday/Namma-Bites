import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../api/notificationApi';
import { FaBell, FaTimes, FaExclamationCircle, FaGift } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Notifications = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const POLL_INTERVAL_MS = 30000; // 30s polling for near real-time updates

  const storageKey = user ? `nb_unread_count:${user._id}` : 'nb_unread_count';

  const fetchUnreadCountOnly = async () => {
    if (!user) return;
    // Avoid race/flicker: skip badge updates while panel open or while marking as read
    if (showNotifications || isMarkingRead) return;
    try {
      const res = await notificationApi.getUnreadCount();
      if (res.data?.success && typeof res.data.count === 'number') {
        setUnreadCount(res.data.count);
        try { localStorage.setItem(storageKey, String(res.data.count)); } catch {}
      }
    } catch (e) {
      // ignore, will retry on next poll
    }
  };

  const fetchNotifications = async (pageNum = 1) => {
    if (!user) return;
    
    try {
      const response = await notificationApi.getUserNotifications(pageNum);
      if (response.data.success) {
        if (pageNum === 1) {
          setNotifications(response.data.data);
        } else {
          setNotifications(prev => [...prev, ...response.data.data]);
        }
        setHasMore(pageNum < response.data.pagination.pages);
        setUnreadCount(response.data.data.filter(n => !n.readBy.some(r => r.user === user._id)).length);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      // When opening panel, if there are unread, mark them read once
      if (unreadCount > 0 && !isMarkingRead) {
        setIsMarkingRead(true);
        setUnreadCount(0); // instant UX
        try { localStorage.setItem(storageKey, '0'); } catch {}
        (async () => {
          try {
            await notificationApi.markAllAsRead();
          } catch (e) {
            // ignore; polling will resync
          } finally {
            setIsMarkingRead(false);
            fetchNotifications(1);
            // Defer count refresh slightly to let server update
            setTimeout(fetchUnreadCountOnly, 300);
          }
        })();
      } else {
        // No unread, just refresh list when opening
        fetchNotifications(1);
      }
    }
  }, [showNotifications]);

  // Background polling for new notifications to keep badge in sync
  useEffect(() => {
    if (!user) return;
    // hydrate from localStorage for instant UI
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored != null && stored !== '') {
        const n = Number(stored);
        if (!Number.isNaN(n)) setUnreadCount(n);
      }
    } catch {}
    // initial count fetch to sync counter without opening panel
    fetchUnreadCountOnly();
    const interval = setInterval(() => {
      fetchUnreadCountOnly();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Live updates via SSE: update badge instantly when server pushes a notification
  useEffect(() => {
    if (!user) return;
    const base = import.meta.env.VITE_API_URL || '';
    if (!base) return;
    const url = base.replace(/\/$/, '') + '/users/orders/events';
    let es;
    try {
      // Use absolute URL for production backends when VITE_API_URL is absolute; EventSource ignores withCredentials for some proxies unless same-origin
      es = new EventSource(url, { withCredentials: true });
      es.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg && msg.type === 'notification') {
            // increment unread count unless panel is open (then we mark read on open)
            if (!showNotifications) {
              setUnreadCount((c) => {
                const next = c + 1;
                try { localStorage.setItem(storageKey, String(next)); } catch {}
                return next;
              });
              // Show a live toast for user order notifications
              const title = msg.data?.title || 'New notification';
              const message = msg.data?.message || '';
              toast.info(`${title}${message ? `: ${message}` : ''}`, {
                onClick: () => { try { onNavigate && onNavigate(); } catch (_) {} navigate('/notifications'); },
              });
            } else {
              // If panel is open, refresh list to show incoming message
              fetchNotifications(1);
            }
          } else if (msg && msg.type === 'order_updated') {
            // Show a toast for order state changes as a fallback when no notification doc is created
            const state = String(msg.state || '').toLowerCase();
            let text = 'Order updated';
            if (state === 'preparing') text = 'Your order is being prepared';
            else if (state === 'ready') text = 'Your order is ready for pickup';
            else if (state === 'completed') text = 'Your order has been completed';
            // Avoid duplicate toasts within a short window
            toast.dismiss('order_state');
            toast.info(text, { toastId: 'order_state', onClick: () => { try { onNavigate && onNavigate(); } catch (_) {} navigate('/orders'); } });
            // Optionally, trigger a lightweight refresh of notifications/count shortly after
            setTimeout(() => { try { fetchUnreadCountOnly(); } catch (_) {} }, 500);
          }
        } catch (_) {}
      };
    } catch (_) {}
    return () => { try { es && es.close(); } catch (_) {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, showNotifications]);

  // Also fetch once on initial mount to avoid waiting for user state edge cases
  useEffect(() => {
    fetchUnreadCountOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'subscription_alert':
        return <FaExclamationCircle className="text-red-500" />;
      case 'special_offer':
        return <FaGift className="text-green-500" />;
      default:
        return <FaBell className="text-blue-500" />;
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return diffInHours === 0 ? 'Just now' : `${diffInHours}h ago`;
    }
    return notificationDate.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <div className="relative inline-block">
        <button
          onClick={async () => {
            // Optimistically zero and persist, then mark all read server-side
            if (unreadCount > 0) {
              setUnreadCount(0);
              try { localStorage.setItem(storageKey, '0'); } catch {}
              try { await notificationApi.markAllAsRead(); } catch {}
            }
            // Always navigate to dedicated notifications page
            setShowNotifications(false);
            try { onNavigate && onNavigate(); } catch (_) {}
            navigate('/notifications');
          }}
          className="relative p-2 text-orange-600 hover:text-orange-700 transition-colors"
        >
          <FaBell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-orange-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          {loading && (
            <div className="p-4 text-center text-gray-500">
              Loading notifications...
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No notifications yet
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <button
                key={notification._id}
                onClick={() => {
                  // Optimistically reduce unread counter on click if this was unread
                  const wasUnread = notification.isRead === false || !notification.isRead;
                  if (wasUnread) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                    setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
                  }
                  setShowNotifications(false);
                  navigate(`/notifications/${notification._id}`);
                }}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notification.title}
                    </p>
                    <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-400' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>{notification.sender?.name}</span>
                      <span className="mx-1">•</span>
                      <span>{formatDate(notification.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {hasMore && (
            <div className="p-4 text-center">
              <button
                onClick={loadMore}
                className="text-orange-600 hover:text-orange-700 font-medium"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
