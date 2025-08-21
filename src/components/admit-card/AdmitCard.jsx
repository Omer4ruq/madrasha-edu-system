import React, { useState, useRef } from "react";
import Select from "react-select";
import { useReactToPrint } from "react-to-print";
import { IoPrint, IoDocumentText, IoCheckbox, IoSquareOutline, IoSearch } from "react-icons/io5";
import { FaSpinner, FaUser, FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetExamApiQuery } from "../../redux/features/api/exam/examApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";
import selectStyles from "../../utilitis/selectStyles";
import { useGetClassExamStudentsQuery } from "../../redux/features/api/class-exam-students/classExamStudentApi ";

// Import default background images
import defaultBgImage from '../../../public/images/admit-card-bg.jpg';
import defaultBackImage from '../../../public/images/admit-card-back-bg.jpg';

const AdmitCard = () => {
  // State for filter selections and PDF generation
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(defaultBgImage);
  const [isBackPrint, setIsBackPrint] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState(new Set()); // For individual selection
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // New search state

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

  // Filter students based on search term
  const filteredStudents = examStudents?.students?.filter(student => 
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user_id.toString().includes(searchTerm)
  ) || [];

  // Handle individual student selection
  const handleStudentSelection = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
    setSelectAll(newSelected.size === filteredStudents.length);
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents(new Set());
    } else {
      const allStudentIds = new Set(filteredStudents.map(s => s.user_id) || []);
      setSelectedStudents(allStudentIds);
    }
    setSelectAll(!selectAll);
  };

  // Update select all when students change
  React.useEffect(() => {
    if (filteredStudents) {
      setSelectAll(selectedStudents.size === filteredStudents.length && filteredStudents.length > 0);
    }
  }, [selectedStudents, filteredStudents]);

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

  // Handle single student print
  const handleSingleStudentPrint = async (student) => {
    if (instituteLoading) {
      toast.error("ইনস্টিটিউট তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন!");
      return;
    }

    if (!institute) {
      toast.error("ইনস্টিটিউট তথ্য পাওয়া যায়নি!");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const base64Background = await convertImageToBase64(backgroundImage);
      let instituteLogoBase64 = null;
      
      if (institute.institute_logo) {
        try {
          instituteLogoBase64 = await convertImageToBase64(institute.institute_logo);
        } catch (error) {
          console.log("Failed to convert logo to base64:", error);
        }
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>প্রবেশপত্র - ${student.student_name}</title>
          <meta charset="UTF-8">
          <style>
            @page { 
              size: A4 portrait; 
              margin: 0mm; 
                padding: 0;
            }
            body {
              font-family: 'Noto Sans Bengali', Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #441a05;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .page-container {
              width: 100%;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 5mm 0;
              box-sizing: border-box;
              gap: 6mm;
              box-sizing: border-box;
            }
            .admit-card {
              width: 200mm;
              height: 140mm;
              background: white;
              // border: 2px solid #DB9E30;
              // border-radius: 6mm;
              overflow: hidden;
              position: relative;
              background-image: url('${base64Background}');
              background-size: 115% 115%;
              background-position: center;
              background-repeat: no-repeat;
            }
            
            /* Institute Logo Watermark */
            .logo-watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.15;
              z-index: 10;
              max-width: 120px;
              max-height: 120px;
              object-fit: contain;
            }
            
            /* Content Overlay */
            .card-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 20;
            }
            
            /* Institute Name */
            .institute-name {
              position: absolute;
              top: 18mm;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 18pt;
              font-weight: bold;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            
            /* Student Information */
            .student-name {
              position: absolute;
              top: 55mm;
              left: 20mm;
              font-size: 16pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            .father-name {
              position: absolute;
              top: 65mm;
              left: 20mm;
              font-size: 16pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            .birth-date {
              position: absolute;
              top: 75mm;
              left: 20mm;
              font-size: 16pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            .class-info {
              position: absolute;
              top: 85mm;
              left: 20mm;
              font-size: 16pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            
            /* Admission Number Box */
            .admission-box {
              position: absolute;
              top: 55mm;
              right: 20mm;
              border: 2px solid black;
              background: rgba(255,255,255,0.95);
              display: flex;
              flex-direction: row;
            }
            
            /* Roll Number Box */
            .roll-box {
              position: absolute;
              top: 75mm;
              right: 20mm;
              border: 2px solid black;
              background: rgba(255,255,255,0.95);
              display: flex;
              flex-direction: row;
            }
            
            .box-header {
              background: #f0e68c;
              padding: 8px 20px;
              text-align: center;
              border-right: 1px solid black;
              font-size: 14pt;
              font-weight: 600;
              color: black;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .box-content {
              background: white;
              padding: 8px 20px;
              text-align: center;
              font-size: 16pt;
              font-weight: bold;
              color: black;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            /* Signature sections */
            .signature-left {
              position: absolute;
              bottom: 8mm;
              left: 20mm;
              text-align: center;
            }
            .signature-right {
              position: absolute;
              bottom: 8mm;
              right: 20mm;
              text-align: center;
            }
            .signature-line {
              border-top: 2px solid black;
              width: 70mm;
              margin-bottom: 6px;
            }
            .signature-text {
              font-size: 12pt;
              color: black;
              font-weight: 600;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="admit-card">
              ${instituteLogoBase64 ? `<img src="${instituteLogoBase64}" alt="Institute Logo" class="logo-watermark" />` : ''}
              
              <div class="card-overlay">
                <!-- Institute Name -->
                <div class="institute-name">
                  ${institute.institute_name || "Institute Name"}
                </div>
                
                <!-- Student Information -->
                <div class="student-name">
                  পরীক্ষার্থীর নাম : <span style="font-weight: 600;">${student.student_name}</span>
                </div>
                
                <div class="father-name">
                  পিতার নাম : <span style="font-weight: 600;">${student.father_name || "N/A"}</span>
                </div>
                
                <div class="birth-date">
                  জন্য তারিখ : <span style="font-weight: 600;">${student.date_of_birth || "N/A"}</span>
                </div>
                
                <div class="class-info">
                  জামাত : <span style="font-weight: 600;">${student.class_name} - ${student.section_name}</span>
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
          </div>
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
      toast.success(`${student.student_name} এর প্রবেশপত্র তৈরি হয়েছে!`);
    } catch (error) {
      console.error("Error generating single student PDF:", error);
      toast.error("প্রবেশপত্র তৈরি করতে সমস্যা হয়েছে!");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle selected students print (2 per page)
  const handleSelectedStudentsPrint = async () => {
    if (selectedStudents.size === 0) {
      toast.error("অন্তত একজন শিক্ষার্থী নির্বাচন করুন!");
      return;
    }

    if (instituteLoading || !institute) {
      toast.error("ইনস্টিটিউট তথ্য পাওয়া যায়নি!");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const base64Background = await convertImageToBase64(backgroundImage);
      let instituteLogoBase64 = null;
      
      if (institute.institute_logo) {
        try {
          instituteLogoBase64 = await convertImageToBase64(institute.institute_logo);
        } catch (error) {
          console.log("Failed to convert logo to base64:", error);
        }
      }

      // Filter selected students
      const selectedStudentsList = examStudents.students.filter(student => 
        selectedStudents.has(student.user_id)
      );

      // Group students into pairs for 2 per page
      const studentPairs = [];
      for (let i = 0; i < selectedStudentsList.length; i += 2) {
        studentPairs.push(selectedStudentsList.slice(i, i + 2));
      }

      const renderStudentCard = (student, isSecond = false) => `
        <div class="admit-card ${isSecond ? 'second-card' : 'first-card'}">
          ${instituteLogoBase64 ? `<img src="${instituteLogoBase64}" alt="Institute Logo" class="logo-watermark" />` : ''}
          
          <div class="card-overlay">
            <!-- Institute Name -->
            <div class="institute-name">
              ${institute.institute_name || "Institute Name"}
            </div>
            
            <!-- Student Information -->
            <div class="student-name">
              পরীক্ষার্থীর নাম : <span style="font-weight: 600;">${student.student_name}</span>
            </div>
            
            <div class="father-name">
              পিতার নাম : <span style="font-weight: 600;">${student.father_name || "N/A"}</span>
            </div>
            
            <div class="birth-date">
              জন্য তারিখ : <span style="font-weight: 600;">${student.date_of_birth || "N/A"}</span>
            </div>
            
            <div class="class-info">
              জামাত : <span style="font-weight: 600;">${student.class_name} - ${student.section_name}</span>
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
      `;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>নির্বাচিত প্রবেশপত্র</title>
          <meta charset="UTF-8">
          <style>
            @page { 
              size: A4 portrait; 
              margin: 0mm; 
              padding: 0mm;
            }

            body {
              font-family: 'Noto Sans Bengali', Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #441a05;
              
            }
        
            .page-container {
              // width: 100%;
              // height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-item:center;
              padding: 5mm 0;
              box-sizing: border-box;
              gap: 6mm;
            }
            .admit-card {
              width: 200mm;
              height: 140mm;
              background: white;
              // border: 2px solid #DB9E30;
              // border-radius: 4mm;
              overflow: hidden;
              position: relative;
              background-image: url('${base64Background}');
              background-size: 100% 100%;
              background-position: center;
              background-repeat: no-repeat;
              margin: 0 auto;
            }
            .page-break {
              page-break-after: always;
            }
            
            /* Institute Logo Watermark */
            .logo-watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.15;
              z-index: 10;
              max-width: 100px;
              max-height: 100px;
              object-fit: contain;
            }
            
            /* Content Overlay */
            .card-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 20;
            }
            
            /* Institute Name */
            .institute-name {
              position: absolute;
              top: 15mm;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 16pt;
              font-weight: bold;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            
            /* Student Information */
            .student-name {
              position: absolute;
              top: 60mm;
              left: 15mm;
              font-size: 14pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            .father-name {
              position: absolute;
              top: 70mm;
              left: 15mm;
              font-size: 14pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            .birth-date {
              position: absolute;
              top: 80mm;
              left: 15mm;
              font-size: 14pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            .class-info {
              position: absolute;
              top: 90mm;
              left: 15mm;
              font-size: 14pt;
              color: black;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
            
            /* Admission Number Box */
            .admission-box {
              position: absolute;
              top: 60mm;
              right: 15mm;
              border: 2px solid black;
              background: rgba(255,255,255,0.95);
              display: flex;
              flex-direction: row;
            }
            
            /* Roll Number Box */
            .roll-box {
              position: absolute;
              top: 75mm;
              right: 15mm;
              border: 2px solid black;
              background: rgba(255,255,255,0.95);
              display: flex;
              flex-direction: row;
            }
            
            .box-header {
              background: #f0e68c;
              padding: 6px 16px;
              text-align: center;
              border-right: 1px solid black;
              font-size: 12pt;
              font-weight: 600;
              color: black;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .box-content {
              background: white;
              padding: 6px 16px;
              text-align: center;
              font-size: 14pt;
              font-weight: bold;
              color: black;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            /* Signature sections */
            .signature-left {
              position: absolute;
              bottom: 15mm;
              left: 15mm;
              font-size:12px;
              text-align: center;
            }
            .signature-right {
              position: absolute;
              bottom: 15mm;
              font-size:12px;
              right: 15mm;
              text-align: center;
            }
            .signature-line {
              border-top: 2px solid black;
              width: 60mm;
              margin-bottom: 4px;
            }
            .signature-text {
              font-size: 11pt;
              color: black;
              font-weight: 600;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
            }
          </style>
        </head>
        <body>
          ${studentPairs.map((pair, pageIndex) => `
            <div class="page-container">
              ${renderStudentCard(pair[0], false)}
              ${pair[1] ? renderStudentCard(pair[1], true) : ''}
            </div>
            ${pageIndex < studentPairs.length - 1 ? '<div class="page-break"></div>' : ''}
          `).join('')}
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
      toast.success(`${selectedStudents.size}টি প্রবেশপত্র তৈরি হয়েছে!`);
    } catch (error) {
      console.error("Error generating selected students PDF:", error);
      toast.error("প্রবেশপত্র তৈরি করতে সমস্যা হয়েছে!");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle back print PDF generation
  const handleBackPrintPDF = async () => {
    if (!examStudents?.students?.length) {
      toast.error("প্রথমে ফ্রন্ট পেজের জন্য শিক্ষার্থী নির্বাচন করুন!");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const base64Background = await convertImageToBase64(backgroundImage);
      const students = examStudents.students;
      const pageCount = Math.ceil(students.length / 2); // 2 cards per page

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>প্রবেশপত্র - পেছনের অংশ</title>
          <meta charset="UTF-8">
          <style>
            @page { 
              size: A4 portrait; 
              margin: 0mm; 
                padding: 0;
            }
            body {
              font-family: 'Noto Sans Bengali', Arial, sans-serif;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .page-container {
              width: 100%;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
             padding: 5mm 0;
              box-sizing: border-box;
              gap: 6mm;
              box-sizing: border-box;
              
            }
            .admit-card-back {
              width: 200mm;
              height: 140mm;
              background: white;
              // border: 2px solid #DB9E30;
              margin: 0 auto;
              // border-radius: 4mm;
              overflow: hidden;
              position: relative;
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
          ${Array(pageCount).fill(0).map((_, pageIndex) => `
            <div class="page-container">
              <div class="admit-card-back"></div>
              <div class="admit-card-back"></div>
            </div>
            ${pageIndex < pageCount - 1 ? '<div class="page-break"></div>' : ""}
          `).join("")}
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
      toast.success("প্রবেশপত্রের পেছনের অংশ তৈরি হয়েছে!");
    } catch (error) {
      console.error("Error generating back print PDF:", error);
      toast.error("পেছনের অংশ তৈরি করতে সমস্যা হয়েছে!");
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
        className="admit-card relative border-2 border-[#DB9E30] rounded-lg w-[200mm] h-[140mm] overflow-hidden mx-auto mb-4"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Just the background image, no content */}
      </div>
    );
  };

  // Render single admit card for screen preview (updated larger size)
  const renderSingleCard = (student, index) => {
    const instituteInfo = institute || {};

    return (
      <div
        key={student.user_id}
        className="admit-card relative border-2 border-[#DB9E30] rounded-lg w-[200mm] h-[140mm] overflow-hidden mx-auto mb-4"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Institute Logo Watermark */}
        {instituteInfo.institute_logo && (
          <img 
            src={instituteInfo.institute_logo} 
            alt="Institute Logo"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-15 max-w-[120px] max-h-[120px] object-contain z-10"
          />
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20">
          {/* Institute Name */}
          <div 
            className="absolute top-[18mm] left-0 right-0 text-center text-[18pt] font-bold text-black"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
          >
            {instituteInfo.institute_name || "Institute Name"}
          </div>

          {/* Student Information */}
          <div 
            className="absolute top-[55mm] left-[20mm] text-[16pt] text-black"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
          >
            পরীক্ষার্থীর নাম : <span className="font-semibold">{student.student_name}</span>
          </div>

          <div 
            className="absolute top-[65mm] left-[20mm] text-[16pt] text-black"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
          >
            পিতার নাম : <span className="font-semibold">{student.father_name || "N/A"}</span>
          </div>

          <div 
            className="absolute top-[75mm] left-[20mm] text-[16pt] text-black"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
          >
            জন্য তারিখ : <span className="font-semibold">{student.date_of_birth || "N/A"}</span>
          </div>

          <div 
            className="absolute top-[85mm] left-[20mm] text-[16pt] text-black"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
          >
            জামাত : <span className="font-semibold">{student.class_name} - {student.section_name}</span>
          </div>

          {/* Admission Number Box - Horizontal Layout */}
          <div className="absolute top-[55mm] right-[20mm] border-2 border-black bg-white/95 flex flex-row">
            <div className="bg-yellow-200 px-5 py-2 text-center border-r border-black flex items-center justify-center">
              <span className="text-[14pt] font-semibold text-black">দাখেলা নং</span>
            </div>
            <div className="bg-white px-5 py-2 text-center flex items-center justify-center">
              <span className="text-[16pt] font-bold text-black">{student.user_id}</span>
            </div>
          </div>

          {/* Roll Number Box - Horizontal Layout */}
          <div className="absolute top-[75mm] right-[20mm] border-2 border-black bg-white/95 flex flex-row">
            <div className="bg-yellow-200 px-5 py-2 text-center border-r border-black flex items-center justify-center">
              <span className="text-[14pt] font-semibold text-black">রোল নং</span>
            </div>
            <div className="bg-white px-5 py-2 text-center flex items-center justify-center">
              <span className="text-[16pt] font-bold text-black">{student.roll_no || student.user_id}</span>
            </div>
          </div>

          {/* Signature Lines */}
          <div className="absolute bottom-[8mm] left-[20mm] text-center">
            <div className="border-t-2 border-black w-[70mm] mb-1.5"></div>
            <span 
              className="text-[12pt] text-black font-semibold"
              style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9)' }}
            >
              মুহতামিমের সিল ও স্বাক্ষর
            </span>
          </div>

          <div className="absolute bottom-[8mm] right-[20mm] text-center">
            <div className="border-t-2 border-black w-[70mm] mb-1.5"></div>
            <span 
              className="text-[12pt] text-black font-semibold"
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
            width: 210mm;
            margin: 5mm auto;
            display: flex;
            flex-direction: column;
            gap: 8mm;
            box-sizing: border-box;
            font-family: 'Noto Sans Bengali', sans-serif;
          }
          .admit-card {
            background: white;
            box-sizing: border-box;
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
        <div className="mt-6 flex flex-wrap gap-4 no-print">
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
            selectedClassConfig && selectedAcademicYear && selectedExam && examStudents?.students?.length > 0 && (
              <>
                <button
                  onClick={handleSelectedStudentsPrint}
                  disabled={isGeneratingPDF || selectedStudents.size === 0}
                  className="px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center space-x-2">
                    {isGeneratingPDF ? (
                      <FaSpinner className="w-5 h-5 spinner" />
                    ) : (
                      <IoPrint className="w-5 h-5" />
                    )}
                    <span>
                      {isGeneratingPDF ? "তৈরি হচ্ছে..." : `নির্বাচিত (${selectedStudents.size}টি) প্রিন্ট করুন`}
                    </span>
                  </span>
                </button>
              </>
            )
          )}
        </div>
      </div>

      {/* Student List with Search and Individual Controls */}
      {!isBackPrint && selectedClassConfig && selectedAcademicYear && selectedExam && examStudents?.students?.length > 0 && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-[#441a05] flex items-center gap-2">
              <FaUser className="text-[#441a05]" />
              শিক্ষার্থী তালিকা ({filteredStudents.length}জন)
            </h4>
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
            >
              {selectAll ? <IoCheckbox className="w-5 h-5" /> : <IoSquareOutline className="w-5 h-5" />}
              {selectAll ? 'সব বাতিল' : 'সব নির্বাচন'}
            </button>
          </div>

          {/* Search Box */}
          <div className="mb-4 relative">
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="নাম বা দাখেলা নম্বর দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredStudents.map((student) => (
              <div
                key={student.user_id}
                className={`p-4 border rounded-lg transition-all duration-300 ${
                  selectedStudents.has(student.user_id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-[#DB9E30]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => handleStudentSelection(student.user_id)}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    {selectedStudents.has(student.user_id) ? (
                      <IoCheckbox className="w-5 h-5 text-green-600" />
                    ) : (
                      <IoSquareOutline className="w-5 h-5 text-gray-400" />
                    )}
                    নির্বাচন
                  </button>
                  <button
                    onClick={() => handleSingleStudentPrint(student)}
                    disabled={isGeneratingPDF}
                    className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-all duration-300 disabled:opacity-50"
                  >
                    <FaDownload className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold">{student.student_name}</p>
                  <p className="text-xs">দাখেলা: {student.user_id}</p>
                  <p className="text-xs">রোল: {student.roll_no || student.user_id}</p>
                  <p className="text-xs">{student.class_name} - {student.section_name}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && searchTerm && (
            <div className="text-center text-gray-500 py-8">
              "{searchTerm}" এর জন্য কোনো শিক্ষার্থী পাওয়া যায়নি।
            </div>
          )}
        </div>
      )}

      {/* Preview Area */}
      <div ref={printRef} className="admit-card-container w-full max-w-[210mm] mx-auto">
        {isBackPrint ? (
          // Back print preview
          examStudents?.students?.length > 0 ? (
            <div className="flex flex-col items-center gap-8">
              <h4 className="text-lg font-bold text-[#441a05] mb-4">পেছনের অংশ প্রিভিউ</h4>
              {renderBackCard()}
              {renderBackCard()}
            </div>
          ) : (
            <div className="text-center text-[#441a05] p-8">
              প্রথমে ফ্রন্ট প্রিন্ট মোডে শিক্ষার্থী নির্বাচন করুন।
            </div>
          )
        ) : (
          // Front print preview
          selectedClassConfig && selectedAcademicYear && selectedExam ? (
            examStudents?.students?.length > 0 ? (
              <div className="flex flex-col items-center gap-8">
                <h4 className="text-lg font-bold text-[#441a05] mb-4">প্রিভিউ (২টি কার্ড প্রতি পৃষ্ঠায়)</h4>
                {examStudents.students.slice(0, 2).map((student, index) => (
                  renderSingleCard(student, index)
                ))}
                {examStudents.students.length > 2 && (
                  <p className="text-center text-[#441a05] mt-4">
                    আরো {examStudents.students.length - 2}টি কার্ড রয়েছে...
                  </p>
                )}
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