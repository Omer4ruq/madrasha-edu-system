
import React, { useState } from 'react';
import { FaBuilding, FaGlobe, FaUser, FaInfoCircle, FaGraduationCap, FaEdit } from 'react-icons/fa';

// Custom CSS for animations and styling
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes ripple {
    0% { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(4); opacity: 0; }
  }
  @keyframes iconHover {
    to { transform: scale(1.1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out forwards;
  }
  .btn-glow:hover {
    box-shadow: 0 0 20px rgba(219, 158, 48, 0.4);
  }
  .tab-glow:hover {
    box-shadow: 0 0 10px rgba(219, 158, 48, 0.3);
  }
  .edit-icon {
    transform: scale(1.1);
    background-color: #DB9E30;
    color: #441a05;
  }
  .title-underline::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: #DB9E30;
    margin: 8px auto 0;
  }
  .btn-ripple {
    position: relative;
    overflow: hidden;
  }
  .btn-ripple::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1);
    transform-origin: 50% 50%;
    animation: none;
  }
  .btn-ripple:active::after {
    animation: ripple 0.6s ease-out;
  }
`;

export default function InstituteDetails({ institutes, handleEditInstitute }) {
  // State for active tab per institute
  const [activeTabs, setActiveTabs] = useState({});

  const setActiveTab = (instituteId, tab) => {
    setActiveTabs((prev) => ({
      ...prev,
      [instituteId]: tab,
    }));
  };

  return (
    <div className="mx-auto py-8">
      <style>{customStyles}</style>
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center text-[#441a05] title-underline animate-fadeIn">
        Institute Profiles
      </h1>
      {institutes.map((institute) => {
        const activeTab = activeTabs[institute.id] || 'basic';

        return (
          <div
            key={institute.id}
            className="bg-black/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-md mb-10 overflow-hidden relative animate-fadeIn"
          >
            {/* Profile Header */}
            <div className="relative flex items-center justify-between p-6 bg-[#441a05]/10">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 border-4 border-white rounded-full p-4 shadow-md animate-scaleIn">
                  <FaBuilding className="text-[#DB9E30] text-4xl" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#441a05]">{institute.institute_name}</h2>
                  <p className="text-sm text-[#9d9087]">
                    {institute.institute_type?.name || 'N/A'} • {institute.institute_address || 'N/A'}
                  </p>
                </div>
              </div>
              {/* Edit Icon */}
              <button
                onClick={() => handleEditInstitute(institute)}
                className="edit-icon text-[#9d9087] p-2 rounded-full transition-all duration-300 btn-ripple"
                title="Edit Profile"
              >
                <FaEdit className="text-xl" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 py-4 bg-[#441a05]/5 border-b border-[#9d9087]/50">
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'basic', label: 'Basic Info' },
                  { id: 'online', label: 'Online Presence' },
                  { id: 'manager', label: 'Incharge Manager' },
                  { id: 'additional', label: 'Additional Info' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-[#DB9E30] text-[#441a05] font-semibold'
                        : 'text-[#9d9087] hover:bg-[#9d9087]/20 tab-glow'
                    } animate-scaleIn`}
                    onClick={() => setActiveTab(institute.id, tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="space-y-4 text-[#441a05]">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FaBuilding className="mr-2 text-[#DB9E30]" /> Basic Info
                    </h3>
                    <p><span className="font-medium">Headmaster:</span> {institute.headmaster_name}</p>
                    <p><span className="font-medium">Mobile:</span> {institute.headmaster_mobile}</p>
                    <p><span className="font-medium">Address:</span> {institute.institute_address || 'N/A'}</p>
                  </div>
                  <div className="space-y-4 text-[#441a05]">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FaInfoCircle className="mr-2 text-[#DB9E30]" /> Institute Details
                    </h3>
                    <p><span className="font-medium">Email:</span> {institute.institute_email_address || 'N/A'}</p>
                    <p><span className="font-medium">EIIN Number:</span> {institute.institute_eiin_no || 'N/A'}</p>
                    <p><span className="font-medium">Gender Type:</span> {institute.institute_gender_type}</p>
                    <p><span className="font-medium">Type:</span> {institute.institute_type?.name || 'N/A'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'online' && (
                <div className="space-y-4 text-[#441a05] animate-fadeIn">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaGlobe className="mr-2 text-[#DB9E30]" /> Online Presence
                  </h3>
                  <p>
                    <span className="font-medium">Website:</span>{' '}
                    {institute.institute_web ? (
                      <a
                        href={institute.institute_web}
                        className="text-[#DB9E30] hover:text-[#441a05] transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {institute.institute_web}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Management Website:</span>{' '}
                    {institute.institute_management_web ? (
                      <a
                        href={institute.institute_management_web}
                        className="text-[#DB9E30] hover:text-[#441a05] transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {institute.institute_management_web}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Facebook:</span>{' '}
                    {institute.institute_fb ? (
                      <a
                        href={institute.institute_fb}
                        className="text-[#DB9E30] hover:text-[#441a05] transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {institute.institute_fb}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </p>
                  <p>
                    <span className="font-medium">YouTube:</span>{' '}
                    {institute.institute_youtube ? (
                      <a
                        href={institute.institute_youtube}
                        className="text-[#DB9E30] hover:text-[#441a05] transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {institute.institute_youtube}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
              )}

              {activeTab === 'manager' && (
                <div className="space-y-4 text-[#441a05] animate-fadeIn">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaUser className="mr-2 text-[#DB9E30]" /> Incharge Manager
                  </h3>
                  <p><span className="font-medium">Name:</span> {institute.incharge_manager || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {institute.incharge_manager_email || 'N/A'}</p>
                  <p><span className="font-medium">Mobile:</span> {institute.incharge_manager_mobile || 'N/A'}</p>
                </div>
              )}

              {activeTab === 'additional' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="space-y-4 text-[#441a05]">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FaInfoCircle className="mr-2 text-[#DB9E30]" /> Additional Info
                    </h3>
                    <p><span className="font-medium">Vision Heading:</span> {institute.institute_v_heading || 'N/A'}</p>
                    <p><span className="font-medium">Signature:</span> {institute.signature || 'N/A'}</p>
                    <p><span className="font-medium">Status:</span> {institute.status}</p>
                  </div>
                  <div className="space-y-4 text-[#441a05]">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FaGraduationCap className="mr-2 text-[#DB9E30]" /> Education Details
                    </h3>
                    <p><span className="font-medium">Board ID:</span> {institute.education_board_id || 'N/A'}</p>
                    <p><span className="font-medium">District ID:</span> {institute.education_district_id || 'N/A'}</p>
                    <p><span className="font-medium">Division ID:</span> {institute.education_division_id || 'N/A'}</p>
                    <p><span className="font-medium">Thana ID:</span> {institute.education_thana_id || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
