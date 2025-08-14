import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { fadeInUp, scaleIn, pulse } from '../utils/animations';
import { FaCheckCircle, FaClock, FaStore, FaArrowRight } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || '';

// Helper to format minutes nicely
const formatMinutes = (mins) => {
  if (!mins && mins !== 0) return 'Calculating...';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/users/orders/${orderId}`, { withCredentials: true, params: { _: Date.now() } });
        setOrder(res.data.data);
      } catch (err) {
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Fetch dynamic estimate (initial + every 60s)
  useEffect(() => {
    if (!order) return;
    let timer;

    const fetchEstimate = async () => {
      try {
        setEstimating(true);
        const res = await axios.get(`${API_BASE_URL}/users/orders/${orderId}/estimate`, { withCredentials: true });
        if (res.data?.success) {
          setEstimate(res.data.data?.estimatedTime ?? null);
          setQueuePosition(res.data.data?.queuePosition ?? null);
        }
      } catch (e) {
        // ignore transient errors
      } finally {
        setEstimating(false);
      }
    };

    // initial fetch
    fetchEstimate();
    // poll every 60s while on confirmation page
    timer = setInterval(fetchEstimate, 60000);
    return () => clearInterval(timer);
  }, [order, orderId]);

  // Poll order state every 5s while on this page for near real-time status
  useEffect(() => {
    let isStopped = false;
    let inFlight = false;
    if (!orderId) return;

    const tick = async () => {
      if (document.hidden) return;
      if (inFlight) return;
      inFlight = true;
      try {
        const res = await axios.get(`${API_BASE_URL}/users/orders/${orderId}`, { withCredentials: true, params: { _: Date.now() } });
        if (!isStopped) {
          setOrder(res.data.data);
        }
      } catch (_) {
        // ignore transient errors
      } finally {
        inFlight = false;
      }
    };

    const intervalId = setInterval(tick, 5000);
    tick();

    const onVisibility = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isStopped = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <motion.div {...pulse} className="w-16 h-16 rounded-full border-4 border-orange-300 border-t-orange-600 animate-spin mb-4" />
        <div className="text-orange-700 font-bold text-lg">Loading your order...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100 text-center">
          <h2 className="text-2xl font-bold text-orange-800 mb-4">Order Not Found</h2>
          <p className="text-red-600 mb-4">{error || 'Order details could not be loaded.'}</p>
          <button className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold mt-2" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const vendor = order.vendor;
  const initialEstimate = order.estimatedPreparationTime || null;
  const shownEstimate = estimate ?? initialEstimate;

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white px-4 py-8"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInUp}
    >
      <motion.div {...scaleIn} className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-orange-100 flex flex-col items-center">
        <motion.div {...pulse} className="mb-4">
          <FaCheckCircle className="text-5xl text-green-500 animate-bounce" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-orange-800 mb-2 text-center">Order Placed Successfully!</h2>
        <p className="text-gray-700 text-center mb-6">Thank you for your order. Your order is now in the <span className="font-semibold text-orange-600">Approval</span> stage.</p>
        <div className="w-full bg-orange-50 rounded-xl p-4 border border-orange-200 mb-4">
          <h3 className="text-lg font-bold text-orange-700 mb-2">Order Details</h3>
          <div className="mb-2 text-gray-800"><span className="font-semibold">Order #:</span> {order.orderNumber}</div>
          <div className="mb-2 text-gray-800"><span className="font-semibold">Status:</span> <span className="text-orange-600 font-semibold capitalize">{order.state}</span></div>
          <div className="mb-2 text-gray-800"><span className="font-semibold">Placed On:</span> {new Date(order.createdAt).toLocaleString()}</div>
          <div className="mb-2 text-gray-800"><span className="font-semibold">Items:</span>
            <ul className="list-disc ml-6">
              {order.items.map((item, idx) => (
                <li key={idx}>{item.quantity}x {item.name} (₹{item.price * item.quantity})</li>
              ))}
            </ul>
          </div>
          <div className="mb-2 text-gray-800"><span className="font-semibold">Total:</span> ₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}</div>
        </div>
        <div className="w-full bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4 flex items-center gap-3">
          <FaClock className="text-blue-500 text-2xl" />
          <div>
            <div className="font-semibold text-blue-700">Estimated Preparation Time</div>
            <div className="text-lg font-bold text-blue-900">
              {formatMinutes(shownEstimate)} {estimating ? '(updating...)' : ''}
            </div>
            {queuePosition ? (
              <div className="text-sm text-blue-700">Queue position: {queuePosition}</div>
            ) : null}
          </div>
        </div>
        {vendor && (
          <div className="w-full bg-green-50 rounded-xl p-4 border border-green-200 mb-4 flex items-center gap-3">
            <FaStore className="text-green-600 text-2xl" />
            <div>
              <div className="font-semibold text-green-700">Vendor</div>
              <div className="text-lg font-bold text-green-900">{vendor.name}</div>
              {vendor.location && <div className="text-sm text-green-800">{vendor.location}</div>}
              {vendor.image && <img src={vendor.image.startsWith('http') ? vendor.image : `${SERVER_BASE_URL}${vendor.image}`} alt={vendor.name} className="w-12 h-12 rounded-full mt-2 border-2 border-green-200" />}
            </div>
          </div>
        )}
        <button
          className="mt-4 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold flex items-center gap-2 text-lg"
          onClick={() => navigate('/orders')}
        >
          <span>Go to My Orders</span>
          <FaArrowRight />
        </button>
      </motion.div>
    </motion.div>
  );
};

export default OrderConfirmation; 