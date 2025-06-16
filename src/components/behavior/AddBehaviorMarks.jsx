import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetBehaviorTypeApiQuery } from '../../redux/features/api/behavior/behaviorTypeApi';
import { useCreateBehaviorReportApiMutation, useGetBehaviorReportApiQuery, useUpdateBehaviorReportApiMutation } from '../../redux/features/api/behavior/behaviorReportApi';
import { FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; 

// Base64 ফন্ট ডেটা ইম্পোর্ট করুন
// যেহেতু fonts.js এবং AddBehaviorMarks.jsx একই ফোল্ডারে আছে, পাথটি './fonts' হবে।
import { NotoSansBengaliBase64 } from './font'; 


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
    const behaviorMarkData = behaviorTypeId ? studentMarks[behaviorTypeId] : null;

    // Validate mark if provided
    if (behaviorTypeId && (!behaviorMarkData || behaviorMarkData.marks === '')) {
      return;
    }

    const mark = behaviorTypeId ? Number(behaviorMarkData.marks) : null;
    const behavior = behaviorTypeId ? behaviorTypes.find((b) => b.id === parseInt(behaviorTypeId)) : null;

    if (behaviorTypeId && !behavior) {
      toast.error('আচরণের ধরন পাওয়া যায়নি।');
      return;
    }

    if (behaviorTypeId && mark > behavior.obtain_mark) {
      toast.error(`${behavior.name} এর মার্কস ${behavior.obtain_mark} এর বেশি হতে পারে না।`);
      return;
    }
    if (behaviorTypeId && mark < 0) {
      toast.error(`${behavior.name} এর মার্কস নেগেটিভ হতে পারে না।`);
      return;
    }

    setSavingStatus((prev) => ({ ...prev, [inputKey]: 'saving' }));

    try {
      const existingStudentData = existingMarks[studentId];
      const behaviorMarks = behaviorTypes.map((bt) => {
        const existingMark = existingStudentData?.marks[bt.id];
        const isCurrentBehavior = bt.id === parseInt(behaviorTypeId);
        const inputMark = isCurrentBehavior ? mark : studentMarks[bt.id]?.marks;
        return {
          student_id: parseInt(studentId),
          behavior_type: parseInt(bt.id),
          mark: inputMark !== null && inputMark !== undefined && isFinite(Number(inputMark)) ? Number(inputMark) : (existingMark?.marks || 0),
        };
      });

      const currentComment = studentMarks.comment !== undefined ? studentMarks.comment : existingStudentData?.comment || '';

      const payload = {
        exam_name_id: parseInt(selectedExam),
        student_id: parseInt(studentId),
        behavior_marks: behaviorMarks,
        comment: currentComment,
      };

      console.log('Saving payload:', JSON.stringify(payload, null, 2));

      let response;
      if (existingStudentData && existingStudentData.reportId) {
        response = await updateBehaviorReport({
          id: existingStudentData.reportId,
          ...payload,
        }).unwrap();
        console.log('Update response:', response);
        toast.success(behaviorTypeId ? 'মার্কস আপডেট হয়েছে!' : 'মন্তব্য আপডেট হয়েছে!');
      } else {
        response = await createBehaviorReport(payload).unwrap();
        console.log('Create response:', response);
        toast.success(behaviorTypeId ? 'মার্কস সংরক্ষিত হয়েছে!' : 'মন্তব্য সংরক্ষিত হয়েছে!');
      }

      await refetch();

      if (behaviorTypeId) {
        setMarksInput((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [behaviorTypeId]: { marks: '', isEditing: false },
          },
        }));
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
      toast.error('শ্রেণি, পরীক্ষা, ছাত্র, এবং আচরণের ধরন নির্বাচন করুন।');
      return;
    }

    try {
      const doc = new jsPDF();

      // Step 1: Add the Base64 font to jsPDF's VFS (Virtual File System)
      doc.addFileToVFS('NotoSansBengali-Regular.ttf', NotoSansBengaliBase64);

      // Step 2: Add the font to jsPDF's font list
      doc.addFont('NotoSansBengali-Regular.ttf', 'NotoSansBengali', 'normal');

      // Step 3: Set the font for the document
      doc.setFont('NotoSansBengali'); 
      doc.setFontSize(16);

      // Add title
      doc.text(`আচরণের রিপোর্ট - শ্রেণি: ${selectedClass} (পরীক্ষা: ${exams.find(e => e.id == selectedExam)?.name})`, 10, 20);

      // Table headers and data
      const headers = [['ছাত্রের নাম', 'রোল নম্বর', ...behaviorTypes.map((bt) => `${bt.name} (${bt.obtain_mark})`), 'মোট মার্কস', 'মন্তব্য']];
      
      const body = filteredStudents.map((student) => [
        student.name || 'N/A',
        student.roll_no || 'N/A',
        ...behaviorTypes.map((bt) => {
          const mark = existingMarks[student.id]?.marks[bt.id]?.marks || 0;
          return mark.toString();
        }),
        totalMarks[student.id]?.toString() || '0',
        existingMarks[student.id]?.comment || '',
      ]);

      // Log data for debugging
      console.log('PDF Data:', { headers, body });

      // Generate table using jspdf-autotable
      doc.autoTable({
        startY: 30,
        head: headers,
        body: body,
        theme: 'grid',
        styles: {
          font: 'NotoSansBengali', // Use the Bengali font for table content
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak',
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [68, 26, 5],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        bodyStyles: {
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 40 }, // Student Name
          1: { cellWidth: 20 }, // Roll No
          ...behaviorTypes.reduce((acc, _, index) => ({ ...acc, [index + 2]: { cellWidth: 20, overflow: 'linebreak' } }), {}), // Behavior Marks
          [behaviorTypes.length + 2]: { cellWidth: 20 }, // Total Marks
          [behaviorTypes.length + 3]: { cellWidth: 60, overflow: 'linebreak' }, // Comment
        },
        margin: { top: 30, left: 10, right: 10 },
      });

      // Save the PDF
      doc.save(`Behavior_Report_${selectedClass}_Exam_${selectedExam}.pdf`);
      toast.success('রিপোর্ট সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`রিপোর্ট তৈরি করতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
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