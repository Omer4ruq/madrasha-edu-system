import React, { useState, useEffect } from 'react';
import { useCreateRoleTypeMutation, useDeleteRoleTypeMutation, useGetRoleTypesQuery, useUpdateRoleTypeMutation } from '../../redux/features/api/roleType/roleTypesApi';


const AddRoleTypes = () => {
  const [formData, setFormData] = useState({
    name: '',
    bn_name: '',
    status: 'Active'
  });
  const [editingId, setEditingId] = useState(null);

  const { data: roleTypes, isLoading, error } = useGetRoleTypesQuery();
  const [createRoleType] = useCreateRoleTypeMutation();
  const [updateRoleType] = useUpdateRoleTypeMutation();
  const [deleteRoleType] = useDeleteRoleTypeMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Deactive' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRoleType({ id: editingId, ...formData }).unwrap();
      } else {
        await createRoleType(formData).unwrap();
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save role type:', err);
    }
  };

  const handleEdit = (roleType) => {
    setFormData({
      name: roleType.name,
      bn_name: roleType.bn_name,
      status: roleType.status
    });
    setEditingId(roleType.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoleType(id).unwrap();
    } catch (err) {
      console.error('Failed to delete role type:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      bn_name: '',
      status: 'Active'
    });
    setEditingId(null);
  };

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error.message}</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 transform transition-all duration-300">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          {editingId ? 'Edit Role Type' : 'Create Role Type'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
              Name
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter role name"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="bn_name">
              Bangla Name
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
              id="bn_name"
              type="text"
              name="bn_name"
              value={formData.bn_name}
              onChange={handleInputChange}
              required
              lang="bn"
              placeholder="Enter Bangla name"
            />
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.status === 'Active'}
                onChange={handleStatusChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 text-sm font-medium">Active Status</span>
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5"
              type="submit"
            >
              {editingId ? 'Update Role' : 'Create Role'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Role Types List</h3>
        {roleTypes?.length === 0 ? (
          <p className="text-gray-500 text-center">No role types found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roleTypes?.map((roleType) => (
              <div
                key={roleType.id}
                className="bg-gray-50 rounded-lg p-6 flex justify-between items-center hover:shadow-md transition-all duration-200"
              >
                <div>
                  <p className="font-semibold text-gray-800">{roleType.name}</p>
                  <p className="text-gray-600">{roleType.bn_name}</p>
                  <p className={`text-sm font-medium ${roleType.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {roleType.status}
                  </p>
                </div>
                <div className="space-x-3">
                  <button
                    onClick={() => handleEdit(roleType)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(roleType.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddRoleTypes;