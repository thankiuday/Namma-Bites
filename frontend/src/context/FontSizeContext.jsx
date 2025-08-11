import React, { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};

export const FontSizeProvider = ({ children }) => {
  // Font size scale: 0 = smallest, 2 = default, 4 = largest
  const [fontSize, setFontSize] = useState(2);
  
  // Font size options
  const fontSizes = [
    { value: 0, label: 'Extra Small', scale: 0.75 },
    { value: 1, label: 'Small', scale: 0.875 },
    { value: 2, label: 'Normal', scale: 1 },
    { value: 3, label: 'Large', scale: 1.125 },
    { value: 4, label: 'Extra Large', scale: 1.25 }
  ];

  // Load font size from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('namma-bites-font-size');
    if (savedFontSize !== null) {
      setFontSize(parseInt(savedFontSize));
    }
  }, []);

  // Save font size to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('namma-bites-font-size', fontSize.toString());
    
    // Apply font size to document root
    const scale = fontSizes[fontSize]?.scale || 1;
    document.documentElement.style.setProperty('--font-scale', scale);
    
    // Add data attribute for debugging
    document.body.setAttribute('data-font-scale', scale);
    
    // Debug logging
    console.log('Font size changed:', {
      fontSize,
      scale,
      label: fontSizes[fontSize]?.label,
      cssVariable: getComputedStyle(document.documentElement).getPropertyValue('--font-scale')
    });
  }, [fontSize, fontSizes]);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 1, fontSizes.length - 1));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 1, 0));
  };

  const resetFontSize = () => {
    setFontSize(2); // Reset to normal
  };

  const getCurrentFontSize = () => {
    return fontSizes[fontSize];
  };

  const getFontSizeClass = () => {
    const scale = fontSizes[fontSize]?.scale || 1;
    if (scale <= 0.75) return 'text-xs';
    if (scale <= 0.875) return 'text-sm';
    if (scale <= 1) return 'text-base';
    if (scale <= 1.125) return 'text-lg';
    return 'text-xl';
  };

  const value = {
    fontSize,
    setFontSize,
    fontSizes,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    getCurrentFontSize,
    getFontSizeClass,
    fontScale: fontSizes[fontSize]?.scale || 1
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
};

export default FontSizeContext;
