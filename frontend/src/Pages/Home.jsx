import React from "react";
import gujarati from '../../public/gujarati.jpg';
import tindi from '../../public/tindi.jpg';
import south from '../../public/south.jpg';
import north from '../../public/north.jpg';
import chinese from '../../public/chinese.jpg';
import FoodCard from '../components/FoodCard';
import CategorySection from '../components/CategorySection';
import TopBuys from '../components/TopBuys';
import FoodCategories from '../components/FoodCategories';

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
    <main className="flex-grow">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-orange-600 mb-12 italic">Namma Bites</h1>
        
        {/* Food Categories */}
        <FoodCategories />
        
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

        {/* Categories Section */}
        <CategorySection />

        {/* Top Buys Section */}
        <TopBuys />
      </div>
    </main>
  );
};

export default Home;
