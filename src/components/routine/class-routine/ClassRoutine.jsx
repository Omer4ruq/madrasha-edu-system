import { useEffect, useMemo, useState } from "react";
import ClassRoutineTable from "./ClassRoutineTable";
import { useTranslation } from "react-i18next";
import { useGetClassPeriodsByClassIdQuery } from "../../../redux/features/api/periods/classPeriodsApi";
import { useGetClassSubjectsQuery } from "../../../redux/features/api/class-subjects/classSubjectsApi";
import { useGetTeacherSubjectAssignsByClassAndSubjectQuery } from "../../../redux/features/api/teacherSubjectAssigns/teacherSubjectAssignsApi";
import { useCreateRoutineMutation } from "../../../redux/features/api/routines/routinesApi";
import { useGetTeacherStaffProfilesQuery } from "../../../redux/features/api/roleStaffProfile/roleStaffProfileApi";
import { useGetclassConfigApiQuery } from "../../../redux/features/api/class/classConfigApi";

export default function ClassRoutine() {
  const { t } = useTranslation();
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Validate class_id
  const isValidId = (id) => id && (typeof id === "string" || typeof id === "number");

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useGetclassConfigApiQuery();

  // Fetch teachers based on selected class and subject
  const { data: allteachers, isLoading: allteachersLoading } = useGetTeacherStaffProfilesQuery();
  const { data: teachers = [], isLoading: teachersLoading, error: teachersError } = useGetTeacherSubjectAssignsByClassAndSubjectQuery(
    selectedClass && isValidId(selectedClass.id) && selectedSubjects.length > 0
      ? { classId: selectedClass.id, subjectId: selectedSubjects[0]?.id }
      : undefined,
    { skip: !selectedClass || !isValidId(selectedClass.id) || selectedSubjects.length === 0 }
  );

  // Filter teachers with type coercion to handle string/number mismatches
  const filterTeacher = useMemo(() => {
    return Array.isArray(allteachers) && Array.isArray(teachers)
      ? allteachers.filter((oneteacher) =>
          teachers.some((assigned) => String(assigned.teacher_id) === String(oneteacher.id))
        )
      : [];
  }, [allteachers, teachers]);

  // Debug selectedClass, subjects, and teacher data
  useEffect(() => {
    console.log("Selected Class:", selectedClass);
    if (selectedClass) {
      console.log("Selected Class ID:", selectedClass.class_id);
    }
    console.log("Selected Subjects:", selectedSubjects);
    console.log("Teacher Query Params:", selectedClass && isValidId(selectedClass.id) && selectedSubjects.length > 0
      ? { classId: selectedClass.id, subjectId: selectedSubjects[0]?.id }
      : "Skipped");
    console.log("All Teachers:", allteachers);
    console.log("Assigned Teachers:", teachers);
    console.log("Teachers Query Error:", teachersError);
    console.log("Filtered Teachers:", filterTeacher);
    console.log("Selected Teacher:", selectedTeacher);
  }, [selectedClass, selectedSubjects, allteachers, teachers, teachersError, filterTeacher, selectedTeacher]);

  // Fetch periods for the selected class using class_id
  const { data: periods = [], isLoading: periodsLoading, error: periodsError } = useGetClassPeriodsByClassIdQuery(
    selectedClass && isValidId(selectedClass.id) ? selectedClass.id : undefined,
    { skip: !selectedClass || !isValidId(selectedClass.id) }
  );

  // Fetch active subjects for the selected class using class_id
  const { data: classSubjects = [], isLoading: subjectsLoading } = useGetClassSubjectsQuery(
    selectedClass && isValidId(selectedClass.class_id) ? selectedClass.class_id : undefined,
    { skip: !selectedClass || !isValidId(selectedClass.class_id) }
  );

  // Filter active subjects
  const activeSubjects = classSubjects.filter((subject) => subject.is_active);

  // Mutation for creating routine
  const [createRoutine, { isLoading: createLoading }] = useCreateRoutineMutation();

  const handleClassSelect = (cls) => {
    setSelectedClass({
      id: cls.id,
      class_id: cls.class_id,
      name: `${cls.class_name} ${cls.section_name}`,
    });
    setSelectedSubjects([]);
    setSelectedPeriod(null);
    setSelectedTeacher(null);
    setSelectedDay(null);
  };

  const handleCreateRoutine = async () => {
    // Validate all required fields
    if (!selectedClass || !isValidId(selectedClass.class_id)) {
      console.error("Missing or invalid selectedClass:", selectedClass);
      alert(t("module.routine.missing_class"));
      return;
    }
    if (!selectedDay) {
      console.error("Missing selectedDay:", selectedDay);
      alert(t("module.routine.missing_day"));
      return;
    }
    if (!selectedPeriod || !isValidId(selectedPeriod.id)) {
      console.error("Missing or invalid selectedPeriod:", selectedPeriod);
      alert(t("module.routine.missing_period"));
      return;
    }
    if (selectedSubjects.length === 0 || !isValidId(selectedSubjects[0]?.id)) {
      console.error("Missing or invalid selectedSubjects:", selectedSubjects);
      alert(t("module.routine.missing_subject"));
      return;
    }
    if (!selectedTeacher || !selectedTeacher.id || !selectedTeacher.name) {
      console.error("Missing or invalid selectedTeacher:", selectedTeacher);
      alert(t("module.routine.missing_teacher"));
      return;
    }

    const routineData = {
      day_name: selectedDay,
      note: "",
      class_id: selectedClass.class_id,
      period_id: selectedPeriod.id,
      subject_id: selectedSubjects[0].id,
      teacher_name: selectedTeacher.id, // Send teacher_id as teacher_name per backend expectation
    };

    try {
      console.log("Submitting Routine Data:", routineData);
      const result = await createRoutine(routineData).unwrap();
      console.log("Created Routine:", result);
      alert(t("module.routine.success"));
      // Reset form fields after successful submission
      setSelectedSubjects([]);
      setSelectedPeriod(null);
      setSelectedTeacher(null);
      setSelectedDay(null);
    } catch (error) {
      console.error("Error creating routine:", error);
      alert(t("module.routine.error") + `: ${error.status} - ${error.data?.message || "Invalid request"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Class Tabs */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">select_class</h2>
          <div className="flex flex-wrap gap-3 overflow-x-auto">
            {classesLoading ? (
              <p className="text-gray-500">{t("module.routine.loading")}</p>
            ) : (
              classes?.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => handleClassSelect(cls)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedClass?.id === cls.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                  }`}
                >
                  {cls.class_name} {cls.section_name}
                </button>
              ))
            )}
          </div>
        </div>

        {periodsError && (
          <p className="text-red-500 mb-4">
            {t("module.routine.error_fetching_periods")}: {periodsError.message || "Invalid class ID"}
          </p>
        )}

        {selectedClass && isValidId(selectedClass.class_id) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Days Section */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Days</h3>
              <div className="flex flex-col gap-2">
                {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"].map((day) => (
                  <label key={day} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="day"
                      value={day}
                      checked={selectedDay === day}
                      onChange={() => setSelectedDay(day)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Periods, Subjects, Teachers Sections */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Periods Section */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Periods</h3>
                {periodsLoading ? (
                  <p className="text-gray-500">loading..</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {periods.map((period) => (
                      <label key={period.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="period"
                          value={period.id}
                          checked={selectedPeriod?.id === period.id}
                          onChange={() => setSelectedPeriod(period)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">
                          {period.start_time} - {period.end_time}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Subjects Section */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Subjects</h3>
                {subjectsLoading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {activeSubjects.map((subject) => (
                      <label key={subject.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.some((s) => s.id === subject.id)}
                          onChange={(e) => {
                            console.log("Subject Selected:", subject, e.target.checked);
                            if (e.target.checked) {
                              setSelectedSubjects([subject]);
                              setSelectedTeacher(null);
                            } else {
                              setSelectedSubjects([]);
                              setSelectedTeacher(null);
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{subject.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Teachers Section */}
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Teachers</h3>
                {teachersLoading || allteachersLoading ? (
                  <p className="text-gray-500">{t("module.routine.loading")}</p>
                ) : teachersError ? (
                  <p className="text-red-500">
                    {t("module.routine.error_fetching_teachers")}: {teachersError.message || "Error"}
                  </p>
                ) : filterTeacher.length === 0 ? (
                  <p className="text-red-500">
                    {selectedSubjects.length === 0
                      ? t("module.routine.select_subject_first")
                      : t("module.routine.no_teachers_available")}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filterTeacher.map((teacher) => (
                      <label key={teacher.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="teacher"
                          value={teacher.id}
                          checked={selectedTeacher?.id === teacher.id}
                          onChange={() => {
                            console.log("Selecting Teacher:", teacher);
                            setSelectedTeacher(teacher);
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{teacher.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {selectedClass && isValidId(selectedClass.class_id) && (
          <div className="mt-6">
            <button
              onClick={handleCreateRoutine}
              disabled={createLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? "submitting" : "submit"}
            </button>
          </div>
        )}

        {/* Routine Table */}
        {selectedClass && isValidId(selectedClass.class_id) && (
          <div className="mt-8">
            <ClassRoutineTable selectedClassId={selectedClass.class_id} periods={periods} />
          </div>
        )}
      </div>
    </div>
  );
}