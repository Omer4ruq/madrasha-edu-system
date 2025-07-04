import React from 'react';
import SectionHeader from '../common/SectionHeader';
import FeeInfoForm from '../forms/FeeInfoForm';
import PaymentStatGraph from '../graphs/PaymentStat';
import PayStatTable from '../tables/PayStatTable';

export default function PaymentStat() {
  return (
    <div className="bg-black/10 backdrop-blur-sm text-sm rounded-2xl shadow-xl animate-fadeIn">
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

      <SectionHeader
        title="পেমেন্ট পরিসংখ্যান"
        className="bg-[#DB9E30] text-[#441a05] text-xl p-4 rounded-t-2xl shadow-md font-bold"
      />
      <div className="p-4 sm:p-6 rounded-b-2xl space-y-4">
        <FeeInfoForm />

        <h5 className="text-[#441a05] text-end text-xs mt-4 mb-2">
          মোট সারি পাওয়া গেছে: <span className="text-[#DB9E30] font-bold">৪০</span>
        </h5>

        {/* Table starts from here */}
        <div className="rounded-2xl border border-[#9d9087]/50 bg-white/5 animate-fadeIn">
          {/* Table heading */}
          <h4 className="bg-[#DB9E30] text-[#441a05] font-bold p-2 text-center rounded-t-2xl animate-scaleIn">
            পেমেন্ট বকেয়া সারাংশ
          </h4>

          <div className="sm:flex items-center gap-4 sm:pr-4 pb-4">
            {/* Chart */}
            <div className="sm:w-1/3">
              <PaymentStatGraph />
              <h3 className="text-center text-lg text-[#441a05] font-medium">
                মোট শিক্ষার্থী
              </h3>
            </div>

            {/* Main table */}
            <div className="sm:w-2/3">
              <PayStatTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}