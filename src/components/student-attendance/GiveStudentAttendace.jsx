import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import Select from "react-select";
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
import { IoAddCircle } from "react-icons/io5";
import toast from "react-hot-toast";
import selectStyles from '../../utilitis/selectStyles';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';

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
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [originalAttendanceData, setOriginalAttendanceData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { group_id } = useSelector((state) => state.auth);

  const today = format(new Date(), "yyyy-MM-dd");
  const selectedDate = today;

  // Permissions
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_student_sub_attendance') || true;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_student_sub_attendance') || true;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_student_sub_attendance') || true;

  // Fetch Class Configs
  const { data: classConfigs = [], isLoading: loadingConfigs } = useGetclassConfigApiQuery();
  const activeClassConfigs = useMemo(() => classConfigs.filter((c) => c.is_active), [classConfigs]);

  const classOptions = useMemo(
    () =>
      activeClassConfigs.map((cfg) => ({
        value: cfg.id,
        label: `${cfg.g_class_name} - ${cfg.section_name || ''} (${cfg.shift_name || ''})`.trim(),
        g_class_id: cfg.g_class_id,
      })),
    [activeClassConfigs]
  );

  const selectedClassId = selectedClassConfig?.value;
  const gClassId = selectedClassConfig?.g_class_id;

  // Fetch Subjects
  const {
    data: subjects = [],
    isLoading: loadingSubjects,
    isFetching: fetchingSubjects,
  } = useGetClassSubjectsByClassIdQuery(gClassId, { skip: !gClassId });

  const activeSubjects = useMemo(() => subjects.filter((s) => s.is_active), [subjects]);

  const subjectOptions = useMemo(
    () =>
      activeSubjects.map((sub) => ({
        value: sub.id,
        label: sub.name,
        class_subject: sub.class_subject,
      })),
    [activeSubjects]
  );

  // Fetch Active Students
  const { data: students = [], isLoading: loadingStudents } = useGetStudentActiveByClassQuery(
    selectedClassId,
    { skip: !selectedClassId }
  );

  const activeStudents = useMemo(() => {
    const filtered = students.filter((s) => s.status === "Active");
    return filtered.sort((a, b) => {
      const rollA = parseInt(a.roll_no) || 0;
      const rollB = parseInt(b.roll_no) || 0;
      return rollA - rollB;
    });
  }, [students]);

  const selectedSubjectObj = selectedSubject;

  // Fetch Existing Attendance
  const {
    data: existingAttendance = { attendance: [] },
    refetch: refetchAttendance,
  } = useGetStudentSubAttendanceQuery(
    {
      class_subject_id: selectedSubjectObj?.class_subject || "",
      class_id: selectedClassId,
      date: selectedDate,
    },
    { skip: !selectedSubjectObj || !selectedClassId || !hasViewPermission }
  );

  // Last 3 Attendance
  const {
    data: lastThreeData = { attendance: [] },
    refetch: refetchLastThree,
  } = useGetLastThreeAttendanceQuery(
    {
      class_subject_id: selectedSubjectObj?.class_subject || "",
      class_id: selectedClassId,
    },
    { skip: !selectedSubjectObj || !selectedClassId || !hasViewPermission }
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

  const [createAttendance] = useCreateStudentSubAttendanceMutation();
  const [updateAttendance] = useUpdateStudentSubAttendanceMutation();

  // Load existing attendance – সব ছাত্রের জন্য attendanceData তৈরি করো
  useEffect(() => {
    if (!existingAttendance?.attendance || activeStudents.length === 0) {
      setAttendanceData({});
      setOriginalAttendanceData({});
      return;
    }

    const newAttendance = {};
    const newOriginal = {};

    activeStudents.forEach((student) => {
      const record = existingAttendance.attendance.find((r) => r.student_id === student.id);
      const status = record?.status ?? null;

      newAttendance[student.id] = { status };
      newOriginal[student.id] = { status };
    });

    setAttendanceData(newAttendance);
    setOriginalAttendanceData(newOriginal);
  }, [existingAttendance, activeStudents]);

  // Reset on class change
  useEffect(() => {
    setSelectedSubject(null);
    setBulkAction(null);
    setAttendanceData({});
    setOriginalAttendanceData({});
  }, [selectedClassConfig]);

  const handleStatusChange = (studentId, status) => {
    if (!hasAddPermission && !hasChangePermission) {
      toast.error('আপনার এই কাজটি করার অনুমতি নেই।');
      return;
    }

    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { status },
    }));
  };

  const handleBulkAction = (action) => {
    if (!hasAddPermission && !hasChangePermission) {
      toast.error('আপনার এই কাজটি করার অনুমতি নেই।');
      return;
    }

    if (!action || !activeStudents.length) return;
    const newAttendanceData = {};
    activeStudents.forEach((student) => {
      newAttendanceData[student.id] = { status: action.value };
    });
    setAttendanceData(newAttendanceData);
  };

  const handleSubmit = async () => {
    if (!hasAddPermission && !hasChangePermission) {
      toast.error('আপনার এই কাজটি করার অনুমতি নেই।');
      return;
    }

    if (!selectedClassId || !selectedSubject) {
      toast.error("শ্রেণি এবং বিষয় নির্বাচন করুন");
      return;
    }

    const toastId = toast.loading("উপস্থিতি জমা হচ্ছে...");

    try {
      setIsSubmitting(true);

      // শুধুমাত্র পরিবর্তিত রেকর্ড পাঠানো হবে
      const attendances = activeStudents
        .map((student) => {
          const current = attendanceData[student.id]?.status ?? null;
          const original = originalAttendanceData[student.id]?.status ?? null;

          if (current !== original) {
            return {
              student_id: student.id,
              attendance_date: selectedDate,
              status: current,
            };
          }
          return null;
        })
        .filter(Boolean);

      if (attendances.length === 0) {
        toast("কোনো পরিবর্তন করা হয়নি", { icon: "info", id: toastId });
        return;
      }

      const payload = {
        class_subject_id: selectedSubject.class_subject,
        class_id: selectedClassId,
        date: selectedDate,
        attendances,
      };

      const hasExistingData = Object.keys(originalAttendanceData).length > 0;

      if (hasExistingData) {
        if (!hasChangePermission) {
          toast.error('আপডেট করার অনুমতি আপনার নেই।', { id: toastId });
          return;
        }
        await updateAttendance(payload).unwrap();
        toast.success("উপস্থিতি সফলভাবে আপডেট করা হয়েছে!", { id: toastId });
      } else {
        if (!hasAddPermission) {
          toast.error('তৈরি করার অনুমতি আপনার নেই।', { id: toastId });
          return;
        }
        await createAttendance(payload).unwrap();
        toast.success("উপস্থিতি সফলভাবে জমা দেওয়া হয়েছে!", { id: toastId });
      }

      // originalAttendanceData আপডেট করো
      const updatedOriginal = {};
      activeStudents.forEach((student) => {
        updatedOriginal[student.id] = {
          status: attendanceData[student.id]?.status ?? null,
        };
      });
      setOriginalAttendanceData(updatedOriginal);

      // Refetch
      await refetchAttendance();
      await refetchLastThree();

    } catch (err) {
      const message = err?.data?.message || err.message || "অজানা ত্রুটি";
      toast.error(`উপস্থিতি জমা দিতে ব্যর্থ: ${message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExistingData = Object.keys(originalAttendanceData).length > 0;

  const bulkOptions = Object.values(AttendanceStatus).map((status) => ({
    value: status,
    label: statusLabels[status],
  }));

  // Permission-based Rendering
  if (permissionsLoading) {
    return <div className="p-4 text-center">অনুমতি লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-center text-red-500">এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।</div>;
  }

  return (
    <div className="py-8 w-full relative mx-auto">
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .btn-glow:hover { box-shadow: 0 0 15px rgba(219, 158, 48, 0.3); }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
        `}
      </style>

      {/* Header Card */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-2 mb-6">
          <IoAddCircle className="text-3xl text-[#441a05]" />
          <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">ছাত্র-ছাত্রীর উপস্থিতি</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Class Select */}
          <div className="animate-fadeIn">
            <label className="block text-[#441a05] sm:text-base text-xs font-medium mb-2">শ্রেণি:</label>
            <Select
              options={classOptions}
              value={selectedClassConfig}
              onChange={setSelectedClassConfig}
              placeholder="শ্রেণি নির্বাচন"
              isLoading={loadingConfigs}
              isClearable
              isSearchable
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="animate-scaleIn"
            />
          </div>

          {/* Subject Select */}
          <div className="animate-fadeIn">
            <label className="block text-[#441a05] sm:text-base text-xs font-medium mb-2">বিষয়:</label>
            <Select
              options={subjectOptions}
              value={selectedSubject}
              onChange={setSelectedSubject}
              placeholder="বিষয় নির্বাচন"
              isLoading={loadingSubjects || fetchingSubjects}
              isDisabled={!selectedClassConfig}
              isClearable
              isSearchable
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="animate-scaleIn"
            />
          </div>

          {/* Fixed Date */}
          <div className="animate-fadeIn">
            <label className="block text-[#441a05] sm:text-base text-xs font-medium mb-2">তারিখ:</label>
            <div className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg cursor-default animate-scaleIn">
              {format(new Date(), "dd MMMM, yyyy")}
            </div>
          </div>
        </div>

        {/* Bulk Action & Submit */}
        {selectedClassId && selectedSubject && activeStudents.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-[#441a05] font-medium">সকলের জন্য:</span>
              <div className="w-48">
                <Select
                  options={bulkOptions}
                  value={bulkAction}
                  onChange={(opt) => {
                    setBulkAction(opt);
                    handleBulkAction(opt);
                  }}
                  placeholder="নির্বাচন"
                  isClearable
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!hasAddPermission && !hasChangePermission)}
              className="px-6 py-2 bg-[#DB9E30] text-[#441a05] font-bold rounded-lg hover:text-white transition-all btn-glow disabled:opacity-60"
            >
              {isSubmitting ? "জমা হচ্ছে..." : hasExistingData ? "আপডেট করুন" : "জমা দিন"}
            </button>
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05]">উপস্থিতি তালিকা</h3>
        </div>

        {selectedClassId && selectedSubject ? (
          loadingStudents ? (
            <p className="p-6 text-center text-[#441a05]/70 animate-pulse">ছাত্র তালিকা লোড হচ্ছে...</p>
          ) : activeStudents.length === 0 ? (
            <p className="p-6 text-center text-orange-600">কোনো সক্রিয় ছাত্র পাওয়া যায়নি</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05] uppercase">রোল</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#441a05] uppercase">ছবি</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05] uppercase">নাম</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#441a05] uppercase">শেষ ৩ দিন</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-[#441a05] uppercase">উপস্থিতি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {activeStudents.map((student, index) => {
                    const lastThree = lastThreeMap[student.id] || [];
                    const current = attendanceData[student.id] || { status: null };

                    return (
                      <tr key={student.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                        <td className="px-4 py-3 text-sm text-[#441a05] font-medium">{student.roll_no}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <img
                              src={student.avatar || "/default-avatar.png"}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-[#DB9E30]/30"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#441a05] font-semibold">{student.name}</td>

                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            {[...Array(3)].map((_, i) => {
                              const record = lastThree[i];
                              const color = record
                                ? statusColors[record.status.toUpperCase()] || "bg-gray-300"
                                : "bg-gray-200";
                              const tooltipId = `tooltip-${student.id}-${i}`;
                              const content = record
                                ? `${format(new Date(record.attendance_date), "dd MMM")}, ${statusLabels[record.status.toUpperCase()]}`
                                : "রেকর্ড নেই";

                              return (
                                <div key={i}>
                                  <div
                                    data-tooltip-id={tooltipId}
                                    data-tooltip-content={content}
                                    className={`w-5 h-5 rounded-full ${color} border-2 border-white cursor-help transition-transform hover:scale-110`}
                                  />
                                  <Tooltip id={tooltipId} place="top" className="z-50 text-xs" />
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2 flex-wrap">
                            {Object.values(AttendanceStatus).map((status) => (
                              <label key={status} className="cursor-pointer">
                                <input
                                  type="radio"
                                  name={`status-${student.id}`}
                                  checked={current.status === status}
                                  onChange={() => handleStatusChange(student.id, status)}
                                  className="hidden"
                                  disabled={!hasAddPermission && !hasChangePermission}
                                />
                                <span
                                  className={`inline-block px-3 py-1 border text-xs font-medium rounded-full transition-all ${
                                    current.status === status
                                      ? `${statusColors[status]} text-white shadow-lg`
                                      : "bg-white/10 text-[#441a05] hover:bg-white/20"
                                  } ${(!hasAddPermission && !hasChangePermission) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          )
        ) : (
          <p className="p-6 text-center text-[#441a05]/70 animate-fadeIn">
            শ্রেণি এবং বিষয় নির্বাচন করুন
          </p>
        )}
      </div>
    </div>
  );
};

export default GiveStudentAttendace;