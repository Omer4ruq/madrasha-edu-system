import React from 'react';
import { FaBuilding, FaUserTie, FaGlobe, FaUser, FaInfoCircle, FaGraduationCap } from 'react-icons/fa';

// Custom CSS for hover effects and transitions
const customStyles = `
  .institute-card {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }
  .institute-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  .section-divider {
    border-top: 1px solid #e5e7eb;
  }
`;

export default function InstituteDetails({ institutes, handleEditInstitute }) {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <style>{customStyles}</style>
      <h2 className="text-3xl font-bold mb-8 text-center text-white">Institute Profiles</h2>
      {institutes.map((institute) => (
        <div
          key={institute.id}
          className="institute-card bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FaBuilding className="mr-2 text-indigo-600" /> Basic Information
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">Name:</span> {institute.institute_name}</p>
                  <p><span className="font-medium">Headmaster:</span> {institute.headmaster_name}</p>
                  <p><span className="font-medium">Mobile:</span> {institute.headmaster_mobile}</p>
                  <p><span className="font-medium">Address:</span> {institute.institute_address || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FaInfoCircle className="mr-2 text-indigo-600" /> Institute Details
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">Email:</span> {institute.institute_email_address || 'N/A'}</p>
                  <p><span className="font-medium">EIIN Number:</span> {institute.institute_eiin_no || 'N/A'}</p>
                  <p><span className="font-medium">Gender Type:</span> {institute.institute_gender_type}</p>
                  <p><span className="font-medium">Type:</span> {institute.institute_type?.name || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="section-divider my-6"></div>

            {/* Online Presence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FaGlobe className="mr-2 text-indigo-600" /> Online Presence
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">Website:</span>{' '}
                    {institute.institute_web ? (
                      <a
                        href={institute.institute_web}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
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
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
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
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
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
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FaUser className="mr-2 text-indigo-600" /> Incharge Manager
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">Name:</span> {institute.incharge_manager || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {institute.incharge_manager_email || 'N/A'}</p>
                  <p><span className="font-medium">Mobile:</span> {institute.incharge_manager_mobile || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="section-divider my-6"></div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FaInfoCircle className="mr-2 text-indigo-600" /> Additional Information
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">Vision Heading:</span> {institute.institute_v_heading || 'N/A'}</p>
                  <p><span className="font-medium">Signature:</span> {institute.signature || 'N/A'}</p>
                  <p><span className="font-medium">Status:</span> {institute.status}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FaGraduationCap className="mr-2 text-indigo-600" /> Education Details
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">Board ID:</span> {institute.education_board_id || 'N/A'}</p>
                  <p><span className="font-medium">District ID:</span> {institute.education_district_id || 'N/A'}</p>
                  <p><span className="font-medium">Division ID:</span> {institute.education_division_id || 'N/A'}</p>
                  <p><span className="font-medium">Thana ID:</span> {institute.education_thana_id || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => handleEditInstitute(institute)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Edit Institute
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}