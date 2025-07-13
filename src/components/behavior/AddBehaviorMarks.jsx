import React, { useState, useEffect } from 'react';
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
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';

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

// PDF styles for behavior marks report
const reportStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSansBengali',
    fontSize: 10,
    color: '#222',
    backgroundColor: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#441a05',
    paddingBottom: 15,
  },
  schoolName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#441a05',
    marginBottom: 5,
  },
  headerText: {
    fontSize: 12,
    marginBottom: 3,
    color: '#666',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#441a05',
    textDecoration: 'underline',
  },
  classInfo: {
    marginVertical: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 100,
    color: '#555',
  },
  infoValue: {
    fontSize: 11,
    flex: 1,
    color: '#333',
  },
  table: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#441a05',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#441a05',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 9,
    padding: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    minHeight: 30,
  },
  tableRowAlternate: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    padding: 6,
    fontSize: 8,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentNameCell: {
    width: 80,
    textAlign: 'left',
    paddingLeft: 8,
  },
  rollCell: {
    width: 40,
  },
  behaviorCell: {
    flex: 1,
    minWidth: 50,
  },
  summary: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#441a05',
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#441a05',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#555',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#666',
  },
});

// Behavior Marks Report PDF Component
const BehaviorMarksReportPDF = ({ 
  students, 
  behaviorTypes, 
  behaviorReports, 
  classInfo, 
  examInfo, 
  academicYearInfo,
  institute
}) => {
  
  
  // Calculate summary statistics
  const calculateSummary = () => {
    let totalStudents = students.length;
    let studentsWithMarks = 0;
    let totalMarksGiven = 0;
    let averageMarksByBehavior = {};

    // Initialize behavior averages
    behaviorTypes.forEach(bt => {
      averageMarksByBehavior[bt.id] = { total: 0, count: 0, name: bt.name };
    });

    students.forEach(student => {
      let studentHasMarks = false;
      behaviorTypes.forEach(bt => {
        const mark = behaviorReports[student.id]?.[bt.id];
        if (mark && mark !== '') {
          const numericMark = parseFloat(mark);
          if (!isNaN(numericMark)) {
            averageMarksByBehavior[bt.id].total += numericMark;
            averageMarksByBehavior[bt.id].count += 1;
            totalMarksGiven += 1;
            studentHasMarks = true;
          }
        }
      });
      if (studentHasMarks) studentsWithMarks += 1;
    });

    // Calculate averages
    Object.keys(averageMarksByBehavior).forEach(btId => {
      const data = averageMarksByBehavior[btId];
      data.average = data.count > 0 ? (data.total / data.count).toFixed(2) : '0.00';
    });

    return {
      totalStudents,
      studentsWithMarks,
      totalMarksGiven,
      averageMarksByBehavior
    };
  };

  const summary = calculateSummary();

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={reportStyles.page}>
        {/* Header */}
        <View style={reportStyles.header}>
          <Text style={reportStyles.schoolName}>{institute.institute_name}</Text>
          <Text style={reportStyles.headerText}>{institute.address}</Text>
          <Text style={reportStyles.headerText}>{institute?.institute_email_address} | {institute?.headmaster_mobile}</Text>
          <Text style={reportStyles.reportTitle}>আচরণ নম্বর প্রতিবেদন</Text>
        </View>

        {/* Class Information */}
        <View style={reportStyles.classInfo}>
          <View style={reportStyles.infoRow}>
            <Text style={reportStyles.infoLabel}>শ্রেণী:</Text>
            <Text style={reportStyles.infoValue}>{classInfo}</Text>
          </View>
          <View style={reportStyles.infoRow}>
            <Text style={reportStyles.infoLabel}>পরীক্ষা:</Text>
            <Text style={reportStyles.infoValue}>{examInfo}</Text>
          </View>
          {academicYearInfo && (
            <View style={reportStyles.infoRow}>
              <Text style={reportStyles.infoLabel}>শিক্ষাবর্ষ:</Text>
              <Text style={reportStyles.infoValue}>{academicYearInfo}</Text>
            </View>
          )}
          <View style={reportStyles.infoRow}>
            <Text style={reportStyles.infoLabel}>প্রস্তুতির তারিখ:</Text>
            <Text style={reportStyles.infoValue}>
              {new Date().toLocaleDateString('bn-BD', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        {/* Marks Table */}
        <View style={reportStyles.table}>
          {/* Header Row */}
          <View style={reportStyles.tableHeader}>
            <Text style={[reportStyles.tableCell, reportStyles.studentNameCell]}>ছাত্রের নাম</Text>
            <Text style={[reportStyles.tableCell, reportStyles.rollCell]}>রোল</Text>
            {behaviorTypes.map(bt => (
              <Text key={bt.id} style={[reportStyles.tableCell, reportStyles.behaviorCell]}>
                {bt.name} ({bt.obtain_mark})
              </Text>
            ))}
          </View>

          {/* Student Rows */}
          {students.map((student, index) => (
            <View key={student.id} style={[reportStyles.tableRow, index % 2 === 1 && reportStyles.tableRowAlternate]}>
              <Text style={[reportStyles.tableCell, reportStyles.studentNameCell]}>{student.name}</Text>
              <Text style={[reportStyles.tableCell, reportStyles.rollCell]}>{student.roll_no || '-'}</Text>
              {behaviorTypes.map(bt => {
                const mark = behaviorReports[student.id]?.[bt.id] || '-';
                return (
                  <Text key={bt.id} style={[reportStyles.tableCell, reportStyles.behaviorCell]}>
                    {mark === '' ? '-' : mark}
                  </Text>
                );
              })}
            </View>
          ))}
        </View>

        {/* Summary */}
      

        {/* Footer */}
        <View style={reportStyles.footer} fixed>
          <Text style={reportStyles.footerText}>
            এই প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।
          </Text>
          <Text style={reportStyles.footerText}>
            মুদ্রণ তারিখ: {new Date().toLocaleDateString('bn-BD')} {new Date().toLocaleTimeString('bn-BD')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

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
  const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();
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
    
    // Filter students whose admission_year_id matches the selected academic year
    return allStudents.filter(student => 
      student.admission_year_id === parseInt(selectedAcademicYear)
    );
  }, [allStudents, selectedAcademicYear]);

  console.log("allStudents", allStudents);
  console.log("selectedAcademicYear", selectedAcademicYear);
  console.log("filtered students", students);

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
    setClearedMarks(new Set()); // Clear the cleared marks tracking
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
              
              // Create unique key for this mark
              const markKey = `${mark.student_id}-${mark.behavior_type}`;
              
              // SKIP loading if this mark was manually cleared by user
              if (clearedMarks.has(markKey)) {
                return; // Don't reload cleared marks
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

    // Allow empty string, numbers, and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      // If user starts typing, remove from cleared marks tracking
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

      // Clear current status when user modifies
      setMarkStatus(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [behaviorTypeId]: null
        }
      }));

      // Real-time validation
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
    
    // Check if value hasn't changed
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

    // Validate non-empty values
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

    // Collect all behavior marks for this student
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
      
      // Mark all relevant fields as success
      setMarkStatus(prev => {
        const updatedStudentMarks = { ...prev[studentId] };
        activeBehaviorTypes.forEach(bt => {
          if (allBehaviorMarks.some(bm => bm.behavior_type === bt.id)) {
            updatedStudentMarks[bt.id] = 'success';
          } else if (bt.id === behaviorTypeId && (value === '' || value === null || value === undefined)) {
            updatedStudentMarks[bt.id] = 'success';
          } else {
            if(updatedStudentMarks[bt.id] !== 'success') {
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

      // Revert to previous value on error
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

  // Handle clear mark - FINAL FIXED VERSION
  const handleClearMark = async (studentId, behaviorTypeId) => {
    if (!hasChangePermission && !hasDeletePermission) {
      showToast('নম্বর মুছে ফেলার অনুমতি নেই।', 'error');
      return;
    }

    // Create unique key for this mark
    const markKey = `${studentId}-${behaviorTypeId}`;

    // Step 1: Add to cleared marks tracking (prevents reloading)
    setClearedMarks(prev => new Set([...prev, markKey]));

    // Step 2: Immediately clear the UI
    setBehaviorReports(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [behaviorTypeId]: '' // Clear immediately
      }
    }));

    // Step 3: Set loading status
    setMarkStatus(prev => ({ 
      ...prev, 
      [studentId]: {
        ...prev[studentId],
        [behaviorTypeId]: 'loading'
      }
    }));

    // Step 4: Clear any validation errors
    setInvalidMarks(prev => ({
      ...prev,
      [`${studentId}-${behaviorTypeId}`]: ''
    }));

    // Step 5: Send to backend - collect OTHER marks (excluding the cleared one)
    try {
      const allBehaviorMarks = [];
      const studentReportsData = behaviorReports[studentId] || {};
      
      activeBehaviorTypes.forEach(bt => {
        // Skip the behavior type we're clearing
        if (bt.id === behaviorTypeId) {
          return; // Don't include this in the submission
        }
        
        // For other behavior types, include them if they have values
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

      // Step 6: Send the updated data (without the cleared mark)
      const reportData = {
        exam_name_id: parseInt(selectedExam),
        academic_year: selectedAcademicYear ? parseInt(selectedAcademicYear) : null,
        student_id: parseInt(studentId),
        behavior_marks: allBehaviorMarks // This excludes the cleared mark
      };

      await createBehaviorReport(reportData).unwrap();
      
      // Step 7: Mark as successfully cleared
      setMarkStatus(prev => ({ 
        ...prev, 
        [studentId]: {
          ...prev[studentId],
          [behaviorTypeId]: 'success'
        }
      }));
      
      showToast('নম্বর সফলভাবে মুছে ফেলা হয়েছে!', 'success');
      
      // Step 8: Clear the status after 2 seconds but keep in clearedMarks
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
      
      // Even on error, keep it cleared in UI and tracking
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
  const generateBehaviorReport = async () => {
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

    try {
      // Get class, exam, and academic year info
      const classInfo = classes?.find(cls => cls.id === parseInt(selectedClass));
      const examInfo = exams?.find(exam => exam.id === parseInt(selectedExam));
      const academicYearInfo = academicYears?.find(year => year.id === parseInt(selectedAcademicYear));

      const classInfoText = classInfo ? `${classInfo.class_name} ${classInfo.shift_name} ${classInfo.section_name}` : 'অজানা শ্রেণী';
      const examInfoText = examInfo ? examInfo.name : 'অজানা পরীক্ষা';
      const academicYearInfoText = academicYearInfo ? academicYearInfo.name : null;

      const doc = <BehaviorMarksReportPDF
        students={students}
        behaviorTypes={activeBehaviorTypes}
        behaviorReports={behaviorReports}
        classInfo={classInfoText}
        examInfo={examInfoText}
        academicYearInfo={academicYearInfoText}
        institute={institute}
      />;

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `আচরণ_প্রতিবেদন_${classInfoText}_${examInfoText}_${new Date().toLocaleDateString('bn-BD')}.pdf`;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      
      showToast('আচরণ প্রতিবেদন সফলভাবে ডাউনলোড হয়েছে!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast(`প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`, 'error');
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
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
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.18);
          }
          .input-field {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .input-field:focus {
            transform: translateY(-2px);
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
            transition: all 0.3s ease;
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
          <div className={`fixed top-6 right-6 p-4 rounded-xl shadow-2xl z-50 toast-enter ${
            toastType === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
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
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <FaGraduationCap className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                আচরণ নম্বর যোগ করুন
              </h1>
              <p className="text-gray-600 mt-1">ছাত্রদের আচরণ মূল্যায়ন করুন</p>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Academic Year */}
            <div className="animate-slideIn" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-semibold text-gray-700 mb-3">একাডেমিক বছর</label>
              <div className="gradient-border">
                <select 
                  value={selectedAcademicYear} 
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  className="w-full p-4 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                >
                  <option value="">একাডেমিক বছর নির্বাচন করুন</option>
                  {academicYears?.map(year => (
                    <option key={year.id} value={year.id}>{year.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Class */}
            <div className="animate-slideIn" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-semibold text-gray-700 mb-3">শ্রেণী</label>
              <div className="gradient-border">
                <select 
                  value={selectedClass} 
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-4 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300"
                >
                  <option value="">শ্রেণী নির্বাচন করুন</option>
                  {classes?.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name} {cls.shift_name} {cls.section_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exam */}
            <div className="animate-slideIn" style={{ animationDelay: '0.3s' }}>
              <label className="block text-sm font-semibold text-gray-700 mb-3">পরীক্ষা</label>
              <div className="gradient-border">
                <select 
                  value={selectedExam} 
                  onChange={(e) => setSelectedExam(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full p-4 bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">পরীক্ষা নির্বাচন করুন</option>
                  {exams?.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats and PDF Button */}
            <div className="animate-slideIn" style={{ animationDelay: '0.4s' }}>
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">পরিসংখ্যান</h3>
                  {/* PDF Download Button */}
                  {selectedClass && selectedExam && students && students.length > 0 && activeBehaviorTypes.length > 0 && (
                    <button
                      onClick={generateBehaviorReport}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-sm font-medium"
                      title="আচরণ প্রতিবেদন ডাউনলোড করুন"
                    >
                      <FaDownload className="text-sm" />
                      <span>প্রতিবেদন</span>
                    </button>
                  )}
                </div>
                {students && (
                  <p className="text-blue-600 font-bold text-sm">মোট ছাত্র: {students.length}</p>
                )}
                {activeBehaviorTypes.length > 0 && (
                  <p className="text-purple-600 font-bold text-sm">আচরণ ধরন: {activeBehaviorTypes.length}</p>
                )}
                {selectedAcademicYear && (
                  <p className="text-orange-600 font-bold text-sm">
                    ফিল্টার: {academicYears?.find(year => year.id === parseInt(selectedAcademicYear))?.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        {selectedClass && selectedExam && selectedAcademicYear && students && activeBehaviorTypes.length > 0 && (
          <div className="glass-effect rounded-3xl shadow-2xl animate-scaleIn overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <h3 className="text-xl font-bold text-white mb-2">আচরণ নম্বর প্রবেশ করুন</h3>
              <p className="text-blue-100">
                Enter বা Tab দাবলে পরের ফিল্ডে যাবে এবং নম্বর সংরক্ষিত হবে। খালি রেখে গেলে নম্বর মুছে যাবে।
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="p-4 text-left font-bold text-gray-700 border-b border-gray-200">ছাত্রের নাম</th>
                    <th className="p-4 text-left font-bold text-gray-700 border-b border-gray-200">রোল নং</th>
                    {activeBehaviorTypes.map(bt => (
                      <th key={bt.id} className="p-4 text-center font-bold text-gray-700 border-b border-gray-200 min-w-[180px]">
                        <div>
                          <div className="text-sm">{bt.name}</div>
                          <div className="text-xs text-gray-500 mt-1 font-normal">
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
                      <td className="p-4 font-semibold text-gray-800">{student.name}</td>
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
                                  className={`w-24 p-3 pr-10 text-center border-2 rounded-xl input-field font-medium transition-all duration-300 ${
                                    isInvalid ? 'border-red-400 bg-red-50 text-red-700 shadow-red-200' : 
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
                                
                                {/* Clear Button - Enhanced Design */}
                                {currentValue && currentValue !== '' && (hasChangePermission || hasDeletePermission) && (
                                  <button
                                    onClick={() => handleClearMark(student.id, bt.id)}
                                    className="clear-button w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-200"
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