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

// Register Bangla font
Font.register({
  family: "NotoSansBengali",
  src: "https://fonts.gstatic.com/ea/notosansbengali/v3/NotoSansBengali-Regular.ttf",
});
Font.register({
  family: "ArialUnicodeMS",
  src: "https://cdn.jsdelivr.net/npm/arial-unicode-ms/ArialUnicodeMS.ttf",
});
Font.registerHyphenationCallback((word) => [word]);

// PDF styles synced with frontend
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 8, // ≈ text-[11px] in frontend
    fontFamily: "NotoSansBengali",
    color: "#000000",
    backgroundColor: "#FFF",
    width: 595.28, // A4 portrait width
    height: 841.89, // A4 portrait height
  },
  header: {
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 14, // ≈ text-lg
    fontWeight: "bold",
    color: "#000000",
  },
  subHeader: {
    fontSize: 10, // ≈ text-sm
    color: "#000000",
    marginTop: 4,
  },
  table: {
    border: "1px solid #000",
    borderCollapse: "collapse",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottom: "1px solid #000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
  },
  cell: {
    flex: 1,
    padding: 4, // ≈ p-[5px]
    fontSize: 8,
    color: "#000",
    textAlign: "center",
    borderRight: "1px solid #000",
    alignItems: "center",
  },
  rollCell: { flex: 0.8 },
  nameCell: { flex: 1.5 },
  subjectCell: { flex: 1.5 },
  dateCell: { flex: 0.6 },
  totalCell: { flex: 1 },
});

const MutalayaReport = () => {
  const [selectedClassConfig, setSelectedClassConfig] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [dynamicReportData, setDynamicReportData] = useState([]);

  // Fetch APIs
  const { data: classConfigs, isLoading: classConfigsLoading } = useGetclassConfigApiQuery();
  const { data: students, isLoading: studentsLoading } = useGetStudentActiveByClassQuery(
    selectedClassConfig,
    { skip: !selectedClassConfig }
  );
  const { data: subjects, isLoading: subjectsLoading } = useGetClassSubjectsByClassIdQuery(
    selectedClassConfig,
    { skip: !selectedClassConfig }
  );

  // Simulate marks data (replace with actual API when available)
  const simulateMarks = (studentId) => {
    return subjects?.map((subject) => ({
      subject: subject.name,
      obtained: Math.floor(Math.random() * 100),
      maxMark: 100,
      examDate: new Date(startDate || "2025-07-01").toLocaleDateString("bn-BD"),
    })) || [];
  };

  // Generate report data
  useEffect(() => {
    if (students && subjects && selectedClassConfig && startDate && endDate) {
      const data = students.map((student) => {
        const marks = simulateMarks(student.id);
        const totalObtained = marks.reduce((sum, m) => sum + m.obtained, 0);
        const totalMaxMarks = marks.length * 100;
        const averageMarks = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;
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

  // Generate dynamic dates
  const generateDynamicDates = () => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const bnDate = d.toLocaleDateString("bn-BD", { day: "numeric" });
      const bnDay = d.toLocaleDateString("bn-BD", { weekday: "long" });
      dates.push({ day: bnDay, date: bnDate });
    }
    return dates;
  };

  // Simulate attendance data
  const simulateAttendance = (studentId, subjectName) => {
    const dynamicDates = generateDynamicDates();
    const attendance = {};
    dynamicDates.forEach((d) => {
      attendance[d.date] = {
        sobok: Math.random() > 0.3 ? "✓" : Math.floor(Math.random() * 10).toString(),
        mutalaya: Math.random() > 0.5 ? "✓" : Math.random() > 0.7 ? "১/২" : "",
      };
    });
    return attendance;
  };

  // Generate dynamic report data
  useEffect(() => {
    if (students && subjects && selectedClassConfig && startDate && endDate) {
      const dynamicData = students.map((student) => ({
        name: student.name,
        subjects: subjects.map((subject) => ({
          name: subject.name,
          attendance: simulateAttendance(student.id, subject.name),
        })),
      }));
      setDynamicReportData(dynamicData);
    }
  }, [students, subjects, selectedClassConfig, startDate, endDate]);

  // Calculate column widths for frontend
  const calculateColumnWidths = (n) => {
    const totalFlex = 4.8 + 1.2 * n; // 0.8 + 1.5 + 1.5 + (2 * n * 0.6) + 1
    return {
      serialWidth: (0.8 / totalFlex) * 100,
      nameWidth: (1.5 / totalFlex) * 100,
      subjectWidth: (1.5 / totalFlex) * 100,
      dateWidth: (0.6 / totalFlex) * 100,
      commentWidth: (1 / totalFlex) * 100,
    };
  };

  // Download PDF
  const downloadPDF = async () => {
    if (!selectedClassConfig || !startDate || !endDate || dynamicReportData.length === 0) {
      toast.error("দয়া করে ক্লাস এবং তারিখের রেঞ্জ নির্বাচন করুন।");
      return;
    }

    const dynamicDates = generateDynamicDates();
    // Group rows by student to keep subjects together
    const rows = dynamicReportData.map((student, sIdx) => ({
      student,
      sIdx,
      subjectCount: student.subjects.length,
    }));

    // Calculate rows per page (approx 20 rows per A4 page)
    const rowsPerPage = 20;
    const pages = [];
    let currentRows = 0;
    let currentPage = [];

    rows.forEach((row) => {
      if (currentRows + row.subjectCount <= rowsPerPage) {
        currentPage.push(row);
        currentRows += row.subjectCount;
      } else {
        pages.push(currentPage);
        currentPage = [row];
        currentRows = row.subjectCount;
      }
    });
    if (currentPage.length > 0) pages.push(currentPage);

    const PdfDocument = (
      <Document>
        {pages.map((pageRows, pageIdx) => (
          <Page key={pageIdx} size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>মুতালায়া ও সবক শুনানোর রিপোর্ট</Text>
              <Text style={styles.subHeader}>
                জামাত: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.class_name}{" "}
                | মাস: {new Date(startDate).toLocaleDateString("bn-BD", { month: "long" })} - ২০২৫
              </Text>
            </View>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.cell, styles.rollCell]}>ক্রমিক</Text>
                <Text style={[styles.cell, styles.nameCell]}>নাম</Text>
                <Text style={[styles.cell, styles.subjectCell]}>বিষয়</Text>
                {dynamicDates.map((d, i) => (
                  <Text key={i} style={[styles.cell, styles.dateCell]} colSpan={2}>
                    {d.day}
                  </Text>
                ))}
                <Text style={[styles.cell, styles.totalCell]}>মন্তব্য</Text>
              </View>
              <View style={styles.tableRow}>
                {dynamicDates.map((d, i) => (
                  <Text key={i} style={[styles.cell, styles.dateCell]} colSpan={2}>
                    {d.date}
                  </Text>
                ))}
              </View>
              <View style={styles.tableRow}>
                {dynamicDates.map((_, i) => (
                  <React.Fragment key={i}>
                    <Text style={[styles.cell, styles.dateCell]}>সবক</Text>
                    <Text style={[styles.cell, styles.dateCell]}>মুতালায়া</Text>
                  </React.Fragment>
                ))}
              </View>
              {/* Table Body */}
              {pageRows.map(({ student, sIdx }) =>
                student.subjects.map((subject, subjIdx) => (
                  <View
                    key={`${pageIdx}-${sIdx}-${subjIdx}`}
                    style={styles.tableRow}
                    wrap={subjIdx === 0 ? false : true} // Prevent row splitting for student
                  >
                    {subjIdx === 0 && (
                      <>
                        <Text style={[styles.cell, styles.rollCell]} rowSpan={student.subjects.length}>
                          {sIdx + 1}
                        </Text>
                        <Text style={[styles.cell, styles.nameCell]} rowSpan={student.subjects.length}>
                          {student.name}
                        </Text>
                      </>
                    )}
                    <Text style={[styles.cell, styles.subjectCell]}>{subject.name}</Text>
                    {dynamicDates.map((d) => (
                      <React.Fragment key={d.date}>
                        <Text style={[styles.cell, styles.dateCell]}>
                          {subject.attendance[d.date]?.sobok || ""}
                        </Text>
                        <Text style={[styles.cell, styles.dateCell]}>
                          {subject.attendance[d.date]?.mutalaya || ""}
                        </Text>
                      </React.Fragment>
                    ))}
                    <Text style={[styles.cell, styles.totalCell]} />
                  </View>
                ))
              )}
            </View>
          </Page>
        ))}
      </Document>
    );

    try {
      const asPdf = pdf(PdfDocument);
      const blob = await asPdf.toBlob();
      saveAs(
        blob,
        `Mutalaya_Sobok_Mutalaya_Report_${selectedClassConfig}_${new Date().toLocaleString(
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

  const dynamicDates = generateDynamicDates();
  const { serialWidth, nameWidth, subjectWidth, dateWidth, commentWidth } =
    calculateColumnWidths(dynamicDates.length);

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
                {config.class_name} - {config.section_name} ({config.shift_name})
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker()}
            className="date-field outline-none"
            placeholder="শুরুর তারিখ"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker()}
            className="date-field outline-none"
            placeholder="শেষের তারিখ"
          />
        </div>
        <button
          onClick={downloadPDF}
          className="download-btn"
          disabled={reportData.length === 0 || classConfigsLoading || studentsLoading || subjectsLoading}
        >
          <FaDownload /> PDF ডাউনলোড
        </button>
      </div>

      {/* Report Preview */}
      {classConfigsLoading || studentsLoading || subjectsLoading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-[#441A05]" />
        </div>
      ) : reportData.length > 0 ? (
        <div className="p-4 text-xs font-[kalpurush] text-black a4-portrait animate-fadeIn">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">মুতালায়া ও সবক শুনানোর রিপোর্ট</h2>
            <p className="text-sm">
              জামাত: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.class_name}{" "}
              | মাস: {new Date(startDate).toLocaleDateString("bn-BD", { month: "long" })} - ২০২৫
            </p>
          </div>
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width: `${serialWidth}%` }} />
              <col style={{ width: `${nameWidth}%` }} />
              <col style={{ width: `${subjectWidth}%` }} />
              {dynamicDates.map((_, i) => (
                <React.Fragment key={i}>
                  <col style={{ width: `${dateWidth}%` }} />
                  <col style={{ width: `${dateWidth}%` }} />
                </React.Fragment>
              ))}
              <col style={{ width: `${commentWidth}%` }} />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan="3" className="border border-black p-[5px] text-[11px]">
                  ক্রমিক
                </th>
                <th rowSpan="3" className="border border-black p-[5px] text-[11px]">
                  নাম
                </th>
                <th rowSpan="3" className="border border-black p-[5px] text-[11px]">
                  বিষয়
                </th>
                {dynamicDates.map((d, i) => (
                  <th key={i} colSpan={2} className="border border-black text-center text-[11px] p-[5px]">
                    {d.day}
                  </th>
                ))}
                <th rowSpan="3" className="border border-black p-[5px] text-[11px]">
                  মন্তব্য
                </th>
              </tr>
              <tr>
                {dynamicDates.map((d, i) => (
                  <th key={i} colSpan={2} className="border border-black text-center text-[11px] p-[5px]">
                    {d.date}
                  </th>
                ))}
              </tr>
              <tr>
                {dynamicDates.map((_, i) => (
                  <React.Fragment key={i}>
                    <th className="border border-black text-center text-[11px] p-[5px]">
                      সবক
                    </th>
                    <th className="border border-black text-center text-[11px] p-[5px]">
                      মুতালায়া
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {dynamicReportData.map((student, sIdx) =>
                student.subjects.map((subject, subjIdx) => (
                  <tr key={`${sIdx}-${subjIdx}`}>
                    {subjIdx === 0 && (
                      <td
                        rowSpan={student.subjects.length}
                        className="border border-black text-center align-top text-[11px] p-[5px]"
                      >
                        {sIdx + 1}
                      </td>
                    )}
                    {subjIdx === 0 && (
                      <td
                        rowSpan={student.subjects.length}
                        className="border border-black align-top text-center text-[11px] p-[5px]"
                      >
                        {student.name}
                      </td>
                    )}
                    <td className="border border-black text-center text-[11px] p-[5px]">
                      {subject.name}
                    </td>
                    {dynamicDates.map((d) => (
                      <React.Fragment key={d.date}>
                        <td className="border border-black text-center text-[11px] p-[5px]">
                          {subject.attendance[d.date]?.sobok || ""}
                        </td>
                        <td className="border border-black text-center text-[11px] p-[5px]">
                          {subject.attendance[d.date]?.mutalaya || ""}
                        </td>
                      </React.Fragment>
                    ))}
                    <td className="border border-black p-[5px]"></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-[#441A05]/70">
          রিপোর্ট তৈরি করতে ফিল্টার নির্বাচন করুন।
        </p>
      )}
    </div>
  );
};

export default MutalayaReport;