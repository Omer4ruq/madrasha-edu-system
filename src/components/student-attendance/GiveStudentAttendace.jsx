import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetClassSubjectsByClassIdQuery } from "../../redux/features/api/class-subjects/classSubjectsApi";
import { useGetStudentActiveByClassQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetLastThreeAttendanceQuery } from "../../redux/features/api/student-sub-attendance/lastThreeAttendanceApi";
import {
  useCreateStudentSubAttendanceMutation,
  useUpdateStudentSubAttendanceMutation,
  useGetStudentSubAttendanceQuery,
} from "../../redux/features/api/student-sub-attendance/studentSubAttendanceApi";
import { Tooltip } from "react-tooltip";

const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  LEAVE: "LEAVE",
};

const statusLabels = {
  [AttendanceStatus.PRESENT]: "উপস্থিত",
  [AttendanceStatus.ABSENT]: "অনুপস্থিত",
  [AttendanceStatus.LATE]: "বিলম্ব",
  [AttendanceStatus.LEAVE]: "ছুটি",
};

const statusColors = {
  [AttendanceStatus.PRESENT]: "bg-green-500",
  [AttendanceStatus.ABSENT]: "bg-red-500",
  [AttendanceStatus.LATE]: "bg-yellow-500",
  [AttendanceStatus.LEAVE]: "bg-blue-500",
};

const GiveStudentAttendace = () => {
  const [selectedClassConfig, setSelectedClassConfig] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attendanceData, setAttendanceData] = useState({});
  const [originalAttendanceData, setOriginalAttendanceData] = useState({});
  const [bulkAction, setBulkAction] = useState("");
  
  // নতুন স্টেট: ডেটা রিলোডের জন্য
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Class Configs
  const { data: classConfigs = [], isLoading: loadingConfigs } = useGetclassConfigApiQuery();
  const activeClassConfigs = useMemo(() => classConfigs.filter((c) => c.is_active), [classConfigs]);

  // Get selected config and g_class_id
  const selectedConfig = activeClassConfigs.find((c) => c.id == selectedClassConfig);
  const gClassId = selectedConfig?.g_class_id;

  // Fetch Subjects
  const {
    data: subjects = [],
    isLoading: loadingSubjects,
    isFetching: fetchingSubjects,
  } = useGetClassSubjectsByClassIdQuery(gClassId, { skip: !gClassId });

  const activeSubjects = useMemo(() => subjects.filter((s) => s.is_active), [subjects]);

  // Fetch Active Students
  const { data: students = [], isLoading: loadingStudents } = useGetStudentActiveByClassQuery(
    selectedClassConfig,
    { skip: !selectedClassConfig }
  );

  const activeStudents = useMemo(() => students.filter((s) => s.status == "Active"), [students]);

  // Selected Subject
  const selectedSubjectObj = activeSubjects.find((s) => s.id == selectedSubject);

  // Fetch existing attendance - refreshKey দিয়ে কন্ট্রোল করা
  const {
    data: existingAttendance = { attendance: [] },
    refetch: refetchAttendance,
  } = useGetStudentSubAttendanceQuery(
    {
      class_subject_id: selectedSubjectObj?.class_subject || "",
      class_id: selectedClassConfig,
      date: selectedDate,
    },
    { 
      skip: !selectedSubjectObj || !selectedClassConfig || !selectedDate,
      refetchOnMountOrArgChange: refreshKey, // এটা নতুন
    }
  );

  // Last 3 Attendance - এটাও রিফ্রেশ হবে
  const {
    data: lastThreeData = { attendance: [] },
    refetch: refetchLastThree,
  } = useGetLastThreeAttendanceQuery(
    {
      class_subject_id: selectedSubjectObj?.class_subject || "",
      class_id: selectedClassConfig,
    },
    { skip: !selectedSubjectObj || !selectedClassConfig }
  );

  const lastThreeMap = useMemo(() => {
    const map = {};
    lastThreeData.attendance.forEach((item) => {
      if (item.records && item.records.length > 0) {
        map[item.student_id] = item.records.slice(0, 3);
      }
    });
    return map;
  }, [lastThreeData]);

  // Mutations
  const [createAttendance] = useCreateStudentSubAttendanceMutation();
  const [updateAttendance] = useUpdateStudentSubAttendanceMutation();

  // Load existing attendance data
  useEffect(() => {
    if (existingAttendance?.attendance && existingAttendance.attendance.length > 0) {
      const newAttendanceData = {};
      existingAttendance.attendance.forEach((record) => {
        newAttendanceData[record.student_id] = {
          status: record.status,
          remarks: record.remarks || "",
        };
      });
      setAttendanceData(newAttendanceData);
      setOriginalAttendanceData(JSON.parse(JSON.stringify(newAttendanceData)));
    } else {
      // No existing data for this date
      setAttendanceData({});
      setOriginalAttendanceData({});
    }
  }, [existingAttendance, selectedDate, selectedSubject]);

  // Reset on class change
  useEffect(() => {
    setSelectedSubject("");
    setAttendanceData({});
    setBulkAction("");
    setOriginalAttendanceData({});
    setRefreshKey((prev) => prev + 1); // নতুন কী
  }, [selectedClassConfig]);

  // Handlers
  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), status },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), remarks },
    }));
  };

  // Bulk action এখন automatically apply হবে
  const handleBulkAction = (action) => {
    if (!action || !activeStudents.length) return;

    const newAttendanceData = { ...attendanceData };
    activeStudents.forEach((student) => {
      newAttendanceData[student.id] = {
        ...(newAttendanceData[student.id] || {}),
        status: action,
      };
    });

    setAttendanceData(newAttendanceData);
  };

  // ফাইনাল handleSubmit - স্টেট ম্যানেজমেন্ট সহ
  const handleSubmit = async () => {
    if (!selectedClassConfig || !selectedSubject || !selectedDate) {
      alert("শ্রেণি, বিষয় এবং তারিখ নির্বাচন করুন");
      return;
    }

    const hasExistingData = Object.keys(originalAttendanceData).length > 0;
    let attendances;

    if (hasExistingData) {
      // PUT: Only changed data
      attendances = Object.entries(attendanceData)
        .filter(([student_id, data]) => {
          const original = originalAttendanceData[student_id];
          return data.status && (
            !original || 
            original.status !== data.status || 
            (original.remarks || "") !== (data.remarks || "")
          );
        })
        .map(([student_id, { status, remarks }]) => ({
          student_id: Number(student_id),
          attendance_date: selectedDate,
          status,
          ...(remarks?.trim() && { remarks: remarks.trim() }),
        }));

      if (attendances.length === 0) {
        alert("কোনো পরিবর্তন করা হয়নি");
        return;
      }
    } else {
      // POST: All marked attendance
      attendances = Object.entries(attendanceData)
        .filter(([_, data]) => data.status)
        .map(([student_id, { status, remarks }]) => ({
          student_id: Number(student_id),
          attendance_date: selectedDate,
          status,
          ...(remarks?.trim() && { remarks: remarks.trim() }),
        }));

      if (attendances.length === 0) {
        alert("কোনো উপস্থিতি চিহ্নিত করা হয়নি");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        class_subject_id: selectedSubjectObj.class_subject,
        class_id: selectedClassConfig,
        date: selectedDate,
        attendances,
      };

      console.log("Submitting:", payload);

      if (hasExistingData) {
        await updateAttendance(payload).unwrap();
        alert("উপস্থিতি সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await createAttendance(payload).unwrap();
        alert("উপস্থিতি সফলভাবে জমা দেওয়া হয়েছে!");
      }

      // স্টেট রিফ্রেশ - এটাই মূল কাজ
      setRefreshKey((prev) => prev + 1);
      
      // UI রিফ্রেশ
      await refetchAttendance();
      await refetchLastThree();
      
      // Original data আপডেট করো
      setOriginalAttendanceData(JSON.parse(JSON.stringify(attendanceData)));

    } catch (err) {
      console.error("Submit error:", err);
      alert("উপস্থিতি জমা দিতে ব্যর্থ: " + (err?.data?.message || err.message || "অজানা ত্রুটি"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExistingData = Object.keys(originalAttendanceData).length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#441a05]">
        ছাত্র-ছাত্রীর উপস্থিতি প্রদান
      </h2>

      {/* Header with Selectors and Submit Button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">শ্রেণি কনফিগ</label>
            <select
              value={selectedClassConfig}
              onChange={(e) => setSelectedClassConfig(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={loadingConfigs}
            >
              <option value="">-- নির্বাচন করুন --</option>
              {activeClassConfigs.map((cfg) => (
                <option key={cfg.id} value={cfg.id}>
                  {cfg.g_class_name} - {cfg.section_name} ({cfg.shift_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">বিষয়</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={!selectedClassConfig || loadingSubjects || fetchingSubjects}
            >
              <option value="">-- নির্বাচন করুন --</option>
              {activeSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">তারিখ</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions - বাটন ছাড়া */}
      {selectedClassConfig && selectedSubject && activeStudents.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              সকলের জন্য নির্বাচন করুন:
            </label>
            <select
              value={bulkAction}
              onChange={(e) => {
                setBulkAction(e.target.value);
                handleBulkAction(e.target.value);
              }}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- নির্বাচন করুন --</option>
              {Object.values(AttendanceStatus).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#DB9E30] text-white font-bold rounded-lg shadow-md hover:bg-[#c78a28] disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
            >
              {isSubmitting ? "জমা হচ্ছে..." : hasExistingData ? "উপস্থিতি আপডেট করুন" : "উপস্থিতি জমা দিন"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {selectedClassConfig && selectedSubject ? (
        loadingStudents ? (
          <p className="text-center py-8">ছাত্র তালিকা লোড হচ্ছে...</p>
        ) : activeStudents.length === 0 ? (
          <p className="text-center py-8 text-orange-600">কোনো সক্রিয় ছাত্র পাওয়া যায়নি</p>
        ) : (
          <>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="border px-3 py-2 text-left font-bold">রোল</th>
                    <th className="border px-3 py-2 text-center">ছবি</th>
                    <th className="border px-3 py-2 text-left font-bold">নাম</th>
                    <th className="border px-3 py-2 text-center">শেষ ৩ দিন</th>
                    <th className="border px-3 py-2 text-center font-bold">উপস্থিতি</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudents.map((student) => {
                    const lastThree = lastThreeMap[student.id] || [];
                    const current = attendanceData[student.id] || {};

                    return (
                      <tr key={student.id} className="hover:bg-gray-50 transition">
                        <td className="border px-3 py-2 font-medium">{student?.roll_no}</td>
                        <td className="border px-3 py-2">
                          <div className="flex justify-center">
                            <img
                              src={student.avatar || "/default-avatar.png"}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                          </div>
                        </td>
                        <td className="border px-3 py-2 font-semibold">{student.name}</td>

                        {/* Last 3 Dots */}
                        <td className="border px-3 py-2">
                          <div className="flex justify-center gap-1">
                            {[...Array(3)].map((_, i) => {
                              const record = lastThree[i];
                              const color = record
                                ? statusColors[record.status.toUpperCase()] || "bg-gray-300"
                                : "bg-gray-200";
                              const date = record
                                ? format(new Date(record.attendance_date), "MM/dd")
                                : "--";
                              const status = record
                                ? statusLabels[record.status.toUpperCase()]
                                : "রেকর্ড নেই";

                              if (!record) {
                                return (
                                  <div key={i} className={`w-4 h-4 rounded-full ${color} border`} />
                                );
                              }

                              const tooltipId = `tooltip-${student.id}-${i}`;
                              const tooltipContent = record.remarks?.trim()
                                ? `${date}\n${status}\n${record.remarks}`
                                : `${date}\n${status}`;

                              return (
                                <div key={i}>
                                  <div
                                    data-tooltip-id={tooltipId}
                                    data-tooltip-content={tooltipContent}
                                    className={`w-4 h-4 rounded-full ${color} border cursor-help`}
                                  />
                                  <Tooltip id={tooltipId} place="top" className="z-50" />
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* Radio Buttons */}
                        <td className="border px-3 py-2">
                          <div className="flex justify-center gap-2 flex-wrap">
                            {Object.values(AttendanceStatus).map((status) => (
                              <label
                                key={status}
                                className="flex flex-col items-center gap-1 justify-center cursor-pointer text-xs"
                              >
                                <input
                                  type="radio"
                                  name={`status-${student.id}`}
                                  checked={current.status == status}
                                  onChange={() => handleStatusChange(student.id, status)}
                                  className="hidden"
                                />
                                <span
                                  className={`font-medium px-2 py-1 rounded transition ${
                                    current.status == status
                                      ? statusColors[status] + " text-white"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  {statusLabels[status]}
                                </span>
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* সাবমিট স্ট্যাটাস দেখানোর জন্য */}
            {isSubmitting && (
              <div className="mt-4 p-3 bg-blue-50 border rounded-lg">
                <p className="text-sm text-blue-700">উপস্থিতি আপডেট হচ্ছে... দয়া করে অপেক্ষা করুন</p>
              </div>
            )}
          </>
        )
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">শ্রেণি কনফিগ এবং বিষয় নির্বাচন করুন</p>
        </div>
      )}
    </div>
  );
};

export default GiveStudentAttendace;