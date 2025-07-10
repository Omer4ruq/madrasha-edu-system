import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { FaSpinner, FaDownload } from "react-icons/fa";
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetStudentActiveByClassQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetClassSubjectsByClassIdQuery } from "../../redux/features/api/class-subjects/classSubjectsApi";

// Register Bangla font with alternative source and fallback
Font.register({
  family: "NotoSansBengali",
  src: "https://fonts.gstatic.com/ea/notosansbengali/v3/NotoSansBengali-Regular.ttf",
});
Font.register({
  family: "ArialUnicodeMS",
  src: "https://cdn.jsdelivr.net/npm/arial-unicode-ms/ArialUnicodeMS.ttf",
});
Font.registerHyphenationCallback((word) => [word]); // Prevent text splitting issues

// PDF styles synced with assumed layout
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
    fontFamily: "NotoSansBengali",
    color: "#441A05",
    backgroundColor: "#FFF",
    width: 595.28, // A4 portrait width at 72dpi
    height: 841.89, // A4 portrait height at 72dpi,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#441A05",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  subHeader: {
    fontSize: 14,
    color: "#441A05",
    marginTop: 4,
  },
  table: {
    border: "1px solid #000",
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "rgba(219, 158, 48, 0.2)",
    borderBottom: "1px solid #000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
  },
  cell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    color: "#000",
    textAlign: "left",
    borderRight: "1px solid #000",
  },
  rollCell: { flex: 0.8 },
  nameCell: { flex: 1.5 },
  subjectCell: { flex: 1.5 },
  dateCell: { flex: 1.2 },
  totalCell: { flex: 1 },
  averageCell: { flex: 1 },
});

const MutalayaReport = () => {
  const [selectedClassConfig, setSelectedClassConfig] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);

  // Fetch APIs
  const { data: classConfigs, isLoading: classConfigsLoading } =
    useGetclassConfigApiQuery();
  const { data: students, isLoading: studentsLoading } =
    useGetStudentActiveByClassQuery(selectedClassConfig, {
      skip: !selectedClassConfig,
    });
  const { data: subjects, isLoading: subjectsLoading } =
    useGetClassSubjectsByClassIdQuery(selectedClassConfig, {
      skip: !selectedClassConfig,
    });

  // Simulate marks data (replace with actual marks API when available)
  const simulateMarks = (studentId) => {
    const mockMarks = subjects?.map((subject) => ({
      subject: subject.name,
      obtained: Math.floor(Math.random() * 100), // Random marks for demo
      maxMark: 100,
      examDate: new Date(startDate || "2025-07-01").toLocaleDateString("bn-BD"),
    }));
    return mockMarks;
  };

  // Generate report data
  useEffect(() => {
    if (students && subjects && selectedClassConfig && startDate && endDate) {
      const data = students.map((student) => {
        const marks = simulateMarks(student.id);
        const totalObtained = marks.reduce((sum, m) => sum + m.obtained, 0);
        const totalMaxMarks = marks.length * 100;
        const averageMarks =
          totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;
        return {
          studentId: student.id,
          rollNo: student.roll_no || student.username,
          studentName: student.name,
          subjects: marks,
          totalObtained,
          averageMarks: averageMarks.toFixed(2),
        };
      });
      setReportData(data);
    }
  }, [students, subjects, selectedClassConfig, startDate, endDate]);

  // Function to download PDF
  const downloadPDF = async () => {
    if (
      reportData.length === 0 ||
      !selectedClassConfig ||
      !startDate ||
      !endDate
    ) {
      toast.error("দয়া করে ক্লাস এবং তারিখের রেঞ্জ নির্বাচন করুন।");
      return;
    }

    const PdfDocument = (
      <Document>
        <Page size="A4" orientation="portrait" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>আল-মদিনা ইসলামিক মাদ্রাসা</Text>
            <Text style={styles.subHeader}>
              ঠিকানা: ১২৩, মাদ্রাসা রোড, ঢাকা, বাংলাদেশ
            </Text>
            <Text style={styles.subHeader}>
              ফোন: +৮৮০ ১৭১২৩৪৫৬৭৮ | ইমেইল: info@almadina.edu.bd
            </Text>
            <Text style={styles.title}>মুতালায়া রিপোর্ট</Text>
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
              তারিখের রেঞ্জ: {new Date(startDate).toLocaleDateString("bn-BD")} -{" "}
              {new Date(endDate).toLocaleDateString("bn-BD")}
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.rollCell]}>রোল</Text>
              <Text style={[styles.cell, styles.nameCell]}>নাম</Text>
              <Text style={[styles.cell, styles.subjectCell]}>বিষয়</Text>
              <Text style={[styles.cell, styles.dateCell]}>পরীক্ষার তারিখ</Text>
              <Text style={[styles.cell, styles.totalCell]}>মোট</Text>
              <Text style={[styles.cell, styles.averageCell]}>গড়</Text>
            </View>
            {reportData.map((student) =>
              student.subjects.map((subject, index) => (
                <View
                  key={`${student.studentId}-${index}`}
                  style={styles.tableRow}
                >
                  {index === 0 && (
                    <>
                      <Text style={[styles.cell, styles.rollCell]}>
                        {student.rollNo}
                      </Text>
                      <Text style={[styles.cell, styles.nameCell]}>
                        {student.studentName}
                      </Text>
                    </>
                  )}
                  <Text style={[styles.cell, styles.subjectCell]}>
                    {subject.subject}
                  </Text>
                  <Text style={[styles.cell, styles.dateCell]}>
                    {subject.examDate}
                  </Text>
                  {index === student.subjects.length - 1 && (
                    <>
                      <Text style={[styles.cell, styles.totalCell]}>
                        {student.totalObtained}
                      </Text>
                      <Text style={[styles.cell, styles.averageCell]}>
                        {student.averageMarks}
                      </Text>
                    </>
                  )}
                  {index !== student.subjects.length - 1 && (
                    <>
                      <Text style={[styles.cell, styles.totalCell]} />
                      <Text style={[styles.cell, styles.averageCell]} />
                    </>
                  )}
                </View>
              ))
            )}
          </View>
        </Page>
      </Document>
    );

    try {
      const asPdf = pdf(PdfDocument);
      const blob = await asPdf.toBlob();
      console.log("PDF Blob generated. Sample text check:", "রোল" in blob); // Debug text presence
      saveAs(
        blob,
        `Mutalaya_Report_${selectedClassConfig}_${new Date().toLocaleString(
          "bn-BD",
          { timeZone: "Asia/Dhaka" }
        )}.pdf`
      );
      toast.success("PDF ডাউনলোড সম্পন্ন!");
    } catch (error) {
      console.error("PDF Download Error:", error);
      toast.error(`PDF ডাউনলোডে ত্রুটি: ${error.message || "অজানা ত্রুটি"}`);
    }
  };

const dates = [
  { day: "শনিবার", date: "৬" },
  { day: "রবিবার", date: "৭" },
  { day: "সোমবার", date: "৮" },
  { day: "মঙ্গলবার", date: "৯" },
  { day: "বুধবার", date: "১০" },
];

const studentss = [
  {
    name: "সাবির আহমাদ",
    subjects: [
      {
        name: "আল ফিকহ ১",
        attendance: {
          '৬': { sobok: "✓", mutalaya: "" },
          '৭': { sobok: "✓", mutalaya: "" },
          '৮': { sobok: "৮", mutalaya: "✓" },
          '৯': { sobok: "✓", mutalaya: "১/২" },
        },
      },
      {
        name: "তাফসীর",
        attendance: {
          '৬': { sobok: "✓", mutalaya: "" },
          '৭': { sobok: "✓", mutalaya: "" },
        },
      },
      {
        name: "আল ফিকহ ১",
        attendance: {
          '৬': { sobok: "✓", mutalaya: "" },
          '৭': { sobok: "✓", mutalaya: "" },
          '৮': { sobok: "৮", mutalaya: "✓" },
          '৯': { sobok: "✓", mutalaya: "১/২" },
        },
      },
      {
        name: "তাফসীর",
        attendance: {
          '৬': { sobok: "✓", mutalaya: "" },
          '৭': { sobok: "✓", mutalaya: "" },
        },
      },
      {
        name: "আল ফিকহ ১",
        attendance: {
          '৬': { sobok: "✓", mutalaya: "" },
          '৭': { sobok: "✓", mutalaya: "" },
          '৮': { sobok: "৮", mutalaya: "✓" },
          '৯': { sobok: "✓", mutalaya: "১/২" },
        },
      },
      {
        name: "তাফসীর",
        attendance: {
          '৬': { sobok: "✓", mutalaya: "" },
          '৭': { sobok: "✓", mutalaya: "" },
        },
      },
    ],
  },
  {
    name: "জাফির হাসান",
    subjects: [
      {
        name: "আল ফিকহ ১",
        attendance: {
          '৬': { sobok: "✓", mutalaya: "" },
          '৭': { sobok: "৭", mutalaya: "✓" },
        },
      },
      {
        name: "আল ফিকহ ১",
        attendance: {
          '৬': { sobok: "✓", mutalaya: "" },
          '৭': { sobok: "৭", mutalaya: "✓" },
        },
      },
      {
        name: "আল ফিকহ ১",
        attendance: {
          '৬': { sobok: "✓", mutalaya: "" },
          '৭': { sobok: "৭", mutalaya: "✓" },
        },
      },
      {
        name: "আল ফিকহ ১",
        attendance: {
          '৬': { sobok: "✓", mutalaya: "" },
          '৭': { sobok: "৭", mutalaya: "✓" },
        },
      },
      {
        name: "আল ফিকহ ১",
        attendance: {
          '৬': { sobok: "✓", mutalaya: "" },
          '৭': { sobok: "৭", mutalaya: "✓" },
        },
      },
    ],
  },
];


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
          মুতালায়া রিপোর্ট
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <select
            value={selectedClassConfig}
            onChange={(e) => setSelectedClassConfig(e.target.value)}
            className="select-field"
            disabled={classConfigsLoading}
          >
            <option value="">ক্লাস নির্বাচন করুন</option>
            {classConfigs?.map((config) => (
              <option key={config.id} value={config.id}>
                {config.class_name} - {config.section_name} ({config.shift_name}
                )
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-field"
            placeholder="শুরুর তারিখ"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-field"
            placeholder="শেষের তারিখ"
          />
        </div>
        <button
          onClick={downloadPDF}
          className="download-btn"
          disabled={
            reportData.length === 0 ||
            classConfigsLoading ||
            studentsLoading ||
            subjectsLoading
          }
        >
          <FaDownload /> PDF ডাউনলোড
        </button>
      </div>

      {/* Report Preview (Optional) */}
      {classConfigsLoading || studentsLoading || subjectsLoading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-[#441A05]" />
        </div>
      ) : reportData.length > 0 ? (
        <div className="a4-portrait animate-fadeIn">
          <div className="text-center mb-6">
            <h2 className="header-title">আল-মদিনা ইসলামিক মাদ্রাসা</h2>
            <p className="header-subtitle">
              ঠিকানা: ১২৩, মাদ্রাসা রোড, ঢাকা, বাংলাদেশ
            </p>
            <p className="header-subtitle">
              ফোন: +৮৮০ ১৭১২৩৪৫৬৭৮ | ইমেইল: info@almadina.edu.bd
            </p>
            <h3 className="header-title mt-4">মুতালায়া রিপোর্ট</h3>
            <p className="header-subtitle">
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
            <p className="header-subtitle">
              তারিখের রেঞ্জ: {new Date(startDate).toLocaleDateString("bn-BD")} -{" "}
              {new Date(endDate).toLocaleDateString("bn-BD")}
            </p>
          </div>

          <div className="border">
            <div className="border">
              <div className="border">রোল</div>
              <div className="border">নাম</div>
              <div className="border">বিষয়</div>
              <div className="border">পরীক্ষার তারিখ</div>
              <div className="border">মোট</div>
              <div className="border">গড়</div>
            </div>
            {reportData.map((student) =>
              student.subjects.map((subject, index) => (
                <div key={`${student.studentId}-${index}`} className="">
                  {index === 0 && (
                    <>
                      <div className="border">{student.rollNo}</div>
                      <div className="border">{student.studentName}</div>
                    </>
                  )}
                  <div className="border">{subject.subject}</div>
                  <div className="border">{subject.examDate}</div>
                  {index === student.subjects.length - 1 && (
                    <>
                      <div className="border">{student.totalObtained}</div>
                      <div className="border">{student.averageMarks}</div>
                    </>
                  )}
                  {index !== student.subjects.length - 1 && (
                    <>
                      <div className="border" />
                      <div className="border" />
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-[#441A05]/70">
          রিপোর্ট তৈরি করতে ফিল্টার নির্বাচন করুন।
        </p>
      )}


   <div className="p-4 text-xs font-[kalpurush] text-black a4-portrait animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">
          মুতালায়া ও সবক জানানোর রিপোর্ট
        </h2>
        <p className="text-sm">জামাত: নাইমুল্লাহ | মাস: জুলাই - ২০২৫</p>
      </div>

      <div className="">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th rowSpan="3" className="border border-black px-2 py-1 text-[8px]">ক্রমিক</th>
              <th rowSpan="3" className="border border-black px-2 py-1 text-[8px]">নাম</th>
              <th rowSpan="3" className="border border-black px-2 py-1 text-[8px]">বিষয়</th>
              {dates.map((d, i) => (
                <th key={i} colSpan={2} className="border border-black text-center text-[8px]">
                  {d.day}
                </th>
              ))}
            </tr>
            <tr>
              {dates.map((d, i) => (
                <th key={i} colSpan={2} className="border border-black text-center text-[8px]">
                  {d.date}
                </th>
              ))}
            </tr>
            <tr>
              {dates.map((_, i) => (
                <React.Fragment key={i}>
                  <th className="border border-black text-center text-[8px] px-2">সবক</th>
                  <th className="border border-black text-center text-[8px]">মুতালায়া</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {studentss.map((student, sIdx) =>
              student.subjects.map((subject, subjIdx) => (
                <tr key={`${sIdx}-${subjIdx}`}>
                  {subjIdx === 0 && (
                    <td
                      rowSpan={student.subjects.length}
                      className="border border-black text-center align-top text-[8px]"
                    >
                      {sIdx + 1}
                    </td>
                  )}
                  {subjIdx === 0 && (
                    <td
                      rowSpan={student.subjects.length}
                      className="border border-black align-top px-1 text-center text-[8px]"
                    >
                      {student.name}
                    </td>
                  )}
                  <td className="border border-black px-1 text-center text-[8px]">{subject.name}</td>
                  {dates.map((d) => (
                    <React.Fragment key={d.date}>
                      <td className="border border-black text-center text-[8px]">
                        {/* {subject.attendance[d.date]?.sobok || ""} */}
                        
                      </td>
                      <td className="border border-black text-center text-[8px]">
                        {/* {subject.attendance[d.date]?.mutalaya || ""} */}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default MutalayaReport;
