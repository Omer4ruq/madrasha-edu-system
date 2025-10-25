import React from 'react';
import SingleNotice from '../cards/SingleNotice';
import dayjs from 'dayjs'; // install if not already: npm i dayjs
import { useGetEventsQuery } from '../../../redux/features/api/event/eventApi';
import { useGetNoticesQuery } from '../../../redux/features/api/notice/noticeApi';
import { Link } from 'react-router-dom';

export default function Events() {
  const { data: events = [], isLoading, isError } = useGetEventsQuery();
  const { data: notices = [], isLoading: noticesLoading, isError: noticesError } = useGetNoticesQuery();

  // সর্বশেষ ৪টি নোটিশ সিলেক্ট করো (তারিখ অনুসারে descending)
  const sortedNotices = [...notices]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  // Text truncation function
  const truncateText = (text, maxLength = 50) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

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
      নোটিশ 
      </h3>

      <div className="divide-y-1 divide-[#9d9087] p-4 flex gap-5">
        {noticesLoading && <p className="text-[#441a05]">লোড হচ্ছে...</p>}
        {noticesError && <p className="text-red-500">ডেটা আনতে সমস্যা হয়েছে।</p>}

        <div className=''>
          {!noticesLoading &&
          sortedNotices.map((notice, index) => (
            <div
              key={notice.id}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <SingleNotice
                notice={{
                  id: notice.id,
                  date: convertToBanglaDate(notice.date),
                  type: 'info',
                  content: truncateText(notice.notice_title),
                  description: truncateText(notice.notice_description, 80),
                }}
              />
            </div>
          ))}
        </div>
        {/* <div className='w-[50%]'>
          <h1 className='text-[#441a05]/60 pl-1.5 font-semibold'>ইভেন্ট</h1>
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
        </div> */}
      </div>

      {/* View more button */}
      <div className="flex justify-end p-4">
        <Link to='/talimat/notice'
          className="bg-[#DB9E30] text-[#441a05] text-sm font-medium shadow py-2 px-4 rounded-lg absolute bottom-3 right-3 transition-all duration-300 hover:text-white btn-glow animate-scaleIn"
          title="সব দেখুন / View All"
        >
          সব দেখুন
        </Link>
      </div>
    </div>
  );
}
