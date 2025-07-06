import React, { useEffect, useState } from 'react';
import { getAllSubscriptionPlans, getSubscriptionPlanById } from '../api/userApi';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaUtensils, 
  FaLeaf, 
  FaDrumstickBite, 
  FaClock, 
  FaMoneyBillWave,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaFilter
} from 'react-icons/fa';

// API base URL for images - uploads are served directly from the server root, not /api
const API_BASE_URL = 'http://localhost:5000';

// Helper function to get vendor image URL
const getVendorImageUrl = (imagePath) => {
  console.log('getVendorImageUrl called with:', imagePath);
  if (!imagePath) {
    console.log('No image path, returning logo.png');
    return '/logo.png';
  }
  if (imagePath.startsWith('http')) {
    console.log('Image path is already a full URL:', imagePath);
    return imagePath;
  }
  const fullUrl = `${API_BASE_URL}${imagePath}`;
  console.log('Constructed vendor image URL:', fullUrl);
  return fullUrl;
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

const UserSubscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getAllSubscriptionPlans();
      console.log('Subscription plans response:', response.data);
      console.log('Plans data:', response.data.data);
      setPlans(response.data.data || []);
    } catch (err) {
      setError('Failed to load subscription plans');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (planId) => {
    try {
      const response = await getSubscriptionPlanById(planId);
      setSelectedPlan(response.data.data);
      setShowPlanDetails(true);
    } catch (err) {
      setError('Failed to load plan details');
      console.error('Error fetching plan details:', err);
    }
  };

  const filteredPlans = plans.filter(plan => {
    console.log('Filtering plan:', {
      planId: plan._id,
      planType: plan.planType,
      duration: plan.duration,
      filterType: filterType,
      filterDuration: filterDuration
    });
    
    const typeMatch = filterType === 'all' || plan.planType === filterType;
    const durationMatch = filterDuration === 'all' || plan.duration === parseInt(filterDuration);
    
    console.log('Filter results:', {
      typeMatch,
      durationMatch,
      finalResult: typeMatch && durationMatch
    });
    
    return typeMatch && durationMatch;
  });

  console.log('Filtering summary:', {
    totalPlans: plans.length,
    filteredPlans: filteredPlans.length,
    filterType,
    filterDuration
  });

  const closePlanDetails = () => {
    setShowPlanDetails(false);
    setSelectedPlan(null);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-orange-50 to-white min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
            <p className="text-orange-700 font-semibold">Loading subscription plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-orange-50 to-white min-h-screen">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <FaUtensils className="text-5xl text-orange-600" />
        </div>
        <h1 className="text-4xl font-bold text-orange-800 mb-4 drop-shadow-sm">Available Subscription Plans</h1>
        <p className="text-lg text-orange-700 font-medium">Browse and choose from our curated meal subscription plans</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-orange-100">
        <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
          <FaFilter className="mr-2" />
          Filter Plans
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-orange-700 mb-2 flex items-center">
              <FaLeaf className="mr-1" />
              Plan Type
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                console.log('Filter type changed to:', e.target.value);
                setFilterType(e.target.value);
              }}
              className="w-full border-2 border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 bg-white text-gray-800 font-medium"
            >
              <option value="all">🌱 All Types</option>
              <option value="veg">🥬 Vegetarian</option>
              <option value="non-veg">🍗 Non-Vegetarian</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-orange-700 mb-2 flex items-center">
              <FaClock className="mr-1" />
              Duration
            </label>
            <select
              value={filterDuration}
              onChange={(e) => {
                console.log('Filter duration changed to:', e.target.value);
                setFilterDuration(e.target.value);
              }}
              className="w-full border-2 border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-500 bg-white text-gray-800 font-medium"
            >
              <option value="all">⏰ All Durations</option>
              <option value="7">📅 7 Days</option>
              <option value="15">📅 15 Days</option>
              <option value="30">📅 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mb-6 flex items-center">
          <FaTimes className="text-red-600 mr-3 text-xl" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {filteredPlans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-orange-100">
          <FaUtensils className="mx-auto h-16 w-16 text-orange-300 mb-6" />
          <h3 className="text-xl font-bold text-orange-800 mb-3">No subscription plans found</h3>
          <p className="text-orange-600 font-medium">Try adjusting your filters or check back later for new plans.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            console.log('Plan vendor data:', plan.vendor);
            return (
              <div key={plan._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getVendorImageUrl(plan.vendor?.image)}
                        alt={plan.vendor?.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                        onError={(e) => {
                          console.log('Image failed to load, using fallback');
                          e.target.src = '/logo.png';
                        }}
                      />
                    <div>
                      <h3 className="font-bold text-orange-800 text-lg">{plan.vendor?.name}</h3>
                      <div className="flex items-center text-sm text-orange-600 font-medium">
                        <FaMapMarkerAlt className="mr-2 text-orange-500" />
                        {plan.vendor?.location || 'Location not specified'}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${
                    plan.planType === 'veg' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {plan.planType === 'veg' ? (
                      <>
                        <FaLeaf className="mr-1" />
                        Vegetarian
                      </>
                    ) : (
                      <>
                        <FaDrumstickBite className="mr-1" />
                        Non-Veg
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-4 bg-orange-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700 font-semibold flex items-center">
                      <FaClock className="mr-2" />
                      Duration:
                    </span>
                    <span className="font-bold text-orange-800">{plan.duration} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700 font-semibold flex items-center">
                      <FaMoneyBillWave className="mr-2" />
                      Total Price:
                    </span>
                    <span className="text-2xl font-bold text-orange-600">₹{plan.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700 font-semibold">Price per day:</span>
                    <span className="font-bold text-orange-800">₹{(plan.price / plan.duration).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewDetails(plan._id)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-bold flex items-center justify-center"
                >
                  <FaEye className="mr-2" />
                  View Details
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Plan Details Modal */}
      {showPlanDetails && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-orange-100">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-orange-800 mb-3 flex items-center">
                    <FaUtensils className="mr-3 text-orange-600" />
                    {selectedPlan.vendor?.name} - Subscription Plan
                  </h2>
                  <div className="flex items-center space-x-6 text-sm text-orange-700 font-medium">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-orange-500" />
                      {selectedPlan.vendor?.location}
                    </div>
                    {selectedPlan.vendor?.phone && (
                      <div className="flex items-center">
                        <FaPhone className="mr-2 text-orange-500" />
                        {selectedPlan.vendor.phone}
                      </div>
                    )}
                    {selectedPlan.vendor?.email && (
                      <div className="flex items-center">
                        <FaEnvelope className="mr-2 text-orange-500" />
                        {selectedPlan.vendor.email}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={closePlanDetails}
                  className="text-orange-400 hover:text-orange-600 text-3xl font-bold p-2 hover:bg-orange-50 rounded-full transition-colors duration-200"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <h3 className="font-bold text-orange-800 mb-4 flex items-center">
                    <FaCheckCircle className="mr-2 text-orange-600" />
                    Plan Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700 font-semibold flex items-center">
                        <FaClock className="mr-2" />
                        Duration:
                      </span>
                      <span className="font-bold text-orange-800">{selectedPlan.duration} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700 font-semibold flex items-center">
                        <FaMoneyBillWave className="mr-2" />
                        Total Price:
                      </span>
                      <span className="text-2xl font-bold text-orange-600">₹{selectedPlan.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700 font-semibold">Price per day:</span>
                      <span className="font-bold text-orange-800">₹{(selectedPlan.price / selectedPlan.duration).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-700 font-semibold">Plan Type:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${
                        selectedPlan.planType === 'veg' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {selectedPlan.planType === 'veg' ? (
                          <>
                            <FaLeaf className="mr-1" />
                            Vegetarian
                          </>
                        ) : (
                          <>
                            <FaDrumstickBite className="mr-1" />
                            Non-Vegetarian
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-4 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-600" />
                    Vendor Information
                  </h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={getVendorImageUrl(selectedPlan.vendor?.image)}
                      alt={selectedPlan.vendor?.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-200"
                      onError={(e) => {
                        e.target.src = '/logo.png';
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-blue-800 text-lg">{selectedPlan.vendor?.name}</h4>
                      <p className="text-blue-700 font-medium">{selectedPlan.vendor?.location}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {selectedPlan.vendor?.phone && (
                      <div className="flex items-center text-blue-700 font-medium">
                        <FaPhone className="mr-3 text-blue-500" />
                        {selectedPlan.vendor.phone}
                      </div>
                    )}
                    {selectedPlan.vendor?.email && (
                      <div className="flex items-center text-blue-700 font-medium">
                        <FaEnvelope className="mr-3 text-blue-500" />
                        {selectedPlan.vendor.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-bold text-orange-800 mb-6 flex items-center">
                  <FaCalendarAlt className="mr-2 text-orange-600" />
                  Weekly Meal Schedule
                </h3>
                <div className="overflow-x-auto rounded-xl border-2 border-orange-200">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white">📅 Day</th>
                        {mealTypes.map(meal => (
                          <th key={meal} className="px-6 py-4 text-left text-sm font-bold text-white capitalize">
                            {meal === 'breakfast' ? '🌅 Breakfast' : 
                             meal === 'lunch' ? '🌞 Lunch' : 
                             meal === 'dinner' ? '🌙 Dinner' : '🍎 Snacks'}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day, index) => (
                        <tr key={day} className={`hover:bg-orange-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-orange-50'}`}>
                          <td className="border-b border-orange-200 px-6 py-4 font-bold text-orange-800 bg-orange-100">{day}</td>
                          {mealTypes.map(meal => {
                            const mealItem = selectedPlan.weekMeals[day][meal];
                            return (
                              <td key={meal} className="border-b border-orange-200 px-6 py-4">
                                {mealItem ? (
                                  <div className="bg-white rounded-lg p-3 border border-orange-200">
                                    <div className="font-bold text-gray-800 mb-1">{mealItem.name}</div>
                                    <div className="text-orange-600 font-semibold">₹{mealItem.price}</div>
                                  </div>
                                ) : (
                                  <span className="text-orange-400 font-medium">Not specified</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={closePlanDetails}
                  className="px-8 py-3 border-2 border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-all duration-200 font-bold flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Close
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement subscription purchase logic
                    alert('Subscription purchase feature coming soon!');
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-bold flex items-center shadow-lg"
                >
                  <FaCheckCircle className="mr-2" />
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubscription; 