import React from 'react';
import SectionHeader from '../common/SectionHeader';
import FeeInfoForm from '../forms/FeeInfoForm';
import FeeInfoTable from '../tables/FeeInfoTable';

export default function FeeInfo() {
  return (
    <div className="bg-black/10 backdrop-blur-sm text-sm rounded-2xl shadow-xl animate-fadeIn">
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

      <SectionHeader
        title="ফি সংক্রান্ত তথ্য"
        className="bg-[#DB9E30] text-[#441a05] text-xl p-4 rounded-t-2xl shadow-md font-bold"
      />
      <div className="p-4 sm:p-6 rounded-b-2xl space-y-4">
        <FeeInfoForm />
        <FeeInfoTable />
      </div>
    </div>
  );
}