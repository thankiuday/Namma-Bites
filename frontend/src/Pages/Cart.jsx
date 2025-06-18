import React from 'react';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const Cart = () => {
  // Sample cart items (replace with actual cart data)
  const cartItems = [
    {
      id: 1,
      name: "Butter Chicken",
      price: 250,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnV0dGVyJTIwY2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
      id: 2,
      name: "Veg Biryani",
      price: 200,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwYmlyeWFuaXxlbnwwfHwwfHx8MA%3D%3D"
    }
  ];

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Your cart is empty</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-b-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-orange-600 font-semibold">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-orange-600">
                    <FaMinus />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button className="p-2 text-gray-600 hover:text-orange-600">
                    <FaPlus />
                  </button>
                </div>
                <button className="p-2 text-red-600 hover:text-red-700">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 transition-colors">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart; 