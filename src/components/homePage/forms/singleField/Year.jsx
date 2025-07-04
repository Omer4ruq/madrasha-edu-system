import React from 'react';

export default function Year({ style, label = 'বছর', labelClassName, inputClassName }) {
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
        htmlFor="year"
        className={`font-semibold text-[#441a05] ${labelClassName || ''}`}
      >
        {label}
      </label>
      <select
        id="year"
        name="year"
        defaultValue="default"
        className={`w-full bg-transparent text-[#441a05] placeholder-[#441a05] px-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg focus:border-[#DB9E30] transition-all duration-300 animate-scaleIn ${inputClassName || ''}`}
        aria-label="বছর নির্বাচন করুন"
        title="বছর নির্বাচন করুন / Select Year"
      >
        <option value="default" disabled>
          বছর নির্বাচন করুন
        </option>
        <option value="2022">২০২২</option>
        <option value="2023">২০২৩</option>
        <option value="2024">২০২৪</option>
        <option value="2025">২০২৫</option>
      </select>
    </div>
  );
}