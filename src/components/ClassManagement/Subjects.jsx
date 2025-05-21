import React from 'react';
import { useParams } from 'react-router-dom';

const Subjects = () => {
  const { classId } = useParams();

  // Mock data for subjects (replace with API call)
  const subjects = [
    { id: 1, name: 'Mathematics', code: 'MATH101', credits: 4 },
    { id: 2, name: 'Science', code: 'SCI102', credits: 4 },
    { id: 3, name: 'English', code: 'ENG103', credits: 3 },
    { id: 4, name: 'History', code: 'HIS104', credits: 3 },
  ];

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        Subjects for {classId.replace('class-', 'Class ')}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-sm font-semibold text-gray-600 py-4 px-6 text-left">Subject Name</th>
              <th className="text-sm font-semibold text-gray-600 py-4 px-6 text-left">Code</th>
              <th className="text-sm font-semibold text-gray-600 py-4 px-6 text-left">Credits</th>
              <th className="text-sm font-semibold text-gray-600 py-4 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <tr
                  key={subject.id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="py-4 px-6 text-gray-900 text-sm font-medium">{subject.name}</td>
                  <td className="py-4 px-6 text-gray-600 text-sm">{subject.code}</td>
                  <td className="py-4 px-6 text-gray-600 text-sm">{subject.credits}</td>
                  <td className="py-4 px-6">
                    <button className="bg-blue-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200">
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-600 text-base">
                  No subjects available for this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subjects;