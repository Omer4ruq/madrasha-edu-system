import React, { useState } from 'react';
import {
  useGetClassSubjectsQuery,
  useCreateClassSubjectMutation,
  useUpdateClassSubjectMutation,
  useDeleteClassSubjectMutation,
} from '../../redux/features/api/class-subjects/classSubjectsApi';
import { useGetGSubjectsByClassQuery } from '../../redux/features/api/class-subjects/gsubjectApi';
import { useGetClassListApiQuery } from '../../redux/features/api/class/classListApi';

const ClassSubject = () => {
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch data
  const { data: classes = [], isLoading: classesLoading, error: classesError } = useGetClassListApiQuery();
  const { data: classSubjects = [], isLoading: subjectsLoading, error: subjectsError } = useGetClassSubjectsQuery();
  const { data: gSubjects = [], isLoading: gSubjectsLoading, error: gSubjectsError } = useGetGSubjectsByClassQuery(
    selectedClassId,
    { skip: !selectedClassId }
  );

  // Mutations
  const [createClassSubject] = useCreateClassSubjectMutation();
  const [updateClassSubject] = useUpdateClassSubjectMutation();
  const [deleteClassSubject] = useDeleteClassSubjectMutation();

  // Handle class tab selection
  const handleClassSelect = (classId) => {
    setSelectedClassId(classId);
    setErrorMessage('');
  };

  // Handle subject checkbox change
  const handleSubjectStatusChange = async (subjectId, isActive) => {
    setErrorMessage(''); // Clear previous errors
    const existingSubject = classSubjects.find((sub) => sub.class_subject === subjectId);
    const action = existingSubject ? 'update' : 'create';
    const payload = {
      is_active: isActive,
      class_subject: subjectId,
    };

    try {
      if (existingSubject) {
        const result = await updateClassSubject({
          id: existingSubject.id,
          ...payload,
        }).unwrap();
        console.log(`Update result:`, result); // Debug log
      } else {
        const result = await createClassSubject(payload).unwrap();
        console.log(`Create result:`, result); // Debug log
      }
    } catch (err) {
      console.error(`Failed to ${action} class subject:`, err);
      const errorDetail =
        err?.data?.detail ||
        err?.data?.non_field_errors?.join(', ') ||
        err?.message ||
        'Unknown error occurred';
      setErrorMessage(`Failed to ${action} subject: ${errorDetail}`);
    }
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }
    try {
      await deleteClassSubject(id).unwrap();
      setErrorMessage('');
    } catch (err) {
      console.error('Failed to delete class subject:', err);
      const errorDetail =
        err?.data?.detail ||
        err?.data?.non_field_errors?.join(', ') ||
        err?.message ||
        'Unknown error';
      setErrorMessage(`Failed to delete subject: ${errorDetail}`);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
        Class Subject Management
      </h1>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Class Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {classesLoading ? (
              <span className="text-gray-500">Loading classes...</span>
            ) : classesError ? (
              <span className="text-red-500">Error loading classes: {classesError.message}</span>
            ) : classes.length > 0 ? (
              classes?.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => handleClassSelect(cls.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-150 ease-in-out ${
                    selectedClassId === cls.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {cls?.student_class?.name}
                </button>
              ))
            ) : (
              <span className="text-gray-500">No classes available</span>
            )}
          </nav>
        </div>
      </div>

      {/* Subject List with Checkboxes */}
      {selectedClassId && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-10 max-w-2xl mx-auto transition-all duration-300 hover:shadow-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subjects for Selected Class</h2>
          {gSubjectsLoading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="mt-2 text-gray-600">Loading subjects...</p>
            </div>
          ) : gSubjectsError ? (
            <p className="text-red-500 text-center">Error: {gSubjectsError.message}</p>
          ) : gSubjects.length > 0 ? (
            <ul className="space-y-4">
              {gSubjects.map((subject) => {
                const existingSubject = classSubjects.find((sub) => sub.class_subject === subject.id);
                return (
                  <li
                    key={subject.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition duration-150 ease-in-out"
                  >
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={existingSubject ? existingSubject.is_active : false}
                        onChange={(e) => handleSubjectStatusChange(subject.id, e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition duration-150 ease-in-out"
                      />
                      <span className="ml-3 text-sm text-gray-900">
                        {subject.name} (SL: {subject.sl})
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">No subjects found for this class</p>
          )}
        </div>
      )}

      {/* Display Class Subjects */}
      {subjectsLoading || classesLoading ? (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : subjectsError || classesError ? (
        <p className="text-red-500 text-center">
          Error: {subjectsError?.message || classesError?.message}
        </p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SL</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Updated At</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classSubjects?.map((subject) => {
                  const gSubject = gSubjects.find((gSub) => gSub.id === subject.class_subject) || {};
                  const className = gSubject.class_id
                    ? classes.find((cls) => cls.id === gSubject.class_id)?.name || 'Unknown'
                    : 'Unknown';
                  return (
                    <tr key={subject.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{className}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gSubject.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gSubject.sl || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            subject.is_active ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                          }`}
                        >
                          {subject.is_active ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(subject.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(subject.updated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="text-red-600 hover:text-red-800 transition duration-150 ease-in-out"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassSubject;