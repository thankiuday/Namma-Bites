import React from 'react';
import { FaUpload, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const UploadProgress = ({ 
  progress = 0, 
  status = '', 
  isVisible = false, 
  error = false,
  className = '' 
}) => {
  if (!isVisible) return null;

  return (
    <div className={`bg-white border border-orange-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        {error ? (
          <FaTimesCircle className="text-red-500 w-5 h-5" />
        ) : progress === 100 ? (
          <FaCheckCircle className="text-green-500 w-5 h-5" />
        ) : (
          <FaUpload className="text-orange-500 w-5 h-5 animate-pulse" />
        )}
        <span className={`text-sm font-medium ${
          error ? 'text-red-700' : progress === 100 ? 'text-green-700' : 'text-orange-700'
        }`}>
          {status || (error ? 'Upload failed' : progress === 100 ? 'Upload complete!' : 'Uploading...')}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            error ? 'bg-red-500' : progress === 100 ? 'bg-green-500' : 'bg-orange-500'
          }`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
      
      <div className="mt-1 text-right">
        <span className={`text-xs ${
          error ? 'text-red-600' : progress === 100 ? 'text-green-600' : 'text-orange-600'
        }`}>
          {progress}%
        </span>
      </div>
    </div>
  );
};

export default UploadProgress;
