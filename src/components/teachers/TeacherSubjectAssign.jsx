import React, { useEffect, useMemo, useState, useCallback } from 'react';
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

  // ---- selections ----
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);

  // Multi-class selection
  const [selectedClassIds, setSelectedClassIds] = useState([]); // [classConfig.id, ...]
  // Per-class subject selection
  const [selectedSubjectsByClass, setSelectedSubjectsByClass] = useState({}); // { [classId]: number[] }
  // Per-class search
  const [subjectSearchByClass, setSubjectSearchByClass] = useState({}); // { [classId]: string }

  // ---- queries ----
  const { data: teachers, isLoading: teachersLoading } = useGetTeacherStaffProfilesQuery();
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
  const { data: allClassSubjects = [], isLoading: subjectsLoading } = useGetClassSubjectsQuery();
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: teacherAssignments, isLoading: assignmentsLoading, refetch: refetchAssignments } = useGetTeacherSubjectAssignsQuery(undefined, { skip: false });

  const [createAssignment, { isLoading: createLoading }] = useCreateTeacherSubjectAssignMutation();
  const [updateAssignment, { isLoading: updateLoading }] = useUpdateTeacherSubjectAssignMutation();

  // ---- permissions ----
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_teachersubjectassign') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_teachersubjectassign') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_teachersubjectassign') || false;

  // ---- options ----
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

  // react-select styles (menuPortal to fix z-index)
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
    menu: (b) => ({ ...b, zIndex: 60 }),
    menuPortal: (b) => ({ ...b, zIndex: 60 }),
    option: (b, { isFocused, isSelected }) => ({
      ...b,
      color: '#441a05',
      backgroundColor: isSelected ? '#DB9E30' : isFocused ? 'rgba(219,158,48,.12)' : 'transparent',
      cursor: 'pointer'
    })
  };

  // Helper: subjects list for a specific classConfig.id
  const getSubjectsForClass = useCallback((classId) => {
    const gClassId = classes?.find(c => c.id === classId)?.g_class_id;
    return (allClassSubjects || []).filter(s => s?.class_info?.id === gClassId);
  }, [classes, allClassSubjects]);

  // Prefill from existing assignment when teacher + year selected
  useEffect(() => {
    if (!selectedTeacher || !selectedAcademicYear || !teacherAssignments || !classes) return;

    const teacherId = Number(selectedTeacher.value);
    const yearId = Number(selectedAcademicYear.value);
    const existing = (teacherAssignments || []).find(a => a.teacher_id === teacherId && a.academic_year === yearId);

    if (!existing) {
      setSelectedClassIds([]);
      setSelectedSubjectsByClass({});
      setSubjectSearchByClass({});
      return;
    }

    // Prefill class ids
    const preClasses = Array.from(new Set(existing.class_assigns || []));

    // Prefill subjects per class by inferring from subject.class_info.id
    const map = {};
    preClasses.forEach(cid => { map[cid] = []; });

    (existing.subject_assigns || []).forEach(subId => {
      const subject = allClassSubjects.find(s => s.id === subId);
      if (!subject?.class_info?.id) return;
      // find which classConfig has this g_class_id
      const ownerClass = classes.find(c => c.g_class_id === subject.class_info.id);
      if (ownerClass) {
        if (!map[ownerClass.id]) map[ownerClass.id] = [];
        map[ownerClass.id].push(subId);
      }
    });

    setSelectedClassIds(preClasses);
    setSelectedSubjectsByClass(map);
    setSubjectSearchByClass({});
  }, [selectedTeacher, selectedAcademicYear, teacherAssignments, classes, allClassSubjects]);

  // Toggle class select (multi)
  const toggleClass = (classId) => {
    const canModify = hasAddPermission || hasChangePermission;
    if (!canModify) { toast.error('ক্লাস নির্বাচন করার অনুমতি নেই।'); return; }
    setSelectedClassIds(prev => {
      if (prev.includes(classId)) {
        const next = prev.filter(id => id !== classId);
        // drop selected subjects & search for this class
        setSelectedSubjectsByClass(s => {
          const copy = { ...s }; delete copy[classId]; return copy;
        });
        setSubjectSearchByClass(s => {
          const copy = { ...s }; delete copy[classId]; return copy;
        });
        return next;
      }
      return [...prev, classId];
    });
  };

  // Toggle subject in a class
  const toggleSubjectInClass = (classId, subjectId) => {
    if (!selectedTeacher) { toast.error('প্রথমে একজন শিক্ষক নির্বাচন করুন।'); return; }
    const canModify = hasAddPermission || hasChangePermission;
    if (!canModify) { toast.error('বিষয় নির্বাচন করার অনুমতি নেই।'); return; }

    setSelectedSubjectsByClass(prev => {
      const list = prev[classId] || [];
      return {
        ...prev,
        [classId]: list.includes(subjectId) ? list.filter(id => id !== subjectId) : [...list, subjectId]
      };
    });
  };

  const selectAllForClass = (classId) => {
    const subjects = getSubjectsForClass(classId);
    setSelectedSubjectsByClass(prev => ({ ...prev, [classId]: subjects.map(s => s.id) }));
  };
  const clearClassSelection = (classId) => {
    setSelectedSubjectsByClass(prev => ({ ...prev, [classId]: [] }));
  };

  const setSearchForClass = (classId, val) => {
    setSubjectSearchByClass(prev => ({ ...prev, [classId]: val }));
  };

  // visible subjects per class (with search)
  const visibleSubjectsForClass = (classId) => {
    const q = (subjectSearchByClass[classId] || '').trim().toLowerCase();
    const list = getSubjectsForClass(classId);
    if (!q) return list;
    return list.filter(s => (s?.name || '').toLowerCase().includes(q));
  };

  // ---- submit (MERGE instead of replace) ----
  const union = (a = [], b = []) => Array.from(new Set([...(a || []), ...(b || [])]));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTeacher) { toast.error('শিক্ষক নির্বাচন করুন।'); return; }
    if (!selectedAcademicYear) { toast.error('একাডেমিক বছর নির্বাচন করুন।'); return; }
    if (selectedClassIds.length === 0) { toast.error('কমপক্ষে একটি ক্লাস নির্বাচন করুন।'); return; }

    // collect selected subjects across classes
    const chosenSubjects = selectedClassIds.flatMap(cid => selectedSubjectsByClass[cid] || []);
    if (chosenSubjects.length === 0) { toast.error('কমপক্ষে একটি বিষয় নির্বাচন করুন।'); return; }

    const teacherId = Number(selectedTeacher.value);
    const yearId = Number(selectedAcademicYear.value);

    // find existing assignment for teacher+year
    const existing = (teacherAssignments || []).find(a => a.teacher_id === teacherId && a.academic_year === yearId);

    const payloadBase = {
      teacher_id: teacherId,
      academic_year: yearId
    };

    try {
      if (!existing) {
        // CREATE fresh with all selected classes + subjects
        const payload = {
          ...payloadBase,
          class_assigns: Array.from(new Set(selectedClassIds)),
          subject_assigns: Array.from(new Set(chosenSubjects))
        };
        if (!hasAddPermission) { toast.error('অ্যাসাইনমেন্ট তৈরি করার অনুমতি নেই।'); return; }
        await createAssignment(payload).unwrap();
        toast.success('অ্যাসাইনমেন্ট সংরক্ষণ হয়েছে (নতুন)!');
      } else {
        // UPDATE by merging with previous (no replacement)
        const mergedClasses = union(existing.class_assigns, selectedClassIds);
        const mergedSubjects = union(existing.subject_assigns, chosenSubjects);

        const payload = {
          ...payloadBase,
          id: existing.id,
          class_assigns: mergedClasses,
          subject_assigns: mergedSubjects
        };
        if (!hasChangePermission) { toast.error('অ্যাসাইনমেন্ট আপডেট করার অনুমতি নেই।'); return; }
        await updateAssignment(payload).unwrap();
        toast.success('অ্যাসাইনমেন্ট সফলভাবে আপডেট (merge) হয়েছে!');
      }

      // refresh + keep UI state
      refetchAssignments();
    } catch (err) {
      let msg = 'অজানা ত্রুটি';
      if (err?.status === 400 && err?.data) {
        msg = typeof err.data === 'object'
          ? Object.entries(err.data).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join('; ')
          : (err.data || msg);
      } else if (err?.error) msg = err.error;
      toast.error(`ব্যর্থ: ${msg}`);
    }
  };

  // ---- table filters (same as before) ----
  const [tableTeacherFilter, setTableTeacherFilter] = useState(null);
  const [tableClassFilter, setTableClassFilter] = useState(null);

  // auto set table teacher filter when teacher selected
  useEffect(() => {
    if (selectedTeacher) {
      setTableTeacherFilter({ value: selectedTeacher.value, label: selectedTeacher.label });
    } else {
      setTableTeacherFilter(null);
    }
  }, [selectedTeacher]);

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

  const isLoading = teachersLoading || classesLoading || subjectsLoading || yearsLoading || permissionsLoading;
  const isSubmitDisabled = createLoading || updateLoading || assignmentsLoading || (!hasAddPermission && !hasChangePermission);

  if (isLoading) {
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
        .animate-fadeIn { animation: fadeIn .35s ease-out both; }
      `}</style>

      {/* Form */}
      {(hasAddPermission || hasChangePermission) && (
        <div className="bg-black/10 backdrop-blur-sm border border-[#441a05]/20 p-6 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <IoAddCircle className="text-3xl text-[#441a05]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#441a05] tracking-tight">
              শিক্ষকের জন্য বিষয় অ্যাসাইনমেন্ট (মাল্টি-ক্লাস, মাল্টি-সাবজেক্ট)
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
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isSearchable={false}
                  styles={selectStyles}
                />
              </div>
            </div>

            {/* Classes (multi) */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="block text-sm font-semibold text-[#441a05]">ক্লাস নির্বাচন (একাধিক)</label>
                <div className="text-xs text-[#441a05]/70">
                  নির্বাচিত: {selectedClassIds.length} টি
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {classes?.map((classItem, idx) => {
                  const active = selectedClassIds.includes(classItem.id);
                  return (
                    <button
                      type="button"
                      key={classItem.id}
                      onClick={() => toggleClass(classItem.id)}
                      className={`text-left rounded-xl border transition-all p-4 hover:shadow-sm animate-fadeIn ${
                        active
                          ? 'border-[#DB9E30] bg-[#DB9E30]/10'
                          : 'border-[#9d9087]/50 bg-white/50 hover:border-[#441a05]'
                      }`}
                      style={{ animationDelay: `${idx * 0.02}s` }}
                      title="ক্লাস নির্বাচন/বাতিল করুন"
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

            {/* Subjects per selected class */}
            <div className="space-y-6">
              {selectedClassIds.length === 0 ? (
                <p className="text-[#441a05]/70 animate-fadeIn">প্রথমে ক্লাস নির্বাচন করুন।</p>
              ) : (
                selectedClassIds.map((cid) => {
                  const cls = classes.find(c => c.id === cid);
                  const visible = visibleSubjectsForClass(cid);
                  const picked = selectedSubjectsByClass[cid] || [];
                  const disabled = !selectedTeacher;
                  return (
                    <div key={cid} className="bg-white/70 border border-[#9d9087]/50 rounded-xl p-4 animate-fadeIn">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="text-[#441a05] font-semibold">
                          ক্লাস: {classLabel(cls)}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#441a05]/60 text-xs" />
                            <input
                              type="text"
                              value={subjectSearchByClass[cid] || ''}
                              onChange={(e) => setSearchForClass(cid, e.target.value)}
                              placeholder="বিষয় সার্চ..."
                              className="pl-8 pr-3 py-2 rounded-lg border border-[#9d9087] bg-white text-sm text-[#441a05] placeholder-[#441a05]/60 focus:outline-none focus:border-[#441a05]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => selectAllForClass(cid)}
                            className="px-3 py-2 rounded-lg border border-[#9d9087] text-[#441a05] hover:bg-[#441a05]/5 text-sm"
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            onClick={() => clearClassSelection(cid)}
                            className="px-3 py-2 rounded-lg border border-[#9d9087] text-[#441a05] hover:bg-[#441a05]/5 text-sm"
                          >
                            Clear
                          </button>
                          <span className="text-xs text-[#441a05]/70">
                            মোট {visible.length} | নির্বাচিত {picked.length}
                          </span>
                        </div>
                      </div>

                      {visible.length === 0 ? (
                        <p className="text-[#441a05]/70">কোনো বিষয় পাওয়া যায়নি।</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {visible.map((subject, i) => {
                            const checked = picked.includes(subject.id);
                            return (
                              <label
                                key={subject.id}
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 cursor-pointer select-none text-sm animate-fadeIn ${
                                  checked ? 'border-[#DB9E30] bg-[#DB9E30]/15' : 'border-[#9d9087]/60 bg-white/80 hover:border-[#441a05]'
                                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                                style={{ animationDelay: `${i * 0.01}s` }}
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={checked}
                                  onChange={() => toggleSubjectInClass(cid, subject.id)}
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
                  );
                })
              )}
            </div>

            {/* Submit */}
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
                <span>সংরক্ষণ / আপডেট (Merge)</span>
              )}
            </button>
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
        ) : (teacherAssignments || []).length === 0 ? (
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
                        ?.map(id => allClassSubjects?.find(s => s.id === id))
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
    </div>
  );
};

export default TeacherSubjectAssign;
