import React, { useState } from 'react';
import {
  useCreateStudentSectionApiMutation,
  useGetStudentSectionApiQuery,
  useGetStudentSectionApiByIdQuery,

  useDeleteStudentSectionApiMutation,
  useUpdateStudentSectionApiMutation,
} from '../../redux/features/api/studentSectionApi';

const AddSection = () => {
  const [sectionName, setSectionName] = useState('');
  const [editSectionId, setEditSectionId] = useState(null);
  const [editSectionName, setEditSectionName] = useState('');

  // API hooks
  const { data: sectionData, isLoading: isSectionLoading, error: sectionDataError } = useGetStudentSectionApiQuery();
  const [createSection, { isLoading, error }] = useCreateStudentSectionApiMutation();
  const [updateSection] = useUpdateStudentSectionApiMutation();
  const [deleteSection] = useDeleteStudentSectionApiMutation();
  const { data: sectionByIdData } = useGetStudentSectionApiByIdQuery(editSectionId, { skip: !editSectionId });

  // Handle form submission for creating a new section
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      alert('Please enter a section name');
      return;
    }

    try {
      const payload = {
        name: sectionName.trim(),
        is_active: true,
      };
      await createSection(payload).unwrap();
      alert('Section created successfully!');
      setSectionName('');
    } catch (err) {
      console.error('Error creating section:', err);
      alert(`Failed to create section: ${err.status || 'Unknown error'} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle edit button click
  const handleEditClick = (section) => {
    setEditSectionId(section.id);
    setEditSectionName(section.name);
  };

  // Handle update section
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editSectionName.trim()) {
      alert('Please enter a section name');
      return;
    }

    try {
      const payload = {
        id: editSectionId,
        name: editSectionName.trim(),
        is_active: sectionByIdData?.is_active || true,
      };
      await updateSection(payload).unwrap();
      alert('Section updated successfully!');
      setEditSectionId(null);
      setEditSectionName('');
    } catch (err) {
      console.error('Error updating section:', err);
      alert(`Failed to update section: ${err.status || 'Unknown error'} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle delete section
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await deleteSection(id).unwrap();
        alert('Section deleted successfully!');
      } catch (err) {
        console.error('Error deleting section:', err);
        alert(`Failed to delete section: ${err.status || 'Unknown error'} - ${JSON.stringify(err.data || {})}`);
      }
    }
  };

  return (
    <div className="py-10 px-4 sm:px-0">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Add Section</h2>

        {/* Form to Add Section */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 ">
            <div className="relative border-2 border-purple-700 rounded-lg p-4 flex-1">
              <label
                htmlFor="sectionName"
                className="absolute -top-3 left-4 bg-white px-2 text-purple-700 text-sm"
              >
                Section Name
              </label>
              <input
                type="text"
                id="sectionName"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                placeholder="Enter section name (e.g., Section A)"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Creating...' : 'Create Section'}
            </button>
          </form>
          {error && (
            <div className="mt-4 text-red-600">
              Error: {error.status || 'Unknown'} - {JSON.stringify(error.data || {})}
            </div>
          )}
        </div>

        {/* Edit Section Form (appears when editing) */}
        {editSectionId && (
          <div className="bg-white border border-gray-200 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">Edit Section</h3>
            <form onSubmit={handleUpdate} className="flex gap-4 items-center">
              <div className="relative border-2 border-purple-700 rounded-lg p-4 flex-1">
                <label
                  htmlFor="editSectionName"
                  className="absolute -top-3 left-4 bg-white px-2 text-purple-700 text-sm"
                >
                  Section Name
                </label>
                <input
                  type="text"
                  id="editSectionName"
                  value={editSectionName}
                  onChange={(e) => setEditSectionName(e.target.value)}
                  className="w-full bg-transparent focus:outline-none"
                  placeholder="Edit section name"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Update Section
              </button>
              <button
                type="button"
                onClick={() => setEditSectionId(null)}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Sections Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold p-4 border-b border-gray-200">Sections List</h3>
          {isSectionLoading ? (
            <p className="p-4">Loading sections...</p>
          ) : sectionDataError ? (
            <p className="p-4 text-red-600">
              Error loading sections: {sectionDataError.status || 'Unknown'} -{' '}
              {JSON.stringify(sectionDataError.data || {})}
            </p>
          ) : sectionData?.length === 0 ? (
            <p className="p-4">No sections available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section Name
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
                  {sectionData?.map((section) => (
                    <tr key={section.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {section.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {section.is_active ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(section.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(section.updated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(section)}
                          className="text-blue-600 hover:text-blue-800 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(section.id)}
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

export default AddSection;