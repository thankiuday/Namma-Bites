import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBell, FaExclamationCircle, FaGift, FaCalendarAlt } from 'react-icons/fa';
import notificationApi from '../api/notificationApi';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [clickedNotificationId, setClickedNotificationId] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async (pageNum = 1) => {
    try {
      const response = await notificationApi.getUserNotifications(pageNum);
      if (response.data.success) {
        if (pageNum === 1) {
          setNotifications(response.data.data);
        } else {
          setNotifications(prev => [...prev, ...response.data.data]);
        }
        setHasMore(pageNum < response.data.pagination.pages);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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
        return <FaExclamationCircle className="w-6 h-6 text-orange-600" />;
      case 'special_offer':
        return <FaGift className="w-6 h-6 text-green-600" />;
      default:
        return <FaBell className="w-6 h-6 text-blue-600" />;
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      return diffInHours === 0 ? 'Just now' : `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-200 transition-all duration-200 cursor-pointer overflow-hidden group ${
                clickedNotificationId === notification._id ? 'opacity-75 cursor-not-allowed' : ''
              }`}
                             onClick={async () => {
                 // Prevent multiple clicks
                 if (clickedNotificationId === notification._id) return;
                 
                 setClickedNotificationId(notification._id);
                 
                 // Mark notification as read if it's unread
                 if (!notification.isRead) {
                   try {
                     await notificationApi.markAsRead(notification._id);
                     // Update the notification in the list to show as read
                     setNotifications(prev => 
                       prev.map(n => 
                         n._id === notification._id 
                           ? { ...n, isRead: true }
                           : n
                       )
                     );
                   } catch (error) {
                     console.error('Error marking notification as read:', error);
                   }
                 }
                 // Navigate to notification detail page
                 navigate(`/notifications/${notification._id}`);
               }}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {notification.title}
                      </h2>
                      <time className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1 text-gray-600">{notification.message}</p>
                    {notification.vendorId && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium text-gray-700">{notification.vendorId.name}</span>
                      </div>
                    )}
                    {notification.validUntil && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <FaCalendarAlt className="w-4 h-4" />
                        <span>Valid until {new Date(notification.validUntil).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-12">
            <FaBell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-gray-500">You're all caught up! Check back later for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
