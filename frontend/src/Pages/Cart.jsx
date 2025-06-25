import React from 'react';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? 0 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Your cart is empty</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {cart.map((item) => (
              <div key={item._id} className="flex items-center gap-4 py-4 border-b last:border-b-0">
                <img
                  src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`) : '/default-food.png'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-orange-600 font-semibold">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-orange-600" onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}>
                    <FaMinus />
                  </button>
                  <span className="w-8 text-center text-black">{item.quantity}</span>
                  <button className="p-2 text-gray-600 hover:text-orange-600" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                    <FaPlus />
                  </button>
                </div>
                <button className="p-2 text-red-600 hover:text-red-700" onClick={() => removeFromCart(item._id)}>
                  <FaTrash />
                </button>
              </div>
            ))}
            <button className="mt-4 text-sm text-red-500 hover:underline" onClick={clearCart}>Clear Cart</button>
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