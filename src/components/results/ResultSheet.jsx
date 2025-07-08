import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaSpinner, FaPrint } from 'react-icons/fa';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetSubjectMarksQuery } from '../../redux/features/api/marks/subjectMarksApi';
import { useGetSubjectMarkConfigsByClassQuery } from '../../redux/features/api/marks/subjectMarkConfigsApi';

const ResultSheet = () => {
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClassConfig, setSelectedClassConfig] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [grades, setGrades] = useState([]);
  const [resultData, setResultData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    gradeDistribution: {},
    failedSubjects: {},
  });

  // Fetch data from APIs
  const { data: exams, isLoading: examsLoading } = useGetExamApiQuery();
  const { data: classConfigs, isLoading: classConfigsLoading } = useGetclassConfigApiQuery();
  const { data: academicYears, isLoading: academicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: students, isLoading: studentsLoading } = useGetStudentActiveByClassQuery(selectedClassConfig, {
    skip: !selectedClassConfig,
  });
  const { data: subjectMarks, isLoading: subjectMarksLoading } = useGetSubjectMarksQuery({
    skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear,
  });
  const { data: subjectConfigs, isLoading: subjectConfigsLoading } = useGetSubjectMarkConfigsByClassQuery(selectedClassConfig, {
    skip: !selectedClassConfig,
  });

  // Load grades from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('madrasaGrades');
    if (stored) {
      setGrades(JSON.parse(stored));
    }
  }, []);

  // Calculate results when data changes
  useEffect(() => {
    if (subjectMarks && students && subjectConfigs && selectedExam && selectedClassConfig && selectedAcademicYear) {
      const filteredMarks = subjectMarks.filter(
        (mark) =>
          mark.exam === Number(selectedExam) &&
          mark.class_name === classConfigs.find((c) => c.id === Number(selectedClassConfig))?.class_name &&
          mark.academic_year === Number(selectedAcademicYear)
      );

      const result = students.map((student) => {
        const studentMarks = filteredMarks.filter((mark) => mark.student === student.id);
        let totalObtained = 0;
        const subjectResults = subjectConfigs.map((config) => {
          const mark = studentMarks.find((m) => m.mark_conf === config.mark_configs[0]?.id || m.mark_conf === config.mark_configs[1]?.id);
          const obtained = mark ? mark.obtained : 0;
          const isAbsent = mark ? mark.is_absent : false;
          const maxMark = config.mark_configs.reduce((sum, mc) => sum + mc.max_mark, 0);
          const passMark = config.mark_configs.reduce((sum, mc) => sum + mc.pass_mark, 0);
          const isFailed = !isAbsent && obtained < passMark;
          totalObtained += obtained;
          return {
            subject: config.subject_name,
            obtained,
            maxMark,
            isFailed,
            isAbsent,
          };
        });

        const grade = calculateGrade(totalObtained);
        return {
          studentId: student.id,
          studentName: student.name,
          rollNo: student.roll_no,
          subjects: subjectResults,
          totalObtained,
          grade,
        };
      });

      // Sort by total marks for ranking
      const rankedResult = result
        .sort((a, b) => b.totalObtained - a.totalObtained)
        .map((res, index) => ({ ...res, rank: index + 1 }));

      // Calculate statistics
      const totalStudents = rankedResult.length;
      const gradeDistribution = rankedResult.reduce((acc, res) => {
        acc[res.grade] = (acc[res.grade] || 0) + 1;
        return acc;
      }, {});
      const failedSubjects = rankedResult.reduce((acc, res) => {
        res.subjects.forEach((sub) => {
          if (sub.isFailed) {
            acc[sub.subject] = (acc[sub.subject] || 0) + 1;
          }
        });
        return acc;
      }, {});

      setResultData(rankedResult);
      setStatistics({ totalStudents, gradeDistribution, failedSubjects });
    }
  }, [subjectMarks, students, subjectConfigs, selectedExam, selectedClassConfig, selectedAcademicYear, grades]);

  const calculateGrade = (totalMarks) => {
    const grade = grades.find((g) => totalMarks >= g.min && totalMarks <= g.max);
    return grade ? grade.grade : 'N/A';
  };

  const handlePrint = () => {
    window.print();
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
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .print-container {
              width: 297mm;
              height: 210mm;
              margin: 0;
              padding: 10mm;
              box-sizing: border-box;
              font-size: 10pt;
            }
            table { width: 100%; page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
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
        `}
      </style>

      {/* Selection Form */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl no-print">
        <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight mb-6">
          ফলাফল শীট তৈরি করুন
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
            disabled={examsLoading}
          >
            <option value="">পরীক্ষা নির্বাচন করুন</option>
            {exams?.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
          <select
            value={selectedClassConfig}
            onChange={(e) => setSelectedClassConfig(e.target.value)}
            className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
            disabled={classConfigsLoading}
          >
            <option value="">ক্লাস নির্বাচন করুন</option>
            {classConfigs?.map((config) => (
              <option key={config.id} value={config.id}>
                {config.class_name} - {config.section_name} ({config.shift_name})
              </option>
            ))}
          </select>
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
            disabled={academicYearsLoading}
          >
            <option value="">শিক্ষাবর্ষ নির্বাচন করুন</option>
            {academicYears?.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn hover:text-white btn-glow"
            disabled={!selectedExam || !selectedClassConfig || !selectedAcademicYear}
            title="প্রিন্ট করুন"
          >
            <FaPrint className="w-5 h-5 mr-2" />
            প্রিন্ট করুন
          </button>
        </div>
      </div>

      {/* Result Sheet */}
      {(examsLoading || classConfigsLoading || academicYearsLoading || studentsLoading || subjectMarksLoading || subjectConfigsLoading) ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-[#441a05]" />
        </div>
      ) : resultData.length > 0 ? (
        <div className="print-container bg-white p-8 rounded-2xl shadow-xl animate-fadeIn">
          <h2 className="text-3xl font-bold text-center text-[#441a05] mb-4">
            ফলাফল শীট - {exams?.find((e) => e.id === Number(selectedExam))?.name}
          </h2>
          <div className="text-center mb-6">
            <p className="text-[#441a05]">
              ক্লাস: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.class_name} | 
              শাখা: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.section_name} | 
              শিফট: {classConfigs?.find((c) => c.id === Number(selectedClassConfig))?.shift_name}
            </p>
            <p className="text-[#441a05]">
              শিক্ষাবর্ষ: {academicYears?.find((y) => y.id === Number(selectedAcademicYear))?.name}
            </p>
          </div>

          {/* Result Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#9d9087] border border-[#9d9087]">
              <thead className="bg-[#DB9E30]/20">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#441a05] uppercase tracking-wider">রোল</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#441a05] uppercase tracking-wider">নাম</th>
                  {subjectConfigs?.map((config) => (
                    <th key={config.id} className="px-4 py-2 text-left text-xs font-medium text-[#441a05] uppercase tracking-wider">
                      {config.subject_name}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#441a05] uppercase tracking-wider">মোট</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#441a05] uppercase tracking-wider">গ্রেড</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#441a05] uppercase tracking-wider">র‍্যাঙ্ক</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9d9087]">
                {resultData.map((student) => (
                  <tr key={student.studentId} className="bg-white">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-[#441a05]">{student.rollNo}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-[#441a05]">{student.studentName}</td>
                    {student.subjects.map((sub, index) => (
                      <td
                        key={index}
                        className={`px-4 py-2 whitespace-nowrap text-sm ${
                          sub.isFailed ? 'bg-red-100 text-red-700' : sub.isAbsent ? 'bg-yellow-100 text-yellow-700' : 'text-[#441a05]'
                        }`}
                      >
                        {sub.isAbsent ? 'অনুপস্থিত' : `${sub.obtained}/${sub.maxMark}`}
                      </td>
                    ))}
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-[#441a05]">{student.totalObtained}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-[#441a05]">{student.grade}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-[#441a05]">{student.rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#DB9E30]/10 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-[#441a05] mb-2">পরিসংখ্যান</h4>
              <p className="text-[#441a05]">মোট শিক্ষার্থী: {statistics.totalStudents}</p>
              <h5 className="text-md font-medium text-[#441a05] mt-2">গ্রেড বিতরণ:</h5>
              {Object.entries(statistics.gradeDistribution).map(([grade, count]) => (
                <p key={grade} className="text-[#441a05]">
                  {grade}: {count} জন
                </p>
              ))}
            </div>
            <div className="bg-[#DB9E30]/10 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-[#441a05] mb-2">ফেল করা বিষয়</h4>
              {Object.entries(statistics.failedSubjects).length > 0 ? (
                Object.entries(statistics.failedSubjects).map(([subject, count]) => (
                  <p key={subject} className="text-[#441a05]">
                    {subject}: {count} জন
                  </p>
                ))
              ) : (
                <p className="text-[#441a05]">কোনো বিষয়ে ফেল নেই</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-[#441a05]/70">ফলাফল তৈরি করতে উপরের ফিল্টার নির্বাচন করুন।</p>
      )}
    </div>
  );
};

export default ResultSheet;