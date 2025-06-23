import React, { useState, useRef, useEffect } from 'react';
import { useGetMealStatusesQuery, useCreateMealStatusMutation, useUpdateMealStatusMutation, useDeleteMealStatusMutation } from '../../redux/features/api/meal/mealStatusApi';

import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css'; // Main CSS file
import 'react-date-range/dist/theme/default.css'; // Theme CSS file
import { useSearchJointUsersQuery } from '../../redux/features/api/jointUsers/jointUsersApi';

const MealStatus = () => {
  const [formData, setFormData] = useState({
    start_time: new Date(),
    end_time: new Date(),
    status: 'ACTIVE',
    remarks: '',
    meal_user: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const dropdownRef = useRef(null);
  const calendarRef = useRef(null);

  // Fetch meal statuses
  const { data: mealStatuses = [], isLoading: statusesLoading, error: statusesError } = useGetMealStatusesQuery();
  // Fetch joint users based on search term
  const { data: jointUsers = [], isLoading: usersLoading } = useSearchJointUsersQuery(searchTerm, { skip: searchTerm.length < 3 });

  // Mutations
  const [createMealStatus] = useCreateMealStatusMutation();
  const [updateMealStatus] = useUpdateMealStatusMutation();
  const [deleteMealStatus] = useDeleteMealStatusMutation();

  // Handle clicks outside dropdown and calendar to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setFormData({ ...formData, meal_user: user.id });
    setSearchTerm(user.name || user.user_id);
    setIsUserDropdownOpen(false);
  };

  // Handle date range selection
  const handleDateRangeSelect = (ranges) => {
    setFormData({
      ...formData,
      start_time: ranges.selection.startDate,
      end_time: ranges.selection.endDate,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.meal_user) {
      alert('Please select a user.');
      return;
    }
    const payload = {
      start_time: format(formData.start_time, 'yyyy-MM-dd'),
      end_time: format(formData.end_time, 'yyyy-MM-dd'),
      status: formData.status,
      remarks: formData.remarks,
      meal_user: formData.meal_user,
    };
    try {
      if (editingId) {
        await updateMealStatus({ id: editingId, ...payload }).unwrap();
        setEditingId(null);
      } else {
        await createMealStatus(payload).unwrap();
      }
      setFormData({
        start_time: new Date(),
        end_time: new Date(),
        status: 'ACTIVE',
        remarks: '',
        meal_user: null,
      });
      setSearchTerm('');
      setIsCalendarOpen(false);
    } catch (err) {
      console.error('Failed to save meal status:', err);
    }
  };

  // Handle edit button click
  const handleEdit = (status) => {
    setFormData({
      start_time: new Date(status.start_time),
      end_time: new Date(status.end_time),
      status: status.status,
      remarks: status.remarks || '',
      meal_user: status.meal_user,
    });
    setSearchTerm(''); // Reset search term; assumes user ID is stored in meal_user
    setEditingId(status.id);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      await deleteMealStatus(id).unwrap();
    } catch (err) {
      console.error('Failed to delete meal status:', err);
    }
  };

  // Date range configuration
  const dateRange = [
    {
      startDate: formData.start_time,
      endDate: formData.end_time,
      key: 'selection',
    },
  ];

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
        Meal Status Management
      </h1>

      {/* Form for creating/updating meal status */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-10 max-w-2xl mx-auto transition-all duration-300 hover:shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div ref={dropdownRef}>
            <label htmlFor="user_search" className="block text-sm font-medium text-gray-700">
              Search User
            </label>
            <input
              id="user_search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsUserDropdownOpen(true)}
              placeholder="Enter name or user ID (min 3 chars)"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              required
            />
            {isUserDropdownOpen && searchTerm.length >= 3 && (
              <div className="absolute z-10 mt-1 w-full max-w-2xl bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {usersLoading ? (
                  <p className="px-4 py-2 text-sm text-gray-500">Loading...</p>
                ) : jointUsers.length > 0 ? (
                  jointUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                    >
                      {user.name || user.user_id}
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-2 text-sm text-gray-500">No users found</p>
                )}
              </div>
            )}
          </div>
          <div ref={calendarRef}>
            <label className="block text-sm font-medium text-gray-700">
              Select Date Range
            </label>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            >
              {format(formData.start_time, 'MMM dd, yyyy')} - {format(formData.end_time, 'MMM dd, yyyy')}
            </button>
            {isCalendarOpen && (
              <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <DateRange
                  ranges={dateRange}
                  onChange={handleDateRangeSelect}
                  moveRangeOnFirstSelection={false}
                  className="rounded-md"
                />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="DEACTIVATE">DEACTIVATE</option>
            </select>
          </div>
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              rows={4}
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              {editingId ? 'Update' : 'Create'} Meal Status
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    start_time: new Date(),
                    end_time: new Date(),
                    status: 'ACTIVE',
                    remarks: '',
                    meal_user: null,
                  });
                  setSearchTerm('');
                  setEditingId(null);
                  setIsCalendarOpen(false);
                }}
                className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Display meal statuses */}
      {statusesLoading ? (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : statusesError ? (
        <p className="text-red-500 text-center">Error: {statusesError.message}</p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Remarks</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Updated At</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mealStatuses.map((status) => (
                  <tr key={status.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{status.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{status.meal_user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(status.start_time), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(status.end_time), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          status.status === 'ACTIVE'
                            ? 'text-green-800 bg-green-100'
                            : 'text-red-800 bg-red-100'
                        }`}
                      >
                        {status.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{status.remarks || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(status.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(status.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(status)}
                        className="text-indigo-600 hover:text-indigo-800 mr-4 transition duration-150 ease-in-out"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(status.id)}
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

export default MealStatus;