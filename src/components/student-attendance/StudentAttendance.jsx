
import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import { FaSearch, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import { IoAdd } from 'react-icons/io5';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast, { Toaster } from 'react-hot-toast';
import selectStyles from '../../utilitis/selectStyles';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetClassSubjectsByClassIdQuery } from '../../redux/features/api/class-subjects/classSubjectsApi';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetStudentSubAttendanceQuery } from '../../redux/features/api/student-sub-attendance/studentSubAttendanceApi';
import { Tooltip } from 'react-tooltip';

// Custom CSS from old version
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes ripple {
    0% { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(4); opacity: 0; }
  }
  @keyframes iconHover {
    to { transform: scale(1.1); }
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
  .input-icon:hover svg {
    animation: iconHover 0.3s ease-out forwards;
  }
  .btn-ripple {
    position: relative;
    overflow: hidden;
  }
  .btn-ripple::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1);
    transform-origin: 50% 50%;
    animation: none;
  }
  .btn-ripple:active::after {
    animation: ripple 0.6s ease-out;
  }
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(157, 144, 135, 0.5);
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #441a05;
  }
  .table-container {
    max-height: 60vh;
    overflow-y: auto;
  }
  .tab-active {
    background-color: #DB9E30;
    color: #441a05;
  }
  .tab-inactive {
    background-color: transparent;
    color: #441a05;
  }
  .tab-inactive:hover {
    background-color: rgba(219, 158, 48, 0.1);
  }
`;

const StudentAttendance = () => {
  const [tabValue, setTabValue] = useState(0); // 0: By Date, 1: By Month/Date Range
  const [selectedClass, setSelectedClass] = useState(null);
  const [month, setMonth] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [classDate, setClassDate] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');

  // Fetch class configurations
  const { data: classConfigData, isLoading: isClassesLoading, error: classesError } = useGetclassConfigApiQuery();
  const classes = Array.isArray(classConfigData) ? classConfigData : [];
  const classOptions = classes.map((cls) => ({
    value: cls.id,
    label: `${cls.class_name}-${cls.section_name} (${cls.shift_name})`,
  }));

  // Fetch subjects and students when classId is selected
  const { data: subjectsData, isLoading: isSubjectsLoading, error: subjectsError } = useGetClassSubjectsByClassIdQuery(
    selectedClass?.value,
    { skip: !selectedClass }
  );
  const { data: studentsData, isLoading: isStudentsLoading, error: studentsError } = useGetStudentActiveByClassQuery(
    selectedClass?.value,
    { skip: !selectedClass }
  );
  const subjects = Array.isArray(subjectsData) ? subjectsData : [];
  const students = Array.isArray(studentsData) ? studentsData : [];

  // Fetch attendance data based on tab and filters
  const attendanceQueryParams = {
    class_id: selectedClass?.value,
    ...(tabValue === 0 && classDate ? { date: classDate } : {}),
    ...(tabValue === 1 && month && !startDate && !endDate ? { month: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}` } : {}),
    ...(tabValue === 1 && startDate && endDate && !month ? { start_date: startDate.toISOString().split('T')[0], end_date: endDate.toISOString().split('T')[0] } : {}),
  };
  const { data: attendanceData, isLoading: isAttendanceLoading, error: attendanceError } = useGetStudentSubAttendanceQuery(
    attendanceQueryParams,
    { skip: !selectedClass || (!classDate && tabValue === 0) || (!month && !startDate && !endDate && tabValue === 1) }
  );

  // Filter students and subjects based on search inputs
  const filteredStudents = useMemo(() => {
    if (!students.length) return [];
    return students.filter(
      (student) =>
        (student.name && student.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (student.user_id && student.user_id.toString().includes(studentSearch))
    );
  }, [students, studentSearch]);

  const filteredSubjects = useMemo(() => {
    if (!subjects.length) return [];
    return subjects.filter(
      (subject) => subject.name && subject.name.toLowerCase().includes(subjectSearch.toLowerCase())
    );
  }, [subjects, subjectSearch]);

  // Generate unique dates for Tab 2
  const uniqueDates = useMemo(() => {
    if (!attendanceData?.attendance?.length) return [];
    return [...new Set(attendanceData.attendance.map((record) => record.attendance_date))].sort();
  }, [attendanceData]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (classesError) toast.error('ক্লাস তালিকা লোড করতে ব্যর্থ হয়েছে!');
    if (subjectsError) toast.error('বিষয় তালিকা লোড করতে ব্যর্থ হয়েছে!');
    if (studentsError) toast.error('ছাত্র তালিকা লোড করতে ব্যর্থ হয়েছে!');
    if (attendanceError) toast.error('উপস্থিতি তথ্য লোড করতে ব্যর্থ হয়েছে!');
  }, [classesError, subjectsError, studentsError, attendanceError]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClass) {
      toast.error('অনুগ্রহ করে একটি ক্লাস নির্বাচন করুন!');
      return;
    }
    if (tabValue === 0 && !classDate) {
      toast.error('অনুগ্রহ করে একটি তারিখ নির্বাচন করুন!');
      return;
    }
    if (tabValue === 1 && !month && (!startDate || !endDate)) {
      toast.error('অনুগ্রহ করে একটি মাস বা তারিখের পরিসীমা নির্বাচন করুন!');
      return;
    }
  };

  // Handle date click for native date picker
  const handleDateClick = (e) => {
    if (e.target.type === 'date') {
      e.target.showPicker();
    }
  };

  const isLoading = isClassesLoading || isSubjectsLoading || isStudentsLoading || isAttendanceLoading;

  return (
    <div className="py-8 w-full relative">
      <style>{customStyles}</style>
      <div className="mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-white/20 mb-6 animate-fadeIn">
          <button
            className={`flex-1 py-3 px-6 text-lg font-medium rounded-t-lg transition-all duration-300 ${
              tabValue === 0 ? 'tab-active' : 'tab-inactive'
            }`}
            onClick={() => {
              setTabValue(0);
              setDateRange([null, null]);
              setMonth(null);
              setStudentSearch('');
              setSubjectSearch('');
              setClassDate('');
            }}
            aria-label="ক্লাস অনুযায়ী উপস্থিতি"
            title="ক্লাস অনুযায়ী উপস্থিতি দেখুন / View attendance by class"
          >
            ক্লাস অনুযায়ী উপস্থিতি
          </button>
          <button
            className={`flex-1 py-3 px-6 text-lg font-medium rounded-t-lg transition-all duration-300 ${
              tabValue === 1 ? 'tab-active' : 'tab-inactive'
            }`}
            onClick={() => {
              setTabValue(1);
              setStudentSearch('');
              setSubjectSearch('');
              setClassDate('');
            }}
            aria-label="তারিখ/মাস অনুযায়ী উপস্থিতি"
            title="তারিখ/মাস অনুযায়ী উপস্থিতি দেখুন / View attendance by date/month"
          >
            তারিখ/মাস অনুযায়ী উপস্থিতি
          </button>
        </div>

        {/* Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <FaCalendarAlt className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              {tabValue === 0 ? 'ক্লাস অনুযায়ী উপস্থিতি দেখুন' : 'তারিখ/মাস অনুযায়ী উপস্থিতি দেখুন'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class Selection */}
            <div className="relative">
              <label className="block text-lg font-medium text-[#441a05]" htmlFor="classSelect">
                ক্লাস নির্বাচন করুন <span className="text-red-600">*</span>
              </label>
              <Select
                id="classSelect"
                options={classOptions}
                value={selectedClass}
                onChange={setSelectedClass}
                placeholder="ক্লাস নির্বাচন করুন"
                classNamePrefix="react-select"
                className="mt-1"
                isClearable
                isDisabled={isLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="ক্লাস নির্বাচন"
                title="ক্লাস নির্বাচন করুন / Select class"
              />
            </div>

            {tabValue === 0 && (
              <div className="relative input-icon">
                <label className="block text-lg font-medium text-[#441a05]" htmlFor="classDate">
                  তারিখ নির্বাচন করুন <span className="text-red-600">*</span>
                </label>
                <input
                  id="classDate"
                  type="date"
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  onClick={handleDateClick}
                  className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05]"
                  placeholder="তারিখ নির্বাচন করুন"
                  disabled={isLoading}
                  required
                  aria-label="তারিখ নির্বাচন"
                  title="তারিখ নির্বাচন করুন / Select date"
                />
                <FaCalendarAlt className="absolute left-3 top-[42px] text-[#DB9E30]" />
              </div>
            )}

            {tabValue === 1 && (
              <>
                {/* Filter Type Selection */}
                <div className="relative input-icon">
                  <label className="block text-lg font-medium text-[#441a05]" htmlFor="filterType">
                    ফিল্টার প্রকার
                  </label>
                  <select
                    id="filterType"
                    value={month ? 'month' : 'dateRange'}
                    onChange={(e) => {
                      if (e.target.value === 'month') {
                        setDateRange([null, null]);
                      } else {
                        setMonth(null);
                      }
                    }}
                    className="mt-1 block w-full bg-transparent text-[#441a05] pl-10 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05]"
                    disabled={isLoading}
                    aria-label="ফিল্টার প্রকার"
                    title="ফিল্টার প্রকার নির্বাচন করুন / Select filter type"
                  >
                    <option value="dateRange">তারিখের পরিসীমা</option>
                    <option value="month">মাস</option>
                  </select>
                  <FaCalendarAlt className="absolute left-3 top-[42px] text-[#DB9E30]" />
                </div>

                {/* Date Range or Month Picker */}
                <div className="relative input-icon">
                  <label className="block text-lg font-medium text-[#441a05]" htmlFor="datePicker">
                    {month ? 'মাস নির্বাচন করুন' : 'তারিখের পরিসীমা'}
                  </label>
                  {month ? (
                    <DatePicker
                      id="datePicker"
                      selected={month}
                      onChange={(date) => {
                        setMonth(date);
                        setDateRange([null, null]);
                      }}
                      showMonthYearPicker
                      dateFormat="MMMM yyyy"
                      isClearable
                      className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05]"
                      placeholderText="মাস নির্বাচন করুন"
                      disabled={isLoading}
                      aria-label="মাস নির্বাচন"
                      title="মাস নির্বাচন করুন / Select month"
                    />
                  ) : (
                    <DatePicker
                      id="datePicker"
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setDateRange(update);
                        setMonth(null);
                      }}
                      isClearable
                      className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05]"
                      placeholderText="তারিখের পরিসীমা নির্বাচন করুন"
                      disabled={isLoading}
                      aria-label="তারিখের পরিসীমা"
                      title="তারিখের পরিসীমা নির্বাচন করুন / Select date range"
                    />
                  )}
                  <FaCalendarAlt className="absolute left-3 top-[42px] text-[#DB9E30]" />
                </div>
              </>
            )}

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn btn-ripple ${
                  isLoading ? 'cursor-not-allowed opacity-70' : 'hover:text-white btn-glow'
                }`}
                aria-label="উপস্থিতি দেখুন"
                title="উপস্থিতি দেখুন / View attendance"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin text-lg mr-2" />
                    লোড হচ্ছে...
                  </>
                ) : (
                  <>
                    <IoAdd className="w-5 h-5 mr-2" />
                    উপস্থিতি দেখুন
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Attendance Table */}
        <div className="bg-black/10 px-6 py-2 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn table-container border border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">উপস্থিতি তালিকা</h3>
          {isLoading ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              <FaSpinner className="animate-spin text-lg mr-2" />
              উপস্থিতি লোড হচ্ছে...
            </p>
          ) : !selectedClass ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              অনুগ্রহ করে একটি ক্লাস নির্বাচন করুন।
            </p>
          ) : (tabValue === 0 && !classDate) ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              অনুগ্রহ করে একটি তারিখ নির্বাচন করুন।
            </p>
          ) : (tabValue === 1 && !month && (!startDate || !endDate)) ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              অনুগ্রহ করে একটি মাস বা তারিখের পরিসীমা নির্বাচন করুন।
            </p>
          ) : (tabValue === 0 && filteredSubjects.length === 0) || (tabValue === 1 && filteredStudents.length === 0) ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              কোনো {tabValue === 0 ? 'বিষয়' : 'ছাত্র'} পাওয়া যায়নি।
            </p>
          ) : tabValue === 0 ? (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 animate-fadeIn">
                <div className="relative input-icon">
                  <label className="block text-lg font-medium text-[#441a05]" htmlFor="searchStudent">
                    ছাত্র অনুসন্ধান
                  </label>
                  <FaSearch className="absolute left-3 top-[42px] text-[#DB9E30]" />
                  <input
                    id="searchStudent"
                    type="text"
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                    }}
                    placeholder="ছাত্রের নাম বা আইডি লিখুন"
                    className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 pr-3 py-2.5 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05]"
                    disabled={isLoading}
                    aria-label="ছাত্র অনুসন্ধান"
                    title="ছাত্র অনুসন্ধান / Search student"
                  />
                </div>
                <div className="relative input-icon">
                  <label className="block text-lg font-medium text-[#441a05]" htmlFor="searchSubject">
                    বিষয় অনুসন্ধান
                  </label>
                  <FaSearch className="absolute left-3 top-[42px] text-[#DB9E30]" />
                  <input
                    id="searchSubject"
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => {
                      setSubjectSearch(e.target.value);
                    }}
                    placeholder="বিষয়ের নাম লিখুন"
                    className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 pr-3 py-2.5 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05]"
                    disabled={isLoading}
                    aria-label="বিষয় অনুসন্ধান"
                    title="বিষয় অনুসন্ধান / Search subject"
                  />
                </div>
              </div>
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                      বিষয়
                    </th>
                    {filteredStudents.map((student) => (
                      <th
                        key={student.id}
                        className="px-6 py-3 text-center text-sm font-medium text-[#441a05]/70 uppercase tracking-wider"
                      >
                        {student.name || 'N/A'} (Roll: {student.roll_no || 'N/A'})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredSubjects.map((subject, index) => (
                    <tr
                      key={subject.id}
                      className="bg-white/5 hover:bg-white/10 transition-colors duration-200 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {subject.name || 'N/A'}
                      </td>
                      {filteredStudents.map((student) => {
                        const attendance = attendanceData?.attendance?.find(
                          (record) => record.student === student.id && record.class_subject === subject.id && record.attendance_date === classDate
                        );
                        return (
                          <td
                            key={`${student.id}-${subject.id}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-center text-[#441a05]"
                          >
                            <Tooltip title={attendance?.remarks || ''}>
                              <span>{attendance?.status === 'PRESENT' ? '✅ উপস্থিত' : attendance?.status === 'ABSENT' ? '❌ অনুপস্থিত' : 'N/A'}</span>
                            </Tooltip>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 animate-fadeIn">
                <div className="relative input-icon">
                  <label className="block text-lg font-medium text-[#441a05]" htmlFor="searchStudent">
                    ছাত্র অনুসন্ধান
                  </label>
                  <FaSearch className="absolute left-3 top-[42px] text-[#DB9E30]" />
                  <input
                    id="searchStudent"
                    type="text"
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                    }}
                    placeholder="ছাত্রের নাম বা আইডি লিখুন"
                    className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 pr-3 py-2.5 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05]"
                    disabled={isLoading}
                    aria-label="ছাত্র অনুসন্ধান"
                    title="ছাত্র অনুসন্ধান / Search student"
                  />
                </div>
                <div className="relative input-icon">
                  <label className="block text-lg font-medium text-[#441a05]" htmlFor="searchSubject">
                    বিষয় অনুসন্ধান
                  </label>
                  <FaSearch className="absolute left-3 top-[42px] text-[#DB9E30]" />
                  <input
                    id="searchSubject"
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => {
                      setSubjectSearch(e.target.value);
                    }}
                    placeholder="বিষয়ের নাম লিখুন"
                    className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 pr-3 py-2.5 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05]"
                    disabled={isLoading}
                    aria-label="বিষয় অনুসন্ধান"
                    title="বিষয় অনুসন্ধান / Search subject"
                  />
                </div>
              </div>
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ছাত্র
                    </th>
                    {uniqueDates.map((date) => (
                      <th
                        key={date}
                        className="px-6 py-3 text-center text-sm font-medium text-[#441a05]/70 uppercase tracking-wider"
                      >
                        {new Date(date).toLocaleDateString('bn-BD')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className="bg-white/5 hover:bg-white/10 transition-colors duration-200 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {student.name || 'N/A'} (ID: {student.user_id || 'N/A'})
                      </td>
                      {uniqueDates.map((date) => {
                        const attendance = attendanceData?.attendance?.find(
                          (record) => record.student === student.id && record.attendance_date === date
                        );
                        return (
                          <td
                            key={`${student.id}-${date}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-center text-[#441a05]"
                          >
                            <Tooltip title={attendance?.remarks || ''}>
                              <span>{attendance?.status === 'PRESENT' ? '✅ উপস্থিত' : attendance?.status === 'ABSENT' ? '❌ অনুপস্থিত' : 'N/A'}</span>
                            </Tooltip>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
