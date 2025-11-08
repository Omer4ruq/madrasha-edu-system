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
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';

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
  @keyframeskeyframes iconHover {
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
  .status-circle {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
`;

const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  LEAVE: "LEAVE",
};

const statusColors = {
  [AttendanceStatus.PRESENT]: "bg-green-500",
  [AttendanceStatus.ABSENT]: "bg-red-500",
  [AttendanceStatus.LATE]: "bg-yellow-500",
  [AttendanceStatus.LEAVE]: "bg-blue-500",
};

const statusLabels = {
  [AttendanceStatus.PRESENT]: "উপস্থিত",
  [AttendanceStatus.ABSENT]: "অনুপস্থিত",
  [AttendanceStatus.LATE]: "বিলম্ব",
  [AttendanceStatus.LEAVE]: "ছুটি",
};

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

  const { group_id } = useSelector((state) => state.auth);

  // Permissions
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_student_sub_attendance') || true;

  // Fetch institute data
  const {
    data: instituteData,
    isLoading: isInstituteLoading,
    error: instituteError,
  } = useGetInstituteLatestQuery();

  // Fetch other data
  const {
    data: classConfigData,
    isLoading: isClassesLoading,
    error: classesError,
  } = useGetclassConfigApiQuery();
  const classes = Array.isArray(classConfigData) ? classConfigData : [];
  const classOptions = classes.map((cls) => ({
    value: cls.id,
    label: `${cls.class_name}${cls.section_name ? `-${cls.section_name}` : ""}${
      cls.shift_name ? ` (${cls.shift_name})` : ""
    }`,
  }));

  const getClassId = classConfigData?.find(
    (classConfig) => classConfig?.id === selectedClass?.value
  );

  const {
    data: subjectsData,
    isLoading: isSubjectsLoading,
    error: subjectsError,
  } = useGetClassSubjectsByClassIdQuery(getClassId?.g_class_id, {
    skip: !selectedClass,
  });
  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    error: studentsError,
  } = useGetStudentActiveByClassQuery(selectedClass?.value, {
    skip: !selectedClass,
  });

  // শুধুমাত্র is_active: true বিষয়গুলো নেওয়া হবে
  const activeSubjects = useMemo(() => {
    if (!Array.isArray(subjectsData)) return [];
    return subjectsData.filter(subject => subject.is_active === true);
  }, [subjectsData]);

  const students = Array.isArray(studentsData) ? studentsData : [];

  // ছাত্রদের রোল নম্বর অনুযায়ী সর্ট করা
  const sortedStudents = useMemo(() => {
    const filtered = students.filter(
      (student) =>
        (student.name &&
          student.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (student.user_id && student.user_id.toString().includes(studentSearch))
    );

    return filtered.sort((a, b) => {
      const rollA = a.roll_no ? parseInt(a.roll_no, 10) : Infinity;
      const rollB = b.roll_no ? parseInt(b.roll_no, 10) : Infinity;
      return rollA - rollB;
    });
  }, [students, studentSearch]);

  // শুধু অ্যাক্টিভ বিষয় + সার্চ ফিল্টার
  const filteredSubjects = useMemo(() => {
    return activeSubjects.filter(
      (subject) =>
        subject.name &&
        subject.name.toLowerCase().includes(subjectSearch.toLowerCase())
    );
  }, [activeSubjects, subjectSearch]);

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

  // Format date to show only DD (e.g., ১৫)
  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("bn-BD", { day: "numeric" });
  };

  // Present Summary with color
  const presentSummary = useMemo(() => {
    if (tabValue !== 1 || !attendanceData?.attendance?.length) return {};
    const summary = {};
    sortedStudents.forEach((student) => {
      const records = attendanceData.attendance.filter(
        (rec) => rec.student === student.id
      );
      const total = records.length;
      const present = records.filter((rec) => rec.status === "PRESENT").length;
      summary[student.id] = { present, total };
    });
    return summary;
  }, [attendanceData, sortedStudents, tabValue]);

  // Render colored summary
  const renderPresentSummary = (present, total) => {
    return (
      <span>
        <span className="text-green-600 font-bold">{present}</span> /{" "}
        <span className="text-black">{total}</span>
      </span>
    );
  };

  useEffect(() => {
    if (classesError) toast.error("ক্লাস তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (subjectsError) toast.error("বিষয় তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (studentsError) toast.error("ছাত্র তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (attendanceError) toast.error("উপস্থিতি তথ্য লোড করতে ব্যর্থ হয়েছে!");
    if (instituteError) toast.error("ইনস্টিটিউট তথ্য লোড করতে ব্যর্থ হয়েছে!");
  }, [
    classesError,
    subjectsError,
    studentsError,
    attendanceError,
    instituteError,
  ]);

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

  // Generate PDF Report (Only Active Subjects)
  const generatePDFReport = () => {
    if (
      !selectedClass ||
      (tabValue === 0 && !classDate) ||
      (tabValue === 1 && filterType === "month" && !month) ||
      (tabValue === 1 && filterType === "dateRange" && (!startDate || !endDate))
    ) {
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

    const institute = instituteData;
    const printWindow = window.open("", "_blank");

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>উপস্থিতি রিপোর্ট</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { 
            font-family: 'Noto Sans Bengali', Arial, sans-serif;  
            font-size: 11px; 
            margin: 0;
            padding: 10px;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: -1;
            opacity: 0.1;
            width: 500px;
            height: 500px;
            pointer-events: none;
          }
          .watermark img {
            width: 100%;
            height: 100%;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
            font-size: 9px; 
          }
          th, td { 
            border: 1px solid #000; 
            padding: 6px; 
            text-align: center; 
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 10px; 
          }
          .institute-info h1 {
            font-size: 18px;
            margin: 0;
          }
          .institute-info p {
            font-size: 12px;
            margin: 3px 0;
          }
          .date { 
            margin-top: 15px; 
            text-align: right; 
            font-size: 9px; 
          }
          .status-circle {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
          }
          .legend {
            margin: 10px 0;
            display: flex;
            justify-content: center;
            gap: 15px;
            font-size: 10px;
          }
          .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .summary {
            font-weight: bold;
            color: #441a05;
          }
        </style>
      </head>
      <body>
      ${
        institute.institute_logo
          ? `
            <div class="watermark">
              <img src="${institute.institute_logo}" alt="Logo" />
            </div>
          `
          : `<div class="watermark"><p>লোগো লোড হয়নি</p></div>`
      }
        <div class="header">
          <div class="institute-info">
            <h1>${institute.institute_name || "অজানা ইনস্টিটিউট"}</h1>
            <p>${institute.institute_address || "ঠিকানা উপলব্ধ নয়"}</p>
          </div>
          <h2>উপস্থিতি রিপোর্ট</h2>
          <h3>ক্লাস: ${selectedClass?.label || "N/A"}</h3>
          ${
            tabValue === 0
              ? `<h3>তারিখ: ${new Date(classDate).toLocaleDateString("bn-BD")}</h3>`
              : `<h3>${
                  filterType === "month"
                    ? `মাস: ${new Date(month + "-01").toLocaleDateString("bn-BD", { month: "long", year: "numeric" })}`
                    : `তারিখের পরিসীমা: ${new Date(startDate).toLocaleDateString("bn-BD")} - ${new Date(endDate).toLocaleDateString("bn-BD")}`
                }</h3>`
          }
          ${selectedStudent ? `<h3>ছাত্র: ${selectedStudent.name || "N/A"} (রোল: ${selectedStudent.roll_no || "N/A"})</h3>` : ""}
        </div>

        <!-- Legend -->
        <div class="legend">
          ${Object.entries(statusLabels)
            .map(
              ([key, label]) => `
            <div class="legend-item">
              <span class="status-circle" style="background-color: ${
                key === "PRESENT"
                  ? "green"
                  : key === "ABSENT"
                  ? "red"
                  : key === "LATE"
                  ? "orange"
                  : "blue"
              };"></span>
              <span>${label}</span>
            </div>
          `
            )
            .join("")}
        </div>

        <table>
          <thead>
            <tr>
              ${
                tabValue === 0
                  ? `
                <th>ছাত্র</th>
                ${filteredSubjects
                  .map((subject) => `<th>${subject.name || "N/A"}</th>`)
                  .join("")}
              `
                  : selectedStudent
                  ? `
                <th>বিষয়</th>
                ${uniqueDates
                  .map((date) => `<th>${formatDateOnly(date)}</th>`)
                  .join("")}
              `
                  : `
                <th>ছাত্র</th>
                ${uniqueDates
                  .map((date) => `<th>${formatDateOnly(date)}</th>`)
                  .join("")}
              `
              }
            </tr>
          </thead>
          <tbody>
    `;

    if (tabValue === 0) {
      sortedStudents.forEach((student) => {
        htmlContent += `
          <tr>
            <td>${student.name || "N/A"} (রোল: ${student.roll_no || "N/A"})</td>
            ${filteredSubjects
              .map((subject) => {
                const attendance = attendanceData?.attendance?.find(
                  (record) =>
                    record.student === student.id &&
                    record.class_subject === subject.id &&
                    record.attendance_date === classDate
                );
                const status = attendance?.status || null;
                return `<td>
                  ${status ? `<span class="status-circle" style="background-color: ${status === 'PRESENT' ? 'green' : status === 'ABSENT' ? 'red' : status === 'LATE' ? 'orange' : 'blue'};" title="${statusLabels[status]}"></span>` : "-"}
                </td>`;
              })
              .join("")}
          </tr>
        `;
      });
    } else if (selectedStudent) {
      filteredSubjects.forEach((subject) => {
        htmlContent += `
          <tr>
            <td>${subject.name || "N/A"}</td>
            ${uniqueDates
              .map((date) => {
                const attendance = attendanceData?.attendance?.find(
                  (record) =>
                    record.student === selectedStudent.id &&
                    record.class_subject === subject.id &&
                    record.attendance_date === date
                );
                const status = attendance?.status || null;
                return `<td>
                  ${status ? `<span class="status-circle" style="background-color: ${status === 'PRESENT' ? 'green' : status === 'ABSENT' ? 'red' : status === 'LATE' ? 'orange' : 'blue'};" title="${statusLabels[status]}"></span>` : "-"}
                </td>`;
              })
              .join("")}
          </tr>
        `;
      });
    } else {
      sortedStudents.forEach((student) => {
        const { present, total } = presentSummary[student.id] || { present: 0, total: 0 };
        htmlContent += `
          <tr>
            <td>${student.name || "N/A"} (রোল: ${student.roll_no || "N/A"})</td>
            <td class="summary">
              <span style="color: green; font-weight: bold;">${present}</span> / 
              <span style="color: #555;">${total}</span>
            </td>
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
        setTimeout(() => { window.print(); }, 500);
        window.onafterprint = () => { window.close(); };
      </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const isLoading =
    isClassesLoading ||
    isSubjectsLoading ||
    isStudentsLoading ||
    isAttendanceLoading ||
    isInstituteLoading ||
    permissionsLoading;

  if (permissionsLoading) {
    return <div className="p-4 text-center">অনুমতি লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-center text-red-500">এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।</div>;
  }

  return (
    <div className="py-8 w-full relative mx-auto">
      <style>{customStyles}</style>
      <Toaster position="top-center" />

      {/* Header Card */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-2 mb-6">
          <IoAdd className="text-3xl text-[#441a05]" />
          <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
            ছাত্র উপস্থিতি
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-white/20">
          <button
            className={`px-6 py-2 font-medium rounded-t-lg transition-all ${tabValue === 0 ? "tab-active" : "tab-inactive"}`}
            onClick={() => {
              setTabValue(0);
              setMonth("");
              setStartDate("");
              setEndDate("");
              setFilterType("dateRange");
            }}
          >
            দৈনিক
          </button>
          <button
            className={`px-6 py-2 font-medium rounded-t-lg transition-all ${tabValue === 1 ? "tab-active" : "tab-inactive"}`}
            onClick={() => {
              setTabValue(1);
              setClassDate("");
            }}
          >
            মাসিক / তারিখের পরিসীমা
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {tabValue === 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                <div>
                  <label className="block text-[#441a05] sm:text-base text-xs font-medium mb-2">
                    ক্লাস নির্বাচন করুন:
                  </label>
                  <Select
                    options={classOptions}
                    value={selectedClass}
                    onChange={setSelectedClass}
                    placeholder="ক্লাস নির্বাচন করুন"
                    isLoading={isClassesLoading}
                    isClearable
                    isSearchable
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    className="animate-scaleIn"
                  />
                </div>

                <div className="relative input-icon">
                  <label className="block text-[#441a05] sm:text-base text-xs font-medium mb-2">
                    তারিখ নির্বাচন করুন:
                  </label>
                  <FaCalendarAlt
                    className="absolute left-3 top-11 text-[#DB9E30] cursor-pointer"
                    onClick={handleDateClick}
                  />
                  <input
                    type="date"
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    onClick={handleDateClick}
                    className="mt-1 block w-full bg-transparent text-[#441a05] pl-10 pr-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05] animate-scaleIn"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                <div>
                  <label className="block text-[#441a05] sm:text-base text-xs font-medium mb-2">
                    ক্লাস নির্বাচন করুন:
                  </label>
                  <Select
                    options={classOptions}
                    value={selectedClass}
                    onChange={setSelectedClass}
                    placeholder="ক্লাস নির্বাচন করুন"
                    isLoading={isClassesLoading}
                    isClearable
                    isSearchable
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    className="animate-scaleIn"
                  />
                </div>

                <div>
                  <label className="block text-[#441a05] sm:text-base text-xs font-medium mb-2">
                    ফিল্টার টাইপ:
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setMonth("");
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="mt-1 block w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05] animate-scaleIn"
                    disabled={isLoading}
                  >
                    <option value="month">মাসিক</option>
                    <option value="dateRange">তারিখের পরিসীমা</option>
                  </select>
                </div>

                {filterType === "month" ? (
                  <div className="relative input-icon">
                    <label className="block text-[#441a05] sm:text-base text-xs font-medium mb-2">
                      মাস নির্বাচন করুন:
                    </label>
                    <FaCalendarAlt
                      className="absolute left-3 top-11 text-[#DB9E30] cursor-pointer"
                      onClick={handleDateClick}
                    />
                    <input
                      type="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      onClick={handleDateClick}
                      className="mt-1 block w-full bg-transparent text-[#441a05] pl-10 pr-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05] animate-scaleIn"
                      disabled={isLoading}
                    />
                  </div>
                ) : (
                  <>
                    <div className="relative input-icon">
                      <label className="block text-[#441a05] sm:text-base text-xs font-medium">
                        শুরুর তারিখ:
                      </label>
                      <FaCalendarAlt
                        className="absolute left-3 top-10 text-[#DB9E30] cursor-pointer"
                        onClick={handleDateClick}
                      />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        onClick={handleDateClick}
                        className="mt-1 block w-full bg-transparent text-[#441a05] pl-10 pr-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05] animate-scaleIn"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="relative input-icon">
                      <label className="block text-[#441a05] sm:text-base text-xs font-medium">
                        শেষ তারিখ:
                      </label>
                      <FaCalendarAlt
                        className="absolute left-3 top-10 text-[#DB9E30] cursor-pointer"
                        onClick={handleDateClick}
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onClick={handleDateClick}
                        className="mt-1 block w-full bg-transparent text-[#441a05] pl-10 pr-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-[#441a05] animate-scaleIn"
                        disabled={isLoading}
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </form>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-4 text-sm">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="legend-item">
            <span
              className={`status-circle ${statusColors[key]}`}
              title={label}
            ></span>
            <span className="text-[#441a05]">{label}</span>
          </div>
        ))}
      </div>

      {/* Print Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={generatePDFReport}
          disabled={isLoading || !attendanceData?.attendance?.length}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            isLoading || !attendanceData?.attendance?.length
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-[#DB9E30] text-[#441a05] hover:text-white btn-glow"
          }`}
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
          {selectedStudent && (
            <button
              onClick={handleBackClick}
              className="flex items-center px-4 py-2 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 btn-ripple hover:text-white btn-glow"
            >
              <FaArrowLeft className="mr-2" />
              পিছনে ফিরুন
            </button>
          )}
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
        ) : tabValue === 1 && filterType === "dateRange" && (!startDate || !endDate) ? (
          <p className="p-4 text-[#441a05]/70 animate-scaleIn">
            অনুগ্রহ করে তারিখের পরিসীমা নির্বাচন করুন।
          </p>
        ) : (tabValue === 0 && sortedStudents.length === 0) ||
          (tabValue === 1 && !selectedStudent && sortedStudents.length === 0) ? (
          <p className="p-4 text-[#441a05]/70 animate-scaleIn">
            কোনো ছাত্র পাওয়া যায়নি।
          </p>
        ) : tabValue === 0 ? (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 animate-fadeIn">
              <div className="relative input-icon">
                <label className="block font-medium text-[#441a05]" htmlFor="searchStudent">
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
                />
              </div>
              <div className="relative input-icon">
                <label className="block font-medium text-[#441a05]" htmlFor="searchSubject">
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
                    <th key={subject.id} className="px-6 py-3 text-center text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                      {subject.name || "N/A"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {sortedStudents.map((student, index) => (
                  <tr key={student.id} className="bg-white/5 hover:bg-white/10 transition-colors duration-200 animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {student.name || "N/A"} (রোল: {student.roll_no || "N/A"})
                    </td>
                    {filteredSubjects.map((subject) => {
                      const attendance = attendanceData?.attendance?.find(
                        (record) =>
                          record.student === student.id &&
                          record.class_subject === subject.id &&
                          record.attendance_date === classDate
                      );
                      const status = attendance?.status || null;
                      return (
                        <td key={`${student.id}-${subject.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <Tooltip title={status ? statusLabels[status] : ""}>
                            <span className={`status-circle ${status ? statusColors[status] : "bg-gray-400"}`}></span>
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
                <label className="block font-medium text-[#441a05]" htmlFor="searchSubject">
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
                    <th key={date} className="px-6 py-3 text-center text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                      {formatDateOnly(date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredSubjects.map((subject, index) => (
                  <tr key={subject.id} className="bg-white/5 hover:bg-white/10 transition-colors duration-200 animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
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
                      const status = attendance?.status || null;
                      return (
                        <td key={`${subject.id}-${date}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <Tooltip title={status ? statusLabels[status] : ""}>
                            <span className={`status-circle ${status ? statusColors[status] : "bg-gray-400"}`}></span>
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
                <label className="block font-medium text-[#441a05]" htmlFor="searchStudent">
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
                />
              </div>
            </div>
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[#441a05] uppercase tracking-wider">
                    ছাত্র
                  </th>
                  {uniqueDates.map((date) => (
                    <th key={date} className="px-6 py-3 text-center text-sm font-medium text-[#441a05] uppercase tracking-wider">
                      {formatDateOnly(date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {sortedStudents.map((student, index) => {
                  const { present, total } = presentSummary[student.id] || { present: 0, total: 0 };
                  return (
                    <tr key={student.id} className="bg-white/5 hover:bg-white/10 transition-colors duration-200 animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05] cursor-pointer hover:underline"
                        onClick={() => handleStudentClick(student)}
                      >
                        {student.name || "N/A"} (রোল: {student.roll_no || "N/A"})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-[#441a05]">
                        {renderPresentSummary(present, total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;