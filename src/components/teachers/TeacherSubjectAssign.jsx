import React, { useEffect, useMemo, useState } from 'react';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import Select from 'react-select';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

import { useGetTeacherStaffProfilesQuery } from '../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetClassSubjectsQuery } from '../../redux/features/api/class-subjects/classSubjectsApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import {
  useCreateTeacherSubjectAssignMutation,
  useGetTeacherSubjectAssignsQuery,
  useUpdateTeacherSubjectAssignMutation
} from '../../redux/features/api/teacherSubjectAssigns/teacherSubjectAssignsApi';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';

const TeacherSubjectAssign = () => {
  const { group_id } = useSelector((s) => s.auth);

  // ---- form states ----
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);

  // class -> single-select (array but will keep max 1)
  const [selectedClasses, setSelectedClasses] = useState([]);
  // subjects -> multi
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState('');

  // existing assignment (for update)
  const [assignmentId, setAssignmentId] = useState(null);

  // table filter states
  const [tableTeacherFilter, setTableTeacherFilter] = useState(null);
  const [tableClassFilter, setTableClassFilter] = useState(null);

  // ---- queries ----
  const { data: teachers, isLoading: teachersLoading } = useGetTeacherStaffProfilesQuery();
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
  const { data: classSubjects = [], isLoading: subjectsLoading } = useGetClassSubjectsQuery();
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: teacherAssignments, isLoading: assignmentsLoading } = useGetTeacherSubjectAssignsQuery(undefined, { skip: false });

  const [createAssignment, { isLoading: createLoading }] = useCreateTeacherSubjectAssignMutation();
  const [updateAssignment, { isLoading: updateLoading }] = useUpdateTeacherSubjectAssignMutation();

  // ---- permissions ----
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_teachersubjectassign') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_teachersubjectassign') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_teachersubjectassign') || false;

  // ---- select options ----
  const teacherOptions = useMemo(
    () => teachers?.map(t => ({ value: t.id, label: t.name || `শিক্ষক ${t.id}` })) || [],
    [teachers]
  );

  const academicYearOptions = useMemo(
    () => academicYears?.map(y => ({ value: y.id, label: y.name || `বছর ${y.id}` })) || [],
    [academicYears]
  );

  const classLabel = (c) => `${c.class_name} ${c.group_name || ""} - ${c.section_name || ""} (${c.shift_name || ""})`;
  const classOptions = useMemo(
    () => classes?.map(c => ({ value: c.id, label: classLabel(c) })) || [],
    [classes]
  );

  // ---- react-select styles ----
  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'transparent',
      borderColor: '#9d9087',
      borderRadius: '10px',
      paddingLeft: '0.5rem',
      paddingTop: 4,
      paddingBottom: 4,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '15px',
      transition: 'all 0.2s ease',
      '&:hover': { borderColor: '#441a05' }
    }),
    placeholder: (b) => ({ ...b, color: '#441a05', opacity: 0.7 }),
    singleValue: (b) => ({ ...b, color: '#441a05' }),
    menu: (b) => ({ ...b, zIndex: 50 }),
    menuPortal: (b) => ({ ...b, zIndex: 50 }),
    option: (b, { isFocused, isSelected }) => ({
      ...b,
      color: '#441a05',
      backgroundColor: isSelected ? '#DB9E30' : isFocused ? 'rgba(219,158,48,.12)' : 'transparent',
      cursor: 'pointer'
    })
  };

  // ---- filtered subjects by currently selected class (single-select) ----
  const filteredSubjects = useMemo(() => {
    if (selectedClasses.length === 0) return [];
    const onlyClassId = selectedClasses[0];
    const gClassId = classes?.find(cls => cls.id === onlyClassId)?.g_class_id;
    return (classSubjects || []).filter(sub => sub?.class_info?.id === gClassId);
  }, [selectedClasses, classes, classSubjects]);

  // ---- subject search filter ----
  const visibleSubjects = useMemo(() => {
    const list = filteredSubjects || [];
    const q = subjectSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(s => (s?.name || '').toLowerCase().includes(q));
  }, [filteredSubjects, subjectSearch]);

  // ---- keep subjects valid when class changes ----
  useEffect(() => {
    if (selectedClasses.length === 0) {
      setSelectedSubjects([]);
    } else {
      const allowed = new Set(filteredSubjects.map(s => s.id));
      setSelectedSubjects(prev => prev.filter(id => allowed.has(id)));
    }
  }, [selectedClasses, filteredSubjects]);

  // ---- prefill on teacher change + set table default filter ----
  useEffect(() => {
    if (teacherAssignments && selectedTeacher) {
      const relevant = teacherAssignments.filter(a => a.teacher_id === parseInt(selectedTeacher.value));
      const assignedClasses = relevant.flatMap(a => a.class_assigns || []).filter(Boolean);
      const assignedSubjects = relevant.flatMap(a => a.subject_assigns || []).filter(Boolean);

      setSelectedClasses(assignedClasses.length ? [assignedClasses[0]] : []);
      setSelectedSubjects(assignedSubjects);
      setAssignmentId(relevant.length > 0 ? relevant[0].id : null);

      setTableTeacherFilter({ value: selectedTeacher.value, label: selectedTeacher.label });
    } else {
      setSelectedClasses([]);
      setSelectedSubjects([]);
      setAssignmentId(null);
      setTableTeacherFilter(null);
    }
    setTableClassFilter(null);
  }, [teacherAssignments, selectedTeacher]);

  // ---- handlers ----
  const handleClassChange = (classId) => {
    const canModify = assignmentId ? hasChangePermission : hasAddPermission;
    if (!canModify) {
      toast.error('ক্লাস নির্বাচন করার অনুমতি নেই।');
      return;
    }
    // toggle single-select
    setSelectedClasses(prev => (prev.includes(classId) ? [] : [classId]));
  };

  const handleSubjectChange = (subjectId) => {
    if (!selectedTeacher) {
      toast.error('প্রথমে একজন শিক্ষক নির্বাচন করুন।');
      return;
    }
    const canModify = assignmentId ? hasChangePermission : hasAddPermission;
    if (!canModify) {
      toast.error('বিষয় নির্বাচন করার অনুমতি নেই।');
      return;
    }
    setSelectedSubjects(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  const validateForm = () => {
    if (!selectedTeacher) { toast.error('অনুগ্রহ করে একজন শিক্ষক নির্বাচন করুন'); return false; }
    if (!selectedAcademicYear) { toast.error('অনুগ্রহ করে একাডেমিক বছর নির্বাচন করুন'); return false; }
    if (selectedClasses.length === 0) { toast.error('অনুগ্রহ করে একটি ক্লাস নির্বাচন করুন'); return false; }
    if (selectedSubjects.length === 0) { toast.error('অনুগ্রহ করে কমপক্ষে একটি বিষয় নির্বাচন করুন'); return false; }
    return true;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredPermission = assignmentId ? hasChangePermission : hasAddPermission;
    const actionType = assignmentId ? 'আপডেট' : 'তৈরি';
    if (!requiredPermission) { toast.error(`অ্যাসাইনমেন্ট ${actionType} করার অনুমতি নেই।`); return; }
    if (!validateForm()) return;

    const payload = {
      subject_assigns: selectedSubjects,
      class_assigns: selectedClasses, // single id array
      teacher_id: parseInt(selectedTeacher.value),
      academic_year: parseInt(selectedAcademicYear.value),
    };

    setModalAction(assignmentId ? 'update' : 'create');
    setModalData(payload);
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        if (!hasAddPermission) { toast.error('অ্যাসাইনমেন্ট তৈরি করার অনুমতি নেই।'); return; }
        await createAssignment(modalData).unwrap();
        toast.success('অ্যাসাইনমেন্ট সফলভাবে তৈরি হয়েছে!');
      } else if (modalAction === 'update') {
        if (!hasChangePermission) { toast.error('অ্যাসাইনমেন্ট আপডেট করার অনুমতি নেই।'); return; }
        await updateAssignment({ id: assignmentId, ...modalData }).unwrap();
        toast.success('অ্যাসাইনমেন্ট সফলভাবে আপডেট হয়েছে!');
      }
    } catch (err) {
      let msg = 'অজানা ত্রুটি ঘটেছে';
      if (err?.status === 400 && err?.data) {
        msg = typeof err.data === 'object'
          ? Object.entries(err.data).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join('; ')
          : (err.data || msg);
      } else if (err?.error) msg = err.error;
      toast.error(`ব্যর্থ: ${msg}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // ---- table list with filters ----
  const tableFilteredAssignments = useMemo(() => {
    let list = teacherAssignments || [];
    if (tableTeacherFilter?.value) {
      list = list.filter(a => a.teacher_id === tableTeacherFilter.value);
    }
    if (tableClassFilter?.value) {
      list = list.filter(a => Array.isArray(a.class_assigns) && a.class_assigns.includes(tableClassFilter.value));
    }
    return list;
  }, [teacherAssignments, tableTeacherFilter, tableClassFilter]);

  const isSubmitDisabled =
    createLoading || updateLoading || assignmentsLoading ||
    (assignmentId && !hasChangePermission) || (!assignmentId && !hasAddPermission);

  if (teachersLoading || classesLoading || subjectsLoading || yearsLoading || permissionsLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="bg-black/10 backdrop-blur-sm rounded-xl shadow-lg p-6 flex items-center space-x-3 animate-fadeIn">
          <FaSpinner className="animate-spin text-xl text-[#441a05]" />
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
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn .4s ease-out both; }
      `}</style>

      {/* Form */}
      {(hasAddPermission || hasChangePermission) && (
        <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-6 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <IoAddCircle className="text-3xl text-[#441a05]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#441a05] tracking-tight">
              শিক্ষকের জন্য বিষয় অ্যাসাইনমেন্ট
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Teacher + Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">শিক্ষক</label>
                <Select
                  options={teacherOptions}
                  value={selectedTeacher}
                  onChange={setSelectedTeacher}
                  placeholder="শিক্ষক নির্বাচন করুন"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={selectStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">একাডেমিক বছর</label>
                <Select
                  options={academicYearOptions}
                  value={selectedAcademicYear}
                  onChange={setSelectedAcademicYear}
                  placeholder="একাডেমিক বছর নির্বাচন করুন"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isSearchable={false}
                  styles={selectStyles}
                  isDisabled={!hasAddPermission && !hasChangePermission}
                />
              </div>
            </div>

            {/* Class (single-select) — improved UI */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="block text-sm font-semibold text-[#441a05]">ক্লাস (একটি নির্বাচন করুন)</label>
                <div className="text-xs text-[#441a05]/70">
                  {selectedClasses.length ? `নির্বাচিত: ${classLabel(classes.find(c => c.id === selectedClasses[0]) || {})}` : 'কোনো ক্লাস নির্বাচন করা হয়নি'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {classes?.map((classItem, idx) => {
                  const active = selectedClasses.includes(classItem.id);
                  return (
                    <button
                      type="button"
                      key={classItem.id}
                      onClick={() => handleClassChange(classItem.id)}
                      disabled={!hasAddPermission && !hasChangePermission}
                      className={`text-left rounded-xl border transition-all p-4 hover:shadow-sm animate-fadeIn ${
                        active
                          ? 'border-[#DB9E30] bg-[#DB9E30]/10'
                          : 'border-[#9d9087]/50 bg-white/50 hover:border-[#441a05]'
                      }`}
                      style={{ animationDelay: `${idx * 0.02}s` }}
                      title="ক্লাস নির্বাচন করুন"
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-[#441a05]">{classItem.class_name} • {classItem.section_name}</div>
                        <div className={`w-4 h-4 rounded-full border ${active ? 'bg-[#DB9E30] border-[#DB9E30]' : 'border-[#9d9087]'}`} />
                      </div>
                      <div className="text-xs text-[#441a05]/70 mt-1">
                        গ্রুপ: {classItem.group_name} • শিফট: {classItem.shift_name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subjects — improved UI with search, chips */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="block text-sm font-semibold text-[#441a05]">বিষয় নির্বাচন</label>
                <div className="text-xs text-[#441a05]/70">
                  মোট {visibleSubjects.length} | নির্বাচিত {selectedSubjects.length}
                </div>
              </div>

              {/* toolbar */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#441a05]/60 text-xs" />
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="বিষয় সার্চ করুন..."
                    className="pl-8 pr-3 py-2 rounded-lg border border-[#9d9087] bg-white/70 text-sm text-[#441a05] placeholder-[#441a05]/60 focus:outline-none focus:border-[#441a05] min-w-[220px]"
                    disabled={!selectedTeacher || selectedClasses.length === 0}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubjects([])}
                  disabled={!selectedTeacher || selectedSubjects.length === 0}
                  className={`px-3 py-2 rounded-lg border text-sm transition ${
                    !selectedTeacher || selectedSubjects.length === 0
                      ? 'border-[#9d9087]/40 text-[#441a05]/40 cursor-not-allowed'
                      : 'border-[#9d9087] text-[#441a05] hover:bg-[#441a05]/5'
                  }`}
                  title="সাবজেক্ট সিলেকশন ক্লিয়ার করুন"
                >
                  Clear
                </button>
              </div>

              {/* states */}
              {!selectedTeacher ? (
                <p className="text-[#441a05]/70 mt-2 animate-fadeIn">প্রথমে একজন শিক্ষক নির্বাচন করুন।</p>
              ) : selectedClasses.length === 0 ? (
                <p className="text-[#441a05]/70 mt-2 animate-fadeIn">প্রথমে একটি ক্লাস নির্বাচন করুন।</p>
              ) : visibleSubjects.length === 0 ? (
                <p className="text-[#441a05]/70 mt-2 animate-fadeIn">কোনো বিষয় পাওয়া যায়নি।</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {visibleSubjects.map((subject, i) => {
                    const checked = selectedSubjects.includes(subject.id);
                    const disabled = !selectedTeacher || (!hasAddPermission && !hasChangePermission);
                    return (
                      <label
                        key={subject.id}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 cursor-pointer select-none text-sm animate-fadeIn ${
                          checked ? 'border-[#DB9E30] bg-[#DB9E30]/10' : 'border-[#9d9087]/60 bg-white/70 hover:border-[#441a05]'
                        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        style={{ animationDelay: `${i * 0.01}s` }}
                        title={disabled ? 'প্রথমে শিক্ষক নির্বাচন করুন' : 'সাবজেক্ট নির্বাচন করুন'}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => handleSubjectChange(subject.id)}
                          disabled={disabled}
                        />
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                          checked ? 'bg-[#DB9E30] border-[#DB9E30]' : 'border-[#9d9087]'
                        }`}>
                          {checked && (
                            <svg className="w-3 h-3 text-[#441a05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className="text-[#441a05]">{subject?.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit */}
            {(hasAddPermission || hasChangePermission) && (
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`relative inline-flex items-center px-7 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition ${
                  isSubmitDisabled ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90'
                }`}
              >
                {createLoading || updateLoading ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    <span>প্রক্রিয়াকরণ...</span>
                  </span>
                ) : (
                  <span>{assignmentId ? 'অ্যাসাইনমেন্ট আপডেট করুন' : 'অ্যাসাইনমেন্ট সংরক্ষণ করুন'}</span>
                )}
              </button>
            )}
          </form>
        </div>
      )}

      {/* Assignment Table + Filters */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <div className="flex flex-wrap items-end justify-between gap-3 p-4 border-b border-[#441a05]/20">
          <h3 className="text-lg font-semibold text-[#441a05]">বর্তমান অ্যাসাইনমেন্ট</h3>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="min-w-[220px]">
              <label className="block text-xs font-medium text-[#441a05] mb-1">Teacher Filter</label>
              <Select
                options={teacherOptions}
                value={tableTeacherFilter}
                onChange={setTableTeacherFilter}
                isClearable
                placeholder="All teachers"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={selectStyles}
              />
            </div>
            <div className="min-w-[240px]">
              <label className="block text-xs font-medium text-[#441a05] mb-1">Class Filter</label>
              <Select
                options={classOptions}
                value={tableClassFilter}
                onChange={setTableClassFilter}
                isClearable
                placeholder="All classes"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={selectStyles}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setTableTeacherFilter(selectedTeacher ? { value: selectedTeacher.value, label: selectedTeacher.label } : null);
                setTableClassFilter(null);
              }}
              className="px-3 py-2 rounded-lg border border-[#9d9087] text-[#441a05] hover:bg-[#441a05]/5 transition"
              title="Clear filters"
            >
              Clear filters
            </button>
          </div>
        </div>

        {assignmentsLoading ? (
          <p className="text-[#441a05]/70 p-4 animate-fadeIn">অ্যাসাইনমেন্ট লোড হচ্ছে...</p>
        ) : tableFilteredAssignments.length === 0 ? (
          <p className="text-[#441a05]/70 p-4 animate-fadeIn">কোনো অ্যাসাইনমেন্ট পাওয়া যায়নি।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#441a05]/20">
              <thead className="bg-[#441a05]/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">শিক্ষক</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ক্লাস</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">বিষয়</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">একাডেমিক বছর</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#441a05]/20">
                {tableFilteredAssignments.map((assignment, idx) => (
                  <tr key={assignment.id} className="bg-[#441a05]/5 animate-fadeIn" style={{ animationDelay: `${idx * 0.02}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {teachers?.find(t => t.id === assignment.teacher_id)?.name || 'অজানা'}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-[#441a05]">
                      {assignment.class_assigns
                        ?.map(id => classes?.find(c => c.id === id))
                        .filter(Boolean)
                        .map(c => classLabel(c))
                        .join(', ') || 'কোনো ক্লাস নেই'}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-[#441a05]">
                      {assignment.subject_assigns
                        ?.map(id => classSubjects?.find(s => s.id === id))
                        .filter(Boolean)
                        .map(s => s.name)
                        .join(', ') || 'কোনো বিষয় নেই'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {academicYears?.find(y => y.id === assignment.academic_year)?.name || 'অজানা'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {isModalOpen && (hasAddPermission || hasChangePermission) && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-fadeIn">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              {modalAction === 'create' ? 'অ্যাসাইনমেন্ট তৈরি নিশ্চিত করুন' : 'অ্যাসাইনমেন্ট আপডেট নিশ্চিত করুন'}
            </h3>
            <p className="text-[#441a05] mb-6">
              {modalAction === 'create'
                ? 'আপনি কি নিশ্চিত যে অ্যাসাইনমেন্ট তৈরি করতে চান?'
                : 'আপনি কি নিশ্চিত যে অ্যাসাইনমেন্ট আপডেট করতে চান?'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition"
              >
                বাতিল
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:opacity-90 transition"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSubjectAssign;
