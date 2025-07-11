import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:5000';

const VendorQrScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [orderScanMessage, setOrderScanMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  const handleScan = async (data) => {
    console.log('handleScan called with data:', data);
    if (data && data !== scanResult) {
      setScanResult(data);
      setLoading(true);
      setError('');
      setSubscriptionInfo(null);
      setOrderInfo(null);
      setOrderScanMessage('');
      try {
        // Try subscription QR first
        const res = await axios.post(
          `${API_BASE_URL}/api/vendor/scan-qr`,
          { qrData: data },
          { withCredentials: true }
        );
        console.log('Backend response (subscription):', res.data);
        setSubscriptionInfo(res.data.subscription);
      } catch (err) {
        // If subscription scan fails, try order QR
        console.error('Error from backend (subscription):', err);
        try {
          const res2 = await axios.post(
            `${API_BASE_URL}/api/vendor/orders/scan-qr`,
            { qrData: data },
            { withCredentials: true }
          );
          console.log('Backend response (order):', res2.data);
          setOrderInfo(res2.data.data);
          setOrderScanMessage(res2.data.message || '');
        } catch (err2) {
          console.error('Error from backend (order):', err2);
          setError(
            err2.response?.data?.message ||
            err.response?.data?.message ||
            'Failed to validate QR code'
          );
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    // Suppress 'e2' and 'Dimensions could be not found.' errors
    if (err && err.message && err.message !== 'e2' && err.message !== 'Dimensions could be not found.') {
      setError('Camera error: ' + err.message);
      console.error('Camera error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-2 py-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col items-center border border-orange-200">
        <h1 className="text-3xl md:text-4xl font-extrabold text-orange-700 mb-2 text-center tracking-tight drop-shadow-sm">Vendor QR Scanner</h1>
        <p className="text-orange-600 text-base md:text-lg mb-6 text-center font-medium">Scan a user's subscription QR code to validate their plan and view details.</p>
        <button
          className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-md"
          onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
        >
          Switch Camera ({facingMode === 'environment' ? 'Back' : 'Front'})
        </button>
        <div className="w-full flex justify-center mb-6">
          <div className="w-[90vw] max-w-xs aspect-square rounded-xl overflow-hidden border-4 border-orange-200 bg-orange-50 shadow-inner flex items-center justify-center">
            <QrReader
              constraints={{}}
              onResult={(result, error) => {
                if (!!result) {
                  handleScan(result?.text);
                }
                if (!!error) {
                  handleError(error);
                }
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
        {loading && <div className="text-orange-600 font-semibold mb-4 animate-pulse">Validating QR code...</div>}
        {error && <div className="text-red-600 font-semibold mb-4 text-center">{error}</div>}
        {subscriptionInfo && (
          <div className="w-full bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl shadow-lg p-5 mt-2 border border-orange-200">
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-orange-700 text-center flex items-center justify-center gap-2">
              <span>Subscription Info</span>
              {subscriptionInfo.expired || subscriptionInfo.paymentStatus === 'expired' ? (
                <span className="ml-2 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-bold border border-gray-400">Subscription Expired</span>
              ) : subscriptionInfo.validated ? (
                <span className="ml-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-300">Validated</span>
              ) : (
                <span className="ml-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-300">Not Validated</span>
              )}
            </h2>
            <div className="flex flex-col gap-2 text-orange-800 text-base md:text-lg">
              <div><span className="font-semibold">User:</span> {subscriptionInfo.user?.name} <span className="text-orange-500 text-xs">({subscriptionInfo.user?.email})</span></div>
              <div><span className="font-semibold">Plan:</span> {subscriptionInfo.plan?.planType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} ({subscriptionInfo.plan?.duration} days, ₹{subscriptionInfo.plan?.price})</div>
              <div><span className="font-semibold">Start Date:</span> {subscriptionInfo.startDate ? format(new Date(subscriptionInfo.startDate), 'dd MMM yyyy') : 'N/A'}</div>
              <div><span className="font-semibold">End Date:</span> {subscriptionInfo.startDate ? format(new Date(new Date(subscriptionInfo.startDate).setDate(new Date(subscriptionInfo.startDate).getDate() + (subscriptionInfo.duration ? subscriptionInfo.duration - 1 : 0))), 'dd MMM yyyy') : 'N/A'}</div>
              <div className="mb-2 text-xs text-orange-600 font-medium bg-orange-50 rounded px-2 py-1">
                This subscription is valid from {subscriptionInfo.startDate ? format(new Date(subscriptionInfo.startDate), 'dd MMM yyyy') : 'N/A'} to {subscriptionInfo.startDate ? format(new Date(new Date(subscriptionInfo.startDate).setDate(new Date(subscriptionInfo.startDate).getDate() + (subscriptionInfo.duration ? subscriptionInfo.duration - 1 : 0))), 'dd MMM yyyy') : 'N/A'} (inclusive).<br />The user can avail meals on all these days.
              </div>
              <div><span className="font-semibold">Duration:</span> {subscriptionInfo.duration} days</div>
              <div><span className="font-semibold">Payment Status:</span> <span className={`font-bold ${subscriptionInfo.paymentStatus === 'approved' ? 'text-green-700' : subscriptionInfo.paymentStatus === 'pending' ? 'text-orange-700' : subscriptionInfo.paymentStatus === 'expired' ? 'text-gray-700' : 'text-red-700'}`}>{subscriptionInfo.paymentStatus}</span></div>
              {subscriptionInfo.paymentProof && (
                <a href={`http://localhost:5000${subscriptionInfo.paymentProof}`} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 underline">View Payment Proof</a>
              )}
            </div>
          </div>
        )}
        {orderInfo && (
          <>
            {orderScanMessage && (
              <div className={`w-full mb-3 px-4 py-2 rounded-lg text-center font-bold text-base border-2 ${orderScanMessage.toLowerCase().includes('completed') ? 'bg-red-100 text-red-700 border-red-300' : 'bg-orange-100 text-orange-700 border-orange-300'}`}>
                {orderScanMessage}
              </div>
            )}
            <div className="w-full bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl shadow-lg p-5 mt-2 border border-orange-200">
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-orange-700 text-center flex items-center justify-center gap-2">
                <span>Order Info</span>
                {orderInfo.state === 'completed' ? (
                  <span className="ml-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-300">Completed</span>
                ) : orderInfo.state === 'ready' ? (
                  <span className="ml-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-300">Ready</span>
                ) : orderInfo.state === 'preparing' ? (
                  <span className="ml-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold border border-orange-300">Preparing</span>
                ) : orderInfo.state === 'pending' ? (
                  <span className="ml-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200">Pending</span>
                ) : orderInfo.state === 'rejected' ? (
                  <span className="ml-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-300">Rejected</span>
                ) : null}
              </h2>
              <div className="flex flex-col gap-2 text-orange-800 text-base md:text-lg">
                <div><span className="font-semibold">Order #:</span> {orderInfo.orderNumber}</div>
                <div><span className="font-semibold">User:</span> {orderInfo.user?.name} <span className="text-orange-500 text-xs">({orderInfo.user?.email})</span></div>
                <div><span className="font-semibold">Placed On:</span> {orderInfo.createdAt ? format(new Date(orderInfo.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}</div>
                <div><span className="font-semibold">Total:</span> ₹{orderInfo.items?.reduce((sum, item) => sum + item.price * item.quantity, 0)}</div>
                <div><span className="font-semibold">State:</span> {orderInfo.state}</div>
                {orderInfo.paymentProof && (
                  <a href={`http://localhost:5000${orderInfo.paymentProof}`} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 underline">View Payment Proof</a>
                )}
                <div className="mt-2">
                  <span className="font-semibold">Items:</span>
                  <ul className="list-disc ml-6">
                    {orderInfo.items?.map((item, idx) => (
                      <li key={idx}>{item.quantity}x {item.name} (₹{item.price * item.quantity})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorQrScanner; 