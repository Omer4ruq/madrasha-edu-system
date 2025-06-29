import React, { useState, useEffect } from 'react';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetBehaviorTypeApiQuery } from '../../redux/features/api/behavior/behaviorTypeApi';
import { useCreateBehaviorReportApiMutation, useGetBehaviorReportApiQuery } from '../../redux/features/api/behavior/behaviorReportApi';

// {cls.class_name} {cls.shift_name}

const AddBehaviorMarks = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [behaviorReports, setBehaviorReports] = useState({});
  const [invalidMarks, setInvalidMarks] = useState({}); // Track invalid inputs
  const [savedMarks, setSavedMarks] = useState({}); // Track successfully saved marks
  const [toastMessage, setToastMessage] = useState(''); // Toast message for invalid submission

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
  // Fetch exams
  const { data: exams, isLoading: examsLoading } = useGetExamApiQuery();
  // Fetch students based on selected class
  const { data: students, isLoading: studentsLoading } = useGetStudentActiveByClassQuery(selectedClass, { skip: !selectedClass });
  // Fetch behavior types
  const { data: behaviorTypes, isLoading: behaviorTypesLoading } = useGetBehaviorTypeApiQuery();
  // Fetch all behavior reports
  const { data: existingReports, isLoading: reportsLoading } = useGetBehaviorReportApiQuery();
  // Mutation for creating/updating behavior reports
  const [createBehaviorReport] = useCreateBehaviorReportApiMutation();

  // Filter active behavior types
  const activeBehaviorTypes = behaviorTypes?.filter(bt => bt.is_active) || [];

  // Initialize behavior reports state when students or behavior types change
  useEffect(() => {
    if (students && activeBehaviorTypes.length > 0) {
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
    }
  }, [students, activeBehaviorTypes]);

  // Update behavior reports with existing data
  useEffect(() => {
    if (existingReports && students && activeBehaviorTypes.length > 0 && selectedExam) {
      const updatedReports = { ...behaviorReports };
      const updatedSavedMarks = { ...savedMarks };
      existingReports.forEach(report => {
        // Filter by selected exam
        if (report.exam_name_id === parseInt(selectedExam)) {
          report.behavior_marks.forEach(mark => {
            // Ensure student is in the selected class
            if (students.some(student => student.id === mark.student_id)) {
              if (updatedReports[mark.student_id]) {
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
  }, [existingReports, students, activeBehaviorTypes, selectedExam]);

  // Handle mark input change
  const handleMarkChange = (studentId, behaviorTypeId, value) => {
    const behaviorType = activeBehaviorTypes.find(bt => bt.id === behaviorTypeId);
    const mark = parseFloat(value);
    const isInvalid = !isNaN(mark) && (mark < 0 || mark > behaviorType.obtain_mark);

    // Update invalid marks state
    setInvalidMarks(prev => ({
      ...prev,
      [`${studentId}-${behaviorTypeId}`]: isInvalid ? `Mark must be between 0 and ${behaviorType.obtain_mark}` : ''
    }));

    // Update behavior reports state
    setBehaviorReports(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [behaviorTypeId]: value
      }
    }));
  };

  // Handle mark submission
  const handleMarkSubmit = async (studentId, behaviorTypeId, value, nextInputId) => {
    const behaviorType = activeBehaviorTypes.find(bt => bt.id === behaviorTypeId);
    const mark = parseFloat(value);

    if (isNaN(mark) || mark < 0 || mark > behaviorType.obtain_mark) {
      if (value !== '') {
        // Show toast message for invalid submission
        setToastMessage(`Invalid mark! Must be between 0 and ${behaviorType.obtain_mark}.`);
        setTimeout(() => setToastMessage(''), 3000); // Clear toast after 3 seconds
        // Revert to previous valid value or empty string
        setBehaviorReports(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [behaviorTypeId]: prev[studentId][behaviorTypeId] || ''
          }
        }));
        // Clear invalid marks message
        setInvalidMarks(prev => ({
          ...prev,
          [`${studentId}-${behaviorTypeId}`]: ''
        }));
      }
      return;
    }

    // Collect all valid marks for this student for the selected exam
    const behaviorMarks = [];
    activeBehaviorTypes.forEach(bt => {
      const markValue = parseFloat(behaviorReports[studentId][bt.id]);
      // Include marks that are valid and either saved or currently being submitted
      if (
        (bt.id === behaviorTypeId && !isNaN(mark) && mark >= 0 && mark <= bt.obtain_mark) ||
        (savedMarks[studentId][bt.id] && !isNaN(markValue) && markValue >= 0 && markValue <= bt.obtain_mark)
      ) {
        behaviorMarks.push({
          student_id: parseInt(studentId),
          behavior_type: parseInt(bt.id),
          mark: bt.id === behaviorTypeId ? mark : markValue
        });
      }
    });

    // Prepare data for API
    const reportData = {
      exam_name_id: parseInt(selectedExam),
      student_id: parseInt(studentId),
      behavior_marks: behaviorMarks
    };

    try {
      // Send to API
      await createBehaviorReport(reportData).unwrap();
      // Mark as saved
      setSavedMarks(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [behaviorTypeId]: true
        }
      }));
      // Clear invalid marks message
      setInvalidMarks(prev => ({
        ...prev,
        [`${studentId}-${behaviorTypeId}`]: ''
      }));
      // Focus next input
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) {
        nextInput.focus();
      }
    } catch (error) {
      console.error('Failed to save behavior report:', error);
      setToastMessage('Failed to save mark');
      setTimeout(() => setToastMessage(''), 3000);
      // Revert to previous valid value or empty string on error
      setBehaviorReports(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [behaviorTypeId]: prev[studentId][behaviorTypeId] || ''
        }
      }));
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

  if (classesLoading || examsLoading || studentsLoading || behaviorTypesLoading || reportsLoading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-md shadow-lg">
          {toastMessage}
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-6">Add Behavior Marks</h2>
      
      {/* Class Selection */}
      <div className="mb-6">
        <label className="mr-4 font-semibold">Class:</label>
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="">Select Class</option>
          {classes?.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.class_name} {cls.shift_name} {cls.section_name}</option>
          ))}
        </select>
      </div>

      {/* Exam Selection */}
      <div className="mb-6">
        <label className="mr-4 font-semibold">Exam:</label>
        <select 
          value={selectedExam} 
          onChange={(e) => setSelectedExam(e.target.value)}
          disabled={!selectedClass}
          className="p-2 border rounded-md disabled:bg-gray-100"
        >
          <option value="">Select Exam</option>
          {exams?.map(exam => (
            <option key={exam.id} value={exam.id}>{exam.name}</option>
          ))}
        </select>
      </div>

      {/* Marks Table */}
      {selectedClass && selectedExam && students && activeBehaviorTypes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Student Name</th>
                <th className="border p-2 text-left">Roll No</th>
                {activeBehaviorTypes.map(bt => (
                  <th key={bt.id} className="border p-2 text-left">
                    {bt.name} (Out of {bt.obtain_mark})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, studentIndex) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="border p-2">{student.name}</td>
                  <td className="border p-2">{student.roll_no}</td>
                  {activeBehaviorTypes.map((bt, behaviorIndex) => {
                    const nextInputId = studentIndex + 1 < students.length 
                      ? `mark-${students[studentIndex + 1].id}-${bt.id}`
                      : null;
                    const inputId = `mark-${student.id}-${bt.id}`;
                    return (
                      <td key={bt.id} className="border p-2">
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
                            className="w-16 p-1 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {savedMarks[student.id]?.[bt.id] && (
                            <span className="ml-2 text-green-500">✔</span>
                          )}
                        </div>
                        {invalidMarks[`${student.id}-${bt.id}`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {invalidMarks[`${student.id}-${bt.id}`]}
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
      )}
    </div>
  );
};

export default AddBehaviorMarks;