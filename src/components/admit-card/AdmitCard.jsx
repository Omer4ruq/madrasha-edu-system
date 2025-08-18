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

// Import default background images
import defaultBgImage from '../../../public/images/admit-card-bg.jpg';
import defaultBackImage from '../../../public/images/admit-card-back-bg.jpg'; // Add your back image

const AdmitCard = () => {
  // State for filter selections and PDF generation
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(defaultBgImage);
  const [isBackPrint, setIsBackPrint] = useState(false); // New state for back print mode

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

  // Toggle back print mode
  const toggleBackPrint = () => {
    setIsBackPrint(!isBackPrint);
    if (!isBackPrint) {
      setBackgroundImage(defaultBackImage);
    } else {
      setBackgroundImage(defaultBgImage);
    }
  };

  // Handle background image upload
  const handleBackgroundUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to default background
  const resetToDefaultBackground = () => {
    if (isBackPrint) {
      setBackgroundImage(defaultBackImage);
    } else {
      setBackgroundImage(defaultBgImage);
    }
  };

  // Convert image to base64 for reliable printing
  const convertImageToBase64 = (imageUrl) => {
    return new Promise((resolve) => {
      if (imageUrl.startsWith('data:')) {
        resolve(imageUrl);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    });
  };

  // Handle back print PDF generation
  const handleBackPrintPDF = async () => {
    if (!examStudents?.students?.length) {
      toast.error("প্রথমে ফ্রন্ট পেজের জন্য শিক্ষার্থী নির্বাচন করুন!");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Convert background image to base64
      const base64Background = await convertImageToBase64(backgroundImage);
      
      const students = examStudents.students;
      const totalCards = students.length;

      // Group into sets of 3 for each page to match front pages
      const pageCount = Math.ceil(totalCards / 3);
      const pages = [];
      for (let i = 0; i < pageCount; i++) {
        pages.push(i);
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>প্রবেশপত্র - পেছনের অংশ</title>
          <meta charset="UTF-8">
          <style>
            @page { 
              size: A4 portrait; 
              margin: 5mm; 
            }
            body {
              font-family: 'Noto Sans Bengali', Arial, sans-serif;
              margin: 0;
              padding: 5mm;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .page-container {
              width: 200mm;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              gap: 2mm;
              box-sizing: border-box;
            }
            .admit-card-back {
              width: 190mm;
              height: 90mm;
              background: white;
              border: 1px solid #DB9E30;
              margin: 0 auto 5px;
              border-radius: 4mm;
              overflow: hidden;
              position: relative;
              page-break-inside: avoid;
              background-image: url('${base64Background}');
              background-size: 100% 100%;
              background-position: center;
              background-repeat: no-repeat;
            }
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          ${pages
            .map(
              (pageIndex) => `
            <div class="page-container">
              ${Array(3).fill(0).map((_, cardIndex) => `
                <div class="admit-card-back"></div>
              `).join("")}
              ${pageIndex < pages.length - 1 ? '<div class="page-break"></div>' : ""}
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
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success("প্রবেশপত্রের পেছনের অংশ তৈরি হয়েছে! প্রিন্ট বা সেভ করুন।");
    } catch (error) {
      console.error("Error generating back print PDF:", error);
      toast.error("পেছনের অংশ তৈরি করতে সমস্যা হয়েছে!");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle front print PDF generation
  const handleDownloadPDF = async () => {
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

    try {
      // Convert background image to base64
      const base64Background = await convertImageToBase64(backgroundImage);
      
      // Convert institute logo to base64 if exists
      let instituteLogoBase64 = null;
      if (institute.institute_logo) {
        try {
          instituteLogoBase64 = await convertImageToBase64(institute.institute_logo);
        } catch (error) {
          console.log("Failed to convert logo to base64:", error);
        }
      }

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
              margin: 0;
              padding: 5mm;
              color: #441a05;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
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
              margin: 0 auto 5px;
              border-radius: 4mm;
              overflow: hidden;
              position: relative;
              page-break-inside: avoid;
              background-image: url('${base64Background}');
              background-size: 105% 109%;
              background-position: center;
              background-repeat: no-repeat;
            }
            .page-break {
              page-break-after: always;
            }
            
            /* Institute Logo Watermark - Matching your UI */
            .logo-watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.2;
              z-index: 10;
              max-width: 100px;
              max-height: 100px;
              object-fit: contain;
            }
            
            /* Content Overlay - Matching your UI */
            .card-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 20;
            }
            
            /* Institute Name - Matching your UI exactly */
            .institute-name {
              position: absolute;
              top: 12mm;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 14pt;
              font-weight: bold;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            
            /* Student Information - Matching your UI positioning */
            .student-name {
              position: absolute;
              top: 38mm;
              left: 15mm;
              font-size: 12pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            .father-name {
              position: absolute;
              top: 45mm;
              left: 15mm;
              font-size: 12pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            .birth-date {
              position: absolute;
              top: 52mm;
              left: 15mm;
              font-size: 12pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            .class-info {
              position: absolute;
              top: 59mm;
              left: 15mm;
              font-size: 12pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            
            /* Admission Number Box - Horizontal flex layout */
            .admission-box {
              position: absolute;
              top: 38mm;
              right: 15mm;
              border: 2px solid black;
              background: rgba(255,255,255,0.95);
              display: flex;
              flex-direction: row;
            }
            
            /* Roll Number Box - Horizontal flex layout */
            .roll-box {
              position: absolute;
              top: 51mm;
              right: 15mm;
              border: 2px solid black;
              background: rgba(255,255,255,0.95);
              display: flex;
              flex-direction: row;
            }
            
            .box-header {
              background: #f0e68c; /* yellow-200 equivalent */
              padding: 4px 16px;
              text-align: center;
              border-right: 1px solid black;
              font-size: 11pt;
              font-weight: 600;
              color: black;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .box-content {
              background: white;
              padding: 8px 16px;
              text-align: center;
              font-size: 12pt;
              font-weight: bold;
              color: black;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            /* Signature sections - Exact match to your UI */
            .signature-left {
              position: absolute;
              bottom: 5mm;
              left: 15mm;
              text-align: center;
            }
            .signature-right {
              position: absolute;
              bottom: 5mm;
              right: 25mm;
              text-align: center;
            }
            .signature-line {
              border-top: 2px solid black;
              width: 60mm;
              margin-bottom: 4px;
            }
            .signature-text {
              font-size: 10pt;
              color: black;
              font-weight: 600;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            
            /* Font weights to match your UI */
            .font-semibold {
              font-weight: 600;
            }
            .font-bold {
              font-weight: bold;
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
                  ${instituteLogoBase64 ? `<img src="${instituteLogoBase64}" alt="Institute Logo" class="logo-watermark" />` : ''}
                  
                  <div class="card-overlay">
                    <!-- Institute Name -->
                    <div class="institute-name">
                      ${institute.institute_name || "Institute Name"}
                    </div>
                    
                    <!-- Student Information -->
                    <div class="student-name">
                      পরীক্ষার্থীর নাম : <span class="font-semibold">${student.student_name}</span>
                    </div>
                    
                    <div class="father-name">
                      পিতার নাম : <span class="font-semibold">${student.father_name || "N/A"}</span>
                    </div>
                    
                    <div class="birth-date">
                      জন্য তারিখ : <span class="font-semibold">${student.date_of_birth || "N/A"}</span>
                    </div>
                    
                    <div class="class-info">
                      জামাত : <span class="font-semibold">${student.class_name} - ${student.section_name}</span>
                    </div>
                    
                    <!-- Admission Number Box -->
                    <div class="admission-box">
                      <div class="box-header">দাখেলা নং</div>
                      <div class="box-content">${student.user_id}</div>
                    </div>
                    
                    <!-- Roll Number Box -->
                    <div class="roll-box">
                      <div class="box-header">রোল নং</div>
                      <div class="box-content">${student.roll_no || student.user_id}</div>
                    </div>
                    
                    <!-- Signature Lines -->
                    <div class="signature-left">
                      <div class="signature-line"></div>
                      <div class="signature-text">মুহতামিমের সিল ও স্বাক্ষর</div>
                    </div>
                    
                    <div class="signature-right">
                      <div class="signature-line"></div>
                      <div class="signature-text">নায়িমে ইহতামামের স্বাক্ষর</div>
                    </div>
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
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success("প্রবেশপত্র তৈরি হয়েছে! প্রিন্ট বা সেভ করুন।");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("প্রবেশপত্র তৈরি করতে সমস্যা হয়েছে!");
    } finally {
      setIsGeneratingPDF(false);
    }
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

  // Render back side preview
  const renderBackCard = () => {
    return (
      <div
        className="admit-card relative border border-[#DB9E30] rounded-lg w-[190mm] h-[90mm] overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: '105% 105%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Just the background image, no content */}
      </div>
    );
  };

  // Render single admit card for screen preview
  const renderSingleCard = (student, index) => {
    const instituteInfo = institute || {};

    return (
      <div
        key={student.user_id}
        className="admit-card relative border border-[#DB9E30] rounded-none w-[190mm] h-[90mm] overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: '105% 109%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Institute Logo Watermark */}
        {instituteInfo.institute_logo && (
          <img 
            src={instituteInfo.institute_logo} 
            alt="Institute Logo"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 max-w-[100px] max-h-[100px] object-contain z-10"
          />
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20">
          {/* Institute Name */}
          <div 
            className="absolute top-[12mm] left-0 right-0 text-center text-[14pt] font-bold text-black"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
          >
            {instituteInfo.institute_name || "Institute Name"}
          </div>

          {/* Student Information */}
          <div 
            className="absolute top-[38mm] left-[15mm] text-[12pt] text-black"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
          >
            পরীক্ষার্থীর নাম : <span className="font-semibold">{student.student_name}</span>
          </div>

          <div 
            className="absolute top-[45mm] left-[15mm] text-[12pt] text-black"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
          >
            পিতার নাম : <span className="font-semibold">{student.father_name || "N/A"}</span>
          </div>

          <div 
            className="absolute top-[52mm] left-[15mm] text-[12pt] text-black"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
          >
            জন্য তারিখ : <span className="font-semibold">{student.date_of_birth || "N/A"}</span>
          </div>

          <div 
            className="absolute top-[59mm] left-[15mm] text-[12pt] text-black"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
          >
            জামাত : <span className="font-semibold">{student.class_name} - {student.section_name}</span>
          </div>

          {/* Admission Number Box - Horizontal Layout */}
          <div className="absolute top-[38mm] right-[15mm] border-2 border-black bg-white/95 flex flex-row">
            <div className="bg-yellow-200 px-4 py-2 text-center border-r border-black flex items-center justify-center">
              <span className="text-[11pt] font-semibold text-black">দাখেলা নং</span>
            </div>
            <div className="bg-white px-4 py-2 text-center flex items-center justify-center">
              <span className="text-[12pt] font-bold text-black">{student.user_id}</span>
            </div>
          </div>

          {/* Roll Number Box - Horizontal Layout */}
          <div className="absolute top-[51mm] right-[15mm] border-2 border-black bg-white/95 flex flex-row">
            <div className="bg-yellow-200 px-4 py-2 text-center border-r border-black flex items-center justify-center">
              <span className="text-[11pt] font-semibold text-black">রোল নং</span>
            </div>
            <div className="bg-white px-4 py-2 text-center flex items-center justify-center">
              <span className="text-[12pt] font-bold text-black">{student.roll_no || student.user_id}</span>
            </div>
          </div>

          {/* Signature Lines */}
          <div className="absolute bottom-[5mm] left-[15mm] text-center">
            <div className="border-t-2 border-black w-[60mm] mb-1"></div>
            <span 
              className="text-[10pt] text-black font-semibold"
              style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
            >
              মুহতামিমের সিল ও স্বাক্ষর
            </span>
          </div>

          <div className="absolute bottom-[5mm] right-[15mm] text-center">
            <div className="border-t-2 border-black w-[60mm] mb-1"></div>
            <span 
              className="text-[10pt] text-black font-semibold"
              style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
            >
              নায়িমে ইহতামামের স্বাক্ষর
            </span>
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
        <div className="flex items-center justify-between mb-6 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <IoPrint className="text-4xl text-[#441a05]" />
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              প্রবেশপত্র {isBackPrint ? "- পেছনের অংশ" : ""}
            </h3>
          </div>
          
          {/* Back Print Toggle Button */}
          <button
            onClick={toggleBackPrint}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isBackPrint 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isBackPrint ? 'ফ্রন্ট প্রিন্ট' : 'ব্যাক প্রিন্ট'}
          </button>
        </div>

        {/* Background Image Upload */}
        <div className="mb-6 no-print">
          <label className="block text-sm font-medium text-[#441a05] mb-2">
            {isBackPrint ? 'পেছনের' : 'সামনের'} ব্যাকগ্রাউন্ড ইমেজ আপলোড করুন (ঐচ্ছিক)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className="block w-full text-sm text-[#441a05] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#DB9E30] file:text-[#441a05] hover:file:bg-[#c8922a]"
          />
          <div className="mt-2 flex items-center space-x-4">
            {backgroundImage && (
              <img 
                src={backgroundImage} 
                alt="Background Preview" 
                className="h-20 w-auto border rounded"
              />
            )}
            <button 
              onClick={resetToDefaultBackground}
              className="text-blue-600 text-sm hover:text-blue-800 underline"
            >
              ডিফল্ট ব্যাকগ্রাউন্ড ব্যবহার করুন
            </button>
          </div>
        </div>

        {!isBackPrint && (
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
              />
            </div>
          </div>
        )}

        {/* Print Buttons */}
        <div className="mt-6 flex space-x-4 no-print">
          {isBackPrint ? (
            <button
              onClick={handleBackPrintPDF}
              disabled={isGeneratingPDF || !examStudents?.students?.length}
              className="px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center space-x-2">
                {isGeneratingPDF ? (
                  <FaSpinner className="w-5 h-5 spinner" />
                ) : (
                  <IoPrint className="w-5 h-5" />
                )}
                <span>
                  {isGeneratingPDF ? "তৈরি হচ্ছে..." : "পেছনের অংশ প্রিন্ট করুন"}
                </span>
              </span>
            </button>
          ) : (
            selectedClassConfig && selectedAcademicYear && selectedExam && (
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center space-x-2">
                  {isGeneratingPDF ? (
                    <FaSpinner className="w-5 h-5 spinner" />
                  ) : (
                    <IoPrint className="w-5 h-5" />
                  )}
                  <span>
                    {isGeneratingPDF ? "তৈরি হচ্ছে..." : "প্রবেশপত্র প্রিন্ট করুন"}
                  </span>
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Printable/PDF Area */}
      <div ref={printRef} className="admit-card-container w-[210mm] mx-auto">
        {isBackPrint ? (
          // Back print preview
          examStudents?.students?.length > 0 ? (
            <div className="flex flex-col items-center gap-[2mm]">
              {Array(Math.ceil(examStudents.students.length / 3))
                .fill(0)
                .map((_, pageIndex) => (
                  <React.Fragment key={pageIndex}>
                    {Array(3)
                      .fill(0)
                      .map((_, cardIndex) => (
                        <div key={cardIndex}>
                          {renderBackCard()}
                        </div>
                      ))}
                    {pageIndex < Math.ceil(examStudents.students.length / 3) - 1 && (
                      <div className="page-break"></div>
                    )}
                  </React.Fragment>
                ))}
            </div>
          ) : (
            <div className="text-center text-[#441a05] p-8">
              প্রথমে ফ্রন্ট প্রিন্ট মোডে শিক্ষার্থী নির্বাচন করুন।
            </div>
          )
        ) : (
          // Front print preview (your existing logic)
          selectedClassConfig && selectedAcademicYear && selectedExam ? (
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
          )
        )}
      </div>
    </div>
  );
};

export default AdmitCard;