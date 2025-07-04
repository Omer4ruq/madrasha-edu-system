import React from 'react';
import RoutineCard from '../cards/RoutineCard';
import SectionHeader from '../common/SectionHeader';
import ClassRoutineForm from '../forms/ClassRoutineForm';

export default function ClassRoutine() {
  const routines = [
    {
      name: 'ইংরেজি ১ম পত্র',
      time: '১০:০০ সকাল - ১১:০০ সকাল',
    },
    {
      name: 'ইংরেজি ২য় পত্র',
      time: '১১:০০ সকাল - ১২:০০ দুপুর',
    },
    {
      name: 'বাংলা ১ম পত্র',
      time: '১২:০০ দুপুর - ০১:০০ দুপুর',
    },
    {
      name: 'বাংলা ২য় পত্র',
      time: '০১:০০ দুপুর - ০২:০০ দুপুর',
    },
    {
      name: 'কুরআন তিলাওয়াত',
      time: '০২:০০ দুপুর - ০৩:০০ দুপুর',
    },
    {
      name: 'হাদিস শরীফ',
      time: '০৩:০০ দুপুর - ০৪:০০ বিকাল',
    },
    {
      name: 'ফিকহ',
      time: '০৪:০০ বিকাল - ০৫:০০ বিকাল',
    },
    {
      name: 'আরবি ব্যাকরণ',
      time: '০৫:০০ বিকাল - ০৬:০০ বিকাল',
    },
  ];

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
        title="ক্লাস রুটিন"
        className="bg-[#DB9E30] text-[#441a05] text-xl p-4 rounded-t-2xl shadow-md font-bold"
      />
      <div className="p-4 sm:p-6 space-y-4">
        <ClassRoutineForm />
        <h4 className="text-[#441a05] text-end text-xs mt-4 mb-1">
          মোট ক্লাস পাওয়া গেছে: <span className="text-[#DB9E30] font-bold">০৬</span>
        </h4>
        <div className="rounded-2xl bg-white/5 border border-[#9d9087]">
          <h3 className="rounded-t-2xl p-2 font-medium bg-[#DB9E30] text-[#441a05] animate-scaleIn">
            ১২ জুলাই ২০২৪ | শ্রেণি: নবম | শাখা: ক
          </h3>
          <div className="p-4 space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-[#9d9087] scrollbar-track-transparent">
            {routines.map((routine, index) => (
              <RoutineCard
                key={index}
                routine={routine}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}