import React, { useState } from 'react';
import { useGetClassListApiQuery } from '../../redux/features/api/classListApi';
import { useGetStudentSectionApiQuery } from '../../redux/features/api/studentSectionApi';
import { useGetStudentShiftApiQuery } from '../../redux/features/api/studentShiftApi';
import { useGetStudentClassApIQuery } from '../../redux/features/api/studentClassApi';
import { useCreateClassConfigApiMutation, useDeleteClassConfigApiMutation, useGetclassConfigApiQuery } from '../../redux/features/api/classConfigApi';


const AddClassConfig = () => {
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [shiftId, setShiftId] = useState('');

  // Fetch data from APIs
  const { data: classData, isLoading: classLoading, error: classError } = useGetClassListApiQuery();
  const { data: sectionData, isLoading: sectionLoading, error: sectionError } = useGetStudentSectionApiQuery();
  const { data: shiftData, isLoading: shiftLoading, error: shiftError } = useGetStudentShiftApiQuery();
  const { data: classList, isLoading: isListLoading, error: listError } = useGetStudentClassApIQuery();
  const { data: configurations, isLoading: configLoading, error: configError } = useGetclassConfigApiQuery();

  // API mutations
  const [createClassConfig] = useCreateClassConfigApiMutation();
  const [deleteClassConfig] = useDeleteClassConfigApiMutation();
console.log(classList)
console.log("config", configurations)
  // Handle form submission to create a configuration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (classLoading || sectionLoading || shiftLoading || isListLoading) {
      alert('Please wait, data is still loading');
      return;
    }

    if (classError || sectionError || shiftError || listError) {
      alert('Error loading data. Please try again later.');
      return;
    }

    if (!classId || !sectionId || !shiftId) {
      alert('Please select a class, section, and shift');
      return;
    }
console.log("class id", classId)
console.log("section id", sectionId)
console.log("shift id", shiftId)
    try {
      // Post configuration to API with the specified JSON format
      await createClassConfig({
        is_active: true,
        class_id: parseInt(classId),
        section_id: parseInt(sectionId),
        shift_id: parseInt(shiftId),
      }).unwrap();

      // Reset form
      setClassId('');
      setSectionId('');
      setShiftId('');
    } catch (error) {
      alert('Failed to create configuration: ' + JSON.stringify(error));
    }
  };

  // Handle delete configuration
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await deleteClassConfig(id).unwrap();
      } catch (error) {
        alert('Failed to delete configuration: ' + JSON.stringify(error));
      }
    }
  };

  return (
    <div className="py-10 px-4 sm:px-0">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Class Configuration</h2>

        {/* Form to Create Configuration */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Class Dropdown */}
            <div className="relative border-2 border-purple-700 rounded-lg p-4">
              <label
                htmlFor="classSelect"
                className="absolute -top-3 left-4 bg-white px-2 text-purple-700 text-sm"
              >
                Select Class
              </label>
              <select
                id="classSelect"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                disabled={classLoading || isListLoading}
              >
                <option value="">Select a class</option>
                {classList?.map((cls) => (
                  <option key={cls.id} value={cls?.id}>
                    {cls?.student_class?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Dropdown */}
            <div className="relative border-2 border-purple-700 rounded-lg p-4">
              <label
                htmlFor="sectionSelect"
                className="absolute -top-3 left-4 bg-white px-2 text-purple-700 text-sm"
              >
                Select Section
              </label>
              <select
                id="sectionSelect"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                disabled={sectionLoading}
              >
                <option value="">Select a section</option>
                {sectionData?.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Dropdown */}
            <div className="relative border-2 border-purple-700 rounded-lg p-4">
              <label
                htmlFor="shiftSelect"
                className="absolute -top-3 left-4 bg-white px-2 text-purple-700 text-sm"
              >
                Select Shift
              </label>
              <select
                id="shiftSelect"
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                disabled={shiftLoading}
              >
                <option value="">Select a shift</option>
                {shiftData?.map((shf) => (
                  <option key={shf.id} value={shf.id}>
                    {shf.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-orange-500 h-fit self-end"
              disabled={configLoading}
            >
              Add Configuration
            </button>
          </form>

          {/* Error Messages */}
          {(classError || sectionError || shiftError || listError || configError) && (
            <div className="mt-4 text-red-600">
              {classError && <p>Error loading classes: {JSON.stringify(classError)}</p>}
              {sectionError && <p>Error loading sections: {JSON.stringify(sectionError)}</p>}
              {shiftError && <p>Error loading shifts: {JSON.stringify(shiftError)}</p>}
              {listError && <p>Error loading class list: {JSON.stringify(listError)}</p>}
              {configError && <p>Error loading configurations: {JSON.stringify(configError)}</p>}
            </div>
          )}
        </div>

        {/* Configurations Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold p-4 border-b border-gray-200">Configurations List</h3>
          {(classLoading || sectionLoading || shiftLoading || isListLoading || configLoading) ? (
            <p className="p-4">Loading data...</p>
          ) : !configurations || configurations.length === 0 ? (
            <p className="p-4">No configurations available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shift
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configurations.map((config) => (
                    <tr key={config.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {config.class_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {config.section_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {config.shift_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(config.id)}
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

export default AddClassConfig;