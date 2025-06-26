// import React, { useState } from "react";
// import DateTimePicker from "react-datetime-picker";
// import "react-datetime-picker/dist/DateTimePicker.css";
// import { FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
// import { IoAddCircle } from "react-icons/io5";
// import { Toaster, toast } from "react-hot-toast";
// import {
//   useGetEventsQuery,
//   useCreateEventMutation,
//   useUpdateEventMutation,
//   useDeleteEventMutation,
// } from "../../redux/features/api/event/eventApi";
// import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";

// const AddEvent = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalAction, setModalAction] = useState(null);
//   const [modalData, setModalData] = useState(null);
//   const [selectedEventId, setSelectedEventId] = useState(null);
//   const [newEvent, setNewEvent] = useState({
//     title: "",
//     start: "",
//     end: "",
//     academic_year: "",
//   });

//   // API hooks
//   const {
//     data: events,
//     isLoading: eventsLoading,
//     error: eventsError,
//     refetch,
//   } = useGetEventsQuery();
//   const {
//     data: academicYears,
//     isLoading: yearsLoading,
//     error: yearsError,
//   } = useGetAcademicYearApiQuery();
//   const [createEvent, { isLoading: isCreating, error: createError }] =
//     useCreateEventMutation();
//   const [updateEvent, { isLoading: isUpdating, error: updateError }] =
//     useUpdateEventMutation();
//   const [deleteEvent, { isLoading: isDeleting, error: deleteError }] =
//     useDeleteEventMutation();

//   // Handle form submission for adding new event
//   const handleSubmitEvent = async (e) => {
//     e.preventDefault();
//     if (
//       !newEvent.title.trim() ||
//       !newEvent.start ||
//       !newEvent.end ||
//       !newEvent.academic_year
//     ) {
//       toast.error("অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন");
//       return;
//     }
//     if (new Date(newEvent.end) < new Date(newEvent.start)) {
//       toast.error("শেষের সময় শুরুর সময়ের আগে হতে পারে না");
//       return;
//     }
//     if (
//       events?.some(
//         (event) =>
//           event.title.toLowerCase() === newEvent.title.toLowerCase() &&
//           event.start === new Date(newEvent.start).toISOString() &&
//           event.academic_year === parseInt(newEvent.academic_year)
//       )
//     ) {
//       toast.error("এই ইভেন্ট ইতিমধ্যে বিদ্যমান!");
//       return;
//     }

//     setModalData({
//       title: newEvent.title.trim(),
//       start: new Date(newEvent.start).toISOString(),
//       end: new Date(newEvent.end).toISOString(),
//       academic_year: parseInt(newEvent.academic_year),
//     });
//     setModalAction("create");
//     setIsModalOpen(true);
//   };

//   // Handle edit button click
//   const handleEditClick = (event) => {
//     setSelectedEventId(event.id);
//     setNewEvent({
//       title: event.title,
//       start: new Date(event.start),
//       end: new Date(event.end),
//       academic_year: event.academic_year.toString(),
//     });
//   };

//   // Handle update event
//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (
//       !newEvent.title.trim() ||
//       !newEvent.start ||
//       !newEvent.end ||
//       !newEvent.academic_year
//     ) {
//       toast.error("অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন");
//       return;
//     }
//     if (new Date(newEvent.end) < new Date(newEvent.start)) {
//       toast.error("শেষের সময় শুরুর সময়ের আগে হতে পারে না");
//       return;
//     }

//     setModalData({
//       id: selectedEventId,
//       title: newEvent.title.trim(),
//       start: new Date(newEvent.start).toISOString(),
//       end: new Date(newEvent.end).toISOString(),
//       academic_year: parseInt(newEvent.academic_year),
//     });
//     setModalAction("update");
//     setIsModalOpen(true);
//   };

//   // Handle delete event
//   const handleDelete = (id) => {
//     setModalData({ id });
//     setModalAction("delete");
//     setIsModalOpen(true);
//   };

//   // Confirm action for modal
//   const confirmAction = async () => {
//     try {
//       if (modalAction === "create") {
//         await createEvent(modalData).unwrap();
//         toast.success("ইভেন্ট সফলভাবে তৈরি করা হয়েছে!");
//         setNewEvent({ title: "", start: "", end: "", academic_year: "" });
//       } else if (modalAction === "update") {
//         await updateEvent(modalData).unwrap();
//         toast.success("ইভেন্ট সফলভাবে আপডেট করা হয়েছে!");
//         setSelectedEventId(null);
//         setNewEvent({ title: "", start: "", end: "", academic_year: "" });
//       } else if (modalAction === "delete") {
//         await deleteEvent(modalData.id).unwrap();
//         toast.success("ইভেন্ট সফলভাবে মুছে ফেলা হয়েছে!");
//       }
//       refetch();
//     } catch (err) {
//       console.error(
//         `ত্রুটি ${
//           modalAction === "create"
//             ? "তৈরি করা"
//             : modalAction === "update"
//             ? "আপডেট"
//             : "মুছে ফেলা"
//         }:`,
//         err
//       );
//       toast.error(
//         `ইভেন্ট ${
//           modalAction === "create"
//             ? "তৈরি"
//             : modalAction === "update"
//             ? "আপডেট"
//             : "মুছে ফেলা"
//         } ব্যর্থ: ${err.status || "অজানা"}`
//       );
//     } finally {
//       setIsModalOpen(false);
//       setModalAction(null);
//       setModalData(null);
//     }
//   };

//   if (eventsLoading || yearsLoading)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-[#441a05]">
//         লোড হচ্ছে...
//       </div>
//     );
//   if (eventsError || yearsError)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-400">
//         ত্রুটি: {eventsError?.message || yearsError?.message}
//       </div>
//     );

//   return (
//     <div className="min-h-screen flex flex-col items-center p-5 box-border bg-gradient-to-br">
//       <Toaster position="top-right" reverseOrder={false} />
//       <style>
//         {`
//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(20px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//           @keyframes scaleIn {
//             from { transform: scale(0.95); opacity: 0; }
//             to { transform: scale(1); opacity: 1; }
//           }
//           @keyframes slideUp {
//             from { transform: translateY(100%); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//           .animate-fadeIn {
//             animation: fadeIn 0.6s ease-out forwards;
//           }
//           .animate-scaleIn {
//             animation: scaleIn 0.4s ease-out forwards;
//           }
//           .animate-slideUp {
//             animation: slideUp 0.4s ease-out forwards;
//           }
//           .btn-glow:hover {
//             box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
//           }
//           ::-webkit-scrollbar {
//             width: 8px;
//           }
//           ::-webkit-scrollbar-track {
//             background: transparent;
//           }
//           ::-webkit-scrollbar-thumb {
//             background: rgba(22, 31, 48, 0.26);
//             border-radius: 10px;
//           }
//           ::-webkit-scrollbar-thumb:hover {
//             background: rgba(10, 13, 21, 0.44);
//           }
//           .datetime-picker-container {
//             position: relative;
//             z-index: 9999;
//           }
//           .react-datetime-picker__wrapper {
//             border: 1px solid #9d9087 !important;
//             border-radius: 0.5rem !important;
//             padding: 0.5rem !important;
//             background: transparent !important;
//           }
//           .react-datetime-picker__inputGroup__input,
//           .react-datetime-picker__inputGroup__leadingZero,
//           .react-datetime-picker__inputGroup__divider,
//           .react-datetime-picker__inputGroup__amPm {
//             color: #441a05 !important;
//             font-family: 'Noto Serif Bengali', sans-serif !important;
//           }
//           .react-datetime-picker__button svg {
//             stroke: #441a05 !important;
//           }
//           .react-datetime-picker__calendar,
//           .react-datetime-picker__clock {
//             background: white !important;
//             // border: 1px solid #9d9087 !important;
//             border-radius: 0.5rem !important;
//             color: #441a05 !important;
//             font-family: 'Noto Serif Bengali', sans-serif !important;
//             z-index: 10000 !important;
//           }
//           .react-calendar__tile:hover {
//             background: #DB9E30 !important;
//             color: white !important;
//           }
//           .react-calendar__tile--active {
//             background: #441a05 !important;
//             color: white !important;
//           }
//         `}
//       </style>

//       {/* Header and Form */}
//       <div
//         className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl w-full"
//         style={{ overflow: "visible" }}
//       >
//         <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
//           <IoAddCircle className="text-4xl text-[#441a05]" />
//           <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
//             ইভেন্ট যোগ করুন
//           </h3>
//         </div>

//         <form
//           onSubmit={selectedEventId ? handleUpdate : handleSubmitEvent}
//           className="grid grid-cols-1 md:grid-cols-4 gap-6"
//         >
//           <input
//             type="text"
//             value={newEvent.title}
//             onChange={(e) =>
//               setNewEvent({ ...newEvent, title: e.target.value })
//             }
//             className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
//             placeholder="ইভেন্ট শিরোনাম (যেমন, ঈদুল ফিতর)"
//             disabled={isCreating || isUpdating}
//             aria-label="ইভেন্ট শিরোনাম"
//             title="ইভেন্ট শিরোনাম লিখুন"
//           />
//           <div className="datetime-picker-container">
//             {/* <label htmlFor="">ইভেন্টের শুরুর সময় নির্বাচন করুন</label> */}
//             <DateTimePicker
//               value={newEvent.start}
//               onChange={(value) => setNewEvent({ ...newEvent, start: value })}
//               className="w-full text-[#441a05]"
//               disabled={isCreating || isUpdating}
//               format="y-MM-dd h:mm a"
//               locale="bn-BD"
//               disableClock={false}
//               aria-label="শুরুর সময়"
//               title="ইভেন্টের শুরুর সময় নির্বাচন করুন"
//             />
//           </div>
//           <div className="datetime-picker-container">
//             {/* <label htmlFor="">ইভেন্টের শেষের সময় নির্বাচন করুন</label> */}
//             <DateTimePicker
//               value={newEvent.end}
//               onChange={(value) => setNewEvent({ ...newEvent, end: value })}
//               className="w-full text-[#441a05]"
//               disabled={isCreating || isUpdating}
//               format="y-MM-dd h:mm a"
//               locale="bn-BD"
//               disableClock={false}
//               aria-label="শেষের সময়"
//               title="ইভেন্টের শেষের সময় নির্বাচন করুন"
//             />
//           </div>
          
//           <select
//             value={newEvent.academic_year}
//             onChange={(e) =>
//               setNewEvent({ ...newEvent, academic_year: e.target.value })
//             }
//             className="w-full bg-transparent text-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
//             disabled={isCreating || isUpdating}
//             aria-label="একাডেমিক বছর"
//             title="একাডেমিক বছর নির্বাচন করুন"
//           >
//             <option value="" disabled>
//               একাডেমিক বছর নির্বাচন করুন
//             </option>
//             {academicYears?.map((year) => (
//               <option key={year.id} value={year.id}>
//                 {year.name}
//               </option>
//             ))}
//           </select>
//           <button
//             type="submit"
//             disabled={isCreating || isUpdating}
//             className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
//               isCreating || isUpdating
//                 ? "cursor-not-allowed"
//                 : "hover:text-white hover:shadow-md"
//             }`}
//             title={selectedEventId ? "ইভেন্ট আপডেট করুন" : "ইভেন্ট তৈরি করুন"}
//           >
//             {isCreating || isUpdating ? (
//               <span className="flex items-center space-x-3">
//                 <FaSpinner className="animate-spin text-lg" />
//                 <span>
//                   {selectedEventId ? "আপডেট করা হচ্ছে..." : "তৈরি করা হচ্ছে..."}
//                 </span>
//               </span>
//             ) : (
//               <span className="flex items-center space-x-2">
//                 {selectedEventId ? "আপডেট করুন" : "তৈরি করুন"}
//               </span>
//             )}
//           </button>
//           {selectedEventId && (
//             <button
//               type="button"
//               onClick={() => {
//                 setSelectedEventId(null);
//                 setNewEvent({
//                   title: "",
//                   start: "",
//                   end: "",
//                   academic_year: "",
//                 });
//               }}
//               className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500/20 text-[#441a05] hover:bg-gray-500/30 transition-all duration-300 animate-scaleIn"
//               title="সম্পাদনা বাতিল করুন"
//             >
//               বাতিল
//             </button>
//           )}
//         </form>
//         {(createError || updateError) && (
//           <div
//             className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
//             style={{ animationDelay: "0.4s" }}
//           >
//             ত্রুটি: {(createError || updateError)?.status || "অজানা"} -{" "}
//             {JSON.stringify((createError || updateError)?.data || {})}
//           </div>
//         )}
//       </div>

//       {/* Events Table */}
//       <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6 w-full">
//         <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
//           ইভেন্টের তালিকা
//         </h3>
//         {eventsLoading ? (
//           <p className="p-4 text-[#441a05]/70">ইভেন্ট লোড হচ্ছে...</p>
//         ) : eventsError ? (
//           <p className="p-4 text-red-400">
//             ইভেন্ট লোড করতে ত্রুটি: {eventsError?.status || "অজানা"} -{" "}
//             {JSON.stringify(eventsError?.data || {})}
//           </p>
//         ) : events?.length === 0 ? (
//           <p className="p-4 text-[#441a05]/70">কোনো ইভেন্ট উপলব্ধ নেই।</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-white/20">
//               <thead className="">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
//                     শিরোনাম
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
//                     শুরু
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
//                     শেষ
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
//                     একাডেমিক বছর
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
//                     তৈরির সময়
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
//                     আপডেটের সময়
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
//                     ক্রিয়াকলাপ
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-white/20">
//                 {events?.map((event, index) => (
//                   <tr
//                     key={event.id}
//                     className=" animate-fadeIn hover:bg-white/10 transition-colors duration-200"
//                     style={{ animationDelay: `${index * 0.1}s` }}
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
//                       {event.title}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
//                       {new Date(event.start).toLocaleString("bn-BD")}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
//                       {new Date(event.end).toLocaleString("bn-BD")}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
//                       {academicYears?.find(
//                         (year) => year.id === event.academic_year
//                       )?.name || "N/A"}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
//                       {new Date(event.created_at).toLocaleString("bn-BD")}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
//                       {new Date(event.updated_at).toLocaleString("bn-BD")}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button
//                         onClick={() => handleEditClick(event)}
//                         title="ইভেন্ট সম্পাদনা করুন"
//                         className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
//                         aria-label="ইভেন্ট সম্পাদনা করুন"
//                       >
//                         <FaEdit className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(event.id)}
//                         title="ইভেন্ট মুছুন"
//                         className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
//                         aria-label="ইভেন্ট মুছুন"
//                       >
//                         <FaTrash className="w-5 h-5" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//         {(isDeleting || deleteError) && (
//           <div
//             className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
//             style={{ animationDelay: "0.4s" }}
//           >
//             {isDeleting
//               ? "ইভেন্ট মুছে ফেলা হচ্�ছে..."
//               : `ইভেন্ট মুছে ফেলতে ত্রুটি: ${
//                   deleteError?.status || "অজানা"
//                 } - ${JSON.stringify(deleteError?.data || {})}`}
//           </div>
//         )}
//       </div>

//       {/* Confirmation Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10001]">
//           <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
//             <h3 className="text-lg font-semibold text-[#441a05] mb-4">
//               {modalAction === "create" && "নতুন ইভেন্ট নিশ্চিত করুন"}
//               {modalAction === "update" && "ইভেন্ট আপডেট নিশ্চিত করুন"}
//               {modalAction === "delete" && "ইভেন্ট মুছে ফেলা নিশ্চিত করুন"}
//             </h3>
//             <p className="text-[#441a05] mb-6">
//               {modalAction === "create" &&
//                 "আপনি কি নিশ্চিত যে নতুন ইভেন্ট তৈরি করতে চান?"}
//               {modalAction === "update" &&
//                 "আপনি কি নিশ্চিত যে ইভেন্ট আপডেট করতে চান?"}
//               {modalAction === "delete" &&
//                 "আপনি কি নিশ্চিত যে এই ইভেন্টটি মুছে ফেলতে চান?"}
//             </p>
//             <div className="flex justify-end space-x-4">
//               <button
//                 onClick={() => {
//                   setIsModalOpen(false);
//                   setModalAction(null);
//                   setModalData(null);
//                 }}
//                 className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
//                 title="বাতিল করুন"
//                 aria-label="বাতিল করুন"
//               >
//                 বাতিল
//               </button>
//               <button
//                 onClick={confirmAction}
//                 className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
//                 title="নিশ্চিত করুন"
//                 aria-label="নিশ্চিত করুন"
//               >
//                 নিশ্চিত করুন
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddEvent;
import React from 'react';

const AddEvent = () => {
  return (
    <div>
      
    </div>
  );
};

export default AddEvent;