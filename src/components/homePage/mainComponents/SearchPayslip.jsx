import React from 'react';
import { FaDownload } from 'react-icons/fa';
import SectionHeader from '../common/SectionHeader';
import SearchPayslipTable from '../tables/SearchPayslip';

export default function SearchPayslip() {
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
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
        `}
      </style>

      <SectionHeader
        title="অনলাইন পেস্লিপ অনুসন্ধান"
        className="bg-[#DB9E30] text-[#441a05] text-xl p-4 rounded-t-2xl shadow-md font-bold"
      />
      <div className="p-4 sm:p-6 space-y-4">
        <h5 className="text-[#DB9E30] font-medium tracking-wide text-lg leading-3 pt-2">
          শিক্ষার্থীর আইডি
        </h5>
        <div className="flex items-center gap-4">
          <input
            type="text"
            name="ID"
            placeholder="শিক্ষার্থীর আইডি লিখুন"
            className="w-9/12 bg-transparent text-[#441a05] placeholder-[#441a05] rounded-lg p-2 font-medium outline-none border border-[#9d9087] focus:border-[#DB9E30] transition-all duration-300 animate-scaleIn"
            aria-label="শিক্ষার্থীর আইডি"
          />
          <button
            className="w-3/12 bg-[#DB9E30] text-[#441a05] p-2 tracking-wide rounded-lg font-medium hover:text-white btn-glow animate-scaleIn"
            title="অনুসন্ধান / Search"
          >
            অনুসন্ধান
          </button>
        </div>

        {/* Payslip table */}
        <div className="rounded-2xl bg-white/5 border border-[#9d9087]/50">
          <h5 className="text-[#441a05] font-bold bg-[#DB9E30] p-2 rounded-t-2xl">
            পেস্লিপ আইডি: ১২৩৪৫৬৭
          </h5>
          <SearchPayslipTable />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            className="bg-[#DB9E30] text-[#441a05] rounded-lg w-10 h-10 p-2 hover:text-white btn-glow animate-scaleIn"
            aria-label="পেস্লিপ ডাউনলোড / Download Payslip"
            title="পেস্লিপ ডাউনলোড / Download Payslip"
          >
            <FaDownload className="w-full h-full" />
          </button>
          <button
            className="rounded-lg leading-10 px-6 bg-[#DB9E30] text-[#441a05] font-medium tracking-wider hover:text-white btn-glow animate-scaleIn"
            title="এখন পেমেন্ট করুন / Pay Now"
          >
            এখন পেমেন্ট করুন
          </button>
        </div>
      </div>
    </div>
  );
}