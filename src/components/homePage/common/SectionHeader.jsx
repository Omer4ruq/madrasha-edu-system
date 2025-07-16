import React from 'react';
import { HiDotsCircleHorizontal } from 'react-icons/hi';

export default function SectionHeader({ title, className, titleClassName, iconClassName }) {
  return (
    <div
      className={`bg-[#DB9E30] rounded-t-2xl shadow-lg flex justify-between items-center p-4 animate-fadeIn ${className || ''}`}
    >
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

      <h3
        className={`text-[#441a05] text-xl leading-[33px] font-bold ${titleClassName || ''}`}
      >
        {title}
      </h3>
      <button
        className={`text-[#441a05] hover:text-[#9d9087] transition-colors duration-300 animate-scaleIn btn-glow ${iconClassName || ''}`}
        aria-label="অতিরিক্ত বিকল্প / More Options"
        title="অতিরিক্ত বিকল্প / More Options"
      >
        {/* <HiDotsCircleHorizontal className="w-7 h-7" /> */}
      </button>
    </div>
  );
}