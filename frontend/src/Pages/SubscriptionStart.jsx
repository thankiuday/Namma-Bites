import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubscriptionPlanById, createUserSubscription } from '../api/userApi';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const SubscriptionStart = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [dateError, setDateError] = useState('');
  const [showTodayConfirm, setShowTodayConfirm] = useState(false);
  const [pendingSubscribe, setPendingSubscribe] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await getSubscriptionPlanById(planId);
        setPlan(response.data.data);
      } catch (err) {
        setError('Failed to load subscription plan details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

  const handleSubscribe = async () => {
    setDateError('');
    const today = new Date();
    const selected = new Date(startDate);
    today.setHours(0,0,0,0);
    selected.setHours(0,0,0,0);
    if (selected < today) {
      setDateError('Start date cannot be before today.');
      return;
    }
    // Show custom modal if today is selected
    if (startDate === new Date().toISOString().split('T')[0]) {
      setShowTodayConfirm(true);
      setPendingSubscribe(true);
      return;
    }
    await doSubscribe();
  };

  const doSubscribe = async () => {
    setSubscribing(true);
    try {
      const res = await createUserSubscription({
        subscriptionPlan: plan._id,
        vendor: plan.vendor?._id || plan.vendor,
        startDate,
        duration: plan.duration
      });
      const subscriptionId = res.data.data._id;
      navigate(`/subscription/payment/${subscriptionId}`);
    } catch (err) {
      setDateError('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
      setShowTodayConfirm(false);
      setPendingSubscribe(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <p className="text-red-700 font-bold text-lg mb-4">{error}</p>
        <Link to="/subscription" className="text-orange-600 font-semibold underline flex items-center"><FaArrowLeft className="mr-2" />Back to Subscription Page</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white p-2 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-orange-100 p-4 sm:p-8 flex flex-col gap-6">
        <Link to="/subscription" className="text-orange-600 font-semibold flex items-center mb-2 hover:underline w-fit"><FaArrowLeft className="mr-2" />Back to Subscription Page</Link>
        <h2 className="text-2xl sm:text-3xl font-bold text-orange-800 mb-2 flex items-center"><FaCalendarAlt className="mr-2 text-orange-600" />Start Your Subscription</h2>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 mb-2">
          <div className="mb-2">
            <span className="font-semibold text-orange-700">Plan:</span> <span className="font-bold text-orange-900">{plan.vendor?.name} - {plan.planType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}</span>
          </div>
          <div className="mb-2 flex items-center text-orange-700 font-semibold"><FaClock className="mr-2" />Duration: <span className="ml-2 font-bold text-orange-900">{plan.duration} days</span></div>
          <div className="mb-2"><span className="font-semibold text-orange-700">Total Price:</span> <span className="font-bold text-orange-900">₹{plan.price}</span></div>
        </div>
        <form onSubmit={e => { e.preventDefault(); handleSubscribe(); }} className="flex flex-col gap-4">
          {/* Notification about today being counted */}
          {startDate === new Date().toISOString().split('T')[0] && (
            <div className="flex items-center bg-orange-100 border border-orange-300 text-orange-800 rounded-lg px-3 py-2 mb-2 text-sm font-semibold">
              <FaExclamationTriangle className="mr-2 text-orange-500" />
              You have selected today as your start date. Today will be counted as your first day of subscription.
            </div>
          )}
          <label className="block text-orange-700 font-semibold mb-1">Select Start Date</label>
          <input
            type="date"
            className="w-full border-2 border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 bg-white text-gray-800 font-medium"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setDateError(''); }}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          {dateError && <div className="text-red-600 text-sm font-semibold mt-1">{dateError}</div>}
          <button
            type="submit"
            disabled={subscribing || !startDate}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-bold flex items-center justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaCheckCircle className="mr-2" />
            {subscribing ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
      {/* Custom confirmation modal for today as start date */}
      {showTodayConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 max-w-sm w-full p-6 flex flex-col items-center">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-3xl text-orange-500 mr-3" />
              <span className="text-xl font-bold text-orange-800">Confirm Start Date</span>
            </div>
            <div className="text-orange-700 text-base font-medium mb-6 text-center">
              You have selected <span className="font-bold text-orange-900">today</span> as your start date.<br />
              <span className="font-semibold">Today will be counted as your first day of subscription.</span><br />
              Do you want to continue?
            </div>
            <div className="flex gap-4 w-full">
              <button
                className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all"
                onClick={async () => { setShowTodayConfirm(false); setPendingSubscribe(false); await doSubscribe(); }}
              >
                Yes, Continue
              </button>
              <button
                className="flex-1 py-2 rounded-lg bg-gray-200 text-orange-700 font-bold hover:bg-gray-300 transition-all"
                onClick={() => { setShowTodayConfirm(false); setPendingSubscribe(false); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStart; 