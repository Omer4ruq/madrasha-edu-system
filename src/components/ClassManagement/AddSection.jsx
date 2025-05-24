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
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">Add Section</h2>
        
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <form onSubmit={handleSubmit} className='flex gap-10'>
            <div className="relative border-2 border-purple-700 rounded-lg p-4">
              <label htmlFor="score"
          className="absolute -top-3 left-4 bg-white px-2 text-purple-700 text-sm">
                Section Name
              </label>
              <input
                type="text"
                id="sectionName"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full  bg-transparent focus:outline-none"
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