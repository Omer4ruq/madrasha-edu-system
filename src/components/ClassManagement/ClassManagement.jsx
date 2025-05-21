import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IoSchool } from "react-icons/io5";

const ClassManagement = () => {
  // const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Define class options (Class 1 to Class 12)
  const classOptions = Array.from({ length: 12 }, (_, i) => ({
    id: `class-${i + 1}`,
    label: `Class ${i + 1}`,
    icon: 'ph-chalkboard',
    path: `/class-management/class-${i + 1}`,
  }));

  const handleOptionClick = (classId) => {
    navigate(`/class-management/${classId}/subjects`);
  };

  return (
    <div>
      <section className="py-10 px-4 sm:px-0">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1">
            <div>
              <div className="flex items-center justify-between mb-10">
                {/* <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <i className="ph ph-user text-2xl text-gray-500" />
                  </div>
                  <div>
                    <h6 className="text-xl font-bold">
                      <span className="text-base font-normal text-gray-600">Hello,</span>
                      <br />
                      {user?.name || 'User'}
                    </h6>
                  </div>
                </div> */}
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-gray-600">
                    Classes Managed: {classOptions.length}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {classOptions.map((option) => (
                  <div key={option.id}>
                    <div
                      onClick={() => handleOptionClick(option.id)}
                      className="border bg-white border-gray-200 rounded-lg p-6 text-center hover:border-blue-600 hover:shadow-md transition-all duration-200  cursor-pointer min-h-[200px] flex flex-col justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4 mx-auto ">
                        <IoSchool className='text-black text-9xl'/> 
                      </div>
                      <h6 className="text-base font-semibold text-gray-900">{option.label}</h6>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClassManagement;