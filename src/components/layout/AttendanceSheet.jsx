import React, { useState, useRef } from 'react';
import Select from 'react-select';
import { useReactToPrint } from 'react-to-print';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import moment from 'moment';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { IoPrint, IoDownload } from 'react-icons/io5';

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
const banglaDays = ['র', 'স', 'ম', 'ব', 'বৃ', 'শু', 'শ'];

// Register Noto Sans Bengali font from URL
try {
  Font.register({
    family: 'NotoSansBengali',
    src: 'https://fonts.gstatic.com/ea/notosansbengali/v3/NotoSansBengali-Regular.ttf',
  });
  console.log('Font registered successfully:', Font.getRegisteredFonts());
} catch (error) {
  console.error('Font registration failed:', error);
  Font.register({
    family: 'Helvetica',
    src: 'https://fonts.gstatic.com/s/helvetica/v13/Helvetica.ttf',
  });
  console.log('Falling back to Helvetica font.');
}

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: 'NotoSansBengali',
    fontSize: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  metaText: {
    fontSize: 10,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '50mm', // Adjusted for roll and name
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableColDayHeader: {
    width: '10mm', // Adjusted for days
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCol: {
    width: '50mm', // Adjusted for roll and name
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    textAlign: 'center',
  },
  tableColDay: {
    width: '10mm', // Adjusted for days
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    textAlign: 'center',
    fontSize: 8,
  },
});

// PDF Document Component
const PDFDocument = ({ filteredStudents, getDaysInMonth, selectedClassConfig, selectedAcademicYear, academicYears, selectedMonth }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>আদর্শ বিদ্যালয়, ঢাকা</Text>
        <Text style={styles.title}>হাজিরা শীট</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            শ্রেণি: {selectedClassConfig?.label || 'নির্বাচিত শ্রেণি'}
          </Text>
          <Text style={styles.metaText}>
            শিক্ষাবর্ষ: {selectedAcademicYear && academicYears?.find(y => y.id === selectedAcademicYear.value)?.name || 'নির্বাচিত বছর'}
          </Text>
          <Text style={styles.metaText}>
            মাস: {selectedMonth?.label || 'নির্বাচিত মাস'}
          </Text>
          <Text style={styles.metaText}>তারিখ: ২৯ জুন ২০২৫, বিকাল ৪:০৮ PM</Text>
        </View>
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>রোল</Text>
          <Text style={styles.tableColHeader}>ছাত্র</Text>
          {getDaysInMonth().map(({ day, dayName }) => (
            <Text key={day} style={styles.tableColDayHeader}>{day}<br />{dayName}</Text>
          ))}
        </View>
        {filteredStudents.map((student, index) => (
          <View key={student.id} style={styles.tableRow}>
            <Text style={styles.tableCol}>{student.roll_no || 'N/A'}</Text>
            <Text style={styles.tableCol}>{student.name || 'N/A'}</Text>
            {getDaysInMonth().map(({ day }) => (
              <Text key={day} style={styles.tableColDay}></Text> // Placeholder for attendance
            ))}
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <Text>প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</Text>
      </View>
    </Page>
  </Document>
);

const AttendanceSheet = () => {
  // State for selections
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Fetch data from APIs
  const { data: classConfigs, isLoading: classLoading } = useGetclassConfigApiQuery();
  const { data: academicYears, isLoading: yearLoading } = useGetAcademicYearApiQuery();
  const { data: students, isLoading: studentLoading } = useGetStudentActiveApiQuery();

  // Refs for print and PDF
  const componentRef = useRef();
  const pdfRef = useRef();

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
          border: 1px solid #9d9087;
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

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!selectedClassConfig || !selectedAcademicYear || !selectedMonth) {
      toast.error('ক্লাস, শিক্ষাবর্ষ এবং মাস নির্বাচন করুন!');
      return;
    }
    try {
      const doc = <PDFDocument 
        filteredStudents={filteredStudents} 
        getDaysInMonth={getDaysInMonth} 
        selectedClassConfig={selectedClassConfig} 
        selectedAcademicYear={selectedAcademicYear} 
        academicYears={academicYears} 
        selectedMonth={selectedMonth} 
      />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `হাজিরা_শীট_${selectedClassConfig.label}_${selectedMonth.label}_${academicYears?.find(y => y.id === selectedAcademicYear.value)?.name}_${moment().format('DD_MMMM_YYYY_hh_mm_A')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`PDF তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
  };

  // Format class config options
  const classConfigOptions = classConfigs?.map(config => ({
    value: config.id,
    label: `${config.class_name} - ${config.section_name} (${config.shift_name})`,
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

  // Custom styles for React Select
  const selectStyles = {
   control: (base) => ({
      ...base,
      background: 'transparent',
      borderColor: '#9d9087',
      borderRadius: '8px',
      paddingLeft: '0.75rem',
      padding:'3px',
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': { borderColor: '#441a05' },
      '&:focus': { outline: 'none', boxShadow: 'none' },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#441a05',
      opacity: 0.7,
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      zIndex: 9999,
      marginTop: '4px',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
      backgroundColor: isSelected ? '#DB9E30' : isFocused ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
      cursor: 'pointer',
      '&:active': { backgroundColor: '#DB9E30' },
    }),
  };

  // Loading state
  if (classLoading || yearLoading || studentLoading) {
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
          .pdf-hidden {
            position: absolute;
            left: -9999px;
            top: 0;
            width: 277mm;
            background: white;
            overflow: visible;
            font-size: 8pt;
          }
          .pdf-hidden table {
            table-layout: fixed;
            width: 100%;
          }
          .pdf-hidden th, .pdf-hidden td {
            word-wrap: break-word;
            overflow: hidden;
          }
          .pdf-hidden .roll-col {
            width: 30mm;
          }
          .pdf-hidden .name-col {
            width: 60mm;
          }
          .pdf-hidden .day-col {
            width: 5mm;
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
            {/* <button
              onClick={handlePrint}
              className="px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
            >
              <span className="flex items-center space-x-2">
                <IoPrint className="w-5 h-5" />
                <span>হাজিরা শীট প্রিন্ট করুন</span>
              </span>
            </button> */}
            <button
              onClick={handleDownloadPDF}
              className="px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
            >
              <span className="flex items-center space-x-2">
                <IoDownload className="w-5 h-5" />
                <span>পিডিএফ ডাউনলোড করুন</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Visible Printable Area */}
      <div ref={componentRef} className="bg-black/10 backdrop-blur-sm border border-white/20 mb-8 animate-fadeIn p-8 rounded-2xl shadow-xl print-container">
        {selectedClassConfig && selectedAcademicYear && selectedMonth && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#441a05]">
                {selectedClassConfig.label} এর জন্য হাজিরা শীট - {selectedMonth.label} {academicYears?.find(y => y.id === selectedAcademicYear.value)?.name}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20 print-table">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider border border-black">রোল</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider border border-black">ছাত্র</th>
                    {getDaysInMonth().map(({ day, dayName }) => (
                      <th key={day} className="border-black px-2 py-2 text-center text-xs font-medium text-[#441a05]/70 uppercase tracking-wider border">
                        {day}<br />{dayName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id} className="bg-white/5 animate-fadeIn border border-black" style={{ animationDelay: `${index * 0.1}s` }}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-[#441a05] border border-black">{student.roll_no || ''}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-[#441a05] border border-black">{student.name}</td>
                      {getDaysInMonth().map(({ day }) => (
                        <td key={day} className="px-2 py-2 whitespace-nowrap text-sm text-[#441a05] text-center border w-10 border-black"></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Hidden PDF Rendering Area */}
      <div ref={pdfRef} className="pdf-hidden">
        {selectedClassConfig && selectedAcademicYear && selectedMonth && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#441a05]">
                {selectedClassConfig.label} এর জন্য হাজিরা শীট - {selectedMonth.label} {academicYears?.find(y => y.id === selectedAcademicYear.value)?.name}
              </h2>
            </div>

            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-black uppercase tracking-wider border roll-col">রোল</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-black uppercase tracking-wider border name-col">ছাত্র</th>
                  {getDaysInMonth().map(({ day, dayName }) => (
                    <th key={day} className="px-1 py-1 text-center text-xs font-medium text-black uppercase tracking-wider border day-col">
                      {day}<br />{dayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="bg-white/5 border">
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-black border roll-col">{student.roll_no || ''}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-black border name-col">{student.name}</td>
                    {getDaysInMonth().map(({ day }) => (
                      <td key={day} className="px-1 py-1 whitespace-nowrap text-xs text-black text-center border day-col"></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceSheet;