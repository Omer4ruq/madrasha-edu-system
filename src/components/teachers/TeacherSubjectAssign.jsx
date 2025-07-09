import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import Select from 'react-select';
import { Toaster, toast } from 'react-hot-toast';
import { useGetTeacherStaffProfilesQuery } from '../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetClassSubjectsQuery } from '../../redux/features/api/class-subjects/classSubjectsApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useCreateTeacherSubjectAssignMutation, useGetTeacherSubjectAssignsQuery, useUpdateTeacherSubjectAssignMutation } from '../../redux/features/api/teacherSubjectAssigns/teacherSubjectAssignsApi';
import { useSelector } from 'react-redux'; // Import useSelector
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi'; // Import permission hook


const TeacherSubjectAssign = () => {
  const { user, group_id } = useSelector((state) => state.auth); // Get user and group_id
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [assignmentId, setAssignmentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Fetch data
  const { data: teachers, isLoading: teachersLoading } = useGetTeacherStaffProfilesQuery();
  console.log("teachers", teachers);
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
  const { data: classSubjects = [], isLoading: subjectsLoading } = useGetClassSubjectsQuery();
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: teacherAssignments, isLoading: assignmentsLoading } = useGetTeacherSubjectAssignsQuery(
    selectedTeacher ? { teacherId: selectedTeacher.value } : undefined,
    { skip: !selectedTeacher }
  );
  const [createAssignment, { isLoading: createLoading }] = useCreateTeacherSubjectAssignMutation();
  const [updateAssignment, { isLoading: updateLoading }] = useUpdateTeacherSubjectAssignMutation();

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_teachersubjectassign') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_teachersubjectassign') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_teachersubjectassign') || false;


  // Prepare teacher options for select
  const teacherOptions = teachers?.map(teacher => ({
    value: teacher.id,
    label: teacher.name || `শিক্ষক ${teacher.id}`
  })) || [];

  // Prepare academic year options for select
  const academicYearOptions = academicYears?.map(year => ({
    value: year.id,
    label: year.name || `বছর ${year.id}`
  })) || [];

  // Pre-select classes and subjects for the selected teacher
  useEffect(() => {
    if (teacherAssignments && selectedTeacher) {
      const relevantAssignments = teacherAssignments.filter(
        (assignment) => assignment.teacher_id === parseInt(selectedTeacher.value)
      );
      const assignedClasses = relevantAssignments
        .flatMap((assignment) => assignment.class_assigns || [])
        .filter(Boolean);
      const assignedSubjects = relevantAssignments
        .flatMap((assignment) => assignment.subject_assigns || [])
        .filter(Boolean);
      setSelectedClasses(assignedClasses);
      setSelectedSubjects(assignedSubjects);
      setAssignmentId(relevantAssignments.length > 0 ? relevantAssignments[0].id : null);
    } else {
      setSelectedClasses([]);
      setSelectedSubjects([]);
      setAssignmentId(null);
    }
  }, [teacherAssignments, selectedTeacher]);

  // Custom styles for react-select
  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'transparent',
      borderColor: '#9d9087',
      borderRadius: '8px',
      paddingLeft: '0.75rem',
      padding: '3px',
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': { borderColor: '#441a05' },
      '&:focus': { outline: 'none', boxShadow: 'none' },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#441a05',
      opacity: 0.7,
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    input: (base) => ({
      ...base,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      zIndex: 9999,
      marginTop: '4px',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
      backgroundColor: isSelected ? '#DB9E30' : isFocused ? 'rgba(255, 255, 255)' : 'transparent',
      cursor: 'pointer',
      '&:active': { backgroundColor: '#DB9E30' },
    }),
  };

  // Validate form
  const validateForm = () => {
    if (!selectedTeacher) {
      toast.error('অনুগ্রহ করে একজন শিক্ষক নির্বাচন করুন');
      return false;
    }
    if (!selectedAcademicYear) {
      toast.error('অনুগ্রহ করে একাডেমিক বছর নির্বাচন করুন');
      return false;
    }
    if (selectedClasses.length === 0) {
      toast.error('অনুগ্রহ করে কমপক্ষে একটি ক্লাস নির্বাচন করুন');
      return false;
    }
    if (selectedSubjects.length === 0) {
      toast.error('অনুগ্রহ করে কমপক্ষে একটি বিষয় নির্বাচন করুন');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Determine which permission is needed: Add or Change
    const requiredPermission = assignmentId ? hasChangePermission : hasAddPermission;
    const actionType = assignmentId ? 'আপডেট' : 'তৈরি';

    if (!requiredPermission) {
      toast.error(`অ্যাসাইনমেন্ট ${actionType} করার অনুমতি নেই।`);
      return;
    }
    if (!validateForm()) return;

    const assignmentData = {
      subject_assigns: selectedSubjects,
      class_assigns: selectedClasses,
      teacher_id: parseInt(selectedTeacher.value),
      academic_year: parseInt(selectedAcademicYear.value),
    };

    setModalAction(assignmentId ? 'update' : 'create');
    setModalData(assignmentData);
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        if (!hasAddPermission) { // Double check for security
          toast.error('অ্যাসাইনমেন্ট তৈরি করার অনুমতি নেই।');
          return;
        }
        await createAssignment(modalData).unwrap();
        toast.success('অ্যাসাইনমেন্ট সফলভাবে তৈরি করা হয়েছে!');
      } else if (modalAction === 'update') {
        if (!hasChangePermission) { // Double check for security
          toast.error('অ্যাসাইনমেন্ট আপডেট করার অনুমতি নেই।');
          return;
        }
        await updateAssignment({ id: assignmentId, ...modalData }).unwrap();
        toast.success('অ্যাসাইনমেন্ট সফলভাবে আপডেট করা হয়েছে!');
      }
    } catch (error) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি' : 'আপডেট'}:`, error);
      let errorMessage = 'অজানা ত্রুটি ঘটেছে';
      if (error.status === 400 && error.data) {
        if (typeof error.data === 'object') {
          errorMessage = Object.entries(error.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
        } else {
          errorMessage = error.data || 'অনুরোধে ত্রুটি';
        }
      } else if (error.error) {
        errorMessage = error.error;
      }
      toast.error(`অ্যাসাইনমেন্ট ${modalAction === 'create' ? 'তৈরি' : 'আপডেট'} ব্যর্থ: ${errorMessage}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle class selection
  const handleClassChange = (classId) => {
    // Check permission for modifying existing or adding new
    const canModify = assignmentId ? hasChangePermission : hasAddPermission;
    if (!canModify) {
      toast.error('ক্লাস নির্বাচন করার অনুমতি নেই।');
      return;
    }
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  // Handle subject selection
  const handleSubjectChange = (subjectId) => {
    // Check permission for modifying existing or adding new
    const canModify = assignmentId ? hasChangePermission : hasAddPermission;
    if (!canModify) {
      toast.error('বিষয় নির্বাচন করার অনুমতি নেই।');
      return;
    }
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  if (teachersLoading || classesLoading || subjectsLoading || yearsLoading || permissionsLoading) {
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

  // Determine if the submit button should be enabled
  const isSubmitDisabled = createLoading || updateLoading || assignmentsLoading ||
                           (assignmentId && !hasChangePermission) || (!assignmentId && !hasAddPermission);

  // Determine the text for the submit button
  const submitButtonText = assignmentId ? 'অ্যাসাইনমেন্ট আপডেট করুন' : 'অ্যাসাইনমেন্ট সংরক্ষণ করুন';


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
          .tick-glow:checked + span {
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
        {/* Header and Form */}
        {(hasAddPermission || hasChangePermission) && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h2 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
                শিক্ষকের জন্য বিষয় অ্যাসাইনমেন্ট
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Teacher Selection */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className="block text-sm font-medium text-[#441a05] mb-1">শিক্ষক নির্বাচন করুন</label>
                  <Select
                    options={teacherOptions}
                    value={selectedTeacher}
                    onChange={setSelectedTeacher}
                    isLoading={teachersLoading}
                    placeholder="শিক্ষক নির্বাচন করুন"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={selectStyles}
                    aria-label="শিক্ষক নির্বাচন"
                    title="শিক্ষক নির্বাচন করুন / Select teacher"
                    // Teacher selection is generally not restricted by Add/Change permissions directly,
                    // as it's about *what* is selected, not the act of selecting itself.
                    // However, if the assignment already exists and the user can't change it,
                    // this select could also be disabled. For now, assuming if they can see the form, they can select.
                  />
                  {teachersLoading && <p className="text-[#441a05]/70 mt-2 animate-fadeIn">শিক্ষক লোড হচ্ছে...</p>}
                </div>

                {/* Academic Year Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#441a05] mb-1">একাডেমিক বছর নির্বাচন করুন</label>
                  <Select
                    options={academicYearOptions}
                    value={selectedAcademicYear}
                    onChange={setSelectedAcademicYear}
                    isLoading={yearsLoading}
                    placeholder="একাডেমিক বছর নির্বাচন করুন"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    isSearchable={false}
                    styles={selectStyles}
                    aria-label="একাডেমিক বছর"
                    title="একাডেমিক বছর নির্বাচন করুন / Select academic year"
                    disabled={!hasAddPermission && !hasChangePermission} // Disable if no permission to add/change
                  />
                  {yearsLoading && <p className="text-[#441a05]/70 mt-2 animate-fadeIn">একাডেমিক বছর লোড হচ্ছে...</p>}
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">ক্লাস নির্বাচন করুন</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                  {classes?.map((classItem, index) => (
                    <div key={classItem.id} className="flex items-center animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id={`class-${classItem.id}`}
                          checked={selectedClasses.includes(classItem.id)}
                          onChange={() => handleClassChange(classItem.id)}
                          disabled={classesLoading || (!hasAddPermission && !hasChangePermission)} // Disable based on add/change permission
                          className="hidden"
                          aria-label={`ক্লাস নির্বাচন ${classItem.class_name}`}
                          title={`ক্লাস নির্বাচন করুন / Select class ${classItem.class_name}`}
                        />
                        <span
                          className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${
                            selectedClasses.includes(classItem.id)
                              ? 'bg-[#DB9E30] border-[#DB9E30]'
                              : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                          }`}
                        >
                          {selectedClasses.includes(classItem.id) && (
                            <svg
                              className="w-4 h-4 text-[#441a05] animate-scaleIn"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="ml-2 text-sm text-[#441a05]">
                          {classItem.class_name} - {classItem.section_name} ({classItem.shift_name})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
                {classesLoading && <p className="text-[#441a05]/70 mt-2 animate-fadeIn">ক্লাস লোড হচ্ছে...</p>}
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">বিষয় নির্বাচন করুন</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                  {classSubjects
                    ?.filter((subject) => subject.is_active)
                    .map((subject, index) => (
                      <div key={subject.id} className="flex items-center animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id={`subject-${subject.id}`}
                            checked={selectedSubjects.includes(subject.id)}
                            onChange={() => handleSubjectChange(subject.id)}
                            disabled={subjectsLoading || (!hasAddPermission && !hasChangePermission)} // Disable based on add/change permission
                            className="hidden"
                            aria-label={`বিষয় নির্বাচন ${subject.name}`}
                            title={`বিষয় নির্বাচন করুন / Select subject ${subject.name}`}
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${
                              selectedSubjects.includes(subject.id)
                                ? 'bg-[#DB9E30] border-[#DB9E30]'
                                : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                            }`}
                          >
                            {selectedSubjects.includes(subject.id) && (
                              <svg
                                className="w-4 h-4 text-[#441a05] animate-scaleIn"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </span>
                          <span className="ml-2 text-sm text-[#441a05]">{subject.name}</span>
                        </label>
                      </div>
                    ))}
                </div>
                {subjectsLoading && <p className="text-[#441a05]/70 mt-2 animate-fadeIn">বিষয় লোড হচ্ছে...</p>}
              </div>

              {/* Submit Button */}
              {/* Only render if the user has either add or change permission */}
              {(hasAddPermission || hasChangePermission) && (
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                    isSubmitDisabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:text-white hover:shadow-md btn-glow'
                  }`}
                  aria-label={submitButtonText}
                  title={`${submitButtonText} / ${assignmentId ? 'Update assignment' : 'Save assignment'}`}
                >
                  {createLoading || updateLoading ? (
                    <span className="flex items-center space-x-3">
                      <FaSpinner className="animate-spin text-lg" />
                      <span>প্রক্রিয়াকরণ...</span>
                    </span>
                  ) : (
                    <span>{submitButtonText}</span>
                  )}
                </button>
              )}
            </form>
          </div>
        )}

        {/* Assignment Table */}
        {selectedTeacher && teacherAssignments?.length > 0 && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
            <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">বর্তমান অ্যাসাইনমেন্ট</h3>
            {assignmentsLoading ? (
              <p className="text-[#441a05]/70 p-4 animate-fadeIn">অ্যাসাইনমেন্ট লোড হচ্ছে...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        শিক্ষক
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ক্লাস
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        বিষয়
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        একাডেমিক বছর
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {teacherAssignments.map((assignment, index) => (
                      <tr
                        key={assignment.id}
                        className="bg-white/5 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {teachers?.find(t => t.id === assignment.teacher_id)?.name || 'অজানা'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {assignment.class_assigns
                            ?.map(id => classes?.find(c => c.id === id))
                            .filter(Boolean)
                            .map(c => `${c.class_name} - ${c.section_name} (${c.shift_name})`)
                            .join(', ') || 'কোনো ক্লাস নেই'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
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
        )}
        {selectedTeacher && !assignmentsLoading && teacherAssignments?.length === 0 && (
          <p className="text-[#441a05]/70 mt-4 animate-fadeIn">
            এই শিক্ষকের জন্য কোনো অ্যাসাইনমেন্ট পাওয়া যায়নি।
          </p>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && (hasAddPermission || hasChangePermission) && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'create' && 'অ্যাসাইনমেন্ট তৈরি নিশ্চিত করুন'}
                {modalAction === 'update' && 'অ্যাসাইনমেন্ট আপডেট নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে অ্যাসাইনমেন্ট তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে অ্যাসাইনমেন্ট আপডেট করতে চান?'}
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
                  onClick={confirmAction}
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

export default TeacherSubjectAssign;