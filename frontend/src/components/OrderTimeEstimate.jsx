import React, { useState, useEffect, useCallback } from 'react';
import userApi from '../api/userApi';
import { io } from 'socket.io-client';

const OrderTimeEstimate = ({ orderId, onError, vendorId }) => {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  const fetchEstimate = useCallback(async () => {
    try {
      const response = await userApi.get(`/orders/${orderId}/estimate`);
      if (response.data.success) {
        setEstimate(response.data.data);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch estimate';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [orderId, onError]);

  // Socket.io connection setup
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      // Join vendor-specific room for order updates
      newSocket.emit('join-vendor-room', vendorId);
    });

    // Listen for order status changes
    newSocket.on('order-status-changed', async (data) => {
      if (data.vendorId === vendorId) {
        // Refetch estimates when any order status changes for this vendor
        await fetchEstimate();
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('order-status-changed');
      newSocket.disconnect();
    };
  }, [vendorId, fetchEstimate]);

  // Regular polling as backup
  useEffect(() => {
    fetchEstimate();
    const interval = setInterval(fetchEstimate, 60000); // Fallback polling every minute
    return () => clearInterval(interval);
  }, [fetchEstimate]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!estimate) return null;

  const getStatusColor = (state) => {
    switch (state) {
      case 'pending': return 'text-yellow-600';
      case 'preparing': return 'text-blue-600';
      case 'ready': return 'text-green-600';
      case 'completed': return 'text-green-700';
      case 'rejected': return 'text-red-600';
      default: return 'text-black';
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const calculateProgress = () => {
    if (!estimate.stateTimestamps.preparing) return 0;
    const start = new Date(estimate.stateTimestamps.preparing);
    const now = new Date();
    const elapsed = (now - start) / (1000 * 60); // in minutes
    return Math.min(100, (elapsed / estimate.estimatedTime) * 100);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Order Status</h3>
        <span className={`font-medium ${getStatusColor(estimate.state)} capitalize`}>
          {estimate.state}
        </span>
      </div>

      {estimate.queuePosition && (
        <div className="mb-3">
          <span className="text-green-600">Queue Position: </span>
          <span className="font-semibold text-black font-bold">{estimate.queuePosition}</span>
        </div>
      )}

      <div className="mb-3">
        <span className="text-green-600">Estimated Time: </span>
        <span className="font-semibold text-black font-bold">{formatTime(estimate.estimatedTime)}</span>
      </div>

      {estimate.actualTime && (
        <div className="mb-3">
          <span className="text-green-600">Actual Preparation Time: </span>
          <span className="font-semibold text-black font-bold">
            {formatTime(estimate.actualTime)}
            {estimate.estimatedTime && (
              <span className={`ml-2 text-sm ${
                estimate.actualTime <= estimate.estimatedTime ? 'text-green-600' : 'text-orange-600'
              }`}>
                ({estimate.actualTime <= estimate.estimatedTime ? 'On time' : `${estimate.actualTime - estimate.estimatedTime}min longer than estimated`})
              </span>
            )}
          </span>
        </div>
      )}

      {estimate.state === 'preparing' && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-500 mt-1 text-right">
            {Math.round(calculateProgress())}% Complete
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeEstimate;
