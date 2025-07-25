import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Html5QrcodeScannerComponent = ({ fps = 10, qrbox = 250, disableFlip = false, qrCodeSuccessCallback, qrCodeErrorCallback }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    const config = { fps, qrbox, disableFlip };
    const verbose = false;
    const scanner = new Html5QrcodeScanner(scannerRef.current.id, config, verbose);

    scanner.render(qrCodeSuccessCallback, qrCodeErrorCallback);

    return () => {
      scanner.clear().catch(() => {});
    };
    // eslint-disable-next-line
  }, []);

  return <div id="html5qr-code-full-region" ref={scannerRef} />;
};

export default Html5QrcodeScannerComponent; 