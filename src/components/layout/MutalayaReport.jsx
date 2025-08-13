import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { Toaster, toast } from "react-hot-toast";
import { FaSpinner, FaDownload } from "react-icons/fa";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetStudentActiveByClassQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetClassSubjectsByClassIdQuery } from "../../redux/features/api/class-subjects/classSubjectsApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";
import selectStyles from "../../utilitis/selectStyles";

// Simulate marks data (replace with actual marks API when available)
const simulateMarks = () => {
  return [];
};

// Generate dynamic dates based on date range
const generateDynamicDates = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) return [];

  const dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const bnDate = d.toLocaleDateString("bn-BD", { day: "numeric" });
    const bnDay = d.toLocaleDateString("bn-BD", { weekday: "long" });
    dates.push({ day: bnDay, date: bnDate });
  }
  return dates;
};

const MutalayaReport = () => {
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dynamicReportData, setDynamicReportData] = useState([]);

  // Simulate attendance data
  const simulateAttendance = (studentId, subjectName, dynamicDates) => {
    const attendance = {};
    dynamicDates.forEach((d) => {
      attendance[d.date] = {
        sobok: Math.random() > 0.3 ? "✓" : Math.floor(Math.random() * 10).toString(),
        mutalaya: Math.random() > 0.5 ? "✓" : Math.random() > 0.7 ? "১/২" : "",
      };
    });
    return attendance;
  };

  // Fetch APIs
  const { data: classConfigs = [], isLoading: classConfigsLoading } = useGetclassConfigApiQuery();
  const { data: students = [], isLoading: studentsLoading } = useGetStudentActiveByClassQuery(
    selectedClassConfig?.value?.id,
    { skip: !selectedClassConfig?.value?.id }
  );
  const { data: subjects = [], isLoading: subjectsLoading } = useGetClassSubjectsByClassIdQuery(
    selectedClassConfig?.value?.g_class_id,
    { skip: !selectedClassConfig?.value?.g_class_id }
  );
  const { data: institute, isLoading: instituteLoading } = useGetInstituteLatestQuery();

  // Memoize active classes and subjects
  const activeClasses = useMemo(() => classConfigs.filter((cls) => cls.is_active), [classConfigs]);
  const activeSubjects = useMemo(() => subjects.filter((subject) => subject.is_active) || [], [subjects]);

  // Generate class options
const classConfigOptions = useMemo(
  () =>
    activeClasses.map((cls) => ({
      value: { id: cls.id, g_class_id: cls.g_class_id },
      label: `${cls.class_name}${cls.section_name ? ` ${cls.section_name}` : ''}${cls.shift_name ? ` ${cls.shift_name}` : ''}`,
    })),
  [activeClasses]
);


  // Memoize dynamic dates
  const dynamicDates = useMemo(() => generateDynamicDates(startDate, endDate), [startDate, endDate]);

  // Generate dynamic report data
  useEffect(() => {
    if (students.length && activeSubjects.length && selectedClassConfig?.value && startDate && endDate) {
      const dynamicData = students.map((student) => ({
        name: student.name,
        roll_no: student.roll_no || student.username,
        subjects: activeSubjects.map((subject) => ({
          name: subject.name,
          attendance: simulateAttendance(student.id, subject.name, dynamicDates),
        })),
      }));
      setDynamicReportData(dynamicData);
    } 
    // else {
    //   setDynamicReportData([]);
    // }
  }, [students, activeSubjects, selectedClassConfig, startDate, endDate, dynamicDates]);

  // Generate dynamic report data for primary layout
  useEffect(() => {
    if (students && activeSubjects && selectedClassConfig?.value && startDate && endDate) {
      const dynamicDates = generateDynamicDates(startDate, endDate);
      const dynamicData = students.map((student) => ({
        name: student.name,
        roll_no: student.roll_no || student.username,
        subjects: activeSubjects.map((subject) => ({
          name: subject.name,
          attendance: simulateAttendance(student.id, subject.name, dynamicDates),
        })),
      }));
      setDynamicReportData(dynamicData);
    }
  }, [students, activeSubjects, selectedClassConfig, startDate, endDate]);

  // Generate HTML-based report for printing
  const downloadPDF = () => {
    if (!selectedClassConfig?.value || !startDate || !endDate || dynamicReportData.length === 0) {
      toast.error("দয়া করে ক্লাস এবং তারিখের রেঞ্জ নির্বাচন করুন।");
      return;
    }

    if (classConfigsLoading || studentsLoading || subjectsLoading || instituteLoading) {
      toast.error("তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।");
      return;
    }

    if (!institute) {
      toast.error("ইনস্টিটিউট তথ্য পাওয়া যায়নি!");
      return;
    }

    const dynamicDates = generateDynamicDates(startDate, endDate);
    const classDetails = activeClasses.find((cls) => cls.id === parseInt(selectedClassConfig?.value?.id));
    const className = classDetails?.class_name || "অজানা";

    // Group rows by student to prevent breaking across pages
    const studentGroups = dynamicReportData.map((student, sIdx) => ({
      student,
      sIdx,
      rows: student.subjects.map((subject, subjIdx) => ({
        student,
        sIdx,
        subjIdx,
      })),
    }));

    // Estimate rows per page (accounting for header and footer space)
    const rowsPerPage = 50;
    const pages = [];
    let currentPage = [];
    let currentRowCount = 0;

    studentGroups.forEach((group) => {
      if (currentRowCount + group.rows.length <= rowsPerPage) {
        currentPage.push(group);
        currentRowCount += group.rows.length;
      } else {
        pages.push(currentPage);
        currentPage = [group];
        currentRowCount = group.rows.length;
      }
    });
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>মুতালায়া ও সবক শুনানোর রিপোর্ট</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 portrait; 
            margin: 20mm;
          }
          body { 
            font-family: 'Noto Sans Bengali', Arial, sans-serif; 
            font-size: 8px; 
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #000;
          }
          .page-container {
            width: 100%;
            min-height: 257mm;
            page-break-after: always;
            text-wrap: nowrap;
          }
          .page-container:last-child {
            page-break-after: auto;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px;
          }
          thead {
            display: table-header-group;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 4px 8px; 
            text-align: center; 
            vertical-align: middle;
          }
          th { 
            background-color: #ffffff; 
            font-weight: bold; 
            color: #000;
            text-transform: uppercase;
          }
          td { 
            color: #000; 
          }
          .student-group {
            page-break-inside: avoid;
          }
          .header { 
            text-align: center; 
            margin-bottom: 15px; 
            padding-bottom: 10px;
          }
          .institute-info {
            margin-bottom: 10px;
          }
          .institute-info h1 {
            font-size: 16px;
            margin: 0;
            color: #000;
          }
          .institute-info p {
            font-size: 12px;
            margin: 5px 0;
            color: #000;
          }
          .title {
            font-size: 14px;
            color: #DB9E30;
            margin: 10px 0;
            font-weight: bold;
          }
          .sub-header {
            font-size: 10px;
            color: #000;
            margin-top: 4px;
          }
          .footer {
            position: absolute;
            bottom: 2px;
            left: 20mm;
            right: 20mm;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #555;
          }
          .sobok {
            padding: 0 2px;
          }
          .name-cell {
            transform: rotate(180deg);
            writing-mode: vertical-rl;
            text-orientation: mixed;
            width: 20px;
            min-height: 80px;
            line-height: 1.2;
          }
          .attendance-cell {
          
          }
        </style>
      </head>
      <body>
        ${pages
          .map(
            (pageGroups, pageIdx) => `
          <div class="page-container">
            <div class="header">
              <div class="institute-info">
                <h1>${institute.institute_name || "অজানা ইনস্টিটিউট"}</h1>
                <p>${institute.institute_address || "ঠিকানা উপলব্ধ নয়"}</p>
              </div>
              <h2 class="title">মুতালায়া ও সবক শুনানোর রিপোর্ট</h2>
              <p class="sub-header">
                জামাত: ${className} | মাস: ${new Date(startDate).toLocaleDateString(
                  "bn-BD",
                  { month: "long" }
                )} - ২০২৫
              </p>
            </div>
            <table>
              <thead>
                <tr>
                  <th rowspan="3" style="width: 20px;">ক্রমিক</th>
                  <th rowspan="3" style="width: 20px;">নাম</th>
                  <th rowspan="3" style="width: 80px;">বিষয়</th>
                  ${dynamicDates
                    .map(
                      (d, i) => `
                    <th colspan="2" style="width: ${Math.max(
                      80 / dynamicDates.length,
                      40
                    )}px;">
                      ${d.day}
                    </th>
                  `
                    )
                    .join("")}
                  <th rowspan="3" style="width: 60px;">মন্তব্য</th>
                </tr>
                <tr>
                  ${dynamicDates
                    .map(
                      (d, i) => `
                    <th colspan="2" style="width: ${Math.max(
                      80 / dynamicDates.length,
                      40
                    )}px;">
                      ${d.date}
                    </th>
                  `
                    )
                    .join("")}
                </tr>
                <tr>
                  ${dynamicDates
                    .map(
                      (_, i) => `
                    <th style="width: ${Math.max(
                      40 / dynamicDates.length,
                      20
                    )}px;">সবক</th>
                    <th class="sobok" style="width: ${Math.max(
                      40 / dynamicDates.length,
                      20
                    )}px;">মুতালায়া</th>
                  `
                    )
                    .join("")}
                </tr>
              </thead>
              <tbody>
                ${pageGroups
                  .map(
                    ({ student, sIdx, rows }) => `
                  <tr class="student-group">
                    ${rows
                      .map(
                        ({ subjIdx }, rowIdx) => `
                      <tr>
                        ${
                          subjIdx === 0
                            ? `
                          <td rowspan="${
                            student.subjects.length
                          }" style="vertical-align: middle; text-align: center;">
                            ${sIdx + 1}
                          </td>
                          <td rowspan="${
                            student.subjects.length
                          }" class="name-cell">
                            ${student.name}
                          </td>
                        `
                            : ""
                        }
                        <td>${student.subjects[subjIdx].name}</td>
                        ${dynamicDates
                          .map(
                            (d) => `
                          <td class="attendance-cell"></td>
                          <td class="attendance-cell"></td>
                        `
                          )
                          .join("")}
                        <td></td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
          )
          .join("")}
        <script>
          let printAttempted = false;
          window.onbeforeprint = () => { printAttempted = true; };
          window.onafterprint = () => { window.close(); };
          window.addEventListener('beforeunload', (event) => {
            if (!printAttempted) { window.close(); }
          });
          window.print();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success("মুতালায়া ও সবক শুনানোর রিপোর্ট সফলভাবে তৈরি হয়েছে!");
  };

  return (
    <div className="py-8 w-full relative">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .a4-portrait {
            width: 793px;
            height: 1122px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 20px;
            box-sizing: border-box;
            font-family: 'Noto Sans Bengali', sans-serif;
            overflow-y: auto;
          }
          .form-container {
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 24px;
            border-radius: 16px;
            margin-bottom: 32px;
            animation: fadeIn 0.6s ease-out forwards;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .select-field, .date-field {
            width: 100%;
            padding: 8px;
            background: transparent;
            color: #441A05;
            border: 1px solid #9D9087;
            border-radius: 8px;
            transition: all 0.3s ease;
          }
          .select-field:focus, .date-field:focus {
            border-color: #DB9E30;
            box-shadow: 0 0 5px rgba(219, 158, 48, 0.5);
          }
          .select-field:disabled, .date-field:disabled {
            background: #f5f5f5;
            opacity: 0.6;
          }
          .download-btn {
            background-color: #DB9E30;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Noto Sans Bengali', sans-serif;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 16px;
            transition: background-color 0.3s ease;
          }
          .download-btn:hover {
            background-color: #b87a1e;
          }
          .download-btn:disabled {
            background-color: #9D9087;
            cursor: not-allowed;
          }
          .btn-glow {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
          .btn-glow:hover {
            box-shadow: 0 0 20px rgba(219, 158, 48, 0.5);
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
          // .name-cell {
          //   transform: rotate(180deg);
          //   writing-mode: vertical-rl;
          //   text-orientation: mixed;
          //   width: 25px;
          //   min-height: 80px;
          //   line-height: 1.2;
          // }
        
        `}
      </style>

      {/* Selection Form */}
      <div className="form-container">
        <h3 className="text-2xl font-bold text-[#441A05] tracking-tight mb-6">
          মুতালায়া রিপোর্ট
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            options={classConfigOptions}
            value={selectedClassConfig}
            onChange={setSelectedClassConfig}
            placeholder="ক্লাস নির্বাচন করুন"
            isDisabled={classConfigsLoading}
            styles={selectStyles}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            aria-label="ক্লাস নির্বাচন"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker()}
            className="date-field outline-none"
            placeholder="শুরুর তারিখ"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker()}
            className="date-field outline-none"
            placeholder="শেষের তারিখ"
          />
        </div>

        {/* Enhanced PDF Download Button */}
        <button
          onClick={downloadPDF}
          className="download-btn"
          disabled={
            !selectedClassConfig?.value ||
            dynamicReportData.length === 0 ||
            classConfigsLoading ||
            studentsLoading ||
            subjectsLoading ||
            instituteLoading
          }
        >
          <FaDownload /> রিপোর্ট
        </button>
      </div>

      {/* Report Preview */}
      {classConfigsLoading || studentsLoading || subjectsLoading || instituteLoading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-[#441A05]" />
        </div>
      ) : !selectedClassConfig?.value ? (
        <p className="text-center text-[#441A05]/70">
          রিপোর্ট তৈরি করতে ক্লাস নির্বাচন করুন।
        </p>
      ) : students.length === 0 ? (
        <p className="text-center text-[#441A05]/70">
          এই ক্লাসে কোনো সক্রিয় ছাত্র নেই।
        </p>
      ) : activeSubjects.length === 0 ? (
        <p className="text-center text-[#441A05]/70">
          এই ক্লাসে কোনো সক্রিয় বিষয় নেই।
        </p>
      ) : (
        <div className="p-4 text-xs font-[kalpurush] text-black a4-portrait animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">
              মুতালায়া ও সবক শুনানোর রিপোর্ট
            </h2>
            <p className="text-sm">
              জামাত:{" "}
              {activeClasses.find((c) => c.id === parseInt(selectedClassConfig?.value?.id))?.class_name || "N/A"}{" "}
              | মাস:{" "}
              {new Date(startDate).toLocaleDateString("bn-BD", {
                month: "long",
              })}{" "}
              - ২০২৫
            </p>
          </div>

          <div className="">
            <table className="table-auto w-full border-collapse">
              <thead>
                <tr>
                  <th rowSpan="3" className="border border-black py-1 text-[8px]">
                    ক্রমিক
                  </th>
                  <th rowSpan="3" className="border border-black px-2 py-1 text-[8px]">
                    নাম
                  </th>
                  <th rowSpan="3" className="border border-black px-2 py-1 text-[8px]">
                    বিষয়
                  </th>
                  {generateDynamicDates(startDate, endDate).map((d, i) => (
                    <th key={i} colSpan={2} className="border border-black text-center text-[8px]">
                      {d.day}
                    </th>
                  ))}
                  <th rowSpan="3" className="border border-black px-2 py-1 text-[8px]">
                    মন্তব্য
                  </th>
                </tr>
                <tr>
                  {generateDynamicDates(startDate, endDate).map((d, i) => (
                    <th key={i} colSpan={2} className="border border-black text-center text-[8px]">
                      {d.date}
                    </th>
                  ))}
                </tr>
                <tr>
                  {generateDynamicDates(startDate, endDate).map((_, i) => (
                    <React.Fragment key={i}>
                      <th className="border border-black text-center text-[8px] px-2">সবক</th>
                      <th className="border border-black text-center text-[8px]">মুতালায়া</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dynamicReportData.map((student, sIdx) =>
                  student.subjects.map((subject, subjIdx) => (
                    <tr key={`${sIdx}-${subjIdx}`}>
                      {subjIdx === 0 && (
                        <td
                          rowSpan={student.subjects.length}
                          className="border border-black text-center align-middle text-[8px]"
                        >
                          {sIdx + 1}
                        </td>
                      )}
                      {subjIdx === 0 && (
                        <td
                          rowSpan={student.subjects.length}
                          className="border border-black text-center text-[8px]"
                          style={{
                            transform: "rotate(180deg)",
                            writingMode: "vertical-rl",
                            textOrientation: "mixed",
                            width: "25px",
                            minHeight: "80px",
                            lineHeight: "1.2",
                          }}
                        >
                          {student.name}
                        </td>
                      )}
                      <td className="border border-black px-1 text-center text-[8px]">
                        {subject.name}
                      </td>
                      {generateDynamicDates(startDate, endDate).map((d) => (
                        <React.Fragment key={d.date}>
                          <td className="border border-black text-center text-[8px]">
                        
                          </td>
                          <td className="border border-black text-center text-[8px]">
                  
                          </td>
                        </React.Fragment>
                      ))}
                      <td className="border border-black"></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MutalayaReport;