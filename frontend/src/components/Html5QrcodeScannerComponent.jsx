import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const Html5QrcodeScannerComponent = ({ fps = 10, qrbox = 250, disableFlip = false, qrCodeSuccessCallback, qrCodeErrorCallback, facingMode = 'environment' }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    try {
      const config = {
        fps,
        qrbox,
        disableFlip,
        aspectRatio: 1.3333,
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        // Prefer facingMode when provided
        videoConstraints: facingMode === 'user' ? { facingMode: 'user' } : { facingMode: { ideal: 'environment' } }
      };
      const verbose = false;
      const scanner = new Html5QrcodeScanner(scannerRef.current.id, config, verbose);

      scanner.render(qrCodeSuccessCallback, qrCodeErrorCallback);

      return () => {
        scanner.clear().catch(() => {});
      };
    } catch (err) {
      try { qrCodeErrorCallback && qrCodeErrorCallback(err?.message || String(err)); } catch (_) {}
    }
    // eslint-disable-next-line
  }, []);

  return <div id="html5qr-code-full-region" ref={scannerRef} style={{ width: '100%', height: '100%' }} />;
};

export default Html5QrcodeScannerComponent; 