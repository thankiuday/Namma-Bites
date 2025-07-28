import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/config';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/admin/AdminLayout';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const CreateVendor = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(''); // Add error state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        establishedDate: '',
        status: 'Closed', // Default to 'Closed' as per model
        image: null,
        scanner: null,
        password: ''
    });

    useEffect(() => {
        // Remove localStorage check for adminToken
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
        if (error) setError(''); // Clear error on input change
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Clear error on submit
        
        try {
            const formDataToSend = new FormData();
            
            // Add all form fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('establishedDate', formData.establishedDate);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('password', formData.password);
            
            // Add image if it exists
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }
            // Add scanner if it exists
            if (formData.scanner) {
                formDataToSend.append('scanner', formData.scanner);
            }
            
            const response = await api.post('/vendor/create', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                toast.success('Vendor created successfully');
                navigate('/admin/vendor');
            } else {
                setError(response.data.message || 'Failed to create vendor');
                toast.error(response.data.message || 'Failed to create vendor');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create vendor';
            setError(errorMessage); // Set error for display
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Vendor</h1>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 font-medium text-center">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-gray-900 py-3 px-4 text-base"
                            placeholder="e.g. Anand Sweets"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-gray-900 py-3 px-4 text-base"
                            placeholder="e.g. vendor@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-gray-900 pr-10 py-3 px-4 text-base"
                                placeholder="Enter vendor's password minimum 6 characters"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="h-5 w-5" />
                                ) : (
                                    <FaEye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-gray-900 py-3 px-4 text-base"
                            placeholder="e.g. 9876543210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Established Date</label>
                        <input
                            type="date"
                            name="establishedDate"
                            value={formData.establishedDate}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-gray-900 py-3 px-4 text-base"
                            placeholder="Select date"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-gray-900 py-3 px-4 text-base"
                            placeholder="Select status"
                        >
                            <option value="Open">Open</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vendor Image</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleChange}
                            accept="image/*"
                            required
                            className="mt-1 block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-semibold
                              file:bg-orange-50 file:text-orange-700
                              hover:file:bg-orange-100"
                            placeholder="Upload vendor image"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Google Pay Scanner </label>
                        <input
                            type="file"
                            name="scanner"
                            onChange={handleChange}
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-semibold
                              file:bg-orange-50 file:text-orange-700
                              hover:file:bg-orange-100"
                            placeholder="Upload scanner image (optional)"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Creating...' : 'Create Vendor'}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default CreateVendor; 