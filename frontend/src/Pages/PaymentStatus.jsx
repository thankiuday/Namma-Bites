import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { uploadPaymentProof, getUserSubscriptions } from '../api/userApi';
import { getVendorImageUrl } from '../utils/imageUtils';
import UploadProgress from '../components/UploadProgress';
import useUploadProgress from '../hooks/useUploadProgress';
import { validateImageFile } from '../utils/validation';
import { API_URL } from '../api/config';

const PaymentStatus = () => {
  const { subscriptionId } = useParams();
  // Mocked status: 'un-paid', 'pending', 'approved', 'rejected'
  const [status, setStatus] = useState('un-paid');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [scannerUrl, setScannerUrl] = useState('');
  const { 
    uploadProgress, 
    uploadStatus, 
    isUploading, 
    uploadError, 
    uploadWithProgress 
  } = useUploadProgress();

  useEffect(() => {
    async function fetchSubscription() {
      const res = await getUserSubscriptions();
      if (res.data && res.data.data) {
        const sub = res.data.data.find(s => s._id === subscriptionId);
        setSubscription(sub);
        if (sub && sub.vendor && sub.vendor.scanner) {
          setScannerUrl(getVendorImageUrl(sub.vendor.scanner));
        }
      }
    }
    fetchSubscription();
  }, [subscriptionId]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setError('');
    if (f) {
      const check = validateImageFile(f, { maxMB: 8 });
      if (!check.ok) {
        setFile(null);
        setError(check.message);
        return;
      }
      setFile(f);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a payment proof image (JPG/PNG/WEBP up to 8MB).');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('paymentProof', file);
      await uploadWithProgress(
        `${API_URL}/users/subscriptions/${subscriptionId}/payment-proof`, 
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          axiosConfig: { withCredentials: true }
        }
      );
      setStatus('pending');
    } catch (err) {
      setError('Failed to upload payment proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const statusDisplay = {
    'un-paid': { icon: <FaTimesCircle className="text-red-500 mr-2" />, text: 'Un-paid', color: 'text-red-600' },
    'pending': { icon: <FaHourglassHalf className="text-orange-500 mr-2 animate-pulse" />, text: 'Pending Approval', color: 'text-orange-600' },
    'approved': { icon: <FaCheckCircle className="text-green-500 mr-2" />, text: 'Approved', color: 'text-green-600' },
    'rejected': { icon: <FaTimesCircle className="text-red-500 mr-2" />, text: 'Rejected', color: 'text-red-600' },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white p-2 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-orange-100 p-4 sm:p-8 flex flex-col gap-6">
        <Link to="/subscription" className="text-orange-600 font-semibold flex items-center mb-2 hover:underline w-fit"><FaArrowLeft className="mr-2" />Back to Subscription Page</Link>
        <h2 className="text-2xl sm:text-3xl font-bold text-orange-800 mb-2 flex items-center">Payment Status</h2>
        <div className="flex items-center mb-2">
          {statusDisplay[status].icon}
          <span className={`font-bold text-lg ${statusDisplay[status].color}`}>{statusDisplay[status].text}</span>
        </div>
        {scannerUrl && (
          <div className="flex flex-col items-center mb-4">
            <div className="font-semibold text-orange-700 mb-2">Scan to Pay Vendor (Google Pay)</div>
            <img src={scannerUrl} alt="Vendor Google Pay Scanner" className="w-48 h-48 object-contain rounded-lg border-2 border-orange-200 bg-white shadow" />
          </div>
        )}
        {status === 'un-paid' && (
          <>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 mb-2 text-orange-700 font-medium">
              Please pay and wait for the vendor approval. Upload your payment proof below.
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="block text-orange-700 font-semibold mb-1">Upload Payment Proof (screenshot)</label>
              <p className="text-xs text-orange-500 mb-1">Accepted: JPG, PNG, WEBP (max 8MB). Upload a clear screenshot of your payment.</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border-2 border-orange-200 rounded-lg px-3 py-2 bg-white text-gray-800 font-medium"
                disabled={uploading}
              />
              {error && <div className="text-red-600 text-sm font-semibold mt-1">{error}</div>}
              
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
                disabled={uploading || isUploading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {(uploading || isUploading) && <FaSpinner className="w-4 h-4 animate-spin" />}
                <FaUpload className="mr-2" />
                {uploading || isUploading ? 'Uploading...' : 'Submit Payment Proof'}
              </button>
            </form>
          </>
        )}
        {status === 'pending' && (
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 text-orange-700 font-medium">
            Payment proof submitted. Please wait for the vendor to approve your payment.
          </div>
        )}
        {status === 'approved' && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-green-700 font-medium">
            Payment approved! Your subscription is now active.
          </div>
        )}
        {status === 'rejected' && (
          <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-red-700 font-medium">
            Payment was rejected. Please contact support or try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus; 