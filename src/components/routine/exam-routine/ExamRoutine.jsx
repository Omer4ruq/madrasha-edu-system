import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { FaSpinner, FaCalendarAlt, FaTrash, FaSave } from "react-icons/fa";
import { IoAdd } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import { useGetExamApiQuery } from "../../../redux/features/api/exam/examApi";
import { useGetAcademicYearApiQuery } from "../../../redux/features/api/academic-year/academicYearApi";
import {
  useCreateExamSchedulesMutation,
  useDeleteExamSchedulesMutation,
  useGetExamSchedulesQuery,
  useUpdateExamSchedulesMutation,
} from "../../../redux/features/api/routines/examRoutineApi";
import { useGetClassSubjectsByClassIdQuery } from "../../../redux/features/api/class-subjects/classSubjectsApi";
import selectStyles from "../../../utilitis/selectStyles";
import { useGetStudentClassApIQuery } from "../../../redux/features/api/student/studentClassApi";

// Custom CSS for animations and styling
const customStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
  @keyframes ripple { 0% { transform: scale(0); opacity: 0.5; } 100% { transform: scale(4); opacity: 0; } }
  @keyframes iconHover { to { transform: scale(1.1); } }
  .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
  .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
  .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
  .animate-slideDown { animation: slideDown 0.4s ease-out forwards; }
  .btn-glow:hover { box-shadow: 0 0 15px rgba(219, 158, 48, 0.3); }
  .input-icon:hover svg { animation: iconHover 0.3s ease-out forwards; }
  .btn-ripple { position: relative; overflow: hidden; }
  .btn-ripple::after { content: ''; position: absolute; top: 50%; left: 50%; width: 5px; height: 5px; background: rgba(255, 255, 255, 0.5); opacity: 0; border-radius: 100%; transform: scale(1); transform-origin: 50% 50%; animation: none; }
  .btn-ripple:active::after { animation: ripple 0.6s ease-out; }
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(157, 144, 135, 0.5); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #441a05; }
  .table-header { background: #DB9E30; color: #441a05; font-weight: bold; }
  .table-cell { transition: background-color 0.3s ease; }
  .table-cell:hover { background: #f3e8d7; }
  .card { transition: all 0.3s ease; }
  .card:hover { box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); }
`;

const ExamRoutine = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [schedules, setSchedules] = useState({});
  const [submittedRoutines, setSubmittedRoutines] = useState({});
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

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
  const [
    createExamSchedules,
    { isLoading: isCreateLoading, error: createError },
  ] = useCreateExamSchedulesMutation();
  const [
    updateExamSchedules,
    { isLoading: isUpdateLoading, error: updateError },
  ] = useUpdateExamSchedulesMutation();
  const [deleteExamSchedules] = useDeleteExamSchedulesMutation();

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
        if (
          JSON.stringify(currentSchedules) !== JSON.stringify(newSchedules)
        ) {
          return { ...prev, [activeTab]: { ...currentSchedules, ...newSchedules } };
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
    if (updateError)
      toast.error(`রুটিন আপডেটে ত্রুটি: ${updateError.status || "অজানা"}`);
  }, [
    examError,
    yearError,
    classError,
    subjectsError,
    scheduleError,
    createError,
    updateError,
  ]);

  // Handle schedule input changes
  const handleScheduleChange = (classId, subjectId, field, value) => {
    setSchedules((prev) => ({
      ...prev,
      [classId]: {
        ...prev[classId] || {},
        [subjectId]: {
          ...prev[classId]?.[subjectId] || {},
          [field]: value,
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

  // Handle update schedule for specific subject
  const handleUpdate = async (scheduleId, subjectId, subjectName) => {
    if (!selectedExam || !selectedYear) {
      toast.error("অনুগ্রহ করে পরীক্ষা এবং শিক্ষাবর্ষ নির্বাচন করুন।");
      return;
    }

    const schedule = schedules[activeTab]?.[subjectId];
    if (!schedule) {
      toast.error(`${subjectName} এর জন্য কোনো শিডিউল পাওয়া যায়নি।`);
      return;
    }

    // Validate inputs
    if (!schedule.exam_date || !schedule.start_time || !schedule.end_time) {
      toast.error(`অনুগ্রহ করে ${subjectName} এর জন্য তারিখ, শুরুর সময় এবং শেষ সময় পূরণ করুন।`);
      return;
    }

    // Validate time logic
    const startTime = new Date(`1970-01-01T${schedule.start_time}:00`);
    const endTime = new Date(`1970-01-01T${schedule.end_time}:00`);
    if (endTime <= startTime) {
      toast.error(`${subjectName} এর শেষ সময় অবশ্যই শুরুর সময়ের পরে হতে হবে।`);
      return;
    }

    // Validate date format
    const examDate = new Date(schedule.exam_date);
    if (isNaN(examDate.getTime())) {
      toast.error(`${subjectName} এর জন্য বৈধ তারিখ নির্বাচন করুন।`);
      return;
    }

    // Format times to match API requirement (e.g., "12:17:00.000Z")
    const formatTimeToUTC = (time) => {
      const [hours, minutes] = time.split(":");
      return `${hours}:${minutes}:00.000Z`;
    };

    const updatedSchedule = {
      id: scheduleId,
      exam_date: schedule.exam_date,
      start_time: formatTimeToUTC(schedule.start_time),
      end_time: formatTimeToUTC(schedule.end_time),
      exam_name: selectedExam.value,
      class_name: activeTab,
      subject_id: subjectId,
      academic_year: selectedYear.value,
    };

    try {
      await updateExamSchedules(updatedSchedule).unwrap();
      setSubmittedRoutines((prev) => ({
        ...prev,
        [activeTab]: (prev[activeTab] || []).map((s) =>
          s.id === scheduleId ? { ...s, ...updatedSchedule } : s
        ),
      }));
      setSchedules((prev) => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [subjectId]: {
            ...prev[activeTab][subjectId],
            id: scheduleId,
            exam_date: schedule.exam_date,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
          },
        },
      }));
      setEditingSchedule(null);
      toast.success(`${subjectName} এর রুটিন সফলভাবে আপডেট হয়েছে!`);
    } catch (error) {
      toast.error(`${subjectName} এর রুটিন আপডেট করতে ব্যর্থ হয়েছে: ${error?.data?.detail || "অজানা ত্রুটি"}`);
    }
  };

  // Handle delete schedule
  const handleDelete = async (scheduleId, subjectName) => {
    try {
      await deleteExamSchedules(scheduleId).unwrap();
      setSubmittedRoutines((prev) => ({
        ...prev,
        [activeTab]: (prev[activeTab] || []).filter((s) => s.id !== scheduleId),
      }));
      setSchedules((prev) => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [scheduleId]: {},
        },
      }));
      toast.success(`${subjectName} এর রুটিন সফলভাবে মুছে ফেলা হয়েছে!`);
    } catch (error) {
      toast.error(`${subjectName} এর রুটিন মুছতে ব্যর্থ হয়েছে: ${error?.data?.detail || "অজানা ত্রুটি"}`);
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
    isCreateLoading ||
    isUpdateLoading;

  // Sort schedules by exam_date
  const sortedSchedules = useMemo(
    () =>
      [
        ...(submittedRoutines[activeTab] || []),
        ...existingSchedules,
      ]
        .filter(
          (schedule, index, self) =>
            self.findIndex((s) => s.id === schedule.id) === index
        )
        .sort((a, b) => a.exam_date.localeCompare(b.exam_date)),
    [submittedRoutines, existingSchedules, activeTab]
  );

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-lg bg-gradient-to-r from-[#DB9E30] to-[#F4B840] text-[#441a05] transition-all duration-300 animate-scaleIn btn-ripple ${
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
                        const existing = existingSchedules.find(
                          (s) => s.subject_id === subject.id
                        );
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
                              <div className="relative input-icon">
                                <label className="text-sm">
                                  তারিখ <span className="text-red-500">*</span>
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
                                  className="w-full p-3 pl-10 bg-transparent text-[#441a05] border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#441a05] focus:ring-2 focus:ring-[#441a05] transition-all duration-300"
                                  disabled={isLoading}
                                  aria-label={`তারিখ নির্বাচন: ${subject.name}`}
                                  title={`তারিখ নির্বাচন করুন: ${subject.name} / Select date for ${subject.name}`}
                                />
                                <FaCalendarAlt className="absolute left-3 top-10 text-[#DB9E30]" />
                              </div>
                              <div className="flex space-x-4">
                                <div className="w-full">
                                  <label className="text-sm">
                                    শুরুর সময় <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="time"
                                    value={schedule.start_time || ""}
                                    onChange={(e) =>
                                      handleScheduleChange(
                                        activeTab,
                                        subject.id,
                                        "start_time",
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-3 bg-transparent text-[#441a05] border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#441a05] focus:ring-2 focus:ring-[#441a05] transition-all duration-300"
                                    disabled={isLoading}
                                    aria-label={`শুরুর সময়: ${subject.name}`}
                                    title={`শুরুর সময় নির্বাচন করুন: ${subject.name} / Select start time for ${subject.name}`}
                                  />
                                </div>
                                <div className="w-full">
                                  <label className="text-sm">
                                    শেষের সময় <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="time"
                                    value={schedule.end_time || ""}
                                    onChange={(e) =>
                                      handleScheduleChange(
                                        activeTab,
                                        subject.id,
                                        "end_time",
                                        e.target.value
                                      )
                                    }
                                    className="w-full p-3 bg-transparent text-[#441a05] border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#441a05] focus:ring-2 focus:ring-[#441a05] transition-all duration-300"
                                    disabled={isLoading}
                                    aria-label={`শেষ সময়: ${subject.name}`}
                                    title={`শেষ সময় নির্বাচন করুন: ${subject.name} / Select end time for ${subject.name}`}
                                  />
                                </div>
                              </div>
                              <div className="flex space-x-3">
                                {existing && (
                                  <button
                                    onClick={() =>
                                      setEditingSchedule(existing.id)
                                    }
                                    className="flex-1 px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white btn-glow transition-all duration-300 btn-ripple"
                                    aria-label={`সম্পাদনা করুন: ${subject.name}`}
                                    title={`সম্পাদনা করুন: ${subject.name} / Edit schedule for ${subject.name}`}
                                  >
                                    সম্পাদনা
                                  </button>
                                )}
                                {editingSchedule === existing?.id && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleUpdate(existing.id, subject.id, subject.name)
                                      }
                                      className={`flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 btn-glow transition-all duration-300 btn-ripple ${
                                        isUpdateLoading
                                          ? "cursor-not-allowed opacity-70"
                                          : ""
                                      }`}
                                      disabled={isUpdateLoading}
                                      aria-label={`সংরক্ষণ করুন: ${subject.name}`}
                                      title={`সংরক্ষণ করুন: ${subject.name} / Save schedule for ${subject.name}`}
                                    >
                                      {isUpdateLoading ? (
                                        <>
                                          <FaSpinner className="animate-spin text-lg mr-2" />
                                          সংরক্ষণ হচ্ছে...
                                        </>
                                      ) : (
                                        <>
                                          <FaSave className="inline-block mr-2" />
                                          সংরক্ষণ
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => setEditingSchedule(null)}
                                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 btn-glow transition-all duration-300 btn-ripple"
                                      aria-label={`বাতিল করুন: ${subject.name}`}
                                      title={`বাতিল করুন: ${subject.name} / Cancel edit for ${subject.name}`}
                                    >
                                      বাতিল
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Routine Table */}
                  <div>
                    <h3 className="text-xl font-semibold text-[#441a05] mb-6 animate-fadeIn">
                      পরীক্ষার রুটিন:{" "}
                      {
                        classes.find(
                          (cls) => cls.student_class.id === activeTab
                        )?.student_class.name
                      }
                    </h3>

                    {sortedSchedules.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-[#db9e30] animate-fadeIn">
                        <table className="w-full border-collapse min-w-[600px]">
                          <thead>
                            <tr className="bg-[#db9e30] text-[#441a05] text-left text-sm uppercase font-semibold">
                              <th className="p-4 rounded-tl-xl">বিষয়</th>
                              <th className="p-4 text-center">তারিখ</th>
                              <th className="p-4 text-center">সময়</th>
                              <th className="p-4 rounded-tr-xl text-center">
                                ক্রিয়া
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedSchedules.map((schedule, index) => {
                              const subjectName =
                                subjects.find(
                                  (s) => s.id === schedule.subject_id
                                )?.name || schedule.subject_id;
                              const isEditing = editingSchedule === schedule.id;

                              return (
                                <tr
                                  key={schedule.id || index}
                                  className={`${
                                    index % 2 === 1
                                      ? "bg-white/5"
                                      : "bg-white/10"
                                  } text-[#441a05] animate-scaleIn`}
                                  style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                  <td className="p-4">{subjectName}</td>
                                  <td className="p-4 text-center">
                                    {schedule.exam_date}
                                  </td>
                                  <td className="p-4 text-center">{`${schedule.start_time} - ${schedule.end_time}`}</td>
                                  <td className="p-4 text-center">
                                    {isEditing ? (
                                      <div className="flex justify-center gap-2">
                                        <button
                                          onClick={() =>
                                            handleUpdate(schedule.id, schedule.subject_id, subjectName)
                                          }
                                          className={`px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition btn-glow btn-ripple ${
                                            isUpdateLoading
                                              ? "cursor-not-allowed opacity-70"
                                              : ""
                                          }`}
                                          disabled={isUpdateLoading}
                                          title={`সংরক্ষণ করুন / Save ${subjectName}`}
                                        >
                                          {isUpdateLoading ? (
                                            <>
                                              <FaSpinner className="animate-spin text-lg mr-2" />
                                              সংরক্ষণ হচ্ছে...
                                            </>
                                          ) : (
                                            <>
                                              <FaSave className="inline-block mr-2" />
                                              সংরক্ষণ
                                            </>
                                          )}
                                        </button>
                                        <button
                                          onClick={() =>
                                            setEditingSchedule(null)
                                          }
                                          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition btn-glow btn-ripple"
                                          title="বাতিল করুন / Cancel"
                                        >
                                          বাতিল
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex justify-center gap-2">
                                        <button
                                          onClick={() =>
                                            setEditingSchedule(schedule.id)
                                          }
                                          className="px-3 py-1 bg-[#db9e30] text-[#441a05] rounded hover:bg-[#c48c22] hover:text-white transition btn-glow btn-ripple"
                                          title={`সম্পাদনা করুন / Edit ${subjectName}`}
                                        >
                                          সম্পাদনা
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDelete(schedule.id, subjectName)
                                          }
                                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition btn-glow btn-ripple"
                                          title={`মুছুন / Delete ${subjectName}`}
                                        >
                                          <FaTrash className="inline-block" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-[#441a05]/70 animate-scaleIn mt-4 text-center">
                        🤷‍♂️ কোনো রুটিন উপলব্ধ নেই।
                      </p>
                    )}
                  </div>
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
                        <td className="p-2 text-[#441a05]">{`${schedule.start_time} - ${schedule.end_time}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-all duration-300 btn-ripple"
                  aria-label="বাতিল করুন"
                  title="বাতিল করুন / Cancel"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmSubmitRoutine}
                  className="px-6 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white btn-glow transition-all duration-300 btn-ripple"
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