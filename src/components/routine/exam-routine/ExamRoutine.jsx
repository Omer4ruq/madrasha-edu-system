import React, { useState, useEffect } from 'react';
import { useGetExamApiQuery } from '../../../redux/features/api/exam/examApi';
import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';
import { useGetClassListApiQuery } from '../../../redux/features/api/class/classListApi';
import { useCreateExamSchedulesMutation, useGetExamSchedulesQuery, useUpdateExamSchedulesMutation } from '../../../redux/features/api/routines/examRoutineApi';
import { useGetClassSubjectsByClassIdQuery } from '../../../redux/features/api/class-subjects/classSubjectsApi';

const ExamRoutine = () => {
  const { data: exams = [], isLoading: isExamLoading } = useGetExamApiQuery();
  const { data: academicYears = [], isLoading: isYearLoading } = useGetAcademicYearApiQuery();
  const { data: classes = [], isLoading: isClassLoading } = useGetClassListApiQuery();
  const [createExamSchedules] = useCreateExamSchedulesMutation();
  const [updateExamSchedules] = useUpdateExamSchedulesMutation();

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [activeTab, setActiveTab] = useState(null);
  const [schedules, setSchedules] = useState({});
  const [submittedRoutines, setSubmittedRoutines] = useState({});
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Fetch subjects for the active class
  const { data: subjects = [] } = useGetClassSubjectsByClassIdQuery(activeTab || '', {
    skip: !activeTab,
  });

  // Fetch existing schedules for the selected exam, class, and year
  const { data: existingSchedulesData = [], isLoading: isScheduleLoading } = useGetExamSchedulesQuery({
    exam_name: selectedExam,
    class_name: activeTab,
    academic_year: selectedYear,
  }, {
    skip: !selectedExam || !activeTab || !selectedYear,
  });
  const existingSchedules = Array.isArray(existingSchedulesData) && existingSchedulesData.length > 0 ? existingSchedulesData[0]?.schedules || [] : [];

  useEffect(() => {
    if (classes.length > 0 && !activeTab) {
      setActiveTab(classes[0].student_class.id);
    }
    // Initialize schedules for new active tab
    if (activeTab && subjects.length > 0) {
      setSchedules((prev) => ({
        ...prev,
        [activeTab]: subjects.reduce((acc, subject) => ({
          ...acc,
          [subject.id]: prev[activeTab]?.[subject.id] || {},
        }), prev[activeTab] || {}),
      }));
    }
    // Populate schedules with existing data
    if (existingSchedules.length > 0) {
      const newSchedules = existingSchedules.reduce((acc, schedule) => ({
        ...acc,
        [schedule.subject_id]: {
          id: schedule.id,
          exam_date: schedule.exam_date,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
        },
      }), {});
      setSchedules((prev) => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], ...newSchedules },
      }));
    }
  }, [classes, activeTab, subjects, existingSchedules]);

  const handleScheduleChange = (classId, subjectId, field, value) => {
    setSchedules((prev) => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        [subjectId]: {
          ...prev[classId]?.[subjectId],
          [field]: value,
        },
      },
    }));
  };

  const handleUpdate = async (scheduleId) => {
    const schedule = schedules[activeTab][scheduleId];
    if (!schedule.exam_date || !schedule.start_time || !schedule.end_time) {
      alert('Please fill in the date, start time, and end time for the schedule.');
      return;
    }

    const updatedSchedule = {
      id: schedule.id || scheduleId,
      exam_date: schedule.exam_date,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      subject_id: scheduleId,
      academic_year: selectedYear,
    };

    try {
      await updateExamSchedules(updatedSchedule).unwrap();
      setSubmittedRoutines((prev) => ({
        ...prev,
        [activeTab]: (prev[activeTab] || []).map(s => s.id === scheduleId ? updatedSchedule : s),
      }));
      setEditingSchedule(null);
      alert('Schedule updated successfully!');
    } catch (error) {
      console.error('Failed to update schedule:', error);
      alert('Failed to update schedule.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedExam || !selectedYear) {
      alert('Please select an exam and academic year.');
      return;
    }

    const activeClassSchedules = schedules[activeTab] || {};
    const validSchedules = Object.entries(activeClassSchedules)
      .filter(([_, schedule]) => schedule.exam_date && schedule.start_time && schedule.end_time)
      .map(([subjectId, schedule]) => ({
        subject_id: subjectId,
        exam_date: schedule.exam_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        academic_year: selectedYear,
      }));

    const invalidSubjects = subjects.filter((subject) => {
      const schedule = activeClassSchedules[subject.id] || {};
      return !schedule.exam_date || !schedule.start_time || !schedule.end_time;
    });

    if (invalidSubjects.length > 0) {
      alert(`Please fill in the date, start time, and end time for the following subjects: ${invalidSubjects.map(s => s.name).join(', ')}. Only valid schedules will be submitted.`);
      if (validSchedules.length === 0) {
        return;
      }
    }

    const routine = {
      exam_name: selectedExam,
      class_name: activeTab,
      schedules: validSchedules,
    };

    try {
      await createExamSchedules(routine).unwrap();
      setSubmittedRoutines((prev) => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), ...routine.schedules],
      }));
      alert('Exam routine submitted successfully for valid schedules!');
    } catch (error) {
      console.error('Failed to submit exam routine:', error);
      alert('Failed to submit exam routine.');
    }
  };

  if (isExamLoading || isYearLoading || isClassLoading || isScheduleLoading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex space-x-4">
        <div>
          <label className="mr-2">Select Exam:</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select an Exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2">Select Academic Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select a Year</option>
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedExam && selectedYear && classes.length > 0 && (
        <>
          <div className="flex mb-4">
            <div className="flex-1">
              <div className="flex space-x-4 border-b">
                {classes.map((cls) => (
                  <button
                    key={cls.student_class.id}
                    className={`px-4 py-2 ${activeTab === cls.student_class.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab(cls.student_class.id)}
                  >
                    {cls.student_class.name}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                {activeTab && classes.find((cls) => cls.student_class.id === activeTab) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Add/Edit Schedule</h3>
                      {subjects.map((subject) => {
                        const schedule = schedules[activeTab]?.[subject.id] || {};
                        const existing = existingSchedules.find(s => s.subject_id === subject.id);
                        return (
                          <div key={subject.id} className="mb-4 p-2 border rounded bg-white shadow-sm">
                            <h4 className="font-medium">{subject.name}</h4>
                            <input
                              type="date"
                              value={schedule.exam_date || ''}
                              onChange={(e) => handleScheduleChange(activeTab, subject.id, 'exam_date', e.target.value)}
                              className="p-2 border rounded w-full mb-2"
                            />
                            <input
                              type="time"
                              value={schedule.start_time || ''}
                              onChange={(e) => handleScheduleChange(activeTab, subject.id, 'start_time', e.target.value)}
                              className="p-2 border rounded w-full mb-2"
                            />
                            <input
                              type="time"
                              value={schedule.end_time || ''}
                              onChange={(e) => handleScheduleChange(activeTab, subject.id, 'end_time', e.target.value)}
                              className="p-2 border rounded w-full mb-2"
                            />
                            {existing && (
                              <button
                                onClick={() => setEditingSchedule(existing.id)}
                                className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Routine for {classes.find((cls) => cls.student_class.id === activeTab)?.student_class.name}</h3>
                      {submittedRoutines[activeTab]?.length > 0 || existingSchedules.length > 0 ? (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="border p-2">Subject</th>
                              <th className="border p-2">Date</th>
                              <th className="border p-2">Start Time</th>
                              <th className="border p-2">End Time</th>
                              {editingSchedule && <th className="border p-2">Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {existingSchedules.map((schedule) => (
                              <tr key={schedule.id} className="border">
                                <td className="border p-2">{subjects.find(s => s.id === schedule.subject_id)?.name || schedule.subject_id}</td>
                                <td className="border p-2">{schedule.exam_date}</td>
                                <td className="border p-2">{schedule.start_time}</td>
                                <td className="border p-2">{schedule.end_time}</td>
                                {editingSchedule === schedule.id && (
                                  <td className="border p-2">
                                    <button
                                      onClick={() => handleUpdate(schedule.id)}
                                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingSchedule(null)}
                                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
                                    >
                                      Cancel
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                            {submittedRoutines[activeTab]?.map((schedule, index) => (
                              <tr key={index + existingSchedules.length} className="border">
                                <td className="border p-2">{subjects.find(s => s.id === schedule.subject_id)?.name || schedule.subject_id}</td>
                                <td className="border p-2">{schedule.exam_date}</td>
                                <td className="border p-2">{schedule.start_time}</td>
                                <td className="border p-2">{schedule.end_time}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No routine available.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Routine
          </button>
        </>
      )}
    </div>
  );
};

export default ExamRoutine;