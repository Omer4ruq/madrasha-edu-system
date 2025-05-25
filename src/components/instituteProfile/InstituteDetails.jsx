import React, { useState } from 'react';
import { FaBuilding, FaGlobe, FaUser, FaInfoCircle, FaGraduationCap, FaEdit } from 'react-icons/fa';

// Custom CSS for hover effects, transitions, and header styling
const customStyles = `
  .institute-card {
    transition: box-shadow 0.3s ease-in-out;
  }
  .institute-card:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
  .profile-header {
    background-color: #f3f4f6;
    border-radius: 12px 12px 0 0;
    padding: 24px;
  }
  .profile-icon {
    background-color: #ffffff;
    border: 4px solid #ffffff;
    border-radius: 50%;
    padding: 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .tab {
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  }
  .tab:hover {
    background-color: #e5e7eb;
  }
  .tab.active {
    background-color: #4f46e5;
    color: #ffffff;
    font-weight: 600;
  }
  .edit-icon {
    background-color: #e5e7eb;
    border-radius: 50%;
    padding: 8px;
    transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
  }
  .edit-icon:hover {
    background-color: #d1d5db;
    transform: scale(1.1);
  }
  .edit-icon:focus {
    outline: none;
    ring: 2px solid #4f46e5;
    ring-offset: 2px;
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
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <style>{customStyles}</style>
      {/* <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center text-gray-900">Institute Profiles</h1> */}
      {institutes.map((institute) => {
        const activeTab = activeTabs[institute.id] || 'basic';

        return (
          <div
            key={institute.id}
            className="institute-card bg-white rounded-xl shadow-md mb-10 overflow-hidden relative"
          >
            {/* Profile Header */}
            <div className="profile-header relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="profile-icon">
                  <FaBuilding className="text-indigo-600 text-4xl" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{institute.institute_name}</h2>
                  <p className="text-sm text-gray-600">
                    {institute.institute_type?.name || 'N/A'} • {institute.institute_address || 'N/A'}
                  </p>
                </div>
              </div>
              {/* Edit Icon in Top-Right Corner */}
              <button
                onClick={() => handleEditInstitute(institute)}
                className="edit-icon text-gray-700 hover:text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                title="Edit Profile"
              >
                <FaEdit className="text-xl" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {['basic', 'online', 'manager', 'additional'].map((tab) => (
                  <button
                    key={tab}
                    className={`tab px-4 py-2 rounded-full text-sm font-medium ${
                      activeTab === tab ? 'active' : 'text-gray-600'
                    }`}
                    onClick={() => setActiveTab(institute.id, tab)}
                  >
                    {tab === 'basic' && 'Basic Info'}
                    {tab === 'online' && 'Online Presence'}
                    {tab === 'manager' && 'Incharge Manager'}
                    {tab === 'additional' && 'Additional Info'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 text-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaBuilding className="mr-2 text-indigo-600" /> Basic Information
                    </h3>
                    <p><span className="font-medium">Headmaster:</span> {institute.headmaster_name}</p>
                    <p><span className="font-medium">Mobile:</span> {institute.headmaster_mobile}</p>
                    <p><span className="font-medium">Address:</span> {institute.institute_address || 'N/A'}</p>
                  </div>
                  <div className="space-y-3 text-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaInfoCircle className="mr-2 text-indigo-600" /> Institute Details
                    </h3>
                    <p><span className="font-medium">Email:</span> {institute.institute_email_address || 'N/A'}</p>
                    <p><span className="font-medium">EIIN Number:</span> {institute.institute_eiin_no || 'N/A'}</p>
                    <p><span className="font-medium">Gender Type:</span> {institute.institute_gender_type}</p>
                    <p><span className="font-medium">Type:</span> {institute.institute_type?.name || 'N/A'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'online' && (
                <div className="space-y-3 text-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaGlobe className="mr-2 text-indigo-600" /> Online Presence
                  </h3>
                  <p>
                    <span className="font-medium">Website:</span>{' '}
                    {institute.institute_web ? (
                      <a
                        href={institute.institute_web}
                        className="text-indigo-600 hover:text-indigo-800"
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
                        className="text-indigo-600 hover:text-indigo-800"
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
                        className="text-indigo-600 hover:text-indigo-800"
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
                        className="text-indigo-600 hover:text-indigo-800"
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
                <div className="space-y-3 text-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaUser className="mr-2 text-indigo-600" /> Incharge Manager
                  </h3>
                  <p><span className="font-medium">Name:</span> {institute.incharge_manager || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {institute.incharge_manager_email || 'N/A'}</p>
                  <p><span className="font-medium">Mobile:</span> {institute.incharge_manager_mobile || 'N/A'}</p>
                </div>
              )}

              {activeTab === 'additional' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 text-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaInfoCircle className="mr-2 text-indigo-600" /> Additional Information
                    </h3>
                    <p><span className="font-medium">Vision Heading:</span> {institute.institute_v_heading || 'N/A'}</p>
                    <p><span className="font-medium">Signature:</span> {institute.signature || 'N/A'}</p>
                    <p><span className="font-medium">Status:</span> {institute.status}</p>
                  </div>
                  <div className="space-y-3 text-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FaGraduationCap className="mr-2 text-indigo-600" /> Education Details
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