import React, { useState, useRef } from 'react';
import Select from 'react-select';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { IoPrint, IoDocumentText } from 'react-icons/io5';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';

import selectStyles from '../../utilitis/selectStyles';
import { useGetClassExamStudentsQuery } from '../../redux/features/api/class-exam-students/classExamStudentApi ';

const SeatPlan = () => {
  // State for filter selections
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

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
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        .seat-plan-container {
          width: 190mm;
          margin: 0;
          padding: 5mm;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5mm;
        }
        .seat-card {
          width: 90mm;
          height: 50mm;
          page-break-inside: avoid;
          background: white;
          border: 1px solid #DB9E30;
          border-radius: 4mm;
          overflow: hidden;
          font-size: 8pt;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  // Handle PDF download
  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = 190;
    const imgHeight = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, width, imgHeight);
    pdf.save(`Seat_Plan_${selectedExam?.label || 'Exam'}_${selectedClassConfig?.label || 'Class'}.pdf`);
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
      <div className="p-1 text-[#441a05]/70 animate-fadeIn">
        ডেটা লোড করতে হলো না: {studentsError?.data?.message || classError?.data?.message || yearError?.data?.message || examError?.data?.message || instituteError?.data?.message || 'Unknown error'}
      </div>
    );
  }

  // Render single seat card
  const renderSeatCard = (student) => {
    const instituteInfo = institute || {};
    const examInfo = exams?.find(exam => exam.id === selectedExam?.value) || {};

    return (
      <div className="seat-card relative w-[90mm] h-[50mm] bg-white border border-[#DB9E30] rounded-[4mm] overflow-hidden">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 w-[40mm] h-[40mm] left-[27%] top-[25%] bg-[url('https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg')] bg-contain bg-center bg-no-repeat opacity-10 z-0"
        ></div>

        {/* Header */}
        <div className="flex justify-between items-center bg-[#DB9E30] py-1 px-2">
          <img
            src={instituteInfo.institute_logo || 'https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg'}
            alt="Institute Logo"
            className="w-6 h-6 object-contain"
          />
          <div className="text-center">
            <h1 className="text-[8pt] font-bold text-white uppercase">
              {instituteInfo.institute_name || 'Rajuk Uttara Model College'}
            </h1>
            <p className="text-[6pt] text-white">{instituteInfo.institute_address || 'Sector#6, Uttara Model Town, Dhaka'}</p>
          </div>
          <img
            src={instituteInfo.institute_logo || 'https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg'}
            alt="Institute Logo"
            className="w-6 h-6 object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-[10pt] text-center font-extrabold text-[#DB9E30] mt-1 underline">
          আসন বিন্যাস
        </h2>

        {/* Student Info */}
        <div className="text-[8pt] text-[#441a05] px-2 py-1 flex justify-between">
          <div className="space-y-0.5">
            <p><strong>নাম:</strong> {student.student_name}</p>
            <p><strong>শ্রেণি:</strong> {student.class_name}</p>
            <p><strong>সেকশন:</strong> {student.section_name}</p>
          </div>
          <div className="space-y-0.5 text-right">
            <p><strong>আইডি:</strong> {student.user_id}</p>
            <p><strong>রোল:</strong> {student.roll_no || student.user_id}</p>
            <p><strong>পরীক্ষা:</strong> {examInfo.name || '1st Term Exam'}</p>
          </div>
        </div>

        {/* Exam Date */}
        <p className="text-[7pt] text-[#441a05] text-center mt-[-10px]">
          <strong>তারিখ:</strong> {examInfo.start_date || '2025'}
        </p>
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
            from { transform: scale(0.95); }
            to { transform: scale(1); opacity: 1; }
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
          }
          .seat-plan-container {
            width: 190mm;
            margin: 10mm auto;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 5mm;
            box-sizing: border-box;
            font-family: 'Noto Sans Bengali', sans-serif;
          }
          .seat-card {
            width: 90mm;
            height: 50mm;
            page-break-inside: avoid;
            background: white;
            border: 1px solid #DB9E30;
            border-radius: 4mm;
            overflow: hidden;
            font-size: 8pt;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          @media print {
            .seat-plan-container {
              margin: 0;
              padding: 5mm;
            }
            .seat-card {
              box-shadow: none;
            }
          }
        `}
      </style>

      {/* Filter Controls */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
          <IoPrint className="text-4xl text-[#441a05]"/>
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">পরীক্ষার আসন বিন্যাস</h3>
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
              aria-label="আসন বিন্যাস প্রিন্ট করুন"
              title="আসন বিন্যাস প্রিন্ট করুন / Print seat plan"
            >
              <span className="flex items-center space-x-2">
                <IoPrint className="w-5 h-5" />
                <span>আসন বিন্যাস প্রিন্ট করুন</span>
              </span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
              aria-label="পিডিএফ ডাউনলোড"
              title="পিডিএফ ডাউনলোড / Download PDF"
            >
              <span className="flex items-center space-x-2">
                <IoDocumentText className="w-5 h-5" />
                <span>পিডিএফ ডাউনলোড</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Printable/PDF Area */}
      <div ref={printRef} className="w-[210mm] mx-auto">
        {selectedClassConfig && selectedAcademicYear && selectedExam ? (
          examStudents?.students?.length > 0 ? (
            <div className="seat-plan-container">
              {examStudents.students.map((student) => renderSeatCard(student))}
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

export default SeatPlan;