import React from 'react';
import SectionHeader from '../common/SectionHeader';
import generalSMS from '/icons/general-sms.png';
import leaveStudent from '/icons/leave-student.png';
import leaveTeacher from '/icons/leave-teachers.png';
import maskingSMS from '/icons/masking-sms.png';

export default function LeaveAndSmsInfo() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
        `}
      </style>

      {/* Leave Information */}
      <div className="bg-black/10 backdrop-blur-sm text-sm rounded-2xl shadow-xl animate-fadeIn">
        <SectionHeader
          title="ছুটির তথ্য"
          className="bg-[#DB9E30] text-[#441a05] text-xl p-4 rounded-t-2xl shadow-md font-bold"
        />
        <div className="sm:flex items-center gap-4 p-4 space-y-4 sm:space-y-0">
          {/* Leave Student */}
          <div className="p-4 bg-white/5 border border-[#9d9087]/50 rounded-2xl flex items-center sm:w-1/2 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 flex items-center justify-center rounded-full mr-3 bg-[#DB9E30] animate-scaleIn">
              <img src={leaveStudent} alt="শিক্ষার্থী ছুটি আইকন" className="w-8 h-8" />
            </div>
            <div className="border-l-2 border-[#9d9087] pl-3">
              <h4 className="text-[#441a05] text-[16px] font-medium">
                শিক্ষার্থী ছুটি
              </h4>
              <h4 className="text-xl font-bold text-[#DB9E30]">o</h4>
              {/* <h4 className="text-xs font-medium text-[#441a05]">
                মোট শিক্ষার্থী: ৫৩০
              </h4> */}
            </div>
          </div>

          {/* Leave Teacher */}
          <div className="p-4 bg-white/5 border border-[#9d9087]/50 rounded-2xl flex items-center sm:w-1/2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 flex items-center justify-center rounded-full mr-3 bg-[#441a05] animate-scaleIn">
              <img src={leaveTeacher} alt="শিক্ষক ছুটি আইকন" className="w-8 h-8" />
            </div>
            <div className="border-l-2 border-[#9d9087] pl-3">
              <h4 className="text-[#441a05] text-[16px] font-medium">
                কর্মকর্তা ছুটি
              </h4>
              <h4 className="text-xl font-bold text-[#DB9E30]">o</h4>
              {/* <h4 className="text-xs font-medium text-[#441a05]">
                মোট শিক্ষক: ৩০
              </h4> */}
            </div>
          </div>
        </div>
      </div>

      {/* SMS Information */}
      <div className="bg-black/10 backdrop-blur-sm text-sm rounded-2xl shadow-xl animate-fadeIn">
        <SectionHeader
          title="এসএমএস তথ্য"
          className="bg-[#DB9E30] text-[#441a05] text-xl p-4 rounded-t-2xl shadow-md font-bold"
        />
        <div className="sm:flex items-center gap-4 p-4 space-y-4 sm:space-y-0">
          {/* General SMS */}
          <div className="p-4 bg-white/5 border border-[#9d9087]/50 rounded-2xl flex items-center sm:w-1/2 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 flex items-center justify-center rounded-full mr-3 bg-[#441a05] animate-scaleIn">
              <img src={generalSMS} alt="সাধারণ এসএমএস আইকন" className="w-8 h-8" />
            </div>
            <div className="border-l-2 border-[#9d9087] pl-3">
              <h4 className="text-[#441a05] text-[16px] font-medium">
                সাধারণ এসএমএস
              </h4>
              <h4 className="text-xl font-bold text-[#441a05]">o</h4>
              {/* <h4 className="text-xs font-medium text-[#441a05]">
                মেয়াদ শেষ: ১২.০৮.২০২৮
              </h4> */}
            </div>
          </div>

          {/* Masking SMS */}
          <div className="p-4 bg-white/5 border border-[#9d9087]/50 rounded-2xl flex items-center sm:w-1/2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 flex items-center justify-center rounded-full mr-3 bg-[#441a05] animate-scaleIn">
              <img src={maskingSMS} alt="মাস্কিং এসএমএস আইকন" className="w-8 h-8" />
            </div>
            <div className="border-l-2 border-[#9d9087] pl-3">
              <h4 className="text-[#441a05] text-[16px] font-medium">
                মাস্কিং এসএমএস
              </h4>
              <h4 className="text-xl font-bold text-[#441a05]">o</h4>
              {/* <h4 className="text-xs font-medium text-[#441a05]">
                মেয়াদ শেষ: ১২.০৮.২০২৮
              </h4> */}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}