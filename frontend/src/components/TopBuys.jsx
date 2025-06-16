import React, { useRef } from 'react';
import FoodCard from './FoodCard';

const TopBuys = () => {
  const vegScrollRef = useRef(null);
  const nonVegScrollRef = useRef(null);

  const scroll = (direction, ref) => {
    if (ref.current) {
      const { current } = ref;
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const topVegItems = [
    {
      id: 1,
      name: "Paneer Butter Masala",
      price: 280,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFuZWVyJTIwYnV0dGVyJTIwbWFzYWxhfGVufDB8fDB8fHww",
      isAvailable: true
    },
    {
      id: 2,
      name: "Masala Dosa",
      price: 120,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFzYWxhJTIwZG9zYXxlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true
    },
    {
      id: 3,
      name: "Veg Biryani",
      price: 200,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwYmlyeWFuaXxlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true
    },
    {
      id: 4,
      name: "Veg Fried Rice",
      price: 180,
      category: "Chinese",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwZnJpZWQlMjByaWNlfGVufDB8fDB8fHww",
      isAvailable: true
    },
    {
      id: 5,
      name: "Veg Noodles",
      price: 160,
      category: "Chinese",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwbm9vZGxlc3xlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true
    },
    {
      id: 6,
      name: "Veg Manchurian",
      price: 220,
      category: "Chinese",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwbWFuY2h1cmlhbnxlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true
    },
    {
      id: 7,
      name: "Veg Pulao",
      price: 180,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwcHVsYW98ZW58MHx8MHx8fDA%3D",
      isAvailable: true
    },
    {
      id: 8,
      name: "Veg Thali",
      price: 250,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwdGhhbGl8ZW58MHx8MHx8fDA%3D",
      isAvailable: true
    },
    {
      id: 9,
      name: "Veg Burger",
      price: 150,
      category: "Fast Food",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwYnVyZ2VyfGVufDB8fDB8fHww",
      isAvailable: true
    },
    {
      id: 10,
      name: "Veg Pizza",
      price: 280,
      category: "Fast Food",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwcGl6emF8ZW58MHx8MHx8fDA%3D",
      isAvailable: true
    }
  ];

  const topNonVegItems = [
    {
      id: 11,
      name: "Butter Chicken",
      price: 350,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnV0dGVyJTIwY2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true
    },
    {
      id: 12,
      name: "Chicken Biryani",
      price: 250,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMGJpcnlhbml8ZW58MHx8MHx8fDA%3D",
      isAvailable: true
    },
    {
      id: 13,
      name: "Chicken 65",
      price: 280,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMDY1fGVufDB8fDB8fHww",
      isAvailable: true
    },
    {
      id: 14,
      name: "Chicken Fried Rice",
      price: 200,
      category: "Chinese",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMGZyaWVkJTIwcmljZXxlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true
    },
    {
      id: 15,
      name: "Chicken Noodles",
      price: 180,
      category: "Chinese",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMG5vb2RsZXN8ZW58MHx8MHx8fDA%3D",
      isAvailable: true
    },
    {
      id: 16,
      name: "Chicken Manchurian",
      price: 240,
      category: "Chinese",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMG1hbmNodXJpYW58ZW58MHx8MHx8fDA%3D",
      isAvailable: true
    },
    {
      id: 17,
      name: "Chicken Curry",
      price: 300,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMGN1cnJ5fGVufDB8fDB8fHww",
      isAvailable: true
    },
    {
      id: 18,
      name: "Chicken Burger",
      price: 180,
      category: "Fast Food",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMGJ1cmdlcnxlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true
    },
    {
      id: 19,
      name: "Chicken Pizza",
      price: 320,
      category: "Fast Food",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMHBpenphfGVufDB8fDB8fHww",
      isAvailable: true
    },
    {
      id: 20,
      name: "Chicken Wings",
      price: 350,
      category: "Fast Food",
      image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMHdpbmdzfGVufDB8fDB8fHww",
      isAvailable: true
    }
  ];

  return (
    <div className="w-full max-w-6xl px-4 mt-16">
      {/* Top Veg Items */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Top Vegetarian Picks</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left', vegScrollRef)}
              className="p-2 rounded-full bg-orange-600 text-white hover:bg-orange-500 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right', vegScrollRef)}
              className="p-2 rounded-full bg-orange-600 text-white hover:bg-orange-500 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div 
          ref={vegScrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topVegItems.map((food) => (
            <div key={food.id} className="flex-none w-72">
              <FoodCard food={food} />
            </div>
          ))}
        </div>
      </div>

      {/* Top Non-Veg Items */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold">NV</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Top Non-Vegetarian Picks</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left', nonVegScrollRef)}
              className="p-2 rounded-full bg-orange-600 text-white hover:bg-orange-500 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right', nonVegScrollRef)}
              className="p-2 rounded-full bg-orange-600 text-white hover:bg-orange-500 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div 
          ref={nonVegScrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topNonVegItems.map((food) => (
            <div key={food.id} className="flex-none w-72">
              <FoodCard food={food} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBuys; 