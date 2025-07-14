import React, { useState, useEffect } from "react";
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

// Custom CSS aligned with PersonalMarkSheet.jsx
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

const MarkSheet = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [resultData, setResultData] = useState([]);
  const [grades, setGrades] = useState([]);

  // Fetch data from APIs
  const {
    data: instituteData,
    isLoading: isInstituteLoading,
    error: instituteError,
  } = useGetInstituteLatestQuery();
  const { data: exams, isLoading: examsLoading } = useGetExamApiQuery();
  const { data: classConfigs, isLoading: classConfigsLoading } =
    useGetclassConfigApiQuery();
  const { data: academicYears, isLoading: academicYearsLoading } =
    useGetAcademicYearApiQuery();
  const { data: students, isLoading: studentsLoading } =
    useGetStudentActiveByClassQuery(selectedClassConfig?.value, {
      skip: !selectedClassConfig,
    });
  const { data: subjectMarks, isLoading: subjectMarksLoading } =
    useGetSubjectMarksQuery(
      {
        exam: selectedExam?.value,
        classConfig: selectedClassConfig?.value,
        academicYear: selectedAcademicYear?.value,
        skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear,
      },
      {
        skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear,
      }
    );
  const { data: subjectConfigs, isLoading: subjectConfigsLoading } =
    useGetSubjectMarkConfigsByClassQuery(selectedClassConfig?.value, {
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

  // Calculate results for all students
  useEffect(() => {
    if (
      subjectMarks &&
      students &&
      subjectConfigs &&
      selectedExam &&
      selectedClassConfig &&
      selectedAcademicYear &&
      grades.length > 0
    ) {
      const filteredMarks = subjectMarks.filter(
        (mark) =>
          mark.exam === Number(selectedExam.value) &&
          mark.class_name ===
            classConfigs.find((c) => c.id === Number(selectedClassConfig.value))
              ?.class_name &&
          mark.academic_year === Number(selectedAcademicYear.value)
      );

      const result = students.map((student) => {
        const studentMarks = filteredMarks.filter(
          (mark) => mark.student === student.id
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
            passMark,
            isFailed,
            isAbsent,
            subjectType: config.subject_type,
          };
        });

        const averageMarks =
          totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;
        const grade = hasCompulsoryFail ? "ফেল" : calculateGrade(averageMarks);
        return {
          studentId: student.id,
          studentName: student.name,
          rollNo: student.roll_no,
          subjects: subjectResults,
          totalObtained,
          totalMaxMarks,
          averageMarks: averageMarks.toFixed(2),
          grade,
        };
      });

      // Sort by total marks for ranking
      const rankedResult = result
        .sort((a, b) => b.totalObtained - a.totalObtained)
        .map((res, index) => ({
          ...res,
          rank: index + 1,
          rankDisplay: `${index + 1}`,
        }));

      setResultData(rankedResult);
    }
  }, [
    subjectMarks,
    students,
    subjectConfigs,
    selectedExam,
    selectedClassConfig,
    selectedAcademicYear,
    grades,
  ]);

  const calculateGrade = (averageMarks) => {
    const grade = grades.find(
      (g) => averageMarks >= g.min_mark && averageMarks <= g.max_mark
    );
    return grade ? grade.grade : "N/A";
  };

  // Generate bulk PDF report using window.print() similar to PersonalMarkSheet
  const generateBulkPDF = () => {
    if (!selectedExam || !selectedClassConfig || !selectedAcademicYear) {
      toast.error("অনুগ্রহ করে সমস্ত প্রয়োজনীয় ফিল্ড পূরণ করুন!");
      return;
    }

    if (resultData.length === 0) {
      toast.error("কোনো ফলাফল তথ্য পাওয়া যায়নি!");
      return;
    }


    if (!instituteData) {
        toast.error("ইনস্টিটিউট তথ্য পাওয়া যায়নি!");
        return;
      }
    
      const institute = instituteData;

    const printWindow = window.open(" ", "_blank");
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>শ্রেণির ফলাফল শীট</title>
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
            // margin-top: 30px;
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
          .footer-label {
            text-align: right;
            font-size: 10px;
            font-weight: 600;
          }
          .footer-value {
            font-size: 10px;
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
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        ${resultData
          .map(
            (student, index) => `
          <div class="${index > 0 ? "page-break" : ""}">
            <div class="head">
              <div class="institute-info">
                <h1>${institute.institute_name || "অজানা ইনস্টিটিউট"}</h1>
                <p>${institute.institute_address || "ঠিকানা উপলব্ধ নয়"}</p>
              </div>
              <h2 class="title">
                ব্যক্তিগত ফলাফল শীট - ${
                  exams?.find((e) => e.id === Number(selectedExam.value))
                    ?.name || "পরীক্ষা নির্বাচিত হয়নি"
                }
              </h2>
              <h3 class="student-info">
                নাম: ${student.studentName} | রোল: ${student.rollNo}
              </h3>
              <h3 class="student-info">
                ক্লাস: ${
                  classConfigs?.find(
                    (c) => c.id === Number(selectedClassConfig.value)
                  )?.class_name || "ক্লাস নির্বাচিত হয়নি"
                } | 
                শাখা: ${
                  classConfigs?.find(
                    (c) => c.id === Number(selectedClassConfig.value)
                  )?.section_name || "শাখা নির্বাচিত হয়নি"
                } | 
                শিফট: ${
                  classConfigs?.find(
                    (c) => c.id === Number(selectedClassConfig.value)
                  )?.shift_name || "শিফট নির্বাচিত হয়নি"
                }
              </h3>
              <h3 class="student-info">
                শিক্ষাবর্ষ: ${
                  academicYears?.find(
                    (y) => y.id === Number(selectedAcademicYear.value)
                  )?.name || "শিক্ষাবর্ষ নির্বাচিত হয়নি"
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
                  ${student.subjects
                    .map(
                      (sub, idx) => `
                      <tr>
                        <td>${idx + 1}</td>
                        <td>${sub.subject}</td>
                        <td class="${
                          sub.isAbsent
                            ? "absent-cell"
                            : sub.isFailed
                            ? "fail-cell"
                            : ""
                        }">
                          ${sub.isAbsent ? "অনুপস্থিত" : sub.obtained}
                        </td>
                      </tr>
                    `
                    )
                    .join("")}
                </tbody>
                <tfoot>
                  <tr>
                    <td></td>
                    <td class="footer-label">মোট প্রাপ্ত নম্বর :</td>
                    <td class="footer-value">${student.averageMarks}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td class="footer-label">প্রাপ্ত বিভাগ :</td>
                    <td class="footer-value">${student.grade}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td class="footer-label">মেধা স্থান :</td>
                    <td class="footer-value">${student.rankDisplay}</td>
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

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success("বাল্ক PDF রিপোর্ট তৈরি হয়েছে!");
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

  const isLoading =
    examsLoading ||
    classConfigsLoading ||
    academicYearsLoading ||
    studentsLoading ||
    subjectMarksLoading ||
    subjectConfigsLoading ||
    gradesLoading;

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      <style>{customStyles}</style>
      <div className="mx-auto">
        {/* Selection Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight mb-6">
            শ্রেণির ফলাফল শীট
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  examOptions.find(
                    (option) => option.value === selectedExam?.value
                  ) || null
                }
                onChange={(option) => setSelectedExam(option)}
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
                    (option) => option.value === selectedClassConfig?.value
                  ) || null
                }
                onChange={(option) => setSelectedClassConfig(option)}
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
                    (option) => option.value === selectedAcademicYear?.value
                  ) || null
                }
                onChange={(option) => setSelectedAcademicYear(option)}
                placeholder="শিক্ষাবর্ষ নির্বাচন করুন"
                isDisabled={isLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="শিক্ষাবর্ষ নির্বাচন"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={generateBulkPDF}
              disabled={isLoading || resultData.length === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 btn-ripple ${
                isLoading || resultData.length === 0
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-[#DB9E30] text-[#441a05] hover:text-white btn-glow"
              }`}
              aria-label="বাল্ক PDF রিপোর্ট ডাউনলোড"
              title="বাল্ক PDF রিপোর্ট ডাউনলোড করুন"
            >
              <FaDownload className="text-lg" />
              <span>বাল্ক PDF রিপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Result Display */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-[#441a05]" />
          </div>
        ) : resultData.length > 0 ? (
          resultData.map((student) => (
            <div key={student.studentId} className="a4-portrait animate-fadeIn">
              <div className="head">
                <div className="institute-info">
                  <h1>{instituteData.institute_name || "অজানা ইনস্টিটিউট"}</h1>
                  <p>{instituteData.institute_address || "ঠিকানা উপলব্ধ নয়"}</p>
                </div>
                <h2 className="title font-semibold">
                  ব্যক্তিগত ফলাফল শীট -{" "}
                  {
                    exams?.find((e) => e.id === Number(selectedExam?.value))
                      ?.name
                  }
                </h2>
                <h3 className="text-[14px] mb-0 text-black font-semibold">
                  নাম: {student.studentName} | রোল: {student.rollNo}
                </h3>
                <h3 className="text-[14px] mb-0 text-black font-semibold">
                  ক্লাস:{" "}
                  {classConfigs?.find(
                    (c) => c.id === Number(selectedClassConfig?.value)
                  )?.class_name || "ক্লাস নির্বাচিত হয়নি"}{" "}
                  | শাখা:{" "}
                  {classConfigs?.find(
                    (c) => c.id === Number(selectedClassConfig?.value)
                  )?.section_name || "শাখা নির্বাচিত হয়নি"}{" "}
                  | শিফট:{" "}
                  {classConfigs?.find(
                    (c) => c.id === Number(selectedClassConfig?.value)
                  )?.shift_name || "শিফট নির্বাচিত হয়নি"}
                </h3>
                <h3 className="text-[14px] mb-0 text-black font-semibold">
                  শিক্ষাবর্ষ:{" "}
                  {academicYears?.find(
                    (y) => y.id === Number(selectedAcademicYear?.value)
                  )?.name || "শিক্ষাবর্ষ নির্বাচিত হয়nি"}
                </h3>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }} className="text-xs">
                        ক্রমিক নং
                      </th>
                      <th style={{ width: "200px" }} className="text-xs">
                        বিষয়
                      </th>
                      <th style={{ width: "100px" }} className="text-xs">
                        প্রাপ্ত নম্বর
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.subjects.map((sub, index) => (
                      <tr key={index}>
                        <td className="text-xs">{index + 1}</td>
                        <td className="text-xs">{sub.subject}</td>
                        <td
                          className={
                            sub.isAbsent
                              ? "absent-cell text-xs"
                              : sub.isFailed
                              ? "fail-cell text-xs"
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
                        {student.averageMarks}
                      </td>
                    </tr>
                    <tr className="border border-black">
                      <td className="border-none"></td>
                      <td className="text-right border-none text-xs font-semibold">
                        প্রাপ্ত বিভাগ :
                      </td>
                      <td className="border-none text-xs font-semibold">
                        {student.grade}
                      </td>
                    </tr>
                    <tr className="border border-black">
                      <td className="border-none"></td>
                      <td className="text-right border-none text-xs font-semibold">
                        মেধা স্থান :
                      </td>
                      <td className="border-none text-xs font-semibold">
                        {student.rankDisplay}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="mt-20 text-xs text-black">
                পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর: ____________________
              </div>
              {/* <div className="date">
                রিপোর্ট তৈরির তারিখ: {new Date().toLocaleDateString("bn-BD")}
              </div> */}
            </div>
          ))
        ) : (
          <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
            ফলাফল দেখতে উপরের ফিল্টার নির্বাচন করুন।
          </p>
        )}
      </div>
    </div>
  );
};

export default MarkSheet;
