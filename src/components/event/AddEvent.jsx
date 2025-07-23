import React, { useState, useRef } from "react";
import { FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from "../../redux/features/api/event/eventApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";

const AddEvent = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    academic_year: "",
  });
  const formRef = useRef(null);

  // API hooks
  const {
    data: events,
    isLoading: eventsLoading,
    error: eventsError,
    refetch,
  } = useGetEventsQuery();
  const {
    data: academicYears,
    isLoading: yearsLoading,
    error: yearsError,
  } = useGetAcademicYearApiQuery();
  const [createEvent, { isLoading: isCreating, error: createError }] =
    useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating, error: updateError }] =
    useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting, error: deleteError }] =
    useDeleteEventMutation();

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_event') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_event') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_event') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_event') || false;

  // Combine date and time into ISO string
  const combineDateTime = (date, time) => {
    if (!date || !time) return "";
    const [hours, minutes] = time.split(":");
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hours), parseInt(minutes));
    return dateTime.toISOString();
  };

  // Handle form submission for adding new event
  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error('ইভেন্ট যোগ করার অনুমতি নেই।');
      return;
    }
    if (
      !newEvent.title.trim() ||
      !newEvent.startDate ||
      !newEvent.startTime ||
      !newEvent.endDate ||
      !newEvent.endTime ||
      !newEvent.academic_year
    ) {
      toast.error("অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন");
      return;
    }
    const start = combineDateTime(newEvent.startDate, newEvent.startTime);
    const end = combineDateTime(newEvent.endDate, newEvent.endTime);
    if (new Date(end) < new Date(start)) {
      toast.error("শেষের সময় শুরুর সময়ের আগে হতে পারে না");
      return;
    }
    if (
      events?.some(
        (event) =>
          event.title.toLowerCase() === newEvent.title.toLowerCase() &&
          event.start === start &&
          event.academic_year === parseInt(newEvent.academic_year)
      )
    ) {
      toast.error("এই ইভেন্ট ইতিমধ্যে বিদ্যমান!");
      return;
    }

    setModalData({
      title: newEvent.title.trim(),
      start,
      end,
      academic_year: parseInt(newEvent.academic_year),
    });
    setModalAction("create");
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (event) => {
    if (!hasChangePermission) {
      toast.error('ইভেন্ট সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    setSelectedEventId(event.id);
    setNewEvent({
      title: event.title,
      startDate: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split('T')[0],
      endTime: endDate.toTimeString().slice(0, 5),
      academic_year: event.academic_year.toString(),
    });
  };

  // Handle update event
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error('ইভেন্ট আপডেট করার অনুমতি নেই।');
      return;
    }
    if (
      !newEvent.title.trim() ||
      !newEvent.startDate ||
      !newEvent.startTime ||
      !newEvent.endDate ||
      !newEvent.endTime ||
      !newEvent.academic_year
    ) {
      toast.error("অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন");
      return;
    }
    const start = combineDateTime(newEvent.startDate, newEvent.startTime);
    const end = combineDateTime(newEvent.endDate, newEvent.endTime);
    if (new Date(end) < new Date(start)) {
      toast.error("শেষের সময় শুরুর সময়ের আগে হতে পারে না");
      return;
    }

    setModalData({
      id: selectedEventId,
      title: newEvent.title.trim(),
      start,
      end,
      academic_year: parseInt(newEvent.academic_year),
    });
    setModalAction("update");
    setIsModalOpen(true);
  };

  // Handle delete event
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('ইভেন্ট মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setModalData({ id });
    setModalAction("delete");
    setIsModalOpen(true);
  };



   const handleDateClick = (e) => {
 
      e.target.showPicker();
 
  };



  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        if (!hasAddPermission) {
          toast.error('ইভেন্ট তৈরি করার অনুমতি নেই।');
          return;
        }
        await createEvent(modalData).unwrap();
        toast.success("ইভেন্ট সফলভাবে তৈরি করা হয়েছে!");
        setNewEvent({ title: "", startDate: "", startTime: "", endDate: "", endTime: "", academic_year: "" });
      } else if (modalAction === "update") {
        if (!hasChangePermission) {
          toast.error('ইভেন্ট আপডেট করার অনুমতি নেই।');
          return;
        }
        await updateEvent(modalData).unwrap();
        toast.success("ইভেন্ট সফলভাবে আপডেট করা হয়েছে!");
        setSelectedEventId(null);
        setNewEvent({ title: "", startDate: "", startTime: "", endDate: "", endTime: "", academic_year: "" });
      } else if (modalAction === "delete") {
        if (!hasDeletePermission) {
          toast.error('ইভেন্ট মুছে ফেলার অনুমতি নেই।');
          return;
        }
        await deleteEvent(modalData.id).unwrap();
        toast.success("ইভেনট সফলভাবে মুছে ফেলা হয়েছে!");
      }
      refetch();
    } catch (err) {
      console.error(
        `ত্রুটি ${
          modalAction === "create"
            ? "তৈরি করা"
            : modalAction === "update"
            ? "আপডেট"
            : "মুছে ফেলা"
        }:`,
        err
      );
      toast.error(
        `ইভেন্ট ${
          modalAction === "create"
            ? "তৈরি"
            : modalAction === "update"
            ? "আপডেট"
            : "মুছে ফেলা"
        } ব্যর্থ: ${err?.data?.message || "অজানা ত্রুটি"}`
      );
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  if (eventsLoading || yearsLoading || permissionsLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black/10 backdrop-blur-sm rounded-xl shadow-lg p-8 flex items-center space-x-4 animate-fadeIn">
          <FaSpinner className="animate-spin text-2xl text-[#441a05]" />
          <span className="text-[#441a05] font-medium">লোড হচ্ছে...</span>
        </div>
      </div>
    );

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  if (eventsError || yearsError)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 rounded-xl shadow-lg p-8 text-red-400 animate-fadeIn">
          ত্রুটি: {eventsError?.data?.message || yearsError?.data?.message || "অজানা ত্রুটি"}
        </div>
      </div>
    );

  return (
    <div className="py-8">
      <Toaster position="top-right" reverseOrder={false} />
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
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
          }
          .tick-glow {
            transition: all 0.3s ease;
          }
          .tick-glow:focus {
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.4);
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(22, 31, 48, 0.26);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(10, 13, 21, 0.44);
          }
          input[type="date"],
          input[type="time"] {
            border: 1px solid #9d9087;
            border-radius: 0.5rem;
            padding: 0.5rem;
            color: #441a05;
            font-family: 'Noto Sans Bengali', sans-serif;
            width: 100%;
            transition: all 0.3s ease;
          }
          input[type="date"]:focus,
          input[type="time"]:focus {
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.4);
            border-color: #DB9E30;
            outline: none;
          }
          input[type="date"]::-webkit-calendar-picker-indicator,
          input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(20%) sepia(50%) saturate(300%) hue-rotate(10deg);
          }
        `}
      </style>

      {/* Header and Form */}
      <div className="">
        {(hasAddPermission || hasChangePermission) && (
          <div ref={formRef} className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl w-full">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
                ইভেন্ট যোগ করুন
              </h3>
            </div>

            <form
              onSubmit={selectedEventId ? handleUpdate : handleSubmitEvent}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#441a05]">ইভেন্ট শিরোনাম</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                  placeholder="ইভেন্ট শিরোনাম"
                  disabled={isCreating || isUpdating}
                  aria-label="ইভেন্ট শিরোনাম লিখুন"
                  title="ইভেন্ট শিরোনাম লিখুন / Enter event title"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#441a05]">শুরুর তারিখ</label>
                <input
                  type="date"
                  value={newEvent.startDate}
                   onClick={handleDateClick}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  className="w-full p-3 animate-scaleIn bg-transparent"
                  disabled={isCreating || isUpdating}
                  aria-label="ইভেন্টের শুরুর তারিখ নির্বাচন করুন"
                  title="ইভেন্টের শুরুর তারিখ নির্বাচন করুন / Select event start date"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#441a05]">শুরুর সময়</label>
                <input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                   onClick={handleDateClick}
                  className="w-full p-3 animate-scaleIn bg-transparent"
                  disabled={isCreating || isUpdating}
                  aria-label="ইভেন্টের শুরুর সময় নির্বাচন করুন"
                  title="ইভেন্টের শুরুর সময় নির্বাচন করুন / Select event start time"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#441a05]">শেষের তারিখ</label>
                <input
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                   onClick={handleDateClick}
                  className="w-full p-3 animate-scaleIn bg-transparent"
                  disabled={isCreating || isUpdating}
                  aria-label="ইভেন্টের শেষের তারিখ নির্বাচন করুন"
                  title="ইভেন্টের শেষের তারিখ নির্বাচন করুন / Select event end date"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#441a05]">শেষের সময়</label>
                <input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                   onClick={handleDateClick}
                  className="w-full p-3 animate-scaleIn bg-transparent"
                  disabled={isCreating || isUpdating}
                  aria-label="ইভেন্টের শেষের সময় নির্বাচন করুন"
                  title="ইভেন্টের শেষের সময় নির্বাচন করুন / Select event end time"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#441a05]">একাডেমিক বছর</label>
                <select
                  value={newEvent.academic_year}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, academic_year: e.target.value })
                  }
                  className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                  disabled={isCreating || isUpdating}
                  aria-label="একাডেমিক বছর নির্বাচন করুন"
                  title="একাডেমিক বছর নির্বাচন করুন / Select academic year"
                >
                  <option value="" disabled>
                    একাডেমিক বছর নির্বাচন করুন
                  </option>
                  {academicYears?.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-4">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className={`px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn btn-glow ${
                    isCreating || isUpdating
                      ? "cursor-not-allowed opacity-50"
                      : "hover:text-white hover:shadow-md"
                  }`}
                  title={selectedEventId ? "ইভেন্ট আপডেট করুন / Update event" : "ইভেন্ট তৈরি করুন / Create event"}
                  aria-label={selectedEventId ? "ইভেন্ট আপডেট করুন" : "ইভেন্ট তৈরি করুন"}
                >
                  {isCreating || isUpdating ? (
                    <span className="flex items-center space-x-3">
                      <FaSpinner className="animate-spin text-lg" />
                      <span>
                        {selectedEventId ? "আপডেট করা হচ্ছে..." : "তৈরি করা হচ্ছে..."}
                      </span>
                    </span>
                  ) : (
                    <span>{selectedEventId ? "আপডেট করুন" : "তৈরি করুন"}</span>
                  )}
                </button>
                {selectedEventId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEventId(null);
                      setNewEvent({
                        title: "",
                        startDate: "",
                        startTime: "",
                        endDate: "",
                        endTime: "",
                        academic_year: "",
                      });
                    }}
                    className="px-6 py-3 rounded-lg font-medium bg-gray-500/20 text-[#441a05] hover:bg-gray-500/30 transition-all duration-300 animate-scaleIn btn-glow"
                    title="সম্পাদনা বাতিল করুন / Cancel edit"
                    aria-label="সম্পাদনা বাতিল করুন"
                  >
                    বাতিল
                  </button>
                )}
              </div>
            </form>
            {(createError || updateError) && (
              <div
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                ত্রুটি: {(createError || updateError)?.data?.message || "অজানা ত্রুটি"}
              </div>
            )}
          </div>
        )}

        {/* Events Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6 w-full">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
            ইভেন্টের তালিকা
          </h3>
          {eventsLoading ? (
            <div className="p-4 text-[#441a05]/70 flex items-center space-x-4 animate-fadeIn">
              <FaSpinner className="animate-spin text-lg" />
              <span>ইভেন্ট লোড হচ্ছে...</span>
            </div>
          ) : events?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70 animate-fadeIn">কোনো ইভেন্ট উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শিরোনাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শুরু
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শেষ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      একাডেমিক বছর
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      তৈরির সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আপডেটের সময়
                    </th>
                    {(hasChangePermission || hasDeletePermission) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ক্রিয়াকলাপ
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {events?.map((event, index) => (
                    <tr
                      key={event.id}
                      className="animate-fadeIn hover:bg-white/10 transition-colors duration-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {event.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {new Date(event.start).toLocaleString("bn-BD", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {new Date(event.end).toLocaleString("bn-BD", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {academicYears?.find(
                          (year) => year.id === event.academic_year
                        )?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(event.created_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(event.updated_at).toLocaleString("bn-BD")}
                      </td>
                      {(hasChangePermission || hasDeletePermission) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {hasChangePermission && (
                            <button
                              onClick={() => handleEditClick(event)}
                              className="text-[#441a05] hover:text-[#DB9E30] mr-4 transition-colors duration-300 btn-glow"
                              aria-label={`ইভেন্ট সম্পাদনা করুন ${event.title}`}
                              title={`ইভেন্ট সম্পাদনা করুন / Edit event ${event.title}`}
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="text-[#441a05] hover:text-red-500 transition-colors duration-300 btn-glow"
                              aria-label={`ইভেন্ট মুছুন ${event.title}`}
                              title={`ইভেন্ট মুছুন / Delete event ${event.title}`}
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(isDeleting || deleteError) && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              {isDeleting
                ? "ইভেন্ট মুছে ফেলা হচ্ছে..."
                : `ইভেন্ট মুছে ফেলতে ত্রুটি: ${deleteError?.data?.message || "অজানা ত্রুটি"}`}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (hasAddPermission || hasChangePermission || hasDeletePermission) && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10001]">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === "create" && "নতুন ইভেন্ট নিশ্চিত করুন"}
                {modalAction === "update" && "ইভেন্ট আপডেট নিশ্চিত করুন"}
                {modalAction === "delete" && "ইভেন্ট মুছে ফেলা নিশ্চিত করুন"}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === "create" &&
                  "আপনি কি নিশ্চিত যে নতুন ইভেন্ট তৈরি করতে চান?"}
                {modalAction === "update" &&
                  "আপনি কি নিশ্চিত যে ইভেন্ট আপডেট করতে চান?"}
                {modalAction === "delete" &&
                  "আপনি কি নিশ্চিত যে এই ইভেন্টটি মুছে ফেলতে চান?"}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalAction(null);
                    setModalData(null);
                  }}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300 btn-glow"
                  title="বাতিল করুন / Cancel"
                  aria-label="বাতিল করুন"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন / Confirm"
                  aria-label="নিশ্চিত করুন"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEvent;