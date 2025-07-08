import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubscriptionPlanById } from '../api/userApi';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';

const SubscriptionStart = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [dateError, setDateError] = useState('');

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

  const handleSubscribe = () => {
    setDateError('');
    const today = new Date();
    const selected = new Date(startDate);
    today.setHours(0,0,0,0);
    selected.setHours(0,0,0,0);
    if (selected < today) {
      setDateError('Start date cannot be before today.');
      return;
    }
    setSubscribing(true);
    // TODO: Implement actual subscription logic here
    setTimeout(() => {
      setSubscribing(false);
      alert('Subscription started!');
      navigate('/subscription');
    }, 1200);
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
    </div>
  );
};

export default SubscriptionStart; 