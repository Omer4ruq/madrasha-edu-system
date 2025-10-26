import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { useReactToPrint } from 'react-to-print';
import moment from 'moment';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';
import { IoPrint, IoDownload } from 'react-icons/io5';
import { toast } from 'react-toastify';
import selectStyles from '../../utilitis/selectStyles';

// Month options for selection (in Bangla)
const monthOptions = [
  { value: 0, label: 'জানুয়ারি' },
  { value: 1, label: 'ফেব্রুয়ারি' },
  { value: 2, label: 'মার্চ' },
  { value: 3, label: 'এপ্রিল' },
  { value: 4, label: 'মে' },
  { value: 5, label: 'জুন' },
  { value: 6, label: 'জুলাই' },
  { value: 7, label: 'আগস্ট' },
  { value: 8, label: 'সেপ্টেম্বর' },
  { value: 9, label: 'অক্টোবর' },
  { value: 10, label: 'নভেম্বর' },
  { value: 11, label: 'ডিসেম্বর' },
];

// Bangla day names (shortened)
const banglaDays = ['র', 'স', 'ম', 'বু', 'বৃ', 'শু', 'শ'];

const AttendanceSheet = () => {
  // State for selections
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Fetch data from APIs
  const { data: classConfigs, isLoading: classLoading } = useGetclassConfigApiQuery();
  const { data: academicYears, isLoading: yearLoading } = useGetAcademicYearApiQuery();
  const { data: students, isLoading: studentLoading } = useGetStudentActiveApiQuery();
  const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();

  // Refs for print
  const componentRef = useRef();

  // Handle print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: A4 landscape;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
        .print-table {
          width: 100%;
          font-size: 10pt;
        }
        .print-table th, .print-table td {
          border: 1px solid #000;
          padding: 4px;
        }
        .print-container {
          border-radius: 0 !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
      }
    `,
  });

  // Handle PDF download (HTML-based approach)
  const handleDownloadPDF = () => {
    if (instituteLoading) {
      toast.error('ইনস্টিটিউট তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন!');
      return;
    }

    if (!institute) {
      toast.error('ইনস্টিটিউট তথ্য পাওয়া যায়নি!');
      return;
    }

    if (!selectedClassConfig || !selectedAcademicYear || !selectedMonth) {
      toast.error('ক্লাস, শিক্ষাবর্ষ এবং মাস নির্বাচন করুন!');
      return;
    }

    const getDaysInMonth = () => {
      if (!selectedMonth || !selectedAcademicYear) return [];
      const year = academicYears?.find(y => y.id === selectedAcademicYear.value)?.name || moment().year();
      const daysInMonth = moment(`${year}-${selectedMonth.value + 1}`, 'YYYY-MM').daysInMonth();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const date = moment(`${year}-${selectedMonth.value + 1}-${i + 1}`, 'YYYY-MM-DD');
        return {
          day: i + 1,
          dayName: banglaDays[date.day()],
        };
      });
    };

    const filteredStudents = students?.filter(student =>
      selectedClassConfig?.value === student.class_id &&
      selectedAcademicYear?.value === student.admission_year_id
    ) || [];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>হাজিরা শীট</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            margin: 20px 15px;
            padding: 0;
            color: #000;
                      position: relative;

          }
                      .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
          opacity: 0.1;
          width: 500px;
          height: 500px;
          pointer-events: none;
          text-align: center;
        }
        .watermark img {
          width: 500px;
          height: 500px;
          display: block;
        }
        .watermark.fallback::before {
          content: 'লোগো লোড হয়নি';
          color: #666;
          font-size: 16px;
          font-style: italic;
        }
          .header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 5px;
          }
          .school-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .school-address {
            font-size: 10px;
            opacity: 0.7;
          }
          .title {
            font-size: 14px;
            font-weight: bold;
            margin: 10px;
          }
          .meta-container {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            font-size: 10px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .table th, .table td {
            border: 1px solid #000;
            padding: 5px;
            text-align: center;
          }
          .table th {
            font-weight: bold;
          }
          .roll-col { width: 5mm; text-wrap:nowrap; }
          .name-col { width: 50mm; text-wrap:nowrap; }
          .day-col { width: 10mm; text-wrap:nowrap; }
          .footer {
            position: absolute;
            bottom: 10px;
            left: 10px;
            right: 10px;
            text-align: center;
            font-size: 8px;
            color: #666;
          }
        </style>
      </head>
      <body>
      ${
        institute.institute_logo
          ? `
            <div class="watermark">
              <img id="watermark-logo" src="${institute.institute_logo}" alt="Institute Logo" />
            </div>
          `
          : `
            <div class="watermark fallback"></div>
          `
      }
        <div class="header">
          <div class="school-name">${institute.institute_name || 'আদর্শ মাদ্রাসা'}</div>
          <div class="school-address">${institute.institute_address || 'ঢাকা, বাংলাদেশ'}</div>
          <div class="title">হাজিরা শীট</div>
          <div class="meta-container">
            <span>শ্রেণি: ${selectedClassConfig.label || 'নির্বাচিত শ্রেণি'}</span>
            <span>শিক্ষাবর্ষ: ${academicYears?.find(y => y.id === selectedAcademicYear.value)?.name || 'নির্বাচিত বছর'}</span>
            <span>মাস: ${selectedMonth.label || 'নির্বাচিত মাস'}</span>
            <span>তারিখ: ${new Date().toLocaleDateString('bn')}</span>
          </div>
        </div>
        <div>
          <table class="table">
            <thead>
              <tr>
                <th class="roll-col">রোল</th>
                <th class="name-col">ছাত্র</th>
               ${getDaysInMonth()
        .map(({ day, dayName }) => `
    <th class="day-col">
      ${day <= 9 ? String(day).padStart(2, '0') : day}<br>${dayName}
    </th>
  `)
        .join('')}

              </tr>
            </thead>
            <tbody>
              ${filteredStudents.map(student => `
                <tr>
                  <td class="roll-col">${student.roll_no || 'N/A'}</td>
                  <td class="name-col">${student.name || 'N/A'}</td>
                  ${getDaysInMonth().map(({ day }) => `<td class="day-col"></td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
 <script>
        let printAttempted = false;
        window.onbeforeprint = () => { printAttempted = true; };
        window.onafterprint = () => { window.close(); };
        window.addEventListener('beforeunload', (event) => {
          if (!printAttempted) { window.close(); }
        });

        // Wait for the logo to load before printing
        const logo = document.getElementById('watermark-logo');
        if (logo) {
          logo.onload = () => {
            console.log('Logo loaded successfully');
            window.print();
          };
          logo.onerror = () => {
            console.warn('Logo failed to load, proceeding with print.');
            document.querySelector('.watermark').classList.add('fallback');
            window.print();
          };
        } else {
          window.print();
        }
      </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('হাজিরা শীট তৈরি হয়েছে! প্রিন্ট বা সেভ করুন।');
  };

  // Format class config options
const classConfigOptions = classConfigs?.map(config => ({
  value: config.id,
  label: `${config.class_name}${config.section_name ? ` - ${config.section_name}` : ''}${config.shift_name ? ` (${config.shift_name})` : ''}`,
})) || [];


  // Format academic year options
  const academicYearOptions = academicYears?.map(year => ({
    value: year.id,
    label: year.name,
  })) || [];

  // Get days in selected month with Bangla day names
  const getDaysInMonth = () => {
    if (!selectedMonth || !selectedAcademicYear) return [];
    const year = academicYears?.find(y => y.id === selectedAcademicYear.value)?.name || moment().year();
    const daysInMonth = moment(`${year}-${selectedMonth.value + 1}`, 'YYYY-MM').daysInMonth();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = moment(`${year}-${selectedMonth.value + 1}-${i + 1}`, 'YYYY-MM-DD');
      return {
        day: i + 1,
        dayName: banglaDays[date.day()],
      };
    });
  };

  // Filter students based on selections
  const filteredStudents = students?.filter(student =>
    selectedClassConfig?.value === student.class_id &&
    selectedAcademicYear?.value === student.admission_year_id
  ) || [];

  // Loading state
  if (classLoading || yearLoading || studentLoading || instituteLoading) {
    return (
      <div className="p-8 text-[#441a05]/70 animate-fadeIn">
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="py-8 w-full relative">
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
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
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
          .print-container {
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            padding: 32px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
          }
          .print-table th, .print-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
            color: #000;
          }
          .print-table th {
            font-weight: bold;
          }
          .print-table tr {
            background: transparent;
          }
        `}
      </style>

      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
          <IoPrint className="text-4xl text-[#441a05]" />
          <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">হাজিরা শীট</h3>
        </div>

        {/* Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          <div>
            <label className="block text-sm font-medium text-[#441a05] mb-1">ক্লাস কনফিগারেশন</label>
            <Select
              options={classConfigOptions}
              value={selectedClassConfig}
              onChange={setSelectedClassConfig}
              placeholder="ক্লাস নির্বাচন করুন..."
              isClearable
              menuPortalTarget={document.body}
              styles={selectStyles}
              className="animate-scaleIn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#441a05] mb-1">শিক্ষাবর্ষ</label>
            <Select
              options={academicYearOptions}
              value={selectedAcademicYear}
              menuPortalTarget={document.body}
              onChange={setSelectedAcademicYear}
              placeholder="বছর নির্বাচন করুন..."
              isClearable
              styles={selectStyles}
              className="animate-scaleIn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#441a05] mb-1">মাস</label>
            <Select
              options={monthOptions}
              value={selectedMonth}
              menuPortalTarget={document.body}
              onChange={setSelectedMonth}
              placeholder="মাস নির্বাচন করুন..."
              isClearable
              styles={selectStyles}
              className="animate-scaleIn"
            />
          </div>
        </div>

        {/* Print and Download Buttons */}
        {selectedClassConfig && selectedAcademicYear && selectedMonth && (
          <div className="mt-6 flex gap-4 no-print">
            <button
              onClick={handleDownloadPDF}
              className="px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
            >
              <span className="flex items-center space-x-2">
                <IoPrint className="w-5 h-5" />
                <span>হাজিরা শীট প্রিন্ট করুন</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Visible Printable Area */}
      <div ref={componentRef} className="print-container">
        {selectedClassConfig && selectedAcademicYear && selectedMonth && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#441a05]">
                {selectedClassConfig.label} এর জন্য হাজিরা শীট - {selectedMonth.label} {academicYears?.find(y => y.id === selectedAcademicYear.value)?.name}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="print-table min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-center text-xs font-medium text-[#000] uppercase tracking-wider border border-black">রোল</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-[#000] uppercase tracking-wider border border-black">ছাত্র</th>
                    {getDaysInMonth().map(({ day, dayName }) => (
                      <th key={day} className="px-2 py-2 text-center text-xs font-medium text-[#000] uppercase tracking-wider border border-black">
                        {day}<br />{dayName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-[#000] border border-black">{student.roll_no || ''}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-[#000] border border-black">{student.name}</td>
                      {getDaysInMonth().map(({ day }) => (
                        <td key={day} className="px-2 py-2 whitespace-nowrap text-sm text-[#000] text-center border border-black"></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceSheet;