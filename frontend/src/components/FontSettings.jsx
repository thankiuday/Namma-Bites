import React, { useState } from 'react';
import { FaCog, FaFont, FaPlus, FaMinus, FaUndo, FaTimes } from 'react-icons/fa';
import { useFontSize } from '../context/FontSizeContext';

const FontSettings = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    fontSize, 
    setFontSize, 
    fontSizes, 
    increaseFontSize, 
    decreaseFontSize, 
    resetFontSize, 
    getCurrentFontSize 
  } = useFontSize();

  const currentFont = getCurrentFontSize();

  return (
    <div className={`relative ${className}`}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm border border-gray-200"
        title="Font Settings"
      >
        <FaCog className="w-4 h-4" />
        <FaFont className="w-4 h-4" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 min-w-[350px] max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FaFont className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Font Settings</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Current Font Size Display */}
            <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Current Size:</p>
              <p className="text-lg font-bold text-orange-700">{currentFont.label}</p>
              <p className="text-sm text-gray-600">Scale: {(currentFont.scale * 100).toFixed(0)}%</p>
            </div>

            {/* Quick Controls */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Quick Adjust:</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSize === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaMinus className="w-3 h-3" />
                  Smaller
                </button>
                
                <button
                  onClick={increaseFontSize}
                  disabled={fontSize === fontSizes.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPlus className="w-3 h-3" />
                  Larger
                </button>
                
                <button
                  onClick={resetFontSize}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  <FaUndo className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>

            {/* Font Size Options */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Choose Size:</p>
              <div className="grid grid-cols-1 gap-2">
                {fontSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setFontSize(size.value)}
                    className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                      fontSize === size.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-25'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{size.label}</span>
                      <span className="text-sm text-gray-500">{(size.scale * 100).toFixed(0)}%</span>
                    </div>
                    <div 
                      className="mt-1 text-gray-600"
                      style={{ fontSize: `${size.scale}rem` }}
                    >
                      Sample text at this size
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Text */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
              <div 
                className="text-gray-900"
                style={{ fontSize: `${currentFont.scale}rem` }}
              >
                <p className="font-bold mb-2">Welcome to Namma Bites!</p>
                <p>This is how text will appear with your selected font size. You can adjust it anytime from the settings.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Font settings are saved automatically and persist across sessions.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FontSettings;
