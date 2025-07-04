import React from 'react';
import { FaUserFriends, FaUserTie } from 'react-icons/fa';
import { FaGoogleScholar } from 'react-icons/fa6';
import { RiUserSettingsFill } from 'react-icons/ri';

export default function Overview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
        `}
      </style>

      {/* Total Students */}
      <div
        className="bg-black/10 backdrop-blur-sm border border-white/20 p-4 sm:p-6 rounded-2xl flex items-center shadow-xl animate-fadeIn"
        style={{ animationDelay: '0s' }}
      >
        <div className="w-14 h-14 flex items-center justify-center rounded-full mr-4 bg-[#DB9E30] animate-scaleIn">
          <FaGoogleScholar className="w-8 h-8 text-[#441a05]" />
        </div>
        <div className="border-l-2 border-[#9d9087] pl-4">
          <h4 className="text-[#441a05] font-medium text-sm">মোট শিক্ষার্থী</h4>
          <h4 className="text-xl font-bold text-[#441a05]">৫৩০</h4>
        </div>
      </div>

      {/* Total Teachers */}
      <div
        className="bg-black/10 backdrop-blur-sm border border-white/20 p-4 sm:p-6 rounded-2xl flex items-center shadow-xl animate-fadeIn"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="w-14 h-14 flex items-center justify-center rounded-full mr-4 bg-[#DB9E30] animate-scaleIn">
          <FaUserTie className="w-8 h-8 text-[#441a05]" />
        </div>
        <div className="border-l-2 border-[#9d9087] pl-4">
          <h4 className="text-[#441a05] font-medium text-sm">মোট শিক্ষক</h4>
          <h4 className="text-xl font-bold text-[#441a05]">৩০</h4>
        </div>
      </div>

      {/* Total Staff */}
      <div
        className="bg-black/10 backdrop-blur-sm border border-white/20 p-4 sm:p-6 rounded-2xl flex items-center shadow-xl animate-fadeIn"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="w-14 h-14 flex items-center justify-center rounded-full mr-4 bg-[#DB9E30] animate-scaleIn">
          <RiUserSettingsFill className="w-8 h-8 text-[#441a05]" />
        </div>
        <div className="border-l-2 border-[#9d9087] pl-4">
          <h4 className="text-[#441a05] font-medium text-sm">মোট কর্মী</h4>
          <h4 className="text-xl font-bold text-[#441a05]">১০</h4>
        </div>
      </div>

      {/* Total Parents */}
      <div
        className="bg-black/10 backdrop-blur-sm border border-white/20 p-4 sm:p-6 rounded-2xl flex items-center shadow-xl animate-fadeIn"
        style={{ animationDelay: '0.3s' }}
      >
        <div className="w-14 h-14 flex items-center justify-center rounded-full mr-4 bg-[#DB9E30] animate-scaleIn">
          <FaUserFriends className="w-8 h-8 text-[#441a05]" />
        </div>
        <div className="border-l-2 border-[#9d9087] pl-4">
          <h4 className="text-[#441a05] font-medium text-sm">মোট অভিভাবক</h4>
          <h4 className="text-xl font-bold text-[#441a05]">৫০০</h4>
        </div>
      </div>
    </div>
  );
}