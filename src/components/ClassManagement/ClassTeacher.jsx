import React from 'react';
import { useParams } from 'react-router-dom';

const ClassTeacher = () => {
  const { classId } = useParams();

  // Mock data for class teachers (replace with API call)
  const teachers = [
    { id: 1, name: 'John Doe', subject: 'Mathematics', contact: 'john.doe@example.com' },
    { id: 2, name: 'Jane Smith', subject: 'Science', contact: 'jane.smith@example.com' },
    { id: 3, name: 'Emily Johnson', subject: 'English', contact: 'emily.johnson@example.com' },
    { id: 4, name: 'Michael Brown', subject: 'History', contact: 'michael.brown@example.com' },
  ];

  return (
    <div className="">
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
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(22, 31, 48, 0.26);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(10, 13, 21, 0.44);
          }
        `}
      </style>

      <h3 className="text-lg font-semibold text-[#441a05] mb-6 border-b border-white/20 pb-2 animate-fadeIn">
        Teachers for {classId ? classId.replace('class-', 'Class ') : 'Unknown'}
      </h3>
      <div className="animate-fadeIn overflow-y-auto max-h-[60vh]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  Teacher Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {teachers.length > 0 ? (
                teachers.map((teacher, index) => (
                  <tr
                    key={teacher.id}
                    className="bg-white/5 animate-fadeIn hover:bg-white/10 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                      {teacher.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                      {teacher.contact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="relative inline-flex items-center px-4 py-2 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] hover:text-white btn-glow transition-all duration-300 animate-scaleIn"
                        title="View teacher details"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-8 text-[#441a05]/70 text-base animate-fadeIn"
                  >
                    No teachers assigned to this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassTeacher;