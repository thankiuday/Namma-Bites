import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import notificationApi from '../../api/notificationApi';

const NotificationTypeCard = ({ type, selected, icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl p-4 transition-all duration-200 ${
      selected 
        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 shadow-md' 
        : 'bg-white border-2 border-gray-200 hover:border-blue-300'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${selected ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
        {icon}
      </div>
      <div>
        <h3 className={`font-semibold mb-1 ${selected ? 'text-blue-800' : 'text-gray-900'}`}>{title}</h3>
        <p className="text-sm text-gray-700">{description}</p>
      </div>
    </div>
  </div>
);

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, notificationData }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Animation Container */}
          <div className="relative bg-gradient-to-br from-green-400 to-green-600 p-8 text-center">
            {/* Animated Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 300 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeInOut" }}
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </motion.svg>
            </motion.div>

            {/* Success Text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-bold text-white mb-2"
            >
              Notification Sent!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-green-100 text-sm"
            >
              Your notification has been successfully delivered
            </motion.p>
          </div>

          {/* Notification Details */}
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notification Details</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Title:</span>
                    <p className="text-gray-900 font-semibold">{notificationData.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Type:</span>
                    <p className="text-gray-900 capitalize">
                      {notificationData.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Recipients:</span>
                    <p className="text-gray-900 capitalize">
                      {notificationData.recipients.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SendNotification = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'subscription_alert',
    recipients: 'subscribed_users',
    validUntil: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successNotificationData, setSuccessNotificationData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.title || formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }
    if (!formData.message || formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
    }
    if (!['subscription_alert', 'special_offer'].includes(formData.type)) {
      errs.type = 'Select a valid notification type.';
    }
    if (!['subscribed_users', 'all_users'].includes(formData.recipients)) {
      errs.recipients = 'Select a valid recipient group.';
    }
    // validUntil cannot be in the past
    if (formData.validUntil) {
      const ts = new Date(formData.validUntil).getTime();
      if (Number.isNaN(ts) || ts < Date.now()) {
        errs.validUntil = 'Valid until must be a future date/time.';
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      const response = await notificationApi.createNotification({
        ...formData,
        validUntil: formData.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
      });
      if (response.data.success) {
        // Store notification data for modal
        setSuccessNotificationData({
          title: formData.title,
          type: formData.type,
          recipients: formData.recipients
        });
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Reset form
        setFormData({
          title: '',
          message: '',
          type: 'subscription_alert',
          recipients: 'subscribed_users',
          validUntil: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessNotificationData({});
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-blue-100">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Notification Title
              <span className="text-blue-400 ml-1">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border-2 border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors duration-200 text-gray-900 placeholder-gray-500"
              required
              placeholder="e.g., Kitchen Closed Tomorrow"
            />
            {fieldErrors.title && <div className="mt-1 text-xs text-red-600">{fieldErrors.title}</div>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Message Content
              <span className="text-blue-400 ml-1">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 rounded-xl border-2 border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors duration-200 text-gray-900 placeholder-gray-500"
              required
              placeholder="e.g., Due to maintenance, we will not be serving meals tomorrow. We apologize for the inconvenience."
            />
            {fieldErrors.message && <div className="mt-1 text-xs text-red-600">{fieldErrors.message}</div>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-4">
                Notification Type
              </label>
              <div className="space-y-3">
                <NotificationTypeCard
                  type="subscription_alert"
                  selected={formData.type === 'subscription_alert'}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="Subscription Alert"
                  description="Important updates for subscribed users"
                  onClick={() => handleChange({ target: { name: 'type', value: 'subscription_alert' } })}
                />
                <NotificationTypeCard
                  type="special_offer"
                  selected={formData.type === 'special_offer'}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title="Special Offer"
                  description="Promotions and special announcements"
                  onClick={() => handleChange({ target: { name: 'type', value: 'special_offer' } })}
                />
                {fieldErrors.type && <div className="mt-1 text-xs text-red-600">{fieldErrors.type}</div>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-4">
                Recipients
              </label>
              <div className="space-y-3">
                <NotificationTypeCard
                  type="subscribed_users"
                  selected={formData.recipients === 'subscribed_users'}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                  title="Subscribed Users"
                  description="Only users with active subscriptions"
                  onClick={() => handleChange({ target: { name: 'recipients', value: 'subscribed_users' } })}
                />
                <NotificationTypeCard
                  type="all_users"
                  selected={formData.recipients === 'all_users'}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                  title="All Users"
                  description="Send to everyone on the platform"
                  onClick={() => handleChange({ target: { name: 'recipients', value: 'all_users' } })}
                />
                {fieldErrors.recipients && <div className="mt-1 text-xs text-red-600">{fieldErrors.recipients}</div>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Valid Until
            </label>
            <input
              type="datetime-local"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border-2 border-blue-100 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors duration-200 text-gray-900 placeholder-gray-500"
            />
            {fieldErrors.validUntil && <div className="mt-1 text-xs text-red-600">{fieldErrors.validUntil}</div>}
            <p className="mt-2 text-sm text-blue-600">
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Leave empty for default (7 days)
            </p>
          </div>

          {/* Quick timing helpers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'Today end', minutes: null, to: 'endOfDay' },
              { label: '+6h', minutes: 360 },
              { label: '+12h', minutes: 720 },
              { label: '+24h', minutes: 1440 },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  const now = new Date();
                  let dt;
                  if (opt.to === 'endOfDay') {
                    dt = new Date();
                    dt.setHours(23, 59, 0, 0);
                  } else {
                    dt = new Date(now.getTime() + opt.minutes * 60000);
                  }
                  const iso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                  setFormData(prev => ({ ...prev, validUntil: iso }));
                }}
                className="px-3 py-2 rounded-lg text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Notification
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={closeSuccessModal}
        notificationData={successNotificationData}
      />
    </>
  );
};

export default SendNotification;
