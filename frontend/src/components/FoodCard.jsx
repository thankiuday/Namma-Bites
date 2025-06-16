import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaTag } from 'react-icons/fa';

const FoodCard = ({ food }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105">
      {/* Food Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        {/* Availability Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
          food.isAvailable 
            ? 'bg-green-300 text-black font-bold' 
            : 'bg-red-300 text-black font-bold'
        }`}>
          {food.isAvailable ? (
            <>
              <FaCheckCircle className="text-green-600" /> Available
            </>
          ) : (
            <>
              <FaTimesCircle className="text-red-600" /> Not Available
            </>
          )}
        </div>
      </div>

      {/* Food Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{food.name}</h3>
          <span className="text-lg font-bold text-orange-600">₹{food.price}</span>
        </div>
        
        {/* Category Badge */}
        <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <FaTag className="text-orange-600" /> {food.category}
        </div>
      </div>
    </div>
  );
};

export default FoodCard; 