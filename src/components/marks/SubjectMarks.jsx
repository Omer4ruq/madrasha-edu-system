import React, { useState, useEffect } from 'react';
import { FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
// import { useGetSubjectConfigByIdQuery } from '../../redux/features/api/subject-configs/subjectConfigsApi';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useCreateSubjectMarkMutation, useGetSubjectMarksQuery, useUpdateSubjectMarkMutation, useDeleteSubjectMarkMutation } from '../../redux/features/api/marks/subjectMarksApi';
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { useGetFilteredMarkConfigsQuery } from '../../redux/features/api/marks/markConfigsApi';
import { useGetSubjectConfigByIdQuery } from '../../redux/features/api/subject-assign/subjectConfigsApi';

const SubjectMarks = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [examId, setExamId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [selectedClassConfigId, setSelectedClassConfigId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectConfId, setSubjectConfId] = useState(''); // Store subject config ID instead of subject ID
  const [marks, setMarks] = useState({});
  const [absentStudents, setAbsentStudents] = useState(new Set());
  const [savingStates, setSavingStates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const { data: exams, isLoading: examsLoading } = useGetExamApiQuery();
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
  
  // Get subject configurations for the selected class
  const {
    data: subjectConfigs,
    isLoading: subjectConfigsLoading,
    isFetching: subjectConfigsFetching
  } = useGetSubjectConfigByIdQuery(classId, { skip: !classId });
  
  // Get filtered mark configs for the selected subject
  const {
    data: markConfigs,
    isLoading: markConfigsLoading
  } = useGetFilteredMarkConfigsQuery({ class_id: classId, subject_conf: subjectConfId }, { skip: !classId || !subjectConfId });
  
  const {
    data: students,
    isLoading: studentsLoading,
    isFetching: studentsFetching
  } = useGetStudentActiveByClassQuery(selectedClassConfigId, { skip: !selectedClassConfigId });
  
  // Reset subject configs when classId changes
  useEffect(() => {
    if (classId) {
      // Clear subject selection when class changes
      setSubjectConfId('');
      setMarks({});
      setAbsentStudents(new Set());
    }
  }, [classId]);

  // Get current subject ID for the marks API
  const currentSubjectId = subjectConfigs?.find(config => config.id.toString() === subjectConfId)?.subject_id;
  
  const {
    data: existingMarks,
    isLoading: marksLoading,
    refetch: refetchMarks
  } = useGetSubjectMarksQuery({ exam_id: examId, class_id: classId, subject_id: currentSubjectId }, { skip: !examId || !classId || !currentSubjectId });

  const [createSubjectMark] = useCreateSubjectMarkMutation();
  const [updateSubjectMark] = useUpdateSubjectMarkMutation();
  const [deleteSubjectMark] = useDeleteSubjectMarkMutation();

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_subjectmark') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_subjectmark') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_subjectmark') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_subjectmark') || false;

  // Handle class selection to set both IDs
  const handleClassChange = (e) => {
    const selectedId = e.target.value;
    setSelectedClassConfigId(selectedId);
    const selectedClass = classes?.find((cls) => cls.id.toString() === selectedId);
    const newClassId = selectedClass ? selectedClass.class_id.toString() : '';
    setClassId(newClassId);
    
    // Reset subject selection and related state immediately
    setSubjectConfId('');
    setMarks({});
    setAbsentStudents(new Set());
  };

  // Handle subject selection
  const handleSubjectChange = (e) => {
    setSubjectConfId(e.target.value);
    // Reset marks and absent students when subject changes
    setMarks({});
    setAbsentStudents(new Set());
  };

  // Handle exam selection
  const handleExamChange = (e) => {
    setExamId(e.target.value);
    // Reset marks and absent students when exam changes
    setMarks({});
    setAbsentStudents(new Set());
  };

  // Handle academic year selection
  const handleAcademicYearChange = (e) => {
    setAcademicYearId(e.target.value);
    // Reset marks and absent students when academic year changes
    setMarks({});
    setAbsentStudents(new Set());
  };

  // Populate existing marks when fetched - Reset first, then populate
  useEffect(() => {
    // Reset marks and absent students first
    setMarks({});
    setAbsentStudents(new Set());
    
    if (existingMarks && existingMarks.length > 0) {
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
  }, [existingMarks, examId, currentSubjectId, classId]); // Added dependencies to reset when these change

  const handleMarkChange = (studentId, markConfigId, value) => {
    if (!hasChangePermission) {
      toast.error('মার্ক পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    
    // Find the config from mark configs
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

  const setSavingState = (studentId, markConfigId, state) => {
    const key = `${studentId}_${markConfigId}`;
    setSavingStates(prev => ({
      ...prev,
      [key]: state
    }));
  };

  const saveIndividualMark = async (studentId, markConfigId, value) => {
    if (!hasAddPermission && !hasChangePermission) {
      toast.error('মার্ক সংরক্ষণ করার অনুমতি নেই।');
      return;
    }
    if (!examId || !academicYearId || !classId || !currentSubjectId) {
      toast.error('দয়া করে পরীক্ষা, শিক্ষাবর্ষ, ক্লাস এবং বিষয় নির্বাচন করুন।');
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
        if (!hasChangePermission) {
          toast.error('মার্ক আপডেট করার অনুমতি নেই।');
          return;
        }
        await updateSubjectMark({ id: existingMark.id, ...markData }).unwrap();
        toast.success('মার্ক সফলভাবে আপডেট করা হয়েছে!');
      } else {
        if (!hasAddPermission) {
          toast.error('মার্ক তৈরি করার অনুমতি নেই।');
          return;
        }
        await createSubjectMark(markData).unwrap();
        toast.success('মার্ক সফলভাবে সংরক্ষিত!');
      }

      setSavingState(studentId, markConfigId, 'saved');
      setTimeout(() => setSavingState(studentId, markConfigId, null), 2000);
      refetchMarks();
    } catch (error) {
      console.error(`মার্ক সংরক্ষণে ত্রুটি ছাত্র ${studentId}:`, error);
      setSavingState(studentId, markConfigId, 'error');
      toast.error(`ত্রুটি: ${error?.data?.message || 'মার্ক সংরক্ষণ ব্যর্থ।'}`);
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
    if (!hasChangePermission) {
      toast.error('উপস্থিতি স্ট্যাটাস পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    
    if (!examId || !academicYearId || !classId || !currentSubjectId) {
      toast.error('দয়া করে পরীক্ষা, শিক্ষাবর্ষ, ক্লাস এবং বিষয় নির্বাচন করুন।');
      return;
    }

    const isCurrentlyAbsent = absentStudents.has(studentId);
    const newAbsentState = !isCurrentlyAbsent;

    // Update local state first
    setAbsentStudents((prev) => {
      const newSet = new Set(prev);
      if (newAbsentState) {
        newSet.add(studentId);
      } else {
        newSet.delete(studentId);
      }
      return newSet;
    });

    // Get mark configs for the selected subject only
    const currentMarkConfigs = markConfigs || [];

    // Update marks for this specific exam and subject only
    for (const config of currentMarkConfigs) {
      try {
        const markKey = `${studentId}_${config.id}`;
        const obtained = newAbsentState ? 0 : Number(marks[markKey] || 0);

        // Find existing mark for this specific exam, student, and mark config
        const existingMark = existingMarks?.find(
          (mark) => mark.student === studentId && 
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
      } catch (error) {
        console.error(`অনুপস্থিতি স্ট্যাটাস আপডেটে ত্রুটি ছাত্র ${studentId}:`, error);
        toast.error(`ত্রুটি: ${error?.data?.message || 'অনুপস্থিতি স্ট্যাটাস আপডেট ব্যর্থ।'}`);
        
        // Revert local state on error
        setAbsentStudents((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyAbsent) {
            newSet.add(studentId);
          } else {
            newSet.delete(studentId);
          }
          return newSet;
        });
        return;
      }
    }
    
    toast.success(`ছাত্রের উপস্থিতি স্ট্যাটাস ${newAbsentState ? 'অনুপস্থিত' : 'উপস্থিত'} হিসেবে আপডেট করা হয়েছে!`);
    refetchMarks();
  };

  const deleteStudentMarks = async (studentId) => {
    if (!hasDeletePermission) {
      toast.error('ছাত্রের মার্ক মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setModalData({ studentId });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!hasDeletePermission) {
      toast.error('মার্ক মুছে ফেলার অনুমতি নেই।');
      setIsModalOpen(false);
      return;
    }
    try {
      // Filter marks for this specific exam only
      const studentMarks = existingMarks?.filter(
        (mark) => mark.student === modalData.studentId && 
                 mark.exam === Number(examId) &&
                 mark.class_id === Number(classId)
      ) || [];

      for (const mark of studentMarks) {
        await deleteSubjectMark(mark.id).unwrap();
      }

      // Clear marks from local state for this student
      const currentMarkConfigs = markConfigs || [];
      const updatedMarks = { ...marks };
      currentMarkConfigs.forEach(config => {
        delete updatedMarks[`${modalData.studentId}_${config.id}`];
      });
      setMarks(updatedMarks);

      // Remove from absent students
      setAbsentStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(modalData.studentId);
        return newSet;
      });

      toast.success('ছাত্রের সব মার্ক সফলভাবে মুছে ফেলা হয়েছে!');
      refetchMarks();
    } catch (error) {
      console.error(`ছাত্র ${modalData.studentId} এর মার্ক মুছে ফেলায় ত্রুটি:`, error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'মার্ক মুছে ফেলা ব্যর্থ।'}`);
    } finally {
      setIsModalOpen(false);
      setModalData(null);
    }
  };

  const getSavingStateIcon = (studentId, markConfigId) => {
    const key = `${studentId}_${markConfigId}`;
    const state = savingStates[key];

    switch (state) {
      case 'saving':
        return (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#DB9E30] rounded-full animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full m-1"></div>
          </div>
        );
      case 'saved':
        return (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Loading states
  if (subjectConfigsLoading || subjectConfigsFetching || studentsLoading || studentsFetching || examsLoading || yearsLoading || classesLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black/10 backdrop-blur-sm rounded-xl shadow-lg p-8 flex items-center space-x-4 animate-fadeIn">
          <FaSpinner className="animate-spin text-2xl text-[#441a05]" />
          <span className="text-[#441a05] font-medium">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="py-8">
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
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
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

      <div className="">
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
                onChange={handleExamChange}
                className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                aria-label="পরীক্ষা নির্বাচন করুন"
                title="পরীক্ষা নির্বাচন করুন / Select exam"
              >
                <option value="">পরীক্ষা নির্বাচন করুন</option>
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
                onChange={handleAcademicYearChange}
                className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                aria-label="শিক্ষাবর্ষ নির্বাচন করুন"
                title="শিক্ষাবর্ষ নির্বাচন করুন / Select academic year"
              >
                <option value="">শিক্ষাবর্ষ নির্বাচন করুন</option>
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
                onChange={handleClassChange}
                className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                aria-label="ক্লাস নির্বাচন করুন"
                title="ক্লাস নির্বাচন করুন / Select class"
              >
                <option value="">ক্লাস নির্বাচন করুন</option>
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
                onChange={handleSubjectChange}
                className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!classId}
                aria-label="বিষয় নির্বাচন করুন"
                title="বিষয় নির্বাচন করুন / Select subject"
              >
                <option value="">বিষয় নির্বাচন করুন</option>
                {subjectConfigs?.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.combined_subject_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        {subjectConfId && (
          <div className="bg-blue-50/10 backdrop-blur-sm border border-blue-200/20 rounded-lg p-4 mb-4 animate-fadeIn">
            <p className="text-sm text-[#441a05]">
              <strong>Debug Info:</strong> Subject Config ID: {subjectConfId}, Class ID: {classId}, Mark Configs Found: {markConfigs?.length || 0}, Students: {students?.length || 0}
            </p>
          </div>
        )}

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

        {selectedClassConfigId && !students?.length && (
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
        {students?.length > 0 && markConfigs?.length > 0 && (
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
                    {hasDeletePermission && (
                      <th className="px-6 py-4 text-center text-sm font-bold text-[#441a05] uppercase tracking-wider">
                        অ্যাকশন
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {students.map((student, index) => (
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
                      {markConfigs.map((config) => (
                        <td key={config.id} className="px-6 py-4 text-center">
                          <div className="relative inline-block">
                            <input
                              type="number"
                              value={marks[`${student.id}_${config.id}`] || ''}
                              onChange={(e) => handleMarkChange(student.id, config.id, e.target.value)}
                              onBlur={(e) => handleMarkBlur(student.id, config.id, e.target.value)}
                              onKeyPress={(e) => handleMarkKeyPress(e, student.id, config.id, e.target.value)}
                              className={`w-20 h-12 text-center border-2 rounded-lg font-semibold transition-all duration-200 tick-glow ${
                                absentStudents.has(student.id)
                                  ? 'bg-gray-100 border-[#9d9087] text-[#441a05]/50 cursor-not-allowed'
                                  : 'bg-white/10 border-[#9d9087] text-[#441a05] hover:border-[#DB9E30] focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30]'
                              }`}
                              disabled={absentStudents.has(student.id) || !hasChangePermission}
                              min="0"
                              max={config.max_mark}
                              placeholder="0"
                              aria-label={`মার্ক প্রবেশ করান ${student.name} ${config.mark_type_name}`}
                              title={`মার্ক প্রবেশ করান / Enter marks for ${student.name} in ${config.mark_type_name}`}
                            />
                            {getSavingStateIcon(student.id, config.id)}
                          </div>
                        </td>
                      ))}
                      {hasChangePermission && (
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleAbsent(student.id)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 btn-glow ${
                              absentStudents.has(student.id)
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-[#DB9E30] text-[#441a05] hover:bg-[#DB9E30]/80'
                            }`}
                            aria-label={`উপস্থিতি টগল করুন ${student.name}`}
                            title={`উপস্থিতি টগল করুন / Toggle attendance for ${student.name}`}
                          >
                            {absentStudents.has(student.id) ? 'অনুপস্থিত' : 'উপস্থিত'}
                          </button>
                        </td>
                      )}
                      {hasDeletePermission && (
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => deleteStudentMarks(student.id)}
                            className="w-10 h-10 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all duration-200 transform hover:scale-110 flex items-center justify-center btn-glow"
                            aria-label={`মার্ক মুছুন ${student.name}`}
                            title={`মার্ক মুছুন / Delete marks for ${student.name}`}
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Stats */}
            <div className="bg-white/10 px-6 py-4 border-t border-white/20">
              <div className="flex items-center justify-between text-sm text-[#441a05]">
                <div className="flex items-center space-x-6">
                  <span className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>মোট ছাত্র: {students.length}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>অনুপস্থিত: {absentStudents.size}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[#DB9E30] rounded-full"></div>
                    <span>উপস্থিত: {students.length - absentStudents.size}</span>
                  </span>
                </div>
                <div className="text-xs text-[#441a05]/70">
                  স্বয়ংক্রিয় সংরক্ষণ সক্রিয় • সংরক্ষণের জন্য এন্টার চাপুন বা বাইরে ক্লিক করুন
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No marks config message */}
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

        {/* Empty state when no filters selected */}
        {!examId && !academicYearId && !selectedClassConfigId && !subjectConfId && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-[#441a05] mb-2">মার্ক এন্ট্রি শুরু করতে প্রস্তুত?</h3>
            <p className="text-[#441a05]/70">উপরের ফিল্টারগুলি ব্যবহার করে পরীক্ষা, শিক্ষাবর্ষ, ক্লাস এবং বিষয় নির্বাচন করুন</p>
          </div>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && hasDeletePermission && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                মার্ক মুছে ফেলা নিশ্চিত করুন
              </h3>
              <p className="text-[#441a05] mb-6">
                আপনি কি নিশ্চিত যে এই ছাত্রের সব মার্ক মুছে ফেলতে চান?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন / Cancel"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন / Confirm"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectMarks;