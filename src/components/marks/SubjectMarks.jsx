import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { 
  useCreateSubjectMarkMutation,
  useGetSubjectMarksQuery,
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
  
  const { data: exams, isLoading: examsLoading } = useGetExamApiQuery();
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
  const { data: subjectConfigs, isLoading: subjectConfigsLoading, isFetching: subjectConfigsFetching } = useGetSubjectConfigByIdQuery(classId, { skip: !classId });
  const { data: markConfigs, isLoading: markConfigsLoading } = useGetFilteredMarkConfigsQuery(
    { class_id: classId, subject_conf: subjectConfId }, 
    { skip: !classId || !subjectConfId }
  );
  const { data: students, isLoading: studentsLoading, isFetching: studentsFetching } = useGetStudentActiveByClassQuery(
    selectedClassConfigId, { skip: !selectedClassConfigId }
  );

  const currentSubjectId = subjectConfigs?.find(config => config.id.toString() === subjectConfId)?.subject_id;
  const { data: existingMarks, refetch: refetchMarks } = useGetSubjectMarksQuery(
    { exam_id: examId, class_id: classId, subject_id: currentSubjectId },
    { skip: !examId || !classId || !currentSubjectId }
  );

  const [createSubjectMark] = useCreateSubjectMarkMutation();
  const [updateSubjectMark] = useUpdateSubjectMarkMutation();

  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_subjectmark') || false;

  // reset when class changes
  useEffect(() => {
    if (classId) {
      setSubjectConfId('');
      setMarks({});
      setAbsentStudents({});
    }
  }, [classId]);

  // load existing marks
  useEffect(() => {
    setMarks({});
    setAbsentStudents({});
    if (existingMarks && existingMarks.length > 0) {
      const marksMap = {};
      const absentMap = {};
      existingMarks.forEach((mark) => {
        marksMap[`${mark.student}_${mark.mark_conf}`] = mark.obtained;
        absentMap[`${mark.student}_${mark.mark_conf}`] = mark.is_absent;
      });
      setMarks(marksMap);
      setAbsentStudents(absentMap);
    }
  }, [existingMarks, examId, currentSubjectId, classId]);

  const handleMarkChange = (studentId, markConfigId, value) => {
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

  const saveIndividualMark = async (studentId, markConfigId, value) => {
    try {
      const isAbsent = absentStudents[`${studentId}_${markConfigId}`] || false;
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
      refetchMarks();
    } catch (error) {
      console.error(error);
      toast.error("মার্ক সংরক্ষণ ব্যর্থ হয়েছে।");
    }
  };

  // ✅ subject-wise absent toggle
  const toggleAbsent = async (studentId, subjectConfId) => {
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
      toast.error("অনুপস্থিতি আপডেট ব্যর্থ হয়েছে।");
    }
  };

  if (subjectConfigsLoading || subjectConfigsFetching || studentsLoading || studentsFetching || examsLoading || yearsLoading || classesLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-2xl text-[#441a05]" />
        <span className="ml-2 text-[#441a05]">লোড হচ্ছে...</span>
      </div>
    );
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="py-8">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex items-center space-x-4 mb-6 ml-5">
        <IoAddCircle className="text-4xl text-[#441a05]" />
        <h1 className="sm:text-2xl text-xl font-bold text-[#441a05]">বিষয় মার্ক এন্ট্রি</h1>
      </div>

      {/* Filters */}
      <div className="bg-black/10 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select value={examId} onChange={(e) => setExamId(e.target.value)}>
            <option value="">পরীক্ষা নির্বাচন করুন</option>
            {exams?.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
          </select>
          <select value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}>
            <option value="">শিক্ষাবর্ষ</option>
            {academicYears?.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
          </select>
          <select value={selectedClassConfigId} onChange={(e) => {
            const selectedId = e.target.value;
            setSelectedClassConfigId(selectedId);
            const selectedClass = classes?.find((cls) => cls.id.toString() === selectedId);
            setClassId(selectedClass ? selectedClass.class_id.toString() : '');
            setSubjectConfId('');
          }}>
            <option value="">ক্লাস</option>
            {classes?.map((cls) => <option key={cls.id} value={cls.id}>{cls.class_name} - {cls.section_name}</option>)}
          </select>
          <select value={subjectConfId} onChange={(e) => setSubjectConfId(e.target.value)}>
            <option value="">বিষয়</option>
            {subjectConfigs?.map((conf) => <option key={conf.id} value={conf.id}>{conf.combined_subject_name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {students?.length > 0 && markConfigs?.length > 0 && (
        <div className="bg-black/10 rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left">ছাত্র</th>
                {markConfigs.map((config) => (
                  <th key={config.id} className="px-6 py-4 text-center">{config.mark_type_name}</th>
                ))}
                <th className="px-6 py-4 text-center">উপস্থিতি</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4">{student.name}</td>
                  {markConfigs.map((config) => {
                    const key = `${student.id}_${config.id}`;
                    return (
                      <td key={config.id} className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={marks[key] || ''}
                          onChange={(e) => handleMarkChange(student.id, config.id, e.target.value)}
                          onBlur={(e) => saveIndividualMark(student.id, config.id, e.target.value)}
                          disabled={absentStudents[key]}
                          className="w-20 border rounded-lg text-center"
                        />
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleAbsent(student.id, subjectConfId)}
                      className={`ml-2 px-3 py-1 rounded-lg text-sm ${
                        markConfigs.some((c) => absentStudents[`${student.id}_${c.id}`])
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {markConfigs.some((c) => absentStudents[`${student.id}_${c.id}`]) ? 'অনুপস্থিত' : 'উপস্থিত'}
                    </button>
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

export default SubjectMarks;
