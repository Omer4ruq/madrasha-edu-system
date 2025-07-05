import React, { useState, useRef } from 'react';
import { FaPrint, FaFilePdf, FaSpinner } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetClassSubjectsByClassIdQuery } from '../../redux/features/api/class-subjects/classSubjectsApi';

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
    fontSize: 12,
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
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCol: {
    width: '20%',
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
const PDFDocument = ({ students, activeSubjects, selectedClassId, activeClasses, selectedExamId, exams }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>আদর্শ বিদ্যালয়, ঢাকা</Text>
        <Text style={styles.title}>স্বাক্ষর শীট</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            শ্রেণি: {selectedClassId && activeClasses.find(cls => cls.id === parseInt(selectedClassId))?.class_name || 'নির্বাচিত শ্রেণি'} {selectedClassId && activeClasses.find(cls => cls.id === parseInt(selectedClassId))?.section_name || ''}
          </Text>
          <Text style={styles.metaText}>
            পরীক্ষা: {selectedExamId && exams.find(exam => exam.id === parseInt(selectedExamId))?.name || 'নির্বাচিত পরীক্ষা'}
          </Text>
          <Text style={styles.metaText}>তারিখ: ২৯ জুন ২০২৫, বিকাল ৪:০৪ PM</Text>
        </View>
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>শিক্ষার্থীর নাম</Text>
          <Text style={styles.tableColHeader}>রোল</Text>
          {activeSubjects.map((subject) => (
            <Text key={subject.id} style={styles.tableColHeader}></Text>
          ))}
        </View>
        {students.map((student, index) => (
          <View key={student.id} style={styles.tableRow}>
            <Text style={styles.tableCol}>{student.name || 'N/A'}</Text>
            <Text style={styles.tableCol}>{student.roll_no || 'N/A'}</Text>
            {activeSubjects.map((subject) => (
              <Text key={subject.id} style={styles.tableCol}></Text> // Placeholder for signature
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

const SignatureSheet = () => {
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const tableRef = useRef();

  // Fetch class configurations
  const { data: classes = [], isLoading: isClassesLoading, error: classesError } = useGetclassConfigApiQuery();
  
  // Fetch exams
  const { data: exams = [], isLoading: isExamsLoading, error: examsError } = useGetExamApiQuery();
  
  // Fetch active students for selected class
  const {
    data: students = [],
    isLoading: isStudentsLoading,
    error: studentsError,
  } = useGetStudentActiveByClassQuery(selectedClassId, { skip: !selectedClassId });

  // Get class_id for subject query
  const getClassId = classes?.find((classConfig) => classConfig?.id === parseInt(selectedClassId));

  // Fetch subjects for selected class
  const {
    data: subjects = [],
    isLoading: isSubjectsLoading,
    error: subjectsError,
  } = useGetClassSubjectsByClassIdQuery(getClassId?.class_id, { skip: !selectedClassId });

  // Filter active classes
  const activeClasses = classes.filter((cls) => cls.is_active);

  // Extract active subjects
  const activeSubjects = subjects.filter((subject) => subject.is_active) || [];

  // Get current date and time in Bangladesh format
  const currentDateTime = new Date().toLocaleString('bn-BD', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: `Signature_Sheet_${selectedClassId}_${selectedExamId}`,
    onBeforePrint: () => toast.success('প্রিন্টিং শুরু হচ্ছে...'),
    onAfterPrint: () => toast.success('প্রিন্টিং সম্পন্ন!'),
  });

  // Generate and download PDF report
  const handleGeneratePDF = async () => {
    if (!selectedClassId || !selectedExamId) {
      toast.error('শ্রেণি এবং পরীক্ষা নির্বাচন করুন।');
      return;
    }
    try {
      const doc = <PDFDocument students={students} activeSubjects={activeSubjects} selectedClassId={selectedClassId} activeClasses={activeClasses} selectedExamId={selectedExamId} exams={exams} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Signature_Sheet_${selectedClassId}_${exams.find((exam) => exam.id === parseInt(selectedExamId))?.name || 'unknown'}_${currentDateTime.replace(/[/,: ]/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`PDF তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
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
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            .print-container {
              margin: 0;
              padding: 0;
              width: 100%;
              text-align: center;
              font-family: Arial, sans-serif;
            }
            .print-header {
              margin-bottom: 15px;
              font-size: 14px;
              color: #441a05;
            }
            .print-header h1 {
              font-size: 18px;
              margin: 5px 0;
            }
            .print-header p {
              margin: 2px 0;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              margin: 0 auto;
            }
            .print-table th, .print-table td {
              border: 1px solid #441a05;
              padding: 6px;
              text-align: center;
            }
            .print-table th {
              background-color: #f5f5f5;
              color: #441a05;
            }
            .print-table tbody tr:nth-child(even) {
              background-color: #fafafa;
            }
            .print-only {
              display: table-cell;
            }
            .no-print {
              display: none;
            }
          }
          .print-only {
            display: none;
          }
        `}
      </style>

      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight mb-6 animate-fadeIn">
          স্বাক্ষর শীট তৈরি করুন
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          <select
            value={selectedClassId || ''}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
            aria-label="ক্লাস নির্বাচন"
            title="ক্লাস নির্বাচন করুন"
          >
            <option value="">ক্লাস নির্বাচন করুন</option>
            {activeClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {`${cls.class_name} ${cls.section_name} ${cls.shift_name}`}
              </option>
            ))}
          </select>
          <select
            value={selectedExamId || ''}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
            aria-label="পরীক্ষা নির্বাচন"
            title="পরীক্ষা নির্বাচন করুন"
          >
            <option value="">পরীক্ষা নির্বাচন করুন</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
          <div className="flex space-x-4">
            {/* <button
              onClick={handlePrint}
              disabled={!selectedClassId || !selectedExamId || isStudentsLoading || isSubjectsLoading}
              className={`flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                !selectedClassId || !selectedExamId || isStudentsLoading || isSubjectsLoading
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:text-white btn-glow'
              }`}
              title="প্রিন্ট করুন"
            >
              <FaPrint className="mr-2" /> প্রিন্ট
            </button> */}
            <button
              onClick={handleGeneratePDF}
              disabled={!selectedClassId || !selectedExamId || isStudentsLoading || isSubjectsLoading}
              className={`flex w-full items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                !selectedClassId || !selectedExamId || isStudentsLoading || isSubjectsLoading
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:text-white btn-glow'
              }`}
              title="PDF ডাউনলোড করুন"
            >
              <FaFilePdf className="mr-2" /> PDF
            </button>
          </div>
        </div>
        {(classesError || examsError || studentsError || subjectsError) && (
          <div
            className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
            style={{ animationDelay: '0.4s' }}
          >
            ত্রুটি: {classesError?.status || examsError?.status || studentsError?.status || subjectsError?.status || 'অজানা'} -{' '}
            {JSON.stringify(classesError?.data || examsError?.data || studentsError?.data || subjectsError?.data || {})}
          </div>
        )}
      </div>

      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <div ref={tableRef} className="print-container">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20 no-print">
            স্বাক্ষর শীট {selectedClassId && selectedExamId && `- ক্লাস: ${activeClasses.find(cls => cls.id === parseInt(selectedClassId))?.class_name} ${activeClasses.find(cls => cls.id === parseInt(selectedClassId))?.section_name}, পরীক্ষা: ${exams.find(exam => exam.id === parseInt(selectedExamId))?.name}`}
          </h3>
          {(isClassesLoading || isExamsLoading || isStudentsLoading || isSubjectsLoading) && (
            <p className="p-4 text-black flex items-center">
              <FaSpinner className="animate-spin mr-2" /> ডেটা লোড হচ্ছে...
            </p>
          )}
          {!selectedClassId || !selectedExamId ? (
            <p className="p-4 text-black">অনুগ্রহ করে ক্লাস এবং পরীক্ষা নির্বাচন করুন।</p>
          ) : students.length === 0 ? (
            <p className="p-4 text-black">এই ক্লাসে কোনো সক্রিয় ছাত্র নেই।</p>
          ) : activeSubjects.length === 0 ? (
            <p className="p-4 text-black">এই ক্লাসে কোনো সক্রিয় বিষয় নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20 print-table">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border border-black">
                      শিক্ষার্থীর নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border border-black">
                      রোল
                    </th>
                    {activeSubjects.map((subject) => (
                      <th
                        key={subject.id}
                        className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider no-print border border-black"
                      >
                        {subject.name}
                      </th>
                    ))}
                    {activeSubjects.map((subject) => (
                      <th
                        key={subject.id}
                        className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider print-only"
                      >
                        {/* Empty header for print/PDF */}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className="bg-white/5 animate-fadeIn border"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black border border-black">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black border border-black">
                        {student.roll_no || ''}
                      </td>
                      {activeSubjects.map((subject) => (
                        <td
                          key={subject.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-black border border-black"
                        >
                          {/* Placeholder for signature or mark */}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignatureSheet;