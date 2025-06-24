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
import { useGetClassExamStudentsQuery } from '../../redux/features/api/class-exam-students/classExamStudentApi ';


// Custom styles for React Select
const selectStyles = {
  control: (provided) => ({
    ...provided,
    background: 'transparent',
    borderColor: '#9d9087',
    color: '#441a05',
    padding: '2px',
    borderRadius: '0.5rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#441a05',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#441a05',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#441a05',
    opacity: 0.7,
  }),
  menu: (provided) => ({
    ...provided,
    background: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.5rem',
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected ? '#DB9E30' : 'transparent',
    color: '#441a05',
    '&:hover': {
      background: 'rgba(219, 158, 48, 0.2)',
    },
  }),
};

const AdmitCard = () => {
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
        .admit-card {
          width: 190mm;
          height: 120mm; /* Adjusted for two cards per A4 */
          margin-bottom: 10mm;
          box-sizing: border-box;
          background: white;
        }
        .admit-card:last-child {
          margin-bottom: 0;
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
    const element = printRef.current;
    const cards = element.querySelectorAll('.admit-card');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = 190; // Card width
    const cardHeight = 135; // Card height
    const margin = 10; // Margin between cards

    for (let i = 0; i < cards.length; i += 2) {
      if (i > 0) pdf.addPage();
      // First card on the page
      const canvas1 = await html2canvas(cards[i], {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData1 = canvas1.toDataURL('image/png');
      const imgHeight1 = (canvas1.height * width) / canvas1.width;
      pdf.addImage(imgData1, 'PNG', 10, 10, width, imgHeight1);

      // Second card on the same page, if exists
      if (i + 1 < cards.length) {
        const canvas2 = await html2canvas(cards[i + 1], {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        const imgData2 = canvas2.toDataURL('image/png');
        const imgHeight2 = (canvas2.height * width) / canvas2.width;
        pdf.addImage(imgData2, 'PNG', 10, 10 + imgHeight1 + margin, width, imgHeight2);
      }
    }

    pdf.save(`Admit_Cards_${selectedExam?.label || 'Exam'}_${selectedClassConfig?.label || 'Class'}.pdf`);
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
        className="admit-card relative border border-[#DB9E30] rounded-lg w-[190mm] max-h-[100mm] mx-auto overflow-hidden"
      >
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 w-[80mm] h-[80mm] left-[28%] top-[20%] bg-[url('https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg')] bg-contain bg-center bg-no-repeat opacity-10 z-0"
        ></div>

        {/* Header */}
        <div className="text-center flex justify-between items-center bg-[#DB9E30] rounded-t-lg py-1 px-4">
          <img
            src={instituteInfo.institute_logo || 'https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg'}
            alt="Institute Logo"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-sm font-bold text-white uppercase">
              {instituteInfo.institute_name || 'Institute Name'}
            </h1>
            <p className="text-[10px] text-white">{instituteInfo.institute_address || 'Address'}</p>
            <p className="text-[10px] mt-0.5 text-white">
              <strong>পরীক্ষা:</strong> {examInfo.name || 'Exam Name'} |{' '}
              <strong>তারিখ:</strong> {examInfo.start_date || 'Date'}
            </p>
          </div>
          <img
            src={instituteInfo.institute_logo || 'https://static.vecteezy.com/system/resources/previews/046/006/104/non_2x/education-logo-design-template-vector.jpg'}
            alt="Institute Logo"
            className="w-10 h-10 object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-base text-center font-extrabold text-[#DB9E30] mt-2 underline">
          প্রবেশপত্র
        </h2>

        {/* Student Info */}
        <div className="text-xs mt-2 text-[#441a05] p-3 flex justify-around items-center">
          <div className="w-fit space-y-1">
            <p className="text-sm">
              <strong>নাম:</strong> {student.student_name}
            </p>
            <p className="text-sm">
              <strong>শ্রেণি:</strong> {student.class_name}
            </p>
            <p className="text-sm">
              <strong>সেকশন:</strong> {student.section_name}
            </p>
            <p className="text-sm">
              <strong>সেশন:</strong> {selectedAcademicYear?.label || 'N/A'}
            </p>
          </div>
          <div className="border p-2 px-4 rounded-lg bg-[#DB9E30] translate-x-1">
            <p className="mb-1 text-sm text-white">
              <strong>রোল:</strong> {student.roll_no || student.user_id}
            </p>
            <p className="text-sm text-white">
              <strong>রেজি:</strong> {student.user_id}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-2 text-xs text-[#440d05] w-[70%] p-3">
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
        <div className="flex justify-end mt-[-30px] mb-3 mr-4">
          <div className="text-center">
            <div className="border-t border-[#441a05] w-24 mx-auto"></div>
            <p className="text-[10px] text-[#441a05] mt-1 font-semibold">
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
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
          }
          .admit-card {
            width: 190mm;
            height: 135mm; /* Two cards per A4 page */
            margin: 5mm auto;
            background: white;
            box-sizing: border-box;
            font-family: 'Noto Sans Bengali', sans-serif;
          }
          @media print {
            .admit-card {
              margin: 5mm 10mm;
            }
          }
          @media screen {
            .admit-card {
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
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
              className="animate-scaleIn"
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
              className="animate-scaleIn"
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
              className="animate-scaleIn"
            />
          </div>
        </div>

        {/* Print and PDF Buttons */}
        {selectedClassConfig && selectedAcademicYear && selectedExam && (
          <div className="mt-6 flex space-x-4 no-print">
            <button
              onClick={handlePrint}
              className="px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
            >
              <span className="flex items-center space-x-2">
                <IoPrint className="w-5 h-5" />
                <span>প্রবেশপত্র প্রিন্ট করুন</span>
              </span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
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
            <div className="flex flex-col items-center justify-center gap-0">
              {examStudents.students.map((student, index) => (
                <React.Fragment key={student.user_id}>
                  {renderSingleCard(student, index)}
                  {index % 2 === 1 && index < examStudents.students.length - 1 && (
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