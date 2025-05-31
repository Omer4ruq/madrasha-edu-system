import React, { useState } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { IoArrowBack, IoBook, IoSettings, IoStatsChart, IoPerson } from 'react-icons/io5';

const ClassTabs = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subjects');

  const tabs = [
    { id: 'subjects', label: 'Subjects', icon: IoBook },
    { id: 'teachers', label: 'Class Teachers', icon: IoPerson },
    { id: 'marks', label: 'Marks', icon: IoStatsChart },
    { id: 'marks-config', label: 'Marks Config', icon: IoSettings },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    navigate(`/class-management/${classId}/${tabId}`);
  };

  return (
    <div className="py-8 w-full relative">
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

      <section className="mx-auto">
        {/* <div className="flex items-center mb-6 animate-fadeIn">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg font-medium hover:text-white transition-all duration-300 animate-scaleIn"
            onClick={() => navigate('/class-management')}
            title="Back to class management"
          >
            <IoArrowBack className="text-lg" />
            Back
          </button>
        </div> */}

        <div className="grid grid-cols-1">
          <div>
            {/* <div className="flex items-center justify-between mb-10 animate-fadeIn">
              <div className="flex items-center gap-4">
                <div>
                  <h6 className="text-2xl font-bold text-[#441a05] tracking-tight">
                    <span className="text-base font-normal text-[#441a05]/70">Class,</span>
                    <br />
                    {classId ? classId.replace('class-', 'Class ') : 'Unknown'}
                  </h6>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-medium text-[#441a05]/70">Classes Managed: 12</span>
              </div>
            </div> */}

            <div className="mb-6">
              <ul className="flex flex-wrap gap-2 border-b border-white/20">
                {tabs.map((tab, index) => (
                  <li key={tab.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <button
                      className={`flex items-center gap-2 px-4 py-2 text-base font-medium ${
                        activeTab === tab.id
                          ? 'border-b-2 border-[#DB9E30] text-[#DB9E30]'
                          : 'text-[#441a05] hover:text-[#DB9E30] hover:border-b-2 hover:border-[#DB9E30]'
                      } transition-all duration-300`}
                      onClick={() => handleTabClick(tab.id)}
                      title={tab.label}
                    >
                      <tab.icon className="text-lg" />
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-black/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-6 animate-fadeIn">
              <Outlet />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClassTabs;