import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const ZxingQrScanner = ({ onResult, onError, facingMode = 'environment', width = 300, height = 300 }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;
    let isMounted = true;

    const constraints = {
      video: { facingMode }
    };

    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (!isMounted) return;
      if (result) {
        onResult(result.getText());
      } else if (err && onError) {
        onError(err);
      }
    }, constraints);

    return () => {
      isMounted = false;
      if (codeReader.stopContinuousDecode) {
        codeReader.stopContinuousDecode();
      }
    };
    // eslint-disable-next-line
  }, [facingMode]);

  return (
    <video ref={videoRef} width={width} height={height} style={{ borderRadius: 16, border: '4px solid #fdba74', background: '#fff' }} />
  );
};

export default ZxingQrScanner; 