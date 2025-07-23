import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetBehaviorTypeApiQuery } from '../../redux/features/api/behavior/behaviorTypeApi';
import { useCreateBehaviorReportApiMutation, useGetBehaviorReportApiQuery } from '../../redux/features/api/behavior/behaviorReportApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { FaSpinner, FaCheck, FaExclamationTriangle, FaTimes, FaGraduationCap, FaDownload } from 'react-icons/fa';
import { IoAddCircle, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';
import selectStyles from '../../utilitis/selectStyles';

const AddBehaviorMarks = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [behaviorReports, setBehaviorReports] = useState({});
  const [invalidMarks, setInvalidMarks] = useState({});
  const [markStatus, setMarkStatus] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  // API Queries
  const { data: institute, isLoading: instituteLoading } = useGetInstituteLatestQuery();
  const { data: academicYears, isLoading: academicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
  const { data: exams, isLoading: examsLoading } = useGetExamApiQuery();
  const { data: allStudents, isLoading: studentsLoading } = useGetStudentActiveByClassQuery(selectedClass, { skip: !selectedClass });
  const { data: behaviorTypes, isLoading: behaviorTypesLoading } = useGetBehaviorTypeApiQuery();
  const { data: existingReports, isLoading: reportsLoading } = useGetBehaviorReportApiQuery();
  const [createBehaviorReport, { isLoading: isCreating }] = useCreateBehaviorReportApiMutation();

  // Filter students based on selected academic year
  const students = React.useMemo(() => {
    if (!allStudents || !selectedAcademicYear) {
      return allStudents || [];
    }

    return allStudents.filter(student =>
      student.admission_year_id === parseInt(selectedAcademicYear)
    );
  }, [allStudents, selectedAcademicYear]);

  // Permissions
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_student_behavior_report') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_student_behavior_report') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_student_behavior_report') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_student_behavior_report') || false;

  // Filter active behavior types
  const activeBehaviorTypes = behaviorTypes?.filter(bt => bt.is_active) || [];

  // Show toast message
  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Track which marks have been manually cleared to prevent reloading
  const [clearedMarks, setClearedMarks] = useState(new Set());

  // Reset all data when class, exam, or academic year changes
  useEffect(() => {
    setBehaviorReports({});
    setMarkStatus({});
    setInvalidMarks({});
    setClearedMarks(new Set());
  }, [selectedClass, selectedExam, selectedAcademicYear]);

  // Initialize behavior reports structure
  useEffect(() => {
    if (students && activeBehaviorTypes.length > 0) {
      setBehaviorReports(prev => {
        const initialReports = {};
        let needsInit = false;

        students.forEach(student => {
          initialReports[student.id] = prev[student.id] || {};
          activeBehaviorTypes.forEach(bt => {
            if (!initialReports[student.id].hasOwnProperty(bt.id)) {
              initialReports[student.id][bt.id] = '';
              needsInit = true;
            }
          });
        });
        return needsInit ? initialReports : prev;
      });

      setMarkStatus(prev => {
        const initialMarkStatus = {};
        let needsInit = false;

        students.forEach(student => {
          initialMarkStatus[student.id] = prev[student.id] || {};
          activeBehaviorTypes.forEach(bt => {
            if (!initialMarkStatus[student.id].hasOwnProperty(bt.id)) {
              initialMarkStatus[student.id][bt.id] = null;
              needsInit = true;
            }
          });
        });
        return needsInit ? initialMarkStatus : prev;
      });
    }
  }, [students, activeBehaviorTypes]);

  // Load existing behavior reports
  useEffect(() => {
    if (existingReports && students && activeBehaviorTypes.length > 0 &&
      selectedExam && Object.keys(behaviorReports).length > 0) {

      let needsUpdate = false;
      const updatedReports = { ...behaviorReports };
      const updatedMarkStatus = { ...markStatus };

      existingReports.forEach(report => {
        const examMatches = report.exam_name_id === parseInt(selectedExam);
        const academicYearMatches = selectedAcademicYear ?
          report.academic_year === parseInt(selectedAcademicYear) :
          report.academic_year === null;

        if (examMatches && academicYearMatches) {
          report.behavior_marks.forEach(mark => {
            if (students.some(student => student.id === mark.student_id) &&
              activeBehaviorTypes.some(bt => bt.id === mark.behavior_type)) {

              const markKey = `${mark.student_id}-${mark.behavior_type}`;

              if (clearedMarks.has(markKey)) {
                return;
              }

              if (updatedReports[mark.student_id] &&
                updatedReports[mark.student_id][mark.behavior_type] !== mark.mark.toString()) {
                updatedReports[mark.student_id][mark.behavior_type] = mark.mark.toString();
                updatedMarkStatus[mark.student_id] = {
                  ...updatedMarkStatus[mark.student_id],
                  [mark.behavior_type]: 'success'
                };
                needsUpdate = true;
              }
            }
          });
        }
      });

      if (needsUpdate) {
        setBehaviorReports(updatedReports);
        setMarkStatus(updatedMarkStatus);
      }
    }
  }, [existingReports, students, activeBehaviorTypes, selectedExam, selectedAcademicYear, clearedMarks]);

  // Handle mark input change
  const handleMarkChange = (studentId, behaviorTypeId, value) => {
    if (!hasAddPermission && !hasChangePermission) {
      showToast('আচরণ নম্বর সম্পাদনার অনুমতি নেই।', 'error');
      return;
    }

    const behaviorType = activeBehaviorTypes.find(bt => bt.id === behaviorTypeId);
    if (!behaviorType) return;

    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const markKey = `${studentId}-${behaviorTypeId}`;
      if (value !== '') {
        setClearedMarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(markKey);
          return newSet;
        });
      }

      setBehaviorReports(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [behaviorTypeId]: value
        }
      }));

      setMarkStatus(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [behaviorTypeId]: null
        }
      }));

      const mark = parseFloat(value);
      const isInvalid = value !== '' && value !== '.' && !isNaN(mark) && (mark < 0 || mark > behaviorType.obtain_mark);
      const invalidKey = `${studentId}-${behaviorTypeId}`;
      const errorMessage = isInvalid ? `নম্বর ০ থেকে ${behaviorType.obtain_mark} এর মধ্যে হতে হবে` : '';

      setInvalidMarks(prev => ({
        ...prev,
        [invalidKey]: errorMessage
      }));
    }
  };

  // Handle mark submission
  const handleMarkSubmit = async (studentId, behaviorTypeId, value, nextInputId = null) => {
    if (!selectedClass || !selectedExam || (!hasAddPermission && !hasChangePermission)) {
      if (!selectedClass || !selectedExam) {
        showToast('শ্রেণী এবং পরীক্ষা নির্বাচন করুন।', 'warning');
      } else {
        showToast('আচরণ নম্বর সংরক্ষণের অনুমতি নেই।', 'error');
      }
      return;
    }

    const behaviorType = activeBehaviorTypes.find(bt => bt.id === behaviorTypeId);
    if (!behaviorType) return;

    const markKey = `${studentId}-${behaviorTypeId}`;

    const existingMark = existingReports?.find(report =>
      report.exam_name_id === parseInt(selectedExam) &&
      (selectedAcademicYear ? report.academic_year === parseInt(selectedAcademicYear) : report.academic_year === null)
    )?.behavior_marks?.find(bm => bm.student_id === studentId && bm.behavior_type === behaviorTypeId)?.mark?.toString() || '';

    if (value === existingMark && markStatus[studentId]?.[behaviorTypeId] === 'success') {
      if (nextInputId) {
        document.getElementById(nextInputId)?.focus();
      }
      return;
    }

    setMarkStatus(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [behaviorTypeId]: 'loading'
      }
    }));
    setInvalidMarks(prev => ({ ...prev, [markKey]: '' }));

    if (value !== '' && value !== null && value !== undefined) {
      const mark = parseFloat(value);
      if (isNaN(mark) || mark < 0 || mark > behaviorType.obtain_mark) {
        setInvalidMarks(prev => ({
          ...prev,
          [markKey]: `অবৈধ নম্বর! ০ থেকে ${behaviorType.obtain_mark} এর মধ্যে হতে হবে।`
        }));
        setMarkStatus(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [behaviorTypeId]: 'error'
          }
        }));
        showToast(`অবৈধ নম্বর! ০ থেকে ${behaviorType.obtain_mark} এর মধ্যে হতে হবে।`, 'error');
        setTimeout(() => setMarkStatus(prev => ({ ...prev, [studentId]: { ...prev[studentId], [behaviorTypeId]: null } })), 2000);
        return;
      }
    }

    const allBehaviorMarks = [];
    const studentReportsData = behaviorReports[studentId] || {};

    activeBehaviorTypes.forEach(bt => {
      let currentMarkValue = studentReportsData[bt.id];

      if (bt.id === behaviorTypeId) {
        currentMarkValue = value;
      }

      if (currentMarkValue !== '' && currentMarkValue !== null && currentMarkValue !== undefined) {
        const parsedValue = parseFloat(currentMarkValue);
        if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= bt.obtain_mark) {
          allBehaviorMarks.push({
            student_id: parseInt(studentId),
            behavior_type: parseInt(bt.id),
            mark: parsedValue
          });
        }
      }
    });

    const reportData = {
      exam_name_id: parseInt(selectedExam),
      academic_year: selectedAcademicYear ? parseInt(selectedAcademicYear) : null,
      student_id: parseInt(studentId),
      behavior_marks: allBehaviorMarks
    };

    try {
      await createBehaviorReport(reportData).unwrap();

      setMarkStatus(prev => {
        const updatedStudentMarks = { ...prev[studentId] };
        activeBehaviorTypes.forEach(bt => {
          if (allBehaviorMarks.some(bm => bm.behavior_type === bt.id)) {
            updatedStudentMarks[bt.id] = 'success';
          } else if (bt.id === behaviorTypeId && (value === '' || value === null || value === undefined)) {
            updatedStudentMarks[bt.id] = 'success';
          } else {
            if (updatedStudentMarks[bt.id] !== 'success') {
              updatedStudentMarks[bt.id] = null;
            }
          }
        });
        return { ...prev, [studentId]: updatedStudentMarks };
      });

      showToast(`আচরণ নম্বর সফলভাবে সংরক্ষিত হয়েছে!`, 'success');

      if (nextInputId) {
        document.getElementById(nextInputId)?.focus();
      }
    } catch (error) {
      console.error('Failed to save behavior report:', error);
      showToast('নম্বর সংরক্ষণ ব্যর্থ হয়েছে।', 'error');

      setMarkStatus(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [behaviorTypeId]: 'error'
        }
      }));

      const previousValue = existingReports?.find(report => {
        const examMatches = report.exam_name_id === parseInt(selectedExam);
        const academicYearMatches = selectedAcademicYear ?
          report.academic_year === parseInt(selectedAcademicYear) :
          report.academic_year === null;
        return examMatches && academicYearMatches;
      })?.behavior_marks?.find(bm =>
        bm.student_id === studentId && bm.behavior_type === behaviorTypeId
      )?.mark?.toString() || '';

      setBehaviorReports(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [behaviorTypeId]: previousValue
        }
      }));
    } finally {
      setTimeout(() => {
        setMarkStatus(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [behaviorTypeId]: null
          }
        }));
      }, 2000);
    }
  };

  // Handle clear mark
  const handleClearMark = async (studentId, behaviorTypeId) => {
    if (!hasChangePermission && !hasDeletePermission) {
      showToast('নম্বর মুছে ফেলার অনুমতি নেই।', 'error');
      return;
    }

    const markKey = `${studentId}-${behaviorTypeId}`;
    setClearedMarks(prev => new Set([...prev, markKey]));
    setBehaviorReports(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [behaviorTypeId]: ''
      }
    }));
    setMarkStatus(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [behaviorTypeId]: 'loading'
      }
    }));
    setInvalidMarks(prev => ({
      ...prev,
      [`${studentId}-${behaviorTypeId}`]: ''
    }));

    try {
      const allBehaviorMarks = [];
      const studentReportsData = behaviorReports[studentId] || {};

      activeBehaviorTypes.forEach(bt => {
        if (bt.id === behaviorTypeId) {
          return;
        }

        const fieldValue = studentReportsData[bt.id];
        if (fieldValue !== '' && fieldValue !== null && fieldValue !== undefined) {
          const parsedValue = parseFloat(fieldValue);
          if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= bt.obtain_mark) {
            allBehaviorMarks.push({
              student_id: parseInt(studentId),
              behavior_type: parseInt(bt.id),
              mark: parsedValue
            });
          }
        }
      });

      const reportData = {
        exam_name_id: parseInt(selectedExam),
        academic_year: selectedAcademicYear ? parseInt(selectedAcademicYear) : null,
        student_id: parseInt(studentId),
        behavior_marks: allBehaviorMarks
      };

      await createBehaviorReport(reportData).unwrap();

      setMarkStatus(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [behaviorTypeId]: 'success'
        }
      }));

      showToast('নম্বর সফলভাবে মুছে ফেলা হয়েছে!', 'success');

      setTimeout(() => {
        setMarkStatus(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [behaviorTypeId]: null
          }
        }));
      }, 2000);

    } catch (error) {
      console.error('Failed to clear behavior mark:', error);
      setMarkStatus(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [behaviorTypeId]: 'success'
        }
      }));
      showToast('নম্বর UI থেকে মুছে ফেলা হয়েছে!', 'success');
      setTimeout(() => {
        setMarkStatus(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [behaviorTypeId]: null
          }
        }));
      }, 2000);
    }
  };

  const handleKeyDown = (e, studentId, behaviorTypeId, studentIndex, behaviorIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = behaviorReports[studentId]?.[behaviorTypeId] || '';

      let nextInputId = null;
      if (behaviorIndex + 1 < activeBehaviorTypes.length) {
        const nextBehaviorTypeId = activeBehaviorTypes[behaviorIndex + 1].id;
        nextInputId = `mark-${studentId}-${nextBehaviorTypeId}`;
      } else if (studentIndex + 1 < students.length) {
        const nextStudentId = students[studentIndex + 1].id;
        const firstBehaviorTypeId = activeBehaviorTypes[0].id;
        nextInputId = `mark-${nextStudentId}-${firstBehaviorTypeId}`;
      }

      handleMarkSubmit(studentId, behaviorTypeId, value, nextInputId);
    }
  };

  // Generate PDF Report
  const generateBehaviorReport = () => {
    if (!hasViewPermission) {
      showToast('আচরণ প্রতিবেদন দেখার অনুমতি নেই।', 'error');
      return;
    }

    if (!selectedClass || !selectedExam) {
      showToast('প্রতিবেদন তৈরির জন্য শ্রেণী এবং পরীক্ষা নির্বাচন করুন।', 'warning');
      return;
    }

    if (!students || students.length === 0) {
      showToast('নির্বাচিত শ্রেণীতে কোনো ছাত্র পাওয়া যায়নি।', 'warning');
      return;
    }

    if (!activeBehaviorTypes || activeBehaviorTypes.length === 0) {
      showToast('কোনো সক্রিয় আচরণ ধরন পাওয়া যায়নি।', 'warning');
      return;
    }

    if (instituteLoading) {
      showToast('ইনস্টিটিউট তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন!', 'warning');
      return;
    }

    if (!institute) {
      showToast('ইনস্টিটিউট তথ্য পাওয়া যায়নি!', 'error');
      return;
    }

    const classInfo = classes?.find(cls => cls.id === parseInt(selectedClass));
    const examInfo = exams?.find(exam => exam.id === parseInt(selectedExam));
    const academicYearInfo = academicYears?.find(year => year.id === parseInt(selectedAcademicYear));

    const classInfoText = classInfo ? `${classInfo.class_name} ${classInfo.shift_name} ${classInfo.section_name}` : 'অজানা শ্রেণী';
    const examInfoText = examInfo ? examInfo.name : 'অজানা পরীক্ষা';
    const academicYearInfoText = academicYearInfo ? academicYearInfo.name : null;

    // Calculate summary statistics
    let totalMarksGiven = 0;
    students.forEach(student => {
      activeBehaviorTypes.forEach(bt => {
        const mark = behaviorReports[student.id]?.[bt.id];
        if (mark && mark !== '' && !isNaN(parseFloat(mark))) totalMarksGiven++;
      });
    });
    const averageMarksPercentage = students.length > 0 && activeBehaviorTypes.length > 0 ?
      (totalMarksGiven / (students.length * activeBehaviorTypes.length)) * 100 : 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>আচরণ নম্বর প্রতিবেদন</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body {
            font-family: 'Noto Sans Bengali', Arial, sans-serif;
            font-size: 9px;
            margin: 20px 20px;
            padding: 0;
            color: #000;
          }
          .header {
            text-align: center;
            // margin-bottom: 10px;
            // border-bottom: 1px solid #000;
            // padding-bottom: 4px;
          }
          .header h1 {
            font-size: 16px;
            margin: 0;
          }
          .header p {
            font-size: 9px;
            margin: 2px 0;
          }
          .logo-placeholder {
            text-align: center;
            margin-bottom: 6px;
          }
          .class-details {
            text-align: center;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .class-details p {
            margin: 2px 0;
          }
          .table-container {
            width: 100%;
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            border: 1px solid #000;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
          }
          th {
            font-weight: bold;
          }
          // .check-mark::before { content: '✓'; color: #000; font-weight: bold; }
          // .cross-mark::before { content: '✗'; color: #000; font-weight: bold; }
          .summary {
            margin-top: 10px;
            padding: 8px;
            // border: 1px solid #000;
          }
          .summary p {
            margin: 2px 0;
            font-weight: bold;
          }
          .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 8px;
            // border-top: 1px solid #000;
            padding-top: 6px;
          }
          .footer p {
            margin: 2px 0;
          }
          .title {
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            margin-top: 6px;
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-placeholder"></div>
          <h1>${institute.institute_name || 'আদর্শ মাদ্রাসা'}</h1>
          <p>${institute.institute_address || 'ঢাকা, বাংলাদেশ'}</p>
        </div>

        <h1 class='title'>আচরণ নম্বর প্রতিবেদন</h1>

        <div class="class-details">
          <p><strong>শ্রেণী:</strong> ${classInfoText}</p>
          <p><strong>পরীক্ষা:</strong> ${examInfoText}</p>
          ${academicYearInfoText ? `<p><strong>শিক্ষাবর্ষ:</strong> ${academicYearInfoText}</p>` : ''}
          <p><strong>প্রস্তুতির তারিখ:</strong> ${new Date().toLocaleDateString('bn')}</p>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ক্রমিক নং</th>
                <th>ছাত্রের নাম</th>
                <th>রোল</th>
                ${activeBehaviorTypes.map(bt => `<th>${bt.name} (${bt.obtain_mark})</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${students.map((student, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${student.name}</td>
                  <td>${student.roll_no || '-'}</td>
                  ${activeBehaviorTypes.map(bt => {
      const mark = behaviorReports[student.id]?.[bt.id] || '';
      const isValidMark = mark !== '' && !isNaN(parseFloat(mark)) && parseFloat(mark) <= bt.obtain_mark && parseFloat(mark) >= 0;
      return `<td class="${isValidMark ? 'check-mark' : 'cross-mark'}">${mark || '-'}</td>`;
    }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="summary">
          <p><strong>মোট ছাত্র:</strong> ${students.length}</p>
          <p><strong>মোট আচরণ ধরন:</strong> ${activeBehaviorTypes.length}</p>
          <p><strong>নম্বর প্রদানের হার (%):</strong> ${averageMarksPercentage.toFixed(2)}%</p>
        </div>

        <div class="footer">
          <p>প্রধান শিক্ষকের স্বাক্ষর: ____________________</p>
          <p>মুফতির স্বাক্ষর: ____________________</p>
          <p>তারিখ: ${new Date().toLocaleDateString('bn')}</p>
        </div>

        <script>
          let printAttempted = false;
          window.onbeforeprint = () => { printAttempted = true; };
          window.onafterprint = () => { window.close(); };
          window.addEventListener('beforeunload', (event) => {
            if (!printAttempted) { window.close(); }
          });
          window.print();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open(' ', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast('আচরণ প্রতিবেদন তৈরি হয়েছে! প্রিন্ট বা সেভ করুন।', 'success');
  };

  if (classesLoading || examsLoading || studentsLoading || behaviorTypesLoading ||
    reportsLoading || academicYearsLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl border border-blue-200 animate-fadeIn">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
          <span className="text-xl font-semibold text-blue-800">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center animate-fadeIn">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-700 text-lg font-medium">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</p>
        </div>
      </div>
    );
  }

  // React Select options
  const academicYearOptions = academicYears?.map(year => ({
    value: year.id,
    label: year.name
  })) || [];

  const classOptions = classes?.map(cls => ({
    value: cls.id,
    label: `${cls.class_name} ${cls.shift_name} ${cls.section_name}`
  })) || [];

  const examOptions = exams?.map(exam => ({
    value: exam.id,
    label: exam.name
  })) || [];

  return (
    <div className="min-h-screen mt-5">
      <div className="mx-auto">
        <style>
          {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.5s ease-out forwards;
          }
          .animate-slideIn {
            animation: slideIn 0.6s ease-out forwards;
          }
          .glass-effect {
            background: rgba(0, 0, 0, 0.10);
            backdrop-filter: blur(2px);
            border: 1px solid rgba(255, 255, 255, 0.18);
          }
          .input-field {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .input-field:focus {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }
          .status-indicator {
            position: absolute;
            top: 50%;
            right: -32px;
            transform: translateY(-50%);
            transition: all 0.3s ease;
          }
          .clear-button {
            position: absolute;
            top: 50%;
            right: 6px;
            transform: translateY(-50%);

            opacity: 0;
            visibility: hidden;
          }
          .input-container:hover .clear-button {
            opacity: 1;
            visibility: visible;
          }
          .table-row:hover {
            background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%);
          }
          .gradient-border {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 1px;
            border-radius: 12px;
          }
          .toast-enter {
            animation: slideIn 0.5s ease-out;
          }
        `}
        </style>

        {/* Toast Message */}
        {toastMessage && (
          <div className={`fixed top-6 right-6 p-4 rounded-xl shadow-2xl z-50 toast-enter ${toastType === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
            toastType === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
              'bg-gradient-to-r from-red-500 to-pink-600 text-white'
            }`}>
            <div className="flex items-center gap-3">
              {toastType === 'success' && <IoCheckmarkCircle className="text-xl" />}
              {toastType === 'warning' && <FaExclamationTriangle className="text-xl" />}
              {toastType === 'error' && <IoCloseCircle className="text-xl" />}
              <span className="font-medium">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="glass-effect rounded-3xl p-8 mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-[#441a05] rounded-2xl">
              <FaGraduationCap className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-[#441a05] bg-clip-text text-transparent">
                আচরণ নম্বর যোগ করুন
              </h1>
              <p className="text-[#441a05] mt-1">ছাত্রদের আচরণ মূল্যায়ন করুন</p>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Academic Year */}
            <div className="animate-slideIn" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-semibold text-[#441a05] mb-1">একাডেমিক বছর</label>
              <div className="">
                <Select
                  options={academicYearOptions}
                  value={academicYearOptions.find(option => option.value === selectedAcademicYear) || null}
                  onChange={(option) => setSelectedAcademicYear(option ? option.value : '')}
                  placeholder="একাডেমিক বছর"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                  menuPosition="fixed"
                />
              </div>
            </div>

            {/* Class */}
            <div className="animate-slideIn" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-semibold text-[#441a05] mb-1">শ্রেণী</label>
              <div className="">
                <Select
                  options={classOptions}
                  value={classOptions.find(option => option.value === selectedClass) || null}
                  onChange={(option) => setSelectedClass(option ? option.value : '')}
                  placeholder="শ্রেণী নির্বাচন করুন"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                  menuPosition="fixed"
                />
              </div>
            </div>

            {/* Exam */}
            <div className="animate-slideIn" style={{ animationDelay: '0.3s' }}>
              <label className="block text-sm font-semibold text-[#441a05] mb-1">পরীক্ষা</label>
              <div className="">
                <Select
                  options={examOptions}
                  value={examOptions.find(option => option.value === selectedExam) || null}
                  onChange={(option) => setSelectedExam(option ? option.value : '')}
                  placeholder="পরীক্ষা নির্বাচন করুন"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                  menuPosition="fixed"
                  isClearable
                  isDisabled={!selectedClass}
                />
              </div>
            </div>

            {/* Stats and PDF Button */}
            <div className="animate-slideIn" style={{ animationDelay: '0.4s' }}>
              <div className="p-4 rounded-xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-[#441a05]">পরিসংখ্যান</h3>
                  {selectedClass && selectedExam && students && students.length > 0 && activeBehaviorTypes.length > 0 && (
                    <button
                      onClick={generateBehaviorReport}
                      className="flex items-center gap-2 px-3 py-2 bg-[#441a05] text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-sm font-medium"
                      title="আচরণ প্রতিবেদন ডাউনলোড করুন"
                    >
                      <FaDownload className="text-sm" />
                      <span>প্রতিবেদন</span>
                    </button>
                  )}
                </div>
                <div className='flex justify-between gap-5 flex-nowrap'>
                  {students && (
                    <p className="text-[#441a05] font-bold text-sm">মোট ছাত্র: {students.length}</p>
                  )}
                  {activeBehaviorTypes.length > 0 && (
                    <p className="text-[#441a05] font-bold text-sm">আচরণ ধরন: {activeBehaviorTypes.length}</p>
                  )}
                  {selectedAcademicYear && (
                    <p className="text-[#441a05] font-bold text-sm">
                      ফিল্টার: {academicYears?.find(year => year.id === parseInt(selectedAcademicYear))?.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        {selectedClass && selectedExam && selectedAcademicYear && students && activeBehaviorTypes.length > 0 && (
          <div className="glass-effect rounded-3xl shadow-2xl animate-scaleIn overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#441a05] mb-2">আচরণ নম্বর প্রবেশ করুন</h3>
              <p className="text-[#441a05]">
                Enter বা Tab দাবলে পরের ফিল্ডে যাবে এবং নম্বর সংরক্ষিত হবে। খালি রেখে গেলে নম্বর মুছে যাবে।
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#441a05]/10">
                  <tr>
                    <th className="p-4 text-left font-bold text-[#441a05] border-b border-gray-200">ছাত্রের নাম</th>
                    <th className="p-4 text-left font-bold text-[#441a05] border-b border-gray-200">রোল নং</th>
                    {activeBehaviorTypes.map(bt => (
                      <th key={bt.id} className="p-4 text-center font-bold text-[#441a05] border-b border-gray-200 min-w-[180px]">
                        <div>
                          <div className="text-sm">{bt.name}</div>
                          <div className="text-xs text-[#441a05] mt-1 font-normal">
                            পূর্ণমান: {bt.obtain_mark}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, studentIndex) => (
                    <tr key={student.id} className="table-row border-b border-gray-100 transition-all duration-300">
                      <td className="p-4 font-semibold text-[#441a05] text-sm">{student.name}</td>
                      <td className="p-4 text-gray-600">{student.roll_no}</td>
                      {activeBehaviorTypes.map((bt, behaviorIndex) => {
                        const inputId = `mark-${student.id}-${bt.id}`;
                        const currentValue = behaviorReports[student.id]?.[bt.id] || '';
                        const isInvalid = invalidMarks[`${student.id}-${bt.id}`];
                        const currentMarkStatus = markStatus[student.id]?.[bt.id];

                        return (
                          <td key={bt.id} className="p-4">
                            <div className="flex items-center justify-center">
                              <div className="relative input-container group">
                                <input
                                  id={inputId}
                                  type="text"
                                  inputMode="decimal"
                                  value={currentValue}
                                  onChange={(e) => handleMarkChange(student.id, bt.id, e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, student.id, bt.id, studentIndex, behaviorIndex)}
                                  onBlur={(e) => handleMarkSubmit(student.id, bt.id, e.target.value)}
                                  disabled={!hasAddPermission && !hasChangePermission}
                                  className={`w-24 p-3 pr-10 text-center border-2 outline-none rounded-xl bg-transparent input-field font-medium transition-all duration-300 ${isInvalid ? 'border-red-400 bg-red-50 text-red-700 shadow-red-200' :
                                    currentMarkStatus === 'success' ? 'border-green-400 bg-green-50 text-green-700 shadow-green-200' :
                                      currentMarkStatus === 'error' ? 'border-red-400 bg-red-50 text-red-700 shadow-red-200' :
                                        currentMarkStatus === 'loading' ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-blue-200' :
                                          'border-gray-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:bg-blue-50'
                                    } disabled:bg-gray-100 disabled:cursor-not-allowed shadow-lg`}
                                  placeholder="0"
                                  autoComplete="off"
                                />

                                {/* Status Indicators */}
                                <div className="status-indicator">
                                  {currentMarkStatus === 'loading' && (
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                      <FaSpinner className="text-white text-xs animate-spin" />
                                    </div>
                                  )}
                                  {currentMarkStatus === 'success' && (
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-scaleIn">
                                      <FaCheck className="text-white text-xs" />
                                    </div>
                                  )}
                                  {currentMarkStatus === 'error' && (
                                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-scaleIn">
                                      <FaExclamationTriangle className="text-white text-xs" />
                                    </div>
                                  )}
                                </div>

                                {/* Clear Button */}
                                {currentValue && currentValue !== '' && (hasChangePermission || hasDeletePermission) && (
                                  <button
                                    onClick={() => handleClearMark(student.id, bt.id)}
                                    className="clear-button w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full flex items-center justify-center shadow-lg transform transition-all duration-200"
                                    title="নম্বর মুছে ফেলুন"
                                    type="button"
                                  >
                                    <FaTimes className="text-xs" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {isInvalid && (
                              <p className="text-red-500 text-xs mt-2 text-center animate-fadeIn font-medium">
                                {isInvalid}
                              </p>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State - Academic Year Required */}
        {(!selectedClass || !selectedExam || !selectedAcademicYear) && (
          <div className="glass-effect rounded-3xl p-12 text-center animate-fadeIn shadow-xl">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoAddCircle className="text-4xl text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">আচরণ নম্বর যোগ করতে শুরু করুন</h3>
            <p className="text-gray-600 text-lg">
              একাডেমিক বছর, শ্রেণী এবং পরীক্ষা নির্বাচন করুন
            </p>
          </div>
        )}

        {/* No Students State */}
        {selectedClass && selectedExam && selectedAcademicYear && students && students.length === 0 && (
          <div className="glass-effect rounded-3xl p-12 text-center animate-fadeIn shadow-xl">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-4xl text-yellow-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">কোনো ছাত্র পাওয়া যায়নি</h3>
            <p className="text-gray-600 text-lg">
              নির্বাচিত একাডেমিক বছর এবং শ্রেণীতে কোনো সক্রিয় ছাত্র নেই
            </p>
          </div>
        )}

        {/* No Behavior Types State */}
        {selectedClass && selectedExam && selectedAcademicYear && students && students.length > 0 && activeBehaviorTypes.length === 0 && (
          <div className="glass-effect rounded-3xl p-12 text-center animate-fadeIn shadow-xl">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-4xl text-red-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">কোনো আচরণ ধরন পাওয়া যায়নি</h3>
            <p className="text-gray-600 text-lg">
              কোনো সক্রিয় আচরণ ধরন কনফিগার করা হয়নি
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBehaviorMarks;