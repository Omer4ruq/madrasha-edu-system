import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Toaster, toast } from "react-hot-toast";
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from "../../redux/features/api/event/eventApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { FaSpinner } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";

const Event = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    academic_year: "",
  });

  // API hooks
  const { data: events, isLoading: eventsLoading, error: eventsError, refetch } = useGetEventsQuery();
  const { data: academicYears, isLoading: yearsLoading, error: yearsError } = useGetAcademicYearApiQuery();
  const [createEvent, { isLoading: isCreating, error: createError }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating, error: updateError }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting, error: deleteError }] = useDeleteEventMutation();

  // Handle date click to open modal for new event
  const handleDateClick = (info) => {
    setSelectedEventId(null);
    setNewEvent({
      title: "",
      start: info.date.toISOString().slice(0, 16),
      end: info.date.toISOString().slice(0, 16),
      academic_year: academicYears?.[0]?.id.toString() || "",
    });
    setIsModalOpen(true);
    setModalAction("create");
  };

  // Handle event click to open modal for edit/delete
  const handleEventClick = (info) => {
    const event = events.find((e) => e.id === parseInt(info.event.id));
    if (event) {
      setSelectedEventId(event.id);
      setNewEvent({
        title: event.title,
        start: event.start.slice(0, 16),
        end: event.end.slice(0, 16),
        academic_year: event.academic_year.toString(),
      });
      setIsModalOpen(true);
      setModalAction("update");
    }
  };

  // Handle form submission for adding new event
  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.start || !newEvent.end || !newEvent.academic_year) {
      toast.error("অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন");
      return;
    }
    if (new Date(newEvent.end) < new Date(newEvent.start)) {
      toast.error("শেষের সময় শুরুর সময়ের আগে হতে পারে না");
      return;
    }
    if (
      events?.some(
        (event) =>
          event.title.toLowerCase() === newEvent.title.toLowerCase() &&
          event.start === newEvent.start + ":00.000Z" &&
          event.academic_year === parseInt(newEvent.academic_year)
      )
    ) {
      toast.error("এই ইভেন্ট ইতিমধ্যে বিদ্যমান!");
      return;
    }

    setModalData({
      title: newEvent.title.trim(),
      start: newEvent.start + ":00.000Z",
      end: newEvent.end + ":00.000Z",
      academic_year: parseInt(newEvent.academic_year),
    });
    setIsModalOpen(true);
    setModalAction("create");
  };

  // Handle update event
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.start || !newEvent.end || !newEvent.academic_year) {
      toast.error("অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন");
      return;
    }
    if (new Date(newEvent.end) < new Date(newEvent.start)) {
      toast.error("শেষের সময় শুরুর সময়ের আগে হতে পারে না");
      return;
    }

    setModalData({
      id: selectedEventId,
      title: newEvent.title.trim(),
      start: newEvent.start + ":00.000Z",
      end: newEvent.end + ":00.000Z",
      academic_year: parseInt(newEvent.academic_year),
    });
    setIsModalOpen(true);
    setModalAction("update");
  };

  // Handle delete event
  const handleDelete = () => {
    setModalData({ id: selectedEventId });
    setModalAction("delete");
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        await createEvent(modalData).unwrap();
        toast.success("ইভেন্ট সফলভাবে তৈরি করা হয়েছে!");
        setNewEvent({ title: "", start: "", end: "", academic_year: "" });
      } else if (modalAction === "update") {
        await updateEvent(modalData).unwrap();
        toast.success("ইভেন্ট সফলভাবে আপডেট করা হয়েছে!");
        setSelectedEventId(null);
        setNewEvent({ title: "", start: "", end: "", academic_year: "" });
      } else if (modalAction === "delete") {
        await deleteEvent(modalData.id).unwrap();
        toast.success("ইভেন্ট সফলভাবে মুছে ফেলা হয়েছে!");
      }
      refetch();
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === "create" ? "তৈরি করা" : modalAction === "update" ? "আপডেট" : "মুছে ফেলা"}:`, err);
      toast.error(`ইভেন্ট ${modalAction === "create" ? "তৈরি" : modalAction === "update" ? "আপডেট" : "মুছে ফেলা"} ব্যর্থ: ${err.status || "অজানা"} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Format events for FullCalendar
  const calendarEvents = events?.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    backgroundColor: "#DB9E30",
    borderColor: "#441a05",
    textColor: "#441a05",
  })) || [];

  if (eventsLoading || yearsLoading) return <div style={styles.fullPage}>লোড হচ্ছে...</div>;
  if (eventsError || yearsError)
    return (
      <div style={styles.fullPage}>
        ত্রুটি: {eventsError?.message || yearsError?.message}
      </div>
    );

  return (
    <div style={styles.fullPage}>
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
          @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
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
          .animate-slideDown {
            animation: slideDown 0.4s ease-out forwards;
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
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
          .fc {
            font-family: 'Noto Serif Bengali', sans-serif !important;
          }
          .fc-toolbar-title {
            color: #441a05 !important;
            font-size: 1.5rem !important;
            font-weight: 700 !important;
          }
          .fc-button {
            background: #DB9E30 !important;
            border: none !important;
            color: #441a05 !important;
            border-radius: 8px !important;
            transition: all 0.3s ease !important;
          }
          .fc-button:hover {
            background: #441a05 !important;
            color: white !important;
          }
          .fc-daygrid-day:hover {
            background: rgba(219, 158, 48, 0.1) !important;
            transform: scale(1.02);
          }
          .fc-event {
            border-radius: 6px !important;
            padding: 2px 5px !important;
            cursor: pointer !important;
          }
          .fc-daygrid-day-number {
            color: #441a05 !important;
            font-size: 1.1rem !important;
          }
          .fc-col-header-cell-cushion {
            color: #441a05 !important;
            font-weight: 600 !important;
          }
        `}
      </style>

      {/* Header */}
      {/* <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl w-full max-w-6xl">
        <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">ইসলামিক ইভেন্ট ক্যালেন্ডার</h3>
        </div>
      </div> */}

      {/* Calendar */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl animate-fadeIn shadow-xl w-full">
        <div style={styles.calendarContainer}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable={false}
            locale="bn"
            headerToolbar={{
              left: "prev",
              center: "title",
              right: "next",
            }}
            height="auto"
            dayMaxEvents={2}
            eventDisplay="block"
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: false,
            }}
          />
        </div>
      </div>

      {/* Modal for Creating/Editing/Deleting Events */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div
            className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
          >
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              {modalAction === "create"
                ? "নতুন ইভেন্ট তৈরি করুন"
                : modalAction === "update"
                ? "ইভেন্ট সম্পাদনা করুন"
                : "ইভেন্ট মুছে ফেলা নিশ্চিত করুন"}
            </h3>
            {modalAction !== "delete" ? (
              <form
                onSubmit={modalAction === "create" ? handleSubmitEvent : handleUpdate}
                className="grid grid-cols-1 gap-6"
              >
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                  placeholder="ইভেন্ট শিরোনাম (যেমন, ঈদুল ফিতর)"
                  disabled={isCreating || isUpdating}
                  aria-label="ইভেন্ট শিরোনাম"
                  title="ইভেন্ট শিরোনাম লিখুন"
                />
                <input
                  type="datetime-local"
                  value={newEvent.start}
                  onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                  disabled={isCreating || isUpdating}
                  aria-label="শুরুর সময়"
                  title="ইভেন্টের শুরুর সময় নির্বাচন করুন"
                />
                <input
                  type="datetime-local"
                  value={newEvent.end}
                  onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                  disabled={isCreating || isUpdating}
                  aria-label="শেষের সময়"
                  title="ইভেন্টের শেষের সময় নির্বাচন করুন"
                />
                <select
                  value={newEvent.academic_year}
                  onChange={(e) => setNewEvent({ ...newEvent, academic_year: e.target.value })}
                  className="w-full bg-transparent text-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isCreating || isUpdating}
                  aria-label="একাডেমিক বছর"
                  title="একাডেমিক বছর নির্বাচন করুন"
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
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setModalAction(null);
                      setModalData(null);
                      setSelectedEventId(null);
                    }}
                    className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                    title="বাতিল করুন"
                  >
                    বাতিল
                  </button>
                  {modalAction === "update" && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-500/20 text-[#441a05] rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                      title="ইভেন্ট মুছুন"
                    >
                      মুছুন
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow ${
                      isCreating || isUpdating ? "cursor-not-allowed" : ""
                    }`}
                    title={modalAction === "create" ? "ইভেন্ট তৈরি করুন" : "ইভেন্ট আপডেট করুন"}
                  >
                    {isCreating || isUpdating ? (
                      <span className="flex items-center space-x-3">
                        <FaSpinner className="animate-spin text-lg" />
                        <span>{modalAction === "create" ? "তৈরি করা হচ্ছে..." : "আপডেট করা হচ্ছে..."}</span>
                      </span>
                    ) : (
                      modalAction === "create" ? "তৈরি করুন" : "আপডেট করুন"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-[#441a05] mb-6">
                  আপনি কি নিশ্চিত যে এই ইভেন্টটি মুছে ফেলতে চান?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setModalAction(null);
                      setModalData(null);
                    }}
                    className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                    title="বাতিল করুন"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={confirmAction}
                    className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                    title="নিশ্চিত করুন"
                  >
                    নিশ্চিত করুন
                  </button>
                </div>
              </>
            )}
            {(createError || updateError || deleteError) && (
              <div
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                ত্রুটি: {(createError || updateError || deleteError).status || "অজানা"} -{" "}
                {JSON.stringify((createError || updateError || deleteError).data || {})}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  fullPage: {

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box",
    // background: "linear-gradient(135deg, #f0f4f8, #e0e7ff)",
    fontFamily: "'Noto Serif Bengali', sans-serif",
  },
  calendarContainer: {
    width: "100%",
    // maxWidth: "1200px",
    // background: "transparent",
    borderRadius: "16px",
    padding: "20px",
    transition: "transform 0.3s ease",
  },
};

// Add this CSS to your project (e.g., in index.html)
const customCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;700&display=swap');
`;

// Add the custom CSS to your project by including it in a <style> tag
// For example, in your index.html:
// <style>{customCSS}</style>

export default Event;