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
  const [activeTab, setActiveTab] = useState('class');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [filterType, setFilterType] = useState('dateRange');

  // Fetch classes
  const { data: classData, isLoading: isClassesLoading, error: classesError } = useGetclassConfigApiQuery();
  const classOptions = classData?.map((cls) => ({
    value: cls.id,
    label: `${cls.class_name}-${cls.section_name}-${cls.shift_name}`,
  })) || [];

  // Fetch active students
  const { data: studentData, isLoading: isStudentsLoading, error: studentsError } = useGetStudentActiveApiQuery(
    undefined,
    { skip: !selectedClass }
  );
  const students = studentData?.filter((student) => student.class_id === selectedClass?.value) || [];
  const studentOptions = students.map((student) => ({
    value: student.id,
    label: `${student.name} (ID: ${student.id})`,
  }));

  // Fetch subjects
  const { data: subjectData, isLoading: isSubjectsLoading, error: subjectsError } = useGetSubjectAssignQuery(
    { class_id: selectedClass?.value },
    { skip: !selectedClass }
  );
  const subjects = subjectData?.subjects?.[0]?.subject_details || [];

  // Fetch attendance
  const { data: attendanceData, isLoading: isAttendanceLoading, error: attendanceError } = useGetStudentSubAttendanceQuery(
    {
      class_subject_id: '',
      start_date: startDate ? startDate.toISOString().split('T')[0] : '',
      end_date: endDate ? endDate.toISOString().split('T')[0] : '',
    },
    { skip: !selectedClass || (!startDate && !endDate && !selectedMonth && activeTab === 'date') }
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

  // Filter students
  const filteredStudents = selectedStudent
    ? students.filter((student) => student.id === selectedStudent.value)
    : students.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.id?.toString().includes(searchQuery)
      );

  // Prepare attendance sheet data
  const prepareAttendanceSheet = () => {
    const sheet = [];
    subjects.forEach((subject) => {
      filteredStudents.forEach((student) => {
        const attendanceRecords = attendanceData?.attendance.filter(
          (att) => att.student === student.id && att.class_subject === subject.class_subject
        ) || [];
        attendanceRecords.forEach((att) => {
          sheet.push({
            subject: subject.name,
            studentName: student.name,
            studentId: student.id,
            date: new Date(att.created_at).toLocaleDateString('bn-BD'),
            status: att.status === 'PRESENT' ? '✅ উপস্থিত' : '❌ অনুপস্থিত',
          });
        });
        if (attendanceRecords.length === 0) {
          sheet.push({
            subject: subject.name,
            studentName: student.name,
            studentId: student.id,
            date: '-',
            status: '-',
          });
        }
      });
    });
    return sheet;
  };

  const attendanceSheet = prepareAttendanceSheet();
  const isLoading = isClassesLoading || isStudentsLoading || isSubjectsLoading || isAttendanceLoading;

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClass) {
      toast.error('অনুগ্রহ করে একটি ক্লাস নির্বাচন করুন!');
      return;
    }
    if (activeTab === 'date' && filterType === 'dateRange' && (!startDate || !endDate)) {
      toast.error('অনুগ্রহ করে তারিখের পরিসীমা নির্বাচন করুন!');
      return;
    }
    if (activeTab === 'date' && filterType === 'month' && !selectedMonth) {
      toast.error('অনুগ্রহ করে একটি মাস নির্বাচন করুন!');
      return;
    }
  };

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      <style>{customStyles}</style>
      <div className="mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-white/20 mb-6 animate-fadeIn">
          <button
            className={`flex-1 py-3 px-6 text-lg font-medium rounded-t-lg transition-all duration-300 ${
              activeTab === 'class' ? 'tab-active' : 'tab-inactive'
            }`}
            onClick={() => {
              setActiveTab('class');
              setDateRange([null, null]);
              setSelectedMonth(null);
              setSelectedStudent(null);
              setSearchQuery('');
            }}
          >
            ক্লাস অনুযায়ী উপস্থিতি
          </button>
          <button
            className={`flex-1 py-3 px-6 text-lg font-medium rounded-t-lg transition-all duration-300 ${
              activeTab === 'date' ? 'tab-active' : 'tab-inactive'
            }`}
            onClick={() => {
              setActiveTab('date');
              setSelectedStudent(null);
              setSearchQuery('');
            }}
          >
            তারিখ/মাস অনুযায়ী উপস্থিতি
          </button>
        </div>

        {/* Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <FaCalendarAlt className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              {activeTab === 'class' ? 'ক্লাস অনুযায়ী উপস্থিতি দেখুন' : 'তারিখ/মাস অনুযায়ী উপস্থিতি দেখুন'}
            </h3>
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

            {activeTab === 'date' && (
              <>
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
              </>
            )}
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
          ) : attendanceSheet.length === 0 ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              কোনো উপস্থিতি তথ্য উপলব্ধ নেই। {activeTab === 'date' ? 'তারিখ/মাস নির্বাচন করুন।' : 'ছাত্র তালিকা খালি।'}
            </p>
          ) : (
            <>
              {/* Search and Student Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 animate-fadeIn">
                <div className="relative input-icon">
                  <label className="block text-lg font-medium text-[#441a05]" htmlFor="searchStudent">
                    ছাত্র অনুসন্ধান
                  </label>
                  <FaSearch className="absolute left-3 top-[42px] text-[#DB9E30]" />
                  <input
                    id="searchStudent"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedStudent(null);
                    }}
                    placeholder="ছাত্রের নাম বা আইডি লিখুন"
                    className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 pr-3 py-2.5 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                    aria-label="ছাত্র অনুসন্ধান"
                  />
                </div>
                <div className="relative">
                  <label className="block text-lg font-medium text-[#441a05]" htmlFor="studentSelect">
                    নির্দিষ্ট ছাত্র নির্বাচন
                  </label>
                  <Select
                    id="studentSelect"
                    options={studentOptions}
                    value={selectedStudent}
                    onChange={(selected) => {
                      setSelectedStudent(selected);
                      setSearchQuery('');
                    }}
                    placeholder="ছাত্র নির্বাচন করুন"
                    classNamePrefix="react-select"
                    className="mt-1"
                    isClearable
                    isDisabled={isLoading}
                    aria-label="নির্দিষ্ট ছাত্র"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                        বিষয়
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ছাত্রের নাম
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                        তারিখ
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                        উপস্থিতি
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {attendanceSheet.map((row, index) => (
                      <tr
                        key={`${row.subject}-${row.studentId}-${row.date}-${index}`}
                        className="bg-white/5 hover:bg-white/10 transition-colors duration-200 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {row.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {row.studentName} (ID: {row.studentId})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {row.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#441a05]">
                          {row.status}
                        </td>
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