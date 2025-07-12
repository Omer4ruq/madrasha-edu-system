import React, { useEffect, useMemo, useState } from "react";
import ClassRoutineTable from "./ClassRoutineTable";
import { IoAddCircle, IoAdd } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { useGetclassConfigApiQuery } from "../../../redux/features/api/class/classConfigApi";
import { useGetTeacherStaffProfilesQuery } from "../../../redux/features/api/roleStaffProfile/roleStaffProfileApi";
import { useGetTeacherSubjectAssignsByClassAndSubjectQuery } from "../../../redux/features/api/teacherSubjectAssigns/teacherSubjectAssignsApi";
import { useGetClassPeriodsByClassIdQuery } from "../../../redux/features/api/periods/classPeriodsApi";
import { useGetClassSubjectsByClassIdQuery } from "../../../redux/features/api/class-subjects/classSubjectsApi"; // Fixed import
import { useCreateRoutineMutation } from "../../../redux/features/api/routines/routinesApi";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../../redux/features/api/permissionRole/groupsApi";

export default function ClassRoutine() {
  const { user, group_id } = useSelector((state) => state.auth);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_routine') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_routine') || false;

  const dayMap = {
    Saturday: "শনিবার",
    Sunday: "রবিবার",
    Monday: "সোমবার",
    Tuesday: "মঙ্গলবার",
    Wednesday: "বুধবার",
    Thursday: "বৃহস্পতিবার",
  };

  // Validate class_id
  const isValidId = (id) =>
    id && (typeof id === "string" || typeof id === "number");

  // Fetch classes
  const { data: classes, isLoading: classesLoading } =
    useGetclassConfigApiQuery();

  // Fetch teachers
  const { data: allteachers, isLoading: allteachersLoading } =
    useGetTeacherStaffProfilesQuery();
  const {
    data: teachers = [],
    isLoading: teachersLoading,
    error: teachersError,
  } = useGetTeacherSubjectAssignsByClassAndSubjectQuery(
    selectedClass && isValidId(selectedClass.id) && selectedSubjects.length > 0
      ? { classId: selectedClass.id, subjectId: selectedSubjects[0]?.id }
      : undefined,
    {
      skip:
        !selectedClass ||
        !isValidId(selectedClass.id) ||
        selectedSubjects.length === 0,
    }
  );

  // Filter teachers
  const filterTeacher = useMemo(() => {
    return Array.isArray(allteachers) && Array.isArray(teachers)
      ? allteachers.filter((oneteacher) =>
          teachers.some(
            (assigned) => String(assigned.teacher_id) === String(oneteacher.id)
          )
        )
      : [];
  }, [allteachers, teachers]);

  // Fetch periods
  const {
    data: periods = [],
    isLoading: periodsLoading,
    error: periodsError,
  } = useGetClassPeriodsByClassIdQuery(
    selectedClass && isValidId(selectedClass.id) ? selectedClass.id : undefined,
    { skip: !selectedClass || !isValidId(selectedClass.id) }
  );

  // Fetch subjects by class ID - FIXED
  const { 
    data: classSubjects = [], 
    isLoading: subjectsLoading,
    error: subjectsError 
  } = useGetClassSubjectsByClassIdQuery(
    selectedClass && isValidId(selectedClass.class_id) ? selectedClass.class_id : undefined,
    { skip: !selectedClass || !isValidId(selectedClass.class_id) }
  );

  // Filter active subjects
  const activeSubjects = useMemo(() => {
    if (!Array.isArray(classSubjects)) return [];
    return classSubjects.filter((subject) => subject.is_active);
  }, [classSubjects]);

  // Mutation for creating routine
  const [createRoutine, { isLoading: createLoading, error: createError }] =
    useCreateRoutineMutation();

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
console.log("classes", classes)
console.log("selectedClass", selectedClass)
  const handleCreateRoutine = async () => {
    if (!hasAddPermission) {
      toast.error('রুটিন তৈরি করার অনুমতি নেই।');
      return;
    }
    if (!selectedClass || !isValidId(selectedClass.class_id)) {
      toast.error("শ্রেণি নির্বাচন করুন");
      return;
    }
    if (!selectedDay) {
      toast.error("দিন নির্বাচন করুন");
      return;
    }
    if (!selectedPeriod || !isValidId(selectedPeriod.id)) {
      toast.error("পিরিয়ড নির্বাচন করুন");
      return;
    }
    if (selectedSubjects.length === 0 || !isValidId(selectedSubjects[0]?.id)) {
      toast.error("বিষয় নির্বাচন করুন");
      return;
    }
    if (!selectedTeacher || !selectedTeacher.id || !selectedTeacher.name) {
      toast.error("শিক্ষক নির্বাচন করুন");
      return;
    }

    setModalData({
      day_name: selectedDay,
      note: "",
      class_id: selectedClass.class_id,
      period_id: selectedPeriod.id,
      subject_id: selectedSubjects[0].id,
      teacher_name: selectedTeacher.id,
    });
    setIsModalOpen(true);
  };

  const confirmCreateRoutine = async () => {
    if (!hasAddPermission) {
      toast.error('রুটিন তৈরি করার অনুমতি নেই।');
      setIsModalOpen(false);
      return;
    }
    try {
      const result = await createRoutine(modalData).unwrap();
      toast.success("রুটিন সফলভাবে তৈরি হয়েছে");
      setSelectedSubjects([]);
      setSelectedPeriod(null);
      setSelectedTeacher(null);
      setSelectedDay(null);
    } catch (error) {
      toast.error(
        `রুটিন তৈরিতে ত্রুটি: ${error.status || "অজানা"} - ${JSON.stringify(
          error.data || {}
        )}`
      );
    } finally {
      setIsModalOpen(false);
      setModalData(null);
    }
  };

  if (classesLoading || allteachersLoading || teachersLoading || periodsLoading || subjectsLoading || permissionsLoading) {
    return (
      <div className="py-8 w-full relative">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="flex items-center gap-4 p-6 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 animate-fadeIn">
            <FaSpinner className="animate-spin text-3xl text-[#DB9E30]" />
            <span className="text-lg font-medium text-[#441a05]">
              লোড হচ্ছে...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="py-8 w-full relative">
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
          @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
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
          .animate-slideDown {
            animation: slideDown 0.4s ease-out forwards;
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

      <div className="mx-auto">
        {/* Class Tabs */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              শ্রেণি নির্বাচন করুন
            </h3>
          </div>
          <div className="flex flex-wrap gap-3 overflow-x-auto">
            {classesLoading ? (
              <p className="text-[#441a05]/70 animate-fadeIn">
                শ্রেণি লোড হচ্ছে...
              </p>
            ) : (
              classes?.map((cls, index) => (
                <button
                  key={cls.id}
                  onClick={() => handleClassSelect(cls)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-[#441a05] transition-all duration-300 animate-scaleIn ${
                    selectedClass?.id === cls?.id
                      ? "bg-[#DB9E30] hover:text-white"
                      : "bg-white/10 hover:bg-[#441a05]/10"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  title={`শ্রেণি নির্বাচন করুন: ${cls.class_name} ${cls.section_name}`}
                >
                  {cls?.class_name} {cls?.section_name} {cls?.shift_name}
                </button>
              ))
            )}
          </div>
          {periodsError && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              ত্রুটি: {periodsError.status || "অজানা"} -{" "}
              {JSON.stringify(periodsError.data || {})}
            </div>
          )}
        </div>

        {selectedClass && isValidId(selectedClass.class_id) && hasAddPermission && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            {/* Days Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#441a05] mb-3">
                দিন নির্বাচন করুন
              </h3>

              <div className="flex flex-col gap-2">
                {Object.entries(dayMap).map(([engDay, banglaDay]) => (
                  <label
                    key={engDay}
                    className="flex items-center gap-2 cursor-pointer animate-scaleIn"
                  >
                    <input
                      type="radio"
                      name="day"
                      value={engDay}
                      checked={selectedDay === engDay}
                      onChange={() => setSelectedDay(engDay)}
                      className="hidden"
                    />
                    <span
                      className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all duration-300 tick-glow ${
                        selectedDay === engDay
                          ? "bg-[#DB9E30] border-[#DB9E30]"
                          : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                      }`}
                    >
                      {selectedDay === engDay && (
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
                    <span className="text-[#441a05]">{banglaDay}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Periods Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#441a05] mb-3">
                পিরিয়ড নির্বাচন করুন
              </h3>
              {periodsLoading ? (
                <p className="text-[#441a05]/70 animate-fadeIn">লোড হচ্ছে...</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {periods.map((period, index) => (
                    <label
                      key={period.id}
                      className="flex items-center gap-2 cursor-pointer animate-scaleIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <input
                        type="radio"
                        name="period"
                        value={period.id}
                        checked={selectedPeriod?.id === period.id}
                        onChange={() => setSelectedPeriod(period)}
                        className="hidden"
                      />
                      <span
                        className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all duration-300 tick-glow ${
                          selectedPeriod?.id === period.id
                            ? "bg-[#DB9E30] border-[#DB9E30]"
                            : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                        }`}
                      >
                        {selectedPeriod?.id === period.id && (
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
                      <span className="text-[#441a05]">
                        {period.start_time} - {period.end_time}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Subjects Section - FIXED */}
            <div>
              <h3 className="text-lg font-semibold text-[#441a05] mb-3">
                বিষয় নির্বাচন করুন
              </h3>
              {subjectsLoading ? (
                <p className="text-[#441a05]/70 animate-fadeIn">লোড হচ্ছে...</p>
              ) : subjectsError ? (
                <div className="text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
                  বিষয় লোড করতে ত্রুটি: {subjectsError.status || "অজানা"} - {JSON.stringify(subjectsError.data || {})}
                </div>
              ) : activeSubjects.length === 0 ? (
                <p className="text-red-400 animate-fadeIn">
                  এই ক্লাসের জন্য কোনো বিষয় পাওয়া যায়নি
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {activeSubjects.map((subject, index) => (
                    <label
                      key={subject.id}
                      className="flex items-center gap-2 cursor-pointer animate-scaleIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubjects.some(
                          (s) => s.id === subject.id
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubjects([subject]);
                            setSelectedTeacher(null);
                          } else {
                            setSelectedSubjects([]);
                            setSelectedTeacher(null);
                          }
                        }}
                        className="hidden"
                      />
                      <span
                        className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 tick-glow ${
                          selectedSubjects.some((s) => s.id === subject.id)
                            ? "bg-[#DB9E30] border-[#DB9E30]"
                            : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                        }`}
                      >
                        {selectedSubjects.some((s) => s.id === subject.id) && (
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
                      <span className="text-[#441a05]">{subject.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Teachers Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#441a05] mb-3">
                শিক্ষক নির্বাচন করুন
              </h3>
              {teachersLoading || allteachersLoading ? (
                <p className="text-[#441a05]/70 animate-fadeIn">লোড হচ্ছে...</p>
              ) : teachersError ? (
                <div
                  className="text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                  style={{ animationDelay: "0.4s" }}
                >
                  ত্রুটি: {teachersError.status || "অজানা"} -{" "}
                  {JSON.stringify(teachersError.data || {})}
                </div>
              ) : filterTeacher.length === 0 ? (
                <p className="text-red-400 animate-fadeIn">
                  {selectedSubjects.length === 0
                    ? "প্রথমে বিষয় নির্বাচন করুন"
                    : "কোনো শিক্ষক উপলব্ধ নেই"}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {filterTeacher.map((teacher, index) => (
                    <label
                      key={teacher.id}
                      className="flex items-center gap-2 cursor-pointer animate-scaleIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <input
                        type="radio"
                        name="teacher"
                        value={teacher.id}
                        checked={selectedTeacher?.id === teacher.id}
                        onChange={() => setSelectedTeacher(teacher)}
                        className="hidden"
                      />
                      <span
                        className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all duration-300 tick-glow ${
                          selectedTeacher?.id === teacher.id
                            ? "bg-[#DB9E30] border-[#DB9E30]"
                            : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                        }`}
                      >
                        {selectedTeacher?.id === teacher.id && (
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
                      <span className="text-[#441a05]">{teacher.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {selectedClass && isValidId(selectedClass.class_id) && hasAddPermission && (
          <div className="flex justify-center mb-8 animate-fadeIn">
            <button
              onClick={handleCreateRoutine}
              disabled={createLoading}
              className={`relative inline-flex items-center px-10 py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-[#DB9E30] to-[#F4B840] text-[#441a05] transition-all duration-300 shadow-lg hover:shadow-xl btn-glow transform hover:scale-105 ${
                createLoading ? "cursor-not-allowed opacity-70" : ""
              }`}
              title="রুটিন তৈরি করুন"
            >
              {createLoading ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-xl" />
                  <span>সাবমিট করা হচ্ছে...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-3">
                  <IoAdd className="w-6 h-6" />
                  <span>রুটিন তৈরি করুন</span>
                </span>
              )}
            </button>
            {createError && (
              <div
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn w-full max-w-md mx-auto"
                style={{ animationDelay: "0.4s" }}
              >
                ত্রুটি: {createError.status || "অজানা"} -{" "}
                {JSON.stringify(createError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Routine Table */}
        {selectedClass && isValidId(selectedClass.class_id) && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl animate-fadeIn shadow-xl">
            <ClassRoutineTable
              selectedClassId={selectedClass.class_id}
              periods={periods}
            />
          </div>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && hasAddPermission && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                রুটিন তৈরি নিশ্চিত করুন
              </h3>
              <p className="text-[#441a05] mb-6">
                আপনি কি নিশ্চিত যে নতুন রুটিন তৈরি করতে চান?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmCreateRoutine}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন"
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
}