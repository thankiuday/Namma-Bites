import React, { useEffect, useState } from 'react';
import vendorApi, { acceptOrder, rejectOrder, markOrderReady, completeOrder } from '../api/vendorApi';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaClock, FaQrcode, FaUpload } from 'react-icons/fa';

const SERVER_BASE_URL = 'http://localhost:5000';

const stateColors = {
  completed: 'bg-green-100 text-green-700 border-green-300',
  preparing: 'bg-orange-100 text-orange-700 border-orange-300',
  ready: 'bg-blue-100 text-blue-700 border-blue-300',
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  rejected: 'bg-red-100 text-red-700 border-red-300',
};

const stateIcons = {
  completed: <FaCheckCircle className="inline mr-1" />,
  preparing: <FaClock className="inline mr-1" />,
  ready: <FaQrcode className="inline mr-1" />,
  pending: <FaClock className="inline mr-1" />,
  rejected: <FaTimesCircle className="inline mr-1" />,
};

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

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [stateFilter, setStateFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await vendorApi.get('/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (orderId) => {
    setActionLoading(orderId + '-accept');
    try {
      await acceptOrder(orderId);
      toast.success('Order accepted!');
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept order.');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (orderId) => {
    setActionLoading(orderId + '-reject');
    try {
      await rejectOrder(orderId);
      toast.success('Order rejected.');
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject order.');
    } finally {
      setActionLoading('');
    }
  };

  const handleMarkReady = async (orderId) => {
    setActionLoading(orderId + '-ready');
    try {
      await markOrderReady(orderId);
      toast.success('Order marked as ready!');
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as ready.');
    } finally {
      setActionLoading('');
    }
  };

  const handleComplete = async (orderId) => {
    setActionLoading(orderId + '-complete');
    try {
      await completeOrder(orderId);
      toast.success('Order marked as completed!');
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete order.');
    } finally {
      setActionLoading('');
    }
  };

  // Sorting and filtering logic
  const filteredOrders = orders
    .filter(order => {
      if (!stateFilter) return true;
      return order.state === stateFilter;
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

  const uniqueStates = Array.from(new Set(orders.map(o => o.state)));

  return (
    <div className="min-h-screen bg-orange-50 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-semibold mb-4 text-base"
          onClick={() => window.history.back()}
        >
          <FaArrowLeft /> Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-orange-700 mb-6 sm:mb-8">Vendor Orders</h1>
        {/* Filter & Sort UI */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-6 bg-orange-100 p-4 rounded-lg shadow">
          <div>
            <label className="block text-xs font-semibold text-orange-900 mb-1">Sort By</label>
            <select
              className="border border-orange-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-900 bg-white"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="priceLow">Price: Low to High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-orange-900 mb-1">Order State</label>
            <select
              className="border border-orange-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 text-orange-900 bg-white"
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
            >
              <option value="">All</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{getStatusText(state)}</option>
              ))}
            </select>
          </div>
          {(sortBy !== 'newest' || stateFilter) && (
            <button
              className="self-end sm:self-center mt-2 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded shadow"
              onClick={() => { setSortBy('newest'); setStateFilter(''); }}
            >
              Clear Filters
            </button>
          )}
        </div>
        {/* End Filter & Sort UI */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-orange-600 text-base sm:text-lg">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-red-600 text-base sm:text-lg">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-600 text-base sm:text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                    <p className="text-gray-700 text-sm sm:text-base">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-orange-900 font-semibold mt-1">User: {order.user?.name} ({order.user?.email})</p>
                  </div>
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
                </div>

                <div className="border-t border-b py-3 sm:py-4 my-3 sm:my-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 mb-2 last:mb-0">
                      <img src={item.picture ? (item.picture.startsWith('http') ? item.picture : `${SERVER_BASE_URL}${item.picture}`) : '/default-food.png'} alt={item.name} className="w-10 h-10 object-cover rounded" />
                      <span className="text-gray-700 text-sm sm:text-base flex-1">{item.quantity}x {item.name}</span>
                      <span className="text-gray-900 text-sm sm:text-base">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                  <div className="flex flex-col gap-1">
                    {order.paymentProof && (
                      <a href={`${SERVER_BASE_URL}${order.paymentProof}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-orange-600 underline"><FaUpload className="mr-1" />View Payment Proof</a>
                    )}
                    {order.qrCode && (order.state === 'preparing' || order.state === 'ready') && (
                      <div className="flex items-center mt-2">
                        <FaQrcode className="text-orange-600 mr-2" />
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(order.qrCode)}&size=100x100`}
                          alt="Order QR"
                          className="w-20 h-20 object-contain rounded border border-orange-200 bg-white cursor-pointer hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-700">Total Amount:</p>
                    <p className="text-base sm:text-lg font-bold text-orange-700">₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}</p>
                  </div>
                </div>

                {/* Actions */}
                {order.state === 'pending' && (
                  <div className="flex gap-4 mt-4">
                    <button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-bold disabled:opacity-60"
                      disabled={actionLoading === order._id + '-accept'}
                      onClick={() => handleAccept(order._id)}
                    >
                      {actionLoading === order._id + '-accept' ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold disabled:opacity-60"
                      disabled={actionLoading === order._id + '-reject'}
                      onClick={() => handleReject(order._id)}
                    >
                      {actionLoading === order._id + '-reject' ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                )}
                {order.state === 'preparing' && (
                  <div className="flex gap-4 mt-4">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold disabled:opacity-60"
                      disabled={actionLoading === order._id + '-ready'}
                      onClick={() => handleMarkReady(order._id)}
                    >
                      {actionLoading === order._id + '-ready' ? 'Marking...' : 'Mark Ready'}
                    </button>
                  </div>
                )}
                {order.state === 'ready' && (
                  <div className="flex gap-4 mt-4">
                    <button
                      className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded font-bold disabled:opacity-60"
                      disabled={actionLoading === order._id + '-complete'}
                      onClick={() => handleComplete(order._id)}
                    >
                      {actionLoading === order._id + '-complete' ? 'Completing...' : 'Complete Order'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders; 