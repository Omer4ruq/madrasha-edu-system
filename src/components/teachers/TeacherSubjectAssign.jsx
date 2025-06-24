// import React, { useState, useEffect } from 'react';
// import { useGetTeacherStaffProfilesQuery } from '../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
// import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
// import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
// import { useGetGSubjectsByClassQuery } from '../../redux/features/api/class-subjects/gsubjectApi';
// import { useCreateTeacherSubjectAssignMutation, useGetTeacherSubjectAssignsByClassAndSubjectQuery, useGetTeacherSubjectAssignsQuery, useUpdateTeacherSubjectAssignMutation } from '../../redux/features/api/teacherSubjectAssigns/teacherSubjectAssignsApi';


// const TeacherSubjectAssign = () => {
//   const [selectedTeacher, setSelectedTeacher] = useState('');
//   const [selectedClass, setSelectedClass] = useState('');
//   const [selectedSubject, setSelectedSubject] = useState('');
//   const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
//   const [viewClass, setViewClass] = useState('');
//   const [viewSubject, setViewSubject] = useState('');

//   // Fetch data from APIs
//   const { data: teachers, isLoading: teachersLoading } = useGetTeacherStaffProfilesQuery();
//   const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
//   const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
//   const { data: subjects, isLoading: subjectsLoading } = useGetGSubjectsByClassQuery(selectedClass, {
//     skip: !selectedClass,
//   });
//   const { data: assignmentsByClassSubject, isLoading: assignmentsLoading } =
//     useGetTeacherSubjectAssignsByClassAndSubjectQuery(
//       { classId: viewClass, subjectId: viewSubject },
//       { skip: !viewClass || !viewSubject }
//     );
//   const { data: teacherAssignments, isLoading: teacherAssignmentsLoading } =
//     useGetTeacherSubjectAssignsQuery(undefined, { skip: !selectedTeacher });

//   const [createAssignment, { isLoading: createLoading }] = useCreateTeacherSubjectAssignMutation();
//   const [updateAssignment, { isLoading: updateLoading }] = useUpdateTeacherSubjectAssignMutation();

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedTeacher || !selectedClass || !selectedSubject || !selectedAcademicYear) {
//       alert('Please fill all fields');
//       return;
//     }

//     const assignmentData = {
//       subject_assigns: [parseInt(selectedSubject)],
//       class_assigns: [parseInt(selectedClass)],
//       teacher_id: parseInt(selectedTeacher),
//       academic_year: parseInt(selectedAcademicYear),
//     };

//     try {
//       await createAssignment(assignmentData).unwrap();
//       alert('Assignment created successfully');
//       setSelectedSubject('');
//     } catch (error) {
//       alert('Failed to create assignment');
//     }
//   };

//   // Handle update assignment
//   const handleUpdate = async (assignmentId) => {
//     if (!selectedTeacher || !selectedClass || !selectedSubject || !selectedAcademicYear) {
//       alert('Please fill all fields');
//       return;
//     }

//     const assignmentData = {
//       id: assignmentId,
//       subject_assigns: [parseInt(selectedSubject)],
//       class_assigns: [parseInt(selectedClass)],
//       teacher_id: parseInt(selectedTeacher),
//       academic_year: parseInt(selectedAcademicYear),
//     };

//     try {
//       await updateAssignment(assignmentData).unwrap();
//       alert('Assignment updated successfully');
//     } catch (error) {
//       alert('Failed to update assignment');
//     }
//   };

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">Teacher Subject Assignment</h1>

//       {/* Teacher Selection */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium mb-2">Select Teacher</label>
//         <select
//           value={selectedTeacher}
//           onChange={(e) => setSelectedTeacher(e.target.value)}
//           className="w-full p-2 border rounded"
//           disabled={teachersLoading}
//         >
//           <option value="">Select a teacher</option>
//           {teachers?.map((teacher) => (
//             <option key={teacher.id} value={teacher.id}>
//               {teacher.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Assignment Form */}
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//         <div>
//           <label className="block text-sm font-medium mb-2">Select Class</label>
//           <select
//             value={selectedClass}
//             onChange={(e) => setSelectedClass(e.target.value)}
//             className="w-full p-2 border rounded"
//             disabled={classesLoading}
//           >
//             <option value="">Select a class</option>
//             {classes?.map((cls) => (
//               <option key={cls.id} value={cls.id}>
//                 {cls.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Select Subject</label>
//           <select
//             value={selectedSubject}
//             onChange={(e) => setSelectedSubject(e.target.value)}
//             className="w-full p-2 border rounded"
//             disabled={subjectsLoading || !selectedClass}
//           >
//             <option value="">Select a subject</option>
//             {subjects?.map((subject) => (
//               <option key={subject.id} value={subject.id}>
//                 {subject.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Select Academic Year</label>
//           <select
//             value={selectedAcademicYear}
//             onChange={(e) => setSelectedAcademicYear(e.target.value)}
//             className="w-full p-2 border rounded"
//             disabled={yearsLoading}
//           >
//             <option value="">Select an academic year</option>
//             {academicYears?.map((year) => (
//               <option key={year.id} value={year.id}>
//                 {year.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex items-end">
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//             disabled={createLoading}
//           >
//             {createLoading ? 'Assigning...' : 'Assign'}
//           </button>
//         </div>
//       </form>

//       {/* View Assignments by Class and Subject */}
//       <div className="mb-8">
//         <h2 className="text-xl font-semibold mb-4">View Assignments</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium mb-2">Select Class</label>
//             <select
//               value={viewClass}
//               onChange={(e) => setViewClass(e.target.value)}
//               className="w-full p-2 border rounded"
//               disabled={classesLoading}
//             >
//               <option value="">Select a class</option>
//               {classes?.map((cls) => (
//                 <option key={cls.id} value={cls.id}>
//                   {cls.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Select Subject</label>
//             <select
//               value={viewSubject}
//               onChange={(e) => setViewSubject(e.target.value)}
//               className="w-full p-2 border rounded"
//               disabled={subjectsLoading || !viewClass}
//             >
//               <option value="">Select a subject</option>
//               {subjects?.map((subject) => (
//                 <option key={subject.id} value={subject.id}>
//                   {subject.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {assignmentsByClassSubject?.length > 0 && (
//           <div className="mt-4">
//             <h3 className="text-lg font-medium mb-2">Assignments</h3>
//             <table className="w-full border">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="p-2 border">Teacher</th>
//                   <th className="p-2 border">Class</th>
//                   <th className="p-2 border">Subject</th>
//                   <th className="p-2 border">Academic Year</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {assignmentsByClassSubject.map((assignment) => (
//                   <tr key={assignment.id}>
//                     <td className="p-2 border">
//                       {teachers?.find((t) => t.id === assignment.teacher_id)?.name}
//                     </td>
//                     <td className="p-2 border">
//                       {classes?.find((c) => c.id === assignment.class_assigns[0])?.name}
//                     </td>
//                     <td className="p-2 border">
//                       {subjects?.find((s) => s.id === assignment.subject_assigns[0])?.name}
//                     </td>
//                     <td className="p-2 border">
//                       {academicYears?.find((y) => y.id === assignment.academic_year)?.name}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Teacher's Assigned Subjects */}
//       {selectedTeacher && teacherAssignments?.length > 0 && (
//         <div>
//           <h2 className="text-xl font-semibold mb-4">Teacher's Assigned Subjects</h2>
//           <table className="w-full border">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="p-2 border">Class</th>
//                 <th className="p-2 border">Subject</th>
//                 <th className="p-2 border">Academic Year</th>
//                 <th className="p-2 border">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {teacherAssignments.map((assignment) => (
//                 <tr key={assignment.id}>
//                   <td className="p-2 border">
//                     {classes?.find((c) => c.id === assignment.class_assigns[0])?.name}
//                   </td>
//                   <td className="p-2 border">
//                     {subjects?.find((s) => s.id === assignment.subject_assigns[0])?.name}
//                   </td>
//                   <td className="p-2 border">
//                     {academicYears?.find((y) => y.id === assignment.academic_year)?.name}
//                   </td>
//                   <td className="p-2 border">
//                     <button
//                       onClick={() => handleUpdate(assignment.id)}
//                       className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
//                       disabled={updateLoading}
//                     >
//                       {updateLoading ? 'Updating...' : 'Update'}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TeacherSubjectAssign;

import React, { useState, useEffect } from 'react';
import { useGetTeacherStaffProfilesQuery } from '../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetGSubjectsByClassQuery } from '../../redux/features/api/class-subjects/gsubjectApi';
import { useCreateTeacherSubjectAssignMutation, useGetTeacherSubjectAssignsByClassAndSubjectQuery, useGetTeacherSubjectAssignsQuery, useUpdateTeacherSubjectAssignMutation } from '../../redux/features/api/teacherSubjectAssigns/teacherSubjectAssignsApi';

const TeacherSubjectAssign = () => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [viewClass, setViewClass] = useState('');
  const [viewSubject, setViewSubject] = useState('');

  // Fetch data from APIs
  const { data: teachers, isLoading: teachersLoading } = useGetTeacherStaffProfilesQuery();
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: subjects, isLoading: subjectsLoading } = useGetGSubjectsByClassQuery(selectedClass, {
    skip: !selectedClass,
  });
  const { data: assignmentsByClassSubject, isLoading: assignmentsLoading } =
    useGetTeacherSubjectAssignsByClassAndSubjectQuery(
      { classId: viewClass, subjectId: viewSubject },
      { skip: !viewClass || !viewSubject }
    );
  const { data: teacherAssignments, isLoading: teacherAssignmentsLoading } =
    useGetTeacherSubjectAssignsQuery(undefined, { skip: !selectedTeacher });
console.log(classes)
  const [createAssignment, { isLoading: createLoading }] = useCreateTeacherSubjectAssignMutation();
  const [updateAssignment, { isLoading: updateLoading }] = useUpdateTeacherSubjectAssignMutation();

  // Handle subject checkbox changes
  const handleSubjectChange = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedClass || selectedSubjects.length === 0 || !selectedAcademicYear) {
      alert('Please fill all fields');
      return;
    }

    // Validate payload IDs
    const isValidTeacher = teachers?.some((t) => t.id === parseInt(selectedTeacher));
    const isValidClass = classes?.some((c) => c.id === parseInt(selectedClass));
    const isValidAcademicYear = academicYears?.some((y) => y.id === parseInt(selectedAcademicYear));
    const areValidSubjects = selectedSubjects.every((subjectId) =>
      subjects?.some((s) => s.id === parseInt(subjectId))
    );

    if (!isValidTeacher || !isValidClass || !isValidAcademicYear || !areValidSubjects) {
      alert('Invalid selection: Please ensure all selected IDs are valid.');
      console.error('Validation failed:', {
        teacherId: selectedTeacher,
        classId: selectedClass,
        academicYearId: selectedAcademicYear,
        subjectIds: selectedSubjects,
      });
      return;
    }

    const assignmentData = {
      subject_assigns: selectedSubjects.map((id) => parseInt(id)),
      class_assigns: [parseInt(selectedClass)],
      teacher_id: parseInt(selectedTeacher),
      academic_year: parseInt(selectedAcademicYear),
    };

    const apiUrl = 'https://demo.easydr.xyz/api/teacher-subject-assigns/';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || 'no-token'}`,
    };

    console.log('Submitting assignment data:', {
      url: apiUrl,
      headers: headers,
      payload: assignmentData,
    });

    try {
      await createAssignment(assignmentData).unwrap();
      alert('Assignment created successfully');
      setSelectedSubjects([]);
    } catch (error) {
      console.error('Assignment creation error:', {
        status: error.status,
        data: error.data,
        message: error.message,
        fullError: error,
      });
      if (error.status === 404) {
        alert('Failed to create assignment: API endpoint not found. Please check the server configuration.');
      } else if (error.status === 400) {
        alert(`Failed to create assignment: ${error.data?.detail || 'Invalid data provided.'}`);
      } else {
        alert(`Failed to create assignment: ${error.data?.detail || 'Unknown error occurred.'}`);
      }
    }
  };

  // Handle update assignment
  const handleUpdate = async (assignmentId) => {
    if (!selectedTeacher || !selectedClass || selectedSubjects.length === 0 || !selectedAcademicYear) {
      alert('Please fill all fields');
      return;
    }

    const isValidTeacher = teachers?.some((t) => t.id === parseInt(selectedTeacher));
    const isValidClass = classes?.some((c) => c.id === parseInt(selectedClass));
    const isValidAcademicYear = academicYears?.some((y) => y.id === parseInt(selectedAcademicYear));
    const areValidSubjects = selectedSubjects.every((subjectId) =>
      subjects?.some((s) => s.id === parseInt(subjectId))
    );

    if (!isValidTeacher || !isValidClass || !isValidAcademicYear || !areValidSubjects) {
      alert('Invalid selection: Please ensure all selected IDs are valid.');
      console.error('Validation failed:', {
        teacherId: selectedTeacher,
        classId: selectedClass,
        academicYearId: selectedAcademicYear,
        subjectIds: selectedSubjects,
      });
      return;
    }

    const assignmentData = {
      id: assignmentId,
      subject_assigns: selectedSubjects.map((id) => parseInt(id)),
      class_assigns: [parseInt(selectedClass)],
      teacher_id: parseInt(selectedTeacher),
      academic_year: parseInt(selectedAcademicYear),
    };

    try {
      await updateAssignment(assignmentData).unwrap();
      alert('Assignment updated successfully');
    } catch (error) {
      console.error('Assignment update error:', {
        status: error.status,
        data: error.data,
        message: error.message,
        fullError: error,
      });
      alert(`Failed to update assignment: ${error.data?.detail || 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Teacher Subject Assignment</h1>

      {/* Teacher Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Name</label>
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
          disabled={teachersLoading}
        >
          <option value="" disabled>
            Select a teacher
          </option>
          {teachers?.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>

      {/* Assignment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
            disabled={classesLoading}
          >
            <option value="" disabled>
              Select a class
            </option>
            {classes?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.class_name} {cls.shift_name} {cls.section_name}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <div>
            <h3 className="text-lg font-semibold text-amber-600 mb-3">Select Subjects</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {subjects?.map((subject) => (
                <div key={subject.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`subject-${subject.id}`}
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={() => handleSubjectChange(subject.id)}
                    className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    disabled={subjectsLoading}
                  />
                  <label htmlFor={`subject-${subject.id}`} className="text-sm text-gray-600">
                    {subject.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Academic Year</label>
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
            disabled={yearsLoading}
          >
            <option value="" disabled>
              Select an academic year
            </option>
            {academicYears?.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-amber-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-amber-700 hover:-translate-y-1 transition duration-200"
            disabled={createLoading || teachersLoading || classesLoading || subjectsLoading || yearsLoading}
          >
            {createLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      {/* View Assignments by Class and Subject */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">View Assignments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              value={viewClass}
              onChange={(e) => setViewClass(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              disabled={classesLoading}
            >
              <option value="" disabled>
                Select a class
              </option>
              {classes?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
            <select
              value={viewSubject}
              onChange={(e) => setViewSubject(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              disabled={subjectsLoading || !viewClass}
            >
              <option value="" disabled>
                Select a subject
              </option>
              {subjects?.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {assignmentsByClassSubject?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Teacher Name</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Academic Year</th>
                </tr>
              </thead>
              <tbody>
                {assignmentsByClassSubject.map((assignment) => (
                  <tr key={assignment.id} className="border-t">
                    <td className="p-3 text-sm text-gray-600">
                      {teachers?.find((t) => t.id === assignment.teacher_id)?.name}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {classes?.find((c) => c.id === assignment.class_assigns[0])?.name}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {subjects?.find((s) => s.id === assignment.subject_assigns[0])?.name}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {academicYears?.find((y) => y.id === assignment.academic_year)?.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Teacher's Assigned Subjects */}
      {selectedTeacher && teacherAssignments?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Teacher's Assigned Subjects</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Academic Year</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teacherAssignments.map((assignment) => (
                  <tr key={assignment.id} className="border-t">
                    <td className="p-3 text-sm text-gray-600">
                      {classes?.find((c) => c.id === assignment.class_assigns[0])?.name}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {subjects?.find((s) => s.id === assignment.subject_assigns[0])?.name}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {academicYears?.find((y) => y.id === assignment.academic_year)?.name}
                    </td>
                    <td className="p-3 text-sm">
                      <button
                        onClick={() => handleUpdate(assignment.id)}
                        className="bg-amber-500 text-white px-4 py-1 rounded-lg hover:bg-amber-700 transition duration-200"
                        disabled={updateLoading}
                      >
                        {updateLoading ? 'Updating...' : 'Update'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSubjectAssign;