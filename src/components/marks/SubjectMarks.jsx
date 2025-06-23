import React, { useState, useEffect } from 'react';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetSubjectMarkConfigsByClassQuery, useGetSubjectMarkConfigsBySubjectQuery } from '../../redux/features/api/marks/subjectMarkConfigsApi';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useCreateSubjectMarkMutation, useGetSubjectMarksQuery, useUpdateSubjectMarkMutation, useDeleteSubjectMarkMutation } from '../../redux/features/api/marks/subjectMarksApi';

const SubjectMarks = () => {
  const [examId, setExamId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [selectedClassConfigId, setSelectedClassConfigId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [marks, setMarks] = useState({});
  const [absentStudents, setAbsentStudents] = useState(new Set());
  const [savingStates, setSavingStates] = useState({});

  const { data: exams, isLoading: examsLoading, error: examsError } = useGetExamApiQuery();
  const { data: academicYears, isLoading: yearsLoading, error: yearsError } = useGetAcademicYearApiQuery();
  const { data: classes, isLoading: classesLoading, error: classesError } = useGetclassConfigApiQuery();
  const { 
    data: subjectMarkConfigs, 
    isLoading: configsLoading, 
    error: configsError,
    isFetching: configsFetching 
  } = useGetSubjectMarkConfigsByClassQuery(classId, { skip: !classId });
  const { 
    data: subjectMarkConfigsBySubject, 
    isLoading: subjectConfigsLoading, 
    error: subjectConfigsError 
  } = useGetSubjectMarkConfigsBySubjectQuery(subjectId, { skip: !subjectId });
  const { 
    data: students, 
    isLoading: studentsLoading, 
    error: studentsError, 
    isFetching: studentsFetching 
  } = useGetStudentActiveByClassQuery(selectedClassConfigId, { skip: !selectedClassConfigId });
  const { 
    data: existingMarks, 
    isLoading: marksLoading, 
    error: marksError,
    refetch: refetchMarks
  } = useGetSubjectMarksQuery({ exam_id: examId, class_id: classId, subject_id: subjectId }, { skip: !examId || !classId || !subjectId });
  
  const [createSubjectMark] = useCreateSubjectMarkMutation();
  const [updateSubjectMark] = useUpdateSubjectMarkMutation();
  const [deleteSubjectMark] = useDeleteSubjectMarkMutation();

  // Handle class selection to set both IDs
  const handleClassChange = (e) => {
    const selectedId = e.target.value;
    setSelectedClassConfigId(selectedId);
    const selectedClass = classes?.find((cls) => cls.id.toString() === selectedId);
    setClassId(selectedClass ? selectedClass.class_id.toString() : '');
    setSubjectId('');
  };

  // Populate existing marks when fetched
  useEffect(() => {
    if (existingMarks) {
      const marksMap = {};
      const absentSet = new Set();
      existingMarks.forEach((mark) => {
        marksMap[`${mark.student}_${mark.mark_conf}`] = mark.obtained;
        if (mark.is_absent) {
          absentSet.add(mark.student);
        }
      });
      setMarks(marksMap);
      setAbsentStudents(absentSet);
    }
  }, [existingMarks]);

  const handleMarkChange = (studentId, markConfigId, value) => {
    setMarks((prev) => ({
      ...prev,
      [`${studentId}_${markConfigId}`]: value,
    }));
  };

  const setSavingState = (studentId, markConfigId, state) => {
    const key = `${studentId}_${markConfigId}`;
    setSavingStates(prev => ({
      ...prev,
      [key]: state
    }));
  };

  const saveIndividualMark = async (studentId, markConfigId, value) => {
    if (!examId || !academicYearId || !classId || !subjectId) {
      return;
    }

    const key = `${studentId}_${markConfigId}`;
    setSavingState(studentId, markConfigId, 'saving');

    try {
      const isAbsent = absentStudents.has(studentId);
      const obtained = isAbsent ? 0 : Number(value || 0);
      
      const existingMark = existingMarks?.find(
        (mark) => mark.student === studentId && mark.mark_conf === markConfigId && mark.exam === Number(examId)
      );

      const markData = {
        exam: Number(examId),
        student: studentId,
        mark_conf: markConfigId,
        obtained,
        is_absent: isAbsent,
        checked: true,
        academic_year: Number(academicYearId),
        class_id: Number(classId),
      };

      if (existingMark) {
        await updateSubjectMark({ id: existingMark.id, ...markData }).unwrap();
      } else {
        await createSubjectMark(markData).unwrap();
      }
      
      setSavingState(studentId, markConfigId, 'saved');
      setTimeout(() => setSavingState(studentId, markConfigId, null), 2000);
      refetchMarks();
    } catch (error) {
      console.error(`Failed to save mark for student ${studentId}:`, error);
      setSavingState(studentId, markConfigId, 'error');
      setTimeout(() => setSavingState(studentId, markConfigId, null), 3000);
    }
  };

  const handleMarkBlur = (studentId, markConfigId, value) => {
    saveIndividualMark(studentId, markConfigId, value);
  };

  const handleMarkKeyPress = (e, studentId, markConfigId, value) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveIndividualMark(studentId, markConfigId, value);
    }
  };

  const toggleAbsent = async (studentId) => {
    const isCurrentlyAbsent = absentStudents.has(studentId);
    const newAbsentState = !isCurrentlyAbsent;
    
    setAbsentStudents((prev) => {
      const newSet = new Set(prev);
      if (newAbsentState) {
        newSet.add(studentId);
      } else {
        newSet.delete(studentId);
      }
      return newSet;
    });

    if (!examId || !academicYearId || !classId || !subjectId) return;

    const markConfigs = subjectMarkConfigsBySubject?.[0]?.mark_configs || [];
    
    for (const config of markConfigs) {
      try {
        const markKey = `${studentId}_${config.id}`;
        const obtained = newAbsentState ? 0 : Number(marks[markKey] || 0);
        
        const existingMark = existingMarks?.find(
          (mark) => mark.student === studentId && mark.mark_conf === config.id && mark.exam === Number(examId)
        );

        const markData = {
          exam: Number(examId),
          student: studentId,
          mark_conf: config.id,
          obtained,
          is_absent: newAbsentState,
          checked: true,
          academic_year: Number(academicYearId),
          class_id: Number(classId),
        };

        if (existingMark) {
          await updateSubjectMark({ id: existingMark.id, ...markData }).unwrap();
        } else {
          await createSubjectMark(markData).unwrap();
        }
      } catch (error) {
        console.error(`Failed to update absent status for student ${studentId}:`, error);
      }
    }
    refetchMarks();
  };

  const deleteStudentMarks = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete all marks for this student?')) {
      return;
    }

    try {
      const studentMarks = existingMarks?.filter(
        (mark) => mark.student === studentId && mark.exam === Number(examId)
      ) || [];

      for (const mark of studentMarks) {
        await deleteSubjectMark(mark.id).unwrap();
      }

      const markConfigs = subjectMarkConfigsBySubject?.[0]?.mark_configs || [];
      const updatedMarks = { ...marks };
      markConfigs.forEach(config => {
        delete updatedMarks[`${studentId}_${config.id}`];
      });
      setMarks(updatedMarks);

      setAbsentStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });

      refetchMarks();
    } catch (error) {
      console.error(`Failed to delete marks for student ${studentId}:`, error);
    }
  };

  const getSavingStateIcon = (studentId, markConfigId) => {
    const key = `${studentId}_${markConfigId}`;
    const state = savingStates[key];
    
    switch (state) {
      case 'saving':
        return (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
          </div>
        );
      case 'saved':
        return (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const selectedSubjectConfig = subjectMarkConfigsBySubject?.[0];
  const markConfigs = selectedSubjectConfig?.mark_configs || [];

  // Loading states
  if (configsLoading || configsFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (studentsLoading || studentsFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (configsError || studentsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Error Loading Data</h3>
          </div>
          <p className="text-gray-600">
            {configsError?.data?.message || studentsError?.data?.message || 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span>Subject Marks Entry</span>
            </h1>
            <p className="text-blue-100 mt-2">Enter and manage student marks efficiently</p>
          </div>

          {/* Filters Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Exam</label>
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                >
                  <option value="">Select Exam</option>
                  {exams?.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Academic Year</label>
                <select
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                >
                  <option value="">Select Academic Year</option>
                  {academicYears?.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Class</label>
                <select
                  value={selectedClassConfigId}
                  onChange={handleClassChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                >
                  <option value="">Select Class</option>
                  {classes?.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name} - {cls.section_name} ({cls.shift_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!classId}
                >
                  <option value="">Select Subject</option>
                  {subjectMarkConfigs?.map((config) => (
                    <option key={config.subject_id} value={config.subject_id}>
                      {config.subject_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* No Data Messages */}
        {selectedClassConfigId && !subjectMarkConfigs?.length && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">No Subjects Available</h3>
                <p className="text-yellow-600">No subjects found for the selected class configuration.</p>
              </div>
            </div>
          </div>
        )}

        {selectedClassConfigId && !students?.length && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">No Students Found</h3>
                <p className="text-blue-600">No active students found for the selected class.</p>
              </div>
            </div>
          </div>
        )}

        {/* Marks Table */}
        {students?.length > 0 && markConfigs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Student Information
                    </th>
                    {markConfigs.map((config) => (
                      <th key={config.id} className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider min-w-[140px]">
                        <div className="space-y-1">
                          <div className="font-semibold">{config.mark_type_name}</div>
                          <div className="text-xs text-gray-500 normal-case">
                            Max: {config.max_mark} | Pass: {config.pass_mark}
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={student.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">Roll: {student.roll_no}</div>
                          </div>
                        </div>
                      </td>
                      {markConfigs.map((config) => (
                        <td key={config.id} className="px-6 py-4 text-center">
                          <div className="relative inline-block">
                            <input
                              type="number"
                              value={marks[`${student.id}_${config.id}`] || ''}
                              onChange={(e) => handleMarkChange(student.id, config.id, e.target.value)}
                              onBlur={(e) => handleMarkBlur(student.id, config.id, e.target.value)}
                              onKeyPress={(e) => handleMarkKeyPress(e, student.id, config.id, e.target.value)}
                              className={`w-20 h-12 text-center border-2 rounded-xl font-semibold transition-all duration-200 ${
                                absentStudents.has(student.id)
                                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-white border-gray-200 text-gray-900 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              }`}
                              disabled={absentStudents.has(student.id)}
                              min="0"
                              max={config.max_mark}
                              placeholder="0"
                            />
                            {getSavingStateIcon(student.id, config.id)}
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleAbsent(student.id)}
                          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                            absentStudents.has(student.id)
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl'
                          }`}
                        >
                          {absentStudents.has(student.id) ? 'Absent' : 'Present'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => deleteStudentMarks(student.id)}
                          className="w-10 h-10 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-500 hover:to-red-600 text-red-600 hover:text-white rounded-xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center group"
                          title="Delete all marks for this student"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Stats */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-6">
                  <span className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Total Students: {students.length}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Absent: {absentStudents.size}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Present: {students.length - absentStudents.size}</span>
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Auto-save enabled • Press Enter or click outside to save
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectMarks;