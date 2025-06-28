import React, { useState, useEffect } from 'react';
import { useGetTeacherStaffProfilesQuery } from '../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetClassSubjectsQuery } from '../../redux/features/api/class-subjects/classSubjectsApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useCreateTeacherSubjectAssignMutation, useGetTeacherSubjectAssignsQuery, useUpdateTeacherSubjectAssignMutation } from '../../redux/features/api/teacherSubjectAssigns/teacherSubjectAssignsApi';


const TeacherSubjectAssign = () => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [assignmentId, setAssignmentId] = useState(null);

  // Fetch data from RTK Query hooks
  const { data: teachers, isLoading: teachersLoading } = useGetTeacherStaffProfilesQuery();
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
  const { data: classSubjects = [], isLoading: subjectsLoading } = useGetClassSubjectsQuery();
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: teacherAssignments, isLoading: assignmentsLoading } = useGetTeacherSubjectAssignsQuery(
    selectedTeacher ? { teacherId: selectedTeacher } : undefined,
    { skip: !selectedTeacher }
  );
  const [createAssignment, { isLoading: createLoading }] = useCreateTeacherSubjectAssignMutation();
  const [updateAssignment, { isLoading: updateLoading }] = useUpdateTeacherSubjectAssignMutation();
console.log(teachers)
  // Pre-select classes and subjects for the selected teacher
  useEffect(() => {
    if (teacherAssignments && selectedTeacher) {
      console.log('Teacher assignments:', teacherAssignments); // Debug log
      // Filter assignments for the selected teacher
      const relevantAssignments = teacherAssignments.filter(
        (assignment) => assignment.teacher_id === parseInt(selectedTeacher)
      );
      // Extract class and subject IDs from class_assigns and subject_assigns arrays
      const assignedClasses = relevantAssignments
        .flatMap((assignment) => assignment.class_assigns || [])
        .filter(Boolean);
      const assignedSubjects = relevantAssignments
        .flatMap((assignment) => assignment.subject_assigns || [])
        .filter(Boolean);
      setSelectedClasses(assignedClasses);
      setSelectedSubjects(assignedSubjects);
      // Store assignment ID for updates (use first assignment for simplicity)
      setAssignmentId(relevantAssignments.length > 0 ? relevantAssignments[0].id : null);
    } else {
      setSelectedClasses([]);
      setSelectedSubjects([]);
      setAssignmentId(null);
    }
  }, [teacherAssignments, selectedTeacher]);

  // Handle teacher selection
  const handleTeacherChange = (e) => {
    setSelectedTeacher(e.target.value);
  };

  // Handle class selection
  const handleClassChange = (classId) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  // Handle subject selection
  const handleSubjectChange = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]
    );
  };

  // Handle academic year selection
  const handleAcademicYearChange = (e) => {
    setSelectedAcademicYear(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedAcademicYear || selectedClasses.length === 0 || selectedSubjects.length === 0) {
      alert('Please select a teacher, academic year, at least one class, and at least one subject.');
      return;
    }

    const assignmentData = {
      subject_assigns: selectedSubjects,
      class_assigns: selectedClasses,
      teacher_id: parseInt(selectedTeacher),
      academic_year: parseInt(selectedAcademicYear),
    };

    console.log('Submitting assignment data:', assignmentData); // Debug log

    try {
      if (assignmentId) {
        await updateAssignment({ id: assignmentId, ...assignmentData }).unwrap();
        alert('Assignment updated successfully!');
      } else {
        await createAssignment(assignmentData).unwrap();
        alert('Assignment created successfully!');
      }
    } catch (error) {
      console.error('Assignment error:', error); // Debug log
      let errorMessage = 'Unknown error occurred';
      if (error.status === 400 && error.data) {
        if (typeof error.data === 'object') {
          errorMessage = Object.entries(error.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
        } else {
          errorMessage = error.data || 'Bad request';
        }
      } else if (error.error) {
        errorMessage = error.error;
      }
      alert(`Failed to ${assignmentId ? 'update' : 'create'} assignment: ${errorMessage}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Assign Subjects to Teacher</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Teacher Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Teacher</label>
          <select
            value={selectedTeacher}
            onChange={handleTeacherChange}
            disabled={teachersLoading}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select a teacher</option>
            {teachers?.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name || `Teacher ${teacher.id}`}
              </option>
            ))}
          </select>
          {teachersLoading && <p>Loading teachers...</p>}
        </div>

        {/* Academic Year Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Academic Year</label>
          <select
            value={selectedAcademicYear}
            onChange={handleAcademicYearChange}
            disabled={yearsLoading}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select an academic year</option>
            {academicYears?.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name || `Year ${year.id}`}
              </option>
            ))}
          </select>
          {yearsLoading && <p>Loading academic years...</p>}
        </div>

        {/* Class Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Classes</label>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
            {classes?.map((classItem) => (
              <div key={classItem.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`class-${classItem.id}`}
                  checked={selectedClasses.includes(classItem.id)}
                  onChange={() => handleClassChange(classItem.id)}
                  disabled={classesLoading}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor={`class-${classItem.id}`} className="ml-2 text-sm text-gray-600">
                  {classItem.class_name} - {classItem.section_name} ({classItem.shift_name})
                </label>
              </div>
            ))}
          </div>
          {classesLoading && <p>Loading classes...</p>}
        </div>

        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Subjects</label>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
            {classSubjects
              ?.filter((subject) => subject.is_active)
              .map((subject) => (
                <div key={subject.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`subject-${subject.id}`}
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={() => handleSubjectChange(subject.id)}
                    disabled={subjectsLoading}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor={`subject-${subject.id}`} className="ml-2 text-sm text-gray-600">
                    {subject.name}
                  </label>
                </div>
              ))}
          </div>
          {subjectsLoading && <p>Loading subjects...</p>}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={createLoading || updateLoading || assignmentsLoading}
            className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {createLoading || updateLoading ? 'Submitting...' : 'Save Assignments'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherSubjectAssign;