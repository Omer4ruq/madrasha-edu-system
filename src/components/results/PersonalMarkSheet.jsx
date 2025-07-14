import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { FaSpinner, FaDownload } from "react-icons/fa";
import Select from "react-select";
import { useGetStudentActiveByClassQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetSubjectMarksQuery } from "../../redux/features/api/marks/subjectMarksApi";
import { useGetGradeRulesQuery } from "../../redux/features/api/result/gradeRuleApi";
import { useGetExamApiQuery } from "../../redux/features/api/exam/examApi";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetSubjectMarkConfigsByClassQuery } from "../../redux/features/api/marks/subjectMarkConfigsApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";
import selectStyles from "../../utilitis/selectStyles";

// Custom CSS (aligned with ResultSheet.jsx)
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
    height: 8px;
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
    // border: 1px solid #000;
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }
  th, td {
    border: 1px solid #000;
    padding: 8px;
    text-align: center;
  }
  th {
    background-color: #f5f5f5;
    font-weight: bold;
    color: #000;
    text-transform: uppercase;
  }
  td {
    color: #000;
  }
  .fail-cell {
    background-color: #FFE6E6;
    color: #9B1C1C;
  }
  .absent-cell {
    background-color: #FFF7E6;
    color: #000;
  }
  .head {
    text-align: center;
    margin-top: 30px;
    margin-bottom: 15px;
    padding-bottom: 10px;
  }
  .institute-info {
    margin-bottom: 10px;
  }
  .institute-info h1 {
    font-size: 22px;
    margin: 0;
    color: #000;
  }
  .institute-info p {
    font-size: 14px;
    margin: 5px 0;
    color: #000;
  }
  .title {
    font-size: 18px;
    color: #DB9E30;
    margin: 10px 0;
  }
  .stats-container {
    text-align: center;
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
  }
  .stats-box {
    border: 1px solid #000;
    border-radius: 3px;
    padding: 5px;
    width: 48%;
    background-color: #f5f5f5;
  }
  .stats-title {
    text-align: center;
    font-size: 11px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #000;
  }
  .stats-text {
    display: inline;
    text-align: center;
    padding-right: 5px;
    font-size: 10px;
    color: #000;
  }
  .date {
    margin-top: 20px;
    text-align: right;
    font-size: 10px;
    color: #000;
  }
  .a4-portrait {
    max-width: 595.28px;
    height: 841.89px;
    margin: 0 auto 20px;
    background: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    padding: 20px;
    box-sizing: border-box;
    font-family: 'Noto Sans Bengali', sans-serif;
    position: relative;
    overflow: hidden;
  }
`;

const PersonalMarkSheet = () => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClassConfig, setSelectedClassConfig] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [marksData, setMarksData] = useState(null);
  const [grades, setGrades] = useState([]);
  const markSheetRef = useRef(null);

  // Fetch data from APIs
  const {
    data: instituteData,
    isLoading: isInstituteLoading,
    error: instituteError,
  } = useGetInstituteLatestQuery();
  const {
    data: exams,
    isLoading: examsLoading,
    error: examsError,
  } = useGetExamApiQuery();
  const {
    data: classConfigs,
    isLoading: classConfigsLoading,
    error: classConfigsError,
  } = useGetclassConfigApiQuery();
  const {
    data: academicYears,
    isLoading: academicYearsLoading,
    error: academicYearsError,
  } = useGetAcademicYearApiQuery();
  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useGetStudentActiveByClassQuery(selectedClassConfig, {
    skip: !selectedClassConfig,
  });
  const {
    data: subjectMarks,
    isLoading: subjectMarksLoading,
    error: subjectMarksError,
  } = useGetSubjectMarksQuery(
    {
      exam: selectedExam,
      classConfig: selectedClassConfig,
      academicYear: selectedAcademicYear,
      student: selectedStudent,
    },
    {
      skip:
        !selectedExam ||
        !selectedClassConfig ||
        !selectedAcademicYear ||
        !selectedStudent,
    }
  );
  const {
    data: subjectConfigs,
    isLoading: subjectConfigsLoading,
    error: subjectConfigsError,
  } = useGetSubjectMarkConfigsByClassQuery(selectedClassConfig, {
    skip: !selectedClassConfig,
  });
  const {
    data: gradesData,
    isLoading: gradesLoading,
    error: gradesError,
  } = useGetGradeRulesQuery();

  // Load grades from gradeRuleApi
  useEffect(() => {
    if (gradesData) {
      setGrades(
        gradesData.map((g) => ({
          id: g.id,
          grade: g.grade_name,
          grade_name_op: g.grade_name_op,
          gpa: g.gpa,
          min_mark: g.min_mark,
          max_mark: g.max_mark,
          remarks: g.remarks,
        }))
      );
    }
    if (gradesError) {
      toast.error(`গ্রেড লোড করতে ত্রুটি: ${gradesError.status || "অজানা"}`);
    }
  }, [gradesData, gradesError]);

  // Handle API errors
  useEffect(() => {
    if (examsError) toast.error("পরীক্ষার তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (classConfigsError) toast.error("ক্লাস তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (academicYearsError)
      toast.error("শিক্ষাবর্ষ তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (studentsError) toast.error("ছাত্র তালিকা লোড করতে ব্যর্থ হয়েছে!");
    if (subjectMarksError)
      toast.error("বিষয়ের মার্কস লোড করতে ব্যর্থ হয়েছে!");
    if (subjectConfigsError) toast.error("বিষয় কনফিগ লোড করতে ব্যর্থ হয়েছে!");
    if (instituteError) toast.error("ইনস্টিটিউট তথ্য লোড করতে ব্যর্থ হয়েছে!");
  }, [
    examsError,
    classConfigsError,
    academicYearsError,
    studentsError,
    subjectMarksError,
    subjectConfigsError,
    instituteError,
  ]);

  // Calculate personal marks data and merit position
  useEffect(() => {
    if (
      subjectMarks &&
      subjectConfigs &&
      selectedStudent &&
      selectedExam &&
      selectedClassConfig &&
      selectedAcademicYear &&
      grades.length > 0 &&
      students
    ) {
      const studentMarks = subjectMarks.filter(
        (mark) =>
          mark.student === Number(selectedStudent) &&
          mark.exam === Number(selectedExam) &&
          mark.class_name ===
            classConfigs.find((c) => c.id === Number(selectedClassConfig))
              ?.class_name &&
          mark.academic_year === Number(selectedAcademicYear)
      );

      let totalObtained = 0;
      let totalMaxMarks = 0;
      let hasCompulsoryFail = false;
      const subjectResults = subjectConfigs.map((config) => {
        const mark = studentMarks.find(
          (m) =>
            m.mark_conf === config.mark_configs[0]?.id ||
            m.mark_conf === config.mark_configs[1]?.id
        );
        const obtained = mark ? mark.obtained : 0;
        const isAbsent = mark ? mark.is_absent : false;
        const maxMark = config.mark_configs.reduce(
          (sum, mc) => sum + mc.max_mark,
          0
        );
        const passMark = config.mark_configs.reduce(
          (sum, mc) => sum + mc.pass_mark,
          0
        );
        const isFailed = !isAbsent && obtained < passMark;
        if (isFailed && config.subject_type === "COMPULSORY") {
          hasCompulsoryFail = true;
        }
        totalObtained += obtained;
        totalMaxMarks += maxMark;
        return {
          subject: config.subject_name,
          obtained,
          maxMark,
          isFailed,
          isAbsent,
          subjectType: config.subject_type,
        };
      });

      const averageMarks =
        totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;
      const grade = hasCompulsoryFail
        ? "ফেল"
        : grades.find(
            (g) => averageMarks >= g.min_mark && averageMarks <= g.max_mark
          )?.grade || "N/A";

      // Calculate merit position
      const allStudentMarks = students.map((student) => {
        const studentData = subjectMarks.filter(
          (mark) => mark.student === student.id
        );
        let studentTotal = 0;
        studentData.forEach((mark) => {
          const config = subjectConfigs.find((c) =>
            c.mark_configs.some((mc) => mc.id === mark.mark_conf)
          );
          if (config) {
            studentTotal += mark.obtained;
          }
        });
        return { id: student.id, total: studentTotal };
      });
      allStudentMarks.sort((a, b) => b.total - a.total);
      const meritPosition =
        allStudentMarks.findIndex((s) => s.id === Number(selectedStudent)) + 1;

      setMarksData({
        studentName:
          students.find((s) => s.id === Number(selectedStudent))?.name ||
          "Unknown",
        rollNo:
          students.find((s) => s.id === Number(selectedStudent))?.roll_no ||
          "N/A",
        subjects: subjectResults,
        totalObtained,
        totalMaxMarks,
        averageMarks: averageMarks.toFixed(2),
        grade,
        meritPosition,
      });
    }
  }, [
    subjectMarks,
    subjectConfigs,
    selectedStudent,
    selectedExam,
    selectedClassConfig,
    selectedAcademicYear,
    grades,
    students,
  ]);

  // Generate PDF Report (exact match with UI layout)
  const generatePDFReport = () => {
  if (
    !selectedExam ||
    !selectedClassConfig ||
    !selectedAcademicYear ||
    !selectedStudent
  ) {
    toast.error("অনুগ্রহ করে সমস্ত প্রয়োজনীয় ফিল্ড পূরণ করুন!");
    return;
  }

  if (!marksData) {
    toast.error("কোনো ফলাফল তথ্য পাওয়া যায়নি!");
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
      <title>ব্যক্তিগত ফলাফল শীট</title>
      <meta charset="UTF-8">
      <style>
        @page { size: A4 portrait; }
        body {
          font-family: 'Noto Sans Bengali', Arial, sans-serif;
          font-size: 12px;
          margin: 0;
          padding: 0;
          background-color: #ffffff;
        }
        .head {
          text-align: center;
          margin-top: 30px;
          margin-bottom: 15px;
          padding-bottom: 10px;
        }
        .institute-info {
          margin-bottom: 10px;
        }
        .institute-info h1 {
          font-size: 22px;
          margin: 0;
          color: #000;
        }
        .institute-info p {
          font-size: 14px;
          margin: 5px 0;
          color: #000;
        }
        .title {
          font-size: 18px;
          color: #DB9E30;
          margin: 10px 0;
          font-weight: 600;
        }
        .student-info {
          font-size: 14px;
          margin: 5px 0;
          font-weight: 600;
          color: #000;
        }
        .table-container {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: center;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
          color: #000;
          text-transform: uppercase;
        }
        td {
          color: #000;
        }
        .fail-cell {
          background-color: #FFE6E6;
          color: #9B1C1C;
        }
        .absent-cell {
          background-color: #FFF7E6;
          color: #000;
        }
        .footer-label {
          text-align: right;
          font-size: 12px;
          font-weight: 600;
        }
        .footer-value {
          font-size: 12px;
          font-weight: 600;
        }
        .signature {
          margin-top: 80px;
          font-size: 12px;
          color: #000;
        }
        .date {
          margin-top: 20px;
          text-align: right;
          font-size: 10px;
          color: #000;
        }
      </style>
    </head>
    <body>
      <div class="head">
        <div class="institute-info">
          <h1>${institute.institute_name || "অজানা ইনস্টিটিউট"}</h1>
          <p>${institute.institute_address || "ঠিকানা উপলব্ধ নয়"}</p>
        </div>
        <h2 class="title">
          ব্যক্তিগত ফলাফল শীট - ${
            exams?.find((e) => e.id === Number(selectedExam))?.name || "পরীক্ষা নির্বাচিত হয়নি"
          }
        </h2>
        <h3 class="student-info">
          নাম: ${marksData.studentName} | রোল: ${marksData.rollNo}
        </h3>
        <h3 class="student-info">
          ক্লাস: ${
            classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.class_name || "ক্লাস নির্বাচিত হয়নি"
          } | শাখা: ${
            classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.section_name || "শাখা নির্বাচিত হয়নি"
          } | শিফট: ${
            classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.shift_name || "শিফট নির্বাচিত হয়নি"
          }
        </h3>
        <h3 class="student-info">
          শিক্ষাবর্ষ: ${
            academicYears?.find((y) => y.id === Number(selectedAcademicYear))?.name || "শিক্ষাবর্ষ নির্বাচিত হয়নি"
          }
        </h3>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">ক্রমিক নং</th>
              <th style="width: 200px;">বিষয়</th>
              <th style="width: 100px;">প্রাপ্ত নম্বর</th>
            </tr>
          </thead>
          <tbody>
            ${marksData.subjects
              .map((sub, index) => {
                const cellClass = sub.isFailed
                  ? "fail-cell"
                  : sub.isAbsent
                  ? "absent-cell"
                  : "";
                const markText = sub.isAbsent ? "অনুপস্থিত" : sub.obtained;
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${sub.subject}</td>
                    <td class="${cellClass}">${markText}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td class="footer-label">মোট প্রাপ্ত নম্বর :</td>
              <td class="footer-value">${marksData.averageMarks}</td>
            </tr>
            <tr>
              <td></td>
              <td class="footer-label">প্রাপ্ত বিভাগ :</td>
              <td class="footer-value">${marksData.grade}</td>
            </tr>
            <tr>
              <td></td>
              <td class="footer-label">মেধা স্থান :</td>
              <td class="footer-value">${marksData.meritPosition || "N/A"}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="signature">
        পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর: ____________________
      </div>

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
        window.print();
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  toast.success("PDF রিপোর্ট তৈরি হয়েছে!");
};


  // Prepare options for react-select
  const examOptions =
    exams?.map((exam) => ({
      value: exam.id,
      label: exam.name,
    })) || [];
  const classConfigOptions =
    classConfigs?.map((config) => ({
      value: config.id,
      label: `${config.class_name} - ${config.section_name} (${config.shift_name})`,
    })) || [];
  const academicYearOptions =
    academicYears?.map((year) => ({
      value: year.id,
      label: year.name,
    })) || [];
  const studentOptions =
    students?.map((student) => ({
      value: student.id,
      label: `${student.name} (রোল: ${student.roll_no})`,
    })) || [];

  const isLoading =
    examsLoading ||
    classConfigsLoading ||
    academicYearsLoading ||
    studentsLoading ||
    subjectMarksLoading ||
    subjectConfigsLoading ||
    gradesLoading ||
    isInstituteLoading;

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      <style>{customStyles}</style>
      <div className="mx-auto">
        {/* Selection Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight mb-6">
            ব্যক্তিগত ফলাফল শীট
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative">
              <label
                htmlFor="examSelect"
                className="block font-medium text-[#441a05]"
              >
                পরীক্ষা নির্বাচন <span className="text-red-600">*</span>
              </label>
              <Select
                id="examSelect"
                options={examOptions}
                value={
                  examOptions.find((option) => option.value === selectedExam) ||
                  null
                }
                onChange={(option) =>
                  setSelectedExam(option ? option.value : "")
                }
                placeholder="পরীক্ষা নির্বাচন করুন"
                isDisabled={isLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="পরীক্ষা নির্বাচন"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="classSelect"
                className="block font-medium text-[#441a05]"
              >
                ক্লাস নির্বাচন <span className="text-red-600">*</span>
              </label>
              <Select
                id="classSelect"
                options={classConfigOptions}
                value={
                  classConfigOptions.find(
                    (option) => option.value === selectedClassConfig
                  ) || null
                }
                onChange={(option) =>
                  setSelectedClassConfig(option ? option.value : "")
                }
                placeholder="ক্লাস নির্বাচন করুন"
                isDisabled={isLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="ক্লাস নির্বাচন"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="yearSelect"
                className="block font-medium text-[#441a05]"
              >
                শিক্ষাবর্ষ নির্বাচন <span className="text-red-600">*</span>
              </label>
              <Select
                id="yearSelect"
                options={academicYearOptions}
                value={
                  academicYearOptions.find(
                    (option) => option.value === selectedAcademicYear
                  ) || null
                }
                onChange={(option) =>
                  setSelectedAcademicYear(option ? option.value : "")
                }
                placeholder="শিক্ষাবর্ষ নির্বাচন করুন"
                isDisabled={isLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="শিক্ষাবর্ষ নির্বাচন"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="studentSelect"
                className="block font-medium text-[#441a05]"
              >
                শিক্ষার্থী নির্বাচন <span className="text-red-600">*</span>
              </label>
              <Select
                id="studentSelect"
                options={studentOptions}
                value={
                  studentOptions.find(
                    (option) => option.value === selectedStudent
                  ) || null
                }
                onChange={(option) =>
                  setSelectedStudent(option ? option.value : "")
                }
                placeholder="শিক্ষার্থী নির্বাচন করুন"
                isDisabled={isLoading || !selectedClassConfig}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="শিক্ষার্থী নির্বাচন"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={generatePDFReport}
              disabled={isLoading || !marksData}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 btn-ripple ${
                isLoading || !marksData
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-[#DB9E30] text-[#441a05] hover:text-white btn-glow"
              }`}
              aria-label="PDF রিপোর্ট ডাউনলোড"
              title="PDF রিপোর্ট ডাউনলোড করুন / Download PDF report"
            >
              <FaDownload className="text-lg" />
              <span>PDF রিপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Result Display (aligned with ResultSheet.jsx) */}
        <div className="bg-white a4-portrait">
          {isLoading ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
              <FaSpinner className="animate-spin text-lg mr-2" />
              ফলাফল লোড হচ্ছে...
            </p>
          ) : !selectedExam ||
            !selectedClassConfig ||
            !selectedAcademicYear ||
            !selectedStudent ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
              অনুগ্রহ করে পরীক্ষা, ক্লাস, শিক্ষাবর্ষ এবং শিক্ষার্থী নির্বাচন
              করুন।
            </p>
          ) : !marksData ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
              কোনো ফলাফল পাওয়া যায়নি।
            </p>
          ) : (
            <>
              <div className="head">
                <div className="institute-info">
                  <h1>{instituteData?.institute_name || "অজানা ইনস্টিটিউট"}</h1>
                  <p>
                    {instituteData?.institute_address || "ঠিকানা উপলব্ধ নয়"}
                  </p>
                </div>
                <h2 className="title font-semibold">
                  ব্যক্তিগত ফলাফল শীট -{" "}
                  {exams?.find((e) => e.id === Number(selectedExam))?.name ||
                    "পরীক্ষা নির্বাচিত হয়নি"}
                </h2>
                <h3 className="text-[14px] mb-0 text-black font-semibold">
                  নাম: {marksData.studentName} | রোল: {marksData.rollNo}
                </h3>
                <h3 className="text-[14px] mb-0 text-black font-semibold">
                  ক্লাস:{" "}
                  {classConfigs?.find(
                    (c) => c.id === Number(selectedClassConfig)
                  )?.class_name || "ক্লাস নির্বাচিত হয়নি"}{" "}
                  | শাখা:{" "}
                  {classConfigs?.find(
                    (c) => c.id === Number(selectedClassConfig)
                  )?.section_name || "শাখা নির্বাচিত হয়নি"}{" "}
                  | শিফট:{" "}
                  {classConfigs?.find(
                    (c) => c.id === Number(selectedClassConfig)
                  )?.shift_name || "শিফট নির্বাচিত হয়নি"}
                </h3>
                <h3 className="text-[14px] mb-0 text-black font-semibold">
                  শিক্ষাবর্ষ:{" "}
                  {academicYears?.find(
                    (y) => y.id === Number(selectedAcademicYear)
                  )?.name || "শিক্ষাবর্ষ নির্বাচিত হয়নি"}
                </h3>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }} className="text-xs">ক্রমিক নং</th>
                      <th style={{ width: "200px" }} className="text-xs">বিষয়</th>
                      <th style={{ width: "100px" }} className="text-xs">প্রাপ্ত নম্বর</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marksData.subjects.map((sub, index) => (
                      <tr key={index}>
                        <td className="text-xs">{index + 1}</td>
                        <td className="text-xs">{sub.subject}</td>
                        <td
                          className={
                            sub.isFailed
                              ? "fail-cell text-xs"
                              : sub.isAbsent
                              ? "absent-cell text-xs"
                              : "text-xs"
                          }
                        >
                          {sub.isAbsent ? "অনুপস্থিত" : sub.obtained}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border border-black">
                      <td className="border-none"></td>
                      <td className="text-right border-none text-xs font-semibold">
                        মোট প্রাপ্ত নম্বর :
                      </td>
                      <td className="border-none text-xs font-semibold">
                        {marksData.averageMarks}
                      </td>
                    </tr>
                    <tr className="border border-black">
                      <td className="border-none"></td>
                      <td className="text-right border-none text-xs font-semibold">
                        প্রাপ্ত বিভাগ :
                      </td>
                      <td className="border-none text-xs font-semibold">
                        {marksData.grade}
                      </td>
                    </tr>
                    <tr className="border border-black">
                      <td className="border-none"></td>
                      <td className="text-right border-none text-xs font-semibold">
                        মেধা স্থান :
                      </td>
                      <td className="border-none text-xs font-semibold">
                        {marksData.meritPosition || "N/A"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="mt-20 text-xs text-black">
                পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর: ____________________ 
              </div>
              <div className="date">
                রিপোর্ট তৈরির তারিখ: {new Date().toLocaleDateString("bn-BD")}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalMarkSheet;