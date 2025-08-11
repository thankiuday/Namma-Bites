import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaUpload, FaQrcode } from 'react-icons/fa';
import axios from 'axios';
import UploadProgress from '../components/UploadProgress';
import useUploadProgress from '../hooks/useUploadProgress';
import LazyImage from '../components/LazyImage';
import { validateImageFile } from '../utils/validation';

const API_BASE_URL = 'http://localhost:5000/api';
const SERVER_BASE_URL = 'http://localhost:5000';

const Checkout = () => {
  const { cart, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  
  // Force fresh cart fetch when component mounts
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  const [paymentProof, setPaymentProof] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { 
    uploadProgress, 
    uploadStatus, 
    isUploading, 
    uploadError, 
    uploadWithProgress 
  } = useUploadProgress();

  // Assume all items are from the same vendor
  const vendor = cart.length > 0 ? cart[0].vendor : null;
  // Use only vendor.scanner for QR
  const vendorQr = vendor?.scanner ? (vendor.scanner.startsWith('http') ? vendor.scanner : `${SERVER_BASE_URL}${vendor.scanner}`) : null;
  // Debug: Log if vendor has scanner data
  if (vendor && !vendor.scanner) {
    console.log(`ℹ️ Vendor "${vendor.name}" does not have a QR scanner uploaded yet.`);
  }

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const total = subtotal;

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    setError('');
    if (file) {
      const check = validateImageFile(file, { maxMB: 8 });
      if (!check.ok) {
        setPaymentProof(null);
        setProofPreview(null);
        setError(check.message);
        return;
      }
      setPaymentProof(file);
      setProofPreview(URL.createObjectURL(file));
    } else {
      setPaymentProof(null);
      setProofPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!paymentProof) {
      setError('Please upload payment proof (JPG/PNG/WEBP up to 8MB).');
      return;
    }
    setSubmitting(true);
    try {
      // 1. Create order (without payment proof)
      const orderRes = await axios.post(
        `${API_BASE_URL}/users/orders`,
        {
          items: cart.map(item => ({ menuItem: item._id, quantity: item.quantity })),
          vendor: vendor?._id || vendor,
        },
        { withCredentials: true }
      );
      const order = orderRes.data.data;
      // 2. Upload payment proof with progress
      const formData = new FormData();
      formData.append('paymentProof', paymentProof);
      await uploadWithProgress(
        `${API_BASE_URL}/users/orders/${order._id}/payment-proof`,
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          axiosConfig: { withCredentials: true }
        }
      );
      // 3. Clear cart and redirect
      await clearCart();
      navigate(`/order-confirmation/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100 text-center">
          <h2 className="text-2xl font-bold text-orange-800 mb-4">No items in cart</h2>
          <button className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold mt-2" onClick={() => navigate('/')}>Go to Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white p-2 sm:p-6 gap-4">
      <div className="w-full max-w-2xl flex justify-start">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 px-4 py-2 bg-white text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200 shadow-sm border border-orange-200"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      <div className="w-full max-w-2xl flex justify-center">
        <div className="w-full bg-white rounded-2xl shadow-xl border border-orange-100 p-4 sm:p-8 flex flex-col gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-orange-800 mb-2 flex items-center"><FaCheckCircle className="mr-2 text-orange-600" />Checkout</h2>
          {/* Vendor QR */}
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 mb-2 flex flex-col items-center">
            <h3 className="text-lg font-bold text-orange-700 mb-2 flex items-center"><FaQrcode className="mr-2" />Vendor QR for Payment</h3>
            {vendorQr ? (
              <LazyImage 
                src={vendorQr} 
                alt="Vendor QR" 
                className="w-40 h-40"
                imgClassName="w-40 h-40 object-contain rounded-lg border border-orange-200 bg-white" 
              />
            ) : (
              <div className="text-center p-4">
                <span className="text-orange-400 font-medium">QR Scanner not available</span>
                {vendor && (
                  <p className="text-orange-300 text-xs mt-1">
                    {vendor.name} hasn't uploaded a payment QR code yet.
                  </p>
                )}
              </div>
            )}
          </div>
          {/* Payment Proof Upload */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="block text-orange-700 font-semibold mb-1">Upload Payment Proof</label>
            <p className="text-xs text-orange-500 mb-1">Accepted: JPG, PNG, WEBP (max 8MB). Ensure details are readable.</p>
            <input
              type="file"
              accept="image/*"
              className="w-full border-2 border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 bg-white text-gray-800 font-medium"
              onChange={handleProofChange}
              required
            />
            {proofPreview && (
              <LazyImage src={proofPreview} alt="Preview" className="w-32 h-32" imgClassName="w-32 h-32 object-contain rounded-lg border border-orange-200 bg-white mt-2" />
            )}
            {error && <div className="text-red-600 text-sm font-semibold mt-1">{error}</div>}
            
            {/* Order Summary */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 mt-4">
              <h3 className="text-lg font-bold text-orange-700 mb-2">Order Summary</h3>
              <p className="text-xs text-orange-500 mb-2">Please verify items, quantity and total before submitting.</p>
              {cart.map(item => (
                <div key={item._id} className="flex items-center gap-3 mb-2">
                  <LazyImage src={item.image ? (item.image.startsWith('http') ? item.image : `${SERVER_BASE_URL}${item.image}`) : '/default-food.png'} alt={item.name} className="w-10 h-10" imgClassName="w-10 h-10 object-cover rounded" />
                  <div className="flex-grow">
                    <div className="font-semibold text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-orange-700">₹{item.price * item.quantity}</div>
                </div>
              ))}
              <div className="flex justify-between font-bold text-orange-800 mt-2 border-t pt-2">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            
            {/* Upload Progress Indicator */}
            <UploadProgress 
              progress={uploadProgress}
              status={uploadStatus}
              isVisible={isUploading}
              error={uploadError}
              className="mt-3"
            />
            
            <button
              type="submit"
              disabled={submitting || !paymentProof || isUploading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-bold flex items-center justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaUpload className="mr-2" />
              {submitting || isUploading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;