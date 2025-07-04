import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLeaf, FaDrumstickBite, FaMinus, FaPlus, FaShoppingCart, FaStar, FaClock, FaFire, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [cartMsg, setCartMsg] = useState('');

  useEffect(() => {
    const fetchFood = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiClient.get(`/vendor/menu-items/${id}`);
        if (res.data.success) {
          setFood(res.data.data);
          // Pre-fill user rating if exists
          if (user && res.data.data.ratings) {
            const found = res.data.data.ratings.find(r => r.user === user._id);
            setUserRating(found ? found.value : 0);
          }
        } else {
          setError(res.data.message || 'Failed to fetch food details');
        }
      } catch (err) {
        setError('Failed to fetch food details');
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
    // eslint-disable-next-line
  }, [id, user]);

  const handleQuantityChange = (action) => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!food) return;
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(food, quantity);
    setCartMsg('Added to cart!');
    setTimeout(() => setCartMsg(''), 1500);
  };

  const handleRate = async (value) => {
    setSubmittingRating(true);
    setRatingError('');
    try {
      await apiClient.post(`/vendor/menu-items/${id}/rate`, { value });
      setUserRating(value);
      // Refetch food details to update average
      const res = await apiClient.get(`/vendor/menu-items/${id}`);
      if (res.data.success) setFood(res.data.data);
    } catch (err) {
      setRatingError('Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-center">Loading food details...</div>;
  }
  if (error) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }
  if (!food) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">Food not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Food Image */}
          <div className="relative">
            <img
              src={food.image ? (food.image.startsWith('http') ? food.image : `http://localhost:5000${food.image}`) : '/default-food.png'}
              alt={food.name}
              className="w-full h-[400px] object-cover rounded-lg"
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {/* Availability Badge */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
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
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{food.name}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                {food.rating !== undefined && food.rating !== null && (
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span>{food.rating.toFixed(1)}</span>
                  </div>
                )}
                {food.preparationTime && (
                  <div className="flex items-center gap-1">
                    <FaClock className="text-orange-500" />
                    <span>{food.preparationTime}</span>
                  </div>
                )}
                {food.calories && (
                  <div className="flex items-center gap-1">
                    <FaFire className="text-red-500" />
                    <span>{food.calories}</span>
                  </div>
                )}
              </div>
              {/* Star Rating Input (only for logged-in users) */}
              {user ? (
                <div className="mt-2 flex items-center gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none"
                      disabled={submittingRating}
                      onClick={() => handleRate(star)}
                    >
                      <FaStar
                        className={
                          (userRating || 0) >= star
                            ? 'text-yellow-400 text-2xl'
                            : 'text-gray-300 text-2xl'
                        }
                      />
                    </button>
                  ))}
                  {submittingRating && <span className="ml-2 text-sm text-gray-500">Submitting...</span>}
                  {ratingError && <span className="ml-2 text-sm text-red-500">{ratingError}</span>}
                  {userRating > 0 && !submittingRating && <span className="ml-2 text-sm text-green-600">Thanks for rating!</span>}
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-500">Login to rate this food.</div>
              )}
            </div>

            {/* Description */}
            {food.description && <p className="text-gray-600">{food.description}</p>}

            {/* Ingredients */}
            {food.ingredients && food.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {food.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens */}
            {food.allergens && food.allergens.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Allergens</h3>
                <div className="flex flex-wrap gap-2">
                  {food.allergens.map((allergen, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-6">
                <div className="text-2xl font-bold text-orange-600">₹{food.price}</div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200"
                      disabled={!food.isAvailable}
                    >
                      <FaMinus />
                    </button>
                    <span className="w-8 text-center font-semibold text-black">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200"
                      disabled={!food.isAvailable}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  food.isAvailable
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
                disabled={!food.isAvailable}
              >
                <FaShoppingCart />
                {food.isAvailable 
                  ? `Add to Cart - ₹${food.price * quantity}`
                  : 'Currently Unavailable'
                }
              </button>
              {cartMsg && <div className="mt-2 text-green-600 text-center">{cartMsg}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails; 