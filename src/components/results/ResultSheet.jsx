import React, { useState, useEffect } from 'react';
import { Toaster, toast } from "react-hot-toast";
import { FaSpinner, FaDownload } from "react-icons/fa";
import Select from "react-select";
import { useGetFilteredSubjectMarksQuery } from '../../redux/features/api/marks/subjectMarksApi';
import { useGetFilteredMarkConfigsQuery } from '../../redux/features/api/marks/markConfigsApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetGradeRulesQuery } from '../../redux/features/api/result/gradeRuleApi';
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";
import selectStyles from "../../utilitis/selectStyles";

// Custom CSS (aligned with PDF styles)
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
  table { 
    width: 100%; 
    border-collapse: collapse; 
    font-size: 10px; 
  }
  th, td { 
    border: 1px solid #000; 
    padding: 0px 5px; 
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
  .grade-table {
    position: absolute;
    top: 25px;
    right: 20px;
    width: 150px;
    border-collapse: collapse;
    font-size: 10px;
  }
  .grade-table th, .grade-table td {
    border: 1px solid #000;
    padding: 0px 5px;
    text-align: center;
    text-wrap: nowrap;
  }
  .grade-table th {
    background-color: #f5f5f5;
    font-weight: bold;
    color: #000;
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
  .a4-landscape {
    max-width: 1123px;
    margin: 0 auto 20px;
    background: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    padding: 0 20px 20px;
    box-sizing: border-box;
    font-family: 'Noto Sans Bengali', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .page-break {
    page-break-before: always;
  }
  .report-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
  }
  .institute-logo {
    width: 80px;
    height: 80px;
    margin-right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .exam-info-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin: 10px 0;
  }
  .exam-info-box {
    border: 1px solid #DB9E30;
    padding: 8px 12px;
    border-radius: 5px;
    background-color: #FFF9E6;
    font-size: 14px;
    font-weight: bold;
  }
`;

const ResultSheet = () => {
  // State for selected values
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClassConfig, setSelectedClassConfig] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [gradeFormat, setGradeFormat] = useState('grade_name'); // 'grade_name' or 'grade_name_op'
  const [sortBy, setSortBy] = useState('roll'); // 'roll' or 'ranking'
  
  // State for processed data
  const [studentResults, setStudentResults] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [grades, setGrades] = useState([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    gradeDistribution: {},
    failedSubjects: {},
  });

  // Fetch all necessary data
  const { data: exams = [] } = useGetExamApiQuery();
  const { data: classConfigs = [] } = useGetclassConfigApiQuery();
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  const { data: gradeRules = [], isLoading: gradesLoading, error: gradesError } = useGetGradeRulesQuery();
  const { data: instituteData, isLoading: isInstituteLoading, error: instituteError } = useGetInstituteLatestQuery();

  // Fetch filtered subject marks
  const { data: subjectMarks = [], isLoading: isLoadingMarks, error: subjectMarksError } = useGetFilteredSubjectMarksQuery(
    {
      exam_id: selectedExam,
      profile_class_id: selectedClassConfig,
      academic_year: selectedAcademicYear
    },
    { skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear }
  );

  // Find selected class config
  const currentClassConfig = classConfigs.find(config => config.id === parseInt(selectedClassConfig));

  // Fetch mark configs
  const { data: markConfigs = [], isLoading: isLoadingConfigs, error: subjectConfigsError } = useGetFilteredMarkConfigsQuery(
    { class_id: currentClassConfig?.class_id },
    { skip: !currentClassConfig }
  );

  // Load grades from gradeRules
  useEffect(() => {
    if (gradeRules) {
      setGrades(
        gradeRules.map((g) => ({
          id: g.id,
          grade: g.grade_name,
          gradeOp: g.grade_name_op,
          min: g.min_mark,
          max: g.max_mark,
          remarks: g.remarks,
        }))
      );
    } else if (gradesError) {
      toast.error("গ্রেড তালিকা লোড করতে ব্যর্থ হয়েছে!");
    }
  }, [gradeRules, gradesError]);

  // Helper function to get fail grade based on format
  const getFailGrade = () => {
    const failRule = gradeRules.find(rule => rule.min_mark === 0);
    if (failRule) {
      return gradeFormat === 'grade_name' ? failRule.grade_name : failRule.grade_name_op;
    }
    return gradeFormat === 'grade_name' ? 'রাসেব' : 'F';
  };

  // Helper function to get grade based on marks and format
  const getGradeForMarks = (averageMark, hasFailed) => {
    if (hasFailed) return getFailGrade();
    
    const gradeRule = gradeRules.find(rule => 
      averageMark >= rule.min_mark && averageMark <= rule.max_mark
    );
    
    if (gradeRule) {
      return gradeFormat === 'grade_name' ? gradeRule.grade_name : gradeRule.grade_name_op;
    }
    
    return getFailGrade();
  };

  // Helper function to get display rank
  const getDisplayRank = (student, rank) => {
    if (student.hasFailed) {
      const failGrade = getFailGrade();
      return `${failGrade}(${rank})`;
    }
    return rank.toString();
  };

  // Process data when all requirements are met
  useEffect(() => {
    if (subjectMarks.length > 0 && markConfigs.length > 0 && !isLoadingMarks && !isLoadingConfigs) {
      processResultData();
    }
  }, [subjectMarks, markConfigs, isLoadingMarks, isLoadingConfigs, gradeFormat, sortBy]);

  const processResultData = () => {
    setIsLoading(true);
    
    // Create mapping of subject_serial to combined_subject_name
    const subjectNameMap = {};
    subjectMarks.forEach(mark => {
      if (!subjectNameMap[mark.subject_serial] && mark.combined_subject_name) {
        subjectNameMap[mark.subject_serial] = mark.combined_subject_name;
      }
    });

    // Group mark configs by subject_serial to get sum of max_mark and pass_mark
    const subjectConfigGroups = {};
    markConfigs.forEach(config => {
      if (!subjectConfigGroups[config.subject_serial]) {
        subjectConfigGroups[config.subject_serial] = {
          serial: config.subject_serial,
          maxMark: 0,
          passMark: 0,
          subjectName: subjectNameMap[config.subject_serial] || config.subject_name
        };
      }
      subjectConfigGroups[config.subject_serial].maxMark += config.max_mark;
      subjectConfigGroups[config.subject_serial].passMark += config.pass_mark;
    });

    // Convert to array and sort by serial
    const sortedSubjectGroups = Object.values(subjectConfigGroups)
      .sort((a, b) => a.serial - b.serial);
    setSubjectGroups(sortedSubjectGroups);

    // Process student data with summed marks
    const studentsMap = new Map();
    
    subjectMarks.forEach(mark => {
      if (!studentsMap.has(mark.student)) {
        studentsMap.set(mark.student, {
          id: mark.student,
          name: mark.student_name,
          roll: mark.student_roll,
          subjects: {},
          totalObtained: 0,
          totalMaxMark: 0,
          hasFailed: false
        });
      }
      
      const student = studentsMap.get(mark.student);
      if (!student.subjects[mark.subject_serial]) {
        student.subjects[mark.subject_serial] = {
          obtained: 0,
          isAbsent: mark.is_absent,
          subjectName: mark.combined_subject_name 
        };
      }
      
      student.subjects[mark.subject_serial].obtained += mark.obtained;
      student.subjects[mark.subject_serial].isAbsent = 
        student.subjects[mark.subject_serial].isAbsent || mark.is_absent;
    });

    // Calculate totals and determine pass/fail
    const processedStudents = Array.from(studentsMap.values()).map(student => {
      let totalObtained = 0;
      let totalMaxMark = 0;
      let hasFailed = false;

      const studentSubjects = sortedSubjectGroups.map(group => {
        const studentSubject = student.subjects[group.serial] || {
          obtained: 0,
          isAbsent: true,
          subjectName: group.subjectName
        };

        const isFailed = studentSubject.isAbsent || 
                        studentSubject.obtained < group.passMark;

        totalObtained += studentSubject.isAbsent ? 0 : studentSubject.obtained;
        totalMaxMark += group.maxMark;

        if (isFailed) hasFailed = true;

        return {
          ...studentSubject,
          serial: group.serial,
          maxMark: group.maxMark,
          passMark: group.passMark,
          isFailed
        };
      });

      const averageMark = totalMaxMark > 0 ? (totalObtained / totalMaxMark) * 100 : 0;
      const roundedAverage = Math.ceil(averageMark);
      
      const grade = getGradeForMarks(roundedAverage, hasFailed);

      return {
        ...student,
        subjects: studentSubjects,
        totalObtained,
        totalMaxMark,
        averageMark: roundedAverage,
        grade,
        hasFailed
      };
    });

    // Sort students by totalObtained (descending) for ranking
    const sortedByTotal = [...processedStudents].sort((a, b) => b.totalObtained - a.totalObtained);

    // Assign rankings based on totalObtained, equal totals get same rank
    const rankedStudents = [];
    let currentRank = 1;
    let previousTotal = null;

    sortedByTotal.forEach((student, index) => {
      if (index > 0 && student.totalObtained !== previousTotal) {
        // Different total from previous student, increment rank by 1 only
        currentRank++;
      }
      
      rankedStudents.push({
        ...student,
        ranking: currentRank,
        displayRank: getDisplayRank(student, currentRank)
      });
      
      previousTotal = student.totalObtained;
    });

    // Sort by selected option for final display
    let finalStudents;
    if (sortBy === 'ranking') {
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
    setStudentResults(finalStudents);
    setIsLoading(false);
  };

  // Handle API errors
  useEffect(() => {
    if (subjectMarksError) toast.error("বিষয়ের মার্কস লোড করতে ব্যর্থ হয়েছে!");
    if (subjectConfigsError) toast.error("বিষয় কনফিগ লোড করতে ব্যর্থ হয়েছে!");
    if (instituteError) toast.error("ইনস্টিটিউট তথ্য লোড করতে ব্যর্থ হয়েছে!");
  }, [subjectMarksError, subjectConfigsError, instituteError]);

  // Generate PDF Report - Now receives all data as parameters
 const generatePDFReport = (
  studentResults, 
  subjectGroups, 
  grades, 
  statistics, 
  selectedExam, 
  selectedClassConfig, 
  selectedAcademicYear, 
  exams, 
  classConfigs, 
  academicYears, 
  instituteData,
  gradeFormat,
  sortBy
) => {
  if (!selectedExam || !selectedClassConfig || !selectedAcademicYear) {
    toast.error("অনুগ্রহ করে সমস্ত প্রয়োজনীয় ফিল্ড পূরণ করুন!");
    return;
  }

  if (!studentResults.length) {
    toast.error("কোনো ফলাফল তথ্য পাওয়া যায়নি!");
    return;
  }

  if (!instituteData) {
    toast.error("ইনস্টিটিউট তথ্য পাওয়া যায়নি!");
    return;
  }

  const institute = instituteData;
  const printWindow = window.open("", "_blank");
  
  // Show loading message while image is loading
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>লোড হচ্ছে...</title>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: 'Noto Sans Bengali', Arial, sans-serif;  
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .loading {
          text-align: center;
          font-size: 18px;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="loading">রিপোর্ট প্রস্তুত করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</div>
    </body>
    </html>
  `);
  printWindow.document.close();

  // Preload the image
  const img = new Image();
  img.src = instituteData.institute_logo ? instituteData.institute_logo : 'https://demoschool.eduworlderp.com/img/site/1730259402.png';
  
  img.onload = function() {
    // Image is loaded, now generate the report
    generateReportContent(printWindow, img.src);
  };
  
  img.onerror = function() {
    // If image fails to load, use fallback
    generateReportContent(printWindow, 'https://demoschool.eduworlderp.com/img/site/1730259402.png');
  };

  function generateReportContent(printWindow, logoUrl) {
    // Calculate how many students per page (20 rows per page)
    const studentsPerPage = 20;
    const totalPages = Math.ceil(studentResults.length / studentsPerPage);
    
    let htmlContent = `
    <!DOCTYPE html>
  <html>
  <head>
    <title>ফলাফল শীট</title>
    <meta charset="UTF-8">
  <style>
      @page { 
        size: A4 landscape; 
        margin: 0;
        padding: 15px;
      }
      body { 
        font-family: 'Noto Sans Bengali', Arial, sans-serif;  
        font-size: 12px; 
        margin: 0;
        padding: 0;
        background-color: #ffffff;
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        font-size: 10px; 
      }
      th, td { 
        border: 1px solid #000; 
        padding: 5px; 
        font-weight: bold;
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
        font-weight: bold;
      }
      .fail-cell {
        background-color: #FFE6E6;
        color: #9B1C1C;
      }
      .absent-cell {
        background-color: #FFF7E6;
        color: #000;
      }
      .header { 
        display: flex;
      }
      .institute-logo {
        width: 80px;
        height: 80px;
        margin-right: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .institute-info {
        flex-grow: 1;
        margin: 15px 0 0;
      }
      .institute-info h1 {
        font-size: 18px;
        margin: 0;
        color: #000;
      }
      .institute-info p {
        font-size: 12px;
        margin: 5px 0;
        color: #000;
      }
      .exam-info-container {
        display: flex;
        justify-content: center; 
        flex-wrap: wrap;
        gap: 10px;
        margin: 10px 0;
      }
      .exam-info-box {
        border: 1px solid #DB9E30;
        padding: 8px 12px;
        background-color: #FFF9E6;
        font-size: 12px;
        font-weight: bold;
      }
      .title {
        font-size: 18px;
        color: #DB9E30;
        margin: -30px 0 10px;
        text-align: center;
      }
      .grade-table {
        top: 0px;
        right: 0px;
        width: 150px;
        border-collapse: collapse;
        font-size: 10px;
        z-index: 10;
      }
      .grade-table th, .grade-table td {
        border: 1px solid #000;
        padding: 3px;
        font-weight: bold;
        text-align: center;
        text-wrap: nowrap;
      }
      .grade-table th {
        background-color: #f5f5f5;
        font-weight: bold;
        color: #000;
      }
      .stats-container {
        text-align: center;
        font-weight: bold;
        margin-top: 20px;
        display: flex;
        gap:20px;
        justify-content: space-between;
        font-size: 10px;
        page-break-inside: avoid;
      }
      .stats-box {
        border: 1px solid #000;
        padding: 5px 10px;
        width: 48%;
        background-color: #f5f5f5;
        page-break-inside: avoid;
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
        page-break-inside: avoid;
      }
      .institute-logo img {
        width: 80px !important;
        height: 80px !important;
        max-width: 80px !important;
        max-height: 80px !important;
        object-fit: contain !important;
        display: block !important;
      }
      .page-break {
        page-break-before: always;
      }
      .footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: center;
        font-size: 10px;
      }
    </style>
  </head>
  <body>
  `;

    // Create each page
    for (let page = 0; page < totalPages; page++) {
      const startIndex = page * studentsPerPage;
      const endIndex = Math.min(startIndex + studentsPerPage, studentResults.length);
      const pageStudents = studentResults.slice(startIndex, endIndex);
      
      htmlContent += `
    <div class="${page > 0 ? 'page-break' : ''}">
      <div class="header">
        <div class="institute-logo">
          <img src="${logoUrl}" alt="Institute Logo" />
        </div>
        <div class="institute-info">
          <h1>${instituteData.institute_name || "অজানা ইনস্টিটিউট"}</h1>
          <p>${instituteData.institute_address || "ঠিকানা উপলব্ধ নয়"}</p>
        </div>
        <table class="grade-table">
        <thead>
          <tr>
            <th>গ্রেড নাম</th>
            <th>সর্বনিম্ন</th>
            <th>সর্বোচ্চ</th>
          </tr>
        </thead>
        <tbody>
          ${grades
            .map(
              (grade) => `
            <tr>
              <td>${gradeFormat === 'grade_name' ? grade.grade : grade.gradeOp}</td>
              <td>${grade.min}</td>
              <td>${grade.max}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      </div>
      
      <h2 class="title">ফলাফল শীট</h2>
      
      <div class="exam-info-container">
        <div class="exam-info-box">
          পরীক্ষা: ${exams?.find((e) => e.id === Number(selectedExam))?.name || "পরীক্ষা নির্বাচিত হয়নি"}
        </div>
        <div class="exam-info-box">
          ক্লাস: ${classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.class_name || "ক্লাস নির্বাচিত হয়নি"}
        </div>
        <div class="exam-info-box">
          শাখা: ${classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.section_name || "শাখা নির্বাচিত হয়নি"}
        </div>
        <div class="exam-info-box">
          শিফট: ${classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.shift_name || "শিফট নির্বাচিত হয়নি"}
        </div>
        <div class="exam-info-box">
          শিক্ষাবর্ষ: ${academicYears?.find((y) => y.id === Number(selectedAcademicYear))?.name || "শিক্ষাবর্ষ নির্বাচিত হয়নি"}
        </div>
      </div>

      
      
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">মেধা স্থান</th>
            <th style="width: 40px;">রোল</th>
            <th style="width: 100px;">নাম</th>
            ${subjectGroups
              .map(
                (subject) =>
                  `<th style="width: 50px;">${subject.subjectName || "N/A"}</th>`
              )
              .join("")}
            <th style="width: 40px;">মোট</th>
            <th style="width: 40px;">গড়</th>
            <th style="width: 40px;">গ্রেড</th>
          </tr>
        </thead>
        <tbody>
          ${pageStudents
            .map(
              (student) => `
            <tr>
              <td>${student.displayRank}</td>
              <td>${student.roll || "N/A"}</td>
              <td>${student.name || "N/A"}</td>
              ${student.subjects
                .map(
                  (sub) => `
                <td class="${
                  sub.isFailed
                    ? "fail-cell"
                    : sub.isAbsent
                    ? "absent-cell"
                    : ""
                }">
                  ${sub.isAbsent ? "অনুপস্থিত" : sub.obtained}
                </td>
              `
                )
                .join("")}
              <td>${student.totalObtained}</td>
              <td>${student.averageMark.toFixed(0)}</td>
              <td style="${
                student.hasFailed
                  ? "color: #9B1C1C; background-color: #FFE6E6;"
                  : ""
              }">${student.grade}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
      ${page === totalPages - 1 ? `
      <div class="stats-container">
        <div class="stats-box">
          <div class="stats-title">পরিসংখ্যান</div>
          <div class="stats-text">
            মোট শিক্ষার্থী: ${statistics.totalStudents},
          </div>
          <div class="stats-text">গ্রেড বিতরণ:</div>
          ${Object.entries(statistics.gradeDistribution)
            .map(
              ([grade, count]) => `
            <div class="stats-text">${grade}: ${count} জন,</div>
          `
            )
            .join("")}
        </div>
        <div class="stats-box">
          <div class="stats-title">ফেল করা বিষয়</div>
          ${
            Object.entries(statistics.failedSubjects).length > 0
              ? Object.entries(statistics.failedSubjects)
                  .map(
                    ([subject, count]) => `
                <div class="stats-text">${subject}: ${count} জন,</div>
              `
                  )
                  .join("")
              : `<div class="stats-text">কোনো বিষয়ে ফেল নেই</div>`
          }
        </div>
      </div>
      
      <div class="date">
        রিপোর্ট তৈরির তারিখ: ${new Date().toLocaleDateString("bn-BD")}
      </div>
      ` : ''}
      
    </div>
  `;
    }

    htmlContent += `
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
      
      // Small delay to ensure all content is rendered before printing
      setTimeout(() => {
        window.print();
      }, 100);
    </script>
  </body>
  </html>
      `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success("PDF রিপোর্ট তৈরি হয়েছে!");
  }
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

  const gradeFormatOptions = [
    { value: 'grade_name', label: 'গ্রেড নাম (মুমতায)' },
    { value: 'grade_name_op', label: 'গ্রেড কোড (A+)' }
  ];

  const sortOptions = [
    { value: 'roll', label: 'রোল অনুসারে' },
    { value: 'ranking', label: 'মেধা স্থান অনুসারে' }
  ];

  // Update loading condition to include API loading states
  const isDataLoading =
    isLoading || isLoadingMarks || isLoadingConfigs || gradesLoading || isInstituteLoading;

  return (
    <div className="py-8 w-full relative">
      <style>{customStyles}</style>
      <div className="mx-auto">
        {/* Selection Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight mb-6">
            ফলাফল শীট তৈরি করুন
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
                  examOptions.find((option) => option.value === selectedExam) ||
                  null
                }
                onChange={(option) =>
                  setSelectedExam(option ? option.value : "")
                }
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
                    (option) => option.value === selectedClassConfig
                  ) || null
                }
                onChange={(option) =>
                  setSelectedClassConfig(option ? option.value : "")
                }
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
                    (option) => option.value === selectedAcademicYear
                  ) || null
                }
                onChange={(option) =>
                  setSelectedAcademicYear(option ? option.value : "")
                }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                value={gradeFormatOptions.find(option => option.value === gradeFormat)}
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
                value={sortOptions.find(option => option.value === sortBy)}
                onChange={(option) => setSortBy(option.value)}
                isDisabled={isDataLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="সাজানোর পদ্ধতি নির্বাচন"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => generatePDFReport(
                studentResults, 
                subjectGroups, 
                grades, 
                statistics, 
                selectedExam, 
                selectedClassConfig, 
                selectedAcademicYear, 
                exams, 
                classConfigs, 
                academicYears, 
                instituteData,
                gradeFormat,
                sortBy
              )}
              disabled={isDataLoading || !studentResults.length}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 btn-ripple ${
                isDataLoading || !studentResults.length
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

        {/* Result Display (aligned with PDF layout) */}
        <div className="">
          {isDataLoading ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
              <FaSpinner className="animate-spin text-lg mr-2" />
              ফলাফল লোড হচ্ছে...
            </p>
          ) : !selectedExam || !selectedClassConfig || !selectedAcademicYear ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
              অনুগ্রহ করে পরীক্ষা, ক্লাস এবং শিক্ষাবর্ষ নির্বাচন করুন।
            </p>
          ) : studentResults.length === 0 ? (
            <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
              কোনো ফলাফল পাওয়া যায়নি।
            </p>
          ) : (
            <div className="a4-landscape">
              <div className="head">
                <div className="institute-info">
                      <img className='w-20 h-20 mb-3 mx-auto object-contain' src={instituteData.institute_logo ? instituteData.institute_logo : 'https://demoschool.eduworlderp.com/img/site/1730259402.png'} />
                  <h1>{instituteData?.institute_name || "অজানা ইনস্টিটিউট"}</h1>
                  <p>
                    {instituteData?.institute_address || "ঠিকানা উপলব্ধ নয়"}
                  </p>
                </div>
                <h2 className="title">ফলাফল শীট</h2>
                <h3 className="text-[12px] mb-0 text-black">
                  পরীক্ষা:{" "}
                  {exams?.find((e) => e.id === Number(selectedExam))?.name ||
                    "পরীক্ষা নির্বাচিত হয়নি"}
                </h3>
                <h3 className="text-[12px] mb-0 text-black">
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
                <h3 className="text-[12px] mb-0 text-black">
                  শিক্ষাবর্ষ:{" "}
                  {academicYears?.find(
                    (y) => y.id === Number(selectedAcademicYear)
                  )?.name || "শিক্ষাবর্ষ নির্বাচিত হয়নি"}
                </h3>
              </div>
              <table className="grade-table">
                <thead>
                  <tr>
                    <th>গ্রেড নাম</th>
                    <th>সর্বনিম্ন</th>
                    <th>সর্বোচ্চ</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id}>
                      <td>{gradeFormat === 'grade_name' ? grade.grade : grade.gradeOp}</td>
                      <td>{grade.min}</td>
                      <td>{grade.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}>মেধা স্থান</th>
                      <th style={{ width: "40px" }}>রোল</th>
                      <th style={{ width: "100px" }}>নাম</th>
                      {subjectGroups?.map((subject) => (
                        <th key={subject.serial} style={{ width: "50px" }}>
                          {subject.subjectName || "N/A"}
                        </th>
                      ))}
                      <th style={{ width: "40px" }}>মোট</th>
                      <th style={{ width: "40px" }}>গড়</th>
                      <th style={{ width: "40px" }}>গ্রেড</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentResults.map((student) => (
                      <tr key={student.id}>
                        <td>{student.displayRank}</td>
                        <td>{student.roll || "N/A"}</td>
                        <td>{student.name || "N/A"}</td>
                        {student.subjects.map((sub) => (
                          <td
                            key={`${student.id}-${sub.serial}`}
                            className={
                              sub.isFailed
                                ? "fail-cell"
                                : sub.isAbsent
                                ? "absent-cell"
                                : ""
                            }
                          >
                            {sub.isAbsent ? "অনুপস্থিত" : sub.obtained}
                          </td>
                        ))}
                        <td>{student.totalObtained}</td>
                        <td>{student.averageMark.toFixed(0)}</td>
                        <td className={`${student.hasFailed ? "text-red-700 bg-red-100":""}`}>{student.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="stats-container">
                <div className="stats-box">
                  <div className="stats-title">পরিসংখ্যান</div>
                  <div className="stats-text">
                    মোট শিক্ষার্থী: {statistics.totalStudents},
                  </div>
                  <div className="stats-text">গ্রেড বিতরণ:</div>
                  {Object.entries(statistics.gradeDistribution).map(
                    ([grade, count]) => (
                      <div key={grade} className="stats-text">
                        {grade}: {count} জন,
                      </div>
                    )
                  )}
                </div>
                <div className="stats-box">
                  <div className="stats-title">ফেল করা বিষয়</div>
                  {Object.entries(statistics.failedSubjects).length > 0 ? (
                    Object.entries(statistics.failedSubjects).map(
                      ([subject, count]) => (
                        <div key={subject} className="stats-text">
                          {subject}: {count} জন,
                        </div>
                      )
                    )
                  ) : (
                    <div className="stats-text">কোনো বিষয়ে ফেল নেই</div>
                  )}
                </div>
              </div>
              <div className="date">
                রিপোর্ট তৈরির তারিখ: {new Date().toLocaleDateString("bn-BD")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultSheet;