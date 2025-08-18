import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaStore, FaLeaf, FaDrumstickBite, FaExclamationTriangle } from 'react-icons/fa';
import AnimatedCard from './AnimatedCard';
import { motion } from 'framer-motion';
import { getMenuItemImageUrl } from '../utils/imageUtils';
import { useCart } from '../context/CartContext';

const FoodCard = ({ food }) => {
  const navigate = useNavigate();
  const { cart } = useCart();

  const handleClick = () => {
    navigate(`/food/${food._id}`);
  };

  // Check if this item is from a different vendor than what's in the cart
  const isDifferentVendor = cart.length > 0 && 
    cart[0].vendor?._id !== food.vendor?._id && 
    cart[0].vendor !== food.vendor;

  // --- Logic for Badge Styling ---
  const isVeg = food.category?.toLowerCase() === 'veg';

  const categoryBadge = {
    icon: isVeg ? FaLeaf : FaDrumstickBite,
    label: isVeg ? 'Veg' : 'Non-Veg',
    style: isVeg 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200',
  };
  const CategoryIcon = categoryBadge.icon;

  const availabilityBadge = {
    icon: food.isAvailable ? FaCheckCircle : FaTimesCircle,
    label: food.isAvailable ? 'Available' : 'Unavailable',
    style: food.isAvailable 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const AvailabilityIcon = availabilityBadge.icon;
  // --- End of logic ---

  return (
    <AnimatedCard 
      className="group h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl" 
      onClick={handleClick}
    >
      {/* Food Image */}
      <div className="relative h-40 sm:h-44 w-full overflow-hidden">
        <motion.img
          src={getMenuItemImageUrl(food.image)}
          alt={food.name}
          className="h-full w-full object-cover duration-500 ease-in-out group-hover:scale-110"
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        />

        {/* Availability Badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold ${availabilityBadge.style}`}>
          <AvailabilityIcon />
          <span className="hidden sm:inline">{availabilityBadge.label}</span>
        </div>

        {/* Veg/Non-Veg Badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold ${categoryBadge.style}`}>
          <CategoryIcon />
          <span className="hidden sm:inline">{categoryBadge.label}</span>
        </div>

        {/* Different Vendor Warning Overlay */}
        {isDifferentVendor && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-xl">
            <div className="bg-orange-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold">
              <FaExclamationTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Different Vendor</span>
              <span className="sm:hidden">Diff Vendor</span>
            </div>
          </div>
        )}
      </div>

      {/* Food Details */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-lg font-bold text-gray-800 line-clamp-2 leading-tight break-words">{food.name}</h3>
            {/* Vendor Info */}
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <FaStore className={`${isDifferentVendor ? 'text-red-500' : 'text-orange-500'}`} />
              <span className={`truncate ${isDifferentVendor ? 'text-red-600 font-semibold' : ''}`}>
                {food.vendor?.name || 'Unknown Vendor'}
                {isDifferentVendor && <span className="ml-1 text-red-500">⚠️</span>}
              </span>
            </p>
          </div>
          <span className="ml-2 flex-shrink-0 text-sm sm:text-lg font-extrabold text-orange-600">₹{food.price}</span>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default FoodCard;