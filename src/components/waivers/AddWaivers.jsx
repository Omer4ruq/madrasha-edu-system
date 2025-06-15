import React, { useState, useMemo } from "react";
import Select from "react-select";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetStudentActiveApiQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetFeeHeadsQuery } from "../../redux/features/api/fee-heads/feeHeadsApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import {
  useCreateWaiverMutation,
  useDeleteWaiverMutation,
  useGetWaiversQuery,
  useUpdateWaiverMutation,
} from "../../redux/features/api/waivers/waiversApi";
import { useGetFundsQuery } from "../../redux/features/api/funds/fundsApi";

const AddWaivers = () => {
  const [isAdd, setIsAdd] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentWaivers, setStudentWaivers] = useState({});
  const [editWaiverId, setEditWaiverId] = useState(null);
  const [editWaiverData, setEditWaiverData] = useState({
    student_id: null,
    waiver_amount: "",
    academic_year: null,
    description: "",
    fee_types: [],
    fund_id: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteWaiverId, setDeleteWaiverId] = useState(null);

  // API হুক
  const { data: classes, isLoading: isClassLoading } = useGetclassConfigApiQuery();
  const { data: students, isLoading: isStudentLoading } = useGetStudentActiveApiQuery();
  const { data: feeHeads, isLoading: isFeeHeadsLoading } = useGetFeeHeadsQuery();
  const { data: academicYears, isLoading: isAcademicYearLoading } = useGetAcademicYearApiQuery();
  const { data: waivers, isLoading: isWaiverLoading } = useGetWaiversQuery();
  const { data: funds, isLoading: isFundsLoading } = useGetFundsQuery();
  const [createWaiver, { isLoading: isCreating }] = useCreateWaiverMutation();
  const [updateWaiver, { isLoading: isUpdating }] = useUpdateWaiverMutation();
  const [deleteWaiver, { isLoading: isDeleting }] = useDeleteWaiverMutation();

  // বর্তমান সময় +06 এর জন্য ISO ফরম্যাটে
  const getCurrentTimeISO = () => {
    const date = new Date();
    const offset = 6 * 60; // +06:00 মিনিটে
    const localTime = new Date(date.getTime() + offset * 60 * 1000);
    return localTime.toISOString().replace("Z", "+06:00");
  };

  // ক্লাস অপশন তৈরি
  const classOptions =
    classes?.map((cls) => ({
      value: cls.id,
      label: `${cls.class_name}-${cls.section_name}-${cls.shift_name}`,
    })) || [];

  // ফান্ড অপশন তৈরি
  const fundOptions =
    funds?.map((fund) => ({
      value: fund.id,
      label: fund.name,
    })) || [];

  // ছাত্র ফিল্টার
  const filteredStudents = useMemo(() => {
    if (!students || !selectedClassId) return [];
    return students.filter(
      (student) =>
        student.class_id === selectedClassId &&
        (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.user_id.toString().includes(searchQuery))
    );
  }, [students, selectedClassId, searchQuery]);

  // ফি প্রকার এবং শিক্ষাবর্ষ অপশন
  const feeTypeOptions =
    feeHeads?.map((fee) => ({
      value: fee.id,
      label: fee.name || `ফি ${fee.id}`,
    })) || [];

  const academicYearOptions =
    academicYears?.map((year) => ({
      value: year.id,
      label: year.year || year.name || `বছর ${year.id}`,
    })) || [];

  // চেকবক্স দিয়ে ছাত্র নির্বাচন
  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        const newWaivers = { ...studentWaivers };
        delete newWaivers[studentId];
        setStudentWaivers(newWaivers);
        return prev.filter((id) => id !== studentId);
      } else {
        setStudentWaivers((prevWaivers) => ({
          ...prevWaivers,
          [studentId]: {
            student_id: studentId,
            waiver_amount: "",
            academic_year: null,
            description: "",
            fee_types: [],
            fund_id: null,
          },
        }));
        return [...prev, studentId];
      }
    });
  };

  // ওয়েভার ডেটা পরিবর্তন
  const handleWaiverChange = (studentId, field, value) => {
    if (field === "waiver_amount" && value > 100) {
      toast.error("ওয়েভার পরিমাণ ১০০% এর বেশি হতে পারবে না।");
      return;
    }
    setStudentWaivers((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // ওয়েভার তৈরি
  const handleSubmitWaivers = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      toast.error("অন্তত একজন ছাত্র নির্বাচন করুন।");
      return;
    }

    const errors = [];
    const payloads = selectedStudents.map((studentId) => {
      const waiver = studentWaivers[studentId];
      if (
        !waiver.waiver_amount ||
        !waiver.academic_year ||
        !waiver.fee_types.length ||
        !waiver.fund_id
      ) {
        errors.push(
          `ছাত্র আইডি ${studentId} এর জন্য প্রয়োজনীয় ক্ষেত্রগুলি পূরণ করুন (ফি প্রকার, ওয়েভার পরিমাণ, শিক্ষাবর্ষ, ফান্ড)।`
        );
        return null;
      }
      if (parseFloat(waiver.waiver_amount) > 100) {
        errors.push(
          `ছাত্র আইডি ${studentId} এর জন্য ওয়েভার পরিমাণ ১০০% এর বেশি হতে পারবে না।`
        );
        return null;
      }
      return {
        student_id: waiver.student_id,
        waiver_amount: parseFloat(waiver.waiver_amount),
        academic_year: waiver.academic_year,
        description: waiver.description.trim() || null,
        fee_types: waiver.fee_types,
        fund_id: waiver.fund_id,
        created_by: 1,
        updated_by: 1,
      };
    });

    if (errors.length > 0) {
      toast.error(errors.join("\n"));
      return;
    }

    try {
      const validPayloads = payloads.filter((p) => p !== null);
      await Promise.all(
        validPayloads.map((payload) => createWaiver(payload).unwrap())
      );
      toast.success("ওয়েভারগুলি সফলভাবে তৈরি হয়েছে!");
      setSelectedStudents([]);
      setStudentWaivers({});
      setSelectedClassId(null);
      setSearchQuery("");
    } catch (err) {
      console.error("ওয়েভার তৈরিতে ত্রুটি:", err);
      toast.error(`ওয়েভার তৈরি ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    }
  };

  // সম্পাদনা বোতাম
  const handleEditClick = (waiver) => {
    setEditWaiverId(waiver.id);
    setEditWaiverData({
      student_id: waiver.student_id,
      waiver_amount: waiver.waiver_amount.toString(),
      academic_year: waiver.academic_year,
      description: waiver.description || "",
      fee_types: waiver.fee_types || [],
      fund_id: waiver.fund_id || null,
    });
    setIsAdd(false);
  };

  // ওয়েভার আপডেট
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (
      !editWaiverData.student_id ||
      !editWaiverData.waiver_amount ||
      !editWaiverData.academic_year ||
      !editWaiverData.fee_types.length ||
      !editWaiverData.fund_id
    ) {
      toast.error(
        "ছাত্র, ফি প্রকার, ওয়েভার পরিমাণ, শিক্ষাবর্ষ এবং ফান্ড পূরণ করুন।"
      );
      return;
    }
    if (parseFloat(editWaiverData.waiver_amount) > 100) {
      toast.error("ওয়েভার পরিমাণ ১০০% এর বেশি হতে পারবে না।");
      return;
    }

    try {
      const payload = {
        id: editWaiverId,
        student_id: editWaiverData.student_id,
        waiver_amount: parseFloat(editWaiverData.waiver_amount),
        academic_year: editWaiverData.academic_year,
        description: editWaiverData.description.trim() || null,
        fee_types: editWaiverData.fee_types,
        fund_id: editWaiverData.fund_id,
        updated_by: 1,
      };
      await updateWaiver(payload).unwrap();
      toast.success("ওয়েভার সফলভাবে আপডেট হয়েছে!");
      setEditWaiverId(null);
      setEditWaiverData({
        student_id: null,
        waiver_amount: "",
        academic_year: null,
        description: "",
        fee_types: [],
        fund_id: null,
      });
      setIsAdd(true);
    } catch (err) {
      console.error("ওয়েভার আপডেটে ত্রুটি:", err);
      toast.error(`ওয়েভার আপডেট ব্যর্থ: ${err.status || "ত্রুটি"}`);
    }
  };

  // ওয়েভার মুছে ফেলা
  const handleDelete = (id) => {
    setDeleteWaiverId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteWaiver(deleteWaiverId).unwrap();
      toast.success("ওয়েভার সফলভাবে মুছে ফেলা হয়েছে!");
      setIsModalOpen(false);
      setDeleteWaiverId(null);
    } catch (err) {
      console.error("ওয়েভার মুছতে ত্রুটি:", err);
      toast.error(`ওয়েভার মুছতে ব্যর্থ: ${err.status || "ত্রুটি"}`);
      setIsModalOpen(false);
      setDeleteWaiverId(null);
    }
  };

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      background: "transparent",
      borderColor: "#9d9087",
      color: "#fff",
      padding: "1px",
      borderRadius: "0.5rem",
      "&:hover": { borderColor: "#DB9E30" },
    }),
    singleValue: (provided) => ({ ...provided, color: "#441a05" }),
    multiValue: (provided) => ({
      ...provided,
      background: "#DB9E30",
      color: "#fff",
    }),
    multiValueLabel: (provided) => ({ ...provided, color: "#441a05" }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#441a05",
      "&:hover": { background: "#441a05", color: "#DB9E30" },
    }),
    menu: (provided) => ({
      ...provided,
      background: "#fff",
      color: "#441a05",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (provided, state) => ({
      ...provided,
      background: state.isSelected ? "#DB9E30" : "#fff",
      color: "#441a05",
      "&:hover": { background: "#DB9E30", color: "#441a05" },
    }),
  };

  // তারিখ ফরম্যাট
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("bn-BD", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <div className="py-8 w-full relative">
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: "#DB9E30", color: "#441a05" } }}
      />
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
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
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

      {/* মডাল */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              ওয়েভার মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই ওয়েভারটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${
                  isDeleting
                    ? "cursor-not-allowed opacity-60"
                    : "hover:text-white"
                }`}
              >
                {isDeleting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>মুছছে...</span>
                  </span>
                ) : (
                  "নিশ্চিত করুন"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ওয়েভার যোগ ফর্ম */}
      {isAdd && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              নতুন ওয়েভার যোগ করুন
            </h3>
          </div>

          {/* ক্লাস নির্বাচন এবং অনুসন্ধান */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Select
              options={classOptions}
              value={classOptions.find((option) => option.value === selectedClassId) || null}
              onChange={(selected) => {
                setSelectedClassId(selected?.value || null);
                setSelectedStudents([]);
                setStudentWaivers({});
                setSearchQuery("");
              }}
              placeholder="ক্লাস নির্বাচন করুন"
              isLoading={isClassLoading}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="w-full"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="নাম বা ইউজার আইডি দিয়ে অনুসন্ধান করুন"
              disabled={isStudentLoading || !selectedClassId}
            />
          </div>

          {/* ছাত্র নির্বাচন টেবিল */}
          {selectedClassId && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-[#441a05] mb-4">
                ছাত্র নির্বাচন করুন
              </h4>
              {isStudentLoading ? (
                <p className="text-[#441a05]/70">ছাত্রদের লোড হচ্ছে...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-[#441a05]/70">কোনো ছাত্র পাওয়া যায়নি।</p>
              ) : (
                <div className="overflow-x-auto max-h-[30vh]">
                  <table className="min-w-full divide-y divide-white/20">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          নির্বাচন
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          নাম
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          ইউজার আইডি
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          ফি প্রকার
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          ওয়েভার পরিমাণ (%)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          শিক্ষাবর্ষ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          ফান্ড
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          বর্ণনা
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20">
                      {filteredStudents.map((student, index) => {
                        const waiver = studentWaivers[student.id] || {};
                        const isDisabled = isCreating || !selectedStudents.includes(student.id);
                        const disabledClass = isDisabled ? "opacity-40 cursor-not-allowed" : "";

                        return (
                          <tr
                            key={student.id}
                            className="bg-white/5 animate-fadeIn"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.includes(student.id)}
                                  onChange={() => handleStudentToggle(student.id)}
                                  className="hidden"
                                />
                                <span
                                  className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                                    selectedStudents.includes(student.id)
                                      ? "bg-[#DB9E30] border-[#DB9E30]"
                                      : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                                  }`}
                                >
                                  {selectedStudents.includes(student.id) && (
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
                              </label>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                              {student.user_id}
                            </td>

                            {/* Fee Types Select */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Select
                                isMulti
                                options={feeTypeOptions}
                                value={feeTypeOptions.filter((option) =>
                                  waiver.fee_types?.includes(option.value)
                                )}
                                onChange={(selected) =>
                                  handleWaiverChange(
                                    student.id,
                                    "fee_types",
                                    selected.map((opt) => opt.value)
                                  )
                                }
                                placeholder="ফি প্রকার নির্বাচন করুন"
                                isLoading={isFeeHeadsLoading}
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                className={`w-full max-w-xs ${disabledClass}`}
                                isDisabled={isDisabled}
                              />
                            </td>

                            {/* Waiver Amount Input */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={waiver.waiver_amount || ""}
                                onChange={(e) =>
                                  handleWaiverChange(
                                    student.id,
                                    "waiver_amount",
                                    e.target.value
                                  )
                                }
                                className={`w-[120px]  bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 ${disabledClass}`}
                                placeholder="পরিমাণ (%)"
                                disabled={isDisabled}
                                min="0"
                                max="100"
                                step="0.01"
                              />
                            </td>

                            {/* Academic Year Select */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Select
                                options={academicYearOptions}
                                value={
                                  academicYearOptions.find(
                                    (option) => option.value === waiver.academic_year
                                  ) || null
                                }
                                onChange={(selected) =>
                                  handleWaiverChange(
                                    student.id,
                                    "academic_year",
                                    selected?.value || null
                                  )
                                }
                                placeholder="শিক্ষাবর্ষ নির্বাচন করুন"
                                isLoading={isAcademicYearLoading}
                                styles={selectStyles}
                                className={`w-full max-w-xs ${disabledClass}`}
                                isDisabled={isDisabled}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                              />
                            </td>

                            {/* Fund Select */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Select
                                options={fundOptions}
                                value={
                                  fundOptions.find((option) => option.value === waiver.fund_id) ||
                                  null
                                }
                                onChange={(selected) =>
                                  handleWaiverChange(
                                    student.id,
                                    "fund_id",
                                    selected?.value || null
                                  )
                                }
                                placeholder="ফান্ড নির্বাচন করুন"
                                isLoading={isFundsLoading}
                                styles={selectStyles}
                                className={`w-full max-w-xs ${disabledClass}`}
                                isDisabled={isDisabled}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                              />
                            </td>

                            {/* Description Input */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={waiver.description || ""}
                                onChange={(e) =>
                                  handleWaiverChange(
                                    student.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className={`w-[200px] bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 ${disabledClass}`}
                                placeholder="বর্ণনা"
                                disabled={isDisabled}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* নির্বাচিত ছাত্রদের ডেটা টেবিল */}
          {selectedStudents.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-[#441a05] mb-4">
                নির্বাচিত ছাত্রদের তথ্য
              </h4>
              <div className="overflow-x-auto max-h-[30vh]">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        নাম
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ইউজার আইডি
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ফি প্রকার
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ওয়েভার পরিমাণ (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        শিক্ষাবর্ষ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ফান্ড
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        বর্ণনা
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {selectedStudents.map((studentId, index) => {
                      const student = students?.find((s) => s.id === studentId);
                      const waiver = studentWaivers[studentId] || {};
                      return (
                        <tr
                          key={studentId}
                          className="bg-white/5 animate-fadeIn"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {student?.name || `ছাত্র ${studentId}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {student?.user_id || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {waiver.fee_types
                              ?.map(
                                (id) =>
                                  feeTypeOptions.find((opt) => opt.value === id)?.label ||
                                  `ফি ${id}`
                              )
                              .join(", ") || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {waiver.waiver_amount || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {academicYearOptions.find(
                              (opt) => opt.value === waiver.academic_year
                            )?.label || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {fundOptions.find((opt) => opt.value === waiver.fund_id)?.label ||
                              "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {waiver.description || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* সাবমিট বোতাম */}
          {selectedStudents.length > 0 && (
            <button
              onClick={handleSubmitWaivers}
              disabled={isCreating}
              title="ওয়েভার তৈরি করুন"
              className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isCreating ? "cursor-not-allowed" : "hover:text-white hover:shadow-md"
              }`}
            >
              {isCreating ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>তৈরি হচ্ছে...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>ওয়েভার তৈরি করুন</span>
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* ওয়েভার সম্পাদনা ফর্ম */}
      {!isAdd && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <FaEdit className="text-3xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              ওয়েভার সম্পাদনা করুন
            </h3>
          </div>
          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl"
          >
            <Select
              options={
                students?.map((s) => ({
                  value: s.id,
                  label: `${s.name} - ${s.user_id}`,
                })) || []
              }
              value={
                students?.find((s) => s.id === editWaiverData.student_id)
                  ? {
                      value: editWaiverData.student_id,
                      label: `${
                        students.find((s) => s.id === editWaiverData.student_id).name
                      } - ${
                        students.find((s) => s.id === editWaiverData.student_id).user_id
                      }`,
                    }
                  : null
              }
              onChange={(selected) =>
                setEditWaiverData({
                  ...editWaiverData,
                  student_id: selected?.value || null,
                })
              }
              placeholder="ছাত্র নির্বাচন করুন"
              isLoading={isStudentLoading}
              styles={selectStyles}
              className="w-full"
              isDisabled={isUpdating}
            />
            <Select
              isMulti
              options={feeTypeOptions}
              value={feeTypeOptions.filter((option) =>
                editWaiverData.fee_types.includes(option.value)
              )}
              onChange={(selected) =>
                setEditWaiverData({
                  ...editWaiverData,
                  fee_types: selected.map((opt) => opt.value),
                })
              }
              placeholder="ফি প্রকার নির্বাচন করুন"
              isLoading={isFeeHeadsLoading}
              styles={selectStyles}
              className="w-full"
              isDisabled={isUpdating}
            />
            <input
              type="number"
              value={editWaiverData.waiver_amount}
              onChange={(e) => {
                if (e.target.value > 100) {
                  toast.error("ওয়েভার পরিমাণ ১০০% এর বেশি হতে পারবে না।");
                  return;
                }
                setEditWaiverData({
                  ...editWaiverData,
                  waiver_amount: e.target.value,
                });
              }}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
              placeholder="ওয়েভার পরিমাণ (%)"
              disabled={isUpdating}
              min="0"
              max="100"
              step="0.01"
            />
            <Select
              options={academicYearOptions}
              value={
                academicYearOptions.find(
                  (option) => option.value === editWaiverData.academic_year
                ) || null
              }
              onChange={(selected) =>
                setEditWaiverData({
                  ...editWaiverData,
                  academic_year: selected?.value || null,
                })
              }
              placeholder="শিক্ষাবর্ষ নির্বাচন করুন"
              isLoading={isAcademicYearLoading}
              styles={selectStyles}
              className="w-full"
              isDisabled={isUpdating}
            />
            <Select
              options={fundOptions}
              value={
                fundOptions.find((option) => option.value === editWaiverData.fund_id) || null
              }
              onChange={(selected) =>
                setEditWaiverData({
                  ...editWaiverData,
                  fund_id: selected?.value || null,
                })
              }
              placeholder="ফান্ড নির্বাচন করুন"
              isLoading={isFundsLoading}
              styles={selectStyles}
              className="w-full"
              isDisabled={isUpdating}
            />
            <input
              type="text"
              value={editWaiverData.description}
              onChange={(e) =>
                setEditWaiverData({
                  ...editWaiverData,
                  description: e.target.value,
                })
              }
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
              placeholder="বর্ণনা (যেমন, প্রয়োজন-ভিত্তিক সহায়তা)"
              disabled={isUpdating}
            />
            <button
              type="submit"
              disabled={isUpdating}
              title="ওয়েভার আপডেট করুন"
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
                <span>ওয়েভার আপডেট করুন</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditWaiverId(null);
                setEditWaiverData({
                  student_id: null,
                  waiver_amount: "",
                  academic_year: null,
                  description: "",
                  fee_types: [],
                  fund_id: null,
                });
                setIsAdd(true);
              }}
              title="সম্পাদনা বাতিল করুন"
              className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
            >
              বাতিল
            </button>
          </form>
        </div>
      )}

      {/* ওয়েভার তালিকা */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
          ওয়েভার তালিকা
        </h3>
        {isWaiverLoading ? (
          <p className="p-4 text-[#441a05]/70">ওয়েভার লোড হচ্ছে...</p>
        ) : waivers?.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">কোনো ওয়েভার পাওয়া যায়নি।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ছাত্র
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ওয়েভার পরিমাণ (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    শিক্ষাবর্ষ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ফি প্রকার
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ফান্ড
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    বর্ণনা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    তৈরির সময়
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    আপডেটের সময়
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {waivers?.map((waiver, index) => (
                  <tr
                    key={waiver.id}
                    className="bg-white/5 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {students?.find((s) => s.id === waiver.student_id)?.name ||
                        `ছাত্র ${waiver.student_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {waiver.waiver_amount}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {academicYears?.find((y) => y.id == waiver.academic_year)?.name ||
                        `বছর ${waiver.academic_year}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {waiver.fee_types
                        .map(
                          (id) =>
                            feeTypeOptions.find((opt) => opt.value === id)?.label || `ফি ${id}`
                        )
                        .join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {fundOptions.find((opt) => opt.value === waiver.fund_id)?.label ||
                        `ফান্ড ${waiver.fund_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {waiver.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                      {formatDate(waiver.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                      {formatDate(waiver.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(waiver)}
                        title="ওয়েভার সম্পাদনা করুন"
                        className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(waiver.id)}
                        title="ওয়েভার মুছুন"
                        className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddWaivers;