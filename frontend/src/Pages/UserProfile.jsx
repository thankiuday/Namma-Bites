import React, { useState, useEffect } from 'react';
import { FaArrowLeft,FaUser, FaShoppingCart, FaClipboardList, FaWallet, FaKey, FaHeadset, FaDownload, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userApi, { getUserSubscriptions, deleteUserSubscription } from '../api/userApi';
import ValidatedQrModal from '../components/ValidatedQrModal';
import { getGreeting } from '../utils/greetings';
// Joyride removed for production build

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsError, setSubsError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrSubId, setQrSubId] = useState(null);
  const [qrValidated, setQrValidated] = useState(false);
  const [paymentProofModalOpen, setPaymentProofModalOpen] = useState(false);
  const [paymentProofModalSrc, setPaymentProofModalSrc] = useState(null);
  // const [runTour, setRunTour] = useState(false);

  // Tour logic removed

  // const handleTourCallback = () => {};

  // const tourSteps = [];

  // Update editedUser when user data changes
  useEffect(() => {
    if (user) {
      setEditedUser(user);
    }
  }, [user]);

  useEffect(() => {
    const fetchSubs = async () => {
      setSubsLoading(true);
      setSubsError('');
      try {
        const res = await getUserSubscriptions();
        setSubscriptions(res.data.data);
      } catch (err) {
        setSubsError('Failed to load subscriptions.');
      } finally {
        setSubsLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const handleEdit = () => {
    setError('');
    setIsEditing(true);
  };

  const refreshToken = async () => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '/api') + '/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: localStorage.getItem('refreshToken')
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      let response = await userApi.put('/profile', editedUser);

      if (response.data && response.data.success) {
        setEditedUser(response.data.data);
        setIsEditing(false);
        checkAuth();
      } else {
        setError(response.data?.error || 'Failed to update profile');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to connect to the server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expired subscription?')) return;
    try {
      await deleteUserSubscription(id);
      setSubscriptions(subscriptions.filter(sub => sub._id !== id));
    } catch (err) {
      alert('Failed to delete subscription.');
    }
  };

  if (!user || subsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Profile Skeleton */}
        <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6">
            <div className="h-6 w-40 bg-orange-100 rounded mb-2" />
            <div className="h-8 w-32 bg-orange-200 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 w-24 bg-orange-100 rounded mb-2" />
                <div className="h-5 w-full bg-orange-200 rounded" />
              </div>
            ))}
          </div>
        </section>
        {/* Subscriptions Skeleton */}
        <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 animate-pulse">
          <div className="h-6 w-32 bg-orange-100 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 border border-orange-100 rounded-lg flex flex-col gap-2">
                <div className="h-4 w-1/2 bg-orange-200 rounded mb-2" />
                <div className="h-3 w-1/3 bg-orange-100 rounded mb-1" />
                <div className="h-3 w-1/4 bg-orange-100 rounded" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="profile-page-root">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 px-4 py-2 bg-white text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200 shadow-sm border border-orange-200"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back
      </button>
    {/* ... Joyride and other code remains the same ... */}


    {/* Personalized Greeting */}
    <div className="mb-6 animate-fade-in-down">
        <h2 className="text-2xl font-bold text-orange-700 text-center drop-shadow-sm">
            {getGreeting(user?.username || user?.name || 'User')}
        </h2>
    </div>

    {/* Profile Hub Section */}
    <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaUser className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" /> Profile Hub
            </h2>

            {/* --- DESKTOP BUTTON --- */}
            {/* This button is now hidden on mobile (`hidden`) and shown on screens small and larger (`sm:flex`). */}
            <div className="hidden sm:flex items-center">
                {!isEditing ? (
                    <button
                        onClick={handleEdit}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm sm:text-base"
                    >
                        <FaEdit className="w-4 h-4" /> Edit Profile
                    </button>
                ) : (
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md transition-colors flex items-center gap-2`}
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
                )}
            </div>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
            </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* ... Your original form fields for username, email, name, and mobile number ... */}
            <div> <label className="block text-sm font-medium text-gray-700">Username</label> {isEditing ? ( <input type="text" name="username" value={editedUser?.username || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md"/> ) : ( <p className="mt-1 text-gray-900">{user.username}</p> )} </div>
            <div> <label className="block text-sm font-medium text-gray-700">Email</label> {isEditing ? ( <input type="email" name="email" value={editedUser?.email || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300  text-black  rounded-md"/> ) : ( <p className="mt-1 text-gray-900">{user.email}</p> )} </div>
            <div> <label className="block text-sm font-medium text-gray-700">Full Name</label> {isEditing ? ( <input type="text" name="name" value={editedUser?.name || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300  text-black  rounded-md"/> ) : ( <p className="mt-1 text-gray-900">{user.name}</p> )} </div>
            <div> <label className="block text-sm font-medium text-gray-700">Mobile Number</label> {isEditing ? ( <input type="tel" name="mobileNumber" value={editedUser?.mobileNumber || ''} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300  text-black  rounded-md"/> ) : ( <p className="mt-1 text-gray-900">{user.mobileNumber}</p> )} </div>
        </div>
        
        {/* --- MOBILE BUTTON --- */}
        {/* This is a copy of the button that is ONLY visible on mobile screens (`sm:hidden`). */}
        <div className="mt-6 sm:hidden">
            {!isEditing ? (
                <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-base font-semibold"
                >
                    <FaEdit /> Edit Profile
                </button>
            ) : (
                 <div className="flex items-center gap-2">
                    {/* A Cancel button is added here for better mobile UX */}
                    <button onClick={() => setIsEditing(false)} className="w-full flex items-center justify-center py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-base font-semibold">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`w-full py-2.5 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md transition-colors text-base font-semibold`}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}
        </div>
    </section>
     {/* User Subscriptions Section */}
      <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaClipboardList className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />
            My Subscriptions
          </h2>
          <div className="text-sm text-gray-500">
            {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {subsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
          </div>
        ) : subsError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {subsError}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <FaClipboardList className="w-12 h-12 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No subscriptions yet</h3>
            <p className="text-gray-500 mb-4">You haven't subscribed to any meal plans yet.</p>
            <button
              onClick={() => navigate('/subscription')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-semibold"
            >
              Browse Plans
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {subscriptions.map(sub => {
              const isActive = sub.paymentStatus === 'approved';
              const isExpired = sub.paymentStatus === 'expired';
              const isCancelled = sub.paymentStatus === 'cancelled';
              const isPending = sub.paymentStatus === 'pending';
              const isRejected = sub.paymentStatus === 'rejected';
              
              const statusConfig = {
                approved: { color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: '✓' },
                pending: { color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: '⏳' },
                rejected: { color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '✗' },
                expired: { color: 'gray', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', icon: '⏰' },
                cancelled: { color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '🚫' }
              };
              
              const config = statusConfig[sub.paymentStatus] || statusConfig.pending;
              
              return (
                <div 
                  key={sub._id} 
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    isActive ? 'border-green-200 bg-green-50/50' :
                    isExpired ? 'border-gray-200 bg-gray-50/50 opacity-75' :
                    isCancelled ? 'border-red-200 bg-red-50/50' :
                    isPending ? 'border-orange-200 bg-orange-50/50' :
                    isRejected ? 'border-red-200 bg-red-50/50' :
                    'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isActive ? 'bg-green-100 text-green-800' :
                    isExpired ? 'bg-gray-200 text-gray-700' :
                    isCancelled ? 'bg-red-100 text-red-800' :
                    isPending ? 'bg-orange-100 text-orange-800' :
                    isRejected ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <span>{config.icon}</span>
                    {sub.paymentStatus.charAt(0).toUpperCase() + sub.paymentStatus.slice(1)}
                  </div>
                  
                  <div className="p-6">
                    {/* Plan Type Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        sub.subscriptionPlan?.planType === 'veg' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {sub.subscriptionPlan?.planType === 'veg' ? '🥬' : '🍗'}
                        {sub.subscriptionPlan?.planType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                      </span>
                    </div>
                    
                    {/* Plan Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-800">{sub.subscriptionPlan?.duration || sub.duration} days</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Total Price:</span>
                        <span className="font-bold text-lg text-orange-600">₹{sub.subscriptionPlan?.price || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Price per day:</span>
                        <span className="font-semibold text-gray-800">
                          ₹{sub.subscriptionPlan?.price && sub.subscriptionPlan?.duration 
                            ? (sub.subscriptionPlan.price / sub.subscriptionPlan.duration).toFixed(2) 
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Vendor Info */}
                    <div className="bg-white rounded-lg p-4 mb-6 border border-gray-100">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <FaUser className="text-orange-500 w-4 h-4" />
                        Vendor Details
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Name:</span> {sub.vendor?.name || 'N/A'}
                        </p>
                        {sub.vendor?.location && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Location:</span> {sub.vendor.location}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Date Information */}
                    <div className="bg-white rounded-lg p-4 mb-6 border border-gray-100">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <FaClipboardList className="text-orange-500 w-4 h-4" />
                        Subscription Period
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Start Date:</span>
                          <span className="text-sm font-medium text-gray-800">
                            {sub.startDate ? new Date(sub.startDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">End Date:</span>
                          <span className="text-sm font-medium text-gray-800">
                            {sub.startDate && sub.duration ? new Date(new Date(sub.startDate).setDate(new Date(sub.startDate).getDate() + sub.duration - 1)).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {sub.paymentProof && (
                        <button 
                          onClick={() => {
                            setPaymentProofModalSrc(`http://localhost:5000${sub.paymentProof}`);
                            setPaymentProofModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium border border-blue-200"
                        >
                          <FaClipboardList className="w-4 h-4" />
                          View Proof
                        </button>
                      )}
                      
                      {isActive && (
                        <button
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm font-medium border border-green-200"
                          onClick={() => {
                            setQrSubId(sub._id);
                            setShowQrModal(true);
                          }}
                        >
                          <FaClipboardList className="w-4 h-4" />
                          Show QR
                        </button>
                      )}
                      
                      {isExpired && (
                        <button
                          onClick={() => handleDeleteSubscription(sub._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium border border-red-200"
                        >
                          <FaClipboardList className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* QR Modal */}
        {showQrModal && qrSubId && (
          <ValidatedQrModal
            subscriptionId={qrSubId}
            onClose={() => setShowQrModal(false)}
          />
        )}

        {/* Payment Proof Modal */}
        {paymentProofModalOpen && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
            <button
              className="mt-8 mb-4 bg-white text-orange-600 font-bold rounded-full px-6 py-2 shadow hover:bg-orange-100 focus:outline-none text-lg"
              style={{ position: 'fixed', top: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}
              onClick={() => setPaymentProofModalOpen(false)}
            >
              Back to Profile
            </button>
            <div className="relative flex flex-col items-center justify-center">
              <img
                src={paymentProofModalSrc}
                alt="Payment Proof"
                className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg border-4 border-orange-500 bg-white object-contain"
              />
            </div>
          </div>
        )}
      </section>

      {/* Quick Actions Section */}
      <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm sm:text-base"
          >
            <FaClipboardList className="w-4 h-4" /> View Orders
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm sm:text-base"
          >
            <FaShoppingCart className="w-4 h-4" /> Cart View
          </button>
          <button
            onClick={() => navigate('/wallet')}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm sm:text-base"
          >
            <FaWallet className="w-4 h-4" /> My Wallet
          </button>
        </div>
      </section>

      {/* Account Settings Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/change-password')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <FaKey /> Change Password
          </button>
          <a
            href="mailto:contact_namma_bites@gmail.com"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaHeadset /> Contact Support
          </a>
        </div>
      </section>

      {/* Subscription Details Section */}
      <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaClipboardList className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />
            Subscription Details
          </h2>
          <div className="text-sm text-gray-500">
            {(() => {
              const activeSubscription = subscriptions.find(sub => sub.paymentStatus === 'approved');
              return activeSubscription ? 'Active Plan' : 'No Active Plan';
            })()}
          </div>
        </div>
        
        {(() => {
          const activeSubscription = subscriptions.find(sub => sub.paymentStatus === 'approved');
          
          if (!activeSubscription) {
            return (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <FaClipboardList className="w-12 h-12 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No active subscription</h3>
                <p className="text-gray-500 mb-6">You don't have any active meal subscription plans at the moment.</p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  <FaClipboardList className="w-4 h-4" />
                  Browse Plans
                </button>
              </div>
            );
          }
          
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Plan Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 p-6 relative overflow-hidden">
                {/* Status Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1">
                  <span>✓</span>
                  Active
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FaClipboardList className="text-green-600 w-5 h-5" />
                    Current Plan
                  </h3>
                  
                  {/* Plan Type Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      activeSubscription.subscriptionPlan?.planType === 'veg' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {activeSubscription.subscriptionPlan?.planType === 'veg' ? '🥬' : '🍗'}
                      {activeSubscription.subscriptionPlan?.planType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Plan
                    </span>
                  </div>
                  
                  {/* Plan Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Duration:</span>
                      <span className="font-semibold text-gray-800">{activeSubscription.duration} days</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total Price:</span>
                      <span className="font-bold text-lg text-green-600">₹{activeSubscription.subscriptionPlan?.price || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Price per day:</span>
                      <span className="font-semibold text-gray-800">
                        ₹{activeSubscription.subscriptionPlan?.price && activeSubscription.duration 
                          ? (activeSubscription.subscriptionPlan.price / activeSubscription.duration).toFixed(2) 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Subscription Period */}
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaClipboardList className="text-green-600 w-4 h-4" />
                    Subscription Period
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Start Date:</span>
                      <span className="text-sm font-medium text-gray-800">
                        {activeSubscription.startDate ? new Date(activeSubscription.startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">End Date:</span>
                      <span className="text-sm font-medium text-gray-800">
                        {activeSubscription.startDate && activeSubscription.duration ? new Date(new Date(activeSubscription.startDate).setDate(new Date(activeSubscription.startDate).getDate() + activeSubscription.duration - 1)).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Assigned Vendor Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 relative overflow-hidden">
                {/* Status Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1">
                  <span>👨‍🍳</span>
                  Assigned
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FaUser className="text-blue-600 w-5 h-5" />
                    Assigned Vendor
                  </h3>
                  
                  {activeSubscription.vendor ? (
                    <>
                      {/* Vendor Info */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Name:</span>
                            <p className="text-lg font-semibold text-gray-800">{activeSubscription.vendor.name}</p>
                          </div>
                          
                          {activeSubscription.vendor.location && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Location:</span>
                              <p className="text-sm text-gray-700">{activeSubscription.vendor.location}</p>
                            </div>
                          )}
                          
                          {activeSubscription.vendor.email && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Email:</span>
                              <p className="text-sm text-gray-700">{activeSubscription.vendor.email}</p>
                            </div>
                          )}
                          
                          {activeSubscription.vendor.phone && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Phone:</span>
                              <p className="text-sm text-gray-700">{activeSubscription.vendor.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setQrSubId(activeSubscription._id);
                            setShowQrModal(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
                        >
                          <FaClipboardList className="w-4 h-4" />
                          Show Subscription QR
                        </button>
                        
                        {activeSubscription.paymentProof && (
                          <button 
                            onClick={() => {
                              setPaymentProofModalSrc(`http://localhost:5000${activeSubscription.paymentProof}`);
                              setPaymentProofModalOpen(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium border border-blue-200"
                          >
                            <FaClipboardList className="w-4 h-4" />
                            View Payment Proof
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="text-gray-600 font-medium">No vendor assigned yet</p>
                      <p className="text-sm text-gray-500 mt-1">Your vendor will be assigned shortly</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Install App Section */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Install App</h2>
        <button
          onClick={() => window.open('https://play.google.com/store', '_blank')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors mx-auto"
        >
          <FaDownload /> Download App
        </button>
      </section>
    </div>
  );
};

export default UserProfile; 