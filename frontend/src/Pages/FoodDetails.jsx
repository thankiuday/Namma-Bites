import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLeaf, FaDrumstickBite, FaMinus, FaPlus, FaShoppingCart, FaStar, FaClock, FaFire, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  // Sample food data (replace with actual data from API)
  const food = {
    id: parseInt(id),
    name: "Butter Chicken",
    description: "A classic North Indian dish featuring tender chicken pieces in a rich, creamy tomato-based curry sauce. The dish is known for its smooth texture and perfect balance of spices.",
    price: 250,
    category: "North Indian",
    isVeg: false,
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnV0dGVyJTIwY2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D",
    rating: 4.5,
    preparationTime: "25 mins",
    calories: "450 kcal",
    ingredients: [
      "Chicken",
      "Tomatoes",
      "Butter",
      "Cream",
      "Garam Masala",
      "Ginger",
      "Garlic",
      "Spices"
    ],
    allergens: ["Dairy", "Nuts"]
  };

  const handleQuantityChange = (action) => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log(`Added ${quantity} ${food.name} to cart`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Food Image */}
          <div className="relative">
            <img
              src={food.image}
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
              {food.isVeg ? (
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
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span>{food.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaClock className="text-orange-500" />
                  <span>{food.preparationTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaFire className="text-red-500" />
                  <span>{food.calories}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600">{food.description}</p>

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
                    <span className="w-8 text-center font-semibold">{quantity}</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails; 