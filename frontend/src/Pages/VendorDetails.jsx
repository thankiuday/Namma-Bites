import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import FoodCard from '../components/FoodCard';

const VendorDetails = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendorAndMenu = async () => {
      setLoading(true);
      setError('');
      try {
        const [vendorRes, menuRes] = await Promise.all([
          apiClient.get(`/vendor/public`),
          apiClient.get(`/vendor/menu-items/all`)
        ]);
        if (vendorRes.data.success && menuRes.data.success) {
          const foundVendor = vendorRes.data.data.find(v => v._id === id);
          setVendor(foundVendor);
          setMenuItems(menuRes.data.data.filter(item => item.vendor && item.vendor._id === id));
        } else {
          setError('Failed to fetch vendor or menu items.');
        }
      } catch (err) {
        setError('An error occurred while fetching vendor details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendorAndMenu();
  }, [id]);

  if (loading) return <div className="text-center p-8">Loading vendor details...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!vendor) return <div className="text-center p-8 text-gray-500">Vendor not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <a href="/" className="inline-flex items-center text-orange-600 hover:underline font-semibold">
          {/* Left arrow icon */}
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </a>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col items-center">
        <img
          src={`http://localhost:5000${vendor.image}`}
          alt={vendor.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-orange-600 mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{vendor.name}</h1>
        {vendor.cuisine && <div className="text-gray-600 mb-1">Cuisine: {vendor.cuisine}</div>}
        {vendor.address && <div className="text-gray-600 mb-1">Address: {vendor.address}</div>}
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Menu Items</h2>
        {menuItems.length === 0 ? (
          <div className="text-gray-500">No menu items found for this vendor.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <FoodCard key={item._id} food={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetails; 