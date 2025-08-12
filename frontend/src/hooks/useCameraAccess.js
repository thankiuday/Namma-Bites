import { useCallback, useEffect, useRef, useState } from 'react';

// Camera permission states: 'unknown' | 'granted' | 'prompt' | 'denied' | 'unsupported'
export function useCameraAccess() {
  const [state, setState] = useState('unknown');
  const [error, setError] = useState('');
  const lastStreamRef = useRef(null);

  const stopStream = useCallback(() => {
    if (lastStreamRef.current) {
      try {
        lastStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (_) {}
      lastStreamRef.current = null;
    }
  }, []);

  const checkPermission = useCallback(async () => {
    if (typeof navigator === 'undefined') {
      setState('unsupported');
      return 'unsupported';
    }
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setState('unsupported');
        return 'unsupported';
      }
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const status = await navigator.permissions.query({ name: 'camera' });
          if (status && status.state) {
            setState(status.state); // 'granted' | 'prompt' | 'denied'
            return status.state;
          }
        } catch (_) {
          // Some browsers (iOS Safari) may not support querying camera
        }
      }
      // Fallback: cannot query -> assume prompt
      setState('prompt');
      return 'prompt';
    } catch (_) {
      setState('unsupported');
      return 'unsupported';
    }
  }, []);

  const requestAccess = useCallback(async (constraints = { video: true }) => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported');
      setError('Camera API not supported in this browser.');
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      lastStreamRef.current = stream;
      setState('granted');
      stopStream();
      return true;
    } catch (err) {
      const message = err?.message || String(err);
      setError(message);
      if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
        setState('denied');
      } else if (err && err.name === 'NotFoundError') {
        setState('denied');
        setError('No camera found on this device.');
      } else {
        // Could still be prompt on some platforms
        setState('prompt');
      }
      return false;
    }
  }, [stopStream]);

  useEffect(() => {
    // Initial check
    checkPermission();
    return () => stopStream();
  }, [checkPermission, stopStream]);

  return { state, error, checkPermission, requestAccess };
}


