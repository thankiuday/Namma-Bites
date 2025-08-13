import React, { useEffect, useRef, useCallback, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';

const ZxingQrScanner = ({ onResult, onError, facingMode = 'environment', width = 300, height = 300 }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const lastResultRef = useRef('');
  const scanTimeoutRef = useRef(null);
  const [deviceId, setDeviceId] = useState(undefined);

  // Ensure any active video tracks are stopped and the element is released
  const stopVideo = useCallback(() => {
    try {
      const videoEl = videoRef.current;
      if (videoEl) {
        const mediaStream = videoEl.srcObject;
        if (mediaStream && typeof mediaStream.getTracks === 'function') {
          mediaStream.getTracks().forEach((track) => {
            try { track.stop(); } catch (_) {}
          });
        }
        videoEl.srcObject = null;
        try { videoEl.pause && videoEl.pause(); } catch (_) {}
        try { videoEl.load && videoEl.load(); } catch (_) {}
      }
    } catch (_) {}
  }, []);

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
    // Configure decoder hints for better reliability on mobile
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const codeReader = new BrowserMultiFormatReader(hints);
    codeReaderRef.current = codeReader;
    let isMounted = true;

    // Defensive: stop any prior stream that could still be attached
    stopVideo();

    // Ensure mobile Safari/iOS inline playback works
    try {
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.setAttribute('playsinline', 'true');
        videoEl.setAttribute('webkit-playsinline', 'true');
        videoEl.setAttribute('muted', 'true');
        videoEl.setAttribute('autoplay', 'true');
      }
    } catch (_) {}

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

    const applyAdvancedConstraints = async () => {
      try {
        const videoEl = videoRef.current;
        const stream = videoEl && videoEl.srcObject;
        const track = stream && stream.getVideoTracks && stream.getVideoTracks()[0];
        if (!track) return;
        const capabilities = typeof track.getCapabilities === 'function' ? track.getCapabilities() : {};
        const advanced = {};
        if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
          advanced.focusMode = 'continuous';
        }
        if (capabilities.exposureMode && capabilities.exposureMode.includes('continuous')) {
          advanced.exposureMode = 'continuous';
        }
        if (capabilities.whiteBalanceMode && capabilities.whiteBalanceMode.includes('continuous')) {
          advanced.whiteBalanceMode = 'continuous';
        }
        if (capabilities.frameRate) {
          advanced.frameRate = Math.min(30, capabilities.frameRate.max || 30);
        }
        if (Object.keys(advanced).length > 0 && typeof track.applyConstraints === 'function') {
          await track.applyConstraints({ advanced: [advanced] });
        }
      } catch (_) {}
    };

    const startScanning = async () => {
      try {
        const ua = (navigator.userAgent || '').toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(ua);
        const desiredFacing = facingMode === 'user' ? 'user' : 'environment';
        const commonConstraints = {
          video: {
            facingMode: { ideal: desiredFacing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 1.7777777778 }
          }
        };
        // Prefer deviceId selection when available
        const selectedId = isIOS ? undefined : await pickDeviceIdForFacing(desiredFacing);
        setDeviceId(selectedId);
        if (!isIOS && selectedId) {
          try {
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
            // Try to improve focus/exposure after stream starts
            setTimeout(applyAdvancedConstraints, 250);
            return;
          } catch (_) {
            // fall through to constraints fallback
          }
        }
        {
          // Fallback to facingMode constraints
          const constraints = commonConstraints;
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
          setTimeout(applyAdvancedConstraints, 250);
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
      stopVideo();
    };
  }, [facingMode, debouncedOnResult, onError, stopVideo]);

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
      autoPlay
    />
  );
};

export default ZxingQrScanner; 