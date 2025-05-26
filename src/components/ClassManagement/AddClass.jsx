import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSchool } from "react-icons/io5";
import { FaSpinner } from 'react-icons/fa';
import { useGetClassListApiQuery } from '../../redux/features/api/classListApi';
import { useCreateStudentClassApIMutation, useGetStudentClassApIQuery } from '../../redux/features/api/studentClassApi';

const AddClass = () => {
  const navigate = useNavigate();
  const { data: classData, isLoading, error } = useGetClassListApiQuery();
  const { data: classList, isLoading: isListLoading, error: listError } = useGetStudentClassApIQuery();
  const [createClass, { isLoading: isCreating }] = useCreateStudentClassApIMutation();
  const [selectedClasses, setSelectedClasses] = useState({});

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
      const existingClassIds = classList ? classList.map(item => item.student_class.id) : [];
      const classesToCreate = Object.keys(selectedClasses)
        .filter(classId => selectedClasses[classId] && !existingClassIds.includes(parseInt(classId)))
        .map(classId => ({
          student_class_id: parseInt(classId),
          is_active: true
        }));

      if (classesToCreate.length > 0) {
        await Promise.all(classesToCreate.map(classData => createClass(classData).unwrap()));
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

  if (isLoading || isListLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-4 p-6 bg-white rounded-2xl shadow-lg">
          <FaSpinner className="animate-spin text-3xl text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading Classes...</span>
        </div>
      </div>
    );
  }

  if (error || listError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border-l-4 border-red-600 text-red-800 p-6 rounded-2xl shadow-lg max-w-md">
          <p className="font-semibold text-lg">Error</p>
          <p className="mt-2">{error ? JSON.stringify(error) : JSON.stringify(listError)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
        `}
      </style>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <IoSchool className="text-4xl text-blue-600" />
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Add Classes</h2>
          </div>
          <button
            onClick={handleViewClasses}
            className="relative inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow-lg hover:bg-blue-700 btn-glow transition-all duration-300 animate-scaleIn"
          >
            View Classes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Classes</h3>
            <div className="space-y-4">
              {classData?.map((classItem, index) => (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-gray-900 font-medium">{classItem.name}</span>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selectedClasses[classItem.id]}
                      onChange={() => handleToggle(classItem.id)}
                      className="hidden tick-glow"
                    />
                    <span
                      className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${
                        selectedClasses[classItem.id]
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {selectedClasses[classItem.id] && (
                        <svg
                          className="w-4 h-4 text-white animate-scaleIn"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Selected Classes</h3>
            {Object.keys(selectedClasses).length === 0 || !Object.values(selectedClasses).some(v => v) ? (
              <p className="text-gray-500 italic">No classes selected yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(selectedClasses)
                  .filter(id => selectedClasses[id])
                  .map(id => {
                    const classItem = classData?.find(item => item.id === parseInt(id));
                    return classItem ? (
                      <div key={id} className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                        <span className="text-gray-900 font-medium">{classItem.name}</span>
                        <button
                          onClick={() => handleToggle(id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null;
                  })}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isCreating}
                className={`relative inline-flex items-center px-6 py-3 rounded-xl shadow-lg font-medium text-white transition-all duration-300 ${
                  isCreating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 btn-glow'
                } animate-scaleIn`}
              >
                {isCreating ? (
                  <span className="flex items-center space-x-3">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Submitting...</span>
                  </span>
                ) : (
                  'Submit Selected Classes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClass;
