import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ClassTabs = () => {
  // const { user } = useSelector((state) => state.auth);
  const { classId } = useParams();
  console.log(classId)
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subjects');

  const tabs = [
    { id: 'subjects', label: 'Subjects', icon: 'ph-book-open' },
    { id: 'teachers', label: 'Class Teachers', icon: 'ph-user-gear' },
    { id: 'marks', label: 'Marks', icon: 'ph-chart-line' },
    { id: 'marks-config', label: 'Marks Config', icon: 'ph-gear' },
  ];

  // useEffect(() => {
  //   if (!classId || !classId.match(/^class-\d+$/)) {
  //     navigate('/class-management');
  //   }
  // }, [classId, navigate]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    navigate(`/class-management/${classId}/${tabId}`);
  };

  return (
    <div>
      <section className="py-5">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center mb-1">
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
              onClick={() => navigate('/class-management')}
            >
              <i className=" text-lg"></i> Back
            </button>
          </div>
          <div className="grid grid-cols-1">
            <div>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  {/* <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <i className="ph ph-chalkboard text-2xl text-gray-500" />
                  </div> */}
                  <div>
                    <h6 className="text-xl font-bold ml-6">
                      <span className="text-base font-normal text-gray-600">Class,</span>
                      <br />
                      {classId ? classId.replace('class-', 'Class ') : 'Unknown'}
                    </h6>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-gray-600">Classes Managed: 12</span>
                </div>
              </div>
              <div className="mb-5">
                <ul className="flex flex-wrap gap-2 border-b border-gray-200">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        className={`flex items-center gap-2 px-4 py-2 text-base font-medium ${
                          activeTab === tab.id
                            ? 'border-b-2 border-blue-600 text-blue-600 '
                            : 'text-white hover:text-blue-600 hover:border-b-2 hover:border-blue-600'
                        } transition-all duration-200`}
                        onClick={() => handleTabClick(tab.id)}
                      >
                        <i className={`ph ${tab.icon} text-lg`}></i>
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClassTabs;