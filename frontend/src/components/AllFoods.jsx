import React, { useEffect, useState } from 'react';
import FoodCard from './FoodCard';
import apiClient from '../api/apiClient';

const AllFoods = ({ searchTerm = '' }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiClient.get('/vendor/menu-items/all');
        if (res.data.success) {
          setFoods(res.data.data);
        } else {
          setError(res.data.message || 'Failed to fetch foods');
        }
      } catch (err) {
        setError('Failed to fetch foods');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // Filter foods by search term (name, vendor name, or category)
  const filteredFoods = foods.filter((food) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const nameMatch = food.name?.toLowerCase().includes(term);
    const vendorMatch = food.vendor?.name?.toLowerCase().includes(term);
    // Robust category matching
    const foodCategory = food.category?.toLowerCase();
    const isVeg = ['veg', 'vegetarian'].includes(term);
    const isNonVeg = ['nonveg', 'non veg', 'non-veg', 'non vegetarian', 'non-vegetarian'].includes(term);
    const categoryMatch = (foodCategory && foodCategory.includes(term)) ||
      (isVeg && foodCategory && (foodCategory === 'veg' || foodCategory.includes('veg')) && foodCategory !== 'non-veg') ||
      (isNonVeg && foodCategory === 'non-veg');
    return nameMatch || vendorMatch || categoryMatch;
  });

  return (
    <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 mt-8 sm:mt-16">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 sm:mb-8 text-center">Our Menu</h2>
      {loading ? (
        <div className="text-center py-6 sm:py-8 text-base sm:text-lg">Loading foods...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-6 sm:py-8 text-base sm:text-lg">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredFoods.length === 0 ? (
            <div className="col-span-full text-center text-base sm:text-lg text-gray-500 py-6 sm:py-8 font-semibold">
              No foods found matching your search.
            </div>
          ) : (
            filteredFoods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AllFoods; 