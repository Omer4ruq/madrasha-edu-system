import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaSpinner, FaDownload } from 'react-icons/fa';
import { PDFViewer, Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetSubjectMarksQuery } from '../../redux/features/api/marks/subjectMarksApi';
import { useGetGradeRulesQuery } from '../../redux/features/api/result/gradeRuleApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetSubjectMarkConfigsByClassQuery } from '../../redux/features/api/marks/subjectMarkConfigsApi';

// Register Bangla font with alternative source and fallback
Font.register({
  family: 'NotoSansBengali',
  src: 'https://fonts.gstatic.com/ea/notosansbengali/v3/NotoSansBengali-Regular.ttf',
});
Font.register({
  family: 'ArialUnicodeMS',
  src: 'https://cdn.jsdelivr.net/npm/arial-unicode-ms/ArialUnicodeMS.ttf',
});
Font.registerHyphenationCallback((word) => [word]); // Prevent text splitting issues

// PDF styles synced with original frontend layout
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
    fontFamily: 'NotoSansBengali',
    color: '#000',
    backgroundColor: '#FFF',
    display: 'flex',
    flexDirection: 'column',
    width: 595.28, // A4 portrait width at 72dpi
    height: 841.89, // A4 portrait height at 72dpi
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  subHeader: {
    fontSize: 14,
    color: '#000',
    marginTop: 4,
  },
  table: {
    border: '1px solid #000',
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(219, 158, 48, 0.2)',
    borderBottom: '2px solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
  },
  cell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    color: '#000',
    textAlign: 'left',
    borderRight: '1px solid #000',
  },
  serialCell: { flex: 0.5 },
  subjectCell: { flex: 1.5 },
  scoreCell: { flex: 1 },
  failCell: { backgroundColor: '#FFE6E6', color: '#9B1C1C' },
  absentCell: { backgroundColor: '#FFF7E6', color: '#9B6500' },
  summary: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
});

const PersonalMarkSheet = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClassConfig, setSelectedClassConfig] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [marksData, setMarksData] = useState(null);
  const [grades, setGrades] = useState([]);
  const markSheetRef = useRef(null);

  // Fetch data from APIs
  const { data: exams, isLoading: examsLoading } = useGetExamApiQuery();
  const { data: classConfigs, isLoading: classConfigsLoading } = useGetclassConfigApiQuery();
  const { data: academicYears, isLoading: academicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: students, isLoading: studentsLoading } = useGetStudentActiveByClassQuery(selectedClassConfig, {
    skip: !selectedClassConfig,
  });
  const { data: subjectMarks, isLoading: subjectMarksLoading } = useGetSubjectMarksQuery({
    exam: selectedExam,
    classConfig: selectedClassConfig,
    academicYear: selectedAcademicYear,
    student: selectedStudent,
    skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear || !selectedStudent,
  }, {
    skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear || !selectedStudent,
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

  // Calculate personal marks data and merit position
  useEffect(() => {
    if (subjectMarks && subjectConfigs && selectedStudent && selectedExam && selectedClassConfig && selectedAcademicYear && grades.length > 0 && students) {
      const studentMarks = subjectMarks.filter(
        (mark) =>
          mark.student === Number(selectedStudent) &&
          mark.exam === Number(selectedExam) &&
          mark.class_name === classConfigs.find((c) => c.id === Number(selectedClassConfig))?.class_name &&
          mark.academic_year === Number(selectedAcademicYear)
      );

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
          isFailed,
          isAbsent,
          subjectType: config.subject_type,
        };
      });

      const averageMarks = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;
      const grade = hasCompulsoryFail ? 'ফেল' : calculateGrade(averageMarks);

      // Calculate merit position
      const allStudentMarks = students.map((student) => {
        const studentData = subjectMarks.filter((mark) => mark.student === student.id);
        let studentTotal = 0;
        studentData.forEach((mark) => {
          const config = subjectConfigs.find((c) => c.mark_configs.some((mc) => mc.id === mark.mark_conf));
          if (config) {
            studentTotal += mark.obtained;
          }
        });
        return { id: student.id, total: studentTotal };
      });
      allStudentMarks.sort((a, b) => b.total - a.total);
      const meritPosition = allStudentMarks.findIndex((s) => s.id === Number(selectedStudent)) + 1;

      setMarksData({
        studentName: students.find((s) => s.id === Number(selectedStudent))?.name || 'Unknown',
        rollNo: students.find((s) => s.id === Number(selectedStudent))?.roll_no || 'N/A',
        subjects: subjectResults,
        totalObtained,
        totalMaxMarks,
        averageMarks: averageMarks.toFixed(2),
        grade,
        meritPosition,
      });
    }
  }, [subjectMarks, subjectConfigs, selectedStudent, selectedExam, selectedClassConfig, selectedAcademicYear, grades, students]);

  const calculateGrade = (averageMarks) => {
    const grade = grades.find((g) => averageMarks >= g.min_mark && averageMarks <= g.max_mark);
    return grade ? grade.grade : 'N/A';
  };

  const handleDownload = async () => {
    if (!marksData) {
      toast.error('কোনো ফলাফল ডেটা পাওয়া যায়নি। দয়া করে ফিল্টার চেক করুন।');
      return;
    }

    const PdfDocument = (
      <Document>
        <Page size="A4" orientation="portrait" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>আল-মদিনা ইসলামিক মাদ্রাসা</Text>
            <Text style={styles.subHeader}>ঠিকানা: ১২৩, মাদ্রাসা রোড, ঢাকা, বাংলাদেশ</Text>
            <Text style={styles.subHeader}>ফোন: +৮৮০ ১৭১২৩৪৫৬৭৮ | ইমেইল: info@almadina.edu.bd</Text>
            <Text style={styles.title}>
              ব্যক্তিগত ফলাফল শীট - {exams?.find((e) => e.id === Number(selectedExam))?.name}
            </Text>
            <Text style={styles.subHeader}>
              নাম: {marksData.studentName} | রোল: {marksData.rollNo}
            </Text>
            <Text style={styles.subHeader}>
              ক্লাস: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.class_name} |
              শাখা: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.section_name} |
              শিফট: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.shift_name}
            </Text>
            <Text style={styles.subHeader}>
              শিক্ষাবর্ষ: {academicYears?.find((y) => y.id === Number(selectedAcademicYear))?.name}
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.serialCell]}>ক্রমিক নং</Text>
              <Text style={[styles.cell, styles.subjectCell]}>বিষয়</Text>
              <Text style={styles.cell}>বিষয় নম্বর</Text>
            </View>
            {marksData.subjects.map((sub, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.cell, styles.serialCell]}>{index + 1}</Text>
                <Text style={[styles.cell, styles.subjectCell]}>{sub.subject}</Text>
                <Text
                  style={[
                    styles.cell,
                    sub.isFailed ? styles.failCell : sub.isAbsent ? styles.absentCell : {},
                  ]}
                >
                  {sub.isAbsent ? 'অনুপস্থিত' : sub.obtained}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>গ্রেড: {marksData.grade}</Text>
            <Text style={styles.summaryText}>মোট নম্বর: {marksData.totalObtained} / {marksData.totalMaxMarks}</Text>
            <Text style={styles.summaryText}>মেধা স্থান: {marksData.meritPosition || 'N/A'}</Text>
            <Text style={styles.summaryText}>গড় নম্বর: {marksData.averageMarks}</Text>
          </View>
        </Page>
      </Document>
    );

    try {
      const asPdf = pdf(PdfDocument);
      const blob = await asPdf.toBlob();
      console.log('PDF Blob generated. Sample text check:', 'ক্রমিক নং' in blob); // Debug text presence
      saveAs(blob, `Personal_Mark_Sheet_${selectedExam}_${selectedClassConfig}_${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}.pdf`);
      toast.success('PDF ডাউনলোড সফল!');
    } catch (error) {
      console.error('PDF Download Error:', error);
      toast.error(`PDF ডাউনলোডে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
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
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
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
            border: 1px solid #000;
            overflow-x: auto;
          }
          .table-header {
            background-color: rgba(219, 158, 48, 0.2);
            display: flex;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
          }
          .table-row {
            border-bottom: 1px solid #000;
            display: flex;
          }
          .table-cell {
            flex: 1;
            padding: 8px;
            font-size: 12px;
            color: #000;
            text-align: left;
            border-right: 1px solid #000;
          }
          .serial-cell {
            flex: 0.5;
          }
          .subject-cell {
            flex: 1.5;
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
          ব্যক্তিগত ফলাফল শীট
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="select-field"
            disabled={studentsLoading || !selectedClassConfig}
          >
            <option value="">শিক্ষার্থী নির্বাচন করুন</option>
            {students?.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} (রোল: {student.roll_no})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Personal Mark Sheet in Frontend */}
      {(examsLoading || classConfigsLoading || academicYearsLoading || studentsLoading || subjectMarksLoading || subjectConfigsLoading || gradesLoading) ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-[#441A05]" />
        </div>
      ) : marksData ? (
        <div>
          <div ref={markSheetRef} className="a4-portrait animate-fadeIn">
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
                নাম: {marksData.studentName} | রোল: {marksData.rollNo}
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
              {marksData.subjects.map((sub, index) => (
                <div key={index} className="table-row flex">
                  <div className="table-cell serial-cell">{index + 1}</div>
                  <div className="table-cell subject-cell">{sub.subject}</div>
                  <div
                    className={`table-cell ${sub.isFailed ? 'fail-cell' : sub.isAbsent ? 'absent-cell' : ''}`}
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
                <div className="ml-4 text-sm text-black font-semibold">{marksData.grade}</div>
              </div>
              <div className="flex">
                <div className="text-sm text-black font-semibold">মোট নম্বর :</div>
                <div className="ml-4 text-sm text-black font-semibold">{marksData.totalObtained} / {marksData.totalMaxMarks}</div>
              </div>
              <div className="flex">
                <div className="text-sm text-black font-semibold">মেধা স্থান :</div>
                <div className="ml-4 text-sm text-black font-semibold">{marksData.meritPosition || 'N/A'}</div>
              </div>
              <div className="flex">
                <div className="text-sm text-black font-semibold">গড় নম্বর :</div>
                <div className="ml-4 text-sm text-black font-semibold">{marksData.averageMarks}</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="download-btn mx-auto"
            disabled={!marksData}
          >
            <FaDownload /> PDF ডাউনলোড
          </button>
        </div>
      ) : (
        <p className="text-center text-[#441A05]/70">ফলাফল দেখতে উপরের ফিল্টার নির্বাচন করুন।</p>
      )}
    </div>
  );
};

export default PersonalMarkSheet;