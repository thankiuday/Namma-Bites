import React, { useEffect, useRef, useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaQrcode, FaUpload, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { API_URL as API_BASE_URL } from '../api/config';
// Joyride removed for production build
import { useNavigate } from 'react-router-dom';
import LazyImage from '../components/LazyImage';
import OrderTimeEstimate from '../components/OrderTimeEstimate';

const SERVER_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '') || '';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Filtering state
  const [sortBy, setSortBy] = useState('newest');
  const [stateFilter, setStateFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalSrc, setQrModalSrc] = useState(null);
  const [paymentProofModalOpen, setPaymentProofModalOpen] = useState(false);
  const [paymentProofModalSrc, setPaymentProofModalSrc] = useState(null);
  // const [runTour, setRunTour] = useState(false);
  const navigate = useNavigate();

  // Tour logic removed

  // const handleTourCallback = () => {};

  // const tourSteps = [];

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/users/orders`, { withCredentials: true, params: { _: Date.now() } });
        setOrders(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Lightweight polling to keep user orders in sync without manual refresh
  useEffect(() => {
    const sseActiveRef = sseFlagRef;
    let isStopped = false;
    let inFlight = false;

    const tick = async () => {
      if (sseActiveRef.current) return;
      if (document.hidden) return;
      if (inFlight) return;
      inFlight = true;
      try {
        const res = await axios.get(`${API_BASE_URL}/users/orders`, { withCredentials: true, params: { _: Date.now() } });
        if (!isStopped) {
          setOrders(res.data.data || []);
        }
      } catch (_) {
        // ignore transient polling errors
      } finally {
        inFlight = false;
      }
    };

    const intervalId = setInterval(tick, 5000);
    // immediate tick improves perceived responsiveness
    tick();

    const onVisibility = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isStopped = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Subscribe to SSE to react instantly to order events
  useEffect(() => {
    const base = API_BASE_URL || '';
    if (!base) return;
    const url = base.replace(/\/$/, '') + '/users/orders/events';
    let es;
    try {
      es = new EventSource(url, { withCredentials: true });
      es.onopen = () => { sseFlagRef.current = true; };
      es.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (!msg) return;
          if (msg.type === 'order_updated') {
            setOrders((prev) => {
              const idx = prev.findIndex(o => String(o._id) === String(msg.orderId));
              if (idx === -1) return prev;
              const updated = [...prev];
              updated[idx] = { ...updated[idx], state: msg.state };
              return updated;
            });
          } else if (msg.type === 'order_created') {
            axios.get(`${API_BASE_URL}/users/orders`, { withCredentials: true, params: { _: Date.now() } })
              .then((res) => setOrders(res.data.data || []))
              .catch(() => {});
          }
        } catch (_) {}
      };
    } catch (_) {}
    return () => { try { es && es.close(); } catch (_) {} sseFlagRef.current = false; };
  }, []);

  const sseFlagRef = useRef(false);

  // Extract unique states and vendors for filter dropdowns
  const uniqueStates = Array.from(new Set(orders.map(o => o.state)));
  const uniqueVendors = Array.from(new Set(orders.map(o => o.vendor?.name).filter(Boolean)));

  // Filtering and sorting logic
  const filteredOrders = orders
    .filter(order => {
      if (stateFilter && order.state !== stateFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'priceHigh') {
        return (
          b.items.reduce((sum, item) => sum + item.price * item.quantity, 0) -
          a.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        );
      } else if (sortBy === 'priceLow') {
        return (
          a.items.reduce((sum, item) => sum + item.price * item.quantity, 0) -
          b.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        );
      }
      return 0;
    });

  const getStatusIcon = (state) => {
    switch (state) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'preparing':
        return <FaClock className="text-orange-500" />;
      case 'ready':
        return <FaQrcode className="text-blue-500" />;
      case 'pending':
        return <FaClock className="text-orange-400" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (state) => {
    switch (state) {
      case 'completed':
        return 'Completed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      case 'pending':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      default:
        return state;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 px-4 py-2 bg-white text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200 shadow-sm border border-orange-200"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back
      </button>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Your Orders</h1>
     {/* Filter UI */}
<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border">
  {/* Sort By */}
  <div className="flex-1">
    <label className="block text-xs font-semibold text-orange-900 mb-1">Sort By</label>
    <select
      className="w-full border border-orange-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-900 bg-white"
      value={sortBy}
      onChange={e => setSortBy(e.target.value)}
    >
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="priceHigh">Price: High to Low</option>
      <option value="priceLow">Price: Low to High</option>
    </select>
  </div>

  {/* Order State */}
  <div className="flex-1">
    <label className="block text-xs font-semibold text-orange-900 mb-1">Order State</label>
    <select
      className="w-full border border-orange-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-900 bg-white"
      value={stateFilter}
      onChange={e => setStateFilter(e.target.value)}
    >
      <option value="">All</option>
      {uniqueStates.map(state => (
        <option key={state} value={state}>
          {getStatusText(state) === 'Ready for Pickup' ? 'Ready for Pickup' : getStatusText(state)}
        </option>
      ))}
    </select>
  </div>

  {/* Clear Filters Button */}
  {(sortBy !== 'newest' || stateFilter) && (
    <div className="sm:ml-4">
      <button
        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded shadow"
        onClick={() => { setSortBy('newest'); setStateFilter(''); }}
      >
        Clear Filters
      </button>
    </div>
  )}
</div>
{/* End Filter UI */}

      {loading ? (
        <div className="space-y-4 sm:space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-orange-50 rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                <div>
                  <div className="h-4 w-32 bg-orange-200 rounded mb-2" />
                  <div className="h-3 w-24 bg-orange-100 rounded mb-1" />
                  <div className="h-3 w-20 bg-orange-100 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-orange-200 rounded-full" />
                  <div className="h-3 w-16 bg-orange-100 rounded" />
                </div>
              </div>
              <div className="border-t border-b py-3 sm:py-4 my-3 sm:my-4">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3 mb-2 last:mb-0">
                    <div className="w-10 h-10 bg-orange-100 rounded" />
                    <div className="h-3 w-24 bg-orange-200 rounded flex-1" />
                    <div className="h-3 w-10 bg-orange-100 rounded" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <div className="h-3 w-32 bg-orange-100 rounded mb-2" />
                <div className="h-3 w-16 bg-orange-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-red-600 text-base sm:text-lg">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
            <rect x="10" y="40" width="100" height="60" rx="12" fill="#FFEDD5" />
            <rect x="25" y="55" width="70" height="30" rx="8" fill="#FDBA74" />
            <rect x="40" y="70" width="40" height="10" rx="5" fill="#F59E42" />
            <circle cx="60" cy="50" r="8" fill="#FDBA74" />
            <ellipse cx="60" cy="105" rx="30" ry="5" fill="#FDE68A" />
          </svg>
          <p className="text-gray-600 text-base sm:text-lg font-semibold mb-2">No orders found</p>
          <p className="text-gray-400 text-sm">Looks like you haven't placed any orders yet. Start exploring our menu and enjoy your first meal!</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                  <p className="text-gray-700 text-sm sm:text-base">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                  <p className="text-xs text-orange-900 font-semibold mt-1">Vendor: {order.vendor?.name}</p>
                </div>
                                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.state)}
                      <span className={`font-medium text-sm sm:text-base ${
                        order.state === 'completed' ? 'text-green-500' :
                        order.state === 'preparing' ? 'text-orange-500' :
                        order.state === 'ready' ? 'text-blue-500' :
                        order.state === 'pending' ? 'text-orange-400' :
                        'text-red-500'
                      }`}>
                        {getStatusText(order.state)}
                      </span>
                    </div>
                    {order.actualPreparationTime && order.estimatedPreparationTime && (
                      <div className="text-xs">
                        <span className={
                          order.actualPreparationTime <= order.estimatedPreparationTime 
                            ? 'text-green-600' 
                            : 'text-orange-600'
                        }>
                          {order.actualPreparationTime <= order.estimatedPreparationTime
                            ? '✓ Prepared on time'
                            : `⏰ Took ${order.actualPreparationTime - order.estimatedPreparationTime}min longer`
                          }
                        </span>
                      </div>
                    )}
                  </div>
              </div>
              
              {/* Show time estimate for active orders */}
              {(order.state === 'pending' || order.state === 'preparing' || order.state === 'ready') && (
                <div className="mb-4">
                  <OrderTimeEstimate 
                    orderId={order._id}
                    vendorId={order.vendor._id}
                    onError={(err) => setError(err)}
                  />
                </div>
              )}

              <div className="border-t border-b py-3 sm:py-4 my-3 sm:my-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 mb-2 last:mb-0">
                    <LazyImage
                      src={item.picture ? (item.picture.startsWith('http') ? item.picture : `${SERVER_BASE_URL}${item.picture}`) : '/default-food.png'}
                      alt={item.name}
                      className="w-10 h-10"
                      imgClassName="w-10 h-10 object-cover rounded"
                    />
                    <span className="text-gray-700 text-sm sm:text-base flex-1">{item.quantity}x {item.name}</span>
                    <span className="text-gray-900 text-sm sm:text-base">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <div className="flex flex-col gap-1">
                  {order.paymentProof && (
                    <button 
                      onClick={() => {
                        const proofSrc = order.paymentProof && (order.paymentProof.startsWith('http') ? order.paymentProof : `${SERVER_BASE_URL}${order.paymentProof}`);
                        setPaymentProofModalSrc(proofSrc);
                        setPaymentProofModalOpen(true);
                      }}
                      className="flex items-center text-xs text-orange-600 underline hover:text-orange-700 transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      <FaUpload className="mr-1" />View Payment Proof
                    </button>
                  )}
                  {order.qrCode && (order.state === 'preparing' || order.state === 'ready') && (
                    <div className="flex items-center mt-2">
                      <FaQrcode className="text-orange-600 mr-2" />
                      <LazyImage
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(order.qrCode)}&size=100x100`}
                        alt="Order QR"
                        className="w-20 h-20"
                        imgClassName="w-20 h-20 object-contain rounded border border-orange-200 bg-white cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          setQrModalSrc(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(order.qrCode)}&size=300x300`);
                          setQrModalOpen(true);
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-700">Total Amount:</p>
                  <p className="text-base sm:text-lg font-bold text-orange-700">₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* QR Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
          <button
            className="mt-8 mb-4 bg-white text-orange-600 font-bold rounded-full px-6 py-2 shadow hover:bg-orange-100 focus:outline-none text-lg"
            style={{ position: 'fixed', top: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}
            onClick={() => setQrModalOpen(false)}
          >
            Back
          </button>
          <div className="relative flex flex-col items-center justify-center">
            <img
              src={qrModalSrc}
              alt="Order QR Large"
              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg border-4 border-orange-500 bg-white"
            />
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {paymentProofModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
          <button
            className="mt-8 mb-4 bg-white text-orange-600 font-bold rounded-full px-6 py-2 shadow hover:bg-orange-100 focus:outline-none text-lg"
            style={{ position: 'fixed', top: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 60 }}
            onClick={() => setPaymentProofModalOpen(false)}
          >
            Back to Order History
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

    </div>
  );
};

export default Orders; 