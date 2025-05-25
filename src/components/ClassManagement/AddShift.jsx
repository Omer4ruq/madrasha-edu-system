import React, { useState } from 'react';
import {
  useCreateStudentShiftApiMutation,
  useGetStudentShiftApiQuery,
  useUpdateStudentShiftApiMutation,
  useDeleteStudentShiftApiMutation,
} from '../../redux/features/api/studentShiftApi';

const AddShift = () => {
  const [shiftName, setShiftName] = useState('');
  const [editShiftId, setEditShiftId] = useState(null);
  const [editShiftName, setEditShiftName] = useState('');

  // API hooks
  const { data: shiftData, isLoading: isShiftLoading, error: shiftDataError } = useGetStudentShiftApiQuery();
  const [createShift, { isLoading: isCreating, error: createError }] = useCreateStudentShiftApiMutation();
  const [updateShift] = useUpdateStudentShiftApiMutation();
  const [deleteShift] = useDeleteStudentShiftApiMutation();

  // Log shiftData for debugging
  console.log('shiftData:', shiftData);

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
      console.log('Create Shift Payload:', payload);
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
      console.log('Update Shift Payload:', { id: editShiftId, ...payload });
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
      console.log('Toggle Active Payload:', { id: shift.id, ...payload });
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
        console.log('Deleting Shift ID:', id);
        await deleteShift(id).unwrap();
        alert('Shift deleted successfully!');
      } catch (err) {
        console.error('Error deleting shift:', err);
        alert(`Failed to delete shift: ${err.status || 'Unknown error'} - ${JSON.stringify(err.data || {})}`);
      }
    }
  };

  return (
    <div className="py-10 px-4 sm:px-0">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Add Shift</h2>

        {/* Form to Add Shift */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative border-2 border-purple-700 rounded-lg p-4 flex-1">
              <label
                htmlFor="shiftName"
                className="absolute -top-3 left-4 bg-white px-2 text-purple-700 text-sm"
              >
                Shift Name
              </label>
              <input
                type="text"
                id="shiftName"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                placeholder="Enter shift name (e.g., Day Shift)"
                disabled={isCreating}
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-orange-500 disabled:bg-gray-400"
            >
              {isCreating ? 'Creating...' : 'Create Shift'}
            </button>
          </form>
          {createError && (
            <div className="mt-4 text-red-600">
              Error: {createError.status || 'Unknown'} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Shift Form (appears when editing) */}
        {editShiftId && (
          <div className="bg-white border border-gray-200 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">Edit Shift</h3>
            <form onSubmit={handleUpdate} className="flex gap-4 items-center">
              <div className="relative border-2 border-purple-700 rounded-lg p-4 flex-1">
                <label
                  htmlFor="editShiftName"
                  className="absolute -top-3 left-4 bg-white px-2 text-purple-700 text-sm"
                >
                  Shift Name
                </label>
                <input
                  type="text"
                  id="editShiftName"
                  value={editShiftName}
                  onChange={(e) => setEditShiftName(e.target.value)}
                  className="w-full bg-transparent focus:outline-none"
                  placeholder="Edit shift name"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Update Shift
              </button>
              <button
                type="button"
                onClick={() => setEditShiftId(null)}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Shifts Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold p-4 border-b border-gray-200">Shifts List</h3>
          {isShiftLoading ? (
            <p className="p-4">Loading shifts...</p>
          ) : shiftDataError ? (
            <p className="p-4 text-red-600">
              Error loading shifts: {shiftDataError.status || 'Unknown'} -{' '}
              {JSON.stringify(shiftDataError.data || {})}
            </p>
          ) : shiftData?.length === 0 ? (
            <p className="p-4">No shifts available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shift Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shiftData?.map((shift) => (
                    <tr key={shift.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shift.name} 
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shift.is_active}
                            onChange={() => handleToggleActive(shift)}
                            className="form-checkbox h-5 w-5 text-purple-700"
                          />
                          <span className="ml-2">{shift.is_active ? 'Active' : 'Inactive'}</span>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(shift.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(shift.updated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(shift)}
                          className="text-blue-600 hover:text-blue-800 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(shift.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
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