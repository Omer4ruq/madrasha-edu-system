import React, { useState } from 'react';
import { FaBuilding, FaGlobe, FaUser, FaInfoCircle, FaGraduationCap, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useCreateInstituteMutation, useUpdateInstituteMutation } from '../../redux/features/api/instituteApi';
import { useGetInstituteTypesQuery } from '../../redux/features/api/instituteTypeApi';

// Custom CSS for pressed-in effect, transitions, and header styling
const customStyles = `
  @keyframes pressIn {
    0% {
      transform: translateY(0);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    100% {
      transform: translateY(2px);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  @keyframes pressOut {
    0% {
      transform: translateY(2px);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    100% {
      transform: translateY(0);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  }

  .form-card {
    transition: box-shadow 0.3s ease-in-out;
  }
  .form-card:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
  .section-header {
    background-color: #f3f4f6;
    border-radius: 8px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }
  .section-header:hover {
    background-color: #e5e7eb;
  }
  .focus-pressed:focus {
    outline: none;
    animation: pressIn 0.2s ease-in-out forwards;
    border-top-color: transparent;
  }
  .focus-pressed {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    border: 1px solid #e5e7eb;
  }
  .focus-pressed:not(:focus) {
    animation: pressOut 0.2s ease-in-out forwards;
  }
`;

const InstituteProfileForm = ({ institute, onSubmit, onCancel }) => {
  const { data: instituteTypes, isLoading: isTypesLoading, error: typesError } = useGetInstituteTypesQuery();

  const [formData, setFormData] = useState({
    institute_id: institute?.institute_id || '',
    institute_name: institute?.institute_name || '',
    headmaster_name: institute?.headmaster_name || '',
    headmaster_mobile: institute?.headmaster_mobile || '',
    institute_gender_type: institute?.institute_gender_type || 'Combined',
    institute_type_id: institute?.institute_type?.id?.toString() || '',
    status: institute?.status || 'Active',
    institute_address: institute?.institute_address || '',
    institute_email_address: institute?.institute_email_address || '',
    institute_eiin_no: institute?.institute_eiin_no || '',
    institute_web: institute?.institute_web || '',
    institute_management_web: institute?.institute_management_web || '',
    institute_fb: institute?.institute_fb || '',
    institute_youtube: institute?.institute_youtube || '',
    incharge_manager: institute?.incharge_manager || '',
    incharge_manager_email: institute?.incharge_manager_email || '',
    incharge_manager_mobile: institute?.incharge_manager_mobile || '',
    institute_v_heading: institute?.institute_v_heading || '',
    signature: institute?.signature || '',
    education_board_id: institute?.education_board_id || '',
    education_district_id: institute?.education_district_id || '',
    education_division_id: institute?.education_division_id || '',
    education_thana_id: institute?.education_thana_id || '',
  });

  const [openSections, setOpenSections] = useState({
    basic: true,
    details: true,
    online: true,
    manager: true,
    additional: true,
  });

  const [createInstitute, { isLoading: isCreating }] = useCreateInstituteMutation();
  const [updateInstitute, { isLoading: isUpdating }] = useUpdateInstituteMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      institute_type_id: parseInt(formData.institute_type_id) || null,
      education_board_id: formData.education_board_id ? parseInt(formData.education_board_id) : null,
      education_district_id: formData.education_district_id ? parseInt(formData.education_district_id) : null,
      education_division_id: formData.education_division_id ? parseInt(formData.education_division_id) : null,
      education_thana_id: formData.education_thana_id ? parseInt(formData.education_thana_id) : null,
      institute_address: formData.institute_address || null,
      institute_email_address: formData.institute_email_address || null,
      institute_eiin_no: formData.institute_eiin_no || null,
      institute_web: formData.institute_web || null,
      institute_management_web: formData.institute_management_web || null,
      institute_fb: formData.institute_fb || null,
      institute_youtube: formData.institute_youtube || null,
      incharge_manager: formData.incharge_manager || null,
      incharge_manager_email: formData.incharge_manager_email || null,
      incharge_manager_mobile: formData.incharge_manager_mobile || null,
      institute_v_heading: formData.institute_v_heading || null,
      signature: formData.signature || null,
    };

    try {
      if (institute) {
        await updateInstitute({ id: institute.id, ...payload }).unwrap();
        alert('Institute updated successfully!');
      } else {
        await createInstitute(payload).unwrap();
        alert('Institute created successfully!');
      }
      onSubmit();
    } catch (err) {
      console.error('Error response:', err);
      alert(`Failed to save institute: ${JSON.stringify(err.data) || 'Unknown error'}`);
    }
  };

  return (
    <div className="mx-auto">
      <style>{customStyles}</style>
      <div className="form-card bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
            {institute ? 'Edit Institute Profile' : 'Create Institute Profile'}
          </h2>
          {isTypesLoading && <div className="text-center text-gray-600 mb-4">Loading institute types...</div>}
          {typesError && (
            <div className="text-center text-red-500 mb-4">
              Error loading institute types: {JSON.stringify(typesError.data) || 'Unknown error'}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <div
                className="section-header flex justify-between items-center"
                onClick={() => toggleSection('basic')}
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaBuilding className="mr-2 text-indigo-600" /> Basic Information
                </h3>
                {openSections.basic ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {openSections.basic && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institute Name *</label>
                    <input
                      type="text"
                      name="institute_name"
                      value={formData.institute_name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter institute name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institute ID *</label>
                    <input
                      type="text"
                      name="institute_id"
                      value={formData.institute_id}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter institute ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Headmaster Name *</label>
                    <input
                      type="text"
                      name="headmaster_name"
                      value={formData.headmaster_name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter headmaster name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Headmaster Mobile *</label>
                    <input
                      type="tel"
                      name="headmaster_mobile"
                      value={formData.headmaster_mobile}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institute Address</label>
                    <input
                      type="text"
                      name="institute_address"
                      value={formData.institute_address}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Institute Details */}
            <div>
              <div
                className="section-header flex justify-between items-center"
                onClick={() => toggleSection('details')}
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaInfoCircle className="mr-2 text-indigo-600" /> Institute Details
                </h3>
                {openSections.details ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {openSections.details && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institute Email</label>
                    <input
                      type="email"
                      name="institute_email_address"
                      value={formData.institute_email_address}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">EIIN Number</label>
                    <input
                      type="text"
                      name="institute_eiin_no"
                      value={formData.institute_eiin_no}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter EIIN number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender Type</label>
                    <select
                      name="institute_gender_type"
                      value={formData.institute_gender_type}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                    >
                      <option value="Combined">Combined</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institute Type *</label>
                    <select
                      name="institute_type_id"
                      value={formData.institute_type_id}
                      onChange={handleChange}
                      required
                      disabled={isTypesLoading || typesError}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                    >
                      <option value="">Select Institute Type</option>
                      {instituteTypes?.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Online Presence */}
            <div>
              <div
                className="section-header flex justify-between items-center"
                onClick={() => toggleSection('online')}
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaGlobe className="mr-2 text-indigo-600" /> Online Presence
                </h3>
                {openSections.online ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {openSections.online && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="url"
                      name="institute_web"
                      value={formData.institute_web}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter website URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Management Website</label>
                    <input
                      type="url"
                      name="institute_management_web"
                      value={formData.institute_management_web}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter management website URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Facebook</label>
                    <input
                      type="url"
                      name="institute_fb"
                      value={formData.institute_fb}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter Facebook URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">YouTube</label>
                    <input
                      type="url"
                      name="institute_youtube"
                      value={formData.institute_youtube}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter YouTube URL"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Incharge Manager */}
            <div>
              <div
                className="section-header flex justify-between items-center"
                onClick={() => toggleSection('manager')}
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaUser className="mr-2 text-indigo-600" /> Incharge Manager
                </h3>
                {openSections.manager ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {openSections.manager && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Incharge Manager</label>
                    <input
                      type="text"
                      name="incharge_manager"
                      value={formData.incharge_manager}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter manager name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manager Email</label>
                    <input
                      type="email"
                      name="incharge_manager_email"
                      value={formData.incharge_manager_email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter manager email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manager Mobile</label>
                    <input
                      type="tel"
                      name="incharge_manager_mobile"
                      value={formData.incharge_manager_mobile}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter manager mobile"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <div
                className="section-header flex justify-between items-center"
                onClick={() => toggleSection('additional')}
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaInfoCircle className="mr-2 text-indigo-600" /> Additional Information
                </h3>
                {openSections.additional ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {openSections.additional && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vision Heading</label>
                    <input
                      type="text"
                      name="institute_v_heading"
                      value={formData.institute_v_heading}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter vision heading"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Signature</label>
                    <input
                      type="text"
                      name="signature"
                      value={formData.signature}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter signature"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Education Board ID</label>
                    <input
                      type="text"
                      name="education_board_id"
                      value={formData.education_board_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter board ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Education District ID</label>
                    <input
                      type="text"
                      name="education_district_id"
                      value={formData.education_district_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter district ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Education Division ID</label>
                    <input
                      type="text"
                      name="education_division_id"
                      value={formData.education_division_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter division ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Education Thana ID</label>
                    <input
                      type="text"
                      name="education_thana_id"
                      value={formData.education_thana_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
                      placeholder="Enter thana ID"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-pressed sm:text-sm p-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus-pressed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating || isTypesLoading || typesError}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-pressed ${
                  isCreating || isUpdating || isTypesLoading || typesError ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isCreating || isUpdating ? 'Saving...' : institute ? 'Update Institute' : 'Create Institute'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstituteProfileForm;