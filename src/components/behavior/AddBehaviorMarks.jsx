import React, { useState, useEffect, useRef } from 'react';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetBehaviorTypeApiQuery } from '../../redux/features/api/behavior/behaviorTypeApi';
import { useCreateBehaviorReportApiMutation, useGetBehaviorReportApiQuery } from '../../redux/features/api/behavior/behaviorReportApi';
import { FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';

// Register Noto Sans Bengali font
try {
  Font.register({
    family: 'NotoSansBengali',
    src: 'https://fonts.gstatic.com/ea/notosansbengali/v3/NotoSansBengali-Regular.ttf',
  });
} catch (error) {
  console.error('Font registration failed:', error);
  Font.register({
    family: 'Helvetica',
    src: 'https://fonts.gstatic.com/s/helvetica/v13/Helvetica.ttf',
  });
}

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'NotoSansBengali',
    fontSize: 10,
    color: '#222',
  },
  header: {
    textAlign: 'center',
    marginBottom: 15,
  },
  schoolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#441a05',
  },
  headerText: {
    fontSize: 10,
    marginTop: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 10,
    color: '#441a05',
    textDecoration: 'underline',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    marginBottom: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#441a05',
    marginVertical: 6,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#441a05',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#441a05',
  },
  tableHeader: {
    backgroundColor: '#441a05',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#fff',
  },
  tableCell: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    flex: 1,
    textAlign: 'left',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableRowAlternate: {
    backgroundColor: '#f2f2f2',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#555',
  },
});

// PDF Document Component
const PDFDocument = ({ students, behaviorTypes, behaviorReports, localBehaviorReports, selectedExam, exams, selectedClass, classes }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>আদর্শ বিদ্যালয়</Text>
        <Text style={styles.headerText}>ঢাকা, বাংলাদেশ</Text>
        <Text style={styles.title}>আচরণ প্রতিবেদন</Text>
        <View style={styles.metaContainer}>
          <View>
            <Text style={styles.metaText}>
              শ্রেণি: {classes.find(cls => cls.id === parseInt(selectedClass))?.class_name || 'নির্বাচিত শ্রেণি'}
            </Text>
            <Text style={styles.metaText}>
              পরীক্ষা: {exams.find(exam => exam.id === parseInt(selectedExam))?.name || 'নির্বাচিত পরীক্ষা'}
            </Text>
          </View>
          <Text style={styles.metaText}>
            তারিখ: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
          </Text>
        </View>
        <View style={styles.divider} />
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { flex: 1.5 }]}>ছাত্রের নাম</Text>
          <Text style={[styles.tableHeader, { flex: 0.8 }]}>রোল নম্বর</Text>
          {behaviorTypes.map(behavior => (
            <Text key={behavior.id} style={[styles.tableHeader, { flex: 0.8 }]}>
              {behavior.name} ({behavior.obtain_mark})
            </Text>
          ))}
        </View>
        {students.map((student, index) => (
          <View key={student.id} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlternate]}>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{student.name || 'N/A'}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 0.8 }]}>{student.roll_no || 'N/A'}</Text>
            {behaviorTypes.map(behavior => {
              // Try to get mark from behaviorReports (API data)
              const report = behaviorReports.find(
                r => r.exam_name_id === parseInt(selectedExam) && r.student_id === student.id
              );
              let mark = report?.behavior_marks.find(bm => bm.behavior_type === behavior.id)?.mark?.toString();
              // Fallback to localBehaviorReports if no mark found in API data
              if (!mark && localBehaviorReports[student.id]?.[behavior.id]) {
                const localMark = parseFloat(localBehaviorReports[student.id][behavior.id]);
                if (!isNaN(localMark) && localMark >= 0 && localMark <= behavior.obtain_mark) {
                  mark = localMark.toString();
                }
              }
              // Default to '0' if no valid mark is found
              mark = mark || '0';
              return (
                <Text key={behavior.id} style={[styles.tableCell, styles.tableCellCenter, { flex: 0.8 }]}>
                  {mark}
                </Text>
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.footer} fixed>
        <Text>প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</Text>
        <Text render={({ pageNumber, totalPages }) => `পৃষ্ঠা ${pageNumber} এর ${totalPages}`} />
      </View>
    </Page>
  </Document>
);

const AddBehaviorMarks = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isExamLocked, setIsExamLocked] = useState(false);
  const [behaviorReports, setBehaviorReports] = useState({});
  const [invalidMarks, setInvalidMarks] = useState({});
  const [savedMarks, setSavedMarks] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const inputRefs = useRef({});

  // Fetch data
  const { data: academicYears = [], isLoading: isYearsLoading, error: yearError } = useGetAcademicYearApiQuery();
  const { data: classes, isLoading: classesLoading, error: classError } = useGetclassConfigApiQuery();
  const { data: exams, isLoading: examsLoading, error: examError } = useGetExamApiQuery();
  const { data: students, isLoading: studentsLoading, error: studentError } = useGetStudentActiveByClassQuery(selectedClass, { skip: !selectedClass });
  const { data: behaviorTypes, isLoading: behaviorTypesLoading, error: behaviorTypeError } = useGetBehaviorTypeApiQuery();
  const { data: existingReports, isLoading: reportsLoading, error: reportError, refetch } = useGetBehaviorReportApiQuery({}, { skip: !selectedClass || !selectedExam });
  const [createBehaviorReport] = useCreateBehaviorReportApiMutation();

  const activeBehaviorTypes = behaviorTypes?.filter(bt => bt.is_active) || [];

  // Initialize behavior reports
  useEffect(() => {
    if (students && activeBehaviorTypes.length > 0 && selectedClass && selectedExam) {
      const initialReports = {};
      const initialSavedMarks = {};
      students.forEach(student => {
        initialReports[student.id] = {};
        initialSavedMarks[student.id] = {};
        activeBehaviorTypes.forEach(bt => {
          initialReports[student.id][bt.id] = '';
          initialSavedMarks[student.id][bt.id] = false;
        });
      });
      setBehaviorReports(initialReports);
      setSavedMarks(initialSavedMarks);
      setInvalidMarks({});
      setToastMessage('');
    } else if (selectedClass === '' || selectedExam === '') {
      setBehaviorReports({});
      setSavedMarks({});
      setInvalidMarks({});
      setToastMessage('');
    }
  }, [students, activeBehaviorTypes, selectedClass, selectedExam]);

  // Update with existing reports
  useEffect(() => {
    if (existingReports && students && activeBehaviorTypes.length > 0 && selectedExam && selectedClass && Object.keys(behaviorReports).length > 0) {
      const updatedReports = { ...behaviorReports };
      const updatedSavedMarks = { ...savedMarks };

      existingReports.forEach(report => {
        if (report.exam_name_id === parseInt(selectedExam)) {
          report.behavior_marks.forEach(mark => {
            if (students.some(student => student.id === mark.student_id)) {
              if (updatedReports[mark.student_id] && updatedReports[mark.student_id].hasOwnProperty(mark.behavior_type)) {
                updatedReports[mark.student_id][mark.behavior_type] = mark.mark.toString();
                updatedSavedMarks[mark.student_id][mark.behavior_type] = true;
              }
            }
          });
        }
      });
      
      setBehaviorReports(updatedReports);
      setSavedMarks(updatedSavedMarks);
    }
  }, [existingReports, students, activeBehaviorTypes, selectedExam, selectedClass]);

  // Handle class change
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setSelectedExam('');
    setIsExamLocked(false);
  };

  // Handle exam change
  const handleExamChange = (e) => {
    if (!isExamLocked) {
      setSelectedExam(e.target.value);
      setIsExamLocked(true);
    }
  };
    // Handle year change
  const handleYearChange = (e) => {
    if (!isExamLocked) {
      setSelectedYear(e.target.value);
    
    }
  };

  // Handle mark input change
  const handleMarkChange = (studentId, behaviorTypeId, value) => {
    const behaviorType = activeBehaviorTypes.find(bt => bt.id === behaviorTypeId);
    const mark = parseFloat(value);
    const isInvalid = !isNaN(mark) && (mark < 0 || mark > behaviorType.obtain_mark);

    setInvalidMarks(prev => ({
      ...prev,
      [`${studentId}-${behaviorTypeId}`]: isInvalid ? `মার্কস ০ থেকে ${behaviorType.obtain_mark} এর মধ্যে হতে হবে` : ''
    }));

    setBehaviorReports(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [behaviorTypeId]: value
      }
    }));

    setSavedMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [behaviorTypeId]: false
      }
    }));
  };

  // Handle mark submission
  const handleMarkSubmit = async (studentId, behaviorTypeId, value, nextInputId) => {
    const behaviorType = activeBehaviorTypes.find(bt => bt.id === behaviorTypeId);
    const mark = parseFloat(value);

    if (isNaN(mark) || mark < 0 || mark > behaviorType.obtain_mark) {
      if (value !== '') {
        toast.error(`মার্কস ০ থেকে ${behaviorType.obtain_mark} এর মধ্যে হতে হবে।`);
        setBehaviorReports(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [behaviorTypeId]: ''
          }
        }));
        setInvalidMarks(prev => ({
          ...prev,
          [`${studentId}-${behaviorTypeId}`]: ''
        }));
      }
      return;
    }

    const behaviorMarks = [];
    activeBehaviorTypes.forEach(bt => {
      let markValue;
      if (bt.id === behaviorTypeId) {
        markValue = mark;
      } else {
        markValue = parseFloat(behaviorReports[studentId][bt.id]);
      }
      
      if (!isNaN(markValue) && markValue >= 0 && markValue <= bt.obtain_mark) {
        behaviorMarks.push({
          student_id: parseInt(studentId),
          behavior_type: parseInt(bt.id),
          mark: markValue
        });
      }
    });

    if (behaviorMarks.length === 0) {
      return;
    }

    const reportData = {
      exam_name_id: parseInt(selectedExam),
      academic_year: parseInt(selectedYear),
      student_id: parseInt(studentId),
      behavior_marks: behaviorMarks
    };

    try {
      await createBehaviorReport(reportData).unwrap();
      setSavedMarks(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [behaviorTypeId]: true
        }
      }));
      setInvalidMarks(prev => ({
        ...prev,
        [`${studentId}-${behaviorTypeId}`]: ''
      }));
      if (nextInputId) {
        const nextInput = inputRefs.current[nextInputId];
        if (nextInput) {
          nextInput.focus();
        }
      }
      toast.success('মার্কস সফলভাবে সংরক্ষিত!');
      // Refetch reports to ensure latest data is available for PDF
      refetch();
    } catch (error) {
      console.error('Failed to save behavior report:', error);
      toast.error('মার্কস সংরক্ষণে ব্যর্থ!');
    }
  };

  // Handle input navigation
  const handleKeyDown = (e, studentId, behaviorTypeId, studentIndex, behaviorIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = behaviorReports[studentId][behaviorTypeId];
      const nextStudentIndex = studentIndex + 1;
      const nextInputId = nextStudentIndex < students.length 
        ? `mark-${students[nextStudentIndex].id}-${behaviorTypeId}`
        : null;
      handleMarkSubmit(studentId, behaviorTypeId, value, nextInputId);
    }
  };

  // Generate PDF report
  const generatePDFReport = async () => {
    if (!selectedClass || !selectedExam) {
      toast.error('শ্রেণি এবং পরীক্ষা নির্বাচন করুন।');
      return;
    }
    try {
      // Refetch to ensure latest marks are included
      await refetch();
      const doc = <PDFDocument 
        students={students} 
        behaviorTypes={activeBehaviorTypes} 
        behaviorReports={existingReports || []}
        localBehaviorReports={behaviorReports}
        selectedExam={selectedExam}
        exams={exams || []}
        selectedClass={selectedClass}
        classes={classes || []}
      />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `আচরণ_প্রতিবেদন_${selectedClass}_${exams.find(exam => exam.id === parseInt(selectedExam))?.name || 'unknown'}_${new Date().toLocaleDateString('bn-BD')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('প্রতিবেদন সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
  };

  if (classesLoading || examsLoading || studentsLoading || behaviorTypesLoading || reportsLoading) {
    return <div className="text-center text-[#441a05]/70 p-4">তথ্য লোড হচ্ছে...</div>;
  }

  return (
    <div className="py-8 w-full relative">
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
          .sticky-col { position: sticky; background: #DB9E30; z-index: 10; }
          .sticky-col-first { left: 0; }
          .sticky-col-second { left: 200px; }
          .has-existing-data { background-color: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.3); }
          .report-button { background-color: #441a05; color: white; padding: 8px 16px; border-radius: 8px; transition: background-color 0.3s; }
          .report-button:hover { background-color: #5a2e0a; }
          .input-error { border-color: #ef4444 !important; }
          .disabled-select { background-color: #e5e7eb; cursor: not-allowed; }
        `}
      </style>
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">শ্রেণি এবং পরীক্ষা নির্বাচন করুন</h3>
        </div>
        <div className="sm:flex-row flex flex-col gap-5">
          <div className="flex-1">
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-1 focus:ring-[#441a05]"
              disabled={classesLoading}
            >
              <option value="" disabled>শ্রেণি নির্বাচন</option>
              {classes?.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.class_name} {cls.shift_name} {cls.section_name}</option>
              ))}
            </select>
            {classError && <div className="mt-2 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">শ্রেণি লোড করতে ত্রুটি: {classError.status || 'অজানা'}</div>}
          </div>
          <div className="flex-1">
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className={`w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-1 focus:ring-[#441a05] ${isExamLocked ? 'disabled-select' : ''}`}
              disabled={!selectedClass || examsLoading || isExamLocked}
            >
              <option value="">শিক্ষাবর্ষ নির্বাচন করুন</option>
              {academicYears?.map(year => (
                <option key={year.id} value={year.id}>{year.name}</option>
              ))}
            </select>
            {yearError && <div className="mt-2 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">শিক্ষাবর্ষ লোড করতে ত্রুটি: {examError.status || 'অজানা'}</div>}
          </div>
          <div className="flex-1">
            <select
              value={selectedExam}
              onChange={handleExamChange}
              className={`w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-1 focus:ring-[#441a05] ${isExamLocked ? 'disabled-select' : ''}`}
              disabled={!selectedClass || examsLoading || isExamLocked}
            >
              <option value="" disabled>পরীক্ষা নির্বাচন</option>
              {exams?.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
            {examError && <div className="mt-2 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">পরীক্ষা লোড করতে ত্রুটি: {examError.status || 'অজানা'}</div>}
          </div>
               
        </div>
        {reportError && <div className="mt-2 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">মার্কস লোড করতে ত্রুটি: {reportError.status || 'অজানা'}</div>}
      </div>
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-x-auto max-h-[60vh] py-2 px-6">
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05]">ছাত্রদের মার্কস</h3>
          <div className="text-sm text-[#441a05]/70">
            
            <button onClick={generatePDFReport} className="report-button" title="Download Behavior Report">রিপোর্ট</button>
          </div>
        </div>
        {(() => {
          if (classesLoading || examsLoading || studentsLoading || behaviorTypesLoading || reportsLoading) {
            return <p className="p-4 text-[#441a05]/70">তথ্য লোড হচ্ছে...</p>;
          }
          if (studentError) return <p className="p-4 text-red-400">ছাত্রদের তথ্য লোড করতে ত্রুটি: {studentError.status || 'অজানা'}</p>;
          if (behaviorTypeError) return <p className="p-4 text-red-400">আচরণের ধরন লোড করতে ত্রুটি: {behaviorTypeError.status || 'অজানা'}</p>;
          if (!activeBehaviorTypes.length) return <p className="p-4 text-yellow-400 bg-yellow-500/10 rounded-lg">কোনো আচরণের ধরন পাওয়া যায়নি। আচরণের ধরন যোগ করুন।</p>;
          if (!selectedClass || !selectedExam) return <p className="p-4 text-[#441a05]/70">শ্রেণি এবং পরীক্ষা নির্বাচন করুন।</p>;
          if (!students?.length) return <p className="p-4 text-yellow-400 bg-yellow-500/10 rounded-lg">নির্বাচিত শ্রেণির জন্য কোনো ছাত্র নেই। (শ্রেণি: {selectedClass})</p>;
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20 table-fixed ">
                <thead className="bg-white/5 ">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider bg-blue-100 sticky-col sticky-col-first" style={{ minWidth: '200px' }}>
                      ছাত্রের নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider sticky-col sticky-col-second" style={{ minWidth: '100px' }}>
                      রোল নম্বর
                    </th>
                    {activeBehaviorTypes.map(bt => (
                      <th key={bt.id} className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider" style={{ minWidth: '180px' }}>
                        {bt.name} ({bt.obtain_mark} এর মধ্যে)
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {students.map((student, studentIndex) => (
                    <tr key={student.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${studentIndex * 0.1}s` }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05] sticky-col sticky-col-first" style={{ minWidth: '200px' }}>
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05] sticky-col sticky-col-second" style={{ minWidth: '100px' }}>
                        {student.roll_no}
                      </td>
                      {activeBehaviorTypes.map((bt, behaviorIndex) => {
                        const nextInputId = studentIndex + 1 < students.length 
                          ? `mark-${students[studentIndex + 1].id}-${bt.id}`
                          : null;
                        const inputId = `mark-${student.id}-${bt.id}`;
                        return (
                          <td key={bt.id} className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]" style={{ minWidth: '180px' }}>
                            <div className="flex items-center">
                              <input
                                id={inputId}
                                type="number"
                                min="0"
                                max={bt.obtain_mark}
                                value={behaviorReports[student.id]?.[bt.id] || ''}
                                onChange={(e) => handleMarkChange(student.id, bt.id, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, student.id, bt.id, studentIndex, behaviorIndex)}
                                onBlur={(e) => handleMarkSubmit(student.id, bt.id, e.target.value, nextInputId)}
                                ref={(el) => (inputRefs.current[inputId] = el)}
                                className={`w-20 bg-transparent text-[#441a05] placeholder:text-[#441a05] pl-3 py-1 focus:outline-none border rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-1 focus:ring-[#441a05] ${
                                  invalidMarks[`${student.id}-${bt.id}`] ? 'input-error' : savedMarks[student.id]?.[bt.id] ? 'has-existing-data border-green-300' : 'border-[#9d9087]'
                                }`}
                                placeholder="মার্কস"
                              />
                              {savedMarks[student.id]?.[bt.id] && <FaCheck className="text-green-500 ml-2" />}
                              {invalidMarks[`${student.id}-${bt.id}`] && <FaTimes className="text-red-500 ml-2" />}
                            </div>
                            {invalidMarks[`${student.id}-${bt.id}`] && (
                              <p className="text-red-400 text-xs mt-1">{invalidMarks[`${student.id}-${bt.id}`]}</p>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default AddBehaviorMarks;

