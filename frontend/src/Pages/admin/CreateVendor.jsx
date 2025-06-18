import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/config';
import { toast } from 'react-toastify';

const CreateVendor = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        establishedDate: '',
        status: 'Closed', // Default to 'Closed' as per model
        image: null
    });

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            console.log('Checking auth - Token:', token ? 'exists' : 'missing');
            console.log('User:', user);
            
            if (!token || !user || (user.role !== 'admin' && user.role !== 'super-admin')) {
                console.log('Auth check failed - redirecting to login');
                logout();
                navigate('/admin/login');
            }
        };
        checkAuth();
    }, [user, navigate, logout]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Check token before submission
        const token = localStorage.getItem('accessToken');
        console.log('Submit - Token:', token ? 'exists' : 'missing');
        
        if (!token) {
            console.log('No token found - redirecting to login');
            toast.error('Session expired. Please login again.');
            logout();
            navigate('/admin/login');
            return;
        }

        try {
            const formDataToSend = new FormData();
            
            // Add all form fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phoneNumber', formData.phoneNumber);
            formDataToSend.append('establishedDate', formData.establishedDate);
            formDataToSend.append('status', formData.status);
            
            // Add image if it exists
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            console.log('Sending request to /vendor/create');
            console.log('Form data:', Object.fromEntries(formDataToSend));
            
            const response = await api.post('/vendor/create', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Response received:', response.data);

            if (response.data.success) {
                toast.success('Vendor created successfully');
                // navigate('/admin/vendors');
            } else {
                toast.error(response.data.message || 'Failed to create vendor');
            }
        } catch (error) {
            console.error('Error creating vendor:', error.response?.data || error);
            console.error('Error response:', error.response);
            
            if (error.response?.status === 401) {
                console.log('401 error - redirecting to login');
                toast.error('Session expired. Please login again.');
                logout();
                navigate('/admin/login');
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to create vendor';
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Create New Vendor</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Creating...' : 'Create Vendor'}
                </button>
            </form>
        </div>
    );
};

export default CreateVendor; 