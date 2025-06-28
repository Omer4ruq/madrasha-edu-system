import React, { useEffect } from "react";
import { useGetRoutinesQuery } from "../../../redux/features/api/routines/routinesApi";
import { useGetClassSubjectsQuery } from "../../../redux/features/api/class-subjects/classSubjectsApi";
import { useGetTeacherStaffProfilesQuery } from "../../../redux/features/api/roleStaffProfile/roleStaffProfileApi";

export default function ClassRoutineTable({ selectedClassId, periods }) {
  // Map English day names to Bangla for display
  const dayMap = {
    Saturday: "শনিবার",
    Sunday: "রবিবার",
    Monday: "সোমবার",
    Tuesday: "মঙ্গলবার",
    Wednesday: "বুধবার",
    Thursday: "বৃহস্পতিবার",
  };

  const days = ["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার"];
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

  // Create a map of routines by day and period, using English day names internally
  const routineMap = days.reduce((acc, banglaDay) => {
    // Find the English day name corresponding to the Bangla day
    const englishDay = Object.keys(dayMap).find((key) => dayMap[key] === banglaDay);
    acc[banglaDay] = filteredRoutines
      .filter((routine) => routine.day_name === englishDay)
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
    return <p className="text-gray-500 animate-fadeIn">লোড হচ্ছে...</p>;
  }

  return (
    <div className="p-6">
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; }
          .card:hover { box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); }
          .table-header { background: #DB9E30; color: #441a05; font-weight: bold; }
          .table-cell { transition: background-color 0.3s ease; }
          .table-cell:hover { background: #f3e8d7; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
        `}
      </style>
      <h2 className="text-2xl font-bold text-[#441a05] mb-4 animate-fadeIn">রুটিন সূচি</h2>
      <div className="overflow-x-auto">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `150px repeat(${sortedPeriods.length}, 1fr)` }}
        >
          {/* Header Row */}
          <div className="table-header text-center py-3 rounded-tl-lg">দিন</div>
          {sortedPeriods.map((periodId, i) => {
            const periodData = periods?.find((p) => p.id === periodId) || { id: periodId };
            return (
              <div key={periodId} className="table-header text-center py-3">
                {periods ? `${periodData.start_time} - ${periodData.end_time}` : `পিরিয়ড ${i + 1}`}
              </div>
            );
          })}

          {/* Days and Periods */}
          {days.map((banglaDay) => (
            <React.Fragment key={banglaDay}>
              <div className="table-header text-center py-3">{banglaDay}</div>
              {sortedPeriods.map((periodId) => {
                const routine = routineMap[banglaDay][periodId] || {};
                const isAssigned = routine.subject_id && routine.teacher_name;
                const subjectName = isAssigned ? subjectMap[routine.subject_id] || "-" : "-";
                const teacherName = isAssigned ? teacherMap[routine.teacher_name] || "-" : "-";
                return (
                  <div
                    key={periodId}
                    className="table-cell p-3 rounded-lg animate-fadeIn"
                    style={{
                      animationDelay: `${(days.indexOf(banglaDay) * sortedPeriods.length + sortedPeriods.indexOf(periodId)) * 0.1}s`,
                    }}
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