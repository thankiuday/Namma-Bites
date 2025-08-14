import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUtensils, FaClipboardList, FaUserCircle, FaSignOutAlt, FaMoneyCheckAlt, FaCalendarAlt, FaUsers, FaUser, FaEye } from 'react-icons/fa';
import { useVendorAuth } from '../context/VendorAuthContext';
import vendorApi, { getPendingUserSubscriptions, approveUserSubscription, getApprovedUserSubscriptions } from '../api/vendorApi';
import api from '../api/config';
import VendorNavbar from '../components/vendor/VendorNavbar';
import SendNotification from '../components/vendor/SendNotification';
import { getGreeting } from '../utils/greetings';
import { getVendorImageUrl, getMenuItemImageUrl, getPaymentProofImageUrl } from '../utils/imageUtils';
import axios from 'axios';
// Calendar UI removed to avoid react-datepicker peer dep conflict in production

const vendorLinks = [
  { name: 'Home', path: '/vendor/dashboard', icon: <FaHome className="w-5 h-5" /> },
  { name: 'Menu Entry', path: '/vendor/menu', icon: <FaUtensils className="w-5 h-5" /> },
  { name: 'Orders', path: '/vendor/orders', icon: <FaClipboardList className="w-5 h-5" /> },
  { name: 'Subscription', path: '/vendor/subscription', icon: <FaMoneyCheckAlt className="w-5 h-5" /> },
  { name: 'Profile', path: '/vendor/profile', icon: <FaUserCircle className="w-5 h-5" /> },
];

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper to get YYYY-MM-DD for a given day in the current week
function getDateForDay(day) {
  const today = new Date();
  const currentDay = today.getDay(); // 0 (Sun) - 6 (Sat)
  const targetDay = days.indexOf(day) + 1; // 1 (Mon) - 7 (Sun)
  const diff = targetDay - (currentDay === 0 ? 7 : currentDay);
  const date = new Date(today);
  date.setDate(today.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { vendor, logout, loading, checkVendorAuth } = useVendorAuth();
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");
  const [pendingSubs, setPendingSubs] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState('');
  const [approvedSubs, setApprovedSubs] = useState([]);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [approvedError, setApprovedError] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [approvedFilter, setApprovedFilter] = useState('none');
  const [rejectedFilter, setRejectedFilter] = useState('none');
  const [rejectedSubs, setRejectedSubs] = useState([]);
  // Add state for pre-booking view
  const [selectedDay, setSelectedDay] = useState(days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [selectedMeal, setSelectedMeal] = useState(mealTypes[0]);
  const [prebookedUsers, setPrebookedUsers] = useState([]);
  const [prebookLoading, setPrebookLoading] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [mealPrebookSummary, setMealPrebookSummary] = useState({});
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchApprovedSubs = async () => {
    setApprovedLoading(true);
    setApprovedError('');
    try {
      const res = await getApprovedUserSubscriptions();
      setApprovedSubs(res.data.data);
    } catch (err) {
      setApprovedError('Failed to load approved subscriptions.');
    } finally {
      setApprovedLoading(false);
    }
  };

  const fetchPendingSubs = async () => {
    setPendingLoading(true);
    setPendingError('');
    try {
      const res = await getPendingUserSubscriptions();
      setPendingSubs(res.data.data);
    } catch (err) {
      setPendingError('Failed to load pending subscriptions.');
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSubs();
  }, []);

  useEffect(() => {
    fetchApprovedSubs();
  }, []);

  // Live updates for new subscriptions via SSE
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || '';
    if (!base) return;
    const url = base.replace(/\/$/, '') + '/vendor/orders/events';
    let es;
    try {
      es = new EventSource(url, { withCredentials: true });
      es.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg && msg.type === 'subscription_created') {
            fetchPendingSubs();
          }
        } catch (_) {}
      };
    } catch (_) {}
    return () => { try { es && es.close(); } catch (_) {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch rejected subscriptions from backend
  const fetchRejectedSubs = async () => {
    try {
      const res = await api.get('/vendor/user-subscriptions/rejected');
      if (res.data && res.data.success) {
        setRejectedSubs(res.data.data);
      }
    } catch (err) {
      // Optionally handle error
    }
  };
  useEffect(() => {
    fetchRejectedSubs();
  }, []);

  const fetchPrebookedUsers = async (day, meal) => {
    setPrebookLoading(true);
    try {
      const date = getDateForDay(day);
      const res = await vendorApi.get(`/prebookings`, { params: { date, mealType: meal, _: Date.now() } });
      setPrebookedUsers(res.data.data || []);
    } catch (err) {
      setPrebookedUsers([]);
    } finally {
      setPrebookLoading(false);
    }
  };

  useEffect(() => {
    fetchPrebookedUsers(selectedDay, selectedMeal);
  }, [selectedDay, selectedMeal]);

  // Fetch all meal pre-bookings for a date
  const fetchMealPrebookSummary = async (dateObj) => {
    setSummaryLoading(true);
    const date = dateObj.toISOString().slice(0, 10);
    const summary = {};
    try {
      for (const meal of mealTypes) {
        const res = await vendorApi.get(`/prebookings`, { params: { date, mealType: meal, _: Date.now() } });
        summary[meal] = res.data.data || [];
      }
      setMealPrebookSummary(summary);
    } catch (err) {
      setMealPrebookSummary({});
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPrebookSummary(calendarDate);
  }, [calendarDate]);

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
  };

  const handleStatusButtonClick = () => {
    if (!vendor) return;
    // Show confirmation for both open and close
    if (vendor.status === 'Open') {
      setPendingStatus('Closed');
      setShowConfirm(true);
    } else {
      setPendingStatus('Open');
      setShowConfirm(true);
    }
  };

  const handleStatusToggle = async (newStatus) => {
    if (!vendor) return;
    setStatusLoading(true);
    setError('');
    try {
      const res = await vendorApi.put('/me/status', { status: newStatus });
      if (res.data.success) {
        await checkVendorAuth();
        // The context should ideally update itself after a successful API call.
      } else {
        setError('Failed to update status.');
      }
    } catch (err) {
      setError('Failed to update status.');
    } finally {
      setStatusLoading(false);
      setShowConfirm(false);
      setPendingStatus("");
    }
  };

  const handleConfirm = () => {
    handleStatusToggle(pendingStatus);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingStatus("");
  };

  const handleApprove = async (id, action) => {
    try {
      setPendingLoading(true);
      setPendingError('');
      const res = await api.post(`/vendor/user-subscriptions/${id}/approve`, { action });
      if (res.data && res.data.success) {
        await fetchPendingSubs();
        await fetchApprovedSubs();
        if (action === 'rejected') {
          await fetchRejectedSubs();
        }
      } else {
        setPendingError(res.data?.message || 'Failed to update subscription');
      }
    } catch (err) {
      setPendingError(err.response?.data?.message || 'Failed to update subscription');
    } finally {
      setPendingLoading(false);
    }
  };

  // Sorting logic for approved subscriptions
  const getSortedApprovedSubs = () => {
    if (approvedFilter === 'user-az') {
      return [...approvedSubs].sort((a, b) => (a.user?.name || '').localeCompare(b.user?.name || ''));
    } else if (approvedFilter === 'user-za') {
      return [...approvedSubs].sort((a, b) => (b.user?.name || '').localeCompare(a.user?.name || ''));
    } else if (approvedFilter === 'duration-asc') {
      return [...approvedSubs].sort((a, b) => (a.duration || 0) - (b.duration || 0));
    } else if (approvedFilter === 'duration-desc') {
      return [...approvedSubs].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    } else if (approvedFilter === 'start-newest') {
      return [...approvedSubs].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    } else if (approvedFilter === 'start-oldest') {
      return [...approvedSubs].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }
    return approvedSubs;
  };

  // Sorting logic for rejected subscriptions
  const getSortedRejectedSubs = () => {
    if (rejectedFilter === 'user-az') {
      return [...rejectedSubs].sort((a, b) => (a.user?.name || '').localeCompare(b.user?.name || ''));
    } else if (rejectedFilter === 'user-za') {
      return [...rejectedSubs].sort((a, b) => (b.user?.name || '').localeCompare(a.user?.name || ''));
    } else if (rejectedFilter === 'duration-asc') {
      return [...rejectedSubs].sort((a, b) => (a.duration || 0) - (b.duration || 0));
    } else if (rejectedFilter === 'duration-desc') {
      return [...rejectedSubs].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    } else if (rejectedFilter === 'start-newest') {
      return [...rejectedSubs].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    } else if (rejectedFilter === 'start-oldest') {
      return [...rejectedSubs].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }
    return rejectedSubs;
  };

  // Aggregate approved subscriptions by plan to show counts per plan
  const planSummary = React.useMemo(() => {
    const map = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    approvedSubs.forEach((sub) => {
      // Only count active subscriptions
      if (sub.paymentStatus !== 'approved') return;
      const start = new Date(sub.startDate);
      const end = new Date(start);
      // duration is in days; include start day, so subtract 1
      end.setDate(start.getDate() + (sub.duration || 0) - 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      if (!(today >= start && today <= end)) return;

      const plan = sub.subscriptionPlan;
      if (!plan || !plan._id) return;
      const key = String(plan._id);
      const label = `${plan.planType || 'Plan'}${plan.duration ? ` • ${plan.duration} days` : ''}`;
      const current = map.get(key) || { count: 0, label, price: plan.price };
      current.count += 1;
      map.set(key, current);
    });
    return Array.from(map.entries()).map(([planId, data]) => ({ planId, ...data }));
  }, [approvedSubs]);

  if (pendingLoading || approvedLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col">
        <VendorNavbar />
        <main className="flex-grow container mx-auto px-2 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vendor Details Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-green-100 mb-8 animate-pulse">
              <div className="h-8 w-48 bg-green-100 rounded mb-4" />
              <div className="h-4 w-32 bg-green-200 rounded mb-2" />
              <div className="h-4 w-24 bg-green-100 rounded mb-2" />
              <div className="h-4 w-20 bg-green-100 rounded" />
            </div>
            {/* Subscriptions Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 animate-pulse">
              <div className="h-6 w-40 bg-green-100 rounded mb-6" />
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-4 border border-green-100 rounded-lg flex flex-col gap-2">
                    <div className="h-4 w-1/2 bg-green-200 rounded mb-2" />
                    <div className="h-3 w-1/3 bg-green-100 rounded mb-1" />
                    <div className="h-3 w-1/4 bg-green-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col">
      {/* Navbar */}
      <VendorNavbar />
      {/* Personalized Greeting */}
      <div className="container mx-auto px-2 sm:px-6 mt-6 animate-fade-in-down">
        <h2 className="text-2xl font-bold text-green-700 drop-shadow-sm text-center">
          {getGreeting(vendor?.name || vendor?.username || 'Vendor')}
        </h2>
      </div>
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-2 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vendor Details Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-green-100 mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center">
                <svg className="w-8 h-8 text-green-700 align-middle" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.657 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              Vendor Details
            </h1>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {loading ? (
              <div className="text-center text-gray-500">Loading vendor details...</div>
            ) : vendor ? (
              <div className="flex flex-col items-center">
                <div className="rainbow-border-container mb-2">
                  <img
                    src={getVendorImageUrl(vendor.image)}
                    alt="Vendor Logo"
                    className="rainbow-border-img"
                  />
                </div>
                <div className="text-xl font-semibold text-gray-900 mb-2">{vendor.name}</div>
                <div className="text-gray-700 mb-1">Phone: {vendor.phone}</div>
                <div className="text-gray-700 mb-4">Email: {vendor.email}</div>
                <button
                  onClick={handleStatusButtonClick}
                  disabled={statusLoading}
                  className={`px-6 py-2 rounded-full font-bold text-black transition-colors duration-200 shadow ${vendor.status === 'Open' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                >
                  {statusLoading ? 'Updating...' : vendor.status === 'Open' ? 'Open' : 'Closed'}
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">No vendor details found.</div>
            )}
            {showConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-black font-semibold">
                  <h2 className="text-lg font-semibold mb-4">Confirm Action</h2>
                  <p className="mb-6">
                    {pendingStatus === 'Closed'
                      ? 'Do you really want to close your shop?'
                      : 'Do you really want to open your shop?'}
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className={`px-4 py-2 rounded ${pendingStatus === 'Closed' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-bold`}
                    >
                      {pendingStatus === 'Closed' ? 'Yes, Close' : 'Yes, Open'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Send Notification Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 mb-8">
            <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-700 align-middle" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </span>
              Send Notifications
            </h2>
            <SendNotification />
          </div>
          {/* Pending User Subscriptions Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100 mb-8">
            <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-700 align-middle" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              Pending User Subscriptions
            </h2>
            {pendingLoading ? (
              <div className="text-center text-gray-500">Loading pending subscriptions...</div>
            ) : pendingError ? (
              <div className="text-red-600 mb-2">{pendingError}</div>
            ) : pendingSubs.length === 0 ? (
              <div className="text-center text-gray-500">No pending user subscriptions.</div>
            ) : (
              <div className="space-y-6 overflow-y-auto max-h-[400px] md:max-h-[600px] pr-2">
                {pendingSubs.map(sub => (
                  <div key={sub._id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-orange-50 shadow-sm hover:shadow-md transition">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">User: {sub.user?.name} ({sub.user?.email})</div>
                      <div className="text-gray-700 mb-1">Plan: {sub.subscriptionPlan?.planType} ({sub.subscriptionPlan?.duration} days, ₹{sub.subscriptionPlan?.price})</div>
                      <div className="text-gray-700 mb-1">Start Date: {new Date(sub.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-700 mb-1">Duration: {sub.duration} days</div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      {sub.paymentProof ? (
                        <>
                          <button
                            onClick={() => setModalImage(getPaymentProofImageUrl(sub.paymentProof))}
                            className="focus:outline-none"
                            title="View Payment Proof"
                          >
                            <img src={getPaymentProofImageUrl(sub.paymentProof)} alt="Payment Proof" className="w-24 h-24 object-cover rounded border hover:shadow-lg transition" />
                          </button>
                          <button
                            onClick={() => setModalImage(getPaymentProofImageUrl(sub.paymentProof))}
                            className="text-xs text-orange-700 hover:text-orange-800 underline inline-flex items-center gap-1"
                          >
                            <FaEye className="w-3 h-3" /> Click to view payment proof
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">No payment proof uploaded</span>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleApprove(sub._id, 'approved')}
                          className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-bold shadow"
                        >Approve</button>
                        <button
                          onClick={() => handleApprove(sub._id, 'rejected')}
                          className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-bold shadow"
                        >Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Pre-Booked Meals Section (centered below vendor details) */}
        <div className="col-span-1 md:col-span-2 w-full bg-white rounded-3xl shadow-2xl p-8 border border-green-100 mb-8 mt-4 mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 mb-3">
              <FaCalendarAlt className="text-2xl text-emerald-600" />
              <h2 className="text-2xl font-extrabold text-emerald-800 tracking-tight">Pre-Booked Meals</h2>
            </div>
            <p className="text-emerald-700 mb-6">Pick a date to view meal-wise bookings</p>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="w-full max-w-sm">
              <input
                type="date"
                value={calendarDate.toISOString().slice(0,10)}
                onChange={e => setCalendarDate(new Date(e.target.value))}
                className="w-full border-2 border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 bg-white text-gray-800 font-medium"
              />
            </div>
          </div>

          {summaryLoading ? (
            <div className="text-center text-emerald-900 font-semibold">Loading pre-booked users...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mealTypes.map(meal => {
                const items = mealPrebookSummary[meal] || [];
                const mealTitle = meal.charAt(0).toUpperCase() + meal.slice(1);
                const icon = <FaUtensils className="text-lg" />;
                return (
                  <div key={meal} className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700">{icon}</span>
                        <h3 className="text-lg font-bold text-emerald-800 capitalize">{mealTitle}</h3>
                      </div>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        <FaUsers /> {items.length}
                      </span>
                    </div>
                    {items.length === 0 ? (
                      <div className="text-center text-emerald-700">No pre-bookings for this meal.</div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-auto pr-1">
                        {items.map(({ user, subscriptionId, menuItem }) => (
                          <div key={subscriptionId} className="flex items-center gap-3 p-2 rounded-xl bg-white/70 border border-emerald-100">
                            <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800">
                              <FaUser />
                            </div>
                            <div className="flex-1">
                              <div className="text-emerald-900 font-semibold leading-tight">{user?.name || 'User'}</div>
                              <div className="text-emerald-700 text-sm leading-tight">{user?.email || '-'}</div>
                            </div>
                            {menuItem && (
                              <div className="flex items-center gap-2">
                                {menuItem.image && (
                                  <img src={getMenuItemImageUrl(menuItem.image)} alt={menuItem.name} className="w-10 h-10 rounded object-cover border" />
                                )}
                                <div className="text-emerald-900 text-sm font-semibold">{menuItem.name}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
          {/* Plan Subscribers Summary (centered, full width) */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100 mb-8 mt-4 w-full mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
            <h2 className="text-2xl font-extrabold text-emerald-800 tracking-tight">Subscription Plans - Subscribers</h2>
          </div>
          <p className="text-emerald-700 mb-6">Overview of how many users subscribed to each plan</p>
        </div>
        {approvedLoading ? (
          <div className="text-center text-emerald-900 font-semibold">Loading summary...</div>
        ) : planSummary.length === 0 ? (
          <div className="text-center text-emerald-700">No approved subscriptions to summarize.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {planSummary.map(({ planId, label, count, price }) => (
              <div key={planId} className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow p-5 flex items-center justify-between">
                <div>
                  <div className="text-emerald-900 font-bold">{label}</div>
                  {price ? <div className="text-emerald-700 text-sm">₹{price}</div> : null}
                </div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  <FaUsers /> {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
          {/* Approved User Subscriptions Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center">
                <svg className="w-8 h-8 text-green-700 align-middle" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
              Approved User Subscriptions
            </h2>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-green-700 font-semibold text-sm" htmlFor="approved-filter">Sort by:</label>
              <select
                id="approved-filter"
                value={approvedFilter}
                onChange={e => setApprovedFilter(e.target.value)}
                className="w-full sm:w-60 border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500 bg-white text-gray-800 font-medium"
              >
                <option value="none">None</option>
                <option value="user-az">User Name (A-Z)</option>
                <option value="user-za">User Name (Z-A)</option>
                <option value="duration-asc">Plan Duration (Asc)</option>
                <option value="duration-desc">Plan Duration (Desc)</option>
                <option value="start-newest">Start Date (Newest)</option>
                <option value="start-oldest">Start Date (Oldest)</option>
              </select>
            </div>
            {approvedLoading ? (
              <div className="text-center text-gray-500">Loading approved subscriptions...</div>
            ) : approvedError ? (
              <div className="text-red-600 mb-2">{approvedError}</div>
            ) : getSortedApprovedSubs().length === 0 ? (
              <div className="text-center text-gray-500">No approved user subscriptions.</div>
            ) : (
              <div className="space-y-6 overflow-y-auto max-h-[400px] md:max-h-[600px] pr-2">
                {getSortedApprovedSubs().map(sub => (
                  <div key={sub._id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-green-50 shadow-sm hover:shadow-md transition">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">User: {sub.user?.name} ({sub.user?.email})</div>
                      <div className="text-gray-700 mb-1">Plan: {sub.subscriptionPlan?.planType} ({sub.subscriptionPlan?.duration} days, ₹{sub.subscriptionPlan?.price})</div>
                      <div className="text-gray-700 mb-1">Start Date: {new Date(sub.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-700 mb-1">Duration: {sub.duration} days</div>
                      {sub.paymentProof && (
                        <button
                          onClick={() => setModalImage(getPaymentProofImageUrl(sub.paymentProof))}
                          className="mt-2 text-orange-700 underline text-sm font-semibold hover:text-orange-900 focus:outline-none"
                        >
                          Click here to see payment proof
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Rejected User Subscriptions Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200 col-span-1 md:col-span-2 mt-8">
            <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center">
                <svg className="w-8 h-8 text-red-700 align-middle" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </span>
              Rejected User Subscriptions
            </h2>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-red-700 font-semibold text-sm" htmlFor="rejected-filter">Sort by:</label>
              <select
                id="rejected-filter"
                value={rejectedFilter}
                onChange={e => setRejectedFilter(e.target.value)}
                className="w-full sm:w-60 border-2 border-red-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-500 bg-white text-gray-800 font-medium"
              >
                <option value="none">None</option>
                <option value="user-az">User Name (A-Z)</option>
                <option value="user-za">User Name (Z-A)</option>
                <option value="duration-asc">Plan Duration (Asc)</option>
                <option value="duration-desc">Plan Duration (Desc)</option>
                <option value="start-newest">Start Date (Newest)</option>
                <option value="start-oldest">Start Date (Oldest)</option>
              </select>
            </div>
            {approvedLoading ? (
              <div className="text-center text-gray-500">Loading rejected subscriptions...</div>
            ) : approvedError ? (
              <div className="text-red-600 mb-2">{approvedError}</div>
            ) : getSortedRejectedSubs().length === 0 ? (
              <div className="text-center text-gray-500">No rejected user subscriptions.</div>
            ) : (
              <div className="space-y-6 overflow-y-auto max-h-[400px] md:max-h-[600px] pr-2">
                {getSortedRejectedSubs().map(sub => (
                  <div key={sub._id} className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center bg-red-50 shadow-sm hover:shadow-md transition">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">User: {sub.user?.name} ({sub.user?.email})</div>
                      <div className="text-gray-700 mb-1">Plan: {sub.subscriptionPlan?.planType} ({sub.subscriptionPlan?.duration} days, ₹{sub.subscriptionPlan?.price})</div>
                      <div className="text-gray-700 mb-1">Start Date: {new Date(sub.startDate).toLocaleDateString()}</div>
                      <div className="text-gray-700 mb-1">Duration: {sub.duration} days</div>
                      {sub.paymentProof && (
                        <button
                          onClick={() => setModalImage(getPaymentProofImageUrl(sub.paymentProof))}
                          className="mt-2 text-orange-700 underline text-sm font-semibold hover:text-orange-900 focus:outline-none"
                        >
                          Click here to see payment proof
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
        
      </main>
      {/* Footer */}
      <footer className="bg-white text-black py-4 text-center border-t border-gray-200">
        &copy; {new Date().getFullYear()} Namma Bites. All rights reserved.
      </footer>
      {/* Payment Proof Modal */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative max-w-3xl w-full mx-4">
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-2 left-2 bg-white bg-opacity-80 rounded-full px-4 py-2 text-orange-700 font-bold shadow hover:bg-orange-100 focus:outline-none"
            >
              Back
            </button>
            <img
              src={modalImage}
              alt="Payment Proof Large"
              className="w-full max-h-[80vh] object-contain rounded-xl border-4 border-white shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard; 