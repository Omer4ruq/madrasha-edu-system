import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaSpinner, FaDownload } from 'react-icons/fa';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetSubjectMarksQuery } from '../../redux/features/api/marks/subjectMarksApi';
import { useGetGradeRulesQuery } from '../../redux/features/api/result/gradeRuleApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetSubjectMarkConfigsByClassQuery } from '../../redux/features/api/marks/subjectMarkConfigsApi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MeritList = () => {
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClassConfig, setSelectedClassConfig] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [meritData, setMeritData] = useState([]);
  const [grades, setGrades] = useState([]);
  const meritListRef = useRef(null);

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

  // Calculate merit list
  useEffect(() => {
    if (subjectMarks && students && subjectConfigs && selectedExam && selectedClassConfig && selectedAcademicYear && grades.length > 0) {
      const filteredMarks = subjectMarks.filter(
        (mark) =>
          mark.exam === Number(selectedExam) &&
          mark.class_name === classConfigs.find((c) => c.id === Number(selectedClassConfig))?.class_name &&
          mark.academic_year === Number(selectedAcademicYear)
      );

      const merit = students.map((student) => {
        const studentMarks = filteredMarks.filter((mark) => mark.student === student.id);
        let totalObtained = 0;
        let totalMaxMarks = 0;
        let hasCompulsoryFail = false;
        let hasChoosableFail = false;
        subjectConfigs.forEach((config) => {
          const mark = studentMarks.find((m) => m.mark_conf === config.mark_configs[0]?.id || m.mark_conf === config.mark_configs[1]?.id);
          const obtained = mark ? mark.obtained : 0;
          const maxMark = config.mark_configs.reduce((sum, mc) => sum + mc.max_mark, 0);
          const passMark = config.mark_configs.reduce((sum, mc) => sum + mc.pass_mark, 0);
          const isFailed = obtained < passMark && !mark?.is_absent;
          if (isFailed && config.subject_type === 'COMPULSORY') {
            hasCompulsoryFail = true;
          } else if (isFailed && config.subject_type === 'CHOOSABLE') {
            hasChoosableFail = true;
          }
          totalObtained += obtained;
          totalMaxMarks += maxMark;
        });

        const averageMarks = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;
        const grade = hasCompulsoryFail ? 'মান্না' : hasChoosableFail ? calculateGrade(averageMarks) : calculateGrade(averageMarks);
        return {
          studentId: student.id,
          studentName: student.name,
          rollNo: student.roll_no,
          totalObtained,
          averageMarks: averageMarks.toFixed(2),
          grade,
        };
      });

      // Sort by total marks for ranking
      const rankedMerit = merit
        .sort((a, b) => b.totalObtained - a.totalObtained)
        .map((res, index) => ({
          ...res,
          rankDisplay: `${index + 1}`,
        }));

      setMeritData(rankedMerit);
    }
  }, [subjectMarks, students, subjectConfigs, selectedExam, selectedClassConfig, selectedAcademicYear, grades]);

  const calculateGrade = (averageMarks) => {
    if (averageMarks < 33) return 'মান্না'; // Updated to match new grade rule for 0-32
    const grade = grades.find((g) => averageMarks >= g.min_mark && averageMarks <= g.max_mark);
    return grade ? grade.grade : 'মান্না'; // Default to 'মান্না' if no grade matches
  };

  // Function to download PDF
  const downloadPDF = () => {
    if (!meritListRef.current) return;

    html2canvas(meritListRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [793, 1122], // A4 dimensions at 96dpi
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 793;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Merit_List_${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}.pdf`);
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
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .a4-portrait {
            width: 793px; /* 210mm at 96dpi */
            height: 1122px; /* 297mm at 96dpi */
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
          .table-container {
            border: 1px solid #9D9087;
            border-radius: 8px;
            overflow-x: auto;
          }
          .table-header {
            background-color: rgba(219, 158, 48, 0.2);
            padding: 8px;
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
          .name-cell {
            flex: 1.5;
          }
          .rank-cell {
            flex: 0.8;
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
          মেধা তালিকা
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="select-field"
            disabled={examsLoading || classConfigsLoading || academicYearsLoading || gradesLoading}
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
            disabled={classConfigsLoading || examsLoading || academicYearsLoading || gradesLoading}
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
            disabled={academicYearsLoading || examsLoading || classConfigsLoading || gradesLoading}
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

      {/* Merit List */}
      {(examsLoading || classConfigsLoading || academicYearsLoading || studentsLoading || subjectMarksLoading || subjectConfigsLoading || gradesLoading) ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-[#441A05]" />
        </div>
      ) : meritData.length > 0 ? (
        <div>
          <div ref={meritListRef} className="a4-portrait animate-fadeIn">
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
                মেধা তালিকা - {exams?.find((e) => e.id === Number(selectedExam))?.name}
              </h3>
              <p className="header-subtitle">
                ক্লাস: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.class_name} |
                শাখা: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.section_name} |
                শিফট: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.shift_name}
              </p>
              <p className="header-subtitle">
                শিক্ষাবর্ষ: {academicYears?.find((y) => y.id === Number(selectedAcademicYear))?.name}
              </p>
            </div>

            <div className="table-container">
              <div className="table-header flex">
                <div className="table-cell rank-cell">মেধা স্থান</div>
                <div className="table-cell name-cell">নাম</div>
                <div className="table-cell">রোল নম্বর</div>
                <div className="table-cell">মোট</div>
                <div className="table-cell">গড়</div>
                <div className="table-cell">গ্রেড</div>
              </div>
              {meritData.map((student, index) => (
                <div key={student.studentId} className="table-row flex">
                  <div className="table-cell rank-cell">{student.rankDisplay}</div>
                  <div className="table-cell name-cell">{student.studentName}</div>
                  <div className="table-cell">{student.rollNo}</div>
                  <div className="table-cell">{student.totalObtained}</div>
                  <div className="table-cell">{student.averageMarks}</div>
                  <div className="table-cell">{student.grade}</div>
                </div>
              ))}
            </div>
          </div>
          {/* <button
            onClick={downloadPDF}
            className="download-btn"
            disabled={meritData.length === 0}
          >
            <FaDownload /> PDF ডাউনলোড
          </button> */}
        </div>
      ) : (
        <p className="text-center text-[#441A05]/70">মেধা তালিকা তৈরি করতে উপরের ফিল্টার নির্বাচন করুন।</p>
      )}
    </div>
  );
};

export default MeritList;