import React from 'react';
import SingleNotice from '../cards/SingleNotice';

export default function Notices() {
  const notices = [
    {
      id: '01',
      date: '১৬ জুন, ২০২৪',
      type: 'info',
      content: 'মাদ্রাসার বার্ষিক পরীক্ষার সময়সূচি প্রকাশিত হয়েছে। বিস্তারিত জানতে অফিসে যোগাযোগ করুন।',
    },
    {
      id: '02',
      date: '১৬ জুন, ২০২৪',
      type: 'warning',
      content: 'শিক্ষার্থীদের সময়মতো ক্লাসে উপস্থিত থাকার জন্য অনুরোধ করা হচ্ছে।',
    },
    {
      id: '03',
      date: '১৬ জুন, ২০২৪',
      type: 'vacation',
      content: 'ঈদ-উল-আযহা উপলক্ষে মাদ্রাসা ১৭-২২ জুন পর্যন্ত বন্ধ থাকবে।',
    },
  ];

  return (
    <div className="bg-black/10 backdrop-blur-sm col-span-1 order-3 sm:order-2 lg:order-3 rounded-2xl relative shadow-xl animate-fadeIn">
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

      {/* Component heading */}
      <h3 className="bg-[#DB9E30] text-[#441a05] text-xl p-4 leading-[33px] rounded-t-2xl shadow-md font-bold">
        নোটিশ ও ইভেন্ট
      </h3>

      {/* Notices */}
      <div className="divide-y-1 divide-[#9d9087] p-4">
        {notices.map((notice, index) => (
          <div key={notice.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
            <SingleNotice notice={notice} />
          </div>
        ))}
      </div>

      {/* View more button */}
      <div className="flex justify-end p-4">
        <button
          className="bg-[#DB9E30] text-[#441a05] text-sm font-medium shadow py-2 px-4 rounded-lg absolute bottom-3 right-3 transition-all duration-300 hover:text-white btn-glow animate-scaleIn"
          title="সব দেখুন / View All"
        >
          সব দেখুন
        </button>
      </div>
    </div>
  );
}