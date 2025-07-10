import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const VendorQrScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
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
      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/vendor/scan-qr`,
          { qrData: data },
          { withCredentials: true }
        );
        console.log('Backend response:', res.data);
        setSubscriptionInfo(res.data.subscription);
      } catch (err) {
        console.error('Error from backend:', err);
        setError(err.response?.data?.message || 'Failed to validate QR code');
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
              <div><span className="font-semibold">Start Date:</span> {new Date(subscriptionInfo.startDate).toLocaleDateString()}</div>
              <div><span className="font-semibold">Duration:</span> {subscriptionInfo.duration} days</div>
              <div><span className="font-semibold">Payment Status:</span> <span className={`font-bold ${subscriptionInfo.paymentStatus === 'approved' ? 'text-green-700' : subscriptionInfo.paymentStatus === 'pending' ? 'text-orange-700' : subscriptionInfo.paymentStatus === 'expired' ? 'text-gray-700' : 'text-red-700'}`}>{subscriptionInfo.paymentStatus}</span></div>
              {subscriptionInfo.paymentProof && (
                <a href={`http://localhost:5000${subscriptionInfo.paymentProof}`} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 underline">View Payment Proof</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorQrScanner; 