import React from 'react';
import FoodCard from './FoodCard';

const AllFoods = () => {
  const allFoods = [
    // North Indian Veg
    {
      id: 1,
      name: "Paneer Butter Masala",
      price: 280,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFuZWVyJTIwYnV0dGVyJTIwbWFzYWxhfGVufDB8fDB8fHww",
      isAvailable: true,
      isVeg: true
    },
    {
      id: 2,
      name: "Veg Biryani",
      price: 200,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwYmlyeWFuaXxlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true,
      isVeg: true
    },
    // North Indian Non-Veg
    {
      id: 3,
      name: "Butter Chicken",
      price: 350,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnV0dGVyJTIwY2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true,
      isVeg: false
    },
    {
      id: 4,
      name: "Chicken Biryani",
      price: 250,
      category: "North Indian",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMGJpcnlhbml8ZW58MHx8MHx8fDA%3D",
      isAvailable: true,
      isVeg: false
    },
    // South Indian Veg
    {
      id: 5,
      name: "Masala Dosa",
      price: 120,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFzYWxhJTIwZG9zYXxlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true,
      isVeg: true
    },
    {
      id: 6,
      name: "Idli Sambar",
      price: 100,
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aWRsaSUyMHNhbWJhcnxlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true,
      isVeg: true
    },
    // Chinese Veg
    {
      id: 7,
      name: "Veg Noodles",
      price: 160,
      category: "Chinese",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwbm9vZGxlc3xlbnwwfHwwfHx8MA%3D%3D",
      isAvailable: true,
      isVeg: true
    },
    {
      id: 8,
      name: "Veg Fried Rice",
      price: 180,
      category: "Chinese",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwZnJpZWQlMjByaWNlfGVufDB8fDB8fHww",
      isAvailable: true,
      isVeg: true
    },
    // Chinese Non-Veg
    {
      id: 9,
      name: "Chicken Noodles",
      price: 180,
      category: "Chinese",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMG5vb2RsZXN8ZW58MHx8MHx8fDA%3D",
      isAvailable: true,
      isVeg: false
    },
  ];

  return (
    <div className="w-full max-w-6xl px-4 mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Our Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allFoods.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>
    </div>
  );
};

export default AllFoods; 