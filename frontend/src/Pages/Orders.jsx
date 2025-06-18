import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const Orders = () => {
  // Sample orders data (replace with actual orders data)
  const orders = [
    {
      id: 1,
      date: "2024-03-15",
      items: [
        { name: "Butter Chicken", quantity: 2, price: 250 },
        { name: "Veg Biryani", quantity: 1, price: 200 }
      ],
      total: 700,
      status: "delivered",
      deliveryAddress: "123 Main St, Bangalore, Karnataka"
    },
    {
      id: 2,
      date: "2024-03-14",
      items: [
        { name: "Masala Dosa", quantity: 2, price: 120 },
        { name: "Idli Sambar", quantity: 1, price: 100 }
      ],
      total: 340,
      status: "processing",
      deliveryAddress: "123 Main St, Bangalore, Karnataka"
    },
    {
      id: 3,
      date: "2024-03-13",
      items: [
        { name: "Chicken Biryani", quantity: 1, price: 250 },
        { name: "Veg Fried Rice", quantity: 1, price: 180 }
      ],
      total: 430,
      status: "cancelled",
      deliveryAddress: "123 Main St, Bangalore, Karnataka"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'processing':
        return <FaClock className="text-orange-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'processing':
        return 'Processing';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
                  <p className="text-gray-600">Placed on {order.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className={`font-medium ${
                    order.status === 'delivered' ? 'text-green-500' :
                    order.status === 'processing' ? 'text-orange-500' :
                    'text-red-500'
                  }`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="border-t border-b py-4 my-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center mb-2 last:mb-0">
                    <span className="text-gray-600">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-gray-800">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Delivery Address:</p>
                  <p className="text-gray-800">{order.deliveryAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount:</p>
                  <p className="text-lg font-bold text-orange-600">₹{order.total}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders; 