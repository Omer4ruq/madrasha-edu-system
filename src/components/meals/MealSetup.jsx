import React, { useState, useRef, useEffect } from 'react';
import {
  useGetMealSetupApiQuery,
  useCreateMealSetupApiMutation,
  useUpdateMealSetupApiMutation,
  useDeleteMealSetupApiMutation,
} from '../../redux/features/api/meal/mealSetupApi';
import { useGetMealsNameApiQuery } from '../../redux/features/api/meal/mealsNameApi';
import { useGetMealItemApiQuery } from '../../redux/features/api/meal/mealItemApi';

const MealSetup = () => {
  const [formData, setFormData] = useState({
    day: 'SUN',
    is_active: true,
    meal_name: '',
    meal_item: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch data
  const { data: mealSetups = [], isLoading: setupsLoading, error: setupsError } = useGetMealSetupApiQuery();
  const { data: mealNames = [], isLoading: namesLoading, error: namesError } = useGetMealsNameApiQuery();
  const { data: mealItems = [], isLoading: itemsLoading, error: itemsError } = useGetMealItemApiQuery();

  // Mutations
  const [createMealSetup] = useCreateMealSetupApiMutation();
  const [updateMealSetup] = useUpdateMealSetupApiMutation();
  const [deleteMealSetup] = useDeleteMealSetupApiMutation();

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle meal items checkbox changes
  const handleMealItemChange = (itemId) => {
    setFormData((prev) => {
      const mealItems = prev.meal_item.includes(itemId)
        ? prev.meal_item.filter((id) => id !== itemId)
        : [...prev.meal_item, itemId];
      return { ...prev, meal_item: mealItems };
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      day: formData.day,
      is_active: formData.is_active,
      meal_name: Number(formData.meal_name),
      meal_item: formData.meal_item,
    };
    try {
      if (editingId) {
        await updateMealSetup({ id: editingId, ...payload }).unwrap();
        setEditingId(null);
      } else {
        await createMealSetup(payload).unwrap();
      }
      setFormData({ day: 'SUN', is_active: true, meal_name: '', meal_item: [] });
      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Failed to save meal setup:', err);
    }
  };

  // Handle edit button click
  const handleEdit = (setup) => {
    setFormData({
      day: setup.day,
      is_active: setup.is_active,
      meal_name: setup.meal_name.toString(),
      meal_item: setup.meal_item,
    });
    setEditingId(setup.id);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      await deleteMealSetup(id).unwrap();
    } catch (err) {
      console.error('Failed to delete meal setup:', err);
    }
  };

  // Days of the week for dropdown
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
        Meal Setup Dashboard
      </h1>

      {/* Form for creating/updating meal setups */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-10 max-w-2xl mx-auto transition-all duration-300 hover:shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="day" className="block text-sm font-medium text-gray-700">
              Day of the Week
            </label>
            <select
              id="day"
              name="day"
              value={formData.day}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              required
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="meal_name" className="block text-sm font-medium text-gray-700">
              Meal Name
            </label>
            <select
              id="meal_name"
              name="meal_name"
              value={formData.meal_name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              required
            >
              <option value="">Select Meal Name</option>
              {mealNames.map((meal) => (
                <option key={meal.id} value={meal.id}>
                  {meal.name}
                </option>
              ))}
            </select>
          </div>
          <div ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700">
              Meal Items (Select Multiple)
            </label>
            <div className="relative mt-1">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              >
                {formData.meal_item.length > 0
                  ? formData.meal_item
                      .map((itemId) => mealItems.find((item) => item.id === itemId)?.name || 'Unknown')
                      .join(', ')
                  : 'Select Meal Items'}
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {mealItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.meal_item.includes(item.id)}
                        onChange={() => handleMealItemChange(item.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{item.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">Click to select multiple items</p>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-sm text-gray-700">Is Active</span>
            </label>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              {editingId ? 'Update' : 'Create'} Meal Setup
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({ day: 'SUN', is_active: true, meal_name: '', meal_item: [] });
                  setEditingId(null);
                  setIsDropdownOpen(false);
                }}
                className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Display meal setups */}
      {setupsLoading || namesLoading || itemsLoading ? (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : setupsError || namesError || itemsError ? (
        <p className="text-red-500 text-center">
          Error: {setupsError?.message || namesError?.message || itemsError?.message}
        </p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Meal Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Meal Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Updated At</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mealSetups.map((setup) => (
                  <tr key={setup.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{setup.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{setup.day}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mealNames.find((meal) => meal.id === setup.meal_name)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {setup.meal_item
                        .map((itemId) => mealItems.find((item) => item.id === itemId)?.name || 'Unknown')
                        .join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {setup.is_active ? (
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(setup.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(setup.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(setup)}
                        className="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-150 ease-in-out"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(setup.id)}
                        className="text-red-600 hover:text-red-800 transition duration-150 ease-in-out"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealSetup;