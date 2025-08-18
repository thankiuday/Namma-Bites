import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaBell, 
  FaExclamationCircle, 
  FaGift, 
  FaCalendarAlt, 
  FaClock,
  FaUser,
  FaStore,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaTag,
  FaEye,
  FaEyeSlash,
  FaShare,
  FaBookmark,
  FaBookmark as FaBookmarkSolid
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import notificationApi from '../api/notificationApi';

const NotificationDetail = () => {
  const navigate = useNavigate();
  const { notificationId } = useParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await notificationApi.getNotificationById(notificationId);
        if (res.data?.success) {
          setNotification(res.data.data);
          // Check if notification is bookmarked (you can implement this with localStorage)
          const bookmarks = JSON.parse(localStorage.getItem('notificationBookmarks') || '[]');
          setIsBookmarked(bookmarks.includes(notificationId));
          
          // Mark notification as read if it's unread
          if (!res.data.data.isRead) {
            try {
              await notificationApi.markAsRead(notificationId);
            } catch (error) {
              console.error('Error marking notification as read:', error);
            }
          }
        } else {
          setError('Notification not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load notification');
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [notificationId]);

  const getNotificationIcon = (type) => {
    const iconConfig = {
      subscription_alert: {
        icon: FaExclamationCircle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      special_offer: {
        icon: FaGift,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      order_update: {
        icon: FaBell,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      system: {
        icon: FaInfoCircle,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      }
    };

    const config = iconConfig[type] || iconConfig.system;
    const IconComponent = config.icon;

    return {
      component: <IconComponent className={`w-8 h-8 ${config.color}`} />,
      ...config
    };
  };

  const getNotificationBadge = (type) => {
    const badgeConfig = {
      subscription_alert: {
        label: 'Subscription Alert',
        color: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      special_offer: {
        label: 'Special Offer',
        color: 'bg-green-100 text-green-800 border-green-200'
      },
      order_update: {
        label: 'Order Update',
        color: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      system: {
        label: 'System Message',
        color: 'bg-purple-100 text-purple-800 border-purple-200'
      }
    };

    return badgeConfig[type] || badgeConfig.system;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('notificationBookmarks') || '[]');
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(id => id !== notificationId);
      localStorage.setItem('notificationBookmarks', JSON.stringify(newBookmarks));
    } else {
      bookmarks.push(notificationId);
      localStorage.setItem('notificationBookmarks', JSON.stringify(bookmarks));
    }
    setIsBookmarked(!isBookmarked);
  };

  const shareNotification = () => {
    if (navigator.share) {
      navigator.share({
        title: notification.title,
        text: notification.message,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${notification.title}\n\n${notification.message}\n\n${window.location.href}`);
      // You can add a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              <div className="animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-64 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-48 bg-gray-200 rounded" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-4 sm:p-6 text-center">
              <FaTimesCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Notification Not Found</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{error || 'The notification you are looking for does not exist or has expired.'}</p>
              <button
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm sm:text-base"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const iconConfig = getNotificationIcon(notification.type);
  const badgeConfig = getNotificationBadge(notification.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors duration-200 mb-3 sm:mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm sm:text-base">Back to Notifications</span>
          </button>
        </motion.div>

        {/* Main Notification Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {/* Header Section */}
          <div className={`p-4 sm:p-6 ${iconConfig.bgColor} border-b ${iconConfig.borderColor}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-full ${iconConfig.bgColor} border ${iconConfig.borderColor} flex-shrink-0`}>
                  {iconConfig.component}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900 break-words">{notification.title}</h1>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${badgeConfig.color} self-start sm:self-auto`}>
                      {badgeConfig.label}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatDate(notification.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatTime(notification.createdAt)}</span>
                    </div>
                    {notification.isRead && (
                      <div className="flex items-center gap-1 text-green-600">
                        <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Read</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isBookmarked 
                      ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' 
                      : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                  title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                >
                  {isBookmarked ? <FaBookmarkSolid className="w-4 h-4 sm:w-5 sm:h-5" /> : <FaBookmark className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
                <button
                  onClick={shareNotification}
                  className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  title="Share notification"
                >
                  <FaShare className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-6">
            {/* Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 sm:mb-6"
            >
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Message</h2>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {notification.message}
                </p>
              </div>
            </motion.div>

            {/* Details Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6"
            >
              {/* Sender Information */}
              {notification.sender && (
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800 text-sm sm:text-base">From</h3>
                  </div>
                  <p className="text-blue-700 text-sm sm:text-base">{notification.sender.name}</p>
                </div>
              )}

              {/* Vendor Information */}
              {notification.vendorId && (
                <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <FaStore className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <h3 className="font-semibold text-green-800 text-sm sm:text-base">Vendor</h3>
                  </div>
                  <p className="text-green-700 text-sm sm:text-base">{notification.vendorId.name}</p>
                </div>
              )}

              {/* Validity Period */}
              <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800 text-sm sm:text-base">Valid From</h3>
                </div>
                <p className="text-purple-700 text-sm sm:text-base">
                  {formatDate(notification.validFrom)} at {formatTime(notification.validFrom)}
                </p>
              </div>

              {/* Expiry Date */}
              {notification.validUntil && (
                <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-200">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    <h3 className="font-semibold text-orange-800 text-sm sm:text-base">Valid Until</h3>
                  </div>
                  <p className="text-orange-700 text-sm sm:text-base">
                    {formatDate(notification.validUntil)} at {formatTime(notification.validUntil)}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200"
            >
              <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <FaInfoCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-gray-600 capitalize">{notification.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Recipients:</span>
                  <span className="ml-2 text-gray-600 capitalize">{notification.recipients.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-gray-600">
                    {notification.isActive ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <FaTimesCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Inactive
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">
                    {formatDate(notification.createdAt)} at {formatTime(notification.createdAt)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap gap-3"
            >
              {notification.type === 'special_offer' && (
                <button
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FaGift className="w-3 h-3 sm:w-4 sm:h-4" />
                  Explore Offers
                </button>
              )}
              
              {notification.type === 'subscription_alert' && notification.vendorId && (
                <button
                  onClick={() => navigate(`/vendor-details/${notification.vendorId._id}`)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FaStore className="w-3 h-3 sm:w-4 sm:h-4" />
                  View Vendor
                </button>
              )}

              <button
                onClick={() => navigate('/notifications')}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaBell className="w-3 h-3 sm:w-4 sm:h-4" />
                All Notifications
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationDetail;


