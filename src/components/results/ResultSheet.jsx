import React, { useState, useEffect } from 'react';
import { useGetFilteredSubjectMarksQuery } from '../../redux/features/api/marks/subjectMarksApi';
import { useGetFilteredMarkConfigsQuery } from '../../redux/features/api/marks/markConfigsApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetGradeRulesQuery } from '../../redux/features/api/result/gradeRuleApi';

const ResultSheet = () => {
  // State for selected values
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClassConfig, setSelectedClassConfig] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  
  // State for processed data
  const [studentResults, setStudentResults] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all necessary data
  const { data: exams = [] } = useGetExamApiQuery();
  const { data: classConfigs = [] } = useGetclassConfigApiQuery();
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  const { data: gradeRules = [] } = useGetGradeRulesQuery();

  // Fetch filtered subject marks
  const { data: subjectMarks = [], isLoading: isLoadingMarks } = useGetFilteredSubjectMarksQuery(
    {
      exam_id: selectedExam,
      profile_class_id: selectedClassConfig,
      academic_year: selectedAcademicYear
    },
    { skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear }
  );

  // Find selected class config
  const currentClassConfig = classConfigs.find(config => config.id === parseInt(selectedClassConfig));

  // Fetch mark configs
  const { data: markConfigs = [], isLoading: isLoadingConfigs } = useGetFilteredMarkConfigsQuery(
    { class_id: currentClassConfig?.class_id },
    { skip: !currentClassConfig }
  );

  // Process data when all requirements are met
  useEffect(() => {
    if (subjectMarks.length > 0 && markConfigs.length > 0 && !isLoadingMarks && !isLoadingConfigs) {
      processResultData();
    }
  }, [subjectMarks, markConfigs]);

  const processResultData = () => {
    setIsLoading(true);
    
    // Create mapping of subject_serial to combined_subject_name
    const subjectNameMap = {};
    subjectMarks.forEach(mark => {
      if (!subjectNameMap[mark.subject_serial] && mark.combined_subject_name) {
        subjectNameMap[mark.subject_serial] = mark.combined_subject_name;
      }
    });

    // 1. Group mark configs by subject_serial to get sum of max_mark and pass_mark
    const subjectConfigGroups = {};
    markConfigs.forEach(config => {
      if (!subjectConfigGroups[config.subject_serial]) {
        subjectConfigGroups[config.subject_serial] = {
          serial: config.subject_serial,
          maxMark: 0,
          passMark: 0,
          subjectName: subjectNameMap[config.subject_serial] || config.subject_name
        };
      }
      subjectConfigGroups[config.subject_serial].maxMark += config.max_mark;
      subjectConfigGroups[config.subject_serial].passMark += config.pass_mark;
    });

    // Convert to array and sort by serial
    const sortedSubjectGroups = Object.values(subjectConfigGroups)
      .sort((a, b) => a.serial - b.serial);
    setSubjectGroups(sortedSubjectGroups);

    // 2. Process student data with summed marks
    const studentsMap = new Map();
    
    subjectMarks.forEach(mark => {
      if (!studentsMap.has(mark.student)) {
        studentsMap.set(mark.student, {
          id: mark.student,
          name: mark.student_name,
          roll: mark.student_roll,
          subjects: {},
          totalObtained: 0,
          totalMaxMark: 0,
          hasFailed: false
        });
      }
      
      const student = studentsMap.get(mark.student);
      if (!student.subjects[mark.subject_serial]) {
        student.subjects[mark.subject_serial] = {
          obtained: 0,
          isAbsent: mark.is_absent,
          subjectName: mark.combined_subject_name 
        };
      }
      
      student.subjects[mark.subject_serial].obtained += mark.obtained;
      student.subjects[mark.subject_serial].isAbsent = 
        student.subjects[mark.subject_serial].isAbsent || mark.is_absent;
    });

    // Calculate totals and determine pass/fail
    const processedStudents = Array.from(studentsMap.values()).map(student => {
      let totalObtained = 0;
      let totalMaxMark = 0;
      let hasFailed = false;

      const studentSubjects = sortedSubjectGroups.map(group => {
        const studentSubject = student.subjects[group.serial] || {
          obtained: 0,
          isAbsent: true,
          subjectName: group.subjectName
        };

        const isFailed = studentSubject.isAbsent || 
                        studentSubject.obtained < group.passMark;

        totalObtained += studentSubject.isAbsent ? 0 : studentSubject.obtained;
        totalMaxMark += group.maxMark;

        if (isFailed) hasFailed = true;

        return {
          ...studentSubject,
          serial: group.serial,
          maxMark: group.maxMark,
          passMark: group.passMark,
          isFailed
        };
      });

      const averageMark = totalMaxMark > 0 ? (totalObtained / totalMaxMark) * 100 : 0;
      const grade = hasFailed ? 'রাসেব' : 
        gradeRules.find(rule => 
          averageMark >= rule.min_mark && averageMark <= rule.max_mark
        )?.grade_name || 'রাসেব';

      return {
        ...student,
        subjects: studentSubjects,
        totalObtained,
        totalMaxMark,
        averageMark,
        grade,
        hasFailed
      };
    });

    // Separate passed and failed students
    const passedStudents = processedStudents.filter(s => !s.hasFailed);
    const failedStudents = processedStudents.filter(s => s.hasFailed);

    // First sort passed students by average to calculate rankings
    const passedByAverage = [...passedStudents].sort((a, b) => b.averageMark - a.averageMark);
    
    // Add rankings based on average
    const rankedPassedStudents = passedByAverage.map((student, index) => ({
      ...student,
      ranking: index + 1,
      displayRank: (index + 1).toString()
    }));

    // Now sort passed students by roll number while keeping their rankings
    const finalPassedStudents = [...rankedPassedStudents].sort((a, b) => a.roll - b.roll);

    // Sort failed students by average (descending)
    const rankedFailedStudents = failedStudents
      .sort((a, b) => b.averageMark - a.averageMark)
      .map(student => ({
        ...student,
        ranking: Infinity,
        displayRank: 'রাসেব'
      }));

    // Combine results
    const allStudents = [...finalPassedStudents, ...rankedFailedStudents];

    setStudentResults(allStudents);
    setIsLoading(false);
  };

  const getCellStyle = (subject) => {
    if (!subject) return {};
    if (subject.isAbsent || subject.isFailed) {
      return { backgroundColor: '#ffdddd' };
    }
    return {};
  };

  if (isLoading) return <div className="text-center py-8">Loading results...</div>;

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="block mb-2 font-medium">Select Exam</label>
          <select
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            <option value="">Select Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Select Class</label>
          <select
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedClassConfig}
            onChange={(e) => setSelectedClassConfig(e.target.value)}
          >
            <option value="">Select Class</option>
            {classConfigs.map((config) => (
              <option key={config.id} value={config.id}>
                {config.class_name} ({config.section_name})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Academic Year</label>
          <select
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
          >
            <option value="">Select Academic Year</option>
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {studentResults.length > 0 && (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border font-semibold text-center">Rank</th>
                <th className="py-3 px-4 border font-semibold text-center">Roll</th>
                <th className="py-3 px-4 border font-semibold">Name</th>
                {subjectGroups.map(subject => (
                  <th key={subject.serial} className="py-3 px-4 border font-semibold text-center">
                    {subject.subjectName}
                  </th>
                ))}
                <th className="py-3 px-4 border font-semibold text-center">Total</th>
                <th className="py-3 px-4 border font-semibold text-center">Average</th>
                <th className="py-3 px-4 border font-semibold text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {studentResults.map((student, index) => (
                <tr key={`${student.id}-${index}`} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border text-center">{student.displayRank}</td>
                  <td className="py-2 px-4 border text-center">{student.roll}</td>
                  <td className="py-2 px-4 border">{student.name}</td>
                  
                  {student.subjects.map(subject => (
                    <td 
                      key={`${student.id}-${subject.serial}`}
                      className="py-2 px-4 border text-center"
                      style={getCellStyle(subject)}
                    >
                      {subject.isAbsent ? 'Absent' : subject.obtained}
                    </td>
                  ))}
                  
                  <td className="py-2 px-4 border text-center">
                    {student.totalObtained}/{student.totalMaxMark}
                  </td>
                  <td className="py-2 px-4 border text-center">
                    {student.averageMark.toFixed(2)}%
                  </td>
                  <td className={`py-2 px-4 border text-center font-bold ${
                    student.grade === 'রাসেব' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {student.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultSheet;