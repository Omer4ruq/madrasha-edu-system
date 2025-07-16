import React from 'react';
import SingleNotice from '../cards/SingleNotice';
import dayjs from 'dayjs'; // install if not already: npm i dayjs
import { useGetEventsQuery } from '../../../redux/features/api/event/eventApi';

export default function Notices() {
  const { data: events = [], isLoading, isError } = useGetEventsQuery();

  // সর্বশেষ ৩টি ইভেন্ট সিলেক্ট করো (তারিখ অনুসারে descending)
  const sortedEvents = [...events]
    .sort((a, b) => new Date(b.start) - new Date(a.start))
    .slice(0, 3);

  const convertToBanglaDate = (dateStr) => {
    return dayjs(dateStr).format('D MMMM, YYYY').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  };

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

      <div className="divide-y-1 divide-[#9d9087] p-4">
        {isLoading && <p className="text-[#441a05]">লোড হচ্ছে...</p>}
        {isError && <p className="text-red-500">ডেটা আনতে সমস্যা হয়েছে।</p>}

        {!isLoading &&
          sortedEvents.map((event, index) => (
            <div
              key={event.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <SingleNotice
                notice={{
                  id: event.id,
                  date: convertToBanglaDate(event.start),
                  type: 'info',
                  content: event.title,
                }}
              />
            </div>
          ))}
      </div>

      {/* View more button */}
      {/* <div className="flex justify-end p-4">
        <button
          className="bg-[#DB9E30] text-[#441a05] text-sm font-medium shadow py-2 px-4 rounded-lg absolute bottom-3 right-3 transition-all duration-300 hover:text-white btn-glow animate-scaleIn"
          title="সব দেখুন / View All"
        >
          সব দেখুন
        </button>
      </div> */}
    </div>
  );
}
