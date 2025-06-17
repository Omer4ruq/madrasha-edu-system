import React, { useState } from "react";
import { useGetStudentClassApIQuery } from '../../../redux/features/api/student/studentClassApi';
import { useGetclassConfigApiQuery } from '../../../redux/features/api/class/classConfigApi';
import { useCreateStudentRegistrationApiMutation } from '../../../redux/features/api/student/studentRegistrationApi';
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
import toast, { Toaster } from 'react-hot-toast';

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
    status: "",
    residential_status: "",
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

    // Validate numeric fields
    if (
      isNaN(parseInt(formData.user_id)) ||
      isNaN(parseInt(formData.admission_year_id)) ||
      isNaN(parseInt(formData.class_id)) ||
      (formData.roll_no && isNaN(parseInt(formData.roll_no)))
    ) {
      toast.error('অনুগ্রহ করে ইউজার আইডি, ভর্তি বছর, ক্লাস এবং রোল নম্বর-এ বৈধ সংখ্যা লিখুন।');
      return;
    }

    try {
      const payload = {
        ...formData,
        user_id: parseInt(formData.user_id),
        admission_year_id: parseInt(formData.admission_year_id),
        class_id: parseInt(formData.class_id),
        roll_no: formData.roll_no ? parseInt(formData.roll_no) : '',
        password: formData.password || '',
        rfid: formData.rfid || '',
        tc_no: formData.tc_no || '',
        disability_info: formData.disability_info || '',
        name_tag: formData.name_tag || '',
        parent: {
          ...formData.parent,
          password: formData.parent?.password || '',
          f_occupation: formData.parent.f_occupation || '',
          m_occupation: formData.parent.m_occupation || '',
          g_occupation: formData.parent.g_occupation || '',
          f_nid: formData.parent.f_nid || '',
          m_nid: formData.parent.m_nid || '',
          g_name: formData.parent.g_name || '',
          g_mobile_no: formData.parent.g_mobile_no || '',
        },
      };

      console.log("Submitting Payload:", JSON.stringify(payload, null, 2));
      await createStudentRegistration(payload).unwrap();
      toast.success('ছাত্র সফলভাবে নিবন্ধিত হয়েছে!');
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
        status: "",
        residential_status: "",
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
        "অজানা ত্রুটি";
      toast.error(`ছাত্র নিবন্ধন ব্যর্থ: ${errorMessage}`);
    }
  };

  return (
    <div className="py-10 w-full min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
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
        <div className="sticky top-0 z-10 mb-8 animate-fadeIn backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-3">
            <IoAddCircleOutline className="text-4xl text-[#DB9E30] mb-3" />
            <h2 className="text-3xl font-bold text-[#441a05] title-underline">
              ছাত্র নিবন্ধন
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl space-y-10">
          {/* ব্যক্তিগত তথ্য */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md animate-fadeIn">
            <div className="flex items-center justify-center mb-4">
              <FaUser className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">
              ব্যক্তিগত তথ্য
            </h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative input-icon">
                <label
                  htmlFor="name"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  পূর্ণ নাম <span className="text-[#DB9E30]">*</span>
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="পূর্ণ নাম লিখুন"
                  required
                  aria-label="পূর্ণ নাম"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="password"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  পাসওয়ার্ড
                </label>
                <FaLock className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="পাসওয়ার্ড লিখুন (ঐচ্ছিক)"
                  aria-label="পাসওয়ার্ড"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="user_id"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  ইউজার আইডি <span className="text-[#DB9E30]">*</span>
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="number"
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="ইউজার আইডি লিখুন"
                  required
                  aria-label="ইউজার আইডি"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="gender"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  লিঙ্গ
                </label>
                <FaVenusMars className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  aria-label="লিঙ্গ"
                >
                  <option value="">লিঙ্গ নির্বাচন করুন</option>
                  <option value="Male">পুরুষ</option>
                  <option value="Female">নারী</option>
                  <option value="Other">অন্যান্য</option>
                </select>
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="dob"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  জন্ম তারিখ
                </label>
                <FaCalendarAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  aria-label="জন্ম তারিখ"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="blood_group"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  রক্তের গ্রুপ
                </label>
                <FaHeart className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="blood_group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  aria-label="রক্তের গ্রুপ"
                >
                  <option value="">রক্তের গ্রুপ নির্বাচন করুন</option>
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
                  জাতীয়তা
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="জাতীয়তা লিখুন"
                  aria-label="জাতীয়তা"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="birth_certificate_no"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  জন্ম সনদ নম্বর
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="birth_certificate_no"
                  name="birth_certificate_no"
                  value={formData.birth_certificate_no}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="জন্ম সনদ নম্বর লিখুন"
                  aria-label="জন্ম সনদ নম্বর"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="status"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  স্থিতি
                </label>
                <FaUserGraduate className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  aria-label="স্থিতি"
                >
                  <option value="">স্থিতি নির্বাচন করুন</option>
                  <option value="Online">অনলাইন</option>
                  <option value="Offline">অফলাইন</option>
                </select>
              </div>
              <div className="relative input-icon col-span-3">
                <label
                  htmlFor="disability_info"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  প্রতিবন্ধকতার তথ্য
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <textarea
                  id="disability_info"
                  name="disability_info"
                  value={formData.disability_info}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="প্রতিবন্ধকতার তথ্য লিখুন (ঐচ্ছিক)"
                  rows="3"
                  aria-label="প্রতিবন্ধকতার তথ্য"
                />
              </div>
            </div>
          </div>

          {/* যোগাযোগের তথ্য */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center mb-4">
              <FaPhone className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">
              যোগাযোগের তথ্য
            </h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative input-icon">
                <label
                  htmlFor="phone_number"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  ফোন নম্বর
                </label>
                <FaPhone className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="ফোন নম্বর লিখুন"
                  aria-label="ফোন নম্বর"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="email"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  ইমেইল
                </label>
                <FaEnvelope className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="ইমেইল ঠিকানা লিখুন"
                  aria-label="ইমেইল"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="rfid"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  আরএফআইডি
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="rfid"
                  name="rfid"
                  value={formData.rfid}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="আরএফআইডি লিখুন (ঐচ্ছিক)"
                  aria-label="আরএফআইডি"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="present_address"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  বর্তমান ঠিকানা
                </label>
                <FaMapMarkerAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="present_address"
                  name="present_address"
                  value={formData.present_address}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="বর্তমান ঠিকানা লিখুন"
                  aria-label="বর্তমান ঠিকানা"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="permanent_address"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  স্থায়ী ঠিকানা
                </label>
                <FaMap className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="permanent_address"
                  name="permanent_address"
                  value={formData.permanent_address}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="স্থায়ী ঠিকানা লিখুন"
                  aria-label="স্থায়ী ঠিকানা"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="village"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  গ্রাম
                </label>
                <FaMapMarkerAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="village"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="গ্রামের নাম লিখুন"
                  aria-label="গ্রাম"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="post_office"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  পোস্ট অফিস
                </label>
                <FaMapMarkerAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="post_office"
                  name="post_office"
                  value={formData.post_office}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="পোস্ট অফিসের নাম লিখুন"
                  aria-label="পোস্ট অফিস"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="ps_or_upazilla"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  থানা/উপজেলা
                </label>
                <FaMapMarkerAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="ps_or_upazilla"
                  name="ps_or_upazilla"
                  value={formData.ps_or_upazilla}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="থানা বা উপজেলার নাম লিখুন"
                  aria-label="থানা/উপজেলা"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="district"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  জেলা
                </label>
                <FaMapMarkerAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="জেলার নাম লিখুন"
                  aria-label="জেলা"
                />
              </div>
            </div>
          </div>

          {/* শিক্ষাগত তথ্য */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center mb-4">
              <FaBook className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">
              শিক্ষাগত তথ্য
            </h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative input-icon">
                <label
                  htmlFor="admission_year_id"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  ভর্তি বছর <span className="text-[#DB9E30]">*</span>
                </label>
                <FaCalendarAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="admission_year_id"
                  name="admission_year_id"
                  value={formData.admission_year_id}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  required
                  aria-label="ভর্তি বছর"
                >
                  <option value="">ভর্তি বছর নির্বাচন করুন</option>
                  <option value="1">২০২৪</option>
                  <option value="2">২০২৫</option>
                </select>
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="class_id"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  ক্লাস <span className="text-[#DB9E30]">*</span>
                </label>
                <FaSchool className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="class_id"
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  required
                  aria-label="ক্লাস"
                >
                  <option value="">ক্লাস নির্বাচন করুন</option>
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
                  রোল নম্বর
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="number"
                  id="roll_no"
                  name="roll_no"
                  value={formData.roll_no}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="রোল নম্বর লিখুন"
                  aria-label="রোল নম্বর"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="admission_date"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  ভর্তি তারিখ
                </label>
                <FaCalendarAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="date"
                  id="admission_date"
                  name="admission_date"
                  value={formData.admission_date}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  aria-label="ভর্তি তারিখ"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="name_tag"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  নাম ট্যাগ
                </label>
                <FaUserTag className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="name_tag"
                  name="name_tag"
                  value={formData.name_tag}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="নাম ট্যাগ লিখুন (যেমন: মেধা)"
                  aria-label="নাম ট্যাগ"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="tc_no"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  স্থানান্তর সনদ নম্বর
                </label>
                <FaFileAlt className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="tc_no"
                  name="tc_no"
                  value={formData.tc_no}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="স্থানান্তর সনদ নম্বর লিখুন (ঐচ্ছিক)"
                  aria-label="স্থানান্তর সনদ নম্বর"
                />
              </div>
              <div className="relative input-icon col-span-3">
                <label className="block text-lg font-medium text-[#441a05]">
                  আবাসিক অবস্থা
                </label>
                <div className="mt-4 relative input-icon col-span-3 animate-scaleIn">
                  <label className="block text-lg font-medium text-[#441a05]">
                    আবাসিক অবস্থা
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
                        aria-label="আবাসিক"
                      />
                      <span className="relative flex items-center">
                        <span className="w-5 h-5 rounded-full border-2 border-[#9d9087] bg-white/10 group-hover:border-[#DB9E30] transition-all duration-300 flex items-center justify-center">
                          {formData.residential_status === "Residential" && (
                            <span className="w-3 h-3 rounded-full bg-[#DB9E30] scale-100 transition-transform duration-200"></span>
                          )}
                        </span>
                        <span className="ml-3 text-[#441a05] font-medium group-hover:text-[#DB9E30] transition-colors duration-300">
                          আবাসিক
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
                        aria-label="অ-আবাসিক"
                      />
                      <span className="relative flex items-center">
                        <span className="w-5 h-5 rounded-full border-2 border-[#9d9087] bg-white/10 group-hover:border-[#DB9E30] transition-all duration-300 flex items-center justify-center">
                          {formData.residential_status === "NonResidential" && (
                            <span className="w-3 h-3 rounded-full bg-[#DB9E30] scale-100 transition-transform duration-200"></span>
                          )}
                        </span>
                        <span className="ml-3 text-[#441a05] font-medium group-hover:text-[#DB9E30] transition-colors duration-300">
                          অ-আবাসিক
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* অভিভাবকের তথ্য */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center mb-4">
              <FaHome className="text-3xl text-[#DB9E30]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#441a05] text-center">
              অভিভাবকের তথ্য
            </h3>
            <div className="border-t border-[#9d9087]/50 mt-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative input-icon">
                <label
                  htmlFor="parent_name"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  অভিভাবকের নাম <span className="text-[#DB9E30]">*</span>
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="parent_name"
                  name="name"
                  value={formData.parent.name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="অভিভাবকের নাম লিখুন"
                  required
                  aria-label="অভিভাবকের নাম"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="parent_password"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  অভিভাবকের পাসওয়ার্ড
                </label>
                <FaLock className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="password"
                  id="parent_password"
                  name="password"
                  value={formData.parent.password}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="পাসওয়ার্ড লিখুন (ঐচ্ছিক)"
                  aria-label="অভিভাবকের পাসওয়ার্ড"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="father_name"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  পিতার নাম
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="father_name"
                  name="father_name"
                  value={formData.parent.father_name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="পিতার নাম লিখুন"
                  aria-label="পিতার নাম"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="father_mobile_no"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  পিতার মোবাইল নম্বর
                </label>
                <FaPhone className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="father_mobile_no"
                  name="father_mobile_no"
                  value={formData.parent.father_mobile_no}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="মোবাইল নম্বর লিখুন"
                  aria-label="পিতার মোবাইল নম্বর"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="mother_name"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  মাতার নাম
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="mother_name"
                  name="mother_name"
                  value={formData.parent.mother_name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="মাতার নাম লিখুন"
                  aria-label="মাতার নাম"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="mother_mobile_no"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  মাতার মোবাইল নম্বর
                </label>
                <FaPhone className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="mother_mobile_no"
                  name="mother_mobile_no"
                  value={formData.parent.mother_mobile_no}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="মোবাইল নম্বর লিখুন"
                  aria-label="মাতার মোবাইল নম্বর"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="relation"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  ছাত্রের সাথে সম্পর্ক
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <select
                  id="relation"
                  name="relation"
                  value={formData.parent.relation}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  aria-label="ছাত্রের সাথে সম্পর্ক"
                >
                  <option value="">সম্পর্ক নির্বাচন করুন</option>
                  <option value="Father">পিতা</option>
                  <option value="Mother">মাতা</option>
                  <option value="Guardian">অভিভাবক</option>
                </select>
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="f_occupation"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  পিতার পেশা
                </label>
                <FaUserTag className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="f_occupation"
                  name="f_occupation"
                  value={formData.parent.f_occupation}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="পিতার পেশা লিখুন"
                  aria-label="পিতার পেশা"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="m_occupation"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  মাতার পেশা
                </label>
                <FaUserTag className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="m_occupation"
                  name="m_occupation"
                  value={formData.parent.m_occupation}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="মাতার পেশা লিখুন"
                  aria-label="মাতার পেশা"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="g_occupation"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  অভিভাবকের পেশা
                </label>
                <FaUserTag className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="g_occupation"
                  name="g_occupation"
                  value={formData.parent.g_occupation}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="অভিভাবকের পেশা লিখুন"
                  aria-label="অভিভাবকের পেশা"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="f_nid"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  পিতার জাতীয় পরিচয়পত্র
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="f_nid"
                  name="f_nid"
                  value={formData.parent.f_nid}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="পিতার জাতীয় পরিচয়পত্র নম্বর লিখুন"
                  aria-label="পিতার জাতীয় পরিচয়পত্র"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="m_nid"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  মাতার জাতীয় পরিচয়পত্র
                </label>
                <FaIdCard className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="m_nid"
                  name="m_nid"
                  value={formData.parent.m_nid}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="মাতার জাতীয় পরিচয়পত্র নম্বর লিখুন"
                  aria-label="মাতার জাতীয় পরিচয়পত্র"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="g_name"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  অভিভাবকের নাম
                </label>
                <FaUser className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="g_name"
                  name="g_name"
                  value={formData.parent.g_name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="অভিভাবকের নাম লিখুন"
                  aria-label="অভিভাবকের নাম"
                />
              </div>
              <div className="relative input-icon">
                <label
                  htmlFor="g_mobile_no"
                  className="block text-lg font-medium text-[#441a05]"
                >
                  অভিভাবকের মোবাইল নম্বর <span className="text-[#DB9E30]">*</span>
                </label>
                <FaPhone className="absolute left-3 top-[50px] text-[#DB9E30]" />
                <input
                  type="text"
                  id="g_mobile_no"
                  name="g_mobile_no"
                  value={formData.parent.g_mobile_no}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full bg-white/10 text-[#441a05] placeholder-[#441a05]/70 pl-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#DB9E30] border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  placeholder="অভিভাবকের মোবাইল নম্বর লিখুন"
                  required
                  aria-label="অভিভাবকের মোবাইল নম্বর"
                />
              </div>
            </div>
          </div>

          {/* জমা দিন বাটন */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading || isListLoading || isConfigLoading}
              className={`btn btn-ripple inline-flex items-center gap-2 px-10 py-3.5 rounded-lg hover:text-white font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-200 animate-scaleIn ${
                isLoading || isListLoading || isConfigLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "btn-glow"
              }`}
              title="ছাত্র নিবন্ধন করুন"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>জমা হচ্ছে...</span>
                </span>
              ) : (
                <span>ছাত্র নিবন্ধন করুন</span>
              )}
            </button>
          </div>

          {/* ত্রুটি বার্তা */}
          {(error || listError || configError) && (
            <div
              id="error-message"
              className="text-red-600 bg-red-50 p-4 rounded-lg shadow-inner animate-fadeIn text-center"
              aria-describedby="error-message"
            >
              ত্রুটি:{" "}
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
                "অজানা ত্রুটি"}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentRegistrationForm;