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
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all necessary data
  const { data: exams = [] } = useGetExamApiQuery();
  const { data: classConfigs = [] } = useGetclassConfigApiQuery();
  const { data: academicYears = [] } = useGetAcademicYearApiQuery();
  const { data: gradeRules = [] } = useGetGradeRulesQuery();

  // Fetch filtered data based on selections
  const {
    data: subjectMarks = [],
    isLoading: isLoadingSubjectMarks,
    error: subjectMarksError
  } = useGetFilteredSubjectMarksQuery(
    {
      exam_id: selectedExam,
      profile_class_id: selectedClassConfig,
      academic_year: selectedAcademicYear
    },
    { skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear }
  );

  // Find the selected class config to get class_id
  const currentClassConfig = classConfigs.find(config => config.id === parseInt(selectedClassConfig));
  
  // Fetch mark configs based on class_id
  const {
    data: markConfigs = [],
    isLoading: isLoadingMarkConfigs,
    error: markConfigsError
  } = useGetFilteredMarkConfigsQuery(
    { class_id: currentClassConfig?.class_id },
    { skip: !currentClassConfig }
  );

  // Process data when all required data is available
  useEffect(() => {
    if (subjectMarks.length > 0 && markConfigs.length > 0 && !isLoadingSubjectMarks && !isLoadingMarkConfigs) {
      processResultData();
    }
  }, [subjectMarks, markConfigs, isLoadingSubjectMarks, isLoadingMarkConfigs]);

  const processResultData = () => {
    try {
      setIsLoading(true);
      setError(null);

      // Group subject marks by student and subject_serial (summing obtained marks)
      const studentsMap = new Map();
      const subjectsMap = new Map(); // To track unique subjects
      
      subjectMarks.forEach(mark => {
        // Skip if we've already processed this subject_serial
        if (subjectsMap.has(mark.subject_serial)) return;
        subjectsMap.set(mark.subject_serial, {
          name: mark.combined_subject_name,
          serial: mark.subject_serial
        });

        // Initialize student if not exists
        if (!studentsMap.has(mark.student)) {
          studentsMap.set(mark.student, {
            id: mark.student,
            name: mark.student_name,
            roll: mark.student_roll,
            subjects: [],
            totalObtained: 0,
            totalMaxMark: 0,
            isAbsent: false,
            hasFailed: false
          });
        }
        
        const student = studentsMap.get(mark.student);
        const subjectConfig = markConfigs.find(
          config => config.subject_serial === mark.subject_serial
        );
        
        if (subjectConfig) {
          // Check if student already has this subject (shouldn't happen due to skip above)
          const existingSubjectIndex = student.subjects.findIndex(
            s => s.subjectSerial === mark.subject_serial
          );
          
          if (existingSubjectIndex === -1) {
            student.subjects.push({
              id: mark.id,
              subjectName: mark.combined_subject_name,
              subjectSerial: mark.subject_serial,
              obtained: mark.obtained,
              isAbsent: mark.is_absent,
              passMark: subjectConfig.pass_mark,
              maxMark: subjectConfig.max_mark
            });
          }
        }
      });

      // Calculate totals and determine pass/fail for each student
      const students = Array.from(studentsMap.values()).map(student => {
        let totalObtained = 0;
        let totalMaxMark = 0;
        let hasFailed = false;
        let isAbsent = false;

        // Sort subjects by serial
        student.subjects.sort((a, b) => a.subjectSerial - b.subjectSerial);
        
        student.subjects.forEach(subject => {
          if (subject.isAbsent) {
            isAbsent = true;
            hasFailed = true;
          } else if (subject.obtained < subject.passMark) {
            hasFailed = true;
          }
          
          totalObtained += subject.obtained;
          totalMaxMark += subject.maxMark;
        });

        const averageMark = totalMaxMark > 0 ? (totalObtained / totalMaxMark) * 100 : 0;
        
        // Determine grade based on average mark
        let grade = 'Fail';
        if (!hasFailed && !isAbsent) {
          const matchingGrade = gradeRules.find(
            rule => averageMark >= rule.min_mark && averageMark <= rule.max_mark
          );
          grade = matchingGrade ? matchingGrade.grade_name : 'Fail';
        }

        return {
          ...student,
          totalObtained,
          totalMaxMark,
          averageMark,
          grade,
          isAbsent,
          hasFailed
        };
      });

      // Sort students by roll number
      students.sort((a, b) => a.roll - b.roll);

      // Add ranking
      const rankedStudents = students.map((student, index) => ({
        ...student,
        ranking: index + 1
      }));

      // Get unique subjects sorted by serial
      const uniqueSubjects = Array.from(subjectsMap.values())
        .sort((a, b) => a.serial - b.serial);

      setStudentResults(rankedStudents);
      setSubjects(uniqueSubjects);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to process result data');
      setIsLoading(false);
      console.error(err);
    }
  };

  const getCellStyle = (subject) => {
    if (!subject) return {};
    if (subject.isAbsent) {
      return { backgroundColor: '#ffcccc', color: '#cc0000' };
    }
    if (subject.obtained < subject.passMark) {
      return { backgroundColor: '#ffcccc' };
    }
    return {};
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Result Sheet</h1>
      
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
                <th className="py-3 px-4 border font-semibold text-center">Roll No.</th>
                <th className="py-3 px-4 border font-semibold">Student Name</th>
                {subjects.map((subject) => (
                  <th key={subject.serial} className="py-3 px-4 border font-semibold text-center min-w-[120px]">
                    {subject.name}
                  </th>
                ))}
                <th className="py-3 px-4 border font-semibold text-center">Total</th>
                <th className="py-3 px-4 border font-semibold text-center">Average</th>
                <th className="py-3 px-4 border font-semibold text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {studentResults.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 border-b">
                  <td className="py-2 px-4 border text-center">{student.ranking}</td>
                  <td className="py-2 px-4 border text-center">{student.roll}</td>
                  <td className="py-2 px-4 border">{student.name}</td>
                  
                  {subjects.map((subject) => {
                    const studentSubject = student.subjects.find(
                      s => s.subjectSerial === subject.serial
                    );
                    
                    return (
                      <td 
                        key={`${student.id}-${subject.serial}`}
                        className="py-2 px-4 border text-center"
                        style={getCellStyle(studentSubject)}
                      >
                        {studentSubject ? (
                          studentSubject.isAbsent ? (
                            <span className="font-medium">Absent</span>
                          ) : (
                            studentSubject.obtained
                          )
                        ) : '-'}
                      </td>
                    );
                  })}
                  
                  <td className="py-2 px-4 border text-center font-medium">
                    {student.totalObtained} / {student.totalMaxMark}
                  </td>
                  <td className="py-2 px-4 border text-center">
                    {student.averageMark.toFixed(2)}%
                  </td>
                  <td 
                    className="py-2 px-4 border text-center font-bold"
                    style={{ 
                      color: student.grade === 'Fail' ? '#dc2626' : '#16a34a',
                    }}
                  >
                    {student.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {!isLoading && studentResults.length === 0 && selectedExam && selectedClassConfig && selectedAcademicYear && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          No result data found for the selected criteria.
        </div>
      )}
    </div>
  );
};

export default ResultSheet;