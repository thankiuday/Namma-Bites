import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaTag, FaLeaf, FaDrumstickBite } from 'react-icons/fa';

const FoodCard = ({ food }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/food/${food.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
      onClick={handleClick}
    >
      {/* Food Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={food.image ? `http://localhost:5000${food.image}` : '/default-food.png'}
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
        {/* Veg/Non-Veg Badge */}
        <div className="absolute top-2 left-2">
          {food.category === 'veg' ? (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
              <FaLeaf /> Veg
            </div>
          ) : (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
              <FaDrumstickBite /> Non-Veg
            </div>
          )}
        </div>
      </div>

      {/* Food Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{food.name}</h3>
          <span className="text-lg font-bold text-orange-600">₹{food.price}</span>
        </div>
        
        {/* Vendor Badge */}
        <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <FaTag className="text-orange-600" /> {food.vendor?.name || 'Unknown Vendor'}
        </div>
        {/* Category Info (less prominent) */}
        {/* <div className="mt-1 text-xs text-gray-500 font-semibold">
          {food.category}
        </div> */}
      </div>
    </div>
  );
};

export default FoodCard; 