import React from 'react';

const Subscription = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Subscription Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Plan */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-500">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Basic Plan</h2>
          <p className="text-3xl font-bold text-orange-600 mb-4">₹499<span className="text-lg text-gray-600">/month</span></p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              1 Meal per day
            </li>
            <li className="flex items-center text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Basic menu options
            </li>
            <li className="flex items-center text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Standard delivery time
            </li>
          </ul>
          <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
            Subscribe Now
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-orange-500">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Premium Plan</h2>
          <p className="text-3xl font-bold text-orange-600 mb-4">₹999<span className="text-lg text-gray-600">/month</span></p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              2 Meals per day
            </li>
            <li className="flex items-center text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Premium menu options
            </li>
            <li className="flex items-center text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Priority delivery
            </li>
            <li className="flex items-center text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Custom meal preferences
            </li>
          </ul>
          <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscription; 