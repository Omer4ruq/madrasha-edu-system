import React, { useState } from 'react';
import {
  useCreateStudentShiftApiMutation,
  useGetStudentShiftApiQuery,
  useUpdateStudentShiftApiMutation,
  useDeleteStudentShiftApiMutation,
} from '../../redux/features/api/student/studentShiftApi';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoTime } from 'react-icons/io5';

const AddShift = () => {
  const [shiftName, setShiftName] = useState('');
  const [editShiftId, setEditShiftId] = useState(null);
  const [editShiftName, setEditShiftName] = useState('');

  // API hooks
  const { data: shiftData, isLoading: isShiftLoading, error: shiftDataError } = useGetStudentShiftApiQuery();
  const [createShift, { isLoading: isCreating, error: createError }] = useCreateStudentShiftApiMutation();
  const [updateShift] = useUpdateStudentShiftApiMutation();
  const [deleteShift] = useDeleteStudentShiftApiMutation();

  // Handle form submission for creating a new shift
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shiftName.trim()) {
      alert('Please enter a shift name');
      return;
    }

    try {
      const payload = {
        name: shiftName.trim(),
        is_active: true,
      };
      await createShift(payload).unwrap();
      alert('Shift created successfully!');
      setShiftName('');
    } catch (err) {
      console.error('Error creating shift:', err);
      alert(`Failed to create shift: ${err.status || 'Unknown error'} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle edit button click
  const handleEditClick = (shift) => {
    setEditShiftId(shift.id);
    setEditShiftName(shift.name);
  };

  // Handle update shift
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editShiftName.trim()) {
      alert('Please enter a shift name');
      return;
    }

    const selectedShift = shiftData?.find((shift) => shift.id === editShiftId);
    if (!selectedShift) {
      alert('Selected shift not found. Please try again.');
      return;
    }

    try {
      const payload = {
        name: editShiftName.trim(),
        is_active: selectedShift.is_active || true,
      };
      await updateShift({ id: editShiftId, ...payload }).unwrap();
      alert('Shift updated successfully!');
      setEditShiftId(null);
      setEditShiftName('');
    } catch (err) {
      console.error('Error updating shift:', err);
      alert(`Failed to update shift: ${err.status || 'Unknown error'} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (shift) => {
    if (!shift?.id) {
      alert('Invalid shift ID. Please try again.');
      return;
    }

    try {
      const payload = {
        name: shift.name,
        is_active: !shift.is_active,
      };
      await updateShift({ id: shift.id, ...payload }).unwrap();
      alert(`Shift ${shift.name} is now ${!shift.is_active ? 'active' : 'inactive'}!`);
    } catch (err) {
      console.error('Error toggling shift active status:', err);
      alert(`Failed to toggle active status: ${err.status || 'Unknown error'} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle delete shift
  const handleDelete = async (id) => {
    if (!id) {
      alert('Invalid shift ID. Please try again.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await deleteShift(id).unwrap();
        alert('Shift deleted successfully!');
      } catch (err) {
        console.error('Error deleting shift:', err);
        alert(`Failed to delete shift: ${err.status || 'Unknown error'} - ${JSON.stringify(err.data || {})}`);
      }
    }
  };

  return (
    <div className="py-8 w-full relative">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .tick-glow {
            transition: all 0.3s ease;
          }
          .tick-glow:checked + span {
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(22, 31, 48, 0.26);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(10, 13, 21, 0.44);
          }
        `}
      </style>

      <div className="mx-auto">
        {/* <div className="flex items-center space-x-4 mb-10 animate-fadeIn">
          <IoTime className="text-4xl text-[#441a05]" />
          <h2 className="text-3xl font-bold text-[#441a05] tracking-tight">Add Shift</h2>
        </div> */}

        {/* Form to Add Shift */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoTime className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Add New Shift</h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <input
              type="text"
              id="shiftName"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Enter shift name (e.g., Day Shift)"
              disabled={isCreating}
              aria-label="Shift Name"
              aria-describedby={createError ? "shift-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="Create a new shift"
              className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isCreating ? 'cursor-not-allowed opacity-60' : 'hover:text-white'
              }`}
            >
              {isCreating ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Creating...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>Create Shift</span>
                </span>
              )}
            </button>
          </form>
          {createError && (
            <div
              id="shift-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              Error: {createError.status || 'Unknown'} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Shift Form */}
        {editShiftId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Edit Shift</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editShiftName"
                value={editShiftName}
                onChange={(e) => setEditShiftName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="Edit shift name (e.g., Day Shift)"
                aria-label="Edit Shift Name"
                aria-describedby="edit-shift-error"
              />
              <button
                type="submit"
                title="Update shift"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                Update Shift
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditShiftId(null);
                  setEditShiftName('');
                }}
                title="Cancel editing"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Shifts Table */}
        <div className="bg-black/10 px-6 py-2 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] border border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Shifts List</h3>
          {isShiftLoading ? (
            <p className="p-4 text-[#441a05]/70">Loading shifts...</p>
          ) : shiftDataError ? (
            <p className="p-4 text-red-400">
              Error loading shifts: {shiftDataError.status || 'Unknown'} -{' '}
              {JSON.stringify(shiftDataError.data || {})}
            </p>
          ) : shiftData?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">No shifts available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Shift Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Updated At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {shiftData?.map((shift, index) => (
                    <tr
                      key={shift.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {shift.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shift.is_active}
                            onChange={() => handleToggleActive(shift)}
                            className="hidden"
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                              shift.is_active
                                ? 'bg-[#DB9E30] border-[#DB9E30]'
                                : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                            }`}
                          >
                            {shift.is_active && (
                              <svg
                                className="w-4 h-4 text-[#441a05] animate-scaleIn"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </span>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(shift.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(shift.updated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(shift)}
                          title="Edit shift"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(shift.id)}
                          title="Delete shift"
                          className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddShift;