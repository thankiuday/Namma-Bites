import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSubscriptionPlan, getSubscriptionPlans, updateSubscriptionPlan, deleteSubscriptionPlan } from '../api/vendorApi';
import apiClient from '../api/apiClient';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
const durations = [7, 15, 30];
const planTypes = [
  { value: 'veg', label: 'Veg' },
  { value: 'non-veg', label: 'Non-Veg' }
];

const Subscription = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    duration: 7,
    price: '',
    planType: 'veg',
    weekMeals: days.reduce((acc, day) => {
      acc[day] = { breakfast: '', lunch: '', dinner: '', snacks: '' };
      return acc;
    }, {})
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    // Fetch vendor's menu items
    apiClient.get('/vendor/menu-items')
      .then(res => setMenuItems(res.data.data || []))
      .catch(() => setMenuItems([]));
    // Fetch existing plans
    getSubscriptionPlans()
      .then(res => setPlans(res.data.data || []))
      .catch(() => setPlans([]));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMealChange = (day, meal, value) => {
    setForm(f => ({
      ...f,
      weekMeals: {
        ...f.weekMeals,
        [day]: {
          ...f.weekMeals[day],
          [meal]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Validate all meals selected
      for (const day of days) {
        for (const meal of mealTypes) {
          if (!form.weekMeals[day][meal]) {
            setError(`Select a menu item for ${meal} on ${day}`);
            setLoading(false);
            return;
          }
        }
      }
      const payload = {
        duration: Number(form.duration),
        price: Number(form.price),
        planType: form.planType,
        weekMeals: form.weekMeals
      };
      await createSubscriptionPlan(payload);
      setSuccess('Subscription plan created!');
      setForm({
        duration: 7,
        price: '',
        planType: 'veg',
        weekMeals: days.reduce((acc, day) => {
          acc[day] = { breakfast: '', lunch: '', dinner: '', snacks: '' };
          return acc;
        }, {})
      });
      // Refresh plans
      getSubscriptionPlans().then(res => setPlans(res.data.data || []));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (plan) => {
    setEditingPlan(plan._id);
    setEditForm({
      duration: plan.duration,
      price: plan.price,
      planType: plan.planType || 'veg',
      weekMeals: days.reduce((acc, day) => {
        acc[day] = {};
        mealTypes.forEach(meal => {
          const mealValue = plan.weekMeals[day][meal];
          acc[day][meal] = mealValue && mealValue._id ? mealValue._id : mealValue || '';
        });
        return acc;
      }, {})
    });
    setEditError('');
    setEditSuccess('');
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditMealChange = (day, meal, value) => {
    setEditForm(f => ({
      ...f,
      weekMeals: {
        ...f.weekMeals,
        [day]: {
          ...f.weekMeals[day],
          [meal]: value
        }
      }
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      // Validate all meals selected
      for (const day of days) {
        for (const meal of mealTypes) {
          if (!editForm.weekMeals[day][meal]) {
            setEditError(`Select a menu item for ${meal} on ${day}`);
            setEditLoading(false);
            return;
          }
        }
      }
      const payload = {
        duration: Number(editForm.duration),
        price: Number(editForm.price),
        planType: editForm.planType,
        weekMeals: editForm.weekMeals
      };
      await updateSubscriptionPlan(editingPlan, payload);
      setEditSuccess('Plan updated!');
      setEditingPlan(null);
      setEditForm(null);
      // Refresh plans
      getSubscriptionPlans().then(res => setPlans(res.data.data || []));
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update plan');
    } finally {
      setEditLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    setEditForm(null);
    setEditError('');
    setEditSuccess('');
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) return;
    setDeleteLoading(planId);
    setDeleteError('');
    try {
      await deleteSubscriptionPlan(planId);
      // Refresh plans
      getSubscriptionPlans().then(res => setPlans(res.data.data || []));
      // If editing this plan, cancel edit
      if (editingPlan === planId) cancelEdit();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete plan');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-white text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200 shadow-sm border border-orange-200"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <h2 className="text-3xl font-extrabold mb-6 text-orange-700 drop-shadow text-center">Create Subscription Plan</h2>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-orange-100">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <label className="block font-semibold mb-2 text-gray-700">Duration</label>
              <select name="duration" value={form.duration} onChange={handleChange} className="border border-orange-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 w-full">
                {durations.map(d => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-2 text-gray-700">Price (₹)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className="border border-orange-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 w-full" required min="1" />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-2 text-gray-700">Plan Type</label>
              <select name="planType" value={form.planType} onChange={handleChange} className="border border-orange-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 w-full">
                {planTypes.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-orange-100 bg-orange-50">
            <table className="min-w-full text-sm">
              <thead className="bg-orange-100">
                <tr>
                  <th className="border-b px-3 py-2 text-left text-orange-700 font-bold">Day</th>
                  {mealTypes.map(meal => <th key={meal} className="border-b px-3 py-2 capitalize text-orange-700 font-bold">{meal}</th>)}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr key={day} className="even:bg-orange-50">
                    <td className="px-3 py-2 font-semibold text-gray-800 bg-orange-100 rounded-l-lg">{day}</td>
                    {mealTypes.map(meal => (
                      <td key={meal} className="px-3 py-2">
                        <select
                          value={form.weekMeals[day][meal]}
                          onChange={e => handleMealChange(day, meal, e.target.value)}
                          className="border border-orange-300 rounded-lg px-2 py-1 w-full text-gray-900 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                          required
                        >
                          <option value="">Select</option>
                          {menuItems.map(item => (
                            <option key={item._id} value={item._id}>{item.name}</option>
                          ))}
                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4 text-center">
              <span className="font-semibold">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mt-4 text-center">
              <span className="font-semibold">{success}</span>
            </div>
          )}
          <button type="submit" className="mt-6 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold shadow-lg transition-all duration-200 w-full md:w-auto">
            {loading ? 'Saving...' : 'Create Plan'}
          </button>
        </form>

        <h2 className="text-2xl font-extrabold mb-4 text-orange-700 drop-shadow text-center">Your Subscription Plans</h2>
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-orange-100">
          {plans.length === 0 ? (
            <div className="text-gray-700 text-center py-8">No plans found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-orange-100 bg-orange-50">
              <table className="min-w-full text-sm">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="border-b px-3 py-2 text-left text-orange-700 font-bold">Duration</th>
                    <th className="border-b px-3 py-2 text-left text-orange-700 font-bold">Price</th>
                    <th className="border-b px-3 py-2 text-left text-orange-700 font-bold">Created</th>
                    <th className="border-b px-3 py-2 text-left text-orange-700 font-bold">Type</th>
                    <th className="border-b px-3 py-2 text-left text-orange-700 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(plan => (
                    <tr key={plan._id} className="even:bg-orange-50">
                      <td className="px-3 py-2 text-gray-900">{plan.duration} days</td>
                      <td className="px-3 py-2 text-gray-900">₹{plan.price}</td>
                      <td className="px-3 py-2 text-gray-900">{new Date(plan.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-gray-900">{plan.planType ? (plan.planType === 'veg' ? 'Veg' : 'Non-Veg') : 'Veg'}</td>
                      <td className="px-3 py-2 text-gray-900 flex gap-2">
                        <button onClick={() => startEdit(plan)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mr-2 px-3 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all duration-150">
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(plan._id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1 px-3 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-all duration-150"
                          disabled={deleteLoading === plan._id}
                        >
                          {deleteLoading === plan._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4 text-center">
              <span className="font-semibold">{deleteError}</span>
            </div>
          )}
        </div>

        {editingPlan && editForm && (
          <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-orange-100">
            <h3 className="text-xl font-extrabold mb-4 text-orange-700 drop-shadow text-center">Edit Subscription Plan</h3>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1">
                <label className="block font-semibold mb-2 text-gray-700">Duration</label>
                <select name="duration" value={editForm.duration} onChange={handleEditChange} className="border border-orange-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 w-full">
                  {durations.map(d => <option key={d} value={d}>{d} days</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-2 text-gray-700">Price (₹)</label>
                <input type="number" name="price" value={editForm.price} onChange={handleEditChange} className="border border-orange-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 w-full" required min="1" />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-2 text-gray-700">Plan Type</label>
                <select name="planType" value={editForm.planType} onChange={handleEditChange} className="border border-orange-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 w-full">
                  {planTypes.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-orange-100 bg-orange-50">
              <table className="min-w-full text-sm">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="border-b px-3 py-2 text-left text-orange-700 font-bold">Day</th>
                    {mealTypes.map(meal => <th key={meal} className="border-b px-3 py-2 capitalize text-orange-700 font-bold">{meal}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    <tr key={day} className="even:bg-orange-50">
                      <td className="px-3 py-2 font-semibold text-gray-800 bg-orange-100 rounded-l-lg">{day}</td>
                      {mealTypes.map(meal => (
                        <td key={meal} className="px-3 py-2">
                          <select
                            value={editForm.weekMeals[day][meal]}
                            onChange={e => handleEditMealChange(day, meal, e.target.value)}
                            className="border border-orange-300 rounded-lg px-2 py-1 w-full text-gray-900 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            required
                          >
                            <option value="">Select</option>
                            {menuItems.map(item => (
                              <option key={item._id} value={item._id}>{item.name}</option>
                            ))}
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4 text-center">
                <span className="font-semibold">{editError}</span>
              </div>
            )}
            {editSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mt-4 text-center">
                <span className="font-semibold">{editSuccess}</span>
              </div>
            )}
            <div className="flex gap-4 mt-6 justify-center">
              <button type="submit" className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold shadow-lg transition-all duration-200" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Update Plan'}
              </button>
              <button type="button" onClick={cancelEdit} className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-bold shadow-lg transition-all duration-200">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Subscription; 