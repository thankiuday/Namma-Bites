import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import vendorApi from '../api/vendorApi';
import VendorNavbar from '../components/vendor/VendorNavbar';
import { useVendorAuth } from '../context/VendorAuthContext';
import { getMenuItemImageUrl } from '../utils/imageUtils';
import apiClient from '../api/apiClient';

const MenuEntry = () => {
  const navigate = useNavigate();
  const { vendor, token } = useVendorAuth();
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('veg');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState('');
  const [preparationTime, setPreparationTime] = useState('');
  const [calories, setCalories] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [itemImage, setItemImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [fetchingItems, setFetchingItems] = useState(true);

  // State for filtering and sorting
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editItemCategory, setEditItemCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIngredients, setEditIngredients] = useState('');
  const [editAllergens, setEditAllergens] = useState('');
  const [editPreparationTime, setEditPreparationTime] = useState('');
  const [editCalories, setEditCalories] = useState('');
  const [editIsAvailable, setEditIsAvailable] = useState(true);
  const [editItemImage, setEditItemImage] = useState(null);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    price: '',
    category: 'veg',
    description: '',
    ingredients: '',
    allergens: '',
    preparationTime: '',
    calories: '',
    image: null,
    isAvailable: true,
  });

  const fetchMenuItems = async () => {
    try {
      setFetchingItems(true);
      const res = await vendorApi.get('/menu-items');
      if (res.data.success) {
        setMenuItems(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch menu items.');
    } finally {
      setFetchingItems(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleCancel = () => {
    setItemName('');
    setItemPrice('');
    setItemCategory('veg');
    setDescription('');
    setIngredients('');
    setAllergens('');
    setPreparationTime('');
    setCalories('');
    setIsAvailable(true);
    setItemImage(null);
    setError('');
    setSuccess('');
  };

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');

    if (!itemName || !itemPrice || !itemImage) {
      setError('Please fill out all fields and select an image.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', itemName);
    formData.append('price', itemPrice);
    formData.append('category', itemCategory);
    formData.append('description', description);
    formData.append('ingredients', ingredients);
    formData.append('allergens', allergens);
    formData.append('preparationTime', preparationTime);
    formData.append('calories', calories);
    formData.append('isAvailable', isAvailable);
    formData.append('image', itemImage);

    try {
      setUploadStatus('Uploading image to cloud storage...');
      setUploadProgress(25);

      const res = await vendorApi.post('/menu-items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(progress, 90)); // Cap at 90% until complete
          if (progress > 50) {
            setUploadStatus('Processing image...');
          }
        },
        timeout: 120000, // 2 minute timeout
      });

      setUploadProgress(100);
      setUploadStatus('Complete!');

      if (res.data.success) {
        setSuccess('Menu item added successfully!');
        handleCancel();
        fetchMenuItems();
      } else {
        setError(res.data.message || 'Failed to add menu item.');
      }
    } catch (err) {
      setUploadProgress(0);
      setUploadStatus('');
      if (err.code === 'ECONNABORTED') {
        setError('Upload timeout. Please try with a smaller image or check your internet connection.');
      } else {
        setError(err.response?.data?.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('');
      }, 3000);
    }
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setEditItemName(item.name);
    setEditItemPrice(item.price);
    setEditItemCategory(item.category);
    setEditDescription(item.description || '');
    setEditIngredients(item.ingredients ? item.ingredients.join(', ') : '');
    setEditAllergens(item.allergens ? item.allergens.join(', ') : '');
    setEditPreparationTime(item.preparationTime || '');
    setEditCalories(item.calories || '');
    setEditIsAvailable(item.isAvailable);
    setEditItemImage(null);
    setEditError('');
    setEditSuccess('');
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    const formData = new FormData();
    formData.append('name', editItemName);
    formData.append('price', editItemPrice);
    formData.append('category', editItemCategory);
    formData.append('description', editDescription);
    formData.append('ingredients', editIngredients);
    formData.append('allergens', editAllergens);
    formData.append('preparationTime', editPreparationTime);
    formData.append('calories', editCalories);
    formData.append('isAvailable', editIsAvailable);
    if (editItemImage) {
      formData.append('image', editItemImage);
    }

    try {
      const res = await vendorApi.put(`/menu-items/${selectedItem._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setEditSuccess('Item updated successfully!');
        fetchMenuItems();
        setTimeout(() => {
          setIsEditModalOpen(false);
        }, 1500);
      } else {
        setEditError(res.data.message || 'Failed to update item.');
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setEditLoading(true);
    setEditError('');
    try {
      await vendorApi.delete(`/menu-items/${selectedItem._id}`);
      setEditSuccess('Item deleted successfully!');
      fetchMenuItems();
      setShowDeleteConfirm(false);
      setTimeout(() => {
        setIsEditModalOpen(false);
      }, 1500);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to delete item.');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let items = [...menuItems];

    if (filterCategory !== 'all') {
      items = items.filter(item => item.category === filterCategory);
    }

    if (filterAvailability !== 'all') {
      const isAvailableFilter = filterAvailability === 'available';
      items = items.filter(item => item.isAvailable === isAvailableFilter);
    }

    if (sortBy === 'recent') {
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'price-asc') {
      items.sort((a, b) => a.price - b.price);
    }

    return items;
  }, [menuItems, filterCategory, filterAvailability, sortBy]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleReset = () => {
    setFormData({
      id: null,
      name: '',
      price: '',
      category: 'veg',
      description: '',
      ingredients: '',
      allergens: '',
      preparationTime: '',
      calories: '',
      image: null,
      isAvailable: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <VendorNavbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button - hidden on mobile */}
          <div className="hidden sm:block mb-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-base"
            >
              &larr; Back
            </button>
          </div>
          {/* Form Section */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Add New Menu Item</h1>
            
            {/* Upload Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-900">Quick Upload Tips</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Use images under 2MB for faster uploads</li>
                      <li>JPG format uploads faster than PNG</li>
                      <li>Square or landscape images work best (600x450px ideal)</li>
                      <li>Good lighting and clear focus improve customer appeal</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
                  required
                  placeholder="e.g. Paneer Butter Masala"
                />
              </div>

              <div>
                <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700">Item Price</label>
                <input
                  type="number"
                  id="itemPrice"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
                  required
                  placeholder="e.g. 120"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
                  placeholder="Short description of the dish"
                  required
                  rows="4"
                />
              </div>
              <div>
                <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">Ingredients (comma-separated)</label>
                <input
                  type="text"
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
                  placeholder="e.g. Paneer, Tomato, Butter, Spices"
                  required
                />
              </div>
              <div>
                <label htmlFor="allergens" className="block text-sm font-medium text-gray-700">Allergens (comma-separated)</label>
                <input
                  type="text"
                  id="allergens"
                  value={allergens}
                  onChange={(e) => setAllergens(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
                  placeholder="e.g. Dairy, Nuts (optional)"
                />
              </div>
                              <div>
                  <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700">
                    Preparation Time (minutes)
                    <span className="ml-1 text-xs text-gray-500">Required for accurate delivery estimates</span>
                  </label>
                  <input
                    type="number"
                    id="preparationTime"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
                    placeholder="e.g. 20"
                    min="1"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter the average time needed to prepare this item (in minutes)</p>
                </div>
              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories</label>
                <input
                  type="text"
                  id="calories"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm text-black"
                  placeholder="e.g. 350 (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="veg"
                      value="veg"
                      checked={itemCategory === 'veg'}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label htmlFor="veg" className="ml-2 block text-sm text-gray-900">Veg</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="non-veg"
                      value="non-veg"
                      checked={itemCategory === 'non-veg'}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label htmlFor="non-veg" className="ml-2 block text-sm text-gray-900">Non-Veg</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">Available</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Item Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setItemImage(e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 text-black"
                  required
                />
              </div>

              {/* Upload Progress Indicator */}
              {loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">{uploadStatus}</span>
                    <span className="text-sm text-blue-700">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    {uploadProgress < 50 ? 'Uploading image to cloud storage...' : 
                     uploadProgress < 90 ? 'Processing and optimizing image...' : 
                     'Finalizing...'}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Item...
                    </span>
                  ) : 'Add Item'}
                </button>
              </div>
            </form>
          </div>

          {/* Menu Items List */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Your Menu Items</h2>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Filter by category */}
              <div>
                <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700">Filter by Category</label>
                <select
                  id="filterCategory"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md text-black"
                >
                  <option value="all">All</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                </select>
              </div>
              {/* Filter by availability */}
              <div>
                <label htmlFor="filterAvailability" className="block text-sm font-medium text-gray-700">Availability</label>
                <select
                  id="filterAvailability"
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md text-black"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Not Available</option>
                </select>
              </div>
              {/* Sort by */}
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md text-black"
                >
                  <option value="recent">Most Recent</option>
                  <option value="price-asc">Price: Low to High</option>
                </select>
              </div>
            </div>

            {fetchingItems ? (
              <p className="text-center text-gray-500">Loading menu items...</p>
            ) : filteredAndSortedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredAndSortedItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-indigo-100"
                  >
                    <div className="relative">
                      <img
                        src={getMenuItemImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-36 sm:h-44 object-cover object-center border-b-2 border-indigo-200"
                      />
                      <div className="absolute top-2 left-2 flex items-center space-x-2">
                        {item.category === 'veg' ? (
                          <span title="Veg" className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium shadow">
                            <span role="img" aria-label="veg">🥦</span> Veg
                          </span>
                        ) : (
                          <span title="Non-Veg" className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium shadow">
                            <span role="img" aria-label="non-veg">🍗</span> Non-Veg
                          </span>
                        )}
                      </div>
                      <div className="absolute top-2 right-2">
                        {item.isAvailable ? (
                          <span title="Available" className="inline-flex items-center px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium shadow">
                            <span role="img" aria-label="available">✔️</span> Available
                          </span>
                        ) : (
                          <span title="Not Available" className="inline-flex items-center px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium shadow">
                            <span role="img" aria-label="not-available">❌</span> Not Available
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col">
                      <h3 className="text-lg sm:text-xl font-bold text-indigo-900 mb-1 truncate flex items-center gap-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base sm:text-lg font-semibold text-indigo-700">₹{item.price}</span>
                      </div>
                      <button
                        onClick={() => handleEditClick(item)}
                        className="mt-3 w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No menu items found.</p>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 px-4 sm:px-6">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="mb-4 w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm sm:text-base"
            >
              &larr; Back
            </button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Edit Menu Item</h2>
            {editError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">{editError}</div>
            )}
            {editSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">{editSuccess}</div>
            )}

            {!showDeleteConfirm ? (
              <form onSubmit={handleUpdateSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:gap-5">
                  <div>
                    <label htmlFor="editItemName" className="block text-sm font-medium text-gray-700">Item Name</label>
                    <input
                      type="text"
                      id="editItemName"
                      value={editItemName}
                      onChange={(e) => setEditItemName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black text-sm sm:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="editItemPrice" className="block text-sm font-medium text-gray-700">Item Price</label>
                    <input
                      type="number"
                      id="editItemPrice"
                      value={editItemPrice}
                      onChange={(e) => setEditItemPrice(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black text-sm sm:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="editDescription"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black text-sm sm:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                      placeholder="Short description of the dish (optional)"
                    />
                  </div>
                  <div>
                    <label htmlFor="editIngredients" className="block text-sm font-medium text-gray-700">Ingredients (comma-separated)</label>
                    <input
                      type="text"
                      id="editIngredients"
                      value={editIngredients}
                      onChange={(e) => setEditIngredients(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black text-sm sm:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. Paneer, Tomato, Butter, Spices"
                    />
                  </div>
                  <div>
                    <label htmlFor="editAllergens" className="block text-sm font-medium text-gray-700">Allergens (comma-separated)</label>
                    <input
                      type="text"
                      id="editAllergens"
                      value={editAllergens}
                      onChange={(e) => setEditAllergens(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black text-sm sm:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. Dairy, Nuts (optional)"
                    />
                  </div>
                  <div>
                    <label htmlFor="editPreparationTime" className="block text-sm font-medium text-gray-700">
                      Preparation Time (minutes)
                      <span className="ml-1 text-xs text-gray-500">Required for accurate delivery estimates</span>
                    </label>
                    <input
                      type="number"
                      id="editPreparationTime"
                      value={editPreparationTime}
                      onChange={(e) => setEditPreparationTime(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black text-sm sm:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. 20"
                      min="1"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter the average time needed to prepare this item (in minutes)</p>
                  </div>
                  <div>
                    <label htmlFor="editCalories" className="block text-sm font-medium text-gray-700">Calories</label>
                    <input
                      type="text"
                      id="editCalories"
                      value={editCalories}
                      onChange={(e) => setEditCalories(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black text-sm sm:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. 350 (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={editItemCategory}
                      onChange={(e) => setEditItemCategory(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-black text-sm sm:text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Availability</label>
                    <div className="mt-2 flex items-center">
                      <input
                        type="checkbox"
                        id="editIsAvailable"
                        checked={editIsAvailable}
                        onChange={(e) => setEditIsAvailable(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="editIsAvailable" className="ml-2 block text-sm text-gray-900">Available</label>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="editItemImage" className="block text-sm font-medium text-gray-700">New Image (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditItemImage(e.target.files[0])}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 text-black"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between items-center pt-4 sm:pt-5 space-y-3 sm:space-y-0 sm:gap-4">
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="w-full sm:w-auto px-4 py-2 border border-red-500 rounded-md shadow-sm text-sm font-medium text-red-500 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                  <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                      {editLoading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        'Update Item'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm sm:text-base md:text-lg text-gray-800">Are you sure you want to delete this item?</p>
                <div className="flex flex-col sm:flex-row sm:justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={editLoading}
                    className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
                  >
                    {editLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <footer className="bg-white text-black py-4 text-center border-t border-gray-200 text-sm">
        &copy; {new Date().getFullYear()} Namma Bites. All rights reserved.
      </footer>
    </div>
  );
};

export default MenuEntry;