import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient'; // Using generic apiClient for public endpoints

const BrowseVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/vendor/public');
        if (res.data.success) {
          setVendors(res.data.data);
        } else {
          setError('Failed to fetch vendors.');
        }
      } catch (err) {
        setError('An error occurred while fetching vendors.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading vendors...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full max-w-6xl px-4 mb-16">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Browse Our Vendors</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {vendors.map((vendor) => (
          <div
            key={vendor._id}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-600 group-hover:border-orange-500 transition-all duration-300">
              <img
                src={`http://localhost:5000${vendor.image}`}
                alt={vendor.name}
                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
              {vendor.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseVendors; 