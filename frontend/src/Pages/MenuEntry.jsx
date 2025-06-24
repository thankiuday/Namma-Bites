import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import vendorApi from '../api/vendorApi'; 
import VendorNavbar from '../components/vendor/VendorNavbar';

const MenuEntry = () => {
  const navigate = useNavigate();
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategory, setItemCategory] = useState('veg');
  const [itemImage, setItemImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [fetchingItems, setFetchingItems] = useState(true);
  
  // State for filtering and sorting
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editItemCategory, setEditItemCategory] = useState('');
  const [editItemImage, setEditItemImage] = useState(null);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    setItemImage(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!itemName || !itemPrice || !itemImage) {
      setError('Please fill out all fields and select an image.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', itemName);
    formData.append('price', itemPrice);
    formData.append('category', itemCategory);
    formData.append('image', itemImage);

    try {
      const res = await vendorApi.post('/menu-items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSuccess('Menu item added successfully!');
        handleCancel(); // Clear form on success
        fetchMenuItems(); // Refresh the list of menu items
      } else {
        setError(res.data.message || 'Failed to add menu item.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setEditItemName(item.name);
    setEditItemPrice(item.price);
    setEditItemCategory(item.category);
    setEditItemImage(null); // Reset file input
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

    if (sortBy === 'recent') {
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'price-asc') {
      items.sort((a, b) => a.price - b.price);
    }

    return items;
  }, [menuItems, filterCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <VendorNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Form Section */}
          <div className="bg-white p-8 rounded-lg shadow-md mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Menu Item</h1>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700">Item Price</label>
                <input
                  type="number"
                  id="itemPrice"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <div className="mt-2 flex items-center">
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Item Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setItemImage(e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                  {loading ? 'Inserting...' : 'Insert'}
                </button>
              </div>
            </form>
          </div>

          {/* Menu Items Display Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Menu Items</h2>
              <div className="flex items-center space-x-4">
                {/* Category Filter */}
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm text-black"
                >
                  <option value="all">All Categories</option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non-Veg</option>
                </select>
                {/* Sort By Dropdown */}
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm text-black"
                >
                  <option value="recent">Most Recent</option>
                  <option value="price-asc">Price: Low to High</option>
                </select>
              </div>
            </div>

            {fetchingItems ? (
              <div className="text-center">Loading items...</div>
            ) : filteredAndSortedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredAndSortedItems.map((item) => (
                  <div 
                    key={item._id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                    onClick={() => handleEditClick(item)}
                  >
                    <img 
                      src={`http://localhost:5000${item.image}`} 
                      alt={item.name} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-600 mt-1">₹{item.price}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                        item.category === 'veg' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No items match the current filters.</p>
            )}
          </div>
        </div>
      </main>

      {/* Edit Item Modal */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Menu Item</h2>

            {editError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{editError}</div>}
            {editSuccess && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{editSuccess}</div>}

            {!showDeleteConfirm ? (
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label htmlFor="editItemName" className="block text-sm font-medium text-gray-700">Item Name</label>
                  <input
                    type="text"
                    id="editItemName"
                    value={editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                    className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm"
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
                    className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={editItemCategory}
                    onChange={(e) => setEditItemCategory(e.target.value)}
                    className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditItemImage(e.target.files[0])}
                    className="mt-1 block w-full text-sm"
                  />
                </div>
                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      disabled={editLoading}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-red-300"
                    >
                      Delete
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                      {editLoading ? 'Saving...' : 'Apply Changes'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                <p className="text-gray-600 mb-6">This action cannot be undone. The item will be permanently deleted.</p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={editLoading}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={editLoading}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    {editLoading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuEntry; 