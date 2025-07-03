import React from 'react';

export default function FeeInfoTable() {
  const feeInfo = [
    {
      name: 'মোহাম্মদ আব্দুল্লাহ',
      class: '১ম শ্রেণি',
      amount: '১,২০০',
      status: 'পরিশোধিত',
    },
    {
      name: 'আলী হাসান',
      class: '১ম শ্রেণি',
      amount: '১,২০০',
      status: 'অপরিশোধিত',
    },
    {
      name: 'ফাতিমা বেগম',
      class: '১ম শ্রেণি',
      amount: '১,২০০',
      status: 'পরিশোধিত',
    },
    {
      name: 'ইউসুফ রহমান',
      class: '২য় শ্রেণি',
      amount: '১,২০০',
      status: 'পরিশোধিত',
    },
    {
      name: 'আয়েশা সিদ্দিকা',
      class: '১ম শ্রেণি',
      amount: '১,২০০',
      status: 'পরিশোধিত',
    },
    {
      name: 'হাসান মাহমুদ',
      class: '১ম শ্রেণি',
      amount: '২,০০০',
      status: 'অপরিশোধিত',
    },
    {
      name: 'জয়নাব খাতুন',
      class: '২য় শ্রেণি',
      amount: '১,২০০',
      status: 'পরিশোধিত',
    },
    {
      name: 'মুস্তফা কামাল',
      class: '১ম শ্রেণি',
      amount: '১,২০০',
      status: 'পরিশোধিত',
    },
    {
      name: 'রুকাইয়া আক্তার',
      class: '১ম শ্রেণি',
      amount: '২,০০০',
      status: 'অপরিশোধিত',
    },
  ];

  return (
    <div className="mt-4 border border-[#441a05]/20 rounded-2xl p-4 animate-fadeIn">
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

      <h5 className="text-[#441a05] text-end text-xs mb-2">
        মোট শিক্ষার্থী পাওয়া গেছে: <span className="text-[#DB9E30] font-bold">৪০</span>
      </h5>
      <div className="max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-[#9d9087] scrollbar-track-transparent">
        <table
          className="w-full text-center bg-white/5  divide-[#9d9087]"
          aria-label="ফি সংক্রান্ত তথ্য সারণী / Fee Information Table"
        >
          <thead>
            <tr className="bg-[#DB9E30] text-[#441a05] font-bold">
              <th className="w-[40%] py-2">নাম</th>
              <th className="w-[20%] py-2">শ্রেণি</th>
              <th className="w-[20%] py-2">পরিমাণ</th>
              <th className="w-[20%] py-2">অবস্থা</th>
            </tr>
          </thead>
          <tbody>
            {feeInfo.map((student, index) => (
              <tr
                key={index}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <td className="w-[40%] py-1 text-[#441a05]">{student.name}</td>
                <td className="w-[20%] py-1 text-[#441a05]">{student.class}</td>
                <td className="w-[20%] py-1 text-[#441a05]">{student.amount} টাকা</td>
                <td className="w-[20%] py-1">
                  <span
                    className={`text-[#441a05] px-3 py-[2px] rounded-full text-xs ${
                      student.status === 'পরিশোধিত' ? 'text-[#DB9E30]' : 'text-[#441a05]'
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}