import React from 'react'

export default function InstituteDetails({institutes, handleEditInstitute}) {
  return (
    <div>   <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Institute Profile</h2>
          {institutes.map((institute) => (
            <div key={institute.id} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
                  <p><strong>Name:</strong> {institute.institute_name}</p>
                  <p><strong>Headmaster:</strong> {institute.headmaster_name}</p>
                  <p><strong>Headmaster Mobile:</strong> {institute.headmaster_mobile}</p>
                  <p><strong>Address:</strong> {institute.institute_address || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Institute Details</h3>
                  <p><strong>Email:</strong> {institute.institute_email_address || 'N/A'}</p>
                  <p><strong>EIIN Number:</strong> {institute.institute_eiin_no || 'N/A'}</p>
                  <p><strong>Gender Type:</strong> {institute.institute_gender_type}</p>
                  <p><strong>Institute Type:</strong> {institute.institute_type?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Online Presence</h3>
                  <p><strong>Website:</strong> {institute.institute_web ? <a href={institute.institute_web} className="text-indigo-600 hover:underline">{institute.institute_web}</a> : 'N/A'}</p>
                  <p><strong>Management Website:</strong> {institute.institute_management_web ? <a href={institute.institute_management_web} className="text-indigo-600 hover:underline">{institute.institute_management_web}</a> : 'N/A'}</p>
                  <p><strong>Facebook:</strong> {institute.institute_fb ? <a href={institute.institute_fb} className="text-indigo-600 hover:underline">{institute.institute_fb}</a> : 'N/A'}</p>
                  <p><strong>YouTube:</strong> {institute.institute_youtube ? <a href={institute.institute_youtube} className="text-indigo-600 hover:underline">{institute.institute_youtube}</a> : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Incharge Manager</h3>
                  <p><strong>Name:</strong> {institute.incharge_manager || 'N/A'}</p>
                  <p><strong>Email:</strong> {institute.incharge_manager_email || 'N/A'}</p>
                  <p><strong>Mobile:</strong> {institute.incharge_manager_mobile || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Additional Information</h3>
                  <p><strong>Vision Heading:</strong> {institute.institute_v_heading || 'N/A'}</p>
                  <p><strong>Signature:</strong> {institute.signature || 'N/A'}</p>
                  <p><strong>Status:</strong> {institute.status}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Education Details</h3>
                  <p><strong>Board ID:</strong> {institute.education_board_id || 'N/A'}</p>
                  <p><strong>District ID:</strong> {institute.education_district_id || 'N/A'}</p>
                  <p><strong>Division ID:</strong> {institute.education_division_id || 'N/A'}</p>
                  <p><strong>Thana ID:</strong> {institute.education_thana_id || 'N/A'}</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => handleEditInstitute(institute)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Edit Institute
                </button>
              </div>
            </div>
          ))}
        </div></div>
  )
}
