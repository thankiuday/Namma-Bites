import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug = () => {
  const { user, refreshToken } = useAuth();
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Listen for token refresh events
    const handleRefresh = () => {
      setLastRefresh(new Date().toLocaleTimeString());
      setRefreshCount(prev => prev + 1);
    };

    // Add a custom event listener for token refresh
    window.addEventListener('tokenRefreshed', handleRefresh);
    
    return () => {
      window.removeEventListener('tokenRefreshed', handleRefresh);
    };
  }, []);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>User: {user ? 'Logged in' : 'Not logged in'}</div>
        <div>Refresh Token: {localStorage.getItem('refreshToken') ? 'Present' : 'Missing'}</div>
        <div>Remember Me: {localStorage.getItem('rememberMe') || 'Not set'}</div>
        <div>User Data: {localStorage.getItem('user') ? 'Stored' : 'Not stored'}</div>
        <div>Last Refresh: {lastRefresh || 'Never'}</div>
        <div>Refresh Count: {refreshCount}</div>
        <button
          onClick={async () => {
            console.log('Manual token refresh...');
            setRefreshing(true);
            try {
              const success = await refreshToken();
              if (success) {
                window.dispatchEvent(new Event('tokenRefreshed'));
              }
            } finally {
              setRefreshing(false);
            }
          }}
          className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Manual Refresh'}
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;
