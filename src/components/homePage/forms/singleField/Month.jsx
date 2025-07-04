import React from 'react';

export default function Month({ style, label = 'মাস', labelClassName, inputClassName }) {
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
        htmlFor="month"
        className={`font-medium text-[#441a05] ${labelClassName || ''}`}
      >
        {label}
      </label>
      <select
        id="month"
        name="month"
        defaultValue="default"
        className={`w-full bg-transparent text-[#441a05] placeholder-[#441a05] px-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg focus:border-[#DB9E30] transition-all duration-300 animate-scaleIn ${inputClassName || ''}`}
        aria-label="মাস নির্বাচন করুন"
        title="মাস নির্বাচন করুন / Select Month"
      >
        <option value="default" disabled>
          মাস নির্বাচন করুন
        </option>
        <option value="January">জানুয়ারি</option>
        <option value="February">ফেব্রুয়ারি</option>
        <option value="March">মার্চ</option>
        <option value="April">এপ্রিল</option>
        <option value="May">মে</option>
        <option value="June">জুন</option>
        <option value="July">জুলাই</option>
        <option value="August">আগস্ট</option>
        <option value="September">সেপ্টেম্বর</option>
        <option value="October">অক্টোবর</option>
        <option value="November">নভেম্বর</option>
        <option value="December">ডিসেম্বর</option>
      </select>
    </div>
  );
}