
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

// Estimate row height for rowSpan calculations
const ROW_HEIGHT = 20; // Approximately 9pt font + 4px vertical padding + borders

// PDF styles synced with frontend layout
const styles = StyleSheet.create({
  page: {
    padding: 20, // Matches frontend 20px padding (approx 15pt, but keeping 20 for visual similarity)
    fontSize: 9, // Adjusted from 8 to 9, closer to text-xs (12px / 0.75 = 9pt)
    fontFamily: "NotoSansBengali",
    color: "#000000",
    backgroundColor: "#FFF",
    width: 595.28, // A4 portrait width at 72dpi
    height: 841.89, // A4 portrait height at 72dpi
  },
  header: {
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16, // Adjusted from 14, closer to text-lg (18px / 0.75 = 13.5pt, but aiming for larger visual impact)
    fontWeight: "bold",
    color: "#000000",
  },
  subHeader: {
    fontSize: 12, // Adjusted from 10, closer to text-sm (14px / 0.75 = 10.5pt, aiming for better readability)
    color: "#000000",
    marginTop: 4,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    border: "1px solid #000", // Outer table border
  },
  // Base style for all cells, including borders
  cellBase: {
    paddingVertical: 4, // Matches py-1 (4px)
    paddingHorizontal: 8, // Matches px-2 (8px)
    fontSize: 9, // Consistent with page font size
    color: "#000",
    textAlign: "center",
    borderRight: "1px solid #000",
    borderBottom: "1px solid #000", // Default cell border
    alignItems: "center",
    justifyContent: "center", // Center content vertically
  },
  // Styles for row-spanning header cells
  headerCellRowSpan: {
    minHeight: ROW_HEIGHT * 3, // Span 3 header rows
    justifyContent: "center",
    alignItems: "center",
    borderBottom: "1px solid #000", // All row-spanning cells get bottom border
  },
  rollCell: {
    flex: 0.5, // Adjusted flex for a narrower column
  },
  nameCell: {
    flex: 1.5, // Adjusted flex for broader column
  },
  subjectCell: {
    flex: 1.2, // Adjusted flex
  },
  totalCell: {
    flex: 1, // Adjusted flex
    borderRight: "none", // Last cell in row usually doesn't have right border
  },

  // NEW: Table Header Container (holds all header rows/cells)
  tableHeaderContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottom: "1px solid #000", // Outer header bottom border
    alignItems: "stretch", // Ensure cells stretch to fill row height
  },
  // NEW: Container for all dynamic date columns (takes remaining flex space)
  dynamicDatesHeaderContainer: {
    flexGrow: 1, // Take up remaining horizontal space
    flexDirection: "column", // Stack day, date, sobok/mutalaya vertically
    borderLeft: "1px solid #000", // Border to separate from subject column
    borderRight: "1px solid #000", // Border to separate from total column
  },
  // NEW: Row for day/date/sobok-mutalaya within dynamicDatesHeaderContainer
  dynamicDatesHeaderRow: {
    flexDirection: "row",
    alignItems: "stretch",
    borderBottom: "1px solid #000", // Separator for each date header row
    minHeight: ROW_HEIGHT,
  },
  // Specific styling for cells within dynamic date header rows
  dateDayHeader: {
    flexGrow: 1, // Will be overridden by flex calculated in component
    justifyContent: "center",
    alignItems: "center",
    borderRight: "1px solid #000",
  },
  dateDateHeader: {
    flexGrow: 1, // Will be overridden by flex calculated in component
    justifyContent: "center",
    alignItems: "center",
    borderRight: "1px solid #000",
  },
  sobokMutalayaHeaderCell: {
    flexGrow: 1, // Will be overridden by flex calculated in component
    justifyContent: "center",
    alignItems: "center",
    borderRight: "1px solid #000",
    borderBottom: "none", // This is the last header row, so no internal bottom border
  },
  // NEW: Table body rows
  tableRow: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: ROW_HEIGHT,
    borderBottom: "1px solid #000", // Default row bottom border
  },
  // NEW: Individual cell style for data rows
  dataCell: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 9,
    color: "#000",
    textAlign: "center",
    borderRight: "1px solid #000",
    justifyContent: "center",
    alignItems: "center",
  },
});

const MutalayaReport = () => {
  const [selectedClassConfig, setSelectedClassConfig] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [dynamicReportData, setDynamicReportData] = useState([]);

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
      obtained: Math.floor(Math.random() * 100),
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

  // Generate dynamic dates based on date range
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

  // Generate dynamic report data for primary layout
  useEffect(() => {
    if (students && subjects && selectedClassConfig && startDate && endDate) {
      const dynamicData = students.map((student) => ({
        name: student.name,
        roll_no: student.roll_no || student.username,
        subjects: subjects.map((subject) => ({
          name: subject.name,
          attendance: simulateAttendance(student.id, subject.name),
        })),
      }));
      setDynamicReportData(dynamicData);
    }
  }, [students, subjects, selectedClassConfig, startDate, endDate]);

  // Function to download PDF
  const downloadPDF = async () => {
    if (
      !selectedClassConfig ||
      !startDate ||
      !endDate ||
      dynamicReportData.length === 0
    ) {
      toast.error("দয়া করে ক্লাস এবং তারিখের রেঞ্জ নির্বাচন করুন।");
      return;
    }

    const dynamicDates = generateDynamicDates();
    // Calculate flex for date columns based on number of dates
    const dateColFlex = 1 / dynamicDates.length; // Flex for a single colSpan=2 date header
    const attendanceCellFlex = dateColFlex / 2; // Flex for a single sobok/mutalaya cell

    // Split data into chunks to fit on A4 pages
    const rowsPerPage = 20; // Estimated rows per page based on font size and spacing
    const rows = dynamicReportData.flatMap((student, sIdx) =>
      student.subjects.map((subject, subjIdx) => ({ student, sIdx, subjIdx }))
    );
    const pages = [];
    for (let i = 0; i < rows.length; i += rowsPerPage) {
      pages.push(rows.slice(i, i + rowsPerPage));
    }

    const PdfDocument = (
      <Document>
        {pages.map((pageRows, pageIdx) => (
          <Page key={pageIdx} size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>মুতালায়া ও সবক শুনানোর রিপোর্ট</Text>
              <Text style={styles.subHeader}>
                জামাত:{" "}
                {
                  classConfigs?.find((c) => c.id === Number(selectedClassConfig))
                    ?.class_name
                }{" "}
                | মাস: {new Date(startDate).toLocaleDateString("bn-BD", { month: "long" })} - ২০২৫
              </Text>
            </View>

            <View style={styles.table}>
              {/* Table Header - Consolidated */}
              <View style={styles.tableHeaderContainer}>
                {/* Fixed Header Cells (rowSpan=3 effect) */}
                <Text style={[styles.cellBase, styles.headerCellRowSpan, styles.rollCell]}>
                  ক্রমিক
                </Text>
                <Text style={[styles.cellBase, styles.headerCellRowSpan, styles.nameCell]}>
                  নাম
                </Text>
                <Text style={[styles.cellBase, styles.headerCellRowSpan, styles.subjectCell]}>
                  বিষয়
                </Text>

                {/* Dynamic Date Columns Header Container */}
                <View style={styles.dynamicDatesHeaderContainer}>
                  {/* Row 1: Day Header */}
                  <View style={[styles.dynamicDatesHeaderRow, { borderBottom: "1px solid #000" }]}>
                    {dynamicDates.map((d, i) => (
                      <Text key={i} style={[styles.cellBase, styles.dateDayHeader, { flex: dateColFlex, borderRight: i === dynamicDates.length - 1 ? "none" : "1px solid #000" }]}>
                        {d.day}
                      </Text>
                    ))}
                  </View>
                  {/* Row 2: Date Header */}
                  <View style={[styles.dynamicDatesHeaderRow, { borderBottom: "1px solid #000" }]}>
                    {dynamicDates.map((d, i) => (
                      <Text key={i} style={[styles.cellBase, styles.dateDateHeader, { flex: dateColFlex, borderRight: i === dynamicDates.length - 1 ? "none" : "1px solid #000" }]}>
                        {d.date}
                      </Text>
                    ))}
                  </View>
                  {/* Row 3: Sobok/Mutalaya Header */}
                  <View style={[styles.dynamicDatesHeaderRow, { borderBottom: "none" }]}>
                    {dynamicDates.map((_, i) => (
                      <React.Fragment key={i}>
                        <Text style={[styles.cellBase, styles.sobokMutalayaHeaderCell, { flex: attendanceCellFlex }]}>
                          সবক
                        </Text>
                        <Text style={[styles.cellBase, styles.sobokMutalayaHeaderCell, { flex: attendanceCellFlex, borderRight: i === dynamicDates.length - 1 ? "none" : "1px solid #000" }]}>
                          মুতালায়া
                        </Text>
                      </React.Fragment>
                    ))}
                  </View>
                </View>

                {/* Fixed Header Cell for Montobyo (rowSpan=3 effect) */}
                <Text style={[styles.cellBase, styles.headerCellRowSpan, styles.totalCell]}>
                  মন্তব্য
                </Text>
              </View>

              {/* Table Body */}
              {pageRows.map(({ student, sIdx, subjIdx }, rowIdx) => (
                <View key={`${pageIdx}-${rowIdx}`} style={styles.tableRow}>
                  {/* Roll No (rowSpan effect) */}
                  {subjIdx === 0 && (
                    <Text
                      style={[styles.dataCell, styles.rollCell, { borderLeft: "1px solid #000", borderRight: "1px solid #000", borderBottom: rowIdx === pageRows.length - 1 ? "none" : "1px solid #000" }]}
                      minHeight={ROW_HEIGHT * student.subjects.length} // Set height to span subjects
                    >
                      {student.roll_no}
                    </Text>
                  )}
                  {/* Student Name (rowSpan effect) */}
                  {subjIdx === 0 && (
                    <Text
                      style={[styles.dataCell, styles.nameCell, { borderRight: "1px solid #000", borderBottom: rowIdx === pageRows.length - 1 ? "none" : "1px solid #000" }]}
                      minHeight={ROW_HEIGHT * student.subjects.length} // Set height to span subjects
                    >
                      {student.name}
                    </Text>
                  )}
                  {/* Subject Name */}
                  <Text style={[styles.dataCell, styles.subjectCell, { borderRight: "1px solid #000", borderBottom: rowIdx === pageRows.length - 1 ? "none" : "1px solid #000" }]}>
                    {student.subjects[subjIdx].name}
                  </Text>
                  {/* Dynamic Attendance Data */}
                  {dynamicDates.map((d, i) => (
                    <React.Fragment key={d.date}>
                      <Text style={[styles.dataCell, { flex: attendanceCellFlex, borderRight: "1px solid #000", borderBottom: rowIdx === pageRows.length - 1 ? "none" : "1px solid #000" }]}>
                        {student.subjects[subjIdx].attendance[d.date]?.sobok || ""}
                      </Text>
                      <Text style={[styles.dataCell, { flex: attendanceCellFlex, borderRight: i === dynamicDates.length - 1 ? "none" : "1px solid #000", borderBottom: rowIdx === pageRows.length - 1 ? "none" : "1px solid #000" }]}>
                        {student.subjects[subjIdx].attendance[d.date]?.mutalaya || ""}
                      </Text>
                    </React.Fragment>
                  ))}
                  {/* Remarks */}
                  <Text style={[styles.dataCell, styles.totalCell, { borderRight: "none", borderBottom: rowIdx === pageRows.length - 1 ? "none" : "1px solid #000" }]} />
                </View>
              ))}
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

      {/* Report Preview */}
      {classConfigsLoading || studentsLoading || subjectsLoading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-[#441A05]" />
        </div>
      ) : reportData.length > 0 ? (
        <div className="p-4 text-xs font-[kalpurush] text-black a4-portrait animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">মুতালায়া ও সবক শুনানোর রিপোর্ট</h2>
            <p className="text-sm">
              জামাত:{" "}
              {
                classConfigs?.find((c) => c.id === Number(selectedClassConfig))
                  ?.class_name
              }{" "}
              | মাস: {new Date(startDate).toLocaleDateString("bn-BD", { month: "long" })} - ২০২৫
            </p>
          </div>

          <div className="">
            <table className="table-auto w-full border-collapse">
              <thead>
                <tr>
                  <th rowSpan="3" className="border border-black py-1 text-[8px]">
                    ক্রমিক
                  </th>
                  <th
                    rowSpan="3"
                    className="border border-black px-2 py-1 text-[8px]"
                  >
                    নাম
                  </th>
                  <th
                    rowSpan="3"
                    className="border border-black px-2 py-1 text-[8px]"
                  >
                    বিষয়
                  </th>
                  {generateDynamicDates().map((d, i) => (
                    <th
                      key={i}
                      colSpan={2}
                      className="border border-black text-center text-[8px]"
                    >
                      {d.day}
                    </th>
                  ))}
                  <th
                    rowSpan="3"
                    className="border border-black px-2 py-1 text-[8px]"
                  >
                    মন্তব্য
                  </th>
                </tr>
                <tr>
                  {generateDynamicDates().map((d, i) => (
                    <th
                      key={i}
                      colSpan={2}
                      className="border border-black text-center text-[8px]"
                    >
                      {d.date}
                    </th>
                  ))}
                </tr>
                <tr>
                  {generateDynamicDates().map((_, i) => (
                    <React.Fragment key={i}>
                      <th className="border border-black text-center text-[8px] px-2">
                        সবক
                      </th>
                      <th className="border border-black text-center text-[8px]">
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
                          className="border border-black text-center align-top text-[8px]"
                        >
                          {sIdx +1}
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
                      <td className="border border-black px-1 text-center text-[8px]">
                        {subject.name}
                      </td>
                      {generateDynamicDates().map((d) => (
                        <React.Fragment key={d.date}>
                          <td className="border border-black text-center text-[8px]">
                            {/* Frontend intentionally left blank for attendance, PDF should show data */}
                       
                          </td>
                          <td className="border border-black text-center text-[8px]">
                            {/* Frontend intentionally left blank for attendance, PDF should show data */}
      
                          </td>
                        </React.Fragment>
                      ))}
                      <td className="border border-black"></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
