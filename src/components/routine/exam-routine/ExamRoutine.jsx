import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { FaSpinner, FaCalendarAlt } from "react-icons/fa";
import { IoAdd } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import { useGetExamApiQuery } from "../../../redux/features/api/exam/examApi";
import { useGetAcademicYearApiQuery } from "../../../redux/features/api/academic-year/academicYearApi";
import {
  useCreateExamSchedulesMutation,
  useGetExamSchedulesQuery,
} from "../../../redux/features/api/routines/examRoutineApi";
import { useGetClassSubjectsByClassIdQuery } from "../../../redux/features/api/class-subjects/classSubjectsApi";
import selectStyles from "../../../utilitis/selectStyles";
import { useGetStudentClassApIQuery } from "../../../redux/features/api/student/studentClassApi";
import ExamRoutineTable from "./ExamRoutineTable"; // Import the new table component

// Academic time slots for better user experience
const timeSlots = [
  { value: "08:00", label: "সকাল ৮:০০ (8:00 AM)" },
  { value: "08:30", label: "সকাল ৮:৩০ (8:30 AM)" },
  { value: "09:00", label: "সকাল ৯:০০ (9:00 AM)" },
  { value: "09:30", label: "সকাল ৯:৩০ (9:30 AM)" },
  { value: "10:00", label: "সকাল ১০:০০ (10:00 AM)" },
  { value: "10:30", label: "সকাল ১০:৩০ (10:30 AM)" },
  { value: "11:00", label: "সকাল ১১:০০ (11:00 AM)" },
  { value: "11:30", label: "সকাল ১১:৩০ (11:30 AM)" },
  { value: "12:00", label: "দুপুর ১২:০০ (12:00 PM)" },
  { value: "12:30", label: "দুপুর ১২:৩০ (12:30 PM)" },
  { value: "13:00", label: "দুপুর ১:০০ (1:00 PM)" },
  { value: "13:30", label: "দুপুর ১:৩০ (1:30 PM)" },
  { value: "14:00", label: "দুপুর ২:০০ (2:00 PM)" },
  { value: "14:30", label: "দুপুর ২:৩০ (2:30 PM)" },
  { value: "15:00", label: "দুপুর ৩:০০ (3:00 PM)" },
  { value: "15:30", label: "দুপুর ৩:৩০ (3:30 PM)" },
  { value: "16:00", label: "বিকাল ৪:০০ (4:00 PM)" },
  { value: "16:30", label: "বিকাল ৪:৩০ (4:30 PM)" },
  { value: "17:00", label: "বিকাল ৫:০০ (5:00 PM)" },
];

// Exam duration options
const durationOptions = [
  { value: 60, label: "১ ঘন্টা (1 Hour)" },
  { value: 90, label: "১.৫ ঘন্টা (1.5 Hours)" },
  { value: 120, label: "২ ঘন্টা (2 Hours)" },
  { value: 150, label: "২.৫ ঘন্টা (2.5 Hours)" },
  { value: 180, label: "৩ ঘন্টা (3 Hours)" },
  { value: 210, label: "৩.৫ ঘন্টা (3.5 Hours)" },
  { value: 240, label: "৪ ঘন্টা (4 Hours)" },
];

// Custom CSS for animations and styling
const customStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
  .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
  .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
  .btn-glow:hover { box-shadow: 0 0 15px rgba(219, 158, 48, 0.3); }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(157, 144, 135, 0.5); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #441a05; }
  .card { transition: all 0.3s ease; }
  .card:hover { box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); }
`;

const ExamRoutine = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [schedules, setSchedules] = useState({});
  const [submittedRoutines, setSubmittedRoutines] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch data
  const {
    data: exams = [],
    isLoading: isExamLoading,
    error: examError,
  } = useGetExamApiQuery();
  
  const {
    data: academicYears = [],
    isLoading: isYearLoading,
    error: yearError,
  } = useGetAcademicYearApiQuery();
  
  const {
    data: classes = [],
    isLoading: isClassLoading,
    error: classError,
  } = useGetStudentClassApIQuery();
  console.log("classes", classes)
  const {
    data: subjects = [],
    isLoading: isSubjectsLoading,
    error: subjectsError,
  } = useGetClassSubjectsByClassIdQuery(activeTab || "", {
    skip: !activeTab,
  });
  
  const {
    data: existingSchedulesData = [],
    isLoading: isScheduleLoading,
    error: scheduleError,
    refetch: refetchSchedules,
  } = useGetExamSchedulesQuery(
    {
      exam_name: selectedExam?.value,
      class_name: activeTab,
      academic_year: selectedYear?.value,
    },
    {
      skip: !selectedExam || !activeTab || !selectedYear,
    }
  );

  // Fetch all exam schedules for the table component
  const {
    data: allExamSchedules = [],
    isLoading: isAllSchedulesLoading,
    refetch: refetchAllSchedules,
  } = useGetExamSchedulesQuery(
    {
      exam_name: selectedExam?.value,
      academic_year: selectedYear?.value,
    },
    {
      skip: !selectedExam || !selectedYear,
    }
  );
  
  const [
    createExamSchedules,
    { isLoading: isCreateLoading, error: createError },
  ] = useCreateExamSchedulesMutation();

  const existingSchedules = useMemo(
    () =>
      Array.isArray(existingSchedulesData) && existingSchedulesData.length > 0
        ? existingSchedulesData[0]?.schedules || []
        : [],
    [existingSchedulesData]
  );

  // Options for react-select
  const examOptions = useMemo(
    () => exams.map((exam) => ({ value: exam.id, label: exam.name })),
    [exams]
  );
  
  const yearOptions = useMemo(
    () => academicYears.map((year) => ({ value: year.id, label: year.name })),
    [academicYears]
  );

  // Function to calculate end time based on start time and duration
  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Function to format time for display
  const formatTimeForDisplay = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Refresh callback for the table component
  const handleTableRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    refetchSchedules();
    refetchAllSchedules();
  };

  // Initialize activeTab
  useEffect(() => {
    if (classes.length > 0 && !activeTab) {
      setActiveTab(classes[0].student_class.id);
    }
  }, [classes, activeTab]);

  // Initialize schedules and submittedRoutines
  useEffect(() => {
    if (activeTab && subjects.length > 0) {
      setSchedules((prev) => {
        const currentSchedules = prev[activeTab] || {};
        const newSchedules = subjects.reduce(
          (acc, subject) => ({
            ...acc,
            [subject.id]: currentSchedules[subject.id] || {},
          }),
          {}
        );
        if (JSON.stringify(currentSchedules) !== JSON.stringify(newSchedules)) {
          return { ...prev, [activeTab]: newSchedules };
        }
        return prev;
      });
    }

    if (existingSchedules.length > 0) {
      const newSchedules = existingSchedules.reduce(
        (acc, schedule) => ({
          ...acc,
          [schedule.subject_id]: {
            id: schedule.id,
            exam_date: schedule.exam_date,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
          },
        }),
        {}
      );

      setSchedules((prev) => {
        const currentSchedules = prev[activeTab] || {};
        if (JSON.stringify(currentSchedules) !== JSON.stringify(newSchedules)) {
          return {
            ...prev,
            [activeTab]: { ...currentSchedules, ...newSchedules },
          };
        }
        return prev;
      });

      setSubmittedRoutines((prev) => {
        const currentRoutines = prev[activeTab] || [];
        if (
          JSON.stringify(currentRoutines) !== JSON.stringify(existingSchedules)
        ) {
          return { ...prev, [activeTab]: existingSchedules };
        }
        return prev;
      });
    }
  }, [activeTab, subjects, existingSchedules]);

  // Handle errors
  useEffect(() => {
    if (examError) toast.error("পরীক্ষার তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (yearError) toast.error("শিক্ষাবর্ষের তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (classError) toast.error("শ্রেণির তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (subjectsError) toast.error("বিষয়ের তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (scheduleError) toast.error("পরীক্ষার রুটিন লোড করতে ব্যর্থ হয়েছে!");
    if (createError)
      toast.error(`রুটিন তৈরিতে ত্রুটি: ${createError.status || "অজানা"}`);
  }, [
    examError,
    yearError,
    classError,
    subjectsError,
    scheduleError,
    createError,
  ]);

  // Handle schedule input changes
  const handleScheduleChange = (classId, subjectId, field, value) => {
    setSchedules((prev) => ({
      ...prev,
      [classId]: {
        ...(prev[classId] || {}),
        [subjectId]: {
          ...(prev[classId]?.[subjectId] || {}),
          [field]: value,
        },
      },
    }));
  };

  // Handle start time and duration change
  const handleTimeChange = (classId, subjectId, startTime, duration) => {
    const endTime = calculateEndTime(startTime, duration);
    setSchedules((prev) => ({
      ...prev,
      [classId]: {
        ...(prev[classId] || {}),
        [subjectId]: {
          ...(prev[classId]?.[subjectId] || {}),
          start_time: startTime,
          end_time: endTime,
        },
      },
    }));
  };

  // Handle date picker click
  const handleDateClick = (e) => {
    if (e.target.type === "date") {
      e.target.showPicker();
    }
  };

  // Handle submit routine
  const handleSubmit = async () => {
    if (!selectedExam) {
      toast.error("অনুগ্রহ করে একটি পরীক্ষা নির্বাচন করুন!");
      return;
    }
    if (!selectedYear) {
      toast.error("অনুগ্রহ করে একটি শিক্ষাবর্ষ নির্বাচন করুন!");
      return;
    }

    const activeClassSchedules = schedules[activeTab] || {};
    const validSchedules = Object.entries(activeClassSchedules)
      .filter(
        ([_, schedule]) =>
          schedule.exam_date && schedule.start_time && schedule.end_time
      )
      .map(([subjectId, schedule]) => ({
        subject_id: subjectId,
        exam_date: schedule.exam_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        academic_year: selectedYear.value,
        exam_id: selectedExam.value,
      }));

    if (validSchedules.length === 0) {
      toast.error("কোনো বৈধ রুটিন নেই। অনুগ্রহ করে তথ্য পূরণ করুন।");
      return;
    }

    setModalData({
      exam_name: selectedExam.value,
      class_name: activeTab,
      schedules: validSchedules,
    });
    setIsModalOpen(true);
  };

  // Confirm submit routine
  const confirmSubmitRoutine = async () => {
    try {
      await createExamSchedules(modalData).unwrap();
      setSubmittedRoutines((prev) => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), ...modalData.schedules],
      }));
      toast.success("পরীক্ষার রুটিন সফলভাবে সাবমিট হয়েছে!");
      
      // Refresh data after successful submission
      handleTableRefresh();
    } catch (error) {
      toast.error("পরীক্ষার রুটিন সাবমিট করতে ব্যর্থ হয়েছে।");
    } finally {
      setIsModalOpen(false);
      setModalData(null);
    }
  };

  // Loading state
  const isLoading =
    isExamLoading ||
    isYearLoading ||
    isClassLoading ||
    isSubjectsLoading ||
    isScheduleLoading ||
    isCreateLoading;

  return (
    <div className="py-8 w-full relative">
      <style>{customStyles}</style>
      <div className="">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6 animate-fadeIn ml-2">
          <FaCalendarAlt className="text-3xl text-[#441a05]" />
          <h2 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
            পরীক্ষার রুটিন
          </h2>
        </div>

        {/* Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exam Selection */}
            <div className="relative">
              <label
                className="block text-lg font-semibold text-[#441a05] mb-2"
                htmlFor="examSelect"
              >
                পরীক্ষা নির্বাচন করুন <span className="text-red-600">*</span>
              </label>
              <Select
                id="examSelect"
                options={examOptions}
                value={selectedExam}
                onChange={setSelectedExam}
                placeholder="পরীক্ষা নির্বাচন করুন"
                classNamePrefix="react-select"
                className="mt-1"
                isClearable
                isDisabled={isLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="পরীক্ষা নির্বাচন"
                title="পরীক্ষা নির্বাচন করুন / Select exam"
              />
            </div>

            {/* Academic Year Selection */}
            <div className="relative">
              <label
                className="block text-lg font-semibold text-[#441a05] mb-2"
                htmlFor="yearSelect"
              >
                শিক্ষাবর্ষ নির্বাচন করুন <span className="text-red-600">*</span>
              </label>
              <Select
                id="yearSelect"
                options={yearOptions}
                value={selectedYear}
                onChange={setSelectedYear}
                placeholder="শিক্ষাবর্ষ নির্বাচন করুন"
                classNamePrefix="react-select"
                className="mt-1"
                isClearable
                isDisabled={isLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="শিক্ষাবর্ষ নির্বাচন"
                title="শিক্ষাবর্ষ নির্বাচন করুন / Select academic year"
              />
            </div>
          </div>
        </div>

        {/* Class Tabs and Schedules */}
        {selectedExam && selectedYear && classes.length > 0 && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl animate-fadeIn shadow-xl card">
            {/* Class Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
              {classes.map((cls, index) => (
                <button
                  key={cls.student_class.id}
                  onClick={() => setActiveTab(cls.student_class.id)}
                  className={`px-6 py-3 rounded-lg font-semibold text-[#441a05] transition-all duration-300 animate-scaleIn ${
                    activeTab === cls.student_class.id
                      ? "bg-[#DB9E30] text-white"
                      : "bg-white/10 hover:bg-[#441a05]/10"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  aria-label={`শ্রেণি নির্বাচন: ${cls.student_class.name}`}
                  title={`শ্রেণি নির্বাচন করুন: ${cls.student_class.name} / Select class: ${cls.student_class.name}`}
                >
                  {cls.student_class.name}
                </button>
              ))}
            </div>

            {/* Schedule Section */}
            {activeTab &&
              classes.find((cls) => cls.student_class.id === activeTab) && (
                <div className="grid grid-cols-1 gap-8">
                  {/* Add/Edit Schedule */}
                  <div>
                    <h3 className="text-xl font-semibold text-[#441a05] mb-6 animate-fadeIn">
                      পরীক্ষার সময়সূচি যোগ/সম্পাদনা করুন
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subjects.map((subject, index) => {
                        const schedule = schedules[activeTab]?.[subject.id] || {};
                        return (
                          <div
                            key={subject.id}
                            className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl animate-scaleIn card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <h4 className="font-semibold text-lg text-[#441a05] mb-4">
                              {subject.name}
                            </h4>
                            <div className="space-y-4">
                              {/* Date Selection */}
                              <div className="relative">
                                <label className="text-sm font-medium text-[#441a05] mb-1 block">
                                  পরীক্ষার তারিখ <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="date"
                                  value={schedule.exam_date || ""}
                                  onChange={(e) =>
                                    handleScheduleChange(
                                      activeTab,
                                      subject.id,
                                      "exam_date",
                                      e.target.value
                                    )
                                  }
                                  onClick={handleDateClick}
                                  className="w-full p-3 bg-transparent text-[#441a05] border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#441a05] focus:ring-2 focus:ring-[#441a05] transition-all duration-300"
                                  disabled={isLoading}
                                  aria-label={`তারিখ নির্বাচন: ${subject.name}`}
                                  title={`তারিখ নির্বাচন করুন: ${subject.name} / Select date for ${subject.name}`}
                                />
                              </div>

                              {/* Start Time Selection */}
                              <div>
                                <label className="text-sm font-medium text-[#441a05] mb-1 block">
                                  শুরুর সময় <span className="text-red-500">*</span>
                                </label>
                                <Select
                                  options={timeSlots}
                                  value={timeSlots.find(slot => slot.value === schedule.start_time) || null}
                                  onChange={(selected) => {
                                    const startTime = selected ? selected.value : "";
                                    const currentDuration = schedule.duration || 120; // Default 2 hours
                                    handleTimeChange(activeTab, subject.id, startTime, currentDuration);
                                  }}
                                  placeholder="শুরুর সময় নির্বাচন করুন"
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                  styles={selectStyles}
                                  menuPortalTarget={document.body}
                                  menuPosition="fixed"
                                  isClearable
                                  isDisabled={isLoading}
                                />
                              </div>

                              {/* Duration Selection */}
                              <div>
                                <label className="text-sm font-medium text-[#441a05] mb-1 block">
                                  পরীক্ষার সময়কাল <span className="text-red-500">*</span>
                                </label>
                                <Select
                                  options={durationOptions}
                                  value={durationOptions.find(opt => opt.value === schedule.duration) || durationOptions[1]} // Default 2 hours
                                  onChange={(selected) => {
                                    const duration = selected ? selected.value : 120;
                                    const currentStartTime = schedule.start_time || "";
                                    handleScheduleChange(activeTab, subject.id, "duration", duration);
                                    if (currentStartTime) {
                                      handleTimeChange(activeTab, subject.id, currentStartTime, duration);
                                    }
                                  }}
                                  placeholder="সময়কাল নির্বাচন করুন"
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                  styles={selectStyles}
                                  menuPortalTarget={document.body}
                                  menuPosition="fixed"
                                  isDisabled={isLoading}
                                />
                              </div>

                              {/* End Time Display */}
                              {schedule.end_time && (
                                <div>
                                  <label className="text-sm font-medium text-[#441a05] mb-1 block">
                                    শেষের সময়
                                  </label>
                                  <div className="w-full p-3 bg-gray-100/50 text-[#441a05] border border-[#9d9087] rounded-lg">
                                    {formatTimeForDisplay(schedule.end_time)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`w-fit mx-auto mt-5 flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-lg bg-gradient-to-r from-[#DB9E30] to-[#F4B840] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                          isLoading
                            ? "cursor-not-allowed opacity-70"
                            : "hover:text-white btn-glow"
                        }`}
                        aria-label="রুটিন সাবমিট করুন"
                        title="রুটিন সাবমিট করুন / Submit routine"
                      >
                        {isLoading ? (
                          <>
                            <FaSpinner className="animate-spin text-lg mr-2" />
                            সাবমিট হচ্ছে...
                          </>
                        ) : (
                          <>
                            <IoAdd className="w-6 h-6 mr-2" />
                            রুটিন সাবমিট করুন
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Exam Routine Table Component */}
                  <ExamRoutineTable
                    allExamSchedules={allExamSchedules}
                    classes={classes}
                    selectedExam={selectedExam}
                    selectedYear={selectedYear}
                    isAllSchedulesLoading={isAllSchedulesLoading}
                    onRefresh={handleTableRefresh}
                  />
                </div>
              )}
          </div>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-8 w-full max-w-lg border border-white/20 animate-slideUp card">
              <h3 className="text-xl font-semibold text-[#441a05] mb-4">
                রুটিন তৈরি নিশ্চিত করুন
              </h3>
              <p className="text-[#441a05] mb-4">
                নিম্নলিখিত সময়সূচি সাবমিট করা হবে:
              </p>
              <div className="max-h-64 overflow-y-auto mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#DB9E30]/20">
                      <th className="p-2 text-left text-[#441a05] font-semibold">
                        বিষয়
                      </th>
                      <th className="p-2 text-left text-[#441a05] font-semibold">
                        তারিখ
                      </th>
                      <th className="p-2 text-left text-[#441a05] font-semibold">
                        সময়
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData?.schedules?.map((schedule, index) => (
                      <tr key={index} className="border-b border-white/20">
                        <td className="p-2 text-[#441a05]">
                          {subjects.find((s) => s.id === schedule.subject_id)
                            ?.name || schedule.subject_id}
                        </td>
                        <td className="p-2 text-[#441a05]">
                          {schedule.exam_date}
                        </td>
                        <td className="p-2 text-[#441a05]">
                          {`${formatTimeForDisplay(schedule.start_time)} - ${formatTimeForDisplay(schedule.end_time)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-all duration-300"
                  aria-label="বাতিল করুন"
                  title="বাতিল করুন / Cancel"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmSubmitRoutine}
                  className="px-6 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white btn-glow transition-all duration-300"
                  aria-label="নিশ্চিত করুন"
                  title="নিশ্চিত করুন / Confirm"
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

export default ExamRoutine;