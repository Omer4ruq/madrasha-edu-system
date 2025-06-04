import React, { useState, useMemo } from "react";
import { useGetLeaveApiQuery } from "../../redux/features/api/leave/leaveApi";
import {
  useGetLeaveRequestApiQuery,
  useCreateLeaveRequestApiMutation,
  useUpdateLeaveRequestApiMutation,
  useDeleteLeaveRequestApiMutation,
} from "../../redux/features/api/leave/leaveRequestApi";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { useGetStudentActiveApiQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetStaffListApIQuery } from "../../redux/features/api/staff/staffListApi";

const AddLeaveRequest = () => {
  const [isAdd, setIsAdd] = useState(true);
  const [userType, setUserType] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [leaveApplicationFile, setLeaveApplicationFile] = useState(null);
  const [leaveDescription, setLeaveDescription] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editRequestId, setEditRequestId] = useState(null);
  const [editUserType, setEditUserType] = useState("");
  const [editLeaveTypeId, setEditLeaveTypeId] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStartHour, setEditStartHour] = useState("");
  const [editEndHour, setEditEndHour] = useState("");
  const [editLeaveApplicationFile, setEditLeaveApplicationFile] = useState(null);
  const [editLeaveDescription, setEditLeaveDescription] = useState("");
  const [editSelectedStaff, setEditSelectedStaff] = useState(null);
  const [editSelectedClass, setEditSelectedClass] = useState("");
  const [editSelectedShift, setEditSelectedShift] = useState("");
  const [editSelectedStudent, setEditSelectedStudent] = useState(null);

  // API hooks
  const { data: leaveTypes, isLoading: isLeaveLoading } = useGetLeaveApiQuery();
  const { data: leaveRequests, isLoading: isRequestLoading } = useGetLeaveRequestApiQuery();
  const { data: staffList, isLoading: isStaffListLoading } = useGetStaffListApIQuery();
  const { data: activeStudentList, isLoading: isActiveStudentListLoading } = useGetStudentActiveApiQuery();
  const { data: classConfig, isLoading: isClassConfigLoading } = useGetclassConfigApiQuery();
  const [createRequest, { isLoading: isCreating }] = useCreateLeaveRequestApiMutation();
  const [updateRequest, { isLoading: isUpdating }] = useUpdateLeaveRequestApiMutation();
  const [deleteRequest, { isLoading: isDeleting }] = useDeleteLeaveRequestApiMutation();

  // Prepare staff options for select
  const staffOptions = useMemo(
    () =>
      staffList?.staffs?.map((staff) => ({
        value: staff.user_id,
        label: `${staff.name} - ${staff.designation} (${staff.staff_id_no})`,
      })) || [],
    [staffList]
  );

  // Prepare class and shift options
  const classOptions = useMemo(
    () => [...new Set(classConfig?.map((config) => config.class_name))] || [],
    [classConfig]
  );
  const shiftOptions = useMemo(
    () =>
      classConfig
        ?.filter((config) => config.class_name === selectedClass)
        .map((config) => config.shift_name) || [],
    [classConfig, selectedClass]
  );

  // Prepare student options based on selected class and shift
  const studentOptions = useMemo(
    () =>
      activeStudentList
        ?.filter(
          (student) =>
            student.class_name === selectedClass &&
            student.shift_name === selectedShift
        )
        .map((student) => ({
          value: student.user_id,
          label: `${student.name} - ${student.roll_no}`,
          admission_year: student.admission_year,
        })) || [],
    [activeStudentList, selectedClass, selectedShift]
  );

  // Handle form submission for new leave request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (
      !userType ||
      !leaveTypeId ||
      !startDate ||
      !endDate ||
      // !leaveApplicationFile ||
      (userType === "ছাত্র" && (!selectedClass || !selectedShift || !selectedStudent)) ||
      (userType === "কর্মচারী" && !selectedStaff)
    ) {
      toast.error("সব ফিল্ড পূরণ করুন এবং ছুটির আবেদন ফাইল আপলোড করুন");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      toast.error("শুরুর তারিখ অতীতের হতে পারে না");
      return;
    }
    if (end < start) {
      toast.error("শেষের তারিখ শুরুর তারিখের পরে হতে হবে");
      return;
    }

    // Validate user_id
    const userId = userType === "ছাত্র" ? selectedStudent?.value : selectedStaff?.value;
    const userExists =
      userType === "ছাত্র"
        ? activeStudentList?.some((s) => s.user_id === userId)
        : staffList?.staffs?.some((s) => s.user_id === userId);
    if (!userId || !userExists) {
      toast.error("অবৈধ ব্যবহারকারী নির্বাচন করা হয়েছে");
      return;
    }

    // Validate academic_year for students
    const academicYear = userType === "ছাত্র" ? Number(selectedStudent?.admission_year) : 0;
    if (userType === "ছাত্র" && (!academicYear || isNaN(academicYear))) {
      toast.error("অবৈধ শিক্ষাবর্ষ নির্বাচন করা হয়েছে");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("leave_application", leaveApplicationFile);
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);
      formData.append("start_hour", startHour || "");
      formData.append("end_hour", endHour || "");
      formData.append("status", "PENDING");
      formData.append("leave_description", leaveDescription.trim() || "");
      formData.append("user_id", userId);
      formData.append("leave_type", Number(leaveTypeId));
      formData.append("academic_year", academicYear);
      formData.append("created_at", new Date().toISOString());
      formData.append("updated_at", new Date().toISOString());

      // console.log("FormData payload:" );
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await createRequest(formData).unwrap();
      toast.success("ছুটির আবেদন সফলভাবে জমা দেওয়া হয়েছে!");
      setUserType("");
      setLeaveTypeId("");
      setStartDate("");
      setEndDate("");
      setStartHour("");
      setEndHour("");
      setLeaveApplicationFile(null);
      setLeaveDescription("");
      setSelectedStaff(null);
      setSelectedClass("");
      setSelectedShift("");
      setSelectedStudent(null);
    } catch (err) {
      toast.error(`ছুটির আবেদন জমা ব্যর্থ: ${err?.data?.detail || err.status || "অজানা ত্রুটি"}`);
      console.error("Error:", err);
    }
  };

  // Handle edit button click
  const handleEditClick = (request) => {
    if (request.status !== "PENDING") {
      toast.error("শুধু মুলতুবি আবেদনগুলো সম্পাদনা করা যায়");
      return;
    }
    setEditRequestId(request.id);
    setEditUserType(
      activeStudentList?.some((s) => s.user_id === request.user_id)
        ? "ছাত্র"
        : "কর্মচারী"
    );
    setEditLeaveTypeId(request.leave_type.toString());
    setEditStartDate(request.start_date);
    setEditEndDate(request.end_date);
    setEditStartHour(request.start_hour || "");
    setEditEndHour(request.end_hour || "");
    setEditLeaveApplicationFile(null); // No file initially
    setEditLeaveDescription(request.leave_description || "");

    if (activeStudentList?.some((s) => s.user_id === request.user_id)) {
      const student = activeStudentList.find((s) => s.user_id === request.user_id);
      setEditSelectedClass(student?.class_name || "");
      setEditSelectedShift(student?.shift_name || "");
      setEditSelectedStudent({
        value: student?.user_id,
        label: `${student?.name} - ${student?.roll_no}`,
        admission_year: student?.admission_year,
      });
    } else {
      const staff = staffList?.staffs?.find((s) => s.user_id === request.user_id);
      setEditSelectedStaff({
        value: staff?.user_id,
        label: `${staff?.name} - ${staff?.designation} (${staff?.staff_id_no})`,
      });
    }
    setIsAdd(false);
  };

  // Handle update leave request
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (
      !editUserType ||
      !editLeaveTypeId ||
      !editStartDate ||
      !editEndDate ||
      (editUserType === "ছাত্র" && (!editSelectedClass || !editSelectedShift || !editSelectedStudent)) ||
      (editUserType === "কর্মচারী" && !editSelectedStaff)
    ) {
      toast.error("সব ফিল্ড পূরণ করুন");
      return;
    }
    const start = new Date(editStartDate);
    const end = new Date(editEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      toast.error("শুরুর তারিখ অতীতের হতে পারে না");
      return;
    }
    if (end < start) {
      toast.error("শেষের তারিখ শুরুর তারিখের পরে হতে হবে");
      return;
    }

    // Validate user_id
    const userId = editUserType === "ছাত্র" ? editSelectedStudent?.value : editSelectedStaff?.value;
    const userExists =
      editUserType === "ছাত্র"
        ? activeStudentList?.some((s) => s.user_id === userId)
        : staffList?.staffs?.some((s) => s.user_id === userId);
    if (!userId || !userExists) {
      toast.error("অবৈধ ব্যবহারকারী নির্বাচন করা হয়েছে");
      return;
    }

    // Validate academic_year for students
    const academicYear = editUserType === "ছাত্র" ? Number(editSelectedStudent?.admission_year) : 0;
    if (editUserType === "ছাত্র" && (!academicYear || isNaN(academicYear))) {
      toast.error("অবৈধ শিক্ষাবর্ষ নির্বাচন করা হয়েছে");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", editRequestId);
      // if (editLeaveApplicationFile) {
      //   formData.append("leave_application", editLeaveApplicationFile);
      // }
      formData.append("start_date", editStartDate);
      formData.append("end_date", editEndDate);
      formData.append("start_hour", editStartHour || "");
      formData.append("end_hour", editEndHour || "");
      formData.append("status", "PENDING");
      formData.append("leave_description", editLeaveDescription.trim() || "");
      formData.append("user_id", userId);
      formData.append("leave_type", Number(editLeaveTypeId));
      formData.append("academic_year", academicYear);
      formData.append("updated_at", new Date().toISOString());

      console.log("FormData payload for update:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await updateRequest(formData).unwrap();
      toast.success("ছুটির আবেদন সফলভাবে আপডেট হয়েছে!");
      setEditRequestId(null);
      setEditUserType("");
      setEditLeaveTypeId("");
      setEditStartDate("");
      setEditEndDate("");
      setEditStartHour("");
      setEditEndHour("");
      setEditLeaveApplicationFile(null);
      setEditLeaveDescription("");
      setEditSelectedStaff(null);
      setEditSelectedClass("");
      setEditSelectedShift("");
      setEditSelectedStudent(null);
      setIsAdd(true);
    } catch (err) {
      toast.error(`ছুটির আবেদন আপডেট ব্যর্থ: ${err?.data?.detail || err.status || "অজানা ত্রুটি"}`);
      console.error("Error:", err);
    }
  };

  // Handle delete leave request
  const handleDelete = async (id, status) => {
    if (status !== "PENDING") {
      toast.error("শুধু মুলতুবি আবেদনগুলো মুছে ফেলা যায়");
      return;
    }
    if (window.confirm("আপনি কি নিশ্চিত এই ছুটির আবেদন মুছে ফেলতে চান?")) {
      try {
        await deleteRequest(id).unwrap();
        toast.success("ছুটির আবেদন সফলভাবে মুছে ফেলা হয়েছে!");
      } catch (err) {
        toast.error(`ছুটির আবেদন মুছে ফেলতে ব্যর্থ: ${err?.data?.detail || err.status || "অজানা ত্রুটি"}`);
      }
    }
  };

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" />
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
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
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
          .react-select__control {
            background: transparent !important;
            border: 1px solid #9d9087 !important;
            color: #441a05 !important;
            border-radius: 0.5rem !important;
            transition: all 0.3s !important;
          }
          .react-select__menu {
            background: rgba(0, 0, 0, 0.8) !important;
            backdrop-filter: blur(4px) !important;
            color: #441a05 !important;
          }
          .react-select__option {
            color: #441a05 !important;
          }
          .react-select__option--is-focused {
            background: rgba(219, 158, 48, 0.2) !important;
          }
          .react-select__option--is-selected {
            background: #DB9E30 !important;
            color: #441a05 !important;
          }
          .react-select__single-value {
            color: #441a05 !important;
          }
          .react-select__placeholder {
            color: #441a05 !important;
          }
          .react-select__input {
            color: #441a05 !important;
          }
        `}
      </style>

      <div>
        {/* Add Leave Request Form */}
        {isAdd && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
                ছুটির জন্য আবেদন করুন
              </h3>
            </div>
            <form
              onSubmit={handleSubmitRequest}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  ব্যবহারকারীর ধরন
                </label>
                <select
                  value={userType}
                  onChange={(e) => {
                    setUserType(e.target.value);
                    setSelectedStaff(null);
                    setSelectedClass("");
                    setSelectedShift("");
                    setSelectedStudent(null);
                  }}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isCreating}
                >
                  <option value="">ব্যবহারকারীর ধরন নির্বাচন করুন</option>
                  <option value="ছাত্র">ছাত্র</option>
                  <option value="কর্মচারী">কর্মচারী</option>
                </select>
              </div>
              {userType === "কর্মচারী" && (
                <div>
                  <label className="block text-sm font-medium text-[#441a05] mb-1">
                    কর্মচারী নির্বাচন করুন
                  </label>
                  <Select
                    options={staffOptions}
                    value={selectedStaff}
                    onChange={setSelectedStaff}
                    placeholder="কর্মচারী অনুসন্ধান করুন"
                    isDisabled={isCreating || isStaffListLoading}
                    isLoading={isStaffListLoading}
                    className="text-[#441a05]"
                    classNamePrefix="react-select"
                  />
                </div>
              )}
              {userType === "ছাত্র" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05] mb-1">
                      ক্লাস নির্বাচন করুন
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedShift("");
                        setSelectedStudent(null);
                      }}
                      className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                      disabled={isCreating || isClassConfigLoading}
                    >
                      <option value="">ক্লাস নির্বাচন করুন</option>
                      {classOptions.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05] mb-1">
                      শিফট নির্বাচন করুন
                    </label>
                    <select
                      value={selectedShift}
                      onChange={(e) => {
                        setSelectedShift(e.target.value);
                        setSelectedStudent(null);
                      }}
                      className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                      disabled={isCreating || !selectedClass}
                    >
                      <option value="">শিফট নির্বাচন করুন</option>
                      {shiftOptions.map((shift) => (
                        <option key={shift} value={shift}>
                          {shift}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05] mb-1">
                      ছাত্র নির্বাচন করুন
                    </label>
                    <Select
                      options={studentOptions}
                      value={selectedStudent}
                      onChange={setSelectedStudent}
                      placeholder="ছাত্র অনুসন্ধান করুন"
                      isDisabled={isCreating || isActiveStudentListLoading || !selectedShift}
                      isLoading={isActiveStudentListLoading}
                      className="text-[#441a05]"
                      classNamePrefix="react-select"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  ছুটির প্রকার
                </label>
                <select
                  value={leaveTypeId}
                  onChange={(e) => setLeaveTypeId(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isCreating || isLeaveLoading}
                >
                  <option value="">ছুটির প্রকার নির্বাচন করুন</option>
                  {leaveTypes?.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-full">
                  <label className="block text-sm font-medium text-[#441a05] mb-1">
                    শুরুর তারিখ
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                    disabled={isCreating}
                  />
                </div>
                <label className="self-end mb-2">থেকে</label>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-full">
                  <label className="block text-sm font-medium text-[#441a05] mb-1">
                    শেষের তারিখ
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                    disabled={isCreating}
                  />
                </div>
                <label className="self-end mb-2">পর্যন্ত</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  শুরুর সময়
                </label>
                <input
                  type="time"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="যেমন, ০৯:০০"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  শেষের সময়
                </label>
                <input
                  type="time"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="যেমন, ১৭:০০"
                  disabled={isCreating}
                />
              </div>
              <div className="">
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  ছুটির আবেদন (ফাইল আপলোড)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setLeaveApplicationFile(e.target.files[0])}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isCreating}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  ছুটির বিবরণ
                </label>
                <textarea
                  value={leaveDescription}
                  onChange={(e) => setLeaveDescription(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="ছুটির বিস্তারিত বিবরণ লিখুন (ঐচ্ছিক)"
                  rows={4}
                  disabled={isCreating}
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                title="ছুটির আবেদন জমা দিন"
                className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isCreating ? "cursor-not-allowed" : "hover:text-white hover:shadow-md"
                }`}
              >
                {isCreating ? (
                  <span className="flex items-center space-x-3">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>জমা দেওয়া হচ্ছে...</span>
                  </span>
                ) : (
                  <span>ছুটির আবেদন জমা দিন</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Edit Leave Request Form */}
        {!isAdd && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
                ছুটির আবেদন সম্পাদনা করুন
              </h3>
            </div>
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl"
            >
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  ব্যবহারকারীর ধরন
                </label>
                <select
                  value={editUserType}
                  onChange={(e) => {
                    setEditUserType(e.target.value);
                    setEditSelectedStaff(null);
                    setEditSelectedClass("");
                    setEditSelectedShift("");
                    setEditSelectedStudent(null);
                  }}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isUpdating}
                >
                  <option value="">ব্যবহারকারীর ধরন নির্বাচন করুন</option>
                  <option value="ছাত্র">ছাত্র</option>
                  <option value="কর্মচারী">কর্মচারী</option>
                </select>
              </div>
              {editUserType === "কর্মচারী" && (
                <div>
                  <label className="block text-sm font-medium text-[#441a05] mb-1">
                    কর্মচারী নির্বাচন করুন
                  </label>
                  <Select
                    options={staffOptions}
                    value={editSelectedStaff}
                    onChange={setEditSelectedStaff}
                    placeholder="কর্মচারী অনুসন্ধান করুন"
                    isDisabled={isUpdating || isStaffListLoading}
                    isLoading={isStaffListLoading}
                    className="text-[#441a05]"
                    classNamePrefix="react-select"
                  />
                </div>
              )}
              {editUserType === "ছাত্র" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05] mb-1">
                      ক্লাস নির্বাচন করুন
                    </label>
                    <select
                      value={editSelectedClass}
                      onChange={(e) => {
                        setEditSelectedClass(e.target.value);
                        setEditSelectedShift("");
                        setEditSelectedStudent(null);
                      }}
                      className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                      disabled={isUpdating || isClassConfigLoading}
                    >
                      <option value="">ক্লাস নির্বাচন করুন</option>
                      {classOptions.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05] mb-1">
                      শিফট নির্বাচন করুন
                    </label>
                    <select
                      value={editSelectedShift}
                      onChange={(e) => {
                        setEditSelectedShift(e.target.value);
                        setEditSelectedStudent(null);
                      }}
                      className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                      disabled={isUpdating || !editSelectedClass}
                    >
                      <option value="">শিফট নির্বাচন করুন</option>
                      {classConfig
                        ?.filter((config) => config.class_name === editSelectedClass)
                        .map((config) => config.shift_name)
                        .map((shift) => (
                          <option key={shift} value={shift}>
                            {shift}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05] mb-1">
                      ছাত্র নির্বাচন করুন
                    </label>
                    <Select
                      options={activeStudentList
                        ?.filter(
                          (student) =>
                            student.class_name === editSelectedClass &&
                            student.shift_name === editSelectedShift
                        )
                        .map((student) => ({
                          value: student.user_id,
                          label: `${student.name} - ${student.roll_no}`,
                          admission_year: student.admission_year,
                        }))}
                      value={editSelectedStudent}
                      onChange={setEditSelectedStudent}
                      placeholder="ছাত্র অনুসন্ধান করুন"
                      isDisabled={isUpdating || isActiveStudentListLoading || !editSelectedShift}
                      isLoading={isActiveStudentListLoading}
                      className="text-[#441a05]"
                      classNamePrefix="react-select"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  ছুটির প্রকার
                </label>
                <select
                  value={editLeaveTypeId}
                  onChange={(e) => setEditLeaveTypeId(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isUpdating || isLeaveLoading}
                >
                  <option value="">ছুটির প্রকার নির্বাচন করুন</option>
                  {leaveTypes?.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  শুরুর তারিখ
                </label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  শেষের তারিখ
                </label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  শুরুর সময়
                </label>
                <input
                  type="time"
                  value={editStartHour}
                  onChange={(e) => setEditStartHour(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="যেমন, ০৯:০০"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  শেষের সময়
                </label>
                <input
                  type="time"
                  value={editEndHour}
                  onChange={(e) => setEditEndHour(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="যেমন, ১৭:০০"
                  disabled={isUpdating}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  ছুটির আবেদন (নতুন ফাইল আপলোড, ঐচ্ছিক)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setEditLeaveApplicationFile(e.target.files[0])}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isUpdating}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#441a05] mb-1">
                  ছুটির বিবরণ
                </label>
                <textarea
                  value={editLeaveDescription}
                  onChange={(e) => setEditLeaveDescription(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="ছুটির বিস্তারিত বিবরণ সম্পাদনা করুন (ঐচ্ছিক)"
                  rows={4}
                  disabled={isUpdating}
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                title="ছুটির আবেদন আপডেট করুন"
                className={`relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isUpdating ? "cursor-not-allowed" : "hover:text-white hover:shadow-md"
                }`}
              >
                {isUpdating ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>আপডেট হচ্ছে...</span>
                  </span>
                ) : (
                  <span>ছুটির আবেদন আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditRequestId(null);
                  setEditUserType("");
                  setEditLeaveTypeId("");
                  setEditStartDate("");
                  setEditEndDate("");
                  setEditStartHour("");
                  setEditEndHour("");
                  setEditLeaveApplicationFile(null);
                  setEditLeaveDescription("");
                  setEditSelectedStaff(null);
                  setEditSelectedClass("");
                  setEditSelectedShift("");
                  setEditSelectedStudent(null);
                  setIsAdd(true);
                }}
                title="সম্পাদনা বাতিল"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
          </div>
        )}

        {/* Leave Requests Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
            আপনার ছুটির আবেদনসমূহ
          </h3>
          {isRequestLoading ? (
            <p className="p-4 text-[#441a05]/70">ছুটির আবেদন লোড হচ্ছে...</p>
          ) : leaveRequests?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো ছুটির আবেদন পাওয়া যায়নি।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ছুটির প্রকার
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ব্যবহারকারী
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শুরুর তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শেষের তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শুরুর সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শেষের সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      বিবরণ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      অবস্থা
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      তৈরির সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রিয়াকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {leaveRequests?.map((request, index) => {
                    const leaveType =
                      leaveTypes?.find((lt) => lt.id === request.leave_type)?.name ||
                      "অজানা";
                    const user =
                      staffList?.staffs?.find((s) => s.user_id === request.user_id) ||
                      activeStudentList?.find((s) => s.user_id === request.user_id);
                    const userLabel = user
                      ? user.name
                        ? `${user.name} - ${
                            user.roll_no
                              ? `রোল ${user.roll_no}`
                              : `আইডি ${user.id}`
                          }`
                        : `${user.name} - ${user.designation} (${user.staff_id_no})`
                      : "অজানা";
                    return (
                      <tr
                        key={request.id}
                        className="bg-white/5 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {leaveType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {userLabel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {new Date(request.start_date).toLocaleDateString("bn-BD")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {new Date(request.end_date).toLocaleDateString("bn-BD")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {request.start_hour || "না"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {request.end_hour || "না"}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#441a05] max-w-xs truncate">
                          {request.leave_description || "না"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              request.status === "APPROVED"
                                ? "bg-green-500/20 text-green-400"
                                : request.status === "REJECTED"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {request.status === "PENDING"
                              ? "মুলতুবি"
                              : request.status === "APPROVED"
                              ? "অনুমোদিত"
                              : "প্রত্যাখ্যাত"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                          {new Date(request.created_at).toLocaleString("bn-BD")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(request)}
                            title="ছুটির আবেদন সম্পাদনা করুন"
                            className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                            disabled={request.status !== "PENDING"}
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(request.id, request.status)}
                            title="ছুটির আবেদন মুছে ফেলুন"
                            className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                            disabled={request.status !== "PENDING"}
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {isDeleting && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              ছুটির আবেদন মুছে ফেলা হচ্ছে...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLeaveRequest;