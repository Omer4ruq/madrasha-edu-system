import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { FaSearch, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import { IoAdd } from 'react-icons/io5';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast, { Toaster } from 'react-hot-toast';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetSubjectAssignQuery } from '../../redux/features/api/subject-assign/subjectAssignApi';
import { useGetStudentSubAttendanceQuery } from '../../redux/features/api/student-sub-attendance/studentSubAttendanceApi';

// Custom CSS for animations and styling
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
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-select__control {
    background-color: transparent;
    border-color: #9d9087;
    color: #441a05;
  }
  .react-select__menu {
    background-color: rgba(255, 255, 255, 0.95);
    color: #441a05;
  }
  .react-select__option--is-focused {
    background-color: #DB9E30 !important;
    color: #441a05;
  }
  .react-select__option--is-selected {
    background-color: #DB9E30 !important;
    color: #441a05;
  }
  .table-container {
    max-height: 60vh;
    overflow-y: auto;
  }
`;

const StudentAttendance = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [filterType, setFilterType] = useState('dateRange');

  // Fetch classes using classConfigApi
  const { data: classData, isLoading: isClassesLoading, error: classesError } = useGetclassConfigApiQuery();
  const classOptions = classData?.map((cls) => ({
    value: cls.id,
    label: `${cls.class_name}-${cls.section_name}-${cls.shift_name}`,
  })) || [];

  // Fetch active students using studentActiveApi
  const { data: studentData, isLoading: isStudentsLoading, error: studentsError } = useGetStudentActiveApiQuery(
    undefined,
    { skip: !selectedClass }
  );
  const students = studentData?.filter((student) => student.class_id === selectedClass?.value) || [];

  // Fetch subjects using subjectAssignApi
  const { data: subjectData, isLoading: isSubjectsLoading, error: subjectsError } = useGetSubjectAssignQuery(
    { class_id: selectedClass?.value },
    { skip: !selectedClass }
  );


  console.log('subjectData',subjectData)

  // Fetch attendance using studentSubAttendanceApi
  const { data: attendanceData, isLoading: isAttendanceLoading, error: attendanceError } = useGetStudentSubAttendanceQuery(
    {
      class_subject_id: '',
      start_date: startDate ? startDate.toISOString().split('T')[0] : '',
      end_date: endDate ? endDate.toISOString().split('T')[0] : '',
    },
    { skip: !selectedClass || (!startDate && !endDate && !selectedMonth) }
  );

  // Handle month selection
  useEffect(() => {
    if (selectedMonth && filterType === 'month') {
      const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
      setDateRange([start, end]);
    }
  }, [selectedMonth, filterType]);

  // Handle errors
  useEffect(() => {
    if (classesError) toast.error('ক্লাস তালিকা লোড করতে ব্যর্থ হয়েছে!');
    if (studentsError) toast.error('ছাত্র তালিকা লোড করতে ব্যর্থ হয়েছে!');
    if (subjectsError) toast.error('বিষয় তালিকা লোড করতে ব্যর্থ হয়েছে!');
    if (attendanceError) toast.error('উপস্থিতি তথ্য লোড করতে ব্যর্থ হয়েছে!');
  }, [classesError, studentsError, subjectsError, attendanceError]);

  // Filter students based on search query
  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id?.toString().includes(searchQuery)
  );

  // Prepare attendance sheet data
  const subjects = subjectData?.subjects?.[0]?.subject_details || [];
  const attendanceSheet = subjects.map((subject) => {
    const row = { subject: subject.name, subjectId: subject.class_subject, attendance: {} };
    filteredStudents.forEach((student) => {
      const attendance = attendanceData?.attendance.find(
        (att) => att.student === student.id && att.class_subject === subject.class_subject
      );
      row.attendance[student.id] = attendance
        ? {
            status: attendance.status === 'PRESENT' ? '✅' : '❌',
            date: new Date(attendance.created_at).toLocaleDateString('bn-BD'),
          }
        : { status: '-', date: '-' };
    });
    return row;
  });

  const isLoading = isClassesLoading || isStudentsLoading || isSubjectsLoading || isAttendanceLoading;

  // Handle form submission to fetch attendance
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClass) {
      toast.error('অনুগ্রহ করে একটি ক্লাস নির্বাচন করুন!');
      return;
    }
    if (filterType === 'dateRange' && (!startDate || !endDate)) {
      toast.error('অনুগ্রহ করে তারিখের পরিসীমা নির্বাচন করুন!');
      return;
    }
    if (filterType === 'month' && !selectedMonth) {
      toast.error('অনুগ্রহ করে একটি মাস নির্বাচন করুন!');
      return;
    }
    // Data fetching is handled by the query hooks
  };

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      <style>{customStyles}</style>
      <div className="mx-auto">
        {/* Form to Select Class and Date */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <FaCalendarAlt className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">ছাত্র উপস্থিতি দেখুন</h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                aria-label="ক্লাস নির্বাচন"
              />
            </div>

            {/* Filter Type Selection */}
            <div className="relative input-icon">
              <label className="block text-lg font-medium text-[#441a05]" htmlFor="filterType">
                ফিল্টার প্রকার
              </label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setDateRange([null, null]);
                  setSelectedMonth(null);
                }}
                className="mt-1 block w-full bg-transparent text-[#441a05] pl-10 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isLoading}
                aria-label="ফিল্টার প্রকার"
              >
                <option value="dateRange">তারিখের পরিসীমা</option>
                <option value="month">মাস</option>
              </select>
              <FaCalendarAlt className="absolute left-3 top-[42px] text-[#DB9E30]" />
            </div>

            {/* Date Range or Month Picker */}
            <div className="relative input-icon">
              <label className="block text-lg font-medium text-[#441a05]" htmlFor="datePicker">
                {filterType === 'dateRange' ? 'তারিখের পরিসীমা' : 'মাস নির্বাচন করুন'}
              </label>
              {filterType === 'dateRange' ? (
                <DatePicker
                  id="datePicker"
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  isClearable
                  className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholderText="তারিখের পরিসীমা নির্বাচন করুন"
                  disabled={isLoading}
                  aria-label="তারিখের পরিসীমা"
                />
              ) : (
                <DatePicker
                  id="datePicker"
                  selected={selectedMonth}
                  onChange={(date) => setSelectedMonth(date)}
                  showMonthYearPicker
                  dateFormat="MMMM yyyy"
                  isClearable
                  className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholderText="মাস নির্বাচন করুন"
                  disabled={isLoading}
                  aria-label="মাস নির্বাচন"
                />
              )}
              <FaCalendarAlt className="absolute left-3 top-[42px] text-[#DB9E30]" />
            </div>

            {/* <button
              type="submit"
              disabled={isLoading}
              title="উপস্থিতি দেখুন"
              className={`relative inline-flex items-center px-8 py-2 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isLoading ? 'cursor-not-allowed opacity-60' : 'hover:text-white btn-glow'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>লোড হচ্ছে...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>উপস্থিতি দেখুন</span>
                </span>
              )}
            </button> */}
          </form>
        </div>

        {/* Attendance Table */}
        <div className="bg-black/10 px-6 py-2 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] border border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">উপস্থিতি তালিকা</h3>
          {isLoading ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              <FaSpinner className="animate-spin text-lg mr-2" />
              উপস্থিতি লোড হচ্ছে...
            </p>
          ) : attendanceSheet.length === 0 ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              কোনো উপস্থিতি তথ্য উপলব্ধ নেই। ক্লাস এবং তারিখ/মাস নির্বাচন করুন।
            </p>
          ) : (
            <>
              {/* Search Bar (Visible only if data exists) */}
              <div className="relative input-icon p-4 animate-fadeIn ">
                <label className="block text-lg font-medium text-[#441a05]" htmlFor="searchStudent">
                  ছাত্র অনুসন্ধান
                </label>
                <FaSearch className="absolute left-7 top-[64px] text-[#DB9E30]" />
                <input
                  id="searchStudent"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ছাত্রের নাম বা আইডি লিখুন"
                  className="mt-2 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  aria-label="ছাত্র অনুসন্ধান"
                />
              </div>

              <div className="overflow-x-auto table-container">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        বিষয়
                      </th>
                      {filteredStudents.map((student) => (
                        <th
                          key={student.id}
                          className="px-6 py-3 text-center text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
                        >
                          {student.name} (ID: {student.id})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {attendanceSheet.map((row, index) => (
                      <tr
                        key={row.subjectId}
                        className="bg-white/5 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {row.subject}
                        </td>
                        {filteredStudents.map((student) => (
                          <td
                            key={student.id}
                            className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05] text-center"
                          >
                            {row.attendance[student.id].status}
                            <br />
                            <span className="text-[#441a05]/70 text-xs">
                              {row.attendance[student.id].date}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;