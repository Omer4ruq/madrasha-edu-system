
import React, { useState } from 'react';
import { FaBuilding, FaGlobe, FaUser, FaInfoCircle, FaGraduationCap, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useCreateInstituteMutation, useUpdateInstituteMutation } from '../../redux/features/api/institute/instituteApi';
import { useGetInstituteTypesQuery } from '../../redux/features/api/institute/instituteTypeApi';

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
  @keyframes pressIn {
    0% { transform: translateY(0); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    100% { transform: translateY(2px); box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2); }
  }
  @keyframes pressOut {
    0% { transform: translateY(2px); box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2); }
    100% { transform: translateY(0); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
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
  .section-header:hover {
    background-color: rgba(157, 144, 135, 0.2);
  }
  .focus-pressed:focus {
    animation: pressIn 0.2s ease-in-out forwards;
    outline: none;
  }
  .focus-pressed:not(:focus) {
    animation: pressOut 0.2s ease-in-out forwards;
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
  .title-underline::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: #DB9E30;
    margin: 8px auto 0;
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
    <div className="mx-auto py-8">
      <style>{customStyles}</style>
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-md overflow-hidden animate-fadeIn">
        <div className="p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#441a05] mb-6 text-center title-underline">
            {institute ? 'Edit Institute Profile' : 'Create Institute Profile'}
          </h2>
          {isTypesLoading && <div className="text-center text-[#9d9087] mb-4 animate-scaleIn">Loading institute types...</div>}
          {typesError && (
            <div className="text-center text-red-500 mb-4 animate-scaleIn">
              Error loading institute types: {JSON.stringify(typesError.data) || 'Unknown error'}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <div
                className="section-header flex justify-between items-center bg-[#441a05]/10 p-4 rounded-lg cursor-pointer transition-all duration-300"
                onClick={() => toggleSection('basic')}
              >
                <h3 className="text-lg font-semibold text-[#441a05] flex items-center">
                  <FaBuilding className="mr-2 text-[#DB9E30]" /> Basic Information
                </h3>
                {openSections.basic ? <FaChevronUp className="text-[#DB9E30]" /> : <FaChevronDown className="text-[#DB9E30]" />}
              </div>
              {openSections.basic && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-scaleIn">
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Institute Name *</label>
                    <input
                      type="text"
                      name="institute_name"
                      value={formData.institute_name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter institute name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Institute ID *</label>
                    <input
                      type="text"
                      name="institute_id"
                      value={formData.institute_id}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter institute ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Headmaster Name *</label>
                    <input
                      type="text"
                      name="headmaster_name"
                      value={formData.headmaster_name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter headmaster name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Headmaster Mobile *</label>
                    <input
                      type="tel"
                      name="headmaster_mobile"
                      value={formData.headmaster_mobile}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Institute Address</label>
                    <input
                      type="text"
                      name="institute_address"
                      value={formData.institute_address}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Institute Details */}
            <div>
              <div
                className="section-header flex justify-between items-center bg-[#441a05]/10 p-4 rounded-lg cursor-pointer transition-all duration-300"
                onClick={() => toggleSection('details')}
              >
                <h3 className="text-lg font-semibold text-[#441a05] flex items-center">
                  <FaInfoCircle className="mr-2 text-[#DB9E30]" /> Institute Details
                </h3>
                {openSections.details ? <FaChevronUp className="text-[#DB9E30]" /> : <FaChevronDown className="text-[#DB9E30]" />}
              </div>
              {openSections.details && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-scaleIn">
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Institute Email</label>
                    <input
                      type="email"
                      name="institute_email_address"
                      value={formData.institute_email_address}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">EIIN Number</label>
                    <input
                      type="text"
                      name="institute_eiin_no"
                      value={formData.institute_eiin_no}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter EIIN number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Gender Type</label>
                    <select
                      name="institute_gender_type"
                      value={formData.institute_gender_type}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                    >
                      <option value="Combined">Combined</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Institute Type *</label>
                    <select
                      name="institute_type_id"
                      value={formData.institute_type_id}
                      onChange={handleChange}
                      required
                      disabled={isTypesLoading || typesError}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
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
                className="section-header flex justify-between items-center bg-[#441a05]/10 p-4 rounded-lg cursor-pointer transition-all duration-300"
                onClick={() => toggleSection('online')}
              >
                <h3 className="text-lg font-semibold text-[#441a05] flex items-center">
                  <FaGlobe className="mr-2 text-[#DB9E30]" /> Online Presence
                </h3>
                {openSections.online ? <FaChevronUp className="text-[#DB9E30]" /> : <FaChevronDown className="text-[#DB9E30]" />}
              </div>
              {openSections.online && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-scaleIn">
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Website</label>
                    <input
                      type="url"
                      name="institute_web"
                      value={formData.institute_web}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter website URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Management Website</label>
                    <input
                      type="url"
                      name="institute_management_web"
                      value={formData.institute_management_web}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter management website URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Facebook</label>
                    <input
                      type="url"
                      name="institute_fb"
                      value={formData.institute_fb}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter Facebook URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">YouTube</label>
                    <input
                      type="url"
                      name="institute_youtube"
                      value={formData.institute_youtube}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter YouTube URL"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Incharge Manager */}
            <div>
              <div
                className="section-header flex justify-between items-center bg-[#441a05]/10 p-4 rounded-lg cursor-pointer transition-all duration-300"
                onClick={() => toggleSection('manager')}
              >
                <h3 className="text-lg font-semibold text-[#441a05] flex items-center">
                  <FaUser className="mr-2 text-[#DB9E30]" /> Incharge Manager
                </h3>
                {openSections.manager ? <FaChevronUp className="text-[#DB9E30]" /> : <FaChevronDown className="text-[#DB9E30]" />}
              </div>
              {openSections.manager && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-scaleIn">
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Incharge Manager</label>
                    <input
                      type="text"
                      name="incharge_manager"
                      value={formData.incharge_manager}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter manager name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Manager Email</label>
                    <input
                      type="email"
                      name="incharge_manager_email"
                      value={formData.incharge_manager_email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter manager email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Manager Mobile</label>
                    <input
                      type="tel"
                      name="incharge_manager_mobile"
                      value={formData.incharge_manager_mobile}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter manager mobile"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <div
                className="section-header flex justify-between items-center bg-[#441a05]/10 p-4 rounded-lg cursor-pointer transition-all duration-300"
                onClick={() => toggleSection('additional')}
              >
                <h3 className="text-lg font-semibold text-[#441a05] flex items-center">
                  <FaInfoCircle className="mr-2 text-[#DB9E30]" /> Additional Information
                </h3>
                {openSections.additional ? <FaChevronUp className="text-[#DB9E30]" /> : <FaChevronDown className="text-[#DB9E30]" />}
              </div>
              {openSections.additional && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-scaleIn">
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Vision Heading</label>
                    <input
                      type="text"
                      name="institute_v_heading"
                      value={formData.institute_v_heading}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter vision heading"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Signature</label>
                    <input
                      type="text"
                      name="signature"
                      value={formData.signature}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter signature"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Education Board ID</label>
                    <input
                      type="text"
                      name="education_board_id"
                      value={formData.education_board_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter board ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Education District ID</label>
                    <input
                      type="text"
                      name="education_district_id"
                      value={formData.education_district_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter district ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Education Division ID</label>
                    <input
                      type="text"
                      name="education_division_id"
                      value={formData.education_division_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter division ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05]">Education Thana ID</label>
                    <input
                      type="text"
                      name="education_thana_id"
                      value={formData.education_thana_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] placeholder-[#9d9087] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
                      placeholder="Enter thana ID"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#441a05]">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-white/10 border border-[#9d9087] text-[#441a05] focus-pressed focus:border-[#DB9E30] sm:text-sm p-2"
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
                className="px-4 py-2 bg-[#9d9087] text-[#441a05] rounded-md hover:bg-[#9d9087]/80 focus:outline-none btn-glow btn-ripple animate-scaleIn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating || isTypesLoading || typesError}
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-md hover:bg-[#DB9E30]/80 focus:outline-none btn-glow btn-ripple animate-scaleIn ${
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
