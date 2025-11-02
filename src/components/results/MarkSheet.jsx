import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { FaSpinner, FaDownload } from "react-icons/fa";
import Select from "react-select";
import { useGetStudentActiveByClassQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetFilteredSubjectMarksQuery } from "../../redux/features/api/marks/subjectMarksApi";
import { useGetFilteredMarkConfigsQuery } from "../../redux/features/api/marks/markConfigsApi";
import { useGetGradeRulesQuery } from "../../redux/features/api/result/gradeRuleApi";
import { useGetExamApiQuery } from "../../redux/features/api/exam/examApi";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";
import { useGetBehaviorTypeApiQuery } from "../../redux/features/api/behavior/behaviorTypeApi";
import { useGetBehaviorReportApiQuery } from "../../redux/features/api/behavior/behaviorReportApi";
import selectStyles from "../../utilitis/selectStyles";

// Custom CSS aligned with original MarkSheet.jsx
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
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }
  th, td {
    border: 1px solid #000;
    padding: 6px;
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
    margin-top: 0px;
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
    height: auto;
    min-height: 841.89px;
    margin: 0 auto 20px;
    background: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    padding: 20px;
    box-sizing: border-box;
    font-family: 'Noto Sans Bengali', sans-serif;
    position: relative;
    overflow: hidden;
    border: 14px solid rgba(219, 158, 48, 0.7);
    border-style: double;
  }
  .student-info {
    font-size: 14px;
    margin: 5px 0;
    font-weight: 600;
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
    margin-top: 120px;
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
  .behavior-table {
    margin-top: 10px;
    font-size: 9px;
  }
  .behavior-table th,
  .behavior-table td {
    padding: 4px;
    font-size: 9px;
  }
  .behavior-table th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
  .optional-section {
    margin-top: 8px;
  }
  .behavior-section-title {
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    margin: 10px 0 5px 0;
    color: #000;
  }
`;

const MarkSheet = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [gradeFormat, setGradeFormat] = useState("grade_name");
  const [sortBy, setSortBy] = useState("roll");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showBehaviorMarks, setShowBehaviorMarks] = useState(false);
  const [resultData, setResultData] = useState([]);
  const [filteredResultData, setFilteredResultData] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [grades, setGrades] = useState([]);
  const [behaviorMarks, setBehaviorMarks] = useState({});
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    gradeDistribution: {},
    failedSubjects: {},
  });
  const [isLoading, setIsLoading] = useState(false);

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
    useGetFilteredSubjectMarksQuery(
      {
        exam_id: selectedExam?.value,
        profile_class_id: selectedClassConfig?.value,
        academic_year: selectedAcademicYear?.value,
      },
      {
        skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear,
      }
    );
  const { data: markConfigs, isLoading: markConfigsLoading } =
    useGetFilteredMarkConfigsQuery(
      {
        class_id: classConfigs?.find(
          (c) => c.id === Number(selectedClassConfig?.value)
        )?.class_id,
      },
      { skip: !selectedClassConfig }
    );
  const {
    data: gradesData,
    isLoading: gradesLoading,
    error: gradesError,
  } = useGetGradeRulesQuery();
  
  // Fetch behavior data
  const { data: behaviorTypes, isLoading: behaviorTypesLoading } =
    useGetBehaviorTypeApiQuery();
  const { data: behaviorReports, isLoading: behaviorReportsLoading } =
    useGetBehaviorReportApiQuery();

  // Load grades from gradeRuleApi
  useEffect(() => {
    if (gradesData) {
      setGrades(
        gradesData.map((g) => ({
          id: g.id,
          grade: g.grade_name,
          gradeOp: g.grade_name_op,
          min: g.min_mark,
          max: g.max_mark,
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
    if (instituteError) toast.error("ইনস্টিটিউট তথ্য লোড করতে ব্যর্থ হয়েছে!");
    if (gradesError) toast.error("গ্রেড তালিকা লোড করতে ব্যর্থ হয়েছে!");
  }, [instituteError, gradesError]);

  // Load behavior marks
  useEffect(() => {
    if (behaviorReports && selectedExam && selectedAcademicYear && students) {
      const behaviorMarksData = {};
      
      behaviorReports.forEach((report) => {
        const examMatches = report.exam_name_id === parseInt(selectedExam.value);
        const academicYearMatches = selectedAcademicYear
          ? report.academic_year === parseInt(selectedAcademicYear.value)
          : report.academic_year === null;

        if (examMatches && academicYearMatches) {
          report.behavior_marks.forEach((mark) => {
            if (!behaviorMarksData[mark.student_id]) {
              behaviorMarksData[mark.student_id] = {};
            }
            behaviorMarksData[mark.student_id][mark.behavior_type] = mark.mark;
          });
        }
      });
      
      setBehaviorMarks(behaviorMarksData);
    }
  }, [behaviorReports, selectedExam, selectedAcademicYear, students]);

  // Helper function to get fail grade based on format
  const getFailGrade = () => {
    const failRule = gradesData?.find((rule) => rule.min_mark === 0);
    if (failRule) {
      return gradeFormat === "grade_name"
        ? failRule.grade_name
        : failRule.grade_name_op;
    }
    return gradeFormat === "grade_name" ? "রাসেব" : "F";
  };

  // Helper function to get grade based on marks and format
  const getGradeForMarks = (averageMark, hasFailed) => {
    if (hasFailed) return getFailGrade();

    const gradeRule = gradesData?.find(
      (rule) => averageMark >= rule.min_mark && averageMark <= rule.max_mark
    );

    if (gradeRule) {
      return gradeFormat === "grade_name"
        ? gradeRule.grade_name
        : gradeRule.grade_name_op;
    }

    return getFailGrade();
  };

  // Helper function to get display rank
  const getDisplayRank = (student, rank) => {
    if (student.hasFailed) {
      const failGrade = getFailGrade();
      return failGrade;
    }
    return rank.toString();
  };

  // Process data when all requirements are met
  useEffect(() => {
    if (
      subjectMarks?.length > 0 &&
      markConfigs?.length > 0 &&
      students?.length > 0 &&
      !subjectMarksLoading &&
      !markConfigsLoading &&
      !studentsLoading
    ) {
      processResultData();
    }
  }, [
    subjectMarks,
    markConfigs,
    students,
    subjectMarksLoading,
    markConfigsLoading,
    studentsLoading,
    gradeFormat,
    sortBy,
  ]);

  // Filter results based on selected student
  useEffect(() => {
    if (!selectedStudent) {
      setFilteredResultData(resultData);
    } else {
      const filtered = resultData.filter(
        (student) => student.id === selectedStudent.value
      );
      setFilteredResultData(filtered);
    }
  }, [resultData, selectedStudent]);

  const processResultData = () => {
    setIsLoading(true);

    // Create mapping of subject_serial to combined_subject_name
    const subjectNameMap = {};
    subjectMarks.forEach((mark) => {
      if (!subjectNameMap[mark.subject_serial] && mark.combined_subject_name) {
        subjectNameMap[mark.subject_serial] = mark.combined_subject_name;
      }
    });

    // Group mark configs by subject_serial to get sum of max_mark and pass_mark
    const subjectConfigGroups = {};
    markConfigs.forEach((config) => {
      if (!subjectConfigGroups[config.subject_serial]) {
        subjectConfigGroups[config.subject_serial] = {
          serial: config.subject_serial,
          maxMark: 0,
          passMark: 0,
          subjectName:
            subjectNameMap[config.subject_serial] || config.subject_name,
        };
      }
      subjectConfigGroups[config.subject_serial].maxMark += config.max_mark;
      subjectConfigGroups[config.subject_serial].passMark += config.pass_mark;
    });

    // Convert to array and sort by serial
    const sortedSubjectGroups = Object.values(subjectConfigGroups).sort(
      (a, b) => a.serial - b.serial
    );
    setSubjectGroups(sortedSubjectGroups);

    // Process student data with summed marks
    const studentsMap = new Map();

    subjectMarks.forEach((mark) => {
      if (!studentsMap.has(mark.student)) {
        studentsMap.set(mark.student, {
          id: mark.student,
          name: mark.student_name,
          roll: mark.student_roll,
          subjects: {},
          totalObtained: 0,
          totalMaxMark: 0,
          hasFailed: false,
        });
      }

      const student = studentsMap.get(mark.student);
      if (!student.subjects[mark.subject_serial]) {
        student.subjects[mark.subject_serial] = {
          obtained: 0,
          isAbsent: mark.is_absent,
          subjectName: mark.combined_subject_name,
        };
      }

      student.subjects[mark.subject_serial].obtained += mark.obtained;
      student.subjects[mark.subject_serial].isAbsent =
        student.subjects[mark.subject_serial].isAbsent || mark.is_absent;
    });

    // Calculate totals and determine pass/fail
    const processedStudents = Array.from(studentsMap.values()).map(
      (student) => {
        let totalObtained = 0;
        let totalMaxMark = 0;
        let hasFailed = false;

        const studentSubjects = sortedSubjectGroups.map((group) => {
          const studentSubject = student.subjects[group.serial] || {
            obtained: 0,
            isAbsent: true,
            subjectName: group.subjectName,
          };

          const isFailed =
            studentSubject.isAbsent || studentSubject.obtained < group.passMark;

          totalObtained += studentSubject.isAbsent
            ? 0
            : studentSubject.obtained;
          totalMaxMark += group.maxMark;

          if (isFailed) hasFailed = true;

          return {
            ...studentSubject,
            serial: group.serial,
            maxMark: group.maxMark,
            passMark: group.passMark,
            isFailed,
          };
        });

        const averageMark =
          totalMaxMark > 0 ? (totalObtained / totalMaxMark) * 100 : 0;
        const roundedAverage = Math.ceil(averageMark);
        const grade = getGradeForMarks(roundedAverage, hasFailed);

        return {
          ...student,
          subjects: studentSubjects,
          totalObtained,
          totalMaxMark,
          averageMark: roundedAverage,
          grade,
          hasFailed,
        };
      }
    );

    // Sort students by totalObtained (descending) for ranking
    const sortedByTotal = [...processedStudents].sort(
      (a, b) => b.totalObtained - a.totalObtained
    );

    // Assign rankings based on totalObtained, equal totals get same rank
    const rankedStudents = [];
    let currentRank = 1;
    let previousTotal = null;

    sortedByTotal.forEach((student, index) => {
      if (index > 0 && student.totalObtained !== previousTotal) {
        currentRank++;
      }

      rankedStudents.push({
        ...student,
        ranking: currentRank,
        rankDisplay: getDisplayRank(student, currentRank),
      });

      previousTotal = student.totalObtained;
    });

    // Sort by selected option for final display
    let finalStudents;
    if (sortBy === "ranking") {
      finalStudents = [...rankedStudents].sort((a, b) => a.ranking - b.ranking);
    } else {
      finalStudents = [...rankedStudents].sort((a, b) => a.roll - b.roll);
    }

    // Calculate statistics
    const totalStudents = finalStudents.length;
    const gradeDistribution = finalStudents.reduce((acc, res) => {
      acc[res.grade] = (acc[res.grade] || 0) + 1;
      return acc;
    }, {});
    const failedSubjects = finalStudents.reduce((acc, res) => {
      res.subjects.forEach((sub) => {
        if (sub.isFailed) {
          acc[sub.subjectName] = (acc[sub.subjectName] || 0) + 1;
        }
      });
      return acc;
    }, {});

    setStatistics({ totalStudents, gradeDistribution, failedSubjects });
    setResultData(finalStudents);
    setIsLoading(false);
  };

  // Generate bulk PDF report with behavior marks
  const generateBulkPDF = () => {
    if (!selectedExam || !selectedClassConfig || !selectedAcademicYear) {
      toast.error("অনুগ্রহ করে সমস্ত প্রয়োজনীয় ফিল্ড পূরণ করুন!");
      return;
    }

    if (filteredResultData.length === 0) {
      toast.error("কোনো ফলাফল তথ্য পাওয়া যায়নি!");
      return;
    }

    if (!instituteData) {
      toast.error("ইনস্টিটিউট তথ্য পাওয়া যায়নি!");
      return;
    }

    const institute = instituteData;
    const printWindow = window.open("", "_blank");
    
    const logoUrl = instituteData.institute_logo 
      ? instituteData.institute_logo 
      : "https://demoschool.eduworlderp.com/img/site/1730259402.png";

    // Get active behavior types
    const activeBehaviorTypes = behaviorTypes?.filter(bt => bt.is_active) || [];

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>শ্রেণির ফলাফল শীট</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 portrait; 
            border-width: 18px;
            border-color: rgba(219, 158, 48, 0.9);
            border-style: double;  
            padding: 20px;
          }
          body {
            font-family: 'Noto Sans Bengali', Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
          }
          .head {
            text-align: center;
            margin-top: 0px;
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
            font-size: 10px;
          }
          th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            font-size: 12px;
            color: #000;
            text-transform: uppercase;
          }
          td {
            color: #000;
            font-size: 12px;
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
            margin-top: 120px;
            font-size: 12px;
            color: #000;
          }
          .date {
            margin-top: 20px;
            text-align: right;
            font-size: 10px;
            color: #000;
          }
          .page-break { 
            page-break-before: always; 
          }
          .institute-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 10px;
            display: block;
            object-fit: contain;
          }
          .behavior-table {
            margin-top: 10px;
            font-size: 9px;
          }
          .behavior-table th,
          .behavior-table td {
            padding: 4px;
            font-size: 9px;
          }
          .behavior-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .optional-section {
            margin-top: 8px;
          }
          .behavior-section-title {
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            margin: 10px 0 5px 0;
            color: #000;
          }
        </style>
      </head>
      <body>
        ${filteredResultData
          .map(
            (student, index) => `
          <div class="${index > 0 ? "page-break" : ""}">
            <div class="head">
              <div class="institute-info">
                <img class="institute-logo" src="${logoUrl}" alt="Institute Logo" onerror="this.src='https://demoschool.eduworlderp.com/img/site/1730259402.png'" />
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
                নাম: ${student.name} | রোল: ${student.roll}
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
                    <th style="width: 40px;">ক্রমিক নং</th>
                    <th style="width: 180px;">বিষয়</th>
                    <th style="width: 80px;">প্রাপ্ত নম্বর</th>
                  </tr>
                </thead>
                <tbody>
                  ${student.subjects
                    .map(
                      (sub, idx) => `
                      <tr>
                        <td>${idx + 1}</td>
                        <td>${sub.subjectName}</td>
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
                    <td class="footer-label">মোট নম্বর :</td>
                    <td class="footer-value">${student.totalObtained} / ${
              student.totalMaxMark
            }</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td class="footer-label">গড় নম্বর :</td>
                    <td class="footer-value">${student.averageMark.toFixed(0)}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td class="footer-label">প্রাপ্ত বিভাগ :</td>
                    <td class="footer-value">${student.grade}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td class="footer-label">মেধা স্থান :</td>
                    <td class="footer-value ${
                      student.hasFailed ? "fail-cell" : ""
                    }">${student.rankDisplay}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            ${
              showBehaviorMarks && activeBehaviorTypes.length > 0
                ? `
            <div class="optional-section">
              <div class="behavior-section-title">আচরণ নম্বর</div>
              <div class="table-container">
                <table class="behavior-table">
                  <thead>
                    <tr>
                      <th style="width: 60px;">ক্রমিক</th>
                      ${activeBehaviorTypes
                        .map(
                          (bt) => `
                        <th>${bt.name}</th>
                      `
                        )
                        .join("")}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>১</td>
                      ${activeBehaviorTypes
                        .map((bt) => {
                          const mark = behaviorMarks[student.id]?.[bt.id] || "-";
                          return `<td>${mark}</td>`;
                        })
                        .join("")}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            `
                : ""
            }

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
          
          setTimeout(() => {
            window.print();
          }, 100);
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
      label: `${config.class_name}${
        config.section_name ? ` - ${config.section_name}` : ""
      }${config.shift_name ? ` (${config.shift_name})` : ""}`,
    })) || [];
  const academicYearOptions =
    academicYears?.map((year) => ({
      value: year.id,
      label: year.name,
    })) || [];

  // Prepare student options for search dropdown
  const studentOptions =
    resultData?.map((student) => ({
      value: student.id,
      label: `${student.name} - রোল: ${student.roll}`,
    })) || [];

  const gradeFormatOptions = [
    { value: "grade_name", label: "গ্রেড নাম (মমতায)" },
    { value: "grade_name_op", label: "গ্রেড কোড (A+)" },
  ];

  const sortOptions = [
    { value: "roll", label: "রোল অনুসারে" },
    { value: "ranking", label: "মেধা স্থান অনুসারে" },
  ];

  // Get active behavior types
  const activeBehaviorTypes = behaviorTypes?.filter(bt => bt.is_active) || [];

  // Combined loading state
  const isDataLoading =
    isLoading ||
    examsLoading ||
    classConfigsLoading ||
    academicYearsLoading ||
    studentsLoading ||
    subjectMarksLoading ||
    markConfigsLoading ||
    gradesLoading ||
    isInstituteLoading ||
    behaviorTypesLoading ||
    behaviorReportsLoading;

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                isDisabled={isDataLoading}
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
                isDisabled={isDataLoading}
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
                isDisabled={isDataLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="শিক্ষাবর্ষ নির্বাচন"
              />
            </div>
          </div>

          {/* Additional Options Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="relative">
              <label
                htmlFor="gradeFormatSelect"
                className="block font-medium text-[#441a05]"
              >
                গ্রেড ফরম্যাট
              </label>
              <Select
                id="gradeFormatSelect"
                options={gradeFormatOptions}
                value={gradeFormatOptions.find(
                  (option) => option.value === gradeFormat
                )}
                onChange={(option) => setGradeFormat(option.value)}
                isDisabled={isDataLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="গ্রেড ফরম্যাট নির্বাচন"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="sortSelect"
                className="block font-medium text-[#441a05]"
              >
                সাজানোর পদ্ধতি
              </label>
              <Select
                id="sortSelect"
                options={sortOptions}
                value={sortOptions.find((option) => option.value === sortBy)}
                onChange={(option) => setSortBy(option.value)}
                isDisabled={isDataLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="সাজানোর পদ্ধতি নির্বাচন"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="studentSelect"
                className="block font-medium text-[#441a05]"
              >
                শিক্ষার্থী নির্বাচন করুন
              </label>
              <Select
                id="studentSelect"
                options={studentOptions}
                value={selectedStudent}
                onChange={(option) => setSelectedStudent(option)}
                placeholder="সকল শিক্ষার্থী দেখুন অথবা নির্দিষ্ট শিক্ষার্থী খুঁজুন"
                isClearable={true}
                isDisabled={isDataLoading || !resultData.length}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="শিক্ষার্থী নির্বাচন"
                isSearchable={true}
              />
            </div>
            <div className="relative">
              <label className="block font-medium text-[#441a05] mb-2">
                আচরণ নম্বর দেখান
              </label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="showBehaviorMarks"
                  checked={showBehaviorMarks}
                  onChange={(e) => setShowBehaviorMarks(e.target.checked)}
                  className="w-4 h-4 text-[#DB9E30] bg-gray-100 border-gray-300 rounded focus:ring-[#DB9E30] focus:ring-2"
                  disabled={isDataLoading || activeBehaviorTypes.length === 0}
                />
                <label
                  htmlFor="showBehaviorMarks"
                  className="ml-2 text-sm text-[#441a05]"
                >
                  আচরণ নম্বর টেবিল দেখান
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={generateBulkPDF}
              disabled={isDataLoading || filteredResultData.length === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 btn-ripple ${
                isDataLoading || filteredResultData.length === 0
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-[#DB9E30] text-[##DB9E30] hover:text-white btn-glow"
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
        {isDataLoading ? (
          <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-lg mr-2" />
            ফলাফল লোড হচ্ছে...
          </p>
        ) : !selectedExam || !selectedClassConfig || !selectedAcademicYear ? (
          <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
            ফলাফল দেখতে উপরের ফিল্টার নির্বাচন করুন।
          </p>
        ) : filteredResultData.length === 0 ? (
          <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
            কোনো ফলাফল পাওয়া যায়নি।
          </p>
        ) : (
          filteredResultData.map((student) => (
            <div
              key={student.id}
              className="a4-portrait animate-fadeIn"
            >
              <div className="head">
                <div className="institute-info">
                  <img
                    className="w-20 mx-auto mb-5"
                    src={
                      instituteData?.institute_logo ||
                      "https://demoschool.eduworlderp.com/img/site/1730259402.png"
                    }
                    alt=""
                  />
                  <h1>{instituteData?.institute_name || "অজানা ইনস্টিটিউট"}</h1>
                  <p>
                    {instituteData?.institute_address || "ঠিকানা উপলব্ধ নয়"}
                  </p>
                </div>
                <h2 className="title font-semibold">
                  ব্যক্তিগত ফলাফল শীট -{" "}
                  {exams?.find((e) => e.id === Number(selectedExam?.value))
                    ?.name || "পরীক্ষা নির্বাচিত হয়নি"}
                </h2>
                <h3 className="student-info">
                  নাম: {student.name} | রোল: {student.roll}
                </h3>
                <h3 className="student-info">
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
                <h3 className="student-info">
                  শিক্ষাবর্ষ:{" "}
                  {academicYears?.find(
                    (y) => y.id === Number(selectedAcademicYear?.value)
                  )?.name || "শিক্ষাবর্ষ নির্বাচিত হয়নি"}
                </h3>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }} className="text-xs">
                        ক্রমিক নং
                      </th>
                      <th style={{ width: "180px" }} className="text-xs">
                        বিষয়
                      </th>
                      <th style={{ width: "80px" }} className="text-xs">
                        প্রাপ্ত নম্বর
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.subjects.map((sub, index) => (
                      <tr key={index}>
                        <td className="text-xs">{index + 1}</td>
                        <td className="text-xs">{sub.subjectName}</td>
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
                        মোট নম্বর :
                      </td>
                      <td className="border-none text-xs font-semibold">
                        {student.totalObtained} / {student.totalMaxMark}
                      </td>
                    </tr>
                    <tr className="border border-black">
                      <td className="border-none"></td>
                      <td className="text-right border-none text-xs font-semibold">
                        গড় নম্বর :
                      </td>
                      <td className="border-none text-xs font-semibold">
                        {student.averageMark.toFixed(0)}
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
                      <td
                        className={`border-none text-xs font-semibold ${
                          student.hasFailed ? "fail-cell" : ""
                        }`}
                      >
                        {student.rankDisplay}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Behavior Marks Table - Same design as PDF */}
              {showBehaviorMarks && activeBehaviorTypes.length > 0 && (
                <div className="optional-section">
                  <div className="behavior-section-title">আচরণ নম্বর</div>
                  <div className="table-container">
                    <table className="behavior-table">
                      <thead>
                        <tr>
                          <th style={{ width: "60px" }}>ক্রমিক</th>
                          {activeBehaviorTypes.map((bt) => (
                            <th className="max-h-[10px]" key={bt.id}>{bt.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>১</td>
                          {activeBehaviorTypes.map((bt) => {
                            const mark = behaviorMarks[student.id]?.[bt.id] || "-";
                            return (
                              <td key={bt.id}>{mark}</td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="signature">
                পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর: ____________________
              </div>
              <div className="date">
                রিপোর্ট তৈরির তারিখ: {new Date().toLocaleDateString("bn-BD")}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MarkSheet;