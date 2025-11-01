import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { 
  useCreateSubjectMarkMutation,
  useGetFilteredSubjectMarksQuery,
  useUpdateSubjectMarkMutation,
} from '../../redux/features/api/marks/subjectMarksApi';
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { useGetFilteredMarkConfigsQuery } from '../../redux/features/api/marks/markConfigsApi';
import { useGetSubjectConfigByIdQuery } from '../../redux/features/api/subject-assign/subjectConfigsApi';

const SubjectMarks = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [examId, setExamId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [selectedClassConfigId, setSelectedClassConfigId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectConfId, setSubjectConfId] = useState('');
  const [marks, setMarks] = useState({});
  const [absentStudents, setAbsentStudents] = useState({});
  const [savingInputs, setSavingInputs] = useState({});
  const [successInputs, setSuccessInputs] = useState({});
  const [isEnterPressed, setIsEnterPressed] = useState(false);
  const [sortedStudents, setSortedStudents] = useState([]);

  const { data: exams, isLoading: examsLoading } = useGetExamApiQuery();
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
  const { 
    data: subjectConfigs, 
    isLoading: subjectConfigsLoading, 
    isFetching: subjectConfigsFetching 
  } = useGetSubjectConfigByIdQuery(classId, { skip: !classId });
  const { 
    data: markConfigs, 
    isLoading: markConfigsLoading 
  } = useGetFilteredMarkConfigsQuery(
    { class_id: classId, subject_conf: subjectConfId }, 
    { skip: !classId || !subjectConfId }
  );
  const { 
    data: students, 
    isLoading: studentsLoading, 
    isFetching: studentsFetching 
  } = useGetStudentActiveByClassQuery(selectedClassConfigId, { skip: !selectedClassConfigId });

  const currentSubjectId = subjectConfigs?.find(config => config.id.toString() === subjectConfId)?.subject_id;

  // Use filtered query
  const { 
    data: existingMarks, 
    refetch: refetchMarks,
    isFetching: marksFetching
  } = useGetFilteredSubjectMarksQuery(
    { exam_id: examId, class_id: classId, subject_id: currentSubjectId },
    { 
      skip: !examId || !classId || !currentSubjectId 
    }
  );

  const [createSubjectMark] = useCreateSubjectMarkMutation();
  const [updateSubjectMark] = useUpdateSubjectMarkMutation();

  const { 
    data: groupPermissions, 
    isLoading: permissionsLoading 
  } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_subjectmark') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_subjectmark') || false;

  // Sort students by roll number
  useEffect(() => {
    if (students && students.length > 0) {
      const sorted = [...students].sort((a, b) => {
        const rollA = parseInt(a.roll_no, 10);
        const rollB = parseInt(b.roll_no, 10);
        return rollA - rollB;
      });
      setSortedStudents(sorted);
    } else {
      setSortedStudents([]);
    }
  }, [students]);

  // Reset when class changes
  useEffect(() => {
    if (classId) {
      setSubjectConfId('');
      setMarks({});
      setAbsentStudents({});
      setSavingInputs({});
      setSuccessInputs({});
      setIsEnterPressed(false);
    }
  }, [classId]);

  // Reset when exam, class, or subject changes
  useEffect(() => {
    setMarks({});
    setAbsentStudents({});
    setSavingInputs({});
    setSuccessInputs({});
    setIsEnterPressed(false);
  }, [examId, classId, currentSubjectId]);

  // Load existing marks
  useEffect(() => {
    if (existingMarks && existingMarks.length > 0) {
      const marksMap = {};
      const absentMap = {};
      existingMarks.forEach((mark) => {
        marksMap[`${mark.student}_${mark.mark_conf}`] = mark.obtained;
        absentMap[`${mark.student}_${mark.mark_conf}`] = mark.is_absent;
      });
      setMarks(marksMap);
      setAbsentStudents(absentMap);
    } else {
      setMarks({});
      setAbsentStudents({});
    }
  }, [existingMarks]);

  const handleMarkChange = (studentId, markConfigId, value) => {
    if (!hasChangePermission) {
      toast.error('মার্ক পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    
    const config = markConfigs?.find(c => c.id === markConfigId);
    const maxMark = config?.max_mark || 100;
    const numValue = Number(value);

    if (value === '' || (numValue >= 0 && numValue <= maxMark)) {
      setMarks((prev) => ({
        ...prev,
        [`${studentId}_${markConfigId}`]: value,
      }));
    } else {
      toast.error(`মার্ক ০ থেকে ${maxMark} এর মধ্যে হতে হবে।`);
    }
  };

   const saveIndividualMark = async (studentId, markConfigId, value, moveToNext = false, currentIndex = -1) => {
    if (!hasChangePermission) {
      toast.error('মার্ক সংরক্ষণ করার অনুমতি নেই।');
      return;
    }
    if (!examId || !academicYearId || !classId || !currentSubjectId) {
      toast.error('দয়া করে পরীক্ষা, শিক্ষাবর্ষ, ক্লাস এবং বিষয় নির্বাচন করুন।');
      return;
    }

    const key = `${studentId}_${markConfigId}`;
    setSavingInputs((prev) => ({ ...prev, [key]: true }));
    setSuccessInputs((prev) => ({ ...prev, [key]: false }));

    try {
      const isAbsent = absentStudents[key] || false;
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
      
      // Don't refetch immediately to prevent re-render
      // refetchMarks will be called periodically or on component unmount
      
      setSuccessInputs((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setSuccessInputs((prev) => ({ ...prev, [key]: false }));
      }, 1000);

      // Move to next input if requested
      if (moveToNext && currentIndex >= 0 && currentIndex < sortedStudents.length - 1) {
        const nextStudent = sortedStudents[currentIndex + 1];
        const config = markConfigs?.find(c => c.id === markConfigId);
        if (nextStudent && config) {
          setTimeout(() => {
            const nextInput = document.querySelector(
              `input[aria-label="মার্ক প্রবেশ করান ${nextStudent.name} ${config.mark_type_name}"]`
            );
            if (nextInput && !absentStudents[`${nextStudent.id}_${markConfigId}`]) {
              nextInput.focus();
            }
          }, 50);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'মার্ক সংরক্ষণ ব্যর্থ।'}`);
    } finally {
      setSavingInputs((prev) => ({ ...prev, [key]: false }));
      setIsEnterPressed(false);
    }
  };

  const toggleAbsent = async (studentId, subjectConfId) => {
    if (!hasChangePermission) {
      toast.error('উপস্থিতি স্ট্যাটাস পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    if (!examId || !academicYearId || !classId || !currentSubjectId) {
      toast.error('দয়া করে পরীক্ষা, শিক্ষাবর্ষ, ক্লাস এবং বিষয় নির্বাচন করুন।');
      return;
    }

    const isCurrentlyAbsent = markConfigs?.some(
      (config) => absentStudents[`${studentId}_${config.id}`]
    );
    const newAbsentState = !isCurrentlyAbsent;

    const updatedAbsent = { ...absentStudents };
    markConfigs
      ?.filter((c) => c.subject_conf === Number(subjectConfId))
      .forEach((config) => {
        updatedAbsent[`${studentId}_${config.id}`] = newAbsentState;
      });
    setAbsentStudents(updatedAbsent);

    try {
      for (const config of markConfigs?.filter((c) => c.subject_conf === Number(subjectConfId)) || []) {
        const key = `${studentId}_${config.id}`;
        const obtained = newAbsentState ? 0 : Number(marks[key] || 0);

        const existingMark = existingMarks?.find(
          (mark) =>
            mark.student === studentId &&
            mark.mark_conf === config.id &&
            mark.exam === Number(examId) &&
            mark.class_id === Number(classId)
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
      }

      toast.success(`স্ট্যাটাস ${newAbsentState ? 'অনুপস্থিত' : 'উপস্থিত'} হয়েছে!`);
      refetchMarks();
    } catch (error) {
      console.error(error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'অনুপস্থিতি আপডেট ব্যর্থ।'}`);
    }
  };

  // Loading state
  if (
    subjectConfigsLoading || subjectConfigsFetching || 
    studentsLoading || studentsFetching || 
    examsLoading || yearsLoading || classesLoading || 
    permissionsLoading
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-2xl text-[#441a05]" />
        <span className="ml-2 text-[#441a05]">লোড হচ্ছে...</span>
      </div>
    );
  }

  // Permission check
  if (!hasViewPermission) {
    return <div className="p-4 text-red-400">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="py-8">
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
          .tick-glow {
            transition: all 0.3s ease;
          }
          .tick-glow:focus {
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
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

      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center space-x-4 mb-6 animate-fadeIn ml-5">
        <IoAddCircle className="text-4xl text-[#441a05]" />
        <h1 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
          বিষয় মার্ক এন্ট্রি
        </h1>
      </div>

      {/* Filters Section */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 animate-fadeIn">
        <h2 className="text-xl font-semibold text-[#441a05] mb-4 flex items-center">
          <span className="bg-[#DB9E30]/20 text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">১</span>
          ফিল্টার নির্বাচন করুন
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#441a05]">পরীক্ষা</label>
            <select
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
            >
              <option value="" hidden disabled>পরীক্ষা নির্বাচন করুন</option>
              {exams?.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#441a05]">শিক্ষাবর্ষ</label>
            <select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
            >
              <option value="" hidden disabled>শিক্ষাবর্ষ নির্বাচন করুন</option>
              {academicYears?.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#441a05]">ক্লাস</label>
            <select
              value={selectedClassConfigId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setSelectedClassConfigId(selectedId);
                const selectedClass = classes?.find((cls) => cls.id.toString() === selectedId);
                setClassId(selectedClass ? selectedClass.class_id.toString() : '');
                setSubjectConfId('');
              }}
              className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
            >
              <option value="" hidden disabled>ক্লাস নির্বাচন করুন</option>
              {classes?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} - {cls.section_name} ({cls.shift_name})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#441a05]">বিষয়</label>
            <select
              value={subjectConfId}
              onChange={(e) => setSubjectConfId(e.target.value)}
              className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!classId}
            >
              <option value="" hidden disabled>বিষয় নির্বাচন করুন</option>
              {subjectConfigs?.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.combined_subject_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* No Data Messages */}
      {selectedClassConfigId && !subjectConfigs?.length && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#DB9E30]/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#DB9E30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#441a05]">কোনো বিষয় পাওয়া যায়নি</h3>
              <p className="text-[#441a05]/70">নির্বাচিত ক্লাসের জন্য কোনো বিষয় কনফিগার করা হয়নি।</p>
            </div>
          </div>
        </div>
      )}

      {selectedClassConfigId && !sortedStudents?.length && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#DB9E30]/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#DB9E30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#441a05]">কোনো ছাত্র পাওয়া যায়নি</h3>
              <p className="text-[#441a05]/70">নির্বাচিত ক্লাসে কোনো সক্রিয় ছাত্র পাওয়া যায়নি।</p>
            </div>
          </div>
        </div>
      )}

      {/* Marks Table */}
      {sortedStudents?.length > 0 && markConfigs?.length > 0 && (
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/10 border-b border-white/20">
                  <th className="px-6 py-4 text-left text-sm font-bold text-[#441a05] uppercase tracking-wider">
                    ছাত্রের তথ্য
                  </th>
                  {markConfigs.map((config) => (
                    <th key={config.id} className="px-6 py-4 text-center text-sm font-bold text-[#441a05] uppercase tracking-wider min-w-[140px]">
                      <div className="space-y-1">
                        <div className="font-semibold">{config.mark_type_name}</div>
                        <div className="text-xs text-[#441a05]/70 normal-case">
                          সর্বোচ্চ: {config.max_mark} | পাস: {config.pass_mark}
                        </div>
                      </div>
                    </th>
                  ))}
                  {hasChangePermission && (
                    <th className="px-6 py-4 text-center text-sm font-bold text-[#441a05] uppercase tracking-wider">
                      উপস্থিতি
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {sortedStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-white/10 transition-colors duration-200 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#DB9E30]/20 rounded-full flex items-center justify-center text-[#441a05] font-bold text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#441a05]">{student.name}</div>
                          <div className="text-sm text-[#441a05]/70">রোল: {student.roll_no}</div>
                        </div>
                      </div>
                    </td>
                    {markConfigs.map((config) => {
                      const key = `${student.id}_${config.id}`;
                      return (
                        <td key={config.id} className="px-6 py-4 text-center relative">
                          <div className="relative w-fit mx-auto">
                            <input
                              type="number"
                              value={marks[key] || ''}
                              onChange={(e) => handleMarkChange(student.id, config.id, e.target.value)}
                              onBlur={(e) => {
                                setTimeout(() => {
                                  if (!isEnterPressed) {
                                    saveIndividualMark(student.id, config.id, e.target.value);
                                  }
                                  setIsEnterPressed(false);
                                }, 100);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  setIsEnterPressed(true);
                                  saveIndividualMark(student.id, config.id, e.target.value);
                                  if (index < sortedStudents.length - 1) {
                                    const nextStudent = sortedStudents[index + 1];
                                    const nextInput = document.querySelector(
                                      `input[aria-label="মার্ক প্রবেশ করান ${nextStudent.name} ${config.mark_type_name}"]`
                                    );
                                    if (nextInput && !absentStudents[`${nextStudent.id}_${config.id}`]) {
                                      setTimeout(() => nextInput.focus(), 100);
                                    }
                                  }
                                }
                              }}
                              className={`w-20 h-12 text-center focus:outline-none border-2 rounded-lg font-semibold transition-all duration-200 tick-glow ${
                                absentStudents[key]
                                  ? 'bg-gray-100 border-[#9d9087] text-[#441a05]/50 cursor-not-allowed'
                                  : 'bg-white/10 border-[#9d9087] text-[#441a05] hover:border-[#DB9E30] focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30]'
                              }`}
                              disabled={absentStudents[key] || !hasChangePermission || savingInputs[key]}
                              min="0"
                              max={config.max_mark}
                              placeholder="0"
                              aria-label={`মার্ক প্রবেশ করান ${student.name} ${config.mark_type_name}`}
                            />
                            {savingInputs[key] && (
                              <FaSpinner className="absolute top-0 right-0 animate-spin text-sm text-[#DB9E30]" />
                            )}
                            {successInputs[key] && !savingInputs[key] && (
                              <FaCheckCircle className="absolute top-0 right-0 text-sm text-green-500" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                    {hasChangePermission && (
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleAbsent(student.id, subjectConfId)}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 btn-glow ${
                            markConfigs.some((c) => absentStudents[`${student.id}_${c.id}`])
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-[#DB9E30] text-[#441a05] hover:bg-[#DB9E30]/80'
                          }`}
                        >
                          {markConfigs.some((c) => absentStudents[`${student.id}_${c.id}`]) ? 'অনুপস্থিত' : 'উপস্থিত'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white/10 px-6 py-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm text-[#441a05]">
              <div className="flex items-center space-x-6">
                <span className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>মোট ছাত্র: {sortedStudents.length}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>অনুপস্থিত: {sortedStudents.filter(student => markConfigs.some(c => absentStudents[`${student.id}_${c.id}`])).length}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#DB9E30] rounded-full"></div>
                  <span>উপস্থিত: {sortedStudents.length - sortedStudents.filter(student => markConfigs.some(c => absentStudents[`${student.id}_${c.id}`])).length}</span>
                </span>
              </div>
              <div className="text-xs text-[#441a05]/70">
                স্বয়ংক্রিয় সংরক্ষণ সক্রিয় • সংরক্ষণের জন্য এন্টার চাপুন বা বাইরে ক্লিক করুন
              </div>
            </div>
          </div>
        </div>
      )}

      {subjectConfId && markConfigs?.length === 0 && !markConfigsLoading && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#DB9E30]/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#DB9E30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#441a05]">কোনো মার্ক কনফিগারেশন পাওয়া যায়নি</h3>
              <p className="text-[#441a05]/70">নির্বাচিত বিষয়ের জন্য কোনো মার্ক কনফিগারেশন তৈরি করা হয়নি।</p>
            </div>
          </div>
        </div>
      )}

      {!examId && !academicYearId && !selectedClassConfigId && !subjectConfId && (
        <div className="text-center py-12 animate-fadeIn">
          <h3 className="text-xl font-semibold text-[#441a05] mb-2">মার্ক এন্ট্রি শুরু করতে প্রস্তুত?</h3>
          <p className="text-[#441a05]/70">উপরের ফিল্টারগুলি ব্যবহার করে পরীক্ষা, শিক্ষাবর্ষ, ক্লাস এবং বিষয় নির্বাচন করুন</p>
        </div>
      )}
    </div>
  );
};

export default SubjectMarks;