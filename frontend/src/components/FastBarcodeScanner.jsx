import React, { useEffect, useRef } from 'react';

// High-performance QR scanner using the native BarcodeDetector when available
// Falls back to throwing if unsupported (caller should render an alternative)
const FastBarcodeScanner = ({ onResult, onError, width = 640, height = 640 }) => {
  const videoRef = useRef(null);
  const rafRef = useRef(0);
  const detectorRef = useRef(null);
  const streamRef = useRef(null);
  const lastTextRef = useRef('');
  const lastTickRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const setup = async () => {
      try {
        if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
          throw new Error('BarcodeDetector not supported');
        }
        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.play();

        const tick = async (ts) => {
          if (!isMounted) return;
          // Throttle detection to ~12 fps
          if (ts - lastTickRef.current >= 80) {
            lastTickRef.current = ts;
            try {
              const codes = await detectorRef.current.detect(video);
              if (codes && codes.length > 0) {
                const text = codes[0].rawValue || codes[0].displayValue || '';
                if (text && text !== lastTextRef.current) {
                  lastTextRef.current = text;
                  onResult && onResult(text);
                }
              }
            } catch (e) {
              // Ignore transient frames where detector fails
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        try { onError && onError(err); } catch (_) {}
      }
    };
    setup();
    return () => {
      isMounted = false;
      cancelAnimationFrame(rafRef.current);
      const v = videoRef.current;
      if (v) try { v.pause(); } catch (_) {}
      const s = streamRef.current;
      if (s) try { s.getTracks().forEach(t => { try { t.stop(); } catch (_) {} }); } catch (_) {}
    };
  }, [onResult, onError]);

  return (
    <video
      ref={videoRef}
      muted
      autoPlay
      playsInline
      style={{ width: `${width}px`, height: `${height}px`, objectFit: 'cover' }}
    />
  );
};

export default FastBarcodeScanner;


