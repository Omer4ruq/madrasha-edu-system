import React, { useState } from 'react';
import { useCreateStudentSectionApiMutation } from '../../redux/features/api/studentSectionApi';


const AddSection = () => {
  const [sectionName, setSectionName] = useState('');
  const [createSection, { isLoading, error }] = useCreateStudentSectionApiMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      alert('Please enter a section name');
      return;
    }

    try {
      const payload = {
        name: sectionName.trim(),
        is_active: true, // Explicitly include is_active as per JSON structure
      };
      await createSection(payload).unwrap();
      alert('Section created successfully!');
      setSectionName(''); // Reset input field
    } catch (err) {
      console.error('Error creating section:', err);
      alert(`Failed to create section: ${err.status || 'Unknown error'} - ${JSON.stringify(err.data || {})}`);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-0">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-2xl font-bold mb-6">Add Section</h2>
        
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="sectionName" className="block text-gray-700 font-medium mb-2">
                Section Name
              </label>
              <input
                type="text"
                id="sectionName"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter section name (e.g., Section A)"
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="mb-4 text-red-600">
                Error: {error.status || 'Unknown'} - {JSON.stringify(error.data || {})}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-green disabled:bg-gray-400"
            >
              {isLoading ? 'Creating...' : 'Create Section'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSection;