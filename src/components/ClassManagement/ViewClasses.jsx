import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSchool } from "react-icons/io5";
import { useGetStudentClassApIQuery } from '../../redux/features/api/student/studentClassApi';

const ViewClasses = () => {
  const navigate = useNavigate();
  const { data: classList, isLoading: isListLoading, error: listError } = useGetStudentClassApIQuery();

  const handleOptionClick = (classId) => {
    navigate(`/class-management/${classId}/subjects`);
  };

  if (isListLoading) return <div>Loading...</div>;
  if (listError) return <div>Error loading classes</div>;

  return (
    <div className="py-10 px-4 sm:px-0">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-2xl font-bold mb-6">Managed Classes</h2>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-base font-medium text-gray-600">
            Classes Managed: {classList?.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classList?.map((option) => (
            <div key={option?.id}>
              <div
                onClick={() => handleOptionClick(option?.id)}
                className="border bg-white border-gray-200 rounded-lg p-6 text-center hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer min-h-[200px] flex flex-col justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4 mx-auto">
                  <IoSchool className="text-black text-2xl" />
                </div>
                <h6 className="text-base font-semibold text-gray-900">{option?.name}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewClasses;