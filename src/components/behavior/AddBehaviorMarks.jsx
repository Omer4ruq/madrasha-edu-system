import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetBehaviorTypeApiQuery } from '../../redux/features/api/behavior/behaviorTypeApi';
import { useCreateBehaviorReportApiMutation, useGetBehaviorReportApiQuery, useUpdateBehaviorReportApiMutation } from '../../redux/features/api/behavior/behaviorReportApi';
import { FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

// Register Noto Sans Bengali font (local path)
Font.register({
  family: 'NotoSansBengali',
  src: '/fonts/NotoSansBengali-Regular.ttf', // Ensure this file exists in public/fonts
});

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSansBengali',
    fontSize: 10,
    color: '#333',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#441a05',
  },
  headerText: {
    fontSize: 10,
    marginTop: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#441a05',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaText: {
    fontSize: 9,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#441a05',
    marginVertical: 10,
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
    padding: 5,
    textAlign: 'center',
  },
  tableCell: {
    padding: 5,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#441a05',
    flex: 1,
    textAlign: 'left',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableCellComment: {
    flex: 2,
  },
  tableRowAlternate: {
    backgroundColor: '#f5f5f5',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#666',
  },
});

// PDF Document Component
const PDFDocument = ({ selectedClass, examName, currentDate, behaviorTypes, filteredStudents, existingMarks, totalMarks }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>আদর্শ বিদ্যালয়</Text>
        <Text style={styles.headerText}>ঢাকা, বাংলাদেশ</Text>
        <Text style={styles.title}>আচরণ প্রতিবেদন</Text>
        <View style={styles.metaContainer}>
          <View>
            <Text style={styles.metaText}>শ্রেণি: {selectedClass}</Text>
            <Text style={styles.metaText}>পরীক্ষা: {examName}</Text>
          </View>
          <Text style={styles.metaText}>তারিখ: {currentDate}</Text>
        </View>
        <View style={styles.divider} />
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { flex: 1 }]}>ছাত্রের নাম</Text>
          <Text style={[styles.tableHeader, { flex: 0.5 }]}>রোল নম্বর</Text>
          {behaviorTypes?.map((bt) => (
            <Text key={bt.id} style={[styles.tableHeader, { flex: 0.5 }]}>{`${bt?.name} (${bt?.obtain_mark})`}</Text>
          ))}
          <Text style={[styles.tableHeader, { flex: 0.5 }]}>মোট মার্কস</Text>
          <Text style={[styles.tableHeader, { flex: 2 }]}>মন্তব্য</Text>
        </View>
        {filteredStudents.map((student, index) => (
          <View key={student.id} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlternate]}>
            <Text style={[styles.tableCell, { flex: 1 }]}>{student.name || 'N/A'}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 0.5 }]}>{student.roll_no || 'N/A'}</Text>
            {behaviorTypes?.map((bt) => (
              <Text key={bt.id} style={[styles.tableCell, styles.tableCellCenter, { flex: 0.5 }]}>
                {existingMarks[student?.id]?.marks[bt.id]?.marks?.toString() || '0'}
              </Text>
            ))}
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 0.5 }]}>{totalMarks[student?.id]?.toString() || '0'}</Text>
            <Text style={[styles.tableCell, styles.tableCellComment, { flex: 2 }]}>{existingMarks[student?.id]?.comment || ''}</Text>
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
  const [marksInput, setMarksInput] = useState({});
  const [savingStatus, setSavingStatus] = useState({});
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const inputRefs = useRef({});

  // Fetch class configurations
  const { data: classData, isLoading: classLoading, error: classError } = useGetclassConfigApiQuery();
  const classes = classData || [];

  // Fetch exams
  const { data: examData, isLoading: examLoading, error: examError } = useGetExamApiQuery();
  const exams = examData || [];

  // Fetch students based on selected class
  const { data: studentData, isLoading: studentLoading, error: studentError } = useGetStudentActiveApiQuery(
    { class_name: selectedClass },
    { skip: !selectedClass }
  );
  const students = studentData || [];

  // Fetch behavior types
  const { data: behaviorTypeData, isLoading: behaviorTypeLoading, error: behaviorTypeError } = useGetBehaviorTypeApiQuery();
  const behaviorTypes = behaviorTypeData || [];

  // Fetch existing behavior reports
  const { data: behaviorReportData, isLoading: reportLoading, error: reportError, refetch } = useGetBehaviorReportApiQuery(
    { exam_name_id: selectedExam, class_name: selectedClass },
    { skip: !selectedClass || !selectedExam }
  );
  console.log('behaviorReportData', behaviorReportData);
  const behaviorReports = behaviorReportData?.data || [];

  // Mutations for creating and updating behavior reports
  const [createBehaviorReport] = useCreateBehaviorReportApiMutation();
  const [updateBehaviorReport] = useUpdateBehaviorReportApiMutation();

  // Timeout for loading states
  useEffect(() => {
    const timer = setTimeout(() => {
      if (classLoading || examLoading || studentLoading || behaviorTypeLoading || reportLoading) {
        setLoadingTimeout(true);
      }
    }, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, [classLoading, examLoading, studentLoading, behaviorTypeLoading, reportLoading]);

  // Debugging logs
  useEffect(() => {
    console.log('Debugging State:', {
      classData,
      examData,
      studentData,
      behaviorTypeData,
      behaviorReportData,
      selectedClass,
      selectedExam,
      classLoading,
      examLoading,
      studentLoading,
      behaviorTypeLoading,
      reportLoading,
      classError,
      examError,
      studentError,
      behaviorTypeError,
      reportError,
      loadingTimeout,
    });
  }, [
    classData,
    examData,
    studentData,
    behaviorTypeData,
    behaviorReportData,
    selectedClass,
    selectedExam,
    classLoading,
    examLoading,
    studentLoading,
    behaviorTypeLoading,
    reportLoading,
    classError,
    examError,
    studentError,
    behaviorTypeError,
    reportError,
    loadingTimeout,
  ]);

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    const students = studentData?.filter((student) => student?.class_name === selectedClass) || [];
    console.log('filteredStudents:', students);
    return students;
  }, [studentData, selectedClass]);

  // Process existing marks data
  const existingMarks = useMemo(() => {
    if (!behaviorReportData?.data || !selectedExam || !behaviorTypes || !studentData) {
      console.log('existingMarks: Skipping due to missing data', {
        behaviorReportData: !!behaviorReportData?.data,
        selectedExam: !!selectedExam,
        behaviorTypes: !!behaviorTypes,
        studentData: !!studentData,
      });
      return {};
    }

    const marksMap = {};
    behaviorReportData?.data.forEach((report) => {
      if (report.exam_name_id === parseInt(selectedExam)) {
        const student = studentData.find((s) => s.id === report.student_id && s.class_name === selectedClass);
        if (!student) return;

        report.behavior_marks?.forEach((behaviorMark) => {
          const studentId = behaviorMark.student_id;
          const behaviorTypeId = behaviorMark.behavior_type;
          const behaviorType = behaviorTypes.find((bt) => bt.id === behaviorTypeId);
          if (behaviorType) {
            if (!marksMap[studentId]) {
              marksMap[studentId] = {
                reportId: report.id,
                comment: report.comment || '',
                marks: {},
              };
            }
            marksMap[studentId].marks[behaviorTypeId] = {
              id: behaviorMark.id,
              marks: behaviorMark.mark,
              behaviorTypeId: behaviorTypeId,
            };
          }
        });
      }
    });

    console.log('existingMarks:', marksMap);
    return marksMap;
  }, [behaviorReportData, selectedExam, behaviorTypes, studentData, selectedClass]);

  // Calculate total marks for each student
  const totalMarks = useMemo(() => {
    const totals = {};
    filteredStudents.forEach((student) => {
      const studentMarks = existingMarks[student.id]?.marks || {};
      const total = behaviorTypes.reduce((sum, behavior) => {
        const mark = studentMarks[behavior.id]?.marks || 0;
        return sum + (isFinite(Number(mark)) ? Number(mark) : 0);
      }, 0);
      totals[student.id] = total;
    });
    console.log('totalMarks:', totals);
    return totals;
  }, [existingMarks, filteredStudents, behaviorTypes]);

  // Handle marks input
  const handleMarksInput = (studentId, behaviorTypeId, value) => {
    setMarksInput((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId] || {},
        [behaviorTypeId]: { marks: value, isEditing: true },
      },
    }));
  };

  // Handle comment input
  const handleCommentInput = (studentId, value) => {
    setMarksInput((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId] || {},
        comment: value,
      },
    }));
  };

  // Unified save function for marks and comments
  const handleSave = async (studentId, behaviorTypeId = null) => {
    if (!selectedExam) {
      toast.error('পরীক্ষা নির্বাচন করুন।');
      return;
    }

    const inputKey = behaviorTypeId ? `${studentId}-${behaviorTypeId}` : `${studentId}-comment`;
    const studentMarks = marksInput[studentId] || {};

    setSavingStatus((prev) => ({ ...prev, [inputKey]: 'saving' }));

    try {
      const existingStudentData = existingMarks[studentId];

      // Handle mark saving
      if (behaviorTypeId) {
        const behaviorMarkData = studentMarks[behaviorTypeId];
        if (!behaviorMarkData || behaviorMarkData.marks === '') {
          setSavingStatus((prev) => ({ ...prev, [inputKey]: null }));
          return;
        }

        const mark = Number(behaviorMarkData.marks);
        const behavior = behaviorTypes.find((b) => b.id === parseInt(behaviorTypeId));

        if (!behavior) {
          toast.error('আচরণের ধরন পাওয়া যায়নি।');
          setSavingStatus((prev) => ({ ...prev, [inputKey]: 'error' }));
          return;
        }

        if (mark > behavior.obtain_mark) {
          toast.error(`${behavior.name} এর মার্কস ${behavior.obtain_mark} এর বেশি হতে পারে না।`);
          setSavingStatus((prev) => ({ ...prev, [inputKey]: 'error' }));
          return;
        }
        if (mark < 0) {
          toast.error(`${behavior.name} এর মার্কস নেগেটিভ হতে পারে না।`);
          setSavingStatus((prev) => ({ ...prev, [inputKey]: 'error' }));
          return;
        }

        const payload = {
          exam_name_id: parseInt(selectedExam),
          student_id: parseInt(studentId),
          behavior_marks: [
            {
              student_id: parseInt(studentId),
              behavior_type: parseInt(behaviorTypeId),
              mark: mark,
            },
          ],
          comment: existingStudentData?.comment || '',
        };

        let response;
        if (existingStudentData && existingStudentData.reportId) {
          // Update only the specific mark
          response = await updateBehaviorReport({
            id: existingStudentData.reportId,
            ...payload,
          }).unwrap();
          console.log('Update response:', response);
          // toast.success('মার্কস আপডেট হয়েছে!');
        } else {
          // Create new report with only the specific mark
          response = await createBehaviorReport(payload).unwrap();
          console.log('Create response:', response);
          // toast.success('মার্কস সংরক্ষিত হয়েছে!');
        }

        await refetch();

        setMarksInput((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [behaviorTypeId]: { marks: '', isEditing: false },
          },
        }));
      } else {
        // Handle comment saving
        const currentComment = studentMarks.comment !== undefined ? studentMarks.comment : existingStudentData?.comment || '';

        if (!existingStudentData && !currentComment) {
          toast.error('মন্তব্য সংরক্ষণের জন্য অন্তত একটি মার্কস থাকতে হবে।');
          setSavingStatus((prev) => ({ ...prev, [inputKey]: 'error' }));
          return;
        }

        const payload = {
          exam_name_id: parseInt(selectedExam),
          student_id: parseInt(studentId),
          behavior_marks: existingStudentData?.marks
            ? Object.values(existingStudentData.marks).map((mark) => ({
                student_id: parseInt(studentId),
                behavior_type: parseInt(mark.behaviorTypeId),
                mark: Number(mark.marks),
              }))
            : [],
          comment: currentComment,
        };

        let response;
        if (existingStudentData && existingStudentData.reportId) {
          // Update only the comment
          response = await updateBehaviorReport({
            id: existingStudentData.reportId,
            ...payload,
          }).unwrap();
          console.log('Update response:', response);
          toast.success('মন্তব্য আপডেট হয়েছে!');
        } else {
          if (payload.behavior_marks.length === 0) {
            toast.error('মন্তব্য সংরক্ষণের জন্য অন্তত একটি মার্কস থাকতে হবে।');
            setSavingStatus((prev) => ({ ...prev, [inputKey]: 'error' }));
            return;
          }
          // Create new report with only the comment
          response = await createBehaviorReport(payload).unwrap();
          console.log('Create response:', response);
          toast.success('মন্তব্য সংরক্ষিত হয়েছে!');
        }

        await refetch();
      }

      setSavingStatus((prev) => ({ ...prev, [inputKey]: 'success' }));

      setTimeout(() => {
        setSavingStatus((prev) => ({ ...prev, [inputKey]: null }));
      }, 2000);
    } catch (err) {
      console.error('সংরক্ষণে ত্রুটি:', err);
      console.error('Error details:', err?.data || err);
      toast.error(`সংরক্ষণে ব্যর্থ: ${err.status || 'অজানা ত্রুটি'}`);
      setSavingStatus((prev) => ({ ...prev, [inputKey]: 'error' }));

      setTimeout(() => {
        setSavingStatus((prev) => ({ ...prev, [inputKey]: null }));
      }, 3000);
    }
  };

  // Handle Enter key for marks
  const handleKeyDown = async (e, studentId, behaviorTypeId, studentIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSave(studentId, behaviorTypeId);
      const nextStudentIndex = studentIndex + 1;
      if (nextStudentIndex < filteredStudents.length) {
        const nextInput = inputRefs.current[`${filteredStudents[nextStudentIndex].id}-${behaviorTypeId}`];
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Get current marks value
  const getCurrentMarks = (studentId, behaviorTypeId) => {
    const inputValue = marksInput[studentId]?.[behaviorTypeId]?.marks;
    if (inputValue !== undefined) {
      return inputValue;
    }
    const existingValue = existingMarks[studentId]?.marks[behaviorTypeId]?.marks;
    return existingValue !== undefined ? existingValue.toString() : '';
  };

  // Get current comment value
  const getCurrentComment = (studentId) => {
    const inputValue = marksInput[studentId]?.comment;
    if (inputValue !== undefined) return inputValue;
    const existingValue = existingMarks[studentId]?.comment;
    return existingValue || '';
  };

  // Get saving status icon
  const getSavingStatusIcon = (studentId, behaviorTypeId) => {
    const inputKey = behaviorTypeId ? `${studentId}-${behaviorTypeId}` : `${studentId}-comment`;
    const status = savingStatus[inputKey];
    switch (status) {
      case 'saving':
        return <FaSpinner className="animate-spin text-blue-500 ml-2" />;
      case 'success':
        return <FaCheck className="text-green-500 ml-2" />;
      case 'error':
        return <FaTimes className="text-red-500 ml-2" />;
      default:
        return null;
    }
  };

  // Check if a field has existing data
  const hasExistingData = (studentId, behaviorTypeId) => {
    return existingMarks[studentId]?.marks[behaviorTypeId]?.marks !== undefined;
  };

  // Generate and download PDF report
  const generatePDFReport = async () => {
    if (!selectedClass || !selectedExam || filteredStudents.length === 0 || behaviorTypes.length === 0) {
      toast.error('শ্রেণি, পরীক্ষা, ছাত্র এবং আচরণের ধরন নির্বাচন করুন।');
      return;
    }

    try {
      const examName = exams.find((e) => e.id == selectedExam)?.name || 'N/A';
      const currentDate = new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const doc = (
        <PDFDocument
          selectedClass={selectedClass}
          examName={examName}
          currentDate={currentDate}
          behaviorTypes={behaviorTypes}
          filteredStudents={filteredStudents}
          existingMarks={existingMarks}
          totalMarks={totalMarks}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `আচরণ_প্রতিবেদন_${selectedClass}_পরীক্ষা_${examName}_${currentDate}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('প্রতিবেদন সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
  };

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
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
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
          .sticky-col {
            position: sticky;
            background: #DB9E30;
            z-index: 10;
          }
          .sticky-col-first {
            left: 0;
          }
          .sticky-col-second {
            left: 200px;
          }
          .has-existing-data {
            background-color: rgba(34, 197, 94, 0.1);
            border-color: rgba(34, 197, 94, 0.3);
          }
          .report-button {
            background-color: #441a05;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            transition: background-color 0.3s;
          }
          .report-button:hover {
            background-color: #5a2e0a;
          }
        `}
      </style>

      <div>
        {/* Class and Exam Selection */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">শ্রেণি এবং পরীক্ষা নির্বাচন করুন</h3>
          </div>
          <div className="flex space-x-4 max-w-2xl">
            <div className="flex-1">
              <select
                value={selectedClass}
                onChange={(e) => {
                  console.log('Selected Class:', e.target.value);
                  setSelectedClass(e.target.value);
                }}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={classLoading}
              >
                <option value="">শ্রেণি নির্বাচন করুন</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.class_name}>
                    {cls.class_name} {cls.shift_name} {cls.section_name}
                  </option>
                ))}
              </select>
              {classError && (
                <div className="mt-2 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
                  শ্রেণি লোড করতে ত্রুটি: {classError.status || 'অজানা'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <select
                value={selectedExam}
                onChange={(e) => {
                  console.log('Selected Exam:', e.target.value);
                  setSelectedExam(e.target.value);
                }}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={examLoading}
              >
                <option value="">পরীক্ষা নির্বাচন করুন</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
              {examError && (
                <div className="mt-2 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
                  পরীক্ষা লোড করতে ত্রুটি: {examError.status || 'অজানা'}
                </div>
              )}
            </div>
          </div>
          {reportError && (
            <div className="mt-2 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
              মার্কস লোড করতে ত্রুটি: {reportError.status || 'অজানা'}
            </div>
          )}
        </div>

        {/* Students Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-x-auto max-h-[60vh] py-2 px-6">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-[#441a05]">ছাত্রদের মার্কস</h3>
            <div className="text-sm text-[#441a05]/70">
              <span className="bg-blue-100 px-2 py-1 rounded mr-2">💡 Enter বা বাইরে ক্লিক করে সংরক্ষণ করুন</span>
              <button
                onClick={generatePDFReport}
                className="report-button"
                title="Download Behavior Report"
              >
                রিপোর্ট
              </button>
            </div>
          </div>

          {(() => {
            console.log('Rendering Conditions:', {
              isAnyLoading: classLoading || examLoading || studentLoading || behaviorTypeLoading || reportLoading,
              hasClassError: !!classError,
              hasExamError: !!examError,
              hasStudentError: !!studentError,
              hasBehaviorError: !!behaviorTypeError,
              hasReportError: !!reportError,
              hasBehaviorTypes: behaviorTypes?.length > 0,
              hasSelectedClassAndExam: !!selectedClass && !!selectedExam,
              hasFilteredStudents: filteredStudents.length > 0,
              loadingTimeout,
            });

            if (loadingTimeout) {
              return (
                <p className="p-4 text-red-400">
                  তথ্য লোড হতে বেশি সময় নিচ্ছে। দয়া করে নেটওয়ার্ক চেক করুন অথবা পরে আবার চেষ্টা করুন।
                </p>
              );
            }

            if (classLoading || examLoading || studentLoading || behaviorTypeLoading || reportLoading) {
              return <p className="p-4 text-[#441a05]/70">তথ্য লোড হচ্ছে...</p>;
            }

            if (studentError) {
              return (
                <p className="p-4 text-red-400">
                  ছাত্রদের তথ্য লোড করতে ত্রুটি: {studentError.status || 'অজানা'}
                </p>
              );
            }

            if (behaviorTypeError) {
              return (
                <p className="p-4 text-red-400">
                  আচরণের ধরন লোড করতে ত্রুটি: {behaviorTypeError.status || 'অজানা'}
                </p>
              );
            }

            if (!behaviorTypes?.length) {
              return (
                <p className="p-4 text-yellow-400 bg-yellow-500/10 rounded-lg">
                  কোনো আচরণের ধরন পাওয়া যায়নি। দয়া করে আচরণের ধরন যোগ করুন।
                </p>
              );
            }

            if (!selectedClass || !selectedExam) {
              return (
                <p className="p-4 text-[#441a05]/70">ছাত্রদের দেখতে একটি শ্রেণি এবং পরীক্ষা নির্বাচন করুন।</p>
              );
            }

            if (filteredStudents.length === 0) {
              return (
                <p className="p-4 text-yellow-400 bg-yellow-500/10 rounded-lg">
                  নির্বাচিত শ্রেণির জন্য কোনো ছাত্র পাওয়া যায়নি। (শ্রেণি: {selectedClass})
                </p>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20 table-fixed">
                  <thead className="bg-white/5">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider sticky-col sticky-col-first"
                        style={{ minWidth: '200px' }}
                      >
                        ছাত্রের নাম
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider sticky-col sticky-col-second"
                        style={{ minWidth: '100px' }}
                      >
                        রোল নম্বর
                      </th>
                      {behaviorTypes?.map((behavior) => (
                        <th
                          key={behavior.id}
                          className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
                          style={{ minWidth: '180px' }}
                        >
                          {behavior.name} ({behavior.obtain_mark} এর মধ্যে)
                        </th>
                      ))}
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
                        style={{ minWidth: '200px' }}
                      >
                        মন্তব্য
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
                        style={{ minWidth: '120px' }}
                      >
                        মোট মার্কস
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {filteredStudents.map((student, index) => (
                      <tr
                        key={student.id}
                        className="bg-white/5 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05] sticky-col sticky-col-first"
                          style={{ minWidth: '200px' }}
                        >
                          {student.name}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05] sticky-col sticky-col-second"
                          style={{ minWidth: '100px' }}
                        >
                          {student.roll_no}
                        </td>
                        {behaviorTypes?.map((behavior) => (
                          <td
                            key={behavior.id}
                            className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]"
                            style={{ minWidth: '180px' }}
                          >
                            <div className="flex items-center">
                              <input
                                type="number"
                                value={getCurrentMarks(student.id, behavior.id)}
                                onChange={(e) => handleMarksInput(student.id, behavior.id, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, student.id, behavior.id, index)}
                                onBlur={() => handleSave(student.id, behavior.id)}
                                ref={(el) => (inputRefs.current[`${student.id}-${behavior.id}`] = el)}
                                className={`w-20 bg-transparent text-[#441a05] placeholder:text-[#441a05] pl-3 py-1 focus:outline-none border rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-1 focus:ring-[#441a05] ${
                                  hasExistingData(student.id, behavior.id)
                                    ? 'has-existing-data border-green-300'
                                    : 'border-[#9d9087]'
                                }`}
                                placeholder="মার্কস"
                                min={0}
                                max={behavior.obtain_mark}
                              />
                              {getSavingStatusIcon(student.id, behavior.id)}
                            </div>
                          </td>
                        ))}
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]"
                          style={{ minWidth: '200px' }}
                        >
                          <input
                            type="text"
                            value={getCurrentComment(student.id)}
                            onChange={(e) => handleCommentInput(student.id, e.target.value)}
                            onBlur={() => handleSave(student.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave(student.id)}
                            className={`w-full bg-transparent text-[#441a05] placeholder:text-[#441a05] pl-3 py-1 focus:outline-none border rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-1 focus:ring-[#441a05] ${
                              existingMarks[student.id]?.comment
                                ? 'has-existing-data border-green-300'
                                : 'border-[#9d9087]'
                            }`}
                            placeholder="মন্তব্য (ঐচ্ছিক)"
                          />
                          {getSavingStatusIcon(student.id, null)}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]"
                          style={{ minWidth: '120px' }}
                        >
                          {totalMarks[student.id] || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default AddBehaviorMarks;