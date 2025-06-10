import React, { useState } from 'react';

import { FaSpinner, FaUser, FaLock, FaEnvelope, FaPhone, FaHome, FaBriefcase, FaIdCard, FaCalendarAlt, FaVenusMars, FaHeart, FaMap, FaMapMarkerAlt, FaWheelchair, FaUserTag, FaChild, FaFileAlt, FaBuilding, FaBusinessTime, FaRing } from 'react-icons/fa';
import { IoAddCircleOutline } from 'react-icons/io5';
import { useCreateStaffRegistrationApiMutation } from '../../../redux/features/api/staff/staffRegistration';

const StaffRegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    name_in_bangla: '',
    user_id: '',
    phone_number: '',
    email: '',
    gender: '',
    dob: '',
    blood_group: '',
    nid: '',
    rfid: '',
    present_address: '',
    permanent_address: '',
    disability_info: '',
    short_name: '',
    name_tag: '',
    tin: '',
    qualification: '',
    fathers_name: '',
    mothers_name: '',
    spouse_name: '',
    spouse_phone_number: '',
    children_no: '',
    marital_status: '',
    staff_id_no: '',
    employee_type: '',
    job_nature: '',
    designation: '',
    joining_date: '',
    role_id: '',
    department_id: '',
  });

  const [createStaff, { isLoading, error }] = useCreateStaffRegistrationApiMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const requiredFields = [
    //   'username', 'password', 'name', 'user_id', 'phone_number', 'email',
    //   'gender', 'dob', 'blood_group', 'present_address', 'permanent_address',
    //   'fathers_name', 'mothers_name', 'marital_status', 'short_name',
    //   'staff_id_no', 'employee_type', 'job_nature', 'designation', 'role_id',
    // ];

    // const missingFields = requiredFields.filter((field) => !formData[field]);

    // if (missingFields.length > 0) {
    //   alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
    //   return;
    // }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(formData.email)) {
    //   alert('Please enter a valid email address');
    //   return;
    // }

    // const phoneRegex = /^\+?\d{10,15}$/;
    // if (!phoneRegex.test(formData.phone_number) || (formData.spouse_phone_number && !phoneRegex.test(formData.spouse_phone_number))) {
    //   alert('Please enter valid phone numbers (10-15 digits, optional + prefix)');
    //   return;
    // }

    if (
      isNaN(parseInt(formData.user_id)) ||
      (formData.children_no && isNaN(parseInt(formData.children_no))) ||
      isNaN(parseInt(formData.role_id)) ||
      (formData.department_id && isNaN(parseInt(formData.department_id)))
    ) {
      alert('Please enter valid numeric values for User ID, Children No., Role ID, and Department ID.');
      return;
    }

    try {
      const payload = {
        ...formData,
        user_id: parseInt(formData.user_id),
        children_no: formData.children_no ? parseInt(formData.children_no) : '',
        role_id: parseInt(formData.role_id),
        department_id: formData.department_id ? parseInt(formData.department_id) : '',
        joining_date: formData.joining_date || '',
        disability_info: formData.disability_info || '',
        rfid: formData.rfid || '',
        tin: formData.tin || '',
        spouse_name: formData.spouse_name || '',
        spouse_phone_number: formData.spouse_phone_number || '',
        name_in_bangla: formData.name_in_bangla || '',
        qualification: formData.qualification || '',
        name_tag: formData.name_tag || '',
      };

      console.log('Submitting Payload:', JSON.stringify(payload, null, 2));
      await createStaff(payload).unwrap();
      alert('Staff registered successfully!');
      setFormData({
        username: '',
        password: '',
        name: '',
        name_in_bangla: '',
        user_id: '',
        phone_number: '',
        email: '',
        gender: '',
        dob: '',
        blood_group: '',
        nid: '',
        rfid: '',
        present_address: '',
        permanent_address: '',
        disability_info: '',
        short_name: '',
        name_tag: '',
        tin: '',
        qualification: '',
        fathers_name: '',
        mothers_name: '',
        spouse_name: '',
        spouse_phone_number: '',
        children_no: '',
        marital_status: '',
        staff_id_no: '',
        employee_type: '',
        job_nature: '',
        designation: '',
        joining_date: '',
        role_id: '',
        department_id: '',
      });
    } catch (err) {
      console.error('Full Error:', JSON.stringify(err, null, 2));
      const errorMessage = err.data?.message || err.data?.error || err.data?.detail || err.status || 'An unknown error occurred';
      alert(`Failed to register staff: ${errorMessage}`);
    }
  };

  return (
    <div className="pb-12 w-full min-h-screen">
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
        `}
      </style>

      <div className="mx-auto">
        <div className="sticky top-0 z-10 mb-8 animate-fadeIn backdrop-blur-sm ">
          <div className="flex items-center justify-center space-x-3">
            <IoAddCircleOutline className="text-4xl text-[#DB9E30] mb-3" />
            <h2 className="text-3xl font-bold text-[#441a05] title-underline">Staff Registration</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl animate-fadeIn space-y-10">
          {/* Personal Information */}
          <div className=" bg-black/10 backdrop-blur-sm border animate-fadeIn border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center mb-4">
              <FaUser className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">Personal Information</h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* <div className="relative input-icon">
                <label htmlFor="username" className="block text-lg font-medium text-[#441a05]">
                  Username <span className="text-[#DB9E30]">*</span>
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter username"
                  required
                  aria-label="Username"
                />
              </div> */}
              {/* <div className="relative input-icon">
                <label htmlFor="password" className="block text-lg font-medium text-[#441a05]">
                  Password <span className="text-[#DB9E30]">*</span>
                </label>
                <FaLock className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter password"
                  required
                  aria-label="Password"
                />
              </div> */}
              <div className="relative input-icon">
                <label htmlFor="name" className="block text-lg font-medium text-[#441a05]">
                  Full Name <span className="text-[#DB9E30]">*</span>
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter full name"
                  required
                  aria-label="Full Name"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="name_in_bangla" className="block text-lg font-medium text-[#441a05]">
                  Name in Bangla
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="name_in_bangla"
                  name="name_in_bangla"
                  value={formData.name_in_bangla}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter name in Bangla"
                  aria-label="Name in Bangla"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="user_id" className="block text-lg font-medium text-[#441a05]">
                  User ID <span className="text-[#DB9E30]">*</span>
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="number"
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter user ID"
                  required
                  aria-label="User ID"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="gender" className="block text-lg font-medium text-[#441a05]">
                  Gender 
                </label>
                <FaVenusMars className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  
                  aria-label="Gender"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="relative input-icon">
                <label htmlFor="dob" className="block text-lg font-medium text-[#441a05]">
                  Date of Birth 
                </label>
                <FaCalendarAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  
                  aria-label="Date of Birth"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="blood_group" className="block text-lg font-medium text-[#441a05]">
                  Blood Group 
                </label>
                <FaHeart className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="blood_group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  
                  aria-label="Blood Group"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="relative input-icon">
                <label htmlFor="nid" className="block text-lg font-medium text-[#441a05]">
                  NID
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="nid"
                  name="nid"
                  value={formData.nid}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter NID"
                  aria-label="NID"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="fathers_name" className="block text-lg font-medium text-[#441a05]">
                  Father's Name 
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="fathers_name"
                  name="fathers_name"
                  value={formData.fathers_name}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter father's name"
                  
                  aria-label="Father's Name"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="mothers_name" className="block text-lg font-medium text-[#441a05]">
                  Mother's Name
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="mothers_name"
                  name="mothers_name"
                  value={formData.mothers_name}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter mother's name"
                  
                  aria-label="Mother's Name"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="marital_status" className="block text-lg font-medium text-[#441a05]">
                  Marital Status 
                </label>
                <FaRing className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="marital_status"
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  
                  aria-label="Marital Status"
                >
                  <option value="">Select marital status</option>
                  <option value="MARRIED">Married</option>
                  <option value="SINGLE">Single</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className=" bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center mb-4">
              <FaPhone className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">Contact Details</h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative input-icon">
                <label htmlFor="phone_number" className="block text-lg font-medium text-[#441a05]">
                  Phone Number <span className="text-[#DB9E30]">*</span>
                </label>
                <FaPhone className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter phone number"
                  required
                  aria-label="Phone Number"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="email" className="block text-lg font-medium text-[#441a05]">
                  Email
                </label>
                <FaEnvelope className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter email address"
                  
                  aria-label="Email"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="rfid" className="block text-lg font-medium text-[#441a05]">
                  RFID
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="rfid"
                  name="rfid"
                  value={formData.rfid}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter RFID"
                  aria-label="RFID"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="present_address" className="block text-lg font-medium text-[#441a05]">
                  Present Address 
                </label>
                <FaMapMarkerAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="present_address"
                  name="present_address"
                  value={formData.present_address}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter present address"
                  
                  aria-label="Present Address"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="permanent_address" className="block text-lg font-medium text-[#441a05]">
                  Permanent Address
                </label>
                <FaMap className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="permanent_address"
                  name="permanent_address"
                  value={formData.permanent_address}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter permanent address"
                  
                  aria-label="Permanent Address"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="disability_info" className="block text-lg font-medium text-[#441a05]">
                  Disability Information
                </label>
                <FaWheelchair className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <textarea
                  id="disability_info"
                  name="disability_info"
                  value={formData.disability_info}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter any disability information"
                  rows="3"
                  aria-label="Disability Information"
                />
              </div>
            </div>
          </div>

          {/* Family Details */}
          <div className=" bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center mb-4">
              <FaHome className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">Family Details</h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="relative input-icon">
                <label htmlFor="spouse_name" className="block text-lg font-medium text-[#441a05]">
                  Spouse Name
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="spouse_name"
                  name="spouse_name"
                  value={formData.spouse_name}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter spouse name"
                  aria-label="Spouse Name"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="spouse_phone_number" className="block text-lg font-medium text-[#441a05]">
                  Spouse Phone Number
                </label>
                <FaPhone className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="spouse_phone_number"
                  name="spouse_phone_number"
                  value={formData.spouse_phone_number}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter spouse phone number"
                  aria-label="Spouse Phone Number"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="children_no" className="block text-lg font-medium text-[#441a05]">
                  Number of Children
                </label>
                <FaChild className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="number"
                  id="children_no"
                  name="children_no"
                  value={formData.children_no}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter number of children"
                  aria-label="Number of Children"
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className=" bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center mb-4">
              <FaBriefcase className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">Employment Details</h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative input-icon">
                <label htmlFor="short_name" className="block text-lg font-medium text-[#441a05]">
                  Short Name 
                </label>
                <FaUserTag className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="short_name"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter short name"
                  
                  aria-label="Short Name"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="name_tag" className="block text-lg font-medium text-[#441a05]">
                  Name Tag
                </label>
                <FaUserTag className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="name_tag"
                  name="name_tag"
                  value={formData.name_tag}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter name tag (e.g., Senior Teacher)"
                  aria-label="Name Tag"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="tin" className="block text-lg font-medium text-[#441a05]">
                  TIN
                </label>
                <FaFileAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="tin"
                  name="tin"
                  value={formData.tin}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter TIN"
                  aria-label="TIN"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="qualification" className="block text-lg font-medium text-[#441a05]">
                  Qualification
                </label>
                <FaFileAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter qualification"
                  aria-label="Qualification"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="staff_id_no" className="block text-lg font-medium text-[#441a05]">
                  Staff ID No. 
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="staff_id_no"
                  name="staff_id_no"
                  value={formData.staff_id_no}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter staff ID number"
                  
                  aria-label="Staff ID No."
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="employee_type" className="block text-lg font-medium text-[#441a05]">
                  Employee Type 
                </label>
                <FaBuilding className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="employee_type"
                  name="employee_type"
                  value={formData.employee_type}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  
                  aria-label="Employee Type"
                >
                  <option value="">Select employee type</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="PartTime">Part-Time</option>
                </select>
              </div>
              <div className="relative input-icon">
                <label htmlFor="job_nature" className="block text-lg font-medium text-[#441a05]">
                  Job Nature 
                </label>
                <FaBusinessTime className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="job_nature"
                  name="job_nature"
                  value={formData.job_nature}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  
                  aria-label="Job Nature"
                >
                  <option value="">Select job nature</option>
                  <option value="Fulltime">Full-Time</option>
                  <option value="Parttime">Part-Time</option>
                </select>
              </div>
              <div className="relative input-icon">
                <label htmlFor="designation" className="block text-lg font-medium text-[#441a05]">
                  Designation 
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter designation"
                  
                  aria-label="Designation"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="joining_date" className="block text-lg font-medium text-[#441a05]">
                  Joining Date
                </label>
                <FaCalendarAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="date"
                  id="joining_date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  aria-label="Joining Date"
                />
              </div>
              <div className="relative input-icon">
                <label htmlFor="role_id" className="block text-lg font-medium text-[#441a05]">
                  Role <span className="text-[#DB9E30]">*</span>
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="role_id"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  required
                  aria-label="Role ID"
                >
                  <option value="">Select role</option>
                  <option value="1">Teacher</option>
                  <option value="2">Administrator</option>
                  <option value="3">Support Staff</option>
                </select>
              </div>
              <div className="relative input-icon">
                <label htmlFor="department_id" className="block text-lg font-medium text-[#441a05]">
                  Department ID
                </label>
                <FaBuilding className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="department_id"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  aria-label="Department ID"
                >
                  <option value="">Select department</option>
                  <option value="1">Mathematics</option>
                  <option value="2">Science</option>
                  <option value="3">Administration</option>
                </select>
              </div>
            </div>
        </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-ripple inline-flex items-center gap-2 px-10 py-3.5 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-200 animate-scale-in ${isLoading ? 'opacity-50 cursor-not-allowed' : 'btn-glow'}"
              title="Register staff"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Submitting...</span>
                </span>
              ) : (
                <span>Register Staff</span>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              id="error-message"
              className="text-red-600 bg-red-50 p-4 rounded-lg shadow-inner animate-fadeIn text-center"
              aria-describedby="error-message"
            >
              Error: {error.data?.message || error.data?.error || error.data?.detail || error.status || 'Unknown error'}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StaffRegistrationForm;