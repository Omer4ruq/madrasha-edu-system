import React, { useState } from "react";
import { useGetStudentClassApIQuery } from '../../../../redux/features/api/student/studentClassApi';
import { useGetclassConfigApiQuery } from '../../../../redux/features/api/class/classConfigApi';
import { useCreateStudentRegistrationApiMutation } from '../../../../redux/features/api/student/studentRegistrationApi';
import {
  FaSpinner,
  FaUser,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaIdCard,
  FaCalendarAlt,
  FaVenusMars,
  FaHeart,
  FaMapMarkerAlt,
  FaMap,
  FaUserGraduate,
  FaUserTag,
  FaFileAlt,
  FaBook,
  FaSchool,
} from "react-icons/fa";
import { IoAddCircleOutline } from "react-icons/io5";

const StudentRegistrationForm = () => {
  const {
    data: classList,
    isLoading: isListLoading,
    error: listError,
  } = useGetStudentClassApIQuery();
  const {
    data: classConfig,
    isLoading: isConfigLoading,
    error: configError,
  } = useGetclassConfigApiQuery();
  console.log("class config", classConfig);

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    user_id: "",
    gender: "",
    dob: "",
    phone_number: "",
    email: "",
    rfid: "",
    present_address: "",
    permanent_address: "",
    disability_info: "",
    blood_group: "",
    status: "Online",
    residential_status: "NonResidential",
    name_tag: "",
    admission_year_id: "",
    class_id: "",
    roll_no: "",
    birth_certificate_no: "",
    nationality: "",
    tc_no: "",
    admission_date: "",
    village: "",
    post_office: "",
    ps_or_upazilla: "",
    district: "",
    parent: {
      name: "",
      password: "",
      father_name: "",
      father_mobile_no: "",
      mother_name: "",
      mother_mobile_no: "",
      relation: "",
      f_occupation: "",
      m_occupation: "",
      g_occupation: "",
      f_nid: "",
      m_nid: "",
      g_name: "",
      g_mobile_no: "",
    },
  });

  const [createStudentRegistration, { isLoading, error }] =
    useCreateStudentRegistrationApiMutation();

  const handleChange = (e, parentField = false) => {
    const { name, value } = e.target;
    if (parentField) {
      setFormData({
        ...formData,
        parent: { ...formData.parent, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "name",
      "user_id",
      "gender",
      "dob",
      "phone_number",
      "email",
      "present_address",
      "permanent_address",
      "blood_group",
      "admission_year_id",
      "class_id",
      "roll_no",
      "birth_certificate_no",
      "nationality",
      "admission_date",
      "village",
      "post_office",
      "ps_or_upazilla",
      "district",
      "status",
    ];
    const requiredParentFields = [
      "name",
      "father_name",
      "father_mobile_no",
      "mother_name",
      "mother_mobile_no",
      "relation",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);
    const missingParentFields = requiredParentFields.filter(
      (field) => !formData.parent[field]
    );

    if (missingFields.length > 0 || missingParentFields.length > 0) {
      alert(
        `Please fill in all required fields: ${[
          ...missingFields,
          ...missingParentFields.map((f) => `parent.${f}`),
        ].join(", ")}`
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    const phoneRegex = /^\+?\d{10,15}$/;
    if (
      !phoneRegex.test(formData.phone_number) ||
      !phoneRegex.test(formData.parent.father_mobile_no) ||
      !phoneRegex.test(formData.parent.mother_mobile_no) ||
      (formData.parent.g_mobile_no &&
        !phoneRegex.test(formData.parent.g_mobile_no))
    ) {
      alert(
        "Please enter valid phone numbers (10-15 digits, optional + prefix)"
      );
      return;
    }

    if (
      isNaN(parseInt(formData.user_id)) ||
      isNaN(parseInt(formData.admission_year_id)) ||
      isNaN(parseInt(formData.class_id)) ||
      isNaN(parseInt(formData.roll_no))
    ) {
      alert(
        "Please enter valid numeric values for User ID, Admission Year, Class, and Roll No."
      );
      return;
    }

    try {
      const payload = {
        ...formData,
        user_id: parseInt(formData.user_id),
        admission_year_id: parseInt(formData.admission_year_id),
        class_id: parseInt(formData.class_id),
        roll_no: parseInt(formData.roll_no),
        password: formData.password || null,
        rfid: formData.rfid || null,
        tc_no: formData.tc_no || null,
        disability_info: formData.disability_info || null,
        name_tag: formData.name_tag || null,
        parent: {
          ...formData.parent,
          password: formData.parent?.password || null,
          f_occupation: formData.parent.f_occupation || null,
          m_occupation: formData.parent.m_occupation || null,
          g_occupation: formData.parent.g_occupation || null,
          f_nid: formData.parent.f_nid || null,
          m_nid: formData.parent.m_nid || null,
          g_name: formData.parent.g_name || null,
          g_mobile_no: formData.parent.g_mobile_no || null,
        },
      };

      console.log("Submitting Payload:", JSON.stringify(payload, null, 2));
      await createStudentRegistration(payload).unwrap();
      alert("Student registered successfully!");
      setFormData({
        name: "",
        password: "",
        user_id: "",
        gender: "",
        dob: "",
        phone_number: "",
        email: "",
        rfid: "",
        present_address: "",
        permanent_address: "",
        disability_info: "",
        blood_group: "",
        status: "Online",
        residential_status: "NonResidential",
        name_tag: "",
        admission_year_id: "",
        class_id: "",
        roll_no: "",
        birth_certificate_no: "",
        nationality: "",
        tc_no: "",
        admission_date: "",
        village: "",
        post_office: "",
        ps_or_upazilla: "",
        district: "",
        parent: {
          name: "",
          password: "",
          father_name: "",
          father_mobile_no: "",
          mother_name: "",
          mother_mobile_no: "",
          relation: "",
          f_occupation: "",
          m_occupation: "",
          g_occupation: "",
          f_nid: "",
          m_nid: "",
          g_name: "",
          g_mobile_no: "",
        },
      });
    } catch (err) {
      console.error("Full Error:", JSON.stringify(err, null, 2));
      const errorMessage =
        err.data?.message ||
        err.data?.error ||
        err.data?.detail ||
        err.status ||
        "An unknown error occurred";
      alert(`Failed to register student: ${errorMessage}`);
    }
  };

  return (
    <div className="py-8 w-full min-h-screen">
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
        <div className="sticky top-0 z-10 pt-6 mb-8 animate-fadeIn backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-3">
            <IoAddCircleOutline className="text-4xl text-[#DB9E30] mb-3" />
            <h2 className="text-3xl font-bold text-[#441a05] title-underline">
              Student Registration
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl space-y-10">
          {/* Personal Information */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md animate-fadeIn">
            <div className="flex items-center justify-center mb-4">
              <FaUser className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">
              Personal Information
            </h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative input-icon">
                <label
                  htmlFor="name"
                  className="block text-lg font-medium text-[#441a05]"
                >
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
                <label
                  htmlFor="password"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Password
                </label>
                <FaLock className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter password (optional)"
                  aria-label="Password"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="user_id"
                  className="block text-lg font-medium text-[#441a05]"
                >
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
                <label
                  htmlFor="gender"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Gender <span className="text-[#DB9E30]">*</span>
                </label>
                <FaVenusMars className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  required
                  aria-label="Gender"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="dob"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Date of Birth <span className="text-[#DB9E30]">*</span>
                </label>
                <FaCalendarAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  required
                  aria-label="Date of Birth"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="blood_group"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Blood Group <span className="text-[#DB9E30]">*</span>
                </label>
                <FaHeart className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="blood_group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  required
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
                <label
                  htmlFor="nationality"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Nationality <span className="text-[#DB9E30]">*</span>
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter nationality"
                  required
                  aria-label="Nationality"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="birth_certificate_no"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Birth Certificate No.{" "}
                  <span className="text-[#DB9E30]">*</span>
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="birth_certificate_no"
                  name="birth_certificate_no"
                  value={formData.birth_certificate_no}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter birth certificate number"
                  required
                  aria-label="Birth Certificate No."
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="status"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Status <span className="text-[#DB9E30]">*</span>
                </label>
                <FaUserGraduate className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  required
                  aria-label="Status"
                >
                  <option value="">Select status</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              <div className="relative input-icon col-span-3">
                <label
                  htmlFor="disability_info"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Disability Information
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <textarea
                  id="disability_info"
                  name="disability_info"
                  value={formData.disability_info}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter any disability information (optional)"
                  rows="3"
                  aria-label="Disability Information"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center mb-4">
              <FaPhone className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">
              Contact Details
            </h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative input-icon">
                <label
                  htmlFor="phone_number"
                  className="block text-lg font-medium text-[#441a05]"
                >
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
                <label
                  htmlFor="email"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Email <span className="text-[#DB9E30]">*</span>
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
                  required
                  aria-label="Email"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="rfid"
                  className="block text-lg font-medium text-[#441a05]"
                >
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
                  placeholder="Enter RFID (optional)"
                  aria-label="RFID"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="present_address"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Present Address <span className="text-[#DB9E30]">*</span>
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
                  required
                  aria-label="Present Address"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="permanent_address"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Permanent Address <span className="text-[#DB9E30]">*</span>
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
                  required
                  aria-label="Permanent Address"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="village"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Village <span className="text-[#DB9E30]">*</span>
                </label>
                <FaMapMarkerAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="village"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter village"
                  required
                  aria-label="Village"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="post_office"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Post Office <span className="text-[#DB9E30]">*</span>
                </label>
                <FaMapMarkerAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="post_office"
                  name="post_office"
                  value={formData.post_office}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter post office"
                  required
                  aria-label="Post Office"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="ps_or_upazilla"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  PS/Upazilla <span className="text-[#DB9E30]">*</span>
                </label>
                <FaMapMarkerAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="ps_or_upazilla"
                  name="ps_or_upazilla"
                  value={formData.ps_or_upazilla}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter PS or Upazilla"
                  required
                  aria-label="PS/Upazilla"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="district"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  District <span className="text-[#DB9E30]">*</span>
                </label>
                <FaMapMarkerAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter district"
                  required
                  aria-label="District"
                />
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center mb-4">
              <FaBook className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">
              Academic Details
            </h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative input-icon">
                <label
                  htmlFor="admission_year_id"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Admission Year <span className="text-[#DB9E30]">*</span>
                </label>
                <FaCalendarAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="admission_year_id"
                  name="admission_year_id"
                  value={formData.admission_year_id}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  required
                  aria-label="Admission Year"
                >
                  <option value="">Select admission year</option>
                  <option value="1">2024</option>
                  <option value="2">2025</option>
                </select>
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="class_id"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Class <span className="text-[#DB9E30]">*</span>
                </label>
                <FaSchool className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="class_id"
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  required
                  aria-label="Class"
                >
                  <option value="">Select class</option>
                  {classConfig?.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls?.class_name || "N/A"} {cls?.section_name}{" "}
                      {cls?.shift_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="roll_no"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Roll No. <span className="text-[#DB9E30]">*</span>
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="number"
                  id="roll_no"
                  name="roll_no"
                  value={formData.roll_no}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter roll number"
                  required
                  aria-label="Roll No."
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="admission_date"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Admission Date <span className="text-[#DB9E30]">*</span>
                </label>
                <FaCalendarAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="date"
                  id="admission_date"
                  name="admission_date"
                  value={formData.admission_date}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  required
                  aria-label="Admission Date"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="name_tag"
                  className="block text-lg font-medium text-[#441a05]"
                >
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
                  placeholder="Enter name tag (e.g., Merit)"
                  aria-label="Name Tag"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="tc_no"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Transfer Certificate No.
                </label>
                <FaFileAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="tc_no"
                  name="tc_no"
                  value={formData.tc_no}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter TC number (optional)"
                  aria-label="Transfer Certificate No."
                />
              </div>
              <div className="relative input-icon col-span-3">
                <label className="block text-lg font-medium text-[#441a05]">
                  Residential Status <span className="text-[#DB9E30]">*</span>
                </label>
                <div className="mt-4 relative input-icon col-span-3 animate-scaleIn">
                  <label className="block text-lg font-medium text-[#441a05]">
                    Residential Status <span className="text-[#DB9E30]">*</span>
                  </label>
                  <div className="mt-3 flex space-x-6">
                    <label className="inline-flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        name="residential_status"
                        value="Residential"
                        checked={formData.residential_status === "Residential"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            residential_status: "Residential",
                          })
                        }
                        className="hidden"
                        required
                        aria-label="Residential"
                      />
                      <span className="relative flex items-center">
                        <span className="w-5 h-5 rounded-full border-2 border-[#9d9087] bg-white/10 group-hover:border-[#DB9E30] transition-all duration-300 flex items-center justify-center">
                          {formData.residential_status === "Residential" && (
                            <span className="w-3 h-3 rounded-full bg-[#DB9E30] scale-100 transition-transform duration-200"></span>
                          )}
                        </span>
                        <span className="ml-3 text-[#441a05] font-medium group-hover:text-[#DB9E30] transition-colors duration-300">
                          Residential
                        </span>
                      </span>
                    </label>
                    <label className="inline-flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        name="residential_status"
                        value="NonResidential"
                        checked={
                          formData.residential_status === "NonResidential"
                        }
                        onChange={() =>
                          setFormData({
                            ...formData,
                            residential_status: "NonResidential",
                          })
                        }
                        className="hidden"
                        required
                        aria-label="NonResidential"
                      />
                      <span className="relative flex items-center">
                        <span className="w-5 h-5 rounded-full border-2 border-[#9d9087] bg-white/10 group-hover:border-[#DB9E30] transition-all duration-300 flex items-center justify-center">
                          {formData.residential_status === "NonResidential" && (
                            <span className="w-3 h-3 rounded-full bg-[#DB9E30] scale-100 transition-transform duration-200"></span>
                          )}
                        </span>
                        <span className="ml-3 text-[#441a05] font-medium group-hover:text-[#DB9E30] transition-colors duration-300">
                          NonResidential
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center mb-4">
              <FaHome className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">
              Parent/Guardian Information
            </h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative input-icon">
                <label
                  htmlFor="parent_name"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Guardian Name <span className="text-[#DB9E30]">*</span>
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="parent_name"
                  name="name"
                  value={formData.parent.name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter guardian name"
                  required
                  aria-label="Guardian Name"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="parent_password"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Guardian Password
                </label>
                <FaLock className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="password"
                  id="parent_password"
                  name="password"
                  value={formData.parent.password}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter password (optional)"
                  aria-label="Guardian Password"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="father_name"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Father's Name <span className="text-[#DB9E30]">*</span>
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="father_name"
                  name="father_name"
                  value={formData.parent.father_name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter father's name"
                  required
                  aria-label="Father's Name"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="father_mobile_no"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Father's Mobile No. <span className="text-[#DB9E30]">*</span>
                </label>
                <FaPhone className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="father_mobile_no"
                  name="father_mobile_no"
                  value={formData.parent.father_mobile_no}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter mobile number"
                  required
                  aria-label="Father's Mobile No."
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="mother_name"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Mother's Name <span className="text-[#DB9E30]">*</span>
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="mother_name"
                  name="mother_name"
                  value={formData.parent.mother_name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter mother's name"
                  required
                  aria-label="Mother's Name"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="mother_mobile_no"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Mother's Mobile No. <span className="text-[#DB9E30]">*</span>
                </label>
                <FaPhone className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="mother_mobile_no"
                  name="mother_mobile_no"
                  value={formData.parent.mother_mobile_no}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter mobile number"
                  required
                  aria-label="Mother's Mobile No."
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="relation"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Relation with Student{" "}
                  <span className="text-[#DB9E30]">*</span>
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="relation"
                  name="relation"
                  value={formData.parent.relation}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  required
                  aria-label="Relation with Student"
                >
                  <option value="">Select relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="f_occupation"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Father's Occupation
                </label>
                <FaUserTag className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="f_occupation"
                  name="f_occupation"
                  value={formData.parent.f_occupation}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter father's occupation"
                  aria-label="Father's Occupation"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="m_occupation"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Mother's Occupation
                </label>
                <FaUserTag className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="m_occupation"
                  name="m_occupation"
                  value={formData.parent.m_occupation}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter mother's occupation"
                  aria-label="Mother's Occupation"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="g_occupation"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Guardian's Occupation
                </label>
                <FaUserTag className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="g_occupation"
                  name="g_occupation"
                  value={formData.parent.g_occupation}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter guardian's occupation"
                  aria-label="Guardian's Occupation"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="f_nid"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Father's NID
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="f_nid"
                  name="f_nid"
                  value={formData.parent.f_nid}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter father's NID"
                  aria-label="Father's NID"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="m_nid"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Mother's NID
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="m_nid"
                  name="m_nid"
                  value={formData.parent.m_nid}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter mother's NID"
                  aria-label="Mother's NID"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="g_name"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Guardian's Name
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="g_name"
                  name="g_name"
                  value={formData.parent.g_name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter guardian's name"
                  aria-label="Guardian's Name"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="g_mobile_no"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  Guardian's Mobile No.
                </label>
                <FaPhone className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="g_mobile_no"
                  name="g_mobile_no"
                  value={formData.parent.g_mobile_no}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="Enter guardian's mobile number"
                  aria-label="Guardian's Mobile No."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading || isListLoading || isConfigLoading}
              className={`btn btn-ripple inline-flex items-center gap-2 px-10 py-3.5 rounded-lg hover:text-white font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-200 animate-scaleIn ${
                isLoading || isListLoading || isConfigLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "btn-glow"
              }`}
              title="Register student"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Submitting...</span>
                </span>
              ) : (
                <span>Register Student</span>
              )}
            </button>
          </div>

          {/* Error Messages */}
          {(error || listError || configError) && (
            <div
              id="error-message"
              className="text-red-600 bg-red-50 p-4 rounded-lg shadow-inner animate-fadeIn text-center"
              aria-describedby="error-message"
            >
              Error:{" "}
              {error?.data?.message ||
                error?.data?.error ||
                error?.data?.detail ||
                error?.status ||
                listError?.data?.message ||
                listError?.data?.error ||
                listError?.data?.detail ||
                listError?.status ||
                configError?.data?.message ||
                configError?.data?.error ||
                configError?.data?.detail ||
                configError?.status ||
                "Unknown error"}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentRegistrationForm;
