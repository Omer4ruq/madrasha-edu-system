import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { FaSpinner, FaPrint, FaDownload } from "react-icons/fa";
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver"; // For PDF download
import { useGetExamApiQuery } from "../../redux/features/api/exam/examApi";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetStudentActiveByClassQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetSubjectMarksQuery } from "../../redux/features/api/marks/subjectMarksApi";
import { useGetSubjectMarkConfigsByClassQuery } from "../../redux/features/api/marks/subjectMarkConfigsApi";
import { useGetGradeRulesQuery } from "../../redux/features/api/result/gradeRuleApi";

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "NotoSansBengali",
    color: "#441A05",
    backgroundColor: "#FFFFFF",
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 10,
    marginTop: 5,
  },
  gradeTable: {
    marginTop: 10,
    marginBottom: 10,
    border: "1pt solid #9D9087",
    borderRadius: 4,
  },
  table: {
    border: "1pt solid #9D9087",
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #9D9087",
  },
  tableHeader: {
    backgroundColor: "#DB9E30",
    opacity: 0.2,
    flexDirection: "row",
    padding: 5,
  },
  cell: {
    padding: 5,
    flex: 1,
    textAlign: "center",
    fontSize: 8,
  },
  headerCell: {
    padding: 5,
    flex: 1,
    textAlign: "center",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  rollCell: { flex: 0.5 },
  nameCell: { flex: 1.5 },
  subjectCell: { flex: 0.8 }, // Optimized for 10-12 subjects
  totalCell: { flex: 0.6 },
  gradeCell: { flex: 0.6 },
  rankCell: { flex: 0.5 },
  avgCell: { flex: 0.6 },
  failCell: { backgroundColor: "#FFE6E6", color: "#9B1C1C" },
  absentCell: { backgroundColor: "#FFF7E6", color: "#9B6500" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statsBox: {
    border: "1pt solid #9D9087",
    borderRadius: 4,
    padding: 5,
    width: "48%",
    backgroundColor: "#DB9E30",
    opacity: 0.1,
  },
  statsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statsText: {
    fontSize: 8,
  },
});

// Register Bangla font
import { Font } from "@react-pdf/renderer";
Font.register({
  family: "NotoSansBengali",
  src: "https://fonts.gstatic.com/ea/notosansbengali/v3/NotoSansBengali-Regular.ttf",
});

const ResultSheet = () => {
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClassConfig, setSelectedClassConfig] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [grades, setGrades] = useState([]);
  const [resultData, setResultData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    gradeDistribution: {},
    failedSubjects: {},
  });
  const [showPDF, setShowPDF] = useState(false);

  // Fetch data from APIs
  const { data: exams, isLoading: examsLoading } = useGetExamApiQuery();
  const { data: classConfigs, isLoading: classConfigsLoading } =
    useGetclassConfigApiQuery();
  const { data: academicYears, isLoading: academicYearsLoading } =
    useGetAcademicYearApiQuery();
  const { data: students, isLoading: studentsLoading } =
    useGetStudentActiveByClassQuery(selectedClassConfig, {
      skip: !selectedClassConfig,
    });
  const { data: subjectMarks, isLoading: subjectMarksLoading } =
    useGetSubjectMarksQuery(
      {
        exam: selectedExam,
        classConfig: selectedClassConfig,
        academicYear: selectedAcademicYear,
      },
      {
        skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear,
      }
    );
  const { data: subjectConfigs, isLoading: subjectConfigsLoading } =
    useGetSubjectMarkConfigsByClassQuery(selectedClassConfig, {
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

  // Calculate results when data changes
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
          mark.exam === Number(selectedExam) &&
          mark.class_name ===
            classConfigs.find((c) => c.id === Number(selectedClassConfig))
              ?.class_name &&
          mark.academic_year === Number(selectedAcademicYear)
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

      // Sort by average marks for ranking
      const rankedResult = result
        .sort((a, b) => b.averageMarks - a.averageMarks)
        .map((res, index) => ({ ...res, rank: index + 1 }));

      // Calculate statistics
      const totalStudents = rankedResult.length;
      const gradeDistribution = rankedResult.reduce((acc, res) => {
        acc[res.grade] = (acc[res.grade] || 0) + 1;
        return acc;
      }, {});
      const failedSubjects = rankedResult.reduce((acc, res) => {
        res.subjects.forEach((sub) => {
          if (sub.isFailed) {
            acc[sub.subject] = (acc[sub.subject] || 0) + 1;
          }
        });
        return acc;
      }, {});

      setResultData(rankedResult);
      setStatistics({ totalStudents, gradeDistribution, failedSubjects });
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
      (g) => averageMarks >= g.min && averageMarks <= g.max
    );
    return grade ? grade.grade : "N/A";
  };

  const handlePrint = () => {
    setShowPDF(true);
  };

  const handleDownload = async () => {
    const doc = <ResultPDF />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    saveAs(blob, `Result_Sheet_${selectedExam}_${selectedClassConfig}.pdf`);
  };

  // PDF Document Component
  const ResultPDF = () => (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>আল-মদিনা ইসলামিক মাদ্রাসা</Text>
          <Text style={styles.subHeader}>
            ঠিকানা: ১২৩, মাদ্রাসা রোড, ঢাকা, বাংলাদেশ
          </Text>
          <Text style={styles.subHeader}>
            ফোন: +৮৮০ ১৭১২৩৪৫৬৭৮ | ইমেইল: info@almadina.edu.bd
          </Text>
          <Text style={styles.title}>
            ফলাফল শীট -{" "}
            {exams?.find((e) => e.id === Number(selectedExam))?.name}
          </Text>
          <Text style={styles.subHeader}>
            ক্লাস:{" "}
            {
              classConfigs?.find((c) => c.id === Number(selectedClassConfig))
                ?.class_name
            }{" "}
            | শাখা:{" "}
            {
              classConfigs?.find((c) => c.id === Number(selectedClassConfig))
                ?.section_name
            }{" "}
            | শিফট:{" "}
            {
              classConfigs?.find((c) => c.id === Number(selectedClassConfig))
                ?.shift_name
            }
          </Text>
          <Text style={styles.subHeader}>
            শিক্ষাবর্ষ:{" "}
            {
              academicYears?.find((y) => y.id === Number(selectedAcademicYear))
                ?.name
            }
          </Text>
        </View>

        {/* Grade Rule Chart */}
        <View style={styles.gradeTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>গ্রেড নাম</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>গ্রেড কোড</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>GPA</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>সর্বনিম্ন</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>সর্বোচ্চ</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>মন্তব্য</Text>
          </View>
          {grades.map((grade) => (
            <View key={grade.id} style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 2 }]}>{grade.grade}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{grade.grade_name_op}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{grade.gpa}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{grade.min}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{grade.max}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{grade.remarks || "N/A"}</Text>
            </View>
          ))}
        </View>

        {/* Result Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.rollCell]}>রোল</Text>
            <Text style={[styles.headerCell, styles.nameCell]}>নাম</Text>
            {subjectConfigs?.map((config) => (
              <Text key={config.id} style={[styles.headerCell, styles.subjectCell]}>
                {config.subject_name}
              </Text>
            ))}
            <Text style={[styles.headerCell, styles.totalCell]}>মোট</Text>
            <Text style={[styles.headerCell, styles.avgCell]}>আবারেজ</Text>
            <Text style={[styles.headerCell, styles.gradeCell]}>গ্রেড</Text>
            <Text style={[styles.headerCell, styles.rankCell]}>র্যাঙ্ক</Text>
          </View>
          {resultData.map((student) => (
            <View key={student.studentId} style={styles.tableRow}>
              <Text style={[styles.cell, styles.rollCell]}>{student.rollNo}</Text>
              <Text style={[styles.cell, styles.nameCell]}>{student.studentName}</Text>
              {student.subjects.map((sub, index) => (
                <Text
                  key={index}
                  style={[
                    styles.cell,
                    styles.subjectCell,
                    sub.isFailed ? styles.failCell : sub.isAbsent ? styles.absentCell : {},
                  ]}
                >
                  {sub.isAbsent ? "অনুপস্থিত" : `${sub.obtained}/${sub.maxMark}`}
                </Text>
              ))}
              <Text style={[styles.cell, styles.totalCell]}>{student.totalObtained}</Text>
              <Text style={[styles.cell, styles.avgCell]}>{student.averageMarks}%</Text>
              <Text style={[styles.cell, styles.gradeCell]}>{student.grade}</Text>
              <Text style={[styles.cell, styles.rankCell]}>{student.rank}</Text>
            </View>
          ))}
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>পরিসংখ্যান</Text>
            <Text style={styles.statsText}>মোট শিক্ষার্থী: {statistics.totalStudents}</Text>
            <Text style={styles.statsText}>গ্রেড বিতরণ:</Text>
            {Object.entries(statistics.gradeDistribution).map(([grade, count]) => (
              <Text key={grade} style={styles.statsText}>
                {grade}: {count} জন
              </Text>
            ))}
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>ফেল করা বিষয়</Text>
            {Object.entries(statistics.failedSubjects).length > 0 ? (
              Object.entries(statistics.failedSubjects).map(([subject, count]) => (
                <Text key={subject} style={styles.statsText}>
                  {subject}: {count} জন
                </Text>
              ))
            ) : (
              <Text style={styles.statsText}>কোনো বিষয়ে ফেল নেই</Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );

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
          .a4-landscape {
            width: 1123px; /* 297mm at 96dpi */
            height: 794px; /* 210mm at 96dpi */
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 20px;
            box-sizing: border-box;
            font-family: 'Noto Sans Bengali', sans-serif;
            overflow: hidden;
          }
          .table-container {
            // border: 1px solid #9D9087;
            border-radius: 4px;
            overflow-x: auto;
          }
          .table-header {
            background-color: rgba(219, 158, 48, 0.2);
            
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
            // border: 1px solid #9D9087;
          }
          .table-row {
            // border-bottom: 1px solid #9D9087;
            display: flex;
          }
          .table-cell {
            flex: 1;
            font-size: 8px;
            color: #441A05;
            text-align: center;
            border: 1px solid #9D9087; 
          }
          .roll-cell {
            flex: 0.5;
            width: 40px;
          }
          .name-cell {
            flex: 1.5;
            width: 120px;
          }
          .subject-cell {
            flex: 0.8;
            width: 60px;
          }
          .total-cell {
            flex: 0.6;
            width: 50px;
          }
          .grade-cell {
            flex: 0.6;
            width: 50px;
          }
          .rank-cell {
            flex: 0.5;
            width: 40px;
          }
          .avg-cell {
            flex: 0.6;
            width: 50px;
          }
          .fail-cell {
            background-color: #FFE6E6;
            color: #9B1C1C;
          }
          .absent-cell {
            background-color: #FFF7E6;
            color: #9B6500;
          }
          .stats-container {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            font-size: 8px;
          }
          .stats-box {
            border: 1px solid #9D9087;
            border-radius: 4px;
            padding: 5px;
            width: 48%;
            background-color: rgba(219, 158, 48, 0.1);
          }
          .stats-title {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
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
          @media print {
            .a4-landscape {
              width: 297mm;
              height: 210mm;
              box-shadow: none;
            }
            .no-print {
              display: none;
            }
          }
        `}
      </style>

      {/* Selection Form */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl no-print">
        <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight mb-6">
          ফলাফল শীট তৈরি করুন
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
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
            className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
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
            className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
            disabled={academicYearsLoading || gradesLoading}
          >
            <option value="">শিক্ষাবর্ষ নির্বাচন করুন</option>
            {academicYears?.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
          <div className="flex space-x-4">
            <button
              onClick={handlePrint}
              className="relative inline-flex items-center px-4 py-2 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
              disabled={
                !selectedExam ||
                !selectedClassConfig ||
                !selectedAcademicYear ||
                gradesLoading
              }
              title="প্রিন্ট করুন"
            >
              <FaPrint className="w-4 h-4 mr-2" />
              প্রিন্ট করুন
            </button>
            <button
              onClick={handleDownload}
              className="relative inline-flex items-center px-4 py-2 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
              disabled={
                !selectedExam ||
                !selectedClassConfig ||
                !selectedAcademicYear ||
                gradesLoading ||
                resultData.length === 0
              }
              title="ডাউনলোড করুন"
            >
              <FaDownload className="w-4 h-4 mr-2" />
              ডাউনলোড করুন
            </button>
          </div>
        </div>
      </div>

      {/* Result Sheet in Frontend */}
      {examsLoading ||
      classConfigsLoading ||
      academicYearsLoading ||
      studentsLoading ||
      subjectMarksLoading ||
      subjectConfigsLoading ||
      gradesLoading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-[#441a05]" />
        </div>
      ) : resultData.length > 0 ? (
        <div className="a4-landscape p-5 space-y-4 bg-white text-gray-900 shadow-md border border-gray-300 print:p-4 print:text-sm relative">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-[#441a05]">
              আল-মদিনা ইসলামিক মাদ্রাসা
            </h2>
            <p className="text-[10px] text-[#441a05]">
              ঠিকানা: ১২৩, মাদ্রাসা রোড, ঢাকা, বাংলাদেশ
            </p>
            <p className="text-[10px] text-[#441a05]">
              ফোন: +৮৮০ ১৭১২৩৪৫৬৭৮ | ইমেইল: info@almadina.edu.bd
            </p>
            <h3 className="text-lg font-semibold text-[#441a05] mt-2">
              ফলাফল শীট -{" "}
              {exams?.find((e) => e.id === Number(selectedExam))?.name}
            </h3>
            <p className="text-[10px] text-[#441a05]">
              ক্লাস:{" "}
              {
                classConfigs?.find((c) => c.id === Number(selectedClassConfig))
                  ?.class_name
              }{" "}
              | শাখা:{" "}
              {
                classConfigs?.find((c) => c.id === Number(selectedClassConfig))
                  ?.section_name
              }{" "}
              | শিফট:{" "}
              {
                classConfigs?.find((c) => c.id === Number(selectedClassConfig))
                  ?.shift_name
              }
            </p>
            <p className="text-[10px] text-[#441a05]">
              শিক্ষাবর্ষ:{" "}
              {
                academicYears?.find((y) => y.id === Number(selectedAcademicYear))
                  ?.name
              }
            </p>
          </div>

          {/* Grade Rule Table */}
          <div className="table-container w-fit mx-auto absolute top-0 right-5">
            <div className="table-header flex">
              <div className=" px-2 w-24 border border-[#9D9087]">গ্রেড নাম</div>
              {/* <div className="flex-1 px-2 w-16 border border-[#9D9087]">গ্রেড কোড</div> */}
              {/* <div className="flex-1 px-2 w-16 border border-[#9D9087]">GPA</div> */}
              <div className=" px-2 w-16 border border-[#9D9087]">সর্বনিম্ন</div>
              <div className=" px-2 w-16 border border-[#9D9087]">সর্বোচ্চ</div>
              <div className=" px-2 w-24 border border-[#9D9087]">মন্তব্য</div>
            </div>
            {grades.map((grade) => (
              <div key={grade.id} className="flex">
                <div className="text-[10px] text-center flex-2 w-24 border border-[#9D9087]">{grade.grade}</div>
                {/* <div className="table-cell flex-1 w-16 border border-[#9D9087]">{grade.grade_name_op}</div> */}
                {/* <div className="table-cell flex-1 w-16 border border-[#9D9087]">{grade.gpa}</div> */}
                <div className="text-[10px] text-center flex-1 w-16 border border-[#9D9087]">{grade.min}</div>
                <div className="text-[10px] text-center flex-1 w-16 border border-[#9D9087]">{grade.max}</div>
                <div className="text-[10px] text-center flex-2 w-24 border border-[#9D9087]">{grade.remarks || "N/A"}</div>
              </div>
            ))}
          </div>

          {/* Result Table */}
          <div className="table-container translate-y-20">
            <div className="">
              {/* Table Header */}
              <div className="table-header flex">
                <div className="roll-cell border border-[#9D9087]">রোল</div>
                <div className="name-cell border border-[#9D9087]">নাম</div>
                {subjectConfigs?.map((config) => (
                  <div key={config.id} className="subject-cell border border-[#9D9087] leading-4">
                    {config.subject_name}
                  </div>
                ))}
                <div className="total-cell border border-[#9D9087]">মোট</div>
                <div className="avg-cell border border-[#9D9087]">আবারেজ</div>
                <div className="grade-cell border border-[#9D9087]">গ্রেড</div>
                <div className="rank-cell border border-[#9D9087]">র্যাঙ্ক</div>
              </div>

              {/* Table Body */}
              {resultData.map((student) => (
                <div key={student.studentId} className="table-row overflow-hidden">
                  <div className="table-cell roll-cell border">{student.rollNo}</div>
                  <div className="table-cell name-cell border">{student.studentName}</div>
                  {student.subjects.map((sub, idx) => (
                    <div
                      key={idx}
                      className={`table-cell text-ce subject-cell border ${
                        sub.isFailed
                          ? "fail-cell"
                          : sub.isAbsent
                          ? "absent-cell"
                          : ""
                      }`}
                    >
                      {sub.isAbsent ? "অনুপস্থিত" : `${sub.obtained}`}
                    </div>
                  ))}
                  <div className="table-cell total-cell border font-semibold">
                    {student.totalObtained}
                  </div>
                  <div className="table-cell avg-cell border font-semibold">
                    {student.averageMarks}
                  </div>
                  <div className="table-cell grade-cell border font-bold">
                    {student.grade}
                  </div>
                  <div className="table-cell rank-cell border">{student.rank}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-[#441a05]/70">
          ফলাফল তৈরি করতে উপরের ফিল্টার নির্বাচন করুন।
        </p>
      )}

      {/* PDF Preview */}
      {showPDF && resultData.length > 0 && (
        <div className="animate-fadeIn mt-8 no-print">
          <PDFViewer style={{ width: "100%", height: "600px" }}>
            <ResultPDF />
          </PDFViewer>
        </div>
      )}
    </div>
  );
};

export default ResultSheet;