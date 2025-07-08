import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { FaSpinner, FaPrint } from "react-icons/fa";
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
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
    textAlign: "left",
    fontSize: 8,
  },
  headerCell: {
    padding: 5,
    flex: 1,
    textAlign: "left",
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  rollCell: { flex: 0.5 },
  nameCell: { flex: 1.5 },
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
    useGetSubjectMarksQuery({
      skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear,
    });
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
          grade: g.grade_name, // Bangla grade name
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
          grade,
        };
      });

      // Sort by total marks for ranking
      const rankedResult = result
        .sort((a, b) => b.totalObtained - a.totalObtained)
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
              <Text style={[styles.cell, { flex: 1 }]}>
                {grade.grade_name_op}
              </Text>
              <Text style={[styles.cell, { flex: 1 }]}>{grade.gpa}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{grade.min}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{grade.max}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>
                {grade.remarks || "N/A"}
              </Text>
            </View>
          ))}
        </View>

        {/* Result Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.rollCell]}>রোল</Text>
            <Text style={[styles.headerCell, styles.nameCell]}>নাম</Text>
            {subjectConfigs?.map((config) => (
              <Text key={config.id} style={styles.headerCell}>
                {config.subject_name}
              </Text>
            ))}
            <Text style={styles.headerCell}>মোট</Text>
            <Text style={styles.headerCell}>গ্রেড</Text>
            <Text style={styles.headerCell}>র্যাঙ্ক</Text>
          </View>
          {resultData.map((student) => (
            <View key={student.studentId} style={styles.tableRow}>
              <Text style={[styles.cell, styles.rollCell]}>
                {student.rollNo}
              </Text>
              <Text style={[styles.cell, styles.nameCell]}>
                {student.studentName}
              </Text>
              {student.subjects.map((sub, index) => (
                <Text
                  key={index}
                  style={[
                    styles.cell,
                    sub.isFailed
                      ? styles.failCell
                      : sub.isAbsent
                      ? styles.absentCell
                      : {},
                  ]}
                >
                  {sub.isAbsent
                    ? "অনুপস্থিত"
                    : `${sub.obtained}/${sub.maxMark}`}
                </Text>
              ))}
              <Text style={styles.cell}>{student.totalObtained}</Text>
              <Text style={styles.cell}>{student.grade}</Text>
              <Text style={styles.cell}>{student.rank}</Text>
            </View>
          ))}
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>পরিসংখ্যান</Text>
            <Text style={styles.statsText}>
              মোট শিক্ষার্থী: {statistics.totalStudents}
            </Text>
            <Text style={styles.statsText}>গ্রেড বিতরণ:</Text>
            {Object.entries(statistics.gradeDistribution).map(
              ([grade, count]) => (
                <Text key={grade} style={styles.statsText}>
                  {grade}: {count} জন
                </Text>
              )
            )}
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>ফেল করা বিষয়</Text>
            {Object.entries(statistics.failedSubjects).length > 0 ? (
              Object.entries(statistics.failedSubjects).map(
                ([subject, count]) => (
                  <Text key={subject} style={styles.statsText}>
                    {subject}: {count} জন
                  </Text>
                )
              )
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
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            padding: 20px;
            box-sizing: border-box;
            font-family: 'Noto Sans Bengali', sans-serif;
          }
          .table-container {
            border: 1px solid #9D9087;
            border-radius: 4px;
            overflow-x: auto;
          }
          .table-header {
            background-color: rgba(219, 158, 48, 0.2);
            padding: 5px;
          }
          .table-row {
            border-bottom: 1px solid #9D9087;
            display: flex;
          }
          .table-cell {
            flex: 1;
            padding: 5px;
            font-size: 12px;
            color: #441A05;
          }
          .roll-cell {
            flex: 0.5;
          }
          .name-cell {
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
          .stats-container {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            font-size: 12px;
          }
          .stats-box {
            border: 1px solid #9D9087;
            border-radius: 4px;
            padding: 5px;
            width: 48%;
            background-color: rgba(219, 158, 48, 0.1);
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
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight mb-6">
          ফলাফল শীট তৈরি করুন
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {config.class_name} - {config.section_name} ({config.shift_name}
                )
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
          <button
            onClick={handlePrint}
            className="relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
            disabled={
              !selectedExam ||
              !selectedClassConfig ||
              !selectedAcademicYear ||
              gradesLoading
            }
            title="প্রিন্ট করুন"
          >
            <FaPrint className="w-5 h-5 mr-2" />
            প্রিন্ট করুন
          </button>
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
        <div className="a4-landscape p-6 space-y-6 bg-white text-gray-900 shadow-md border border-gray-300 print:p-4 print:text-sm relative">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-3xl font-bold text-[#441a05]">
              আল-মদিনা ইসলামিক মাদ্রাসা
            </h2>
            <p className="text-sm text-[#441a05]">
              ঠিকানা: ১২৩, মাদ্রাসা রোড, ঢাকা, বাংলাদেশ
            </p>
            <p className="text-sm text-[#441a05]">
              ফোন: +৮৮০ ১৭১২৩৪৫৬৭৮ | ইমেইল: info@almadina.edu.bd
            </p>
            <h3 className="text-xl font-semibold text-[#441a05] mt-2">
              ফলাফল শীট -{" "}
              {exams?.find((e) => e.id === Number(selectedExam))?.name}
            </h3>
            <p className="text-sm text-[#441a05]">
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
            <p className="text-sm text-[#441a05]">
              শিক্ষাবর্ষ:{" "}
              {
                academicYears?.find(
                  (y) => y.id === Number(selectedAcademicYear)
                )?.name
              }
            </p>
          </div>

          {/* Grade Rule Table */}
          <div className="overflow-x-auto w-fit mx-auto border border-gray-300 rounded bg-gray-50 absolute top-0 right-5">
            <div className="flex bg-gray-200 font-semibold text-center text-[10px] divide-x divide-gray-300">
              <div className="flex-2 px-2 w-16 text-[6px] text-nowrap">
                গ্রেড নাম
              </div>
              <div className="flex-1 px-2 w-16 text-[6px] text-nowrap">
                গ্রেড কোড
              </div>
              {/* <div className="flex-1 px-2 w-16 text-[6px] text-nowrap">GPA</div> */}
              <div className="flex-1 px-2 w-16 text-[6px] text-nowrap">
                সর্বনিম্ন
              </div>
              <div className="flex-1 px-2 w-16 text-[6px] text-nowrap">
                সর্বোচ্চ
              </div>
              <div className="flex-2 px-2 w-16 text-[6px] text-nowrap">
                মন্তব্য
              </div>
            </div>
            {grades.map((grade) => (
              <div
                key={grade.id}
                className="flex text-[10px] text-center divide-x divide-gray-200"
              >
                <div className="flex-2 px-2 text-[6px] border text-nowrap w-16">
                  {grade.grade}
                </div>
                <div className="flex-1 px-2 text-[6px] border text-nowrap w-16">
                  {grade.grade_name_op}
                </div>
                {/* <div className="flex-1 px-2 text-[6px] border text-nowrap w-16">
                  {grade.gpa}
                </div> */}
                <div className="flex-1 px-2 text-[6px] border text-nowrap w-16">
                  {grade.min}
                </div>
                <div className="flex-1 px-2 text-[6px] border text-nowrap w-16">
                  {grade.max}
                </div>
                <div className="flex-2 px-2 text-[6px] border text-nowrap w-16">
                  {grade.remarks || "N/A"}
                </div>
              </div>
            ))}
          </div>

          {/* Result Table */}
          <div className="overflow-x-auto border border-gray-300 rounded">
            <div className="min-w-[900px] divide-y divide-gray-200">
              {/* Table Header */}
              <div className="flex bg-gray-100 text-xs font-semibold text-gray-700 text-center">
                <div className="w-16 px-2 py-1 border-r">রোল</div>
                <div className="flex-1 px-2 py-1 border-r">নাম</div>
                {subjectConfigs?.map((config) => (
                  <div key={config.id} className="w-20 px-2 py-1 border-r">
                    {config.subject_name}
                  </div>
                ))}
                <div className="w-20 px-2 py-1 border-r">মোট</div>
                <div className="w-20 px-2 py-1 border-r">গ্রেড</div>
                <div className="w-20 px-2 py-1">র্যাঙ্ক</div>
              </div>

              {/* Table Body */}
              {resultData.map((student) => (
                <div
                  key={student.studentId}
                  className="flex text-xs text-center text-gray-800 hover:bg-gray-50 transition"
                >
                  <div className="w-16 px-2 py-1 border-r">
                    {student.rollNo}
                  </div>
                  <div className="flex-1 px-2 py-1 border-r">
                    {student.studentName}
                  </div>
                  {student.subjects.map((sub, idx) => (
                    <div
                      key={idx}
                      className={`w-20 px-2 py-1 border-r ${
                        sub.isFailed
                          ? "bg-red-100 text-red-600 font-semibold"
                          : sub.isAbsent
                          ? "bg-yellow-100 text-yellow-600 italic"
                          : ""
                      }`}
                    >
                      {sub.isAbsent
                        ? "অনুপস্থিত"
                        : `${sub.obtained}/${sub.maxMark}`}
                    </div>
                  ))}
                  <div className="w-20 px-2 py-1 border-r font-semibold">
                    {student.totalObtained}
                  </div>
                  <div className="w-20 px-2 py-1 border-r font-bold">
                    {student.grade}
                  </div>
                  <div className="w-20 px-2 py-1">{student.rank}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="flex flex-col md:flex-row gap-6 border border-gray-300 rounded p-4 bg-gray-50 text-[#441a05] text-sm">
            {/* Grade Distribution */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-2">পরিসংখ্যান</h4>
              <p>মোট শিক্ষার্থী: {statistics.totalStudents}</p>
              <h5 className="text-xs font-medium mt-2">গ্রেড বিতরণ:</h5>
              {Object.entries(statistics.gradeDistribution).map(
                ([grade, count]) => (
                  <p key={grade}>
                    {grade}: {count} জন
                  </p>
                )
              )}
            </div>

            {/* Failed Subjects */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-2">ফেল করা বিষয়</h4>
              {Object.entries(statistics.failedSubjects).length > 0 ? (
                Object.entries(statistics.failedSubjects).map(
                  ([subject, count]) => (
                    <p key={subject}>
                      {subject}: {count} জন
                    </p>
                  )
                )
              ) : (
                <p>কোনো বিষয়ে ফেল নেই</p>
              )}
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
        <div className="animate-fadeIn mt-8">
          <PDFViewer style={{ width: "100%", height: "600px" }}>
            <ResultPDF />
          </PDFViewer>
        </div>
      )}
    </div>
  );
};

export default ResultSheet;
