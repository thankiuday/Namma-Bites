import React from 'react';
import veg from '../../public/veg.jpg';
import nonveg from '../../public/nonveg.jpg';
const CategorySection = () => {
  return (
    <div className="w-full max-w-6xl px-4 mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Food Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Veg Category */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="relative h-64">
            <img
              src={veg}
              alt="Vegetarian Food"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-bold">V</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Vegetarian</h3>
              </div>
              <p className="text-gray-200">Explore our wide range of delicious vegetarian dishes</p>
            </div>
          </div>
        </div>

        {/* Non-Veg Category */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="relative h-64">
            <img
              src={nonveg}
              alt="Non-Vegetarian Food"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white font-bold">NV</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Non-Vegetarian</h3>
              </div>
              <p className="text-gray-200">Discover our selection of premium non-vegetarian delicacies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySection; 