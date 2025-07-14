import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Toaster, toast } from "react-hot-toast";
import { FaSpinner, FaDownload, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetStudentActiveByClassQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetClassSubjectsByClassIdQuery } from "../../redux/features/api/class-subjects/classSubjectsApi";

const MutalayaReport = () => {
  const [selectedClassConfig, setSelectedClassConfig] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [dynamicReportData, setDynamicReportData] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Generate dynamic dates based on date range (skip Fridays)
  const generateDynamicDates = () => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Skip Friday (day 5 in JavaScript Date.getDay() where Sunday = 0)
      if (d.getDay() !== 5) {
        const bnDate = d.toLocaleDateString("bn-BD", { day: "numeric" });
        const bnDay = d.toLocaleDateString("bn-BD", { weekday: "long" });
        dates.push({ day: bnDay, date: bnDate });
      }
    }
    return dates;
  };

  // Simulate attendance data (keeping empty for PDF)
  const simulateAttendance = (studentId, subjectName) => {
    const dynamicDates = generateDynamicDates();
    const attendance = {};
    dynamicDates.forEach((d) => {
      attendance[d.date] = {
        sobok: "", // Keep empty
        mutalaya: "", // Keep empty
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

  // Enhanced PDF generation using print window approach (like ExamRoutineTable)
  const generateMutalayaPDF = () => {
    if (!selectedClassConfig || !startDate || !endDate) {
      toast.error("ক্লাস, শুরুর তারিখ এবং শেষের তারিখ নির্বাচন করুন");
      return;
    }

    if (dynamicReportData.length === 0) {
      toast.error("রিপোর্ট ডেটা খুঁজে পাওয়া যায়নি!");
      return;
    }

    setIsDownloading(true);
    
    try {
      const printWindow = window.open('', '_blank');
      
      const selectedClass = classConfigs?.find((c) => c.id === Number(selectedClassConfig));
      const className = selectedClass?.class_name;
      const monthName = new Date(startDate).toLocaleDateString("bn-BD", { month: "long" });
      const dynamicDates = generateDynamicDates();

      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>মুতালায়া রিপোর্ট - ${className}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Noto Sans Bengali', 'SutonnyMJ', 'Kalpurush', Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 25px; 
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .institution { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 8px; 
              color: #1a1a1a;
            }
            .report-title { 
              font-size: 18px; 
              font-weight: bold;
              margin: 8px 0; 
              color: #2c3e50;
            }
            .class-info { 
              font-size: 14px; 
              color: #555; 
              margin: 5px 0;
            }
            .report-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 15px 0; 
              border: 2px solid #333;
              font-size: 10px;
            }
            .report-table th, .report-table td { 
              border: 1px solid #333; 
              padding: 6px 4px; 
              text-align: center;
              vertical-align: middle;
            }
            .report-table th { 
              background-color: #f8f9fa; 
              font-weight: bold; 
              font-size: 9px;
              color: #2c3e50;
            }
            .report-table td {
              font-size: 9px;
              min-height: 25px;
            }
            .student-name {
              text-align: left;
              padding-left: 8px;
              font-weight: 500;
              writing-mode: vertical-lr;
              text-orientation: mixed;
              width: 25px;
              min-height: 80px;
              line-height: 1.2;
            }
            .subject-name {
              text-align: left;
              padding-left: 8px;
              font-weight: 500;
            }
            .roll-number {
              font-weight: bold;
              background-color: #f0f8ff;
            }
            .day-header {
              background-color: #e3f2fd;
              font-weight: bold;
              color: #1565c0;
            }
            .date-header {
              background-color: #f5f5f5;
              font-weight: bold;
              color: #424242;
            }
            .attendance-cell {
              background-color: #fafafa;
              min-width: 30px;
              height: 25px;
            }
            .comments-cell {
              background-color: #fff9c4;
              min-width: 80px;
            }
            .footer {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            .signature-section {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              padding: 0 20px;
            }
            .signature-box {
              text-align: center;
              border-top: 1px solid #333;
              padding-top: 8px;
              width: 180px;
              font-size: 11px;
              color: #444;
            }
            .notes-section {
              margin-top: 20px;
              padding: 15px;
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 5px;
              font-size: 10px;
              color: #495057;
            }
            .notes-title {
              font-weight: bold;
              margin-bottom: 8px;
              color: #2c3e50;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 15px;
              }
              .no-print { display: none; }
              .report-table {
                font-size: 8px;
              }
              .report-table th, .report-table td {
                padding: 4px 2px;
                font-size: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="institution">[প্রতিষ্ঠানের নাম]</div>
            <div class="report-title">মুতালায়া ও সবক শুনানোর রিপোর্ট</div>
            <div class="class-info">
              জামাত: ${className} | 
              সেকশন: ${selectedClass?.section_name || ''} | 
              শিফট: ${selectedClass?.shift_name || ''} | 
              মাস: ${monthName} - ২০২৫
            </div>
          </div>

          <table class="report-table">
            <thead>
              <tr>
                <th rowspan="3" style="width: 8%;">ক্রমিক</th>
                <th rowspan="3" style="width: 15%;">নাম</th>
                <th rowspan="3" style="width: 12%;">বিষয়</th>
      `;

      // Generate dynamic date headers
      dynamicDates.forEach((d) => {
        htmlContent += `<th colspan="2" class="day-header" style="width: ${Math.floor(65 / dynamicDates.length)}%;">${d.day}</th>`;
      });

      htmlContent += `
                <th rowspan="3" style="width: 10%;">মন্তব্য</th>
              </tr>
              <tr>
      `;

      // Generate date row
      dynamicDates.forEach((d) => {
        htmlContent += `<th colspan="2" class="date-header">${d.date}</th>`;
      });

      htmlContent += `
              </tr>
              <tr>
      `;

      // Generate sobok/mutalaya headers
      dynamicDates.forEach(() => {
        htmlContent += `
          <th style="width: 4%;">সবক</th>
          <th style="width: 4%;">মুতালায়া</th>
        `;
      });

      htmlContent += `
              </tr>
            </thead>
            <tbody>
      `;

      // Generate table body
      dynamicReportData.forEach((student, sIdx) => {
        student.subjects.forEach((subject, subjIdx) => {
          htmlContent += `<tr>`;
          
          // Roll number (only for first subject)
          if (subjIdx === 0) {
            htmlContent += `
              <td rowspan="${student.subjects.length}" class="roll-number">
                ${student.roll_no}
              </td>
            `;
          }
          
          // Student name (only for first subject)
          if (subjIdx === 0) {
            htmlContent += `
              <td rowspan="${student.subjects.length}" class="student-name">
                ${student.name}
              </td>
            `;
          }
          
          // Subject name
          htmlContent += `<td class="subject-name">${subject.name}</td>`;
          
          // Attendance cells for each date
          dynamicDates.forEach(() => {
            htmlContent += `
              <td class="attendance-cell"></td>
              <td class="attendance-cell"></td>
            `;
          });
          
          // Comments cell
          htmlContent += `<td class="comments-cell"></td>`;
          htmlContent += `</tr>`;
        });
      });

      htmlContent += `
            </tbody>
          </table>

          <div class="notes-section">
            <div class="notes-title">নির্দেশনা:</div>
            <ul style="margin: 0; padding-left: 20px;">
              <li>সবক কলামে দৈনিক পঠিত পৃষ্ঠা সংখ্যা লিখুন</li>
              <li>মুতালায়া কলামে পুনরায় অধ্যয়নের বিষয় উল্লেখ করুন</li>
              <li>অনুপস্থিতির ক্ষেত্রে 'অ' এবং ছুটির ক্ষেত্রে 'ছ' লিখুন</li>
              <li>বিশেষ মন্তব্য থাকলে মন্তব্য কলামে লিখুন</li>
            </ul>
          </div>

          <div class="footer">
            <div>রিপোর্ট তৈরির তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
            <div>মুদ্রণের তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
          </div>
          
          <div class="signature-section">
            <div class="signature-box">
              শ্রেণি শিক্ষকের স্বাক্ষর
            </div>
            <div class="signature-box">
              বিভাগীয় প্রধানের স্বাক্ষর
            </div>
            <div class="signature-box">
              প্রধান শিক্ষকের স্বাক্ষর
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();

      const filename = `মুতালায়া_রিপোর্ট_${className}_${monthName}_২০২৫`;
      toast.success(`${filename} PDF সফলভাবে তৈরি হয়েছে!`);
      
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("PDF তৈরি করতে সমস্যা হয়েছে!");
    } finally {
      setIsDownloading(false);
    }
  };

  // Legacy PDF download function (keeping for backward compatibility)
  const downloadPDF = async () => {
    generateMutalayaPDF();
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
          .btn-glow {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
          .btn-glow:hover {
            box-shadow: 0 0 20px rgba(219, 158, 48, 0.5);
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
        
        {/* Enhanced PDF Download Button */}
        <button
            onClick={generateMutalayaPDF}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              !selectedClassConfig || !startDate || !endDate || classConfigsLoading || studentsLoading || subjectsLoading || isDownloading
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 btn-glow"
            }`}
            disabled={
              !selectedClassConfig || !startDate || !endDate || classConfigsLoading || studentsLoading || subjectsLoading || isDownloading
            }
            title="মুতালায়া রিপোর্ট PDF ডাউনলোড করুন"
          >
            {isDownloading ? (
              <>
                <FaSpinner className="animate-spin text-lg" />
                <span>PDF তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <FaFilePdf className="text-lg" />
                <span>PDF ডাউনলোড</span>
              </>
            )}
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
                    বিষয়
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
                          {student.roll_no}
                        </td>
                      )}
                      {subjIdx === 0 && (
                        <td
                          rowSpan={student.subjects.length}
                          className="border border-black align-top px-1 text-center text-[8px]"
                          style={{ 
                            transform: 'rotate(180deg)',
                            writingMode: 'vertical-rl', 
                            textOrientation: 'mixed',
                            width: '25px',
                            minHeight: '80px',
                            lineHeight: '1.2'
                          }}
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
                            {/* Empty cell for manual entry */}
                          </td>
                          <td className="border border-black text-center text-[8px]">
                            {/* Empty cell for manual entry */}
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