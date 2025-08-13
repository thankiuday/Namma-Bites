import { useState, useCallback } from 'react';
import api from '../api/config';

const useUploadProgress = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  const resetUpload = useCallback(() => {
    setUploadProgress(0);
    setUploadStatus('');
    setIsUploading(false);
    setUploadError(false);
  }, []);

  const uploadWithProgress = useCallback(async (url, formData, options = {}) => {
    setIsUploading(true);
    setUploadError(false);
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');

    try {
      const response = await api.post(url, formData, {
        headers: {
          // Let the browser set the correct multipart boundary
          ...options.headers
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(progress, 95)); // Cap at 95% until complete
          
          if (progress < 30) {
            setUploadStatus('Uploading to cloud storage...');
          } else if (progress < 70) {
            setUploadStatus('Processing image...');
          } else {
            setUploadStatus('Finalizing upload...');
          }
        },
        timeout: options.timeout || 120000, // 2 minute default timeout
        ...options.axiosConfig
      });

      setUploadProgress(100);
      setUploadStatus('Upload complete!');
      
      // Reset after 3 seconds
      setTimeout(() => {
        resetUpload();
      }, 3000);

      return response;
    } catch (error) {
      setUploadError(true);
      setUploadProgress(0);
      
      if (error.code === 'ECONNABORTED') {
        setUploadStatus('Upload timeout. Please try with a smaller image.');
      } else {
        setUploadStatus('Upload failed. Please try again.');
      }
      
      // Reset error state after 5 seconds
      setTimeout(() => {
        resetUpload();
      }, 5000);
      
      throw error;
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 100);
    }
  }, [resetUpload]);

  return {
    uploadProgress,
    uploadStatus,
    isUploading,
    uploadError,
    uploadWithProgress,
    resetUpload
  };
};

export default useUploadProgress;
