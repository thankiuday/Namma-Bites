import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaTag, FaLeaf, FaDrumstickBite } from 'react-icons/fa';
import AnimatedCard from './AnimatedCard';
import { motion } from 'framer-motion';

const FoodCard = ({ food }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/food/${food._id}`);
  };

  return (
    <AnimatedCard 
      className="overflow-hidden cursor-pointer h-full flex flex-col w-full sm:min-w-[250px] sm:max-w-[320px] border border-gray-200 shadow-lg rounded-xl bg-white m-1 sm:m-2 p-1 sm:p-2 transition-transform duration-200 hover:scale-105" 
      onClick={handleClick}
    >
      {/* Food Image */}
      <div className="relative h-32 sm:h-40 md:h-48 w-full overflow-hidden group rounded-t-xl">
        <motion.img
          src={food.image ? `http://localhost:5000${food.image}` : '/default-food.png'}
          alt={food.name}
          className="w-full h-full object-cover transition-transform duration-300 rounded-t-xl"
          whileHover={{ scale: 1.10 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />
        {/* Availability Badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs md:text-sm font-medium flex items-center gap-1 ${
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
            <div className="bg-green-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 text-xs md:text-sm">
              <FaLeaf /> Veg
            </div>
          ) : (
            <div className="bg-red-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 text-xs md:text-sm">
              <FaDrumstickBite /> Non-Veg
            </div>
          )}
        </div>
      </div>

      {/* Food Details */}
      <div className="p-2 md:p-4 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-1 md:mb-2">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">{food.name}</h3>
          <span className="text-base md:text-lg font-bold text-orange-600">₹{food.price}</span>
        </div>
        
        {/* Vendor Badge */}
        <div className="inline-block bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs md:text-sm font-medium flex items-center gap-1">
          <FaTag className="text-orange-600" /> {food.vendor?.name || 'Unknown Vendor'}
        </div>
      </div>
    </AnimatedCard>
  );
};

export default FoodCard; 