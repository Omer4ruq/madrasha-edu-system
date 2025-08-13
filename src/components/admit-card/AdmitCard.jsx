import React, { useState, useRef } from "react";
import Select from "react-select";
import { useReactToPrint } from "react-to-print";
import { IoPrint, IoDocumentText } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetExamApiQuery } from "../../redux/features/api/exam/examApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";
import selectStyles from "../../utilitis/selectStyles";
import { useGetClassExamStudentsQuery } from "../../redux/features/api/class-exam-students/classExamStudentApi ";

const AdmitCard = () => {
  // State for filter selections and PDF generation
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch data from APIs
  const {
    data: classConfigs,
    isLoading: classLoading,
    error: classError,
  } = useGetclassConfigApiQuery();
  const {
    data: academicYears,
    isLoading: yearLoading,
    error: yearError,
  } = useGetAcademicYearApiQuery();
  const {
    data: exams,
    isLoading: examLoading,
    error: examError,
  } = useGetExamApiQuery();
  const {
    data: institute,
    isLoading: instituteLoading,
    error: instituteError,
  } = useGetInstituteLatestQuery();
  const {
    data: examStudents,
    isLoading: studentsLoading,
    isFetching: studentsFetching,
    error: studentsError,
  } = useGetClassExamStudentsQuery(
    {
      class_id: selectedClassConfig?.value,
      examname: selectedExam?.value,
      academic_year_id: selectedAcademicYear?.value,
    },
    { skip: !selectedClassConfig || !selectedExam || !selectedAcademicYear }
  );

  // Print ref
  const printRef = useRef();

  // Handle print
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 5mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        .admit-card-container {
          width: 200mm;
          margin: 0;
          padding: 5mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 2mm;
        }
        .admit-card {
          width: 190mm;
          height: 90mm;
          page-break-inside: avoid;
          background: white;
          border: 1px solid #DB9E30;
          border-radius: 4mm;
          overflow: hidden;
          font-size: 10pt;
        }
        .page-break {
          page-break-after: always;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (instituteLoading) {
      toast.error("ইনস্টিটিউট তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন!");
      return;
    }

    if (!institute) {
      toast.error("ইনস্টিটিউট তথ্য পাওয়া যায়নি!");
      return;
    }

    if (
      !selectedClassConfig ||
      !selectedAcademicYear ||
      !selectedExam ||
      !examStudents?.students?.length
    ) {
      toast.error(
        "ক্লাস, শিক্ষাবর্ষ, পরীক্ষা নির্বাচন করুন এবং শিক্ষার্থী তথ্য লোড হয়েছে কিনা দেখুন!"
      );
      return;
    }

    setIsGeneratingPDF(true);

    const examInfo =
      exams?.find((exam) => exam.id === selectedExam?.value) || {};
    const students = examStudents.students;

    // Group students into sets of 3 for each page
    const studentGroups = [];
    for (let i = 0; i < students.length; i += 3) {
      studentGroups.push(students.slice(i, i + 3));
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>প্রবেশপত্র</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 portrait; 
            margin: 5mm; 
          }
          body {
            font-family: 'Noto Sans Bengali', Arial, sans-serif;
            font-size: 10pt;
            margin: 0;
            padding: 5mm;
            color: #441a05;
          }
          .page-container {
            width: 200mm;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 2mm;
            box-sizing: border-box;
          }
          .admit-card {
            width: 190mm;
            height: 90mm;
            background: white;
            border: 1px solid #DB9E30;
            margin:0 auto 5px;
            border-radius: 4mm;
            overflow: hidden;
            position: relative;
            page-break-inside: avoid;
          }
          .page-break {
            page-break-after: always;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #DB9E30;
            border-top-left-radius: 4mm;
            border-top-right-radius: 4mm;
            padding: 1mm 4mm;
          }
          .header img {
            width: 8mm;
            height: 8mm;
            object-fit: contain;
          }
          .header-text {
            text-align: center;
            color: white;
          }
          .header-text h1 {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
          }
          .header-text p {
            font-size: 9pt;
            margin: 0.5mm 0;
          }
          .title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            color: #DB9E30;
            margin: 2mm 0;
            text-decoration: underline;
          }
          .student-info {
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin-top: 2mm;
            padding: 3mm;
            font-size: 10pt;
          }
          .student-info p {
            font-size: 11pt;
            margin: 1mm 0;
          }
          .roll-reg {
            border: 1px solid #DB9E30;
            padding: 2mm 4mm;
            border-radius: 2mm;
            background: #DB9E30;
            color: white;
            transform: translateX(1mm);
          }
          .roll-reg p {
            margin: 1mm 0;
            font-size: 11pt;
          }
          .instructions {
            margin-top: 1mm;
            padding: 0 3mm;
            width: 70%;
            font-size: 9pt;
          }
          .signature {
            position: absolute;
            bottom: 2mm;
            right: 4mm;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #441a05;
            width: 20mm;
            margin: 0 auto;
          }
          .signature p {
            font-size: 9pt;
            margin-top: 1mm;
            font-weight: 600;
          }
          .background-image {
            position: absolute;
            width: 80mm;
            height: 50mm;
            left: 28%;
            top: 30%;
            background: url('https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg');
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0.1;
            z-index: 0;
          }
        </style>
      </head>
      <body>
        ${studentGroups
          .map(
            (group, pageIndex) => `
          <div class="page-container">
            ${group
              .map(
                (student) => `
              <div class="admit-card">
                <div class="background-image"></div>
                <div class="header">
                  <img src="${
                    institute.institute_logo ||
                    "https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg"
                  }" alt="Institute Logo" />
                  <div class="header-text">
                    <h1>${institute.institute_name || "Institute Name"}</h1>
                    <p>${institute.institute_address || "Address"}</p>
                    <p><strong>পরীক্ষা:</strong> ${
                      examInfo.name || "Exam Name"
                    } | <strong>তারিখ:</strong> ${
                  examInfo.start_date || "Date"
                }</p>
                  </div>
                  <img src="${
                    institute.institute_logo ||
                    "https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg"
                  }" alt="Institute Logo" />
                </div>
                <div class="title">প্রবেশপত্র</div>
                <div class="student-info">
                  <div class="space-y-1">
                    <p><strong>নাম:</strong> ${student.student_name}</p>
                    <p><strong>শ্রেণি:</strong> ${student.class_name}</p>
                    <p><strong>সেকশন:</strong> ${student.section_name}</p>
                    <p><strong>সেশন:</strong> ${
                      selectedAcademicYear?.label || "N/A"
                    }</p>
                  </div>
                  <div class="roll-reg">
                    <p><strong>রোল:</strong> ${
                      student.roll_no || student.user_id
                    }</p>
                    <p><strong>রেজি:</strong> ${student.user_id}</p>
                  </div>
                </div>
                <div class="instructions">
                  <p><strong>নির্দেশ:</strong> পরীক্ষার হলে এই প্রবেশপত্র অবশ্যই সঙ্গে আনতে হবে।</p>
                  <p><strong>নির্দেশ:</strong> পরীক্ষা শুরুর ১৫ মিনিট পূর্বে উপস্থিত থাকতে হবে।</p>
                  <p><strong>নির্দেশ:</strong> প্রয়োজনীয় সামগ্রী: বোর্ড, শার্পনার, রুলার, পেন্সিল, কলম, ইরেজার।</p>
                </div>
                <div class="signature">
                  <div class="signature-line"></div>
                  <p>পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর</p>
                </div>
              </div>
            `
              )
              .join("")}
            ${
              pageIndex < studentGroups.length - 1
                ? '<div class="page-break"></div>'
                : ""
            }
          </div>
        `
          )
          .join("")}
        <script>
          let printAttempted = false;
          window.onbeforeprint = () => { printAttempted = true; };
          window.onafterprint = () => { window.close(); };
          window.addEventListener('beforeunload', (event) => {
            if (!printAttempted) { window.close(); }
          });
          window.print();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success("প্রবেশপত্র তৈরি হয়েছে! প্রিন্ট বা সেভ করুন।");
    setIsGeneratingPDF(false);
  };

  // Format select options
  const classConfigOptions =
    classConfigs?.map((config) => {
      const section = config.section_name ? ` - ${config.section_name}` : "";
      const shift = config.shift_name ? ` (${config.shift_name})` : "";
      return {
        value: config.id,
        label: `${config.class_name}${section}${shift}`,
      };
    }) || [];

  const academicYearOptions =
    academicYears?.map((year) => ({
      value: year.id,
      label: year.name,
    })) || [];

  const examOptions =
    exams?.map((exam) => ({
      value: exam.id,
      label: exam.name,
    })) || [];

  // Loading state
  if (
    classLoading ||
    yearLoading ||
    examLoading ||
    instituteLoading ||
    studentsLoading ||
    studentsFetching
  ) {
    return (
      <div className="p-8 text-[#441a05]/70 animate-fadeIn">লোড হচ্ছে...</div>
    );
  }

  // Error state
  if (classError || yearError || examError || instituteError || studentsError) {
    return (
      <div className="p-8 text-[#441a05]/70 animate-fadeIn">
        ডেটা লোড করতে ত্রুটি:{" "}
        {studentsError?.data?.message ||
          classError?.data?.message ||
          yearError?.data?.message ||
          examError?.data?.message ||
          instituteError?.data?.message ||
          "Unknown error"}
      </div>
    );
  }

  // Render single admit card
  const renderSingleCard = (student, index) => {
    const instituteInfo = institute || {};
    const examInfo =
      exams?.find((exam) => exam.id === selectedExam?.value) || {};

    return (
      <div
        key={student.user_id}
        className="admit-card relative border border-[#DB9E30] rounded-lg w-[190mm] h-[90mm] overflow-hidden"
      >
        {/* Background Image Layer */}
        <div className="absolute inset-0 w-[80mm] h-[50mm] left-[28%] top-[30%] bg-[url('https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg')] bg-contain bg-center bg-no-repeat opacity-10 z-0"></div>

        {/* Header */}
        <div className="text-center flex justify-between items-center bg-[#DB9E30] rounded-t-lg py-1 px-4">
          <img
            src={
              instituteInfo.institute_logo ||
              "https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg"
            }
            alt="Institute Logo"
            className="w-8 h-8 object-contain"
          />
          <div>
            <h1 className="text-xs font-bold text-white uppercase">
              {instituteInfo.institute_name || "Institute Name"}
            </h1>
            <p className="text-[9px] text-white">
              {instituteInfo.institute_address || "Address"}
            </p>
            <p className="text-[9px] mt-0.5 text-white">
              <strong>পরীক্ষা:</strong> {examInfo.name || "Exam Name"} |{" "}
              <strong>তারিখ:</strong> {examInfo.start_date || "Date"}
            </p>
          </div>
          <img
            src={
              instituteInfo.institute_logo ||
              "https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg"
            }
            alt="Institute Logo"
            className="w-8 h-8 object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-sm text-center font-extrabold text-[#DB9E30] mt-2 underline">
          প্রবেশপত্র
        </h2>

        {/* Student Info */}
        <div className="text-[10px] mt-2 text-[#441a05] p-3 flex justify-around items-center">
          <div className="w-fit space-y-1">
            <p className="text-[11px]">
              <strong>নাম:</strong> {student.student_name}
            </p>
            <p className="text-[11px]">
              <strong>শ্রেণি:</strong> {student.class_name}
            </p>
            <p className="text-[11px]">
              <strong>সেকশন:</strong> {student.section_name}
            </p>
            <p className="text-[11px]">
              <strong>সেশন:</strong> {selectedAcademicYear?.label || "N/A"}
            </p>
          </div>
          <div className="border p-2 px-4 rounded-lg bg-[#DB9E30] translate-x-1">
            <p className="mb-1 text-[11px] text-white">
              <strong>রোল:</strong> {student.roll_no || student.user_id}
            </p>
            <p className="text-[11px] text-white">
              <strong>রেজি:</strong> {student.user_id}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-1 text-[9px] text-[#440d05] w-[70%] p-3">
          <p>
            <strong>নির্দেশ:</strong> পরীক্ষার হলে এই প্রবেশপত্র অবশ্যই সঙ্গে
            আনতে হবে।
          </p>
          <p>
            <strong>নির্দেশ:</strong> পরীক্ষা শুরুর ১৫ মিনিট পূর্বে উপস্থিত
            থাকতে হবে।
          </p>
          <p>
            <strong>নির্দেশ:</strong> প্রয়োজনীয় সামগ্রী: বোর্ড, শার্পনার,
            রুলার, পেন্সিল, কলম, ইরেজার।
          </p>
        </div>

        {/* Signature */}
        <div className="flex justify-end mt-[-55px] mb-2 mr-4">
          <div className="text-center">
            <div className="border-t border-[#441a05] w-20 mx-auto"></div>
            <p className="text-[9px] text-[#441a05] mt-1 font-semibold">
              পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 w-full relative min-h-screen">
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
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
          }
          .admit-card-container {
            width: 200mm;
            margin: 5mm auto;
            display: flex;
            flex-direction: column;
            gap: 2mm;
            box-sizing: border-box;
            font-family: 'Noto Sans Bengali', sans-serif;
          }
          .admit-card {
            width: 190mm;
            height: 90mm;
            background: white;
            box-sizing: border-box;
            border: 1px solid #DB9E30;
            border-radius: 4mm;
            overflow: hidden;
          }
          @media screen {
            .admit-card {
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
          }
          .spinner {
            animation: spin 1s linear infinite;
          }
        `}
      </style>

      {/* Filter Controls */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
          <IoPrint className="text-4xl text-[#441a05]" />
          <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
            প্রবেশপত্র
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          <div>
            <label className="block text-sm font-medium text-[#441a05] mb-1">
              ক্লাস কনফিগারেশন
            </label>
            <Select
              options={classConfigOptions}
              value={selectedClassConfig}
              onChange={setSelectedClassConfig}
              placeholder="ক্লাস নির্বাচন করুন..."
              isClearable
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="animate-scaleIn"
              aria-label="ক্লাস কনফিগারেশন"
              title="ক্লাস নির্বাচন করুন / Select class configuration"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#441a05] mb-1">
              শিক্ষাবর্ষ
            </label>
            <Select
              options={academicYearOptions}
              value={selectedAcademicYear}
              onChange={setSelectedAcademicYear}
              placeholder="বছর নির্বাচন করুন..."
              isClearable
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="animate-scaleIn"
              aria-label="শিক্ষাবর্ষ"
              title="শিক্ষাবর্ষ নির্বাচন করুন / Select academic year"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#441a05] mb-1">
              পরীক্ষা
            </label>
            <Select
              options={examOptions}
              value={selectedExam}
              onChange={setSelectedExam}
              placeholder="পরীক্ষা নির্বাচন করুন..."
              isClearable
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="animate-scaleIn"
              aria-label="পরীক্ষা"
              title="পরীক্ষা নির্বাচন করুন / Select exam"
            />
          </div>
        </div>

        {/* Print and PDF Buttons */}
        {selectedClassConfig && selectedAcademicYear && selectedExam && (
          <div className="mt-6 flex space-x-4 no-print">
            <button
              onClick={handleDownloadPDF}
              className="px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
              aria-label="প্রবেশপত্র প্রিন্ট করুন"
              title="প্রবেশপত্র প্রিন্ট করুন / Print admit cards"
            >
              <span className="flex items-center space-x-2">
                <IoPrint className="w-5 h-5" />
                <span>প্রবেশপত্র প্রিন্ট করুন</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Printable/PDF Area */}
      <div ref={printRef} className="admit-card-container w-[210mm] mx-auto">
        {selectedClassConfig && selectedAcademicYear && selectedExam ? (
          examStudents?.students?.length > 0 ? (
            <div className="flex flex-col items-center gap-[2mm]">
              {examStudents.students.map((student, index) => (
                <React.Fragment key={student.user_id}>
                  {renderSingleCard(student, index)}
                  {index % 3 === 2 &&
                    index < examStudents.students.length - 1 && (
                      <div className="page-break"></div>
                    )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center text-[#441a05] p-8">
              কোনো শিক্ষার্থী পাওয়া যায়নি। ফিল্টার পরীক্ষা করুন।
            </div>
          )
        ) : (
          <div className="text-center text-[#441a05] p-8">
            দয়া করে সকল ফিল্টার নির্বাচন করুন।
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmitCard;
