import React from 'react';

const CategorySection = ({ onCategoryClick }) => {
  const categories = [
    {
      id: 1,
      name: "Vegetarian",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnZXRhcmlhbiUyMGZvb2R8ZW58MHx8MHx8fDA%3D",
      count: 120,
      type: "V",
      color: "bg-green-500",
      scrollType: 'veg',
    },
    {
      id: 2,
      name: "Non-Vegetarian",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMGZvb2R8ZW58MHx8MHx8fDA%3D",
      count: 85,
      type: "NV",
      color: "bg-red-500",
      scrollType: 'non-veg',
    }
  ];

  return (
    <div className="w-full max-w-6xl px-4 mt-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Food Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => onCategoryClick && onCategoryClick(category.scrollType)}
            style={{ cursor: 'pointer' }}
          >
            <div className="relative h-64">
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center`}>
                    <span className="text-white font-bold">{category.type}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                </div>
                <p className="text-gray-200">
                  {category.name === "Vegetarian" 
                    ? "Explore our wide range of delicious vegetarian dishes"
                    : "Discover our selection of premium non-vegetarian delicacies"}
                </p>
                <p className="text-orange-500 font-semibold mt-2">{category.count}+ items</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySection; 