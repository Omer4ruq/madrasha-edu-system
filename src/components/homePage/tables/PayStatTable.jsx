import React from 'react';

export default function PayStatTable() {
  const payInfo = [
    {
      name: 'নার্সারি',
      section: 'ক',
      totalStudents: '৪৫',
      paid: '৩২',
      unpaid: '১৩',
    },
    {
      name: 'নার্সারি',
      section: 'খ',
      totalStudents: '৪৮',
      paid: '৩৮',
      unpaid: '১০',
    },
    {
      name: '১ম শ্রেণি',
      section: 'ক',
      totalStudents: '৪০',
      paid: '৩৫',
      unpaid: '৫',
    },
    {
      name: '১ম শ্রেণি',
      section: 'খ',
      totalStudents: '৪২',
      paid: '৩০',
      unpaid: '১২',
    },
    {
      name: '২য় শ্রেণি',
      section: 'ক',
      totalStudents: '৪৫',
      paid: '৪০',
      unpaid: '৫',
    },
    {
      name: '২য় শ্রেণি',
      section: 'খ',
      totalStudents: '৪৮',
      paid: '৪৫',
      unpaid: '৩',
    },
  ];

  return (
    <div className="mt-4 bg-white/5 backdrop-blur-sm border border-[#9d9087]/60 rounded-2xl p-4 animate-fadeIn">
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

      <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-[#9d9087] scrollbar-track-transparent">
        <table
          className="w-full text-center divide-[#9d9087]"
          aria-label="পেমেন্ট পরিসংখ্যান সারণী / Payment Statistics Table"
        >
          <thead>
            <tr className="bg-[#DB9E30] text-[#441a05] font-bold text-xs">
              <th className="w-[20%] py-2">শ্রেণি</th>
              <th className="w-[20%] py-2">শাখা</th>
              <th className="w-[20%] py-2">মোট শিক্ষার্থী</th>
              <th className="w-[20%] py-2">পরিশোধিত</th>
              <th className="w-[20%] py-2">অপরিশোধিত</th>
            </tr>
          </thead>
          <tbody>
            {payInfo.map((singleClass, index) => (
              <tr
                key={index}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <td className="w-[20%] py-1 text-[#441a05]">{singleClass.name}</td>
                <td className="w-[20%] py-1 text-[#441a05]">{singleClass.section}</td>
                <td className="w-[20%] py-1 text-[#441a05]">{singleClass.totalStudents}</td>
                <td className="w-[20%] py-1 text-[#DB9E30]">{singleClass.paid}</td>
                <td className="w-[20%] py-1 text-[#9d9087]">{singleClass.unpaid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}