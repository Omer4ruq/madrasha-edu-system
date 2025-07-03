import React from 'react';
import Class from './singleField/Class';
import Month from './singleField/Month';
import Year from './singleField/Year';

export default function FeeInfoForm() {
  return (
    <div className="my-4 backdrop-blur-sm border border-white/20 p-4 sm:p-6 rounded-2xl shadow-xl animate-fadeIn">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
        `}
      </style>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Year
          style="flex-1"
          label="বছর"
          labelClassName="text-[#DB9E30] font-medium mb-1"
          inputClassName="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
        />
        <Month
          style="flex-1"
          label="মাস"
          labelClassName="text-[#DB9E30] font-medium mb-1"
          inputClassName="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
        />
        <Class
          style="flex-1"
          label="শ্রেণি"
          labelClassName="text-[#DB9E30] font-medium mb-1"
          inputClassName="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
        />
      </div>
    </div>
  );
}