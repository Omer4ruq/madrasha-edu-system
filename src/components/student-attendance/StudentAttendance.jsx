import React, { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import {
  FaSearch,
  FaCalendarAlt,
  FaSpinner,
  FaArrowLeft,
  FaFilePdf,
} from "react-icons/fa";
import { IoAdd } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { Tooltip } from "@mui/material";
import selectStyles from "../../utilitis/selectStyles";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetClassSubjectsByClassIdQuery } from "../../redux/features/api/class-subjects/classSubjectsApi";
import { useGetStudentActiveByClassQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetStudentSubAttendanceQuery } from "../../redux/features/api/student-sub-attendance/studentSubAttendanceApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";

// Custom CSS
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
  const [tabValue, setTabValue] = useState(0);
  const [selectedClass, setSelectedClass] = useState(null);
  const [month, setMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classDate, setClassDate] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [filterType, setFilterType] = useState("dateRange");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch institute data
  const { data: instituteData, isLoading: isInstituteLoading, error: instituteError } = useGetInstituteLatestQuery();

  // Fetch other data
  const {
    data: classConfigData,
    isLoading: isClassesLoading,
    error: classesError,
  } = useGetclassConfigApiQuery();
  const classes = Array.isArray(classConfigData) ? classConfigData : [];
  const classOptions = classes.map((cls) => ({
    value: cls.id,
    label: `${cls.class_name}-${cls.section_name} (${cls.shift_name})`,
  }));

  const getClassId = classConfigData?.find(
    (classConfig) => classConfig?.id === selectedClass?.value
  );

  const {
    data: subjectsData,
    isLoading: isSubjectsLoading,
    error: subjectsError,
  } = useGetClassSubjectsByClassIdQuery(getClassId?.class_id, {
    skip: !selectedClass,
  });
  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    error: studentsError,
  } = useGetStudentActiveByClassQuery(selectedClass?.value, {
    skip: !selectedClass,
  });
  const subjects = Array.isArray(subjectsData) ? subjectsData : [];
  const students = Array.isArray(studentsData) ? studentsData : [];

  const studentOptions = useMemo(() => {
    return students.map((student) => ({
      value: student.id,
      label: `${student.name || "N/A"} (ID: ${student.user_id || "N/A"})`,
      student,
    }));
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!students.length) return [];
    return students.filter(
      (student) =>
        (student.name &&
          student.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (student.user_id && student.user_id.toString().includes(studentSearch))
    );
  }, [students, studentSearch]);

  const filteredSubjects = useMemo(() => {
    if (!subjects.length) return [];
    return subjects.filter(
      (subject) =>
        subject.name &&
        subject.name.toLowerCase().includes(subjectSearch.toLowerCase())
    );
  }, [subjects, subjectSearch]);

  const attendanceQueryParams = {
    class_id: selectedClass?.value,
    ...(tabValue === 0 && classDate ? { date: classDate } : {}),
    ...(tabValue === 1 && filterType === "month" && month ? { month } : {}),
    ...(tabValue === 1 && filterType === "dateRange" && startDate && endDate
      ? { start_date: startDate, end_date: endDate }
      : {}),
  };
  const {
    data: attendanceData,
    isLoading: isAttendanceLoading,
    error: attendanceError,
  } = useGetStudentSubAttendanceQuery(attendanceQueryParams, {
    skip:
      !selectedClass ||
      (tabValue === 0 && !classDate) ||
      (tabValue === 1 && filterType === "month" && !month) ||
      (tabValue === 1 &&
        filterType === "dateRange" &&
        (!startDate || !endDate)),
  });

  const uniqueDates = useMemo(() => {
    if (!attendanceData?.attendance?.length) return [];
    let dates = [
      ...new Set(
        attendanceData.attendance.map((record) => record.attendance_date)
      ),
    ].sort();
    if (selectedStudent) {
      dates = dates.filter((date) =>
        attendanceData.attendance.some(
          (record) =>
            record.student === selectedStudent.id &&
            record.attendance_date === date
        )
      );
    }
    if (tabValue === 1 && filterType === "month" && month) {
      const [year, monthNum] = month.split("-").map(Number);
      return dates.filter((date) => {
        const d = new Date(date);
        return d.getFullYear() === year && d.getMonth() + 1 === monthNum;
      });
    }
    if (tabValue === 1 && filterType === "dateRange" && startDate && endDate) {
      return dates.filter((date) => date >= startDate && date <= endDate);
    }
    return dates;
  }, [
    attendanceData,
    selectedStudent,
    filterType,
    month,
    startDate,
    endDate,
    tabValue,
  ]);

  useEffect(() => {
    if (classesError) toast.error("ক্লাস তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (subjectsError) toast.error("বিষয় তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (studentsError) toast.error("ছাত্র তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (attendanceError) toast.error("উপস্থিতি তথ্য লোড করতে ব্যর্থ হয়েছে!");
    if (instituteError) toast.error("ইনস্টিটিউট তথ্য লোড করতে ব্যর্থ হয়েছে!");
  }, [classesError, subjectsError, studentsError, attendanceError, instituteError]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClass) {
      toast.error("অনুগ্রহ করে একটি ক্লাস নির্বাচন করুন!");
      return;
    }
    if (tabValue === 0 && !classDate) {
      toast.error("অনুগ্রহ করে একটি তারিখ নির্বাচন করুন!");
      return;
    }
    if (tabValue === 1 && filterType === "month" && !month) {
      toast.error("অনুগ্রহ করে একটি মাস নির্বাচন করুন!");
      return;
    }
    if (
      tabValue === 1 &&
      filterType === "dateRange" &&
      (!startDate || !endDate)
    ) {
      toast.error("অনুগ্রহ করে তারিখের পরিসীমা নির্বাচন করুন!");
      return;
    }
  };

  const handleDateClick = (e) => {
    if (e.target.type === "date" || e.target.type === "month") {
      e.target.showPicker();
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const handleBackClick = () => {
    setSelectedStudent(null);
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    if (!selectedClass || (tabValue === 0 && !classDate) || (tabValue === 1 && filterType === "month" && !month) || (tabValue === 1 && filterType === "dateRange" && (!startDate || !endDate))) {
      toast.error("অনুগ্রহ করে সমস্ত প্রয়োজনীয় ফিল্ড পূরণ করুন!");
      return;
    }

    if (!attendanceData?.attendance?.length) {
      toast.error("কোনো উপস্থিতি তথ্য পাওয়া যায়নি!");
      return;
    }

    if (isInstituteLoading) {
      toast.error("ইনস্টিটিউট তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন!");
      return;
    }

    if (!instituteData) {
      toast.error("ইনস্টিটিউট তথ্য পাওয়া যায়নি!");
      return;
    }

    const institute = instituteData; // Assuming the first institute is used
    const printWindow = window.open("", "_blank");

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>উপস্থিতি রিপোর্ট</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4 landscape; }
          body { 
            font-family: 'Noto Sans Bengali', Arial, sans-serif;  
            font-size: 12px; 
              margin:0;
            padding:0;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            font-size: 10px; 
          }
          th, td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: center; 
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold; 
            font-size: 10px; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 10px; 
          }
          .institute-info {
            margin-bottom: 10px;
          }
          .institute-info h1 {
            font-size: 20px;
            margin: 0;
          }
          .institute-info p {
            font-size: 14px;
            margin: 5px 0;
          }
          .date { 
            margin-top: 20px; 
            text-align: right; 
            font-size: 10px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="institute-info">
            <h1>${institute.institute_name || "অজানা ইনস্টিটিউট"}</h1>
            <p>${institute.institute_address || "ঠিকানা উপলব্ধ নয়"}</p>
          </div>
          <h2>উপস্থিতি রিপোর্ট</h2>
          <h3>ক্লাস: ${selectedClass?.label || "N/A"}</h3>
          ${tabValue === 0 ? `<h3>তারিখ: ${new Date(classDate).toLocaleDateString("bn-BD")}</h3>` : `<h3>${filterType === "month" ? `মাস: ${new Date(month + "-01").toLocaleDateString("bn-BD", { month: "long", year: "numeric" })}` : `তারিখের পরিসীমা: ${new Date(startDate).toLocaleDateString("bn-BD")} - ${new Date(endDate).toLocaleDateString("bn-BD")}`}</h3>`}
          ${selectedStudent ? `<h3>ছাত্র: ${selectedStudent.name || "N/A"} (ID: ${selectedStudent.user_id || "N/A"})</h3>` : ""}
        </div>
        <table>
          <thead>
            <tr>
              ${tabValue === 0 ? `
                <th>ছাত্র</th>
                ${filteredSubjects.map((subject) => `<th>${subject.name || "N/A"}</th>`).join("")}
              ` : selectedStudent ? `
                <th>বিষয়</th>
                ${uniqueDates.map((date) => `<th>${new Date(date).toLocaleDateString("bn-BD")}</th>`).join("")}
              ` : `
                <th>ছাত্র</th>
                ${uniqueDates.map((date) => `<th>${new Date(date).toLocaleDateString("bn-BD")}</th>`).join("")}
              `}
            </tr>
          </thead>
          <tbody>
    `;

    if (tabValue === 0) {
      filteredStudents.forEach((student) => {
        htmlContent += `
          <tr>
            <td>${student.name || "N/A"} (Roll: ${student.roll_no || "N/A"})</td>
            ${filteredSubjects.map((subject) => {
              const attendance = attendanceData?.attendance?.find(
                (record) =>
                  record.student === student.id &&
                  record.class_subject === subject.id &&
                  record.attendance_date === classDate
              );
              return `<td>${attendance?.status === "PRESENT" ? "উপস্থিত" : attendance?.status === "ABSENT" ? "অনুপস্থিত" : "N/A"}${attendance?.remarks ? ` (${attendance.remarks})` : ""}</td>`;
            }).join("")}
          </tr>
        `;
      });
    } else if (selectedStudent) {
      filteredSubjects.forEach((subject) => {
        htmlContent += `
          <tr>
            <td>${subject.name || "N/A"}</td>
            ${uniqueDates.map((date) => {
              const attendance = attendanceData?.attendance?.find(
                (record) =>
                  record.student === selectedStudent.id &&
                  record.class_subject === subject.id &&
                  record.attendance_date === date
              );
              return `<td>${attendance?.status === "PRESENT" ? "উপস্থিত" : attendance?.status === "ABSENT" ? "অনুপস্থিত" : "N/A"}${attendance?.remarks ? ` (${attendance.remarks})` : ""}</td>`;
            }).join("")}
          </tr>
        `;
      });
    } else {
      filteredStudents.forEach((student) => {
        htmlContent += `
          <tr>
            <td>${student.name || "N/A"} (ID: ${student.user_id || "N/A"})</td>
            ${uniqueDates.map((date) => {
              const attendance = attendanceData?.attendance?.find(
                (record) =>
                  record.student === student.id &&
                  record.attendance_date === date
              );
              return `<td>${attendance?.status === "PRESENT" ? "উপস্থিত" : attendance?.status === "ABSENT" ? "অনুপস্থিত" : "N/A"}${attendance?.remarks ? ` (${attendance.remarks})` : ""}</td>`;
            }).join("")}
          </tr>
        `;
      });
    }

    htmlContent += `
          </tbody>
        </table>
        <div class="date">
          রিপোর্ট তৈরির তারিখ: ${new Date().toLocaleDateString("bn-BD")}
        </div>
        <script>
          let printAttempted = false;
          window.onbeforeprint = () => {
            printAttempted = true;
          };
          window.onafterprint = () => {
            window.close();
          };
          window.addEventListener('beforeunload', (event) => {
            if (!printAttempted) {
              window.close();
            }
          });
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
    
    toast.success("PDF রিপোর্ট তৈরি হয়েছে!");
  };

  const isLoading =
    isClassesLoading ||
    isSubjectsLoading ||
    isStudentsLoading ||
    isAttendanceLoading ||
    isInstituteLoading;

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      <style>{customStyles}</style>
      <div className="mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-white/20 mb-6 animate-fadeIn">
          <button
            className={`flex-1 py-3 px-6 sm:text-lg font-medium rounded-t-lg text-sm transition-all duration-300 ${tabValue === 0 ? "tab-active" : "tab-inactive"}`}
            onClick={() => {
              setTabValue(0);
              setMonth("");
              setStartDate("");
              setEndDate("");
              setStudentSearch("");
              setSubjectSearch("");
              setClassDate("");
              setFilterType("dateRange");
              setSelectedStudent(null);
            }}
            aria-label="ক্লাস অনুযায়ী উপস্থিতি"
            title="ক্লাস অনুযায়ী উপস্থিতি দেখুন / View attendance by class"
          >
            ক্লাস অনুযায়ী উপস্থিতি
          </button>
          <button
            className={`flex-1 py-3 px-6 lg:text-lg text-sm font-medium rounded-t-lg transition-all duration-300 ${tabValue === 1 ? "tab-active" : "tab-inactive"}`}
            onClick={() => {
              setTabValue(1);
              setStudentSearch("");
              setSubjectSearch("");
              setClassDate("");
              setSelectedStudent(null);
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
            <FaCalendarAlt className="text-3xl text-[#441a05]" />
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              {tabValue === 0
                ? "ক্লাস অনুযায়ী উপস্থিতি দেখুন"
                : "তারিখ/মাস অনুযায়ী উপস্থিতি দেখুন"}
            </h3>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* ক্লাস নির্বাচন */}
            <div className="relative">
              <label htmlFor="classSelect" className="block font-medium text-[#441a05]">
                ক্লাস নির্বাচন <span className="text-red-600">*</span>
              </label>
              <Select
                id="classSelect"
                options={classOptions}
                value={selectedClass}
                onChange={(option) => {
                  setSelectedClass(option);
                  setSelectedStudent(null);
                }}
                placeholder="ক্লাস নির্বাচন"
                classNamePrefix="react-select"
                className="mt-1"
                isClearable
                isDisabled={isLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="ক্লাস নির্বাচন"
              />
            </div>

            {/* তারিখ নির্বাচন */}
            {tabValue === 0 && (
              <div className="relative input-icon">
                <label htmlFor="classDate" className="block font-medium text-[#441a05]">
                  তারিখ নির্বাচন <span className="text-red-600">*</span>
                </label>
                <input
                  id="classDate"
                  type="date"
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  onClick={handleDateClick}
                  className="mt-1 block w-full bg-transparent text-[#441a05] pl-10 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#441a05] focus:ring-[#441a05] transition-all duration-300"
                  required
                  disabled={isLoading}
                  aria-label="তারিখ নির্বাচন"
                />
                <FaCalendarAlt className="absolute left-3 top-[42px] text-[#DB9E30]" />
              </div>
            )}

            {/* ছাত্র নির্বাচন ও ফিল্টার */}
            {tabValue === 1 && (
              <>
                <div className="relative">
                  <label htmlFor="studentSelect" className="block font-medium text-[#441a05]">
                    ছাত্র নির্বাচন
                  </label>
                  <Select
                    id="studentSelect"
                    options={studentOptions}
                    value={studentOptions.find((option) => option.value === selectedStudent?.id)}
                    onChange={(option) => setSelectedStudent(option?.student || null)}
                    placeholder="ছাত্র নির্বাচন"
                    classNamePrefix="react-select"
                    className="mt-1"
                    isClearable
                    isDisabled={isLoading || !selectedClass}
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isSearchable
                    filterOption={(option, inputValue) =>
                      option.label.toLowerCase().includes(inputValue.toLowerCase())
                    }
                    aria-label="ছাত্র নির্বাচন"
                  />
                </div>

                <div className="relative input-icon col-span-2">
                  <label htmlFor="filterType" className="block font-medium text-[#441a05]">
                    ফিল্টার প্রকার
                  </label>
                  <select
                    id="filterType"
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setMonth("");
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="mt-1 block w-full bg-transparent text-[#441a05] pl-10 py-2.5 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#441a05] focus:ring-[#441a05] transition-all duration-300"
                    disabled={isLoading}
                    aria-label="ফিল্টার প্রকার"
                  >
                    <option value="dateRange">তারিখের পরিসীমা</option>
                    <option value="month">মাস</option>
                  </select>
                  <FaCalendarAlt className="absolute left-3 top-[42px] text-[#DB9E30]" />
                </div>

                <div className="relative input-icon col-span-2">
                  <label className="block font-medium text-[#441a05]">
                    {filterType === "month" ? "মাস নির্বাচন করুন" : "তারিখের পরিসীমা"}
                  </label>
                  {filterType === "month" ? (
                    <input
                      id="monthPicker"
                      type="month"
                      value={month}
                      onChange={(e) => {
                        setMonth(e.target.value);
                        setStartDate("");
                        setEndDate("");
                      }}
                      onClick={handleDateClick}
                      className="mt-1 block w-full bg-transparent text-[#441a05] pl-10 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#441a05] focus:ring-[#441a05] transition-all duration-300"
                      disabled={isLoading}
                      aria-label="মাস নির্বাচন"
                    />
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        id="startDatePicker"
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setMonth("");
                        }}
                        onClick={handleDateClick}
                        className="block w-full bg-transparent text-[#441a05] pl-10 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#441a05] focus:ring-[#441a05] transition-all duration-300"
                        aria-label="শুরুর তারিখ"
                      />
                      <input
                        id="endDatePicker"
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setMonth("");
                        }}
                        onClick={handleDateClick}
                        className="block w-full bg-transparent text-[#441a05] pl-10 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#441a05] focus:ring-[#441a05] transition-all duration-300"
                        aria-label="শেষের তারিখ"
                      />
                    </div>
                  )}
                  <FaCalendarAlt className="absolute left-3 top-[42px] text-[#DB9E30]" />
                </div>

                <div className="sm:flex items-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex items-center text-nowrap justify-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn btn-ripple ${isLoading ? "cursor-not-allowed opacity-70" : "hover:text-white btn-glow"}`}
                    aria-label="উপস্থিতি দেখুন"
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
              </>
            )}
          </form>
        </div>

        {/* Print Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={generatePDFReport}
            disabled={isLoading || !attendanceData?.attendance?.length}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isLoading || !attendanceData?.attendance?.length ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-[#DB9E30] text-[#441a05] hover:text-white btn-glow"}`}
            aria-label="PDF রিপোর্ট ডাউনলোড"
            title="PDF রিপোর্ট ডাউনলোড করুন / Download PDF report"
          >
            <FaFilePdf className="text-lg" />
            <span>PDF রিপোর্ট</span>
          </button>
        </div>

        {/* Attendance Table */}
        <div className="bg-black/10 px-6 py-2 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn table-container border border-white/20">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-[#441a05]">
              {selectedStudent
                ? `${selectedStudent.name || "N/A"} এর উপস্থিতি বিস্তারিত`
                : "উপস্থিতি তালিকা"}
            </h3>
            {/* {selectedStudent && (
              <button
                onClick={handleBackClick}
                className="flex items-center px-4 py-2 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 btn-ripple hover:text-white btn-glow"
                aria-label="পিছনে ফিরুন"
                title="পিছনে ফিরুন / Back to main table"
              >
                <FaArrowLeft className="mr-2" />
                পিছনে ফিরুন
              </button>
            )} */}
          </div>
          {isLoading ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              <FaSpinner className="animate-spin text-lg mr-2" />
              উপস্থিতি লোড হচ্ছে...
            </p>
          ) : !selectedClass ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              অনুগ্রহ করে একটি ক্লাস নির্বাচন করুন।
            </p>
          ) : tabValue === 0 && !classDate ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              অনুগ্রহ করে একটি তারিখ নির্বাচন করুন।
            </p>
          ) : tabValue === 1 && filterType === "month" && !month ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              অনুগ্রহ করে একটি মাস নির্বাচন করুন।
            </p>
          ) : tabValue === 1 &&
            filterType === "dateRange" &&
            (!startDate || !endDate) ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              অনুগ্রহ করে তারিখের পরিসীমা নির্বাচন করুন।
            </p>
          ) : (tabValue === 0 && filteredStudents.length === 0) ||
            (tabValue === 1 &&
              !selectedStudent &&
              filteredStudents.length === 0) ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn">
              কোনো ছাত্র পাওয়া যায়নি।
            </p>
          ) : tabValue === 0 ? (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 animate-fadeIn">
                <div className="relative input-icon">
                  <label
                    className="block font-medium text-[#441a05]"
                    htmlFor="searchStudent"
                  >
                    ছাত্র অনুসন্ধান
                  </label>
                  <FaSearch className="absolute left-3 top-[42px] text-[#DB9E30]" />
                  <input
                    id="searchStudent"
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="ছাত্রের নাম বা আইডি লিখুন"
                    className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 pr-3 py-2.5 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05]"
                    disabled={isLoading}
                    aria-label="ছাত্র অনুসন্ধান"
                    title="ছাত্র অনুসন্ধান / Search student"
                  />
                </div>
                <div className="relative input-icon">
                  <label
                    className="block font-medium text-[#441a05]"
                    htmlFor="searchSubject"
                  >
                    বিষয় অনুসন্ধান
                  </label>
                  <FaSearch className="absolute left-3 top-[42px] text-[#DB9E30]" />
                  <input
                    id="searchSubject"
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
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
                    {filteredSubjects.map((subject) => (
                      <th
                        key={subject.id}
                        className="px-6 py-3 text-center text-sm font-medium text-[#441a05]/70 uppercase tracking-wider"
                      >
                        {subject.name || "N/A"}
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
                        {student.name || "N/A"} (Roll: ${student.roll_no || "N/A"})
                      </td>
                      {filteredSubjects.map((subject) => {
                        const attendance = attendanceData?.attendance?.find(
                          (record) =>
                            record.student === student.id &&
                            record.class_subject === subject.id &&
                            record.attendance_date === classDate
                        );
                        return (
                          <td
                            key={`${student.id}-${subject.id}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-center text-[#441a05]"
                          >
                            <Tooltip title={attendance?.remarks || ""}>
                              <span>
                                {attendance?.status === "PRESENT"
                                  ? "✅ উপস্থিত"
                                  : attendance?.status === "ABSENT"
                                    ? "❌ অনুপস্থিত"
                                    : "N/A"}
                              </span>
                            </Tooltip>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedStudent ? (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 animate-fadeIn">
                <div className="relative input-icon col-span-2">
                  <label
                    className="block font-medium text-[#441a05]"
                    htmlFor="searchSubject"
                  >
                    বিষয় অনুসন্ধান
                  </label>
                  <FaSearch className="absolute left-3 top-[42px] text-[#DB9E30]" />
                  <input
                    id="searchSubject"
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
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
                    {uniqueDates.map((date) => (
                      <th
                        key={date}
                        className="px-6 py-3 text-center text-sm font-medium text-[#441a05]/70 uppercase tracking-wider"
                      >
                        {new Date(date).toLocaleDateString("bn-BD")}
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
                        {subject.name || "N/A"}
                      </td>
                      {uniqueDates.map((date) => {
                        const attendance = attendanceData?.attendance?.find(
                          (record) =>
                            record.student === selectedStudent.id &&
                            record.class_subject === subject.id &&
                            record.attendance_date === date
                        );
                        return (
                          <td
                            key={`${subject.id}-${date}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-center text-[#441a05]"
                          >
                            <Tooltip title={attendance?.remarks || ""}>
                              <span>
                                {attendance?.status === "PRESENT"
                                  ? "✅ উপস্থিত"
                                  : attendance?.status === "ABSENT"
                                    ? "❌ অনুপস্থিত"
                                    : "N/A"}
                              </span>
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
                  <label
                    className="block font-medium text-[#441a05]"
                    htmlFor="searchStudent"
                  >
                    ছাত্র অনুসন্ধান
                  </label>
                  <FaSearch className="absolute left-3 top-[42px] text-[#DB9E30]" />
                  <input
                    id="searchStudent"
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="ছাত্রের নাম বা আইডি লিখুন"
                    className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-10 pr-3 py-2.5 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05]"
                    disabled={isLoading}
                    aria-label="ছাত্র অনুসন্ধান"
                    title="ছাত্র অনুসন্ধান / Search student"
                  />
                </div>
                <div className="relative input-icon">
                  <label
                    className="block font-medium text-[#441a05]"
                    htmlFor="searchSubject"
                  >
                    বিষয় অনুসন্ধান
                  </label>
                  <FaSearch className="absolute left-3 top-[42px] text-[#DB9E30]" />
                  <input
                    id="searchSubject"
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
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
                        {new Date(date).toLocaleDateString("bn-BD")}
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
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05] cursor-pointer hover:underline"
                        onClick={() => handleStudentClick(student)}
                      >
                        {student.name || "N/A"} (ID: ${student.user_id || "N/A"})
                      </td>
                      {uniqueDates.map((date) => {
                        const attendance = attendanceData?.attendance?.find(
                          (record) =>
                            record.student === student.id &&
                            record.attendance_date === date
                        );
                        return (
                          <td
                            key={`${student.id}-${date}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-center text-[#441a05]"
                          >
                            <Tooltip title={attendance?.remarks || ""}>
                              <span>
                                {attendance?.status === "PRESENT"
                                  ? "✅ উপস্থিত"
                                  : attendance?.status === "ABSENT"
                                    ? "❌ অনুপস্থিত"
                                    : "N/A"}
                              </span>
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