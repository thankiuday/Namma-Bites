import React, { useState, useRef, useCallback } from 'react';
import ZxingQrScanner from '../components/ZxingQrScanner';
import { getMenuItemImageUrl } from '../utils/imageUtils';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const VendorQrScanner = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState('');
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [orderScanMessage, setOrderScanMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  // Add request deduplication
  const processingRef = useRef(false);
  const lastScanRef = useRef('');

  // Optimized scan handler with request deduplication and parallel API calls
  const handleScan = useCallback(async (data) => {
    console.log('handleScan called with data:', data);
    
    // Prevent duplicate processing
    if (data === lastScanRef.current || processingRef.current) {
      return;
    }
    
    lastScanRef.current = data;
    processingRef.current = true;
    
      setScanResult(data);
      setLoading(true);
      setError('');
      setSubscriptionInfo(null);
      setOrderInfo(null);
      setOrderScanMessage('');

      try {
      // Make parallel API calls to both endpoints
      const [subscriptionResponse, orderResponse] = await Promise.allSettled([
        axios.post(
          `${API_BASE_URL}/vendor/scan-qr`,
          { qrData: data },
          { withCredentials: true }
        ),
        axios.post(
            `${API_BASE_URL}/vendor/orders/scan-qr`,
            { qrData: data },
            { withCredentials: true }
        )
      ]);

      // Check subscription response first
      if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value.data.success) {
        console.log('Backend response (subscription):', subscriptionResponse.value.data);
        setSubscriptionInfo(subscriptionResponse.value.data.subscription);
      }
      // Check order response
      else if (orderResponse.status === 'fulfilled' && orderResponse.value.data.success) {
        console.log('Backend response (order):', orderResponse.value.data);
        setOrderInfo(orderResponse.value.data.data);
        setOrderScanMessage(orderResponse.value.data.message || '');
      }
      // Handle errors
      else {
        const subscriptionError = subscriptionResponse.status === 'rejected' ? subscriptionResponse.reason : null;
        const orderError = orderResponse.status === 'rejected' ? orderResponse.reason : null;
        
        // Show the most relevant error message
        const errorMessage = 
          subscriptionError?.response?.data?.message ||
          orderError?.response?.data?.message ||
          'Failed to validate QR code';
        
        setError(errorMessage);
        }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      processingRef.current = false;
    }
  }, []);

  const handleError = (err) => {
    // Suppress 'No MultiFormat Readers were able to detect the code.' errors
    if (
      err &&
      err.message &&
      (
        err.message === 'No MultiFormat Readers were able to detect the code.' ||
        err.message.includes('No MultiFormat Readers')
      )
    ) {
      return;
    }
    setError('Camera error: ' + (err && err.message ? err.message : err));
    console.error('Camera error:', err);
  };

  // Handler for react-html5-qrcode
  const onScanSuccess = (decodedText, decodedResult) => {
    handleScan(decodedText);
  };

  const onScanError = (errorMessage) => {
    // Optionally handle scan errors
    // handleError({ message: errorMessage });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-2 py-6">
      <button
        className="self-start mb-4 px-4 py-2 bg-orange-200 text-orange-800 rounded-lg hover:bg-orange-300 font-semibold flex items-center"
        onClick={() => navigate(-1)}
      >
        &#8592; Back
      </button>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col items-center border border-orange-200">
        <h1 className="text-3xl md:text-4xl font-extrabold text-orange-700 mb-2 text-center tracking-tight drop-shadow-sm">Vendor QR Scanner</h1>
        <p className="text-orange-600 text-base md:text-lg mb-6 text-center font-medium">Scan a user's subscription QR code to validate their plan and view details.</p>
        
        {/* Scanning Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-blue-800 font-semibold mb-2 flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Scanning Tips
          </h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Hold the QR code steady and well-lit</li>
            <li>• Ensure the entire QR code is visible in the frame</li>
            <li>• Keep the camera at a distance of 10-20 cm from the QR code</li>
            <li>• Works with both subscription and order QR codes</li>
          </ul>
        </div>
        
        <button
          className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-md"
          onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
        >
          Switch Camera ({facingMode === 'environment' ? 'Back' : 'Front'})
        </button>
        <div className="w-full flex justify-center mb-6">
          <div className="w-[90vw] max-w-xs aspect-square rounded-xl overflow-hidden border-4 border-orange-200 bg-orange-50 shadow-inner flex items-center justify-center">
            <ZxingQrScanner
              onResult={handleScan}
              onError={handleError}
              facingMode={facingMode === 'environment' ? 'environment' : 'user'}
              width={300}
              height={300}
            />
          </div>
        </div>
        {loading && (
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
            <div className="text-orange-600 font-semibold">Validating QR code...</div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-center">
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
        {(subscriptionInfo || orderInfo) && !loading && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4 text-center">
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">QR Code scanned successfully!</span>
            </div>
          </div>
        )}
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
            {/* Today's Meal Section */}
            {subscriptionInfo.todaysMeals && (
              <div className="mt-6 bg-white rounded-xl shadow p-4 border border-orange-100">
                <h3 className="text-lg font-bold text-orange-700 mb-3 text-center">Today's Meal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['breakfast', 'lunch', 'dinner', 'snacks'].map(mealType => {
                    const meal = subscriptionInfo.todaysMeals[mealType];
                    return meal && meal.name ? (
                      <div key={mealType} className="flex items-center gap-3 bg-orange-50 rounded-lg p-3 border border-orange-100">
                        {meal.image && <img src={getMenuItemImageUrl(meal.image)} alt={meal.name} className="w-14 h-14 object-cover rounded-lg border border-orange-200" />}
                        <div>
                          <div className="font-semibold capitalize text-orange-800">{mealType}</div>
                          <div className="font-bold text-gray-900">{meal.name}</div>
                          <div className="text-xs text-gray-600">{meal.description}</div>
                        </div>
                      </div>
                    ) : (
                      <div key={mealType} className="flex items-center gap-3 bg-orange-50 rounded-lg p-3 border border-orange-100 opacity-60">
                        <div className="font-semibold capitalize text-orange-800">{mealType}</div>
                        <div className="text-gray-500">Not set</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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