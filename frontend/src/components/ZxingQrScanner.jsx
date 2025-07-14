import React, { useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const ZxingQrScanner = ({ onResult, onError, facingMode = 'environment', width = 300, height = 300 }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const lastResultRef = useRef('');
  const scanTimeoutRef = useRef(null);

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

    // Optimized camera constraints for better performance
    const constraints = {
      video: { 
        facingMode,
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 }
      }
    };

    const startScanning = async () => {
      try {
        await codeReader.decodeFromVideoDevice(
          null, 
          videoRef.current, 
          (result, err) => {
            if (!isMounted) return;
            
            if (result) {
              debouncedOnResult(result.getText());
            } else if (err && onError) {
              // Only show non-common errors
              if (err.name !== 'NotFoundException' && 
                  !err.message?.includes('No MultiFormat Readers')) {
                onError(err);
              }
            }
          }, 
          constraints
        );
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
      if (codeReader.stopContinuousDecode) {
        codeReader.stopContinuousDecode();
      }
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
    />
  );
};

export default ZxingQrScanner; 