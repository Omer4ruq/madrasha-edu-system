import React, { useState, useRef } from 'react';
import Select from 'react-select';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { IoPrint, IoDocumentText } from 'react-icons/io5';
import { FaSpinner } from 'react-icons/fa';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';
import selectStyles from '../../utilitis/selectStyles';
import { useGetClassExamStudentsQuery } from '../../redux/features/api/class-exam-students/classExamStudentApi ';

const AdmitCard = () => {
  // State for filter selections and PDF generation
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch data from APIs
  const { data: classConfigs, isLoading: classLoading, error: classError } = useGetclassConfigApiQuery();
  const { data: academicYears, isLoading: yearLoading, error: yearError } = useGetAcademicYearApiQuery();
  const { data: exams, isLoading: examLoading, error: examError } = useGetExamApiQuery();
  const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();
  const { 
    data: examStudents, 
    isLoading: studentsLoading, 
    isFetching: studentsFetching, 
    error: studentsError 
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
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = printRef.current;
      const cards = element.querySelectorAll('.admit-card');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = 190; // Card width
      const cardHeight = 90; // Card height
      const marginTop = 10; // Top margin
      const gap = 5; // Gap between cards

      for (let i = 0; i < cards.length; i += 3) {
        if (i > 0) pdf.addPage();
        // Process up to three cards per page
        for (let j = 0; j < 3 && i + j < cards.length; j++) {
          const canvas = await html2canvas(cards[i + j], {
            scale: 3,
            useCORS: true,
            backgroundColor: '#ffffff',
          });
          const imgData = canvas.toDataURL('image/png');
          const imgHeight = (canvas.height * width) / canvas.width;
          pdf.addImage(imgData, 'PNG', 10, marginTop + (imgHeight + gap) * j, width, imgHeight);
        }
      }

      pdf.save(`Admit_Cards_${selectedExam?.label || 'Exam'}_${selectedClassConfig?.label || 'Class'}.pdf`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Format select options
  const classConfigOptions = classConfigs?.map(config => ({
    value: config.id,
    label: `${config.class_name} - ${config.section_name} (${config.shift_name})`,
  })) || [];

  const academicYearOptions = academicYears?.map(year => ({
    value: year.id,
    label: year.name,
  })) || [];

  const examOptions = exams?.map(exam => ({
    value: exam.id,
    label: exam.name,
  })) || [];

  // Loading state
  if (classLoading || yearLoading || examLoading || instituteLoading || studentsLoading || studentsFetching) {
    return (
      <div className="p-8 text-[#441a05]/70 animate-fadeIn">
        লোড হচ্ছে...
      </div>
    );
  }

  // Error state
  if (classError || yearError || examError || instituteError || studentsError) {
    return (
      <div className="p-8 text-[#441a05]/70 animate-fadeIn">
        ডেটা লোড করতে ত্রুটি: {studentsError?.data?.message || classError?.data?.message || yearError?.data?.message || examError?.data?.message || instituteError?.data?.message || 'Unknown error'}
      </div>
    );
  }

  // Render single admit card
  const renderSingleCard = (student, index) => {
    const instituteInfo = institute || {};
    const examInfo = exams?.find(exam => exam.id === selectedExam?.value) || {};

    return (
      <div
        key={student.user_id}
        className="admit-card relative border border-[#DB9E30] rounded-lg w-[190mm] h-[90mm] overflow-hidden"
      >
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 w-[80mm] h-[50mm] left-[28%] top-[30%] bg-[url('https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg')] bg-contain bg-center bg-no-repeat opacity-10 z-0"
        ></div>

        {/* Header */}
        <div className="text-center flex justify-between items-center bg-[#DB9E30] rounded-t-lg py-1 px-4">
          <img
            src={instituteInfo.institute_logo || 'https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg'}
            alt="Institute Logo"
            className="w-8 h-8 object-contain"
          />
          <div>
            <h1 className="text-xs font-bold text-white uppercase">
              {instituteInfo.institute_name || 'Institute Name'}
            </h1>
            <p className="text-[9px] text-white">{instituteInfo.institute_address || 'Address'}</p>
            <p className="text-[9px] mt-0.5 text-white">
              <strong>পরীক্ষা:</strong> {examInfo.name || 'Exam Name'} |{' '}
              <strong>তারিখ:</strong> {examInfo.start_date || 'Date'}
            </p>
          </div>
          <img
            src={instituteInfo.institute_logo || 'https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg'}
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
              <strong>সেশন:</strong> {selectedAcademicYear?.label || 'N/A'}
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
            <strong>নির্দেশ:</strong> পরীক্ষার হলে এই প্রবেশপত্র অবশ্যই সঙ্গে আনতে হবে।
          </p>
          <p>
            <strong>নির্দেশ:</strong> পরীক্ষা শুরুর ১৫ মিনিট পূর্বে উপস্থিত থাকতে হবে।
          </p>
          <p>
            <strong>নির্দেশ:</strong> প্রয়োজনীয় সামগ্রী: বোর্ড, শার্পনার, রুলার, পেন্সিল, কলম, ইরেজার।
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
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">প্রবেশপত্র</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          <div>
            <label className="block text-sm font-medium text-[#441a05] mb-1">ক্লাস কনফিগারেশন</label>
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
            <label className="block text-sm font-medium text-[#441a05] mb-1">শিক্ষাবর্ষ</label>
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
            <label className="block text-sm font-medium text-[#441a05] mb-1">পরীক্ষা</label>
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
              onClick={handlePrint}
              className="px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
              aria-label="প্রবেশপত্র প্রিন্ট করুন"
              title="প্রবেশপত্র প্রিন্ট করুন / Print admit cards"
            >
              <span className="flex items-center space-x-2">
                <IoPrint className="w-5 h-5" />
                <span>প্রবেশপত্র প্রিন্ট করুন</span>
              </span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || !selectedClassConfig || !selectedAcademicYear || !selectedExam}
              className={`px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isGeneratingPDF || !selectedClassConfig || !selectedAcademicYear || !selectedExam
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:text-white btn-glow'
              }`}
              aria-label="পিডিএফ ডাউনলোড"
              title="পিডিএফ ডাউনলোড / Download PDF"
            >
              <span className="flex items-center space-x-2">
                {isGeneratingPDF ? (
                  <FaSpinner className="w-5 h-5 spinner" />
                ) : (
                  <IoDocumentText className="w-5 h-5" />
                )}
                <span>{isGeneratingPDF ? 'পিডিএফ তৈরি হচ্ছে...' : 'পিডিএফ ডাউনলোড'}</span>
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
                  {index % 3 === 2 && index < examStudents.students.length - 1 && (
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