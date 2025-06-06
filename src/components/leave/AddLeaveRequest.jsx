import React, { useState, useEffect } from 'react';
import { useSearchJointUsersQuery } from '../../redux/features/api/jointUsers/jointUsersApi';
import { useCreateLeaveRequestApiMutation } from '../../redux/features/api/leave/leaveRequestApi';
import { useGetLeaveApiQuery } from '../../redux/features/api/leave/leaveApi';
import { useGetLeaveRequestApiQuery } from '../../redux/features/api/leave/leaveRequestApi';

const AddLeaveRequest = () => {
  // State for form inputs
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [description, setDescription] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // API hooks
  const { data: users, isLoading: usersLoading } = useSearchJointUsersQuery(searchTerm);
  const { data: leaveTypes, isLoading: leaveTypesLoading } = useGetLeaveApiQuery();
  const { data: leaveRequests, isLoading: leaveRequestsLoading } = useGetLeaveRequestApiQuery();
  const [createLeaveRequestApi, { isLoading: isSubmitting, isSuccess, isError, error }] = useCreateLeaveRequestApiMutation();

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(user.name);
    setShowDropdown(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !startDate || !endDate || !leaveType || !description) {
      alert('Please fill all required fields');
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('user_id', selectedUser.id);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('leave_type', parseInt(leaveType));
    formData.append('leave_description', description);
    formData.append('academic_year', 1);
    formData.append('status', 'PENDING');

    try {
      console.log('Sending formData:', Object.fromEntries(formData)); // Debug payload
      await createLeaveRequestApi(formData).unwrap();
      // Reset form
      setSelectedUser(null);
      setSearchTerm('');
      setStartDate('');
      setEndDate('');
      setLeaveType('');
      setDescription('');
    } catch (err) {
      console.error('Failed to submit leave request:', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add Leave Request</h2>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700">Search User</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            placeholder="Search by name..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          {showDropdown && searchTerm && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {usersLoading ? (
                <div className="p-2">Loading...</div>
              ) : users?.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {user.name} ({user.email})
                  </div>
                ))
              ) : (
                <div className="p-2">No users found</div>
              )}
            </div>
          )}
          {selectedUser && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {selectedUser.name} ({selectedUser.email})
            </div>
          )}
        </div>

        {/* Leave Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select Leave Type</option>
            {leaveTypesLoading ? (
              <option>Loading...</option>
            ) : (
              leaveTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows="4"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
          </button>
          {isSuccess && <p className="mt-2 text-green-600">Leave request submitted successfully!</p>}
          {isError && <p className="mt-2 text-red-600">Error: {error?.data?.detail || 'Failed to submit'}</p>}
        </div>
      </form>

      {/* Leave Requests Table */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Submitted Leave Requests</h3>
        {leaveRequestsLoading ? (
          <p>Loading leave requests...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests?.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{request.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{leaveTypes?.find((lt) => lt.id === request.leave_type)?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.start_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.end_date}</td>
                    <td className="px-6 py-4">{request.leave_description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(request.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddLeaveRequest;