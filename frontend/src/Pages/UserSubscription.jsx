import React, { useEffect, useState } from 'react';
import { getAllSubscriptionPlans, getSubscriptionPlanById, getUserSubscriptions, getUserSubscriptionQr, cancelUserSubscription } from '../api/userApi';
import { 
  FaArrowLeft ,
  FaStar, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaUtensils, 
  FaLeaf, 
  FaDrumstickBite, 
  FaClock, 
  FaMoneyBillWave,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaFilter,
  FaQrcode,
  FaFileImage,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';
// DatePicker removed to avoid peer dep conflict with React 19 in production

// API URLs
const BACKEND_API_URL = import.meta.env.VITE_API_URL || '/api';

// Import image utilities
import { getVendorImageUrl, getPaymentProofImageUrl } from '../utils/imageUtils';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
// Meal timings displayed under headers
const defaultMealTimings = {
  breakfast: '8:00–10:00 AM',
  lunch: '11:00 AM–3:00 PM',
  snacks: '4:00–6:00 PM',
  dinner: '7:00–10:00 PM',
};

// Add this helper to get YYYY-MM-DD for a given day name in the current week
function getDateForDay(day) {
  const today = new Date();
  const currentDay = today.getDay(); // 0 (Sun) - 6 (Sat)
  const targetDay = days.indexOf(day) + 1; // 1 (Mon) - 7 (Sun)
  const diff = targetDay - (currentDay === 0 ? 7 : currentDay);
  const date = new Date(today);
  date.setDate(today.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

const UserSubscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const navigate = useNavigate();

  // User's approved subscriptions state
  const [userSubs, setUserSubs] = useState([]);
  const [loadingUserSubs, setLoadingUserSubs] = useState(true);
  const [selectedUserSub, setSelectedUserSub] = useState(null);
  const [showUserSubDetails, setShowUserSubDetails] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);

  // Add state for calendar and selected date
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [prebookLoading, setPrebookLoading] = useState(false);
  const [prebookError, setPrebookError] = useState('');

  // Add state for cancellation functionality
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    fetchPlans();
    fetchUserSubs();
  }, []);

  // Refetch user subscriptions when the user closes the details modal (after pre-booking)
  useEffect(() => {
    if (!showUserSubDetails) {
      fetchUserSubs();
    }
  }, [showUserSubDetails]);

  useEffect(() => {
    // Fetch QR code data when modal opens for an active subscription
    if (showUserSubDetails && selectedUserSub && selectedUserSub.paymentStatus !== 'expired') {
      fetchQr(selectedUserSub._id);
    } else {
      setQrData(null);
    }
  }, [showUserSubDetails, selectedUserSub]);

  const fetchQr = async (subId) => {
    try {
      setLoadingQr(true);
      const response = await getUserSubscriptionQr(subId);
      setQrData(response.data.qrData);
    } catch (err) {
      setQrData(null);
    } finally {
      setLoadingQr(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getAllSubscriptionPlans();
      console.log('Subscription plans response:', response.data);
      console.log('Plans data:', response.data.data);
      setPlans(response.data.data || []);
    } catch (err) {
      setError('Failed to load subscription plans');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubs = async () => {
    try {
      setLoadingUserSubs(true);
      const response = await getUserSubscriptions();
      // Show all subscriptions (approved and expired)
      setUserSubs(response.data.data || []);
    } catch (err) {
      // Optionally set error
    } finally {
      setLoadingUserSubs(false);
    }
  };

  const handleViewDetails = async (planId) => {
    try {
      const response = await getSubscriptionPlanById(planId);
      setSelectedPlan(response.data.data);
      setShowPlanDetails(true);
    } catch (err) {
      setError('Failed to load plan details');
      console.error('Error fetching plan details:', err);
    }
  };

  const filteredPlans = plans.filter(plan => {
    console.log('Filtering plan:', {
      planId: plan._id,
      planType: plan.planType,
      duration: plan.duration,
      filterType: filterType,
      filterDuration: filterDuration
    });
    
    const typeMatch = filterType === 'all' || plan.planType === filterType;
    const durationMatch = filterDuration === 'all' || plan.duration === parseInt(filterDuration);
    
    console.log('Filter results:', {
      typeMatch,
      durationMatch,
      finalResult: typeMatch && durationMatch
    });
    
    return typeMatch && durationMatch;
  });

  console.log('Filtering summary:', {
    totalPlans: plans.length,
    filteredPlans: filteredPlans.length,
    filterType,
    filterDuration
  });

  const closePlanDetails = () => {
    setShowPlanDetails(false);
    setSelectedPlan(null);
  };

  // Helper to get YYYY-MM-DD from Date
  function formatDate(date) {
    return date.toISOString().slice(0, 10);
  }

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      setCancelError('');
      
      await cancelUserSubscription(subscriptionToCancel._id, cancellationReason);
      
      // Refresh user subscriptions
      await fetchUserSubs();
      
      // Close modal and reset state
      setShowCancelModal(false);
      setSubscriptionToCancel(null);
      setCancellationReason('');
      
      // Close subscription details modal if it's open for the cancelled subscription
      if (selectedUserSub && selectedUserSub._id === subscriptionToCancel._id) {
        setShowUserSubDetails(false);
        setSelectedUserSub(null);
      }
    } catch (error) {
      setCancelError(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  // Open cancellation modal
  const openCancelModal = (subscription) => {
    setSubscriptionToCancel(subscription);
    setShowCancelModal(true);
    setCancelError('');
    setCancellationReason('');
  };

  // Close cancellation modal
  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSubscriptionToCancel(null);
    setCancellationReason('');
    setCancelError('');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-orange-50 to-white min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
            <p className="text-orange-700 font-semibold">Loading subscription plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-orange-50 to-white min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 px-4 py-2 bg-white text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200 shadow-sm border border-orange-200"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back
      </button>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <FaUtensils className="text-5xl text-orange-600" />
        </div>
        <h1 className="text-4xl font-bold text-orange-800 mb-4 drop-shadow-sm">Available Subscription Plans</h1>
        <p className="text-lg text-orange-700 font-medium">Browse and choose from our curated meal subscription plans</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-orange-100">
        <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
          <FaFilter className="mr-2" />
          Filter Plans
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-orange-700 mb-2 flex items-center">
              <FaLeaf className="mr-1" />
              Plan Type
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                console.log('Filter type changed to:', e.target.value);
                setFilterType(e.target.value);
              }}
              className="w-full border-2 border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 bg-white text-gray-800 font-medium"
            >
              <option value="all">🌱 All Types</option>
              <option value="veg">🥬 Vegetarian</option>
              <option value="non-veg">🍗 Non-Vegetarian</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-orange-700 mb-2 flex items-center">
              <FaClock className="mr-1" />
              Duration
            </label>
            <select
              value={filterDuration}
              onChange={(e) => {
                console.log('Filter duration changed to:', e.target.value);
                setFilterDuration(e.target.value);
              }}
              className="w-full border-2 border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 bg-white text-gray-800 font-medium"
            >
              <option value="all">⏰ All Durations</option>
              <option value="7">📅 7 Days</option>
              <option value="15">📅 15 Days</option>
              <option value="30">📅 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6 flex items-center">
          <FaTimes className="text-red-600 mr-3 text-xl" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {filteredPlans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-orange-100">
          <FaUtensils className="mx-auto h-16 w-16 text-orange-300 mb-6" />
          <h3 className="text-xl font-bold text-orange-800 mb-3">No subscription plans found</h3>
          <p className="text-orange-600 font-medium">Try adjusting your filters or check back later for new plans.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            console.log('Plan vendor data:', plan.vendor);
            return (
              <div key={plan._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200 max-w-md sm:max-w-lg w-full mx-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getVendorImageUrl(plan.vendor?.image)}
                        alt={plan.vendor?.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                        onError={(e) => {
                          console.log('Image failed to load, using fallback');
                          e.target.src = '/logo.png';
                        }}
                      />
                    <div>
                      <h3 className="font-bold text-orange-800 text-lg">{plan.vendor?.name}</h3>
                      <div className="flex items-center text-sm text-orange-600 font-medium">
                        <FaMapMarkerAlt className="mr-2 text-orange-500" />
                        {plan.vendor?.location || 'Location not specified'}
                      </div>
                    </div>
                  </div>
                  {/* <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${
                    plan.planType === 'veg' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {plan.planType === 'veg' ? (
                      <>
                        <FaLeaf className="mr-1" />
                        Vegetarian
                      </>
                    ) : (
                      <>
                        <FaDrumstickBite className="mr-1" />
                        Non-Veg
                      </>
                    )}
                  </span> */}
                </div>

                <div className="space-y-4 bg-orange-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700 font-semibold flex items-center">
                      <FaClock className="mr-2" />
                      Duration:
                    </span>
                    <span className="font-bold text-orange-800">{plan.duration} days</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm text-orange-700 font-semibold flex items-center">
                      <FaLeaf className="mr-2" />
                      Subscription Type:
                    </span>
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center shrink-0 ${
                      plan.planType === 'veg' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {plan.planType === 'veg' ? (
                        <>
                          <FaLeaf className="mr-1" />
                          Vegetarian
                        </>
                      ) : (
                        <>
                          <FaDrumstickBite className="mr-1" />
                          Non-Veg
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700 font-semibold">Price per day:</span>
                    <span className="font-bold text-orange-800">₹{(plan.price / plan.duration).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(plan._id)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-bold flex items-center justify-center"
                >
                  <FaEye className="mr-2" />
                  View Details
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* User's Approved Subscriptions Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-orange-800 mb-6 flex items-center">
          <FaCheckCircle className="mr-2 text-orange-600" />
          Your Subscriptions
        </h2>
        {loadingUserSubs ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-600"></div>
          </div>
        ) : userSubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 bg-white rounded-xl shadow-lg border border-orange-100">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
              <rect x="10" y="40" width="80" height="40" rx="12" fill="#FFEDD5" />
              <rect x="25" y="55" width="50" height="15" rx="7" fill="#FDBA74" />
              <rect x="40" y="70" width="20" height="5" rx="2.5" fill="#F59E42" />
              <circle cx="50" cy="50" r="8" fill="#FDBA74" />
              <ellipse cx="50" cy="90" rx="25" ry="4" fill="#FDE68A" />
            </svg>
            <h3 className="text-lg font-bold text-orange-800 mb-2">No active subscriptions</h3>
            <p className="text-orange-600 font-medium mb-1">You have not subscribed to any plans yet.</p>
            <p className="text-gray-400 text-sm">Browse our plans above and start your first subscription!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSubs
              .filter(sub => (sub.paymentStatus === 'approved' || sub.paymentStatus === 'cancelled') && sub.validated)
              .map((sub) => {
              const plan = sub.subscriptionPlan;
              const vendor = plan?.vendor || sub.vendor;
              const isExpired = sub.paymentStatus === 'expired';
              const isCancelled = sub.paymentStatus === 'cancelled';
              return (
                <div
                  key={sub._id}
                  className={`rounded-xl overflow-hidden border transition-all duration-300 max-w-sm sm:max-w-md w-full mx-auto \
                    ${isExpired
                      ? 'bg-gray-100 border-gray-300 opacity-60 grayscale pointer-events-none'
                      : isCancelled
                      ? 'bg-red-50 border-red-200 opacity-80'
                      : 'bg-white shadow-lg border-orange-100 hover:shadow-xl hover:border-orange-200'}
                  `}
                  style={isExpired ? { filter: 'grayscale(0.5)', pointerEvents: 'none' } : {}}
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={getVendorImageUrl(vendor?.image)}
                        alt={vendor?.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                      />
                      <div>
                        <h3 className="font-bold text-orange-800 text-lg">{vendor?.name}</h3>
                        <div className="flex items-center text-sm text-orange-600 font-medium">
                          <FaMapMarkerAlt className="mr-2 text-orange-500" />
                          {vendor?.location || 'Location not specified'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-orange-700 flex items-center">
                        <FaClock className="mr-1" /> {plan?.duration} days
                      </span>
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center shrink-0 ${
                        plan?.planType === 'veg'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {plan?.planType === 'veg' ? <FaLeaf className="mr-1" /> : <FaDrumstickBite className="mr-1" />}
                        {plan?.planType === 'veg' ? 'Vegetarian' : 'Non-Veg'}
                      </span>
                    </div>
                    {/* Start Date */}
                    <div className="flex items-center mb-2 text-sm text-orange-700 font-semibold">
                      <FaCalendarAlt className="mr-2 text-orange-500" />
                      Start Date: {sub.startDate ? format(new Date(sub.startDate), 'dd MMM yyyy') : 'N/A'}
                    </div>
                    {/* End Date */}
                    <div className="flex items-center mb-2 text-sm text-orange-700 font-semibold">
                      <FaCalendarAlt className="mr-2 text-orange-500" />
                      End Date: {sub.startDate ? format(new Date(new Date(sub.startDate).setDate(new Date(sub.startDate).getDate() + (sub.duration ? sub.duration - 1 : 0))), 'dd MMM yyyy') : 'N/A'}
                    </div>
                    <div className="mb-2 text-xs text-orange-600 font-medium bg-orange-50 rounded px-2 py-1">
                      Your subscription is valid from {sub.startDate ? format(new Date(sub.startDate), 'dd MMM yyyy') : 'N/A'} to {sub.startDate ? format(new Date(new Date(sub.startDate).setDate(new Date(sub.startDate).getDate() + (sub.duration ? sub.duration - 1 : 0))), 'dd MMM yyyy') : 'N/A'} (inclusive).<br />You can avail meals on all these days.
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-orange-700 font-semibold">Status:</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isExpired ? 'text-gray-500' : isCancelled ? 'text-red-600' : 'text-orange-800'}`}>
                          {sub.paymentStatus}
                        </span>
                        {isExpired && (
                          <span className="px-2 py-1 rounded-full bg-gray-300 text-gray-700 text-xs font-bold flex items-center">
                            <FaTimes className="mr-1" /> Expired
                          </span>
                        )}
                        {isCancelled && (
                          <span className="px-2 py-1 rounded-full bg-red-200 text-red-800 text-xs font-bold flex items-center">
                            <FaTimesCircle className="mr-1" /> Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Meal Timings */}
                    <div className="mt-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="text-orange-800 font-bold mb-2 flex items-center">
                        <FaClock className="mr-2" /> Meal Timings (Everyday)
                      </div>
                      <ul className="text-orange-700 text-sm grid grid-cols-2 gap-2">
                        <li><span className="font-semibold">Breakfast:</span> 8:00–10:00 AM</li>
                        <li><span className="font-semibold">Lunch:</span> 11:00 AM–3:00 PM</li>
                        <li><span className="font-semibold">Snacks:</span> 4:00–6:00 PM</li>
                        <li><span className="font-semibold">Dinner:</span> 7:00–10:00 PM</li>
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedUserSub(sub); setShowUserSubDetails(true); }}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold flex items-center justify-center transition-all duration-200 \
                          ${isExpired || isCancelled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'}
                        `}
                        disabled={isExpired || isCancelled}
                      >
                        <FaEye className="mr-2" />
                        View Details
                      </button>
                      {!isExpired && !isCancelled && (
                        <button
                          onClick={() => openCancelModal(sub)}
                          className="py-2 px-4 rounded-lg font-bold flex items-center justify-center transition-all duration-200 bg-red-500 text-white hover:bg-red-600"
                        >
                          <FaTimesCircle className="mr-2" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan Details Modal */}
      {showPlanDetails && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl border border-orange-100">
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-8 gap-4">
                <div className="w-full">
                  <h2 className="text-2xl sm:text-3xl font-bold text-orange-800 mb-2 sm:mb-3 flex items-center flex-wrap">
                    <FaUtensils className="mr-2 sm:mr-3 text-orange-600 text-xl sm:text-2xl" />
                    {selectedPlan.vendor?.name} - Subscription Plan
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 sm:space-x-6 text-xs sm:text-sm text-orange-700 font-medium">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-1 sm:mr-2 text-orange-500" />
                      {selectedPlan.vendor?.location}
                    </div>
                    {selectedPlan.vendor?.phone && (
                      <div className="flex items-center">
                        <FaPhone className="mr-1 sm:mr-2 text-orange-500" />
                        {selectedPlan.vendor.phone}
                      </div>
                    )}
                    {selectedPlan.vendor?.email && (
                      <div className="flex items-center">
                        <FaEnvelope className="mr-1 sm:mr-2 text-orange-500" />
                        {selectedPlan.vendor.email}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={closePlanDetails}
                  className="text-orange-400 hover:text-orange-600 text-2xl sm:text-3xl font-bold p-2 hover:bg-orange-50 rounded-full transition-colors duration-200 self-end"
                  aria-label="Close details modal"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 sm:p-6 border border-orange-200">
                  <h3 className="font-bold text-orange-800 mb-3 sm:mb-4 flex items-center text-base sm:text-lg">
                    <FaCheckCircle className="mr-2 text-orange-600" />
                    Plan Information
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-orange-700 font-semibold flex items-center">
                        <FaClock className="mr-1 sm:mr-2" />
                        Duration:
                      </span>
                      <span className="font-bold text-orange-800">{selectedPlan.duration} days</span>
                    </div>
                   <div className="flex items-center justify-between gap-2 flex-wrap text-xs sm:text-sm">
                      <span className="text-orange-700 font-semibold flex items-center">
                        <FaLeaf className="mr-1 sm:mr-2" />
                        Subscription Type:
                      </span>
                     <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center shrink-0 ${
                        selectedPlan.planType === 'veg' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {selectedPlan.planType === 'veg' ? (
                          <>
                            <FaLeaf className="mr-1" />
                            Vegetarian
                          </>
                        ) : (
                          <>
                            <FaDrumstickBite className="mr-1" />
                            Non-Vegetarian
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-orange-700 font-semibold flex items-center">
                        <FaMoneyBillWave className="mr-1 sm:mr-2" />
                        Total Price:
                      </span>
                      <span className="text-lg sm:text-2xl font-bold text-orange-600">₹{selectedPlan.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-orange-700 font-semibold">Price per day:</span>
                      <span className="font-bold text-orange-800">₹{(selectedPlan.price / selectedPlan.duration).toFixed(2)}</span>
                    </div>
                    <div className="mt-3 bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="text-orange-800 font-bold mb-2 flex items-center">
                        <FaClock className="mr-2" /> Meal Timings (Everyday)
                      </div>
                      <ul className="text-orange-700 text-xs sm:text-sm grid grid-cols-2 gap-2">
                        <li><span className="font-semibold">Breakfast:</span> 8:00–10:00 AM</li>
                        <li><span className="font-semibold">Lunch:</span> 11:00 AM–3:00 PM</li>
                        <li><span className="font-semibold">Snacks:</span> 4:00–6:00 PM</li>
                        <li><span className="font-semibold">Dinner:</span> 7:00–10:00 PM</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-3 sm:mb-4 flex items-center text-base sm:text-lg">
                    <FaMapMarkerAlt className="mr-2 text-blue-600" />
                    Vendor Information
                  </h3>
                  <div className="flex items-center gap-2 sm:space-x-4 mb-3 sm:mb-4">
                    <img
                      src={getVendorImageUrl(selectedPlan.vendor?.image)}
                      alt={selectedPlan.vendor?.name}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-2 sm:border-4 border-blue-200"
                      onError={(e) => {
                        e.target.src = '/logo.png';
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-blue-800 text-base sm:text-lg">{selectedPlan.vendor?.name}</h4>
                      <p className="text-blue-700 font-medium text-xs sm:text-sm">{selectedPlan.vendor?.location}</p>
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    {selectedPlan.vendor?.phone && (
                      <div className="flex items-center text-blue-700 font-medium">
                        <FaPhone className="mr-2 sm:mr-3 text-blue-500" />
                        {selectedPlan.vendor.phone}
                      </div>
                    )}
                    {selectedPlan.vendor?.email && (
                      <div className="flex items-center text-blue-700 font-medium">
                        <FaEnvelope className="mr-2 sm:mr-3 text-blue-500" />
                        {selectedPlan.vendor.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <h3 className="font-bold text-orange-800 mb-4 sm:mb-6 flex items-center text-base sm:text-lg">
                  <FaCalendarAlt className="mr-2 text-orange-600" />
                  Weekly Meal Schedule
                </h3>
                <div className="overflow-x-auto rounded-xl border-2 border-orange-200">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                      <tr>
                        <th className="px-2 sm:px-6 py-2 sm:py-4 text-left font-bold text-white whitespace-nowrap">📅 Day</th>
                        {mealTypes.map(meal => (
                          <th key={meal} className="px-2 sm:px-6 py-2 sm:py-4 text-left font-bold text-white capitalize whitespace-nowrap">
                            <div className="flex flex-col">
                              <span>
                                {meal === 'breakfast' ? '🌅 Breakfast' : 
                                 meal === 'lunch' ? '🌞 Lunch' : 
                                 meal === 'dinner' ? '🌙 Dinner' : '🍎 Snacks'}
                              </span>
                              <span className="text-[10px] sm:text-xs font-medium opacity-90">{(selectedPlan?.mealTimings && selectedPlan.mealTimings[meal]) || defaultMealTimings[meal]}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day, index) => (
                        <tr key={day} className={`hover:bg-orange-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}`}> 
                          <td className="border-b border-orange-200 px-2 sm:px-6 py-2 sm:py-4 font-bold text-orange-800 bg-orange-100 whitespace-nowrap">{day}</td>
                          {mealTypes.map(meal => {
                            const mealItem = selectedPlan.weekMeals[day][meal];
                            return (
                              <td key={meal} className="border-b border-orange-200 px-2 sm:px-6 py-2 sm:py-4">
                                {mealItem ? (
                                  <div className="bg-white rounded-lg p-2 sm:p-3 border border-orange-200">
                                    <div className="font-bold text-gray-800 mb-1">{mealItem.name}</div>
                                    <div className="text-orange-600 font-semibold">₹{mealItem.price}</div>
                                  </div>
                                ) : (
                                  <span className="text-orange-400 font-medium">Not specified</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4">
                <button
                  onClick={closePlanDetails}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 border-2 border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-all duration-200 font-bold flex items-center justify-center"
                >
                  <FaTimes className="mr-2" />
                  Close
                </button>
                <button
                  onClick={() => {
                    navigate(`/subscription/start/${selectedPlan._id}`);
                  }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-bold flex items-center justify-center shadow-lg"
                >
                  <FaCheckCircle className="mr-2" />
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Subscription Details Modal */}
      {showUserSubDetails && selectedUserSub && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl border border-orange-100">
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-8 gap-4">
                <div className="w-full">
                  <h2 className="text-2xl sm:text-3xl font-bold text-orange-800 mb-2 sm:mb-3 flex items-center flex-wrap">
                    <FaCalendarAlt className="mr-2 sm:mr-3 text-orange-600 text-xl sm:text-2xl" />
                    {selectedUserSub.subscriptionPlan?.vendor?.name || selectedUserSub.vendor?.name} - Your Subscription
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 sm:space-x-6 text-xs sm:text-sm text-orange-700 font-medium">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-1 sm:mr-2 text-orange-500" />
                      {selectedUserSub.subscriptionPlan?.vendor?.location || selectedUserSub.vendor?.location}
                    </div>
                    {/* Start Date */}
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1 sm:mr-2 text-orange-500" />
                      Start Date: {selectedUserSub.startDate ? format(new Date(selectedUserSub.startDate), 'dd MMM yyyy') : 'N/A'}
                    </div>
                    {/* End Date */}
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1 sm:mr-2 text-orange-500" />
                      End Date: {selectedUserSub.startDate ? format(new Date(new Date(selectedUserSub.startDate).setDate(new Date(selectedUserSub.startDate).getDate() + (selectedUserSub.duration ? selectedUserSub.duration - 1 : 0))), 'dd MMM yyyy') : 'N/A'}
                    </div>
                    <div className="mb-2 text-xs text-orange-600 font-medium bg-orange-50 rounded px-2 py-1">
                      Your subscription is valid from {selectedUserSub.startDate ? format(new Date(selectedUserSub.startDate), 'dd MMM yyyy') : 'N/A'} to {selectedUserSub.startDate ? format(new Date(new Date(selectedUserSub.startDate).setDate(new Date(selectedUserSub.startDate).getDate() + (selectedUserSub.duration ? selectedUserSub.duration - 1 : 0))), 'dd MMM yyyy') : 'N/A'} (inclusive).<br />You can avail meals on all these days.
                    </div>
                    {selectedUserSub.subscriptionPlan?.vendor?.phone && (
                      <div className="flex items-center">
                        <FaPhone className="mr-1 sm:mr-2 text-orange-500" />
                        {selectedUserSub.subscriptionPlan.vendor.phone}
                      </div>
                    )}
                    {selectedUserSub.subscriptionPlan?.vendor?.email && (
                      <div className="flex items-center">
                        <FaEnvelope className="mr-1 sm:mr-2 text-orange-500" />
                        {selectedUserSub.subscriptionPlan.vendor.email}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setShowUserSubDetails(false); setSelectedUserSub(null); }}
                  className="text-orange-400 hover:text-orange-600 text-2xl sm:text-3xl font-bold p-2 hover:bg-orange-50 rounded-full transition-colors duration-200 self-end"
                  aria-label="Close details modal"
                >
                  <FaTimes />
                </button>
              </div>
              {/* Plan info, status, and day-wise schedule */}
              <div className="mb-6 sm:mb-8">
                <h3 className="font-bold text-orange-800 mb-4 sm:mb-6 flex items-center text-base sm:text-lg">
                  <FaCalendarAlt className="mr-2 text-orange-600" />
                  Your Weekly Meal Schedule
                </h3>
                <div className="overflow-x-auto rounded-xl border-2 border-orange-200">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                      <tr>
                        <th className="px-2 sm:px-6 py-2 sm:py-4 text-left font-bold text-white whitespace-nowrap">📅 Day</th>
                        {mealTypes.map(meal => (
                          <th key={meal} className="px-2 sm:px-6 py-2 sm:py-4 text-left font-bold text-white capitalize whitespace-nowrap">
                            <div className="flex flex-col">
                              <span>
                                {meal === 'breakfast' ? '🌅 Breakfast' : 
                                  meal === 'lunch' ? '🌞 Lunch' : 
                                  meal === 'dinner' ? '🌙 Dinner' : '🍎 Snacks'}
                              </span>
                              <span className="text-[10px] sm:text-xs font-medium opacity-90">{(selectedUserSub?.subscriptionPlan?.mealTimings && selectedUserSub.subscriptionPlan.mealTimings[meal]) || defaultMealTimings[meal]}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day, index) => (
                        <tr key={day} className={`hover:bg-orange-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}`}> 
                          <td className="border-b border-orange-200 px-2 sm:px-6 py-2 sm:py-4 font-bold text-orange-800 bg-orange-100 whitespace-nowrap">{day}</td>
                          {mealTypes.map(meal => {
                            const mealItem = selectedUserSub.subscriptionPlan?.weekMeals?.[day]?.[meal];
                            return (
                              <td key={meal} className="border-b border-orange-200 px-2 sm:px-6 py-2 sm:py-4">
                                {mealItem ? (
                                  <div className="bg-white rounded-lg p-2 sm:p-3 border border-orange-200">
                                    <div className="font-bold text-gray-800 mb-1">{mealItem.name}</div>
                                    <div className="text-orange-600 font-semibold">₹{mealItem.price}</div>
                                  </div>
                                ) : (
                                  <span className="text-orange-400 font-medium">Not specified</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Meal Timings Info */}
                <div className="mt-4 bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="text-orange-800 font-bold mb-2 flex items-center">
                    <FaClock className="mr-2" /> Meal Timings (Everyday)
                  </div>
                  <div className="text-orange-700 text-xs sm:text-sm grid grid-cols-2 gap-2">
                    <div><span className="font-semibold">Breakfast:</span> 8:00–10:00 AM</div>
                    <div><span className="font-semibold">Lunch:</span> 11:00 AM–3:00 PM</div>
                    <div><span className="font-semibold">Snacks:</span> 4:00–6:00 PM</div>
                    <div><span className="font-semibold">Dinner:</span> 7:00–10:00 PM</div>
                  </div>
                </div>
              </div>
              {/* Payment Proof and Scanner Section */}
              <div className="mb-6 sm:mb-8 flex flex-col md:flex-row gap-4 items-center md:items-start">
                {/* Payment Proof */}
                {selectedUserSub.paymentProof && (
                  <div className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-orange-800 mb-2 flex items-center text-base">
                      <FaFileImage className="mr-2 text-orange-600" /> Payment Proof
                    </h3>
                    <img
                      src={getPaymentProofImageUrl(selectedUserSub.paymentProof)}
                      alt="Payment Proof"
                      className="w-40 h-40 object-contain rounded-lg border border-orange-200 mb-2 mx-auto"
                      style={{ background: '#fff' }}
                    />
                    <button
                      className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-bold flex items-center hover:bg-orange-600"
                      onClick={() => window.open(getPaymentProofImageUrl(selectedUserSub.paymentProof), '_blank')}
                    >
                      <FaEye className="mr-2" /> View Full Image
                    </button>
                  </div>
                )}
                {/* QR Scanner */}
                {selectedUserSub.paymentStatus !== 'expired' && selectedUserSub.paymentStatus !== 'cancelled' && (
                  <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-blue-800 mb-2 flex items-center text-base">
                      <FaQrcode className="mr-2 text-blue-600" /> Subscription QR
                    </h3>
                    {loadingQr ? (
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mb-2"></div>
                    ) : qrData ? (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=180x180`}
                        alt="Subscription QR"
                        className="w-40 h-40 object-contain rounded-lg border border-blue-200 mb-2 mx-auto"
                        style={{ background: '#fff' }}
                      />
                    ) : (
                      <span className="text-blue-500 font-medium">QR not available</span>
                    )}
                  </div>
                )}
                {(selectedUserSub.paymentStatus === 'expired' || selectedUserSub.paymentStatus === 'cancelled') && (
                  <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 border border-gray-300 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-gray-700 mb-2 flex items-center text-base">
                      <FaQrcode className="mr-2 text-gray-500" /> Subscription QR
                    </h3>
                    <span className="text-gray-500 font-medium">
                      QR not available for {selectedUserSub.paymentStatus} subscriptions
                    </span>
                  </div>
                )}
              </div>
              {/* Pre-booking Calendar */}
              {selectedUserSub.paymentStatus === 'approved' && (
                <div className="mb-8">
                  <h3 className="font-bold text-orange-800 mb-3 flex items-center text-base">
                    Pre-Book Your Meals
                  </h3>
                  <div className="flex flex-col items-center w-full">
                    <div className="mt-6 w-full max-w-md mx-auto">
                      <h4 className="font-semibold text-orange-700 mb-2 text-center">Select meals for today</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {mealTypes.map(meal => {
                          const dateStr = formatDate(new Date());
                          const prebooked = selectedUserSub.prebookings?.find(pb => pb.date === dateStr && pb.mealType === meal && pb.status === 'booked');
                          const isExpired = selectedUserSub.paymentStatus === 'expired';
                          return (
                            <button
                              key={meal}
                              disabled={isExpired || prebookLoading}
                              className={`px-4 py-3 rounded-xl font-bold text-base transition-all duration-200 shadow text-center flex items-center justify-center gap-2 ${prebooked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'} ${isExpired ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-500 hover:text-white'} ${prebookLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                              onClick={async () => {
                                if (isExpired) return;
                                setPrebookLoading(true);
                                setPrebookError('');
                                try {
                                  const status = prebooked ? 'cancelled' : 'booked';
                                  const res = await axios.post(
                                    `${BACKEND_API_URL}/users/subscriptions/${selectedUserSub._id}/prebook`,
                                    { date: dateStr, mealType: meal, status },
                                    { withCredentials: true }
                                  );
                                  setSelectedUserSub(sub => ({
                                    ...sub,
                                    prebookings: res.data.data
                                  }));
                                } catch (err) {
                                  setPrebookError('Failed to update pre-booking.');
                                } finally {
                                  setPrebookLoading(false);
                                }
                              }}
                                                          >
                                {prebookLoading && <FaSpinner className="w-4 h-4 animate-spin" />}
                                {meal.charAt(0).toUpperCase() + meal.slice(1)}<br/>{prebooked ? 'Booked' : 'Not Booked'}
                              </button>
                          );
                        })}
                      </div>
                      {prebookError && <div className="text-red-600 text-center mt-2">{prebookError}</div>}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4">
                <button
                  onClick={() => { setShowUserSubDetails(false); setSelectedUserSub(null); }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 border-2 border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-all duration-200 font-bold flex items-center justify-center"
                >
                  <FaTimes className="mr-2" />
                  Close
                </button>
                {selectedUserSub.paymentStatus === 'approved' && (
                  <button
                    onClick={() => {
                      setShowUserSubDetails(false);
                      openCancelModal(selectedUserSub);
                    }}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-bold flex items-center justify-center"
                  >
                    <FaTimesCircle className="mr-2" />
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && subscriptionToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-red-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-600 text-2xl mr-3" />
                  <h2 className="text-xl font-bold text-red-800">Cancel Subscription</h2>
                </div>
                <button
                  onClick={closeCancelModal}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to cancel your subscription with{' '}
                  <span className="font-semibold text-orange-700">
                    {subscriptionToCancel.subscriptionPlan?.vendor?.name || subscriptionToCancel.vendor?.name}
                  </span>?
                </p>
                <p className="text-sm text-red-600 mb-4">
                  <FaExclamationTriangle className="inline mr-1" />
                  This action cannot be undone. You will lose access to all remaining meals in your subscription.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for cancellation (optional):
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-500 resize-none"
                    rows="3"
                    placeholder="Let us know why you're cancelling..."
                  />
                </div>
              </div>

              {cancelError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <FaTimesCircle className="text-red-600 mr-2" />
                  <span className="font-semibold">{cancelError}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-bold"
                  disabled={cancelLoading}
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-bold flex items-center justify-center"
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="mr-2" />
                      Cancel Subscription
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubscription; 