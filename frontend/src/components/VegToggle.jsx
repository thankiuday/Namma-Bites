import React from 'react';
import { FaLeaf, FaDrumstickBite } from 'react-icons/fa';

const VegToggle = ({ isVegOnly, onToggle, className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="bg-white rounded-full shadow-lg border-2 border-orange-200 p-1">
        <div className="flex items-center">
          {/* Veg Button */}
          <button
            onClick={() => onToggle(true)}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-full transition-all duration-300 font-medium text-xs sm:text-sm md:text-base min-h-[36px] sm:min-h-[44px] ${
              isVegOnly
                ? 'bg-green-500 text-white shadow-md transform scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
            }`}
          >
            <FaLeaf className="text-xs sm:text-sm md:text-base flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Veg</span>
            <span className="sm:hidden whitespace-nowrap">V</span>
          </button>
          
          {/* Non-Veg Button */}
          <button
            onClick={() => onToggle(false)}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-full transition-all duration-300 font-medium text-xs sm:text-sm md:text-base min-h-[36px] sm:min-h-[44px] ${
              !isVegOnly
                ? 'bg-red-500 text-white shadow-md transform scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            <FaDrumstickBite className="text-xs sm:text-sm md:text-base flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Non-Veg</span>
            <span className="sm:hidden whitespace-nowrap">NV</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VegToggle;
