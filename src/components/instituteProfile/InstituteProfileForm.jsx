import React, { useState } from 'react';
import { FaBuilding, FaGlobe, FaUser, FaInfoCircle, FaChevronDown, FaChevronUp, FaSpinner } from 'react-icons/fa';
import { IoAddCircleOutline } from 'react-icons/io5';
import toast, { Toaster } from 'react-hot-toast';
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
  .input-icon:hover svg {
    animation: iconHover 0.3s ease-out forwards;
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
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #9d9087;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #441a05;
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
        toast.success('প্রতিষ্ঠান সফলভাবে হালনাগাদ করা হয়েছে!');
      } else {
        await createInstitute(payload).unwrap();
        toast.success('প্রতিষ্ঠান সফলভাবে তৈরি করা হয়েছে!');
      }
      onSubmit();
    } catch (err) {
      console.error('Error response:', err);
      const errorMessage = err.data?.message || err.data?.error || err.data?.detail || 'অজানা ত্রুটি';
      toast.error(`প্রতিষ্ঠান সংরক্ষণ ব্যর্থ: ${errorMessage}`);
    }
  };

  return (
    <div className="py-10 w-full min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
      <style>{customStyles}</style>
      <div className="mx-auto">
        <div className="sticky top-0 z-10 mb-8 animate-fadeIn backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-3">
            <IoAddCircleOutline className="text-4xl text-[#DB9E30] mb-3" />
            <h2 className="text-3xl font-bold text-[#441a05] title-underline">
              {institute ? 'প্রতিষ্ঠান প্রোফাইল সম্পাদনা' : 'প্রতিষ্ঠান প্রোফাইল তৈরি'}
            </h2>
          </div>
        </div>

        {isTypesLoading && (
          <div className="text-center text-[#9d9087] mb-4 animate-scaleIn">প্রতিষ্ঠানের ধরন লোড হচ্ছে...</div>
        )}
        {typesError && (
          <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg shadow-inner animate-fadeIn">
            প্রতিষ্ঠানের ধরন লোড করতে ত্রুটি: {typesError.data?.message || 'অজানা ত্রুটি'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl animate-fadeIn space-y-10">
          {/* মৌলিক তথ্য */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('basic')}>
              <div className="flex items-center">
                <FaBuilding className="text-3xl text-[#DB9E30] mr-2" />
                <h3 className="text-2xl font-semibold text-[#441a05]">মৌলিক তথ্য</h3>
              </div>
              {openSections.basic ? <FaChevronUp className="text-[#DB9E30]" /> : <FaChevronDown className="text-[#DB9E30]" />}
            </div>
            {openSections.basic && (
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3 animate-scaleIn">
                <div className="relative input-icon">
                  <label htmlFor="institute_name" className="block text-lg font-medium text-red-600">
                    প্রতিষ্ঠানের নাম <span className="text-red-600">*</span>
                  </label>
                  <FaBuilding className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="institute_name"
                    name="institute_name"
                    value={formData.institute_name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="প্রতিষ্ঠানের নাম লিখুন"
                    aria-label="প্রতিষ্ঠানের নাম"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_id" className="block text-lg font-medium text-red-600">
                    প্রতিষ্ঠান আইডি <span className="text-red-600">*</span>
                  </label>
                  <FaBuilding className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="institute_id"
                    name="institute_id"
                    value={formData.institute_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="প্রতিষ্ঠান আইডি লিখুন"
                    aria-label="প্রতিষ্ঠান আইডি"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="headmaster_name" className="block text-lg font-medium text-red-600">
                    প্রধান শিক্ষকের নাম <span className="text-red-600">*</span>
                  </label>
                  <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="headmaster_name"
                    name="headmaster_name"
                    value={formData.headmaster_name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="প্রধান শিক্ষকের নাম লিখুন"
                    aria-label="প্রধান শিক্ষকের নাম"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="headmaster_mobile" className="block text-lg font-medium text-red-600">
                    প্রধান শিক্ষকের মোবাইল <span className="text-red-600">*</span>
                  </label>
                  <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="tel"
                    id="headmaster_mobile"
                    name="headmaster_mobile"
                    value={formData.headmaster_mobile}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="মোবাইল নম্বর লিখুন"
                    aria-label="প্রধান শিক্ষকের মোবাইল"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_address" className="block text-lg font-medium text-[#441a05]">
                    প্রতিষ্ঠানের ঠিকানা
                  </label>
                  <FaBuilding className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="institute_address"
                    name="institute_address"
                    value={formData.institute_address}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ঠিকানা লিখুন"
                    aria-label="প্রতিষ্ঠানের ঠিকানা"
                  />
                </div>
              </div>
            )}
          </div>

          {/* প্রতিষ্ঠানের বিবরণ */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('details')}>
              <div className="flex items-center">
                <FaInfoCircle className="text-3xl text-[#DB9E30] mr-2" />
                <h3 className="text-2xl font-semibold text-[#441a05]">প্রতিষ্ঠানের বিবরণ</h3>
              </div>
              {openSections.details ? <FaChevronUp className="text-[#DB9E30]" /> : <FaChevronDown className="text-[#DB9E30]" />}
            </div>
            {openSections.details && (
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3 animate-scaleIn">
                <div className="relative input-icon">
                  <label htmlFor="institute_email_address" className="block text-lg font-medium text-[#441a05]">
                    প্রতিষ্ঠানের ইমেইল
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="email"
                    id="institute_email_address"
                    name="institute_email_address"
                    value={formData.institute_email_address}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ইমেইল ঠিকানা লিখুন"
                    aria-label="প্রতিষ্ঠানের ইমেইল"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_eiin_no" className="block text-lg font-medium text-[#441a05]">
                    ইআইআইএন নম্বর
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="institute_eiin_no"
                    name="institute_eiin_no"
                    value={formData.institute_eiin_no}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ইআইআইএন নম্বর লিখুন"
                    aria-label="ইআইআইএন নম্বর"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_gender_type" className="block text-lg font-medium text-[#441a05]">
                    লিঙ্গের ধরন
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <select
                    id="institute_gender_type"
                    name="institute_gender_type"
                    value={formData.institute_gender_type}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    aria-label="লিঙ্গের ধরন"
                  >
                    <option value="Combined">মিশ্র</option>
                    <option value="Male">পুরুষ</option>
                    <option value="Female">নারী</option>
                  </select>
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_type_id" className="block text-lg font-medium text-red-600">
                    প্রতিষ্ঠানের ধরন <span className="text-red-600">*</span>
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <select
                    id="institute_type_id"
                    name="institute_type_id"
                    value={formData.institute_type_id}
                    onChange={handleChange}
                    required
                    disabled={isTypesLoading || typesError}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    aria-label="প্রতিষ্ঠানের ধরন"
                  >
                    <option value="">প্রতিষ্ঠানের ধরন নির্বাচন করুন</option>
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

          {/* অনলাইন উপস্থিতি */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('online')}>
              <div className="flex items-center">
                <FaGlobe className="text-3xl text-[#DB9E30] mr-2" />
                <h3 className="text-2xl font-semibold text-[#441a05]">অনলাইন উপস্থিতি</h3>
              </div>
              {openSections.online ? <FaChevronUp className="text-[#DB9E30]" /> : <FaChevronDown className="text-[#DB9E30]" />}
            </div>
            {openSections.online && (
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3 animate-scaleIn">
                <div className="relative input-icon">
                  <label htmlFor="institute_web" className="block text-lg font-medium text-[#441a05]">
                    ওয়েবসাইট
                  </label>
                  <FaGlobe className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="url"
                    id="institute_web"
                    name="institute_web"
                    value={formData.institute_web}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ওয়েবসাইট ইউআরএল লিখুন"
                    aria-label="ওয়েবসাইট"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_management_web" className="block text-lg font-medium text-[#441a05]">
                    ব্যবস্থাপনা ওয়েবসাইট
                  </label>
                  <FaGlobe className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="url"
                    id="institute_management_web"
                    name="institute_management_web"
                    value={formData.institute_management_web}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ব্যবস্থাপনা ওয়েবসাইট ইউআরএল লিখুন"
                    aria-label="ব্যবস্থাপনা ওয়েবসাইট"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_fb" className="block text-lg font-medium text-[#441a05]">
                    ফেসবুক
                  </label>
                  <FaGlobe className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="url"
                    id="institute_fb"
                    name="institute_fb"
                    value={formData.institute_fb}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ফেসবুক ইউআরএল লিখুন"
                    aria-label="ফেসবুক"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="institute_youtube" className="block text-lg font-medium text-[#441a05]">
                    ইউটিউব
                  </label>
                  <FaGlobe className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="url"
                    id="institute_youtube"
                    name="institute_youtube"
                    value={formData.institute_youtube}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ইউটিউব ইউআরএল লিখুন"
                    aria-label="ইউটিউব"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ইনচার্জ ম্যানেজার */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('manager')}>
              <div className="flex items-center">
                <FaUser className="text-3xl text-[#DB9E30] mr-2" />
                <h3 className="text-2xl font-semibold text-[#441a05]">ইনচার্জ ম্যানেজার</h3>
              </div>
              {openSections.manager ? <FaChevronUp className="text-[#DB9E30]" /> : <FaChevronDown className="text-[#DB9E30]" />}
            </div>
            {openSections.manager && (
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3 animate-scaleIn">
                <div className="relative input-icon">
                  <label htmlFor="incharge_manager" className="block text-lg font-medium text-[#441a05]">
                    ইনচার্জ ম্যানেজার
                  </label>
                  <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="incharge_manager"
                    name="incharge_manager"
                    value={formData.incharge_manager}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ম্যানেজারের নাম লিখুন"
                    aria-label="ইনচার্জ ম্যানেজার"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="incharge_manager_email" className="block text-lg font-medium text-[#441a05]">
                    ম্যানেজারের ইমেইল
                  </label>
                  <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="email"
                    id="incharge_manager_email"
                    name="incharge_manager_email"
                    value={formData.incharge_manager_email}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ম্যানেজারের ইমেইল লিখুন"
                    aria-label="ম্যানেজারের ইমেইল"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="incharge_manager_mobile" className="block text-lg font-medium text-[#441a05]">
                    ম্যানেজারের মোবাইল
                  </label>
                  <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="tel"
                    id="incharge_manager_mobile"
                    name="incharge_manager_mobile"
                    value={formData.incharge_manager_mobile}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="ম্যানেজারের মোবাইল লিখুন"
                    aria-label="ম্যানেজারের মোবাইল"
                  />
                </div>
              </div>
            )}
          </div>

          {/* অতিরিক্ত তথ্য */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleSection('additional')}>
              <div className="flex items-center">
                <FaInfoCircle className="text-3xl text-[#DB9E30] mr-2" />
                <h3 className="text-2xl font-semibold text-[#441a05]">অতিরিক্ত তথ্য</h3>
              </div>
              {openSections.additional ? <FaChevronUp className="text-[#DB9E30]" /> : <FaChevronDown className="text-[#DB9E30]" />}
            </div>
            {openSections.additional && (
              <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3 animate-scaleIn">
                <div className="relative input-icon">
                  <label htmlFor="institute_v_heading" className="block text-lg font-medium text-[#441a05]">
                    দৃষ্টিভঙ্গি শিরোনাম
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="institute_v_heading"
                    name="institute_v_heading"
                    value={formData.institute_v_heading}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="দৃষ্টিভঙ্গি শিরোনাম লিখুন"
                    aria-label="দৃষ্টিভঙ্গি শিরোনাম"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="signature" className="block text-lg font-medium text-[#441a05]">
                    স্বাক্ষর
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="signature"
                    name="signature"
                    value={formData.signature}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="স্বাক্ষর লিখুন"
                    aria-label="স্বাক্ষর"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="education_board_id" className="block text-lg font-medium text-[#441a05]">
                    শিক্ষা বোর্ড আইডি
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="education_board_id"
                    name="education_board_id"
                    value={formData.education_board_id}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="বোর্ড আইডি লিখুন"
                    aria-label="শিক্ষা বোর্ড আইডি"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="education_district_id" className="block text-lg font-medium text-[#441a05]">
                    শিক্ষা জেলা আইডি
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="education_district_id"
                    name="education_district_id"
                    value={formData.education_district_id}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="জেলা আইডি লিখুন"
                    aria-label="শিক্ষা জেলা আইডি"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="education_division_id" className="block text-lg font-medium text-[#441a05]">
                    শিক্ষা বিভাগ আইডি
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="education_division_id"
                    name="education_division_id"
                    value={formData.education_division_id}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="বিভাগ আইডি লিখুন"
                    aria-label="শিক্ষা বিভাগ আইডি"
                  />
                </div>
                <div className="relative input-icon">
                  <label htmlFor="education_thana_id" className="block text-lg font-medium text-[#441a05]">
                    শিক্ষা থানা আইডি
                  </label>
                  <FaInfoCircle className="absolute left-3 top-[50px] text-[#DB9E30]" />
                  <input
                    type="text"
                    id="education_thana_id"
                    name="education_thana_id"
                    value={formData.education_thana_id}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                    placeholder="থানা আইডি লিখুন"
                    aria-label="শিক্ষা থানা আইডি"
                  />
                </div>
              </div>
            )}
          </div>

          {/* স্থিতি */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="relative input-icon">
              <label htmlFor="status" className="block text-lg font-medium text-[#441a05]">
                স্থিতি
              </label>
              <FaInfoCircle className="absolute left-3 top-[50px] text-[#DB9E30]" />
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300"
                aria-label="স্থিতি"
              >
                <option value="Active">সক্রিয়</option>
                <option value="Inactive">নিষ্ক্রিয়</option>
              </select>
            </div>
          </div>

          {/* বোতাম */}
          <div className="text-center space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ripple inline-flex items-center gap-2 px-10 py-3.5 rounded-lg font-medium bg-[#9d9087] text-[#441a05] transition-all duration-200 animate-scaleIn btn-glow"
              title="বাতিল করুন"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating || isTypesLoading || typesError}
              className={`btn btn-ripple inline-flex items-center gap-2 px-10 py-3.5 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-200 animate-scaleIn ${isCreating || isUpdating || isTypesLoading || typesError ? 'opacity-50 cursor-not-allowed' : 'btn-glow'}`}
              title={institute ? 'প্রতিষ্ঠান হালনাগাদ করুন' : 'প্রতিষ্ঠান তৈরি করুন'}
            >
              {isCreating || isUpdating ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </span>
              ) : (
                <span>{institute ? 'প্রতিষ্ঠান হালনাগাদ করুন' : 'প্রতিষ্ঠান তৈরি করুন'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstituteProfileForm;