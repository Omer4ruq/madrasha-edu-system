import React from 'react';

export default function Class({ style, label = 'শ্রেণি', labelClassName, inputClassName }) {
  return (
    <div className={`space-y-1 ${style} animate-fadeIn`}>
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

      <label
        htmlFor="class"
        className={`font-semibold text-[#441a05] ${labelClassName || ''}`}
      >
        {label}
      </label>
      <select
        id="class"
        name="class"
        defaultValue="default"
        className={`w-full bg-transparent text-[#441a05] placeholder-[#441a05] px-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg focus:border-[#DB9E30] transition-all duration-300 animate-scaleIn ${inputClassName || ''}`}
        aria-label="শ্রেণি নির্বাচন করুন"
        title="শ্রেণি নির্বাচন করুন / Select Class"
      >
        <option value="default" disabled>
          শ্রেণি নির্বাচন করুন
        </option>
        <option value="Nursery">নার্সারি</option>
        <option value="Class-1">১ম শ্রেণি</option>
        <option value="Class-2">২য় শ্রেণি</option>
        <option value="Class-3">৩য় শ্রেণি</option>
      </select>
    </div>
  );
}