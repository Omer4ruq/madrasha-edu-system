import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaSpinner, FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Assuming React Router for navigation
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetSubjectMarksQuery } from '../../redux/features/api/marks/subjectMarksApi';
import { useGetGradeRulesQuery } from '../../redux/features/api/result/gradeRuleApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetSubjectMarkConfigsByClassQuery } from '../../redux/features/api/marks/subjectMarkConfigsApi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MarkSheet = () => {
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClassConfig, setSelectedClassConfig] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [resultData, setResultData] = useState([]);
  const [grades, setGrades] = useState([]);
  const markSheetRefs = useRef({});

  // Fetch data from APIs
  const { data: exams, isLoading: examsLoading } = useGetExamApiQuery();
  const { data: classConfigs, isLoading: classConfigsLoading } = useGetclassConfigApiQuery();
  const { data: academicYears, isLoading: academicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: students, isLoading: studentsLoading } = useGetStudentActiveByClassQuery(selectedClassConfig, {
    skip: !selectedClassConfig,
  });
  const { data: subjectMarks, isLoading: subjectMarksLoading } = useGetSubjectMarksQuery({
    skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear,
  });
  const { data: subjectConfigs, isLoading: subjectConfigsLoading } = useGetSubjectMarkConfigsByClassQuery(selectedClassConfig, {
    skip: !selectedClassConfig,
  });
  const { data: gradesData, isLoading: gradesLoading, error: gradesError } = useGetGradeRulesQuery();

  // Load grades from gradeRuleApi
  useEffect(() => {
    if (gradesData) {
      setGrades(gradesData.map(g => ({
        id: g.id,
        grade: g.grade_name,
        grade_name_op: g.grade_name_op,
        gpa: g.gpa,
        min_mark: g.min_mark,
        max_mark: g.max_mark,
        remarks: g.remarks,
      })));
    }
    if (gradesError) {
      toast.error(`গ্রেড লোড করতে ত্রুটি: ${gradesError.status || 'অজানা'}`);
    }
  }, [gradesData, gradesError]);

  // Calculate results for all students
  useEffect(() => {
    if (subjectMarks && students && subjectConfigs && selectedExam && selectedClassConfig && selectedAcademicYear && grades.length > 0) {
      const filteredMarks = subjectMarks.filter(
        (mark) =>
          mark.exam === Number(selectedExam) &&
          mark.class_name === classConfigs.find((c) => c.id === Number(selectedClassConfig))?.class_name &&
          mark.academic_year === Number(selectedAcademicYear)
      );

      const result = students.map((student) => {
        const studentMarks = filteredMarks.filter((mark) => mark.student === student.id);
        let totalObtained = 0;
        let totalMaxMarks = 0;
        let hasCompulsoryFail = false;
        const subjectResults = subjectConfigs.map((config) => {
          const mark = studentMarks.find((m) => m.mark_conf === config.mark_configs[0]?.id || m.mark_conf === config.mark_configs[1]?.id);
          const obtained = mark ? mark.obtained : 0;
          const isAbsent = mark ? mark.is_absent : false;
          const maxMark = config.mark_configs.reduce((sum, mc) => sum + mc.max_mark, 0);
          const passMark = config.mark_configs.reduce((sum, mc) => sum + mc.pass_mark, 0);
          const isFailed = !isAbsent && obtained < passMark;
          if (isFailed && config.subject_type === 'COMPULSORY') {
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

        const averageMarks = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;
        const grade = hasCompulsoryFail ? 'ফেল' : calculateGrade(averageMarks);
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
  }, [subjectMarks, students, subjectConfigs, selectedExam, selectedClassConfig, selectedAcademicYear, grades]);

  const calculateGrade = (averageMarks) => {
    const grade = grades.find((g) => averageMarks >= g.min_mark && averageMarks <= g.max_mark);
    return grade ? grade.grade : 'N/A';
  };

  // Function to download PDF for a specific student
  const downloadPDF = (studentId) => {
    if (!markSheetRefs.current[studentId]) return;

    html2canvas(markSheetRefs.current[studentId], { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [793, 1122], // A4 portrait dimensions at 96dpi
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 793;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Mark_Sheet_${resultData.find((s) => s.studentId === studentId)?.studentName}_${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}.pdf`);
      toast.success('PDF ডাউনলোড সম্পন্ন!');
    }).catch((error) => {
      toast.error('PDF তৈরি করতে ত্রুটি: ' + error.message);
    });
  };

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .a4-portrait {
            width: 793px; /* 210mm at 96dpi */
            height: 1122px; /* 297mm at 96dpi */
            margin: 10px auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 20px;
            box-sizing: border-box;
            font-family: 'Noto Sans Bengali', sans-serif;
            overflow-y: auto;
            page-break-before: always;
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
          .select-field {
            width: 100%;
            padding: 8px;
            background: transparent;
            color: #441A05;
            placeholder-color: #441A05;
            padding-left: 12px;
            focus:outline-none;
            border: 1px solid #9D9087;
            border-radius: 8px;
            transition: all 0.3s ease;
          }
          .select-field:focus {
            border-color: #DB9E30;
            box-shadow: 0 0 5px rgba(219, 158, 48, 0.5);
          }
          .select-field:disabled {
            background: #f5f5f5;
            opacity: 0.6;
          }
          .student-list {
            margin-top: 20px;
            display: grid;
            gap: 10px;
          }
          .student-link {
            padding: 10px;
            background: #f9f9f9;
            border: 1px solid #9D9087;
            border-radius: 8px;
            color: #441A05;
            text-decoration: none;
            transition: background 0.3s ease;
          }
          .student-link:hover {
            background: #DB9E30;
            color: white;
          }
          .table-container {
            border: 1px solid #9D9087;
            // border-radius: 8px;
            overflow-x: auto;
          }
          .table-header {
            background-color: rgba(219, 158, 48, 0.2);
            // padding: 8px;
            display: flex;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 2px solid #9D9087;
          }
          .table-row {
            border-bottom: 1px solid #9D9087;
            display: flex;
          }
          .table-cell {
            flex: 1;
            padding: 8px;
            font-size: 12px;
            color: #441A05;
            text-align: left;
            border-right: 1px solid #9D9087;
          }
          .serial-cell {
            flex: 0.5;
          }
          .subject-cell {
            flex: 1.5;
          }
          .merit-cell {
            flex: 0.8;
          }
          .fail-cell {
            background-color: #FFE6E6;
            color: #9B1C1C;
          }
          .absent-cell {
            background-color: #FFF7E6;
            color: #9B6500;
          }
          .summary-row {
            font-weight: bold;
            padding: 8px;
            background-color: rgba(219, 158, 48, 0.1);
            border-top: 2px solid #9D9087;
          }
          .header-title {
            font-size: 24px;
            font-weight: bold;
            color: #441A05;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header-subtitle {
            font-size: 14px;
            color: #441A05;
            margin-top: 4px;
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
          .summary-container {
            mt-4 flex justify-between absolute w-full left-0 px-5 bottom-5;
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
        `}
      </style>

      {/* Selection Form */}
      <div className="form-container">
        <h3 className="text-2xl font-bold text-[#441A05] tracking-tight mb-6">
          শ্রেণির ফলাফল শীট
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="select-field"
            disabled={examsLoading || gradesLoading}
          >
            <option value="">পরীক্ষা নির্বাচন করুন</option>
            {exams?.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
          <select
            value={selectedClassConfig}
            onChange={(e) => setSelectedClassConfig(e.target.value)}
            className="select-field"
            disabled={classConfigsLoading || gradesLoading}
          >
            <option value="">ক্লাস নির্বাচন করুন</option>
            {classConfigs?.map((config) => (
              <option key={config.id} value={config.id}>
                {config.class_name} - {config.section_name} ({config.shift_name})
              </option>
            ))}
          </select>
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="select-field"
            disabled={academicYearsLoading || gradesLoading}
          >
            <option value="">শিক্ষাবর্ষ নির্বাচন করুন</option>
            {academicYears?.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Individual Mark Sheet (Rendered per student page) */}
      {(examsLoading || classConfigsLoading || academicYearsLoading || studentsLoading || subjectMarksLoading || subjectConfigsLoading || gradesLoading) ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-[#441A05]" />
        </div>
      ) : resultData.length > 0 ? (
        resultData.map((student) => (
          <div key={student.studentId} className="a4-portrait animate-fadeIn" ref={(el) => (markSheetRefs.current[student.studentId] = el)}>
            <div className="text-center mb-6">
              <h2 className="header-title">
                আল-মদিনা ইসলামিক মাদ্রাসা
              </h2>
              <p className="header-subtitle">
                ঠিকানা: ১২৩, মাদ্রাসা রোড, ঢাকা, বাংলাদেশ
              </p>
              <p className="header-subtitle">
                ফোন: +৮৮০ ১৭১২৩৪৫৬৭৮ | ইমেইল: info@almadina.edu.bd
              </p>
              <h3 className="header-title mt-4">
                ব্যক্তিগত ফলাফল শীট - {exams?.find((e) => e.id === Number(selectedExam))?.name}
              </h3>
              <p className="header-subtitle">
                নাম: {student.studentName} | রোল: {student.rollNo}
              </p>
              <p className="header-subtitle">
                ক্লাস: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.class_name} |
                শাখা: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.section_name} |
                শিফট: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.shift_name}
              </p>
              <p className="header-subtitle">
                শিক্ষাবর্ষ: {academicYears?.find((y) => y.id === Number(selectedAcademicYear))?.name}
              </p>
            </div>

            {/* Result Table */}
            <div className="table-container">
              <div className="table-header flex">
                <div className="table-cell serial-cell">ক্রমিক নং</div>
                <div className="table-cell subject-cell">বিষয়</div>
                <div className="table-cell">বিষয় নম্বর</div>
              </div>
              {student.subjects.map((sub, index) => (
                <div key={index} className="table-row flex">
                  <div className="table-cell serial-cell">{index + 1}</div>
                  <div className="table-cell subject-cell">{sub.subject}</div>
                  <div
                    className={`table-cell ${sub.isAbsent ? 'absent-cell' : !sub.isAbsent && sub.obtained < sub.passMark ? 'fail-cell' : ''}`}
                  >
                    {sub.isAbsent ? 'অনুপস্থিত' : sub.obtained}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Section */}
            <div className="mt-4 flex justify-between absolute w-full left-0 px-5 bottom-5">
              <div className="flex">
                <div className="text-sm text-black font-semibold">গ্রেড :</div>
                <div className="ml-4 text-sm text-black font-semibold">{student.grade}</div>
              </div>
              <div className="flex">
                <div className="text-sm text-black font-semibold">মোট নম্বর :</div>
                <div className="ml-4 text-sm text-black font-semibold">{student.totalObtained} / {student.totalMaxMarks}</div>
              </div>
              <div className="flex">
                <div className="text-sm text-black font-semibold">মেধা স্থান :</div>
                <div className="ml-4 text-sm text-black font-semibold">{student.rankDisplay}</div>
              </div>
              <div className="flex">
                <div className="text-sm text-black font-semibold">গড় নম্বর :</div>
                <div className="ml-4 text-sm text-black font-semibold">{student.averageMarks}</div>
              </div>
            </div>

            {/* <button
              onClick={() => downloadPDF(student.studentId)}
              className="download-btn"
              disabled={!student}
            >
              <FaDownload /> PDF ডাউনলোড
            </button> */}
          </div>
        ))
      ) : (
        <p className="text-center text-[#441A05]/70">ফলাফল দেখতে উপরের ফিল্টার নির্বাচন করুন।</p>
      )}
    </div>
  );
};

export default MarkSheet;