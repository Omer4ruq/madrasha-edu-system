import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGetRoutinesQuery } from "../../../redux/features/api/routines/routinesApi";
import { useGetClassSubjectsQuery } from "../../../redux/features/api/class-subjects/classSubjectsApi";
import { useGetTeacherStaffProfilesQuery } from "../../../redux/features/api/roleStaffProfile/roleStaffProfileApi";

export default function ClassRoutineTable({ selectedClassId, periods }) {
  const { t } = useTranslation();
  const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const { data: routines = [], isLoading: routinesLoading } = useGetRoutinesQuery();
  const { data: subjects = [], isLoading: subjectsLoading } = useGetClassSubjectsQuery(
    selectedClassId ? selectedClassId : undefined,
    { skip: !selectedClassId }
  );
  const { data: teachers = [], isLoading: teachersLoading } = useGetTeacherStaffProfilesQuery();

  // Filter routines by selected class_id
  const filteredRoutines = routines.filter((routine) => routine.class_id === selectedClassId);

  // Create maps for subject and teacher names
  const subjectMap = subjects.reduce((acc, subject) => {
    acc[subject.id] = subject.name;
    return acc;
  }, {});
  const teacherMap = teachers.reduce((acc, teacher) => {
    acc[teacher.id] = teacher.name;
    return acc;
  }, {});

  // Log data for debugging
  useEffect(() => {
    console.log("All Routines:", routines);
    console.log("Filtered Routines:", filteredRoutines);
    console.log("Subjects:", subjects);
    console.log("Teachers:", teachers);
    console.log("Subject Map:", subjectMap);
    console.log("Teacher Map:", teacherMap);
  }, [routines, filteredRoutines, subjects, teachers, subjectMap, teacherMap]);

  // Create a map of routines by day and period
  const routineMap = days.reduce((acc, day) => {
    acc[day] = filteredRoutines
      .filter((routine) => routine.day_name === day)
      .reduce((periodAcc, routine) => {
        periodAcc[routine.period_id] = routine;
        return periodAcc;
      }, {});
    return acc;
  }, {});

  // Get unique periods from routines, sorted by period start_time if periods data is available
  const sortedPeriods = periods
    ? [...periods].sort((a, b) => a.start_time.localeCompare(b.start_time)).map((p) => p.id)
    : [...new Set(filteredRoutines.map((routine) => routine.period_id))].sort();

  if (routinesLoading || subjectsLoading || teachersLoading) {
    return <p className="text-gray-500">{t("module.routine.loading")}</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Routine Schedule</h2>
      <div className="overflow-x-auto">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `150px repeat(${sortedPeriods.length}, 1fr)` }}
        >
          {/* Header Row */}
          <div className="bg-blue-50 text-gray-800 font-semibold text-center py-3 rounded-tl-lg">
            {t("module.routine.day")}
          </div>
          {sortedPeriods.map((periodId, i) => {
            const periodData = periods?.find((p) => p.id === periodId) || { id: periodId };
            return (
              <div
                key={periodId}
                className="bg-blue-50 text-gray-800 font-semibold text-center py-3"
              >
                {periods ? `${periodData.start_time} - ${periodData.end_time}` : `Period ${i + 1}`}
              </div>
            );
          })}

          {/* Days and Periods */}
          {days.map((day) => (
            <React.Fragment key={day}>
              <div className="bg-blue-50 text-gray-800 font-medium text-center py-3">
                {day}
              </div>
              {sortedPeriods.map((periodId) => {
                const routine = routineMap[day][periodId] || {};
                const isAssigned = routine.subject_id && routine.teacher_name;
                const subjectName = isAssigned ? subjectMap[routine.subject_id] || "-" : "-";
                const teacherName = isAssigned ? teacherMap[routine.teacher_name] || "-" : "-";
                return (
                  <div
                    key={periodId}
                    className="bg-gray-50 p-3 rounded-lg hover:bg-blue-100 transition-all duration-200"
                  >
                    <div className="text-center">
                      <p className="text-gray-800 font-medium">{subjectName}</p>
                      <p className="text-gray-600 text-sm">{teacherName}</p>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}