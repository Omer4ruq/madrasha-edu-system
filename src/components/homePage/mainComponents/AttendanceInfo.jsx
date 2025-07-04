import React from 'react';
import { PiDotsThreeCircleFill } from 'react-icons/pi';
import StudentAttendance from '../graphs/StudentAttendance';
import TeacherAttendance from '../graphs/TeacherAttendance';

export default function AttendanceInfo() {
  return (
    <div className="bg-black/10 backdrop-blur-sm cols-span-1 sm:col-span-2 order-2 sm:order-3 lg:order-2 rounded-2xl shadow-xl animate-fadeIn">
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

      {/* Component title */}
      <h3 className="bg-[#DB9E30] text-[#441a05] text-xl p-4 leading-[33px] rounded-t-2xl shadow-md font-bold">
        উপস্থিতি তথ্য
      </h3>

      {/* Graph section */}
      <div className="sm:flex gap-4 p-4 space-y-4 sm:space-y-0">
        {/* Students graph */}
        <div className="relative p-4 bg-white/5 border border-white/20 rounded-2xl sm:w-1/2 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <StudentAttendance />

          {/* Graph title */}
          <h5 className="text-center text-[#DB9E30] text-lg font-medium animate-scaleIn">
            শিক্ষার্থী
          </h5>

          {/* Graph info */}
          <div className="flex text-center divide-x-2 divide-[#9d9087]">
            <div className="w-1/2">
              <h5 className="text-[#441a05] font-medium">উপস্থিত</h5>
              <h5 className="text-[#441a05] font-bold">৩০০</h5>
            </div>
            <div className="w-1/2">
              <h5 className="text-[#441a05] font-medium">অনুপস্থিত</h5>
              <h5 className="text-[#441a05] font-bold">৪৫</h5>
            </div>
          </div>

          {/* Link icon */}
          <button
            title="বিস্তারিত দেখুন / View Details"
            className="absolute top-2 right-2 text-[#9d9087] hover:text-[#DB9E30] transition-colors duration-300 animate-scaleIn btn-glow"
          >
            <PiDotsThreeCircleFill className="w-7 h-7" />
          </button>
        </div>

        {/* Teachers graph */}
        <div className="relative p-4 bg-white/5 border border-white/20 rounded-2xl sm:w-1/2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <TeacherAttendance />

          {/* Graph title */}
          <h5 className="text-center text-[#DB9E30] text-lg font-medium animate-scaleIn">
            শিক্ষক
          </h5>

          {/* Graph info */}
          <div className="flex text-center divide-x-2 divide-[#9d9087]">
            <div className="w-1/2">
              <h5 className="text-[#441a05] font-medium">উপস্থিত</h5>
              <h5 className="text-[#441a05] font-bold">৩০</h5>
            </div>
            <div className="w-1/2">
              <h5 className="text-[#441a05] font-medium">অনুপস্থিত</h5>
              <h5 className="text-[#441a05] font-bold">২</h5>
            </div>
          </div>

          {/* Link icon */}
          <button
            title="বিস্তারিত দেখুন / View Details"
            className="absolute top-2 right-2 text-[#9d9087] hover:text-[#DB9E30] transition-colors duration-300 animate-scaleIn btn-glow"
          >
            <PiDotsThreeCircleFill className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}