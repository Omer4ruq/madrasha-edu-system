import React from 'react';

export default function SearchPayslipTable() {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-b-xl animate-fadeIn">
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

      <table
        className="w-full font-medium divide-y divide-[#9d9087]"
        aria-label="পেস্লিপ তথ্য সারণী / Payslip Information Table"
      >
        <tbody>
          <tr className="border-b border-[#9d9087] animate-fadeIn">
            <td className="w-1/3 p-2 text-[#DB9E30]">শিক্ষার্থীর নাম</td>
            <td className="w-2/3 text-[#441a05] border-l border-[#9d9087] pl-2">
              আল আমিন সাওন
            </td>
          </tr>
          <tr className="border-b border-[#9d9087] animate-fadeIn">
            <td className="w-1/3 p-2 text-[#DB9E30]">শিক্ষার্থীর আইডি</td>
            <td className="w-2/3 text-[#441a05] border-l border-[#9d9087] pl-2">
              ১২৩৪৫৬৭৮৯
            </td>
          </tr>
          <tr className="border-b border-[#9d9087] animate-fadeIn">
            <td className="w-1/3 p-2 text-[#DB9E30]">শ্রেণি</td>
            <td className="w-2/3 text-[#441a05] border-l border-[#9d9087] pl-2">
              ১ম শ্রেণি
            </td>
          </tr>
          <tr className="border-b border-[#9d9087] animate-fadeIn">
            <td className="w-1/3 p-2 text-[#DB9E30]">ফোন নম্বর</td>
            <td className="w-2/3 text-[#441a05] border-l border-[#9d9087] pl-2">
              ০১২৩৪৫৬৭৮৯০
            </td>
          </tr>
          <tr className="border-b border-[#9d9087] animate-fadeIn">
            <td className="w-1/3 p-2 text-[#DB9E30]">বকেয়া মাস</td>
            <td className="w-2/3 text-[#441a05] border-l border-[#9d9087] pl-2">
              এপ্রিল ২০২৪
            </td>
          </tr>
          <tr className="border-b border-[#9d9087] animate-fadeIn">
            <td className="w-1/3 p-2 text-[#DB9E30]">বকেয়া তারিখ</td>
            <td className="w-2/3 text-[#441a05] border-l border-[#9d9087] pl-2">
              ১২ মে ২০২৪
            </td>
          </tr>
          <tr className="border-b border-[#9d9087] animate-fadeIn">
            <td className="w-1/3 p-2 text-[#DB9E30]">জরিমানা শুরুর তারিখ</td>
            <td className="w-2/3 text-[#441a05] border-l border-[#9d9087] pl-2">
              ১৩ মে ২০২৪
            </td>
          </tr>
          <tr className="border-b border-[#9d9087] animate-fadeIn">
            <td className="w-1/3 p-2 text-[#DB9E30]">মোট বকেয়া পরিমাণ</td>
            <td className="w-2/3 text-[#441a05] border-l border-[#9d9087] pl-2">
              ৪৫৫৭ টাকা
            </td>
          </tr>
          <tr className="border-b border-[#9d9087] animate-fadeIn">
            <td className="w-1/3 p-2 text-[#DB9E30]">জরিমানার পরিমাণ</td>
            <td className="w-2/3 text-[#441a05] border-l border-[#9d9087] pl-2">
              ০ টাকা
            </td>
          </tr>
          <tr id="total-payable" className=" border-[#9d9087] animate-fadeIn">
            <td className="w-1/3 p-2 text-[#DB9E30]">মোট প্রদেয়</td>
            <td className="w-2/3 text-[#441a05] border-l border-[#9d9087] pl-2">
              ৪৫৫৭ টাকা
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}