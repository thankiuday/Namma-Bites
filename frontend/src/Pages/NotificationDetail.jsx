import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaBell, FaExclamationCircle, FaGift, FaCalendarAlt } from 'react-icons/fa';
import userApi from '../api/userApi';

const NotificationDetail = () => {
  const navigate = useNavigate();
  const { notificationId } = useParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOne = async () => {
      try {
        const res = await userApi.get(`/notifications/${notificationId}`);
        if (res.data?.success) {
          setNotification(res.data.data);
        } else {
          setError('Notification not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load notification');
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [notificationId]);

  const getIcon = (type) => {
    switch (type) {
      case 'subscription_alert':
        return <FaExclamationCircle className="w-10 h-10 text-orange-600" />;
      case 'special_offer':
        return <FaGift className="w-10 h-10 text-green-600" />;
      default:
        return <FaBell className="w-10 h-10 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="animate-pulse bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-64 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-orange-600">
            <FaArrowLeft /> Back
          </button>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-red-600">{error || 'Notification not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-orange-600">
          <FaArrowLeft /> Back
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{notification.title}</h1>
              <div className="text-gray-600 mb-4 leading-relaxed">{notification.message}</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                {notification.sender?.name && (
                  <div>
                    <span className="font-semibold text-gray-800">From:</span> {notification.sender.name}
                  </div>
                )}
                {notification.vendorId?.name && (
                  <div>
                    <span className="font-semibold text-gray-800">Vendor:</span> {notification.vendorId.name}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="w-4 h-4" />
                  <span>
                    <span className="font-semibold text-gray-800">Published:</span> {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                {notification.validUntil && (
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4" />
                    <span>
                      <span className="font-semibold text-gray-800">Valid until:</span> {new Date(notification.validUntil).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Optional CTA based on type */}
              {notification.type === 'special_offer' && (
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/')}
                    className="px-5 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    Explore Offers
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;


