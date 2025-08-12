import React, { useEffect, useRef, useCallback, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const ZxingQrScanner = ({ onResult, onError, facingMode = 'environment', width = 300, height = 300 }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const lastResultRef = useRef('');
  const scanTimeoutRef = useRef(null);
  const [deviceId, setDeviceId] = useState(undefined);

  // Debounced result handler to prevent multiple rapid scans
  const debouncedOnResult = useCallback((result) => {
    if (result === lastResultRef.current) {
      return; // Skip duplicate results
    }
    
    lastResultRef.current = result;
    
    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    
    // Add a small delay to prevent rapid successive scans
    scanTimeoutRef.current = setTimeout(() => {
      onResult(result);
    }, 100);
  }, [onResult]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;
    let isMounted = true;

    // Helper: pick deviceId matching desired facing mode
    const pickDeviceIdForFacing = async (desiredFacing) => {
      try {
        // Try enumerate directly
        let devices = await navigator.mediaDevices.enumerateDevices();
        // If labels are empty, request temp permission to reveal labels
        if (!devices.some((d) => d.label)) {
          try {
            const tmp = await navigator.mediaDevices.getUserMedia({ video: true });
            tmp.getTracks().forEach((t) => t.stop());
            devices = await navigator.mediaDevices.enumerateDevices();
          } catch (_) {
            // ignore, we'll fallback to constraints
          }
        }
        const videos = devices.filter((d) => d.kind === 'videoinput');
        if (videos.length === 0) return undefined;
        const matchFront = (label) => /front|user|face/i.test(label);
        const matchBack = (label) => /back|rear|environment/i.test(label);
        if (desiredFacing === 'user') {
          const front = videos.find((v) => matchFront(v.label));
          return (front || videos[0]).deviceId;
        }
        const back = videos.find((v) => matchBack(v.label));
        return (back || videos[0]).deviceId;
      } catch (_) {
        return undefined;
      }
    };

    const startScanning = async () => {
      try {
        // Prefer deviceId selection when available
        const desiredFacing = facingMode === 'user' ? 'user' : 'environment';
        const selectedId = await pickDeviceIdForFacing(desiredFacing);
        setDeviceId(selectedId);
        if (selectedId) {
          await codeReader.decodeFromVideoDevice(
            selectedId,
            videoRef.current,
            (result, err) => {
              if (!isMounted) return;
              if (result) {
                debouncedOnResult(result.getText());
              } else if (err && onError) {
                if (err.name !== 'NotFoundException' && !err.message?.includes('No MultiFormat Readers')) {
                  onError(err);
                }
              }
            }
          );
        } else {
          // Fallback to facingMode constraints
          const constraints = {
            video: desiredFacing === 'user' ? { facingMode: { exact: 'user' } } : { facingMode: 'environment' }
          };
          await navigator.mediaDevices.getUserMedia({ video: constraints.video });
          await codeReader.decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (result, err) => {
              if (!isMounted) return;
              if (result) {
                debouncedOnResult(result.getText());
              } else if (err && onError) {
                if (err.name !== 'NotFoundException' && !err.message?.includes('No MultiFormat Readers')) {
                  onError(err);
                }
              }
            },
            constraints
          );
        }
      } catch (error) {
        if (isMounted && onError) {
          onError(error);
        }
      }
    };

    startScanning();

    return () => {
      isMounted = false;
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      try { codeReader.reset && codeReader.reset(); } catch (_) {}
    };
  }, [facingMode, debouncedOnResult, onError]);

  return (
    <video 
      ref={videoRef} 
      width={width} 
      height={height} 
      style={{ 
        borderRadius: 16, 
        border: '4px solid #fdba74', 
        background: '#fff',
        objectFit: 'cover'
      }} 
      playsInline
      muted
    />
  );
};

export default ZxingQrScanner; 