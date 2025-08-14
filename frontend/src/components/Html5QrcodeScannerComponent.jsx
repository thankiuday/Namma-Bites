import React, { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

// Minimal, mobile-first scanner using back camera only.
const Html5QrcodeScannerComponent = ({ fps = 20, qrbox = 250, qrCodeSuccessCallback, qrCodeErrorCallback }) => {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (!containerRef.current) return;
      try {
        const html5qrcode = new Html5Qrcode(containerRef.current.id, { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] });
        instanceRef.current = html5qrcode;
        // Try to select the back camera explicitly when possible
        let constraints = { facingMode: { ideal: 'environment' } };
        try {
          const cameras = await Html5Qrcode.getCameras();
          if (Array.isArray(cameras) && cameras.length > 0) {
            const pickBack = (label) => /back|rear|environment/i.test(label || '');
            const back = cameras.find((c) => pickBack(c.label)) || cameras[0];
            if (back?.id) {
              constraints = { deviceId: { exact: back.id } };
            }
          }
        } catch (_) {
          // Fallback to facingMode when camera enumeration not available
        }
        const config = {
          fps,
          qrbox,
          // Use experimental barcode detector if present
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        };
        await html5qrcode.start(constraints, config, (txt) => {
          if (!isMounted) return;
          try { qrCodeSuccessCallback && qrCodeSuccessCallback(txt); } catch (_) {}
        }, (err) => {
          const msg = String(err || '');
          if (msg.includes('NotFound') || msg.includes('No MultiFormat Readers') || msg.includes('parse')) return;
          try { qrCodeErrorCallback && qrCodeErrorCallback(msg); } catch (_) {}
        });
      } catch (err) {
        try { qrCodeErrorCallback && qrCodeErrorCallback(err?.message || String(err)); } catch (_) {}
      }
    };
    init();
    return () => {
      isMounted = false;
      const inst = instanceRef.current;
      instanceRef.current = null;
      if (inst) {
        try { inst.stop().catch(() => {}); } catch (_) {}
        try { inst.clear().catch(() => {}); } catch (_) {}
      }
    };
  }, [fps, qrbox, qrCodeSuccessCallback, qrCodeErrorCallback]);

  return (
    <div id="html5qr-reader" ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default Html5QrcodeScannerComponent;