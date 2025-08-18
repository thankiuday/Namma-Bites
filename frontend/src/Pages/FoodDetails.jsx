import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaLeaf, FaDrumstickBite, FaMinus, FaPlus, FaShoppingCart, FaStar, FaClock, FaFire,
  FaCheckCircle, FaTimesCircle, FaArrowLeft, FaBookOpen, FaPepperHot, FaUtensils, FaExclamationTriangle
} from 'react-icons/fa';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getMenuItemImageUrl } from '../utils/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';

// --- A local Accordion component to keep the main code clean ---
const AccordionItem = ({ title, icon, children, isOpen, onToggle }) => (
  <div className="border-b border-gray-200">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-4 text-left font-semibold text-gray-800 focus:outline-none"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{title}</span>
      </div>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
        <FaPlus size={12} className="transform transition-transform" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="pb-4 text-gray-600">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// --- Main FoodDetails Component ---
const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const [cartMsg, setCartMsg] = useState('');
  const [openSection, setOpenSection] = useState('description');

  // Check if this item is from a different vendor than what's in the cart
  const isDifferentVendor = cart.length > 0 && 
    cart[0].vendor?._id !== food?.vendor?._id && 
    cart[0].vendor !== food?.vendor;

  useEffect(() => {
    // Original data fetching logic remains the same
    const fetchFood = async () => {
      try { setLoading(true); setError(''); const res = await apiClient.get(`/vendor/menu-items/${id}`); if (res.data.success) { setFood(res.data.data); if (user && res.data.data.ratings) { const found = res.data.data.ratings.find(r => r.user === user._id); setUserRating(found ? found.value : 0); } } else { setError(res.data.message || 'Failed to fetch food details'); } } catch (err) { setError('Failed to fetch food details'); } finally { setLoading(false); }
    };
    fetchFood();
  }, [id, user]);

  // --- Handlers ---
  const handleQuantityChange = (val) => {
    const newQuantity = quantity + val;
    if (newQuantity >= 1) setQuantity(newQuantity);
  };
  
  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    
    try {
      const success = await addToCart(food, quantity);
      if (success) {
        setCartMsg('Added to cart!');
        setTimeout(() => setCartMsg(''), 2000);
      }
      // If success is false, the toast warning is already shown by CartContext
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartMsg('Error adding to cart');
      setTimeout(() => setCartMsg(''), 2000);
    }
  };
  
  const handleRate = async (value) => {
    // Original rating logic remains the same
    setSubmittingRating(true); try { await apiClient.post(`/vendor/menu-items/${id}/rate`, { value }); setUserRating(value); const res = await apiClient.get(`/vendor/menu-items/${id}`); if (res.data.success) setFood(res.data.data); } catch (err) { console.error(err) } finally { setSubmittingRating(false); }
  };
  
  const handleToggleAccordion = (section) => {
    setOpenSection(openSection === section ? null : section);
  };
  
  // --- Loading/Error States ---
  if (loading || error || !food) {
    let message = 'Loading food details...';
    if (error) message = error;
    if (!food && !loading) message = 'Food not found.';
    return (
      <div className="flex h-[60vh] items-center justify-center p-4">
        <p className={`text-lg ${error ? 'text-red-500' : 'text-gray-600'}`}>{message}</p>
      </div>
    );
  }

  // --- Badge Logic ---
  const isVeg = food.category?.toLowerCase() === 'veg';
  const categoryBadge = { icon: isVeg ? FaLeaf : FaDrumstickBite, label: isVeg ? 'Veg' : 'Non-Veg', style: isVeg ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200' };
  const availabilityBadge = { icon: food.isAvailable ? FaCheckCircle : FaTimesCircle, label: food.isAvailable ? 'Available' : 'Unavailable', style: food.isAvailable ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200' };

  return (
    <div className="mx-auto max-w-6xl p-4 font-sans">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600">
        <FaArrowLeft />
        Back to Menu
      </button>

      {/* Vendor Mismatch Warning */}
      {isDifferentVendor && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-800 mb-1">
                Different Vendor Detected
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                Your cart contains items from <span className="font-medium">{cart[0].vendor?.name || 'another vendor'}</span>. 
                This item is from <span className="font-medium">{food.vendor?.name || 'a different vendor'}</span>.
                You can only order from one vendor at a time.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate('/cart')}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium underline"
                >
                  View cart
                </button>
                <span className="text-sm text-orange-600">•</span>
                <span className="text-sm text-orange-600">
                  {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* --- Image Column --- */}
        <div className="relative h-80 overflow-hidden rounded-xl md:h-[450px]">
          <img src={getMenuItemImageUrl(food.image)} alt={food.name} className="h-full w-full object-cover"/>
          <div className={`absolute top-3 left-3 flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold ${categoryBadge.style}`}>
            {React.createElement(categoryBadge.icon)}<span>{categoryBadge.label}</span>
          </div>
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold ${availabilityBadge.style}`}>
            {React.createElement(availabilityBadge.icon)}<span>{availabilityBadge.label}</span>
          </div>
        </div>

        {/* --- Details Column --- */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">{food.name}</h1>
          
          {/* Info Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5 text-sm text-gray-700"><FaStar className="text-yellow-400" /><b>{food.rating?.toFixed(1) || 'N/A'}</b> ({food.ratings?.length || 0} reviews)</div>
            {food.preparationTime && <div className="flex items-center gap-1.5 text-sm text-gray-700"><FaClock className="text-orange-500" /><span>{food.preparationTime}</span></div>}
            {food.calories && <div className="flex items-center gap-1.5 text-sm text-gray-700"><FaFire className="text-red-500" /><span>{food.calories}</span></div>}
          </div>

          {/* User Rating */}
          {user && (
            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" disabled={submittingRating} onClick={() => handleRate(star)}><FaStar className={`transition-colors ${(userRating || 0) >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'} text-2xl`}/></button>)}
            </div>
          )}
          
          <div className="my-6 border-t border-gray-200" />

          {/* --- The "Buy Box" --- */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-3xl font-bold text-orange-600">₹{food.price}</p>
              <div className="flex items-center gap-3 rounded-full bg-orange-50 p-1">
                <button onClick={() => handleQuantityChange(-1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-orange-600 shadow transition hover:bg-orange-100"><FaMinus /></button>
                <span className="w-8 text-center text-lg font-bold text-gray-900">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-orange-600 shadow transition hover:bg-orange-100"><FaPlus /></button>
              </div>
            </div>
            <motion.button 
              onClick={handleAddToCart} 
              disabled={!food.isAvailable || !!cartMsg} 
              whileTap={{ scale: 0.95 }}
              className={`w-full rounded-lg py-3 text-base font-bold text-white shadow-lg transition-colors ${
                !food.isAvailable 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : isDifferentVendor 
                    ? 'bg-orange-500 hover:bg-orange-600 border-2 border-orange-300' 
                    : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {cartMsg || (
                food.isAvailable 
                  ? (isDifferentVendor 
                      ? `Add to Cart (Will Clear Current Cart) - ₹${(food.price * quantity).toFixed(2)}`
                      : `Add to Cart - ₹${(food.price * quantity).toFixed(2)}`)
                  : 'Unavailable'
              )}
            </motion.button>
          </div>
          
          <div className="my-6 border-t border-gray-200" />
          
          {/* --- Accordion for extra details --- */}
          <div className="space-y-2">
            {food.description && <AccordionItem title="Description" icon={<FaBookOpen className="text-orange-500"/>} isOpen={openSection === 'description'} onToggle={() => handleToggleAccordion('description')}><p>{food.description}</p></AccordionItem>}
            {food.ingredients?.length > 0 && <AccordionItem title="Ingredients" icon={<FaUtensils className="text-green-500"/>} isOpen={openSection === 'ingredients'} onToggle={() => handleToggleAccordion('ingredients')}>
              <div className="flex flex-wrap gap-2">{food.ingredients.map((item, i) => <span key={i} className="rounded-md bg-gray-100 px-2 py-1 text-sm">{item}</span>)}</div>
            </AccordionItem>}
            {food.allergens?.length > 0 && <AccordionItem title="Allergens" icon={<FaPepperHot className="text-red-500"/>} isOpen={openSection === 'allergens'} onToggle={() => handleToggleAccordion('allergens')}>
              <div className="flex flex-wrap gap-2">{food.allergens.map((item, i) => <span key={i} className="rounded-md bg-gray-100 px-2 py-1 text-sm">{item}</span>)}</div>
            </AccordionItem>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;