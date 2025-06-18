import React from 'react';

const FoodCategories = () => {
  const categories = [
    {
      id: 1,
      name: "South Indian",
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFzYWxhJTIwZG9zYXxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      id: 2,
      name: "Gujarati",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3VqYXJhdGklMjB0aGFsaXxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      id: 3,
      name: "North Indian",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnV0dGVyJTIwY2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      id: 4,
      name: "Punjabi",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHVuamFiaSUyMGZvb2R8ZW58MHx8MHx8fDA%3D"
    }
  ];

  return (
    <div className="w-full max-w-6xl px-4 mb-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-600 group-hover:border-orange-500 transition-all duration-300">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
              {category.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodCategories; 