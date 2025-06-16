import React from "react";
import gujarati from '../../public/gujarati.jpg';
import tindi from '../../public/tindi.jpg';
import south from '../../public/south.jpg';
import north from '../../public/north.jpg';
import chinese from '../../public/chinese.jpg';
import FoodCard from '../components/FoodCard';
import CategorySection from '../components/CategorySection';
import TopBuys from '../components/TopBuys';

const Home = () => {
  const categories = [
    {
      name: "Gujarati Nastos",
      image: gujarati
    },
    {
      name: "Namma Tindi Kadai",
      image: tindi
    },
    {
      name: "South Indian",
      image: south
    },
    {
      name: "North Indian",
      image: north
    },
    {
      name: "Chinese",
      image: chinese
    }
  ];

  // Sample food items data
  const foodItems = [
    {
      id: 1,
      name: "Dhokla",
      price: 120,
      category: "Gujarati Nastos",
      image: gujarati,
      isAvailable: true
    },
    {
      id: 2,
      name: "Khandvi",
      price: 150,
      category: "Gujarati Nastos",
      image: gujarati,
      isAvailable: true
    },
    {
      id: 3,
      name: "Masala Dosa",
      price: 80,
      category: "South Indian",
      image: south,
      isAvailable: true
    },
    {
      id: 4,
      name: "Idli Sambar",
      price: 60,
      category: "South Indian",
      image: south,
      isAvailable: false
    },
    {
      id: 5,
      name: "Butter Chicken",
      price: 250,
      category: "North Indian",
      image: north,
      isAvailable: true
    },
    {
      id: 6,
      name: "Noodles",
      price: 180,
      category: "Chinese",
      image: chinese,
      isAvailable: true
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-orange-600 mb-12 italic">Namma Bites</h1>
      
      {/* Search Section - Mobile First */}
      <div className="w-full max-w-6xl px-4 mb-8 md:hidden">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search for food..."
            className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-orange-600 focus:outline-none text-gray-800"
          />
          <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors duration-300">
            Search
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="w-full max-w-6xl px-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Food Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Veg Category */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="relative h-64">
              <img 
                src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnZXRhcmlhbiUyMGZvb2R8ZW58MHx8MHx8fDA%3D"
                alt="Vegetarian Food"
                className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
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
                src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMGZvb2R8ZW58MHx8MHx8fDA%3D"
                alt="Non-Vegetarian Food"
                className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
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

      {/* Search Section - Desktop */}
      <div className="hidden md:block w-full max-w-6xl px-4 mt-12">
        <div className="flex gap-4 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Search for food..."
            className="flex-1 px-6 py-4 rounded-lg border-2 border-gray-200 focus:border-orange-600 focus:outline-none text-gray-800 text-lg"
          />
          <button className="px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors duration-300 text-lg font-medium">
            Search
          </button>
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="w-full max-w-6xl px-4 mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Our Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      </div>

      {/* Veg and Non-Veg Categories */}
      <CategorySection />

      {/* Top Buys Section */}
      <TopBuys />
    </div>
  );
};

export default Home;
