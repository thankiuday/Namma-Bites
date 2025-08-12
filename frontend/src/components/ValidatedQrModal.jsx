import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { getUserSubscriptionQr } from '../api/userApi';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '').replace(/\/api$/, '');

const ValidatedQrModal = ({ subscriptionId, onClose }) => {
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (!subscriptionId) return;
    setLoading(true);
    // Fetch QR code data
    getUserSubscriptionQr(subscriptionId)
      .then(res => {
        setQrData(res.data.qrData);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load QR code');
        setLoading(false);
      });
    // Fetch latest subscription data for validated state
    axios.get(`${API_BASE_URL}/api/users/subscriptions`, { withCredentials: true })
      .then(res => {
        console.log('subscriptionId:', subscriptionId);
        console.log('subs:', res.data.data);
        const sub = res.data.data.find(s => String(s._id) === String(subscriptionId));
        console.log('found sub:', sub);
        setValidated(sub?.validated || false);
      })
      .catch(() => setValidated(false));
  }, [subscriptionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-orange-600 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-orange-800 mb-4 text-center">Validated QR Code</h2>
        {loading ? (
          <div className="text-center text-orange-600">Loading QR code...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <QRCode value={qrData} size={180} />
            <div className={`mt-2 px-4 py-2 rounded-lg text-lg font-semibold ${validated ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {validated ? 'Validated' : 'Not Validated'}
            </div>
            <p className="text-gray-600 text-sm text-center">Show this QR code to the vendor to validate your subscription when collecting your meal.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidatedQrModal; 