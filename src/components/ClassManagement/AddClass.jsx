import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSchool } from "react-icons/io5";
import { useGetClassListApiQuery } from '../../redux/features/api/classListApi';
import { useCreateStudentClassApIMutation, useGetStudentClassApIQuery } from '../../redux/features/api/studentClassApi';

const AddClass = () => {
  const navigate = useNavigate();
  const { data: classData, isLoading, error } = useGetClassListApiQuery();
  const { data: classList, isLoading: isListLoading, error: listError } = useGetStudentClassApIQuery();
  const [createClass, { isLoading: isCreating }] = useCreateStudentClassApIMutation();
  const [selectedClasses, setSelectedClasses] = useState({});

  // Initialize selectedClasses with classes from classList
  useEffect(() => {
    if (classList) {
      const initialSelected = classList.reduce((acc, classItem) => {
        acc[classItem.student_class.id] = true;
        return acc;
      }, {});
      setSelectedClasses(initialSelected);
    }
  }, [classList]);

  const handleToggle = (classId) => {
    setSelectedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };

  const handleSubmit = async () => {
    try {
      // Get IDs of classes already in classList
      const existingClassIds = classList ? classList.map(item => item.student_class.id) : [];
      
      // Filter out classes that are already in classList
      const classesToCreate = Object.keys(selectedClasses)
        .filter(classId => selectedClasses[classId] && !existingClassIds.includes(parseInt(classId)))
        .map(classId => ({
          student_class_id: parseInt(classId), // Convert to number
          is_active: true
        }));
      
      if (classesToCreate.length > 0) {
        await Promise.all(
          classesToCreate.map(classData => createClass(classData).unwrap())
        );
        alert('Selected classes created successfully!');
      } else if (Object.values(selectedClasses).some(v => v)) {
        alert('All selected classes are already added!');
      } else {
        alert('Please select at least one class');
      }
    } catch (err) {
      console.error('Error creating classes:', err);
      alert(`Failed to create classes: ${err.status} - ${JSON.stringify(err.data)}`);
    }
  };

  const handleViewClasses = () => {
    navigate('/class-management/view-classes');
  };

  if (isLoading || isListLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading classes: {JSON.stringify(error)}</div>;
  if (listError) return <div>Error loading class list: {JSON.stringify(listError)}</div>;

  return (
    <div className="py-10 px-4 sm:px-0">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add Classes</h2>
          <button
            onClick={handleViewClasses}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View Classes
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left">Class Name</th>
                <th className="py-3 px-4 text-left">Active Status</th>
              </tr>
            </thead>
            <tbody>
              {classData?.map((classItem) => (
                <tr key={classItem.id} className="border-t">
                  <td className="py-3 px-4">{classItem.name}</td>
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={!!selectedClasses[classItem.id]}
                      onChange={() => handleToggle(classItem.id)}
                      className="h-5 w-5 text-blue-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isCreating ? 'Submitting...' : 'Submit Selected Classes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClass;