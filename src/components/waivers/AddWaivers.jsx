import React, { useState, useMemo } from "react";
import Select from "react-select";

import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetStudentActiveApiQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetFeeHeadsQuery } from "../../redux/features/api/fee-heads/feeHeadsApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useCreateWaiverMutation, useDeleteWaiverMutation, useGetWaiversQuery, useUpdateWaiverMutation } from "../../redux/features/api/waivers/waiversApi";

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
  });

  // API hooks
  const { data: classes, isLoading: isClassLoading } = useGetclassConfigApiQuery();
  const { data: students, isLoading: isStudentLoading } = useGetStudentActiveApiQuery();
  const { data: feeHeads, isLoading: isFeeHeadsLoading } = useGetFeeHeadsQuery();
  const { data: academicYears, isLoading: isAcademicYearLoading } = useGetAcademicYearApiQuery();
  const { data: waivers, isLoading: isWaiverLoading, error: waiverError } = useGetWaiversQuery();
  const [createWaiver, { isLoading: isCreating, error: createError }] = useCreateWaiverMutation();
  const [updateWaiver, { isLoading: isUpdating, error: updateError }] = useUpdateWaiverMutation();
  const [deleteWaiver, { isLoading: isDeleting, error: deleteError }] = useDeleteWaiverMutation();

  // Get current +06 time as ISO string
  const getCurrentTimeISO = () => {
    const date = new Date();
    const offset = 6 * 60; // +06:00 in minutes
    const localTime = new Date(date.getTime() + offset * 60 * 1000);
    return localTime.toISOString().replace("Z", "+06:00");
  };

  // Prepare class options
  const classOptions = classes?.map((cls) => ({
    value: cls.id,
    label: `${cls.class_name}-${cls.section_name}-${cls.shift_name}`,
  })) || [];

  // Filter students by selected class and search query
  const filteredStudents = useMemo(() => {
    if (!students || !selectedClassId) return [];
    return students.filter(
      (student) =>
        student.class_id === selectedClassId &&
        (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.user_id.toString().includes(searchQuery))
    );
  }, [students, selectedClassId, searchQuery]);

  // Prepare options for react-select
  const feeTypeOptions = feeHeads?.map((fee) => ({
    value: fee.id,
    label: fee.name || `Fee ${fee.id}`,
  })) || [];

  const academicYearOptions = academicYears?.map((year) => ({
    value: year.id,
    label: year.year || year.name || `Year ${year.id}`,
  })) || [];

  // Handle student checkbox toggle
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
          },
        }));
        return [...prev, studentId];
      }
    });
  };

  // Handle waiver data change for a student
  const handleWaiverChange = (studentId, field, value) => {
    setStudentWaivers((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // Handle form submission for adding waivers
  const handleSubmitWaivers = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    const errors = [];
    const payloads = selectedStudents.map((studentId) => {
      const waiver = studentWaivers[studentId];
      if (!waiver.waiver_amount || !waiver.academic_year || !waiver.fee_types.length) {
        errors.push(`Missing required fields for student ID ${studentId}.`);
        return null;
      }
      return {
        student_id: waiver.student_id,
        waiver_amount: parseFloat(waiver.waiver_amount),
        academic_year: waiver.academic_year,
        description: waiver.description.trim() || null,
        fee_types: waiver.fee_types,
        created_by: '',
        updated_by: '',
        // created_at: getCurrentTimeISO(),
        // updated_at: getCurrentTimeISO(),
      };
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    try {
      const validPayloads = payloads.filter((p) => p !== null);
      await Promise.all(validPayloads.map((payload) => createWaiver(payload).unwrap()));
      alert("Waivers created successfully!");
      setSelectedStudents([]);
      setStudentWaivers({});
      setSelectedClassId(null);
      setSearchQuery("");
    } catch (err) {
      console.error("Error creating waivers:", err);
      alert(`Failed to create waivers: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle edit button click
  const handleEditClick = (waiver) => {
    setEditWaiverId(waiver.id);
    setEditWaiverData({
      student_id: waiver.student_id,
      waiver_amount: waiver.waiver_amount.toString(),
      academic_year: waiver.academic_year,
      description: waiver.description || "",
      fee_types: waiver.fee_types || [],
    });
    setIsAdd(false);
  };

  // Handle update waiver
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editWaiverData.student_id || !editWaiverData.waiver_amount || !editWaiverData.academic_year || !editWaiverData.fee_types.length) {
      alert("Please fill all required fields: Student, Fee Types, Waiver Amount, and Academic Year");
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
        updated_by: '',
        // updated_at: getCurrentTimeISO(),
      };
      await updateWaiver(payload).unwrap();
      alert("Waiver updated successfully!");
      setEditWaiverId(null);
      setEditWaiverData({ student_id: null, waiver_amount: "", academic_year: null, description: "", fee_types: [] });
      setIsAdd(true);
    } catch (err) {
      console.error("Error updating waiver:", err);
      alert(`Failed to update waiver: ${err.status || "Error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle delete waiver
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this waiver?")) {
      try {
        await deleteWaiver(id).unwrap();
        alert("Waiver deleted successfully!");
      } catch (err) {
        console.error("Error deleting waiver:", err);
        alert(`Failed to delete waiver: ${err.status || "Error"} - ${JSON.stringify(err.data || {})}`);
      }
    }
  };

  // Custom styles for react-select
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      background: "transparent",
      borderColor: "#9d9087",
      color: "#441a05",
      padding: "0.5rem",
      borderRadius: "0.5rem",
      "&:hover": { borderColor: "#441a05" },
    }),
    singleValue: (provided) => ({ ...provided, color: "#441a05" }),
    multiValue: (provided) => ({
      ...provided,
      background: "#DB9E30",
      color: "#441a05",
    }),
    multiValueLabel: (provided) => ({ ...provided, color: "#441a05" }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#441a05",
      "&:hover": { background: "#441a05", color: "#DB9E30" },
    }),
    menu: (provided) => ({
      ...provided,
      background: "rgba(0, 0, 0, 0.8)",
      color: "#441a05",
    }),
    option: (provided, state) => ({
      ...provided,
      background: state.isSelected ? "#DB9E30" : "transparent",
      color: state.isSelected ? "#441a05" : "#441a05",
      "&:hover": { background: "#DB9E30", color: "#441a05" },
    }),
  };

  // Format dates for +06 display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
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
        `}
      </style>

      {/* Add Waiver Form */}
      {isAdd && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Add New Waivers</h3>
          </div>

          {/* Class Selection and Search */}
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
              placeholder="Select Class"
              isLoading={isClassLoading}
              styles={selectStyles}
              className="w-full"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Search by Name or User ID"
              disabled={isStudentLoading || !selectedClassId}
            />
          </div>

          {/* Student Selection Table */}
          {selectedClassId && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-[#441a05] mb-4">Select Students</h4>
              {isStudentLoading ? (
                <p className="text-[#441a05]/70">Loading students...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-[#441a05]/70">No students found.</p>
              ) : (
                <div className="overflow-x-auto max-h-[30vh]">
                  <table className="min-w-full divide-y divide-white/20">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          Select
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          User ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20">
                      {filteredStudents.map((student, index) => (
                        <tr
                          key={student.id}
                          className="bg-white/5 animate-fadeIn"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleStudentToggle(student.id)}
                              className="h-4 w-4 text-[#DB9E30] border-[#9d9087] rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {student.user_id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Waiver Forms for Selected Students */}
          {selectedStudents.length > 0 && (
            <form onSubmit={handleSubmitWaivers} className="space-y-6">
              {selectedStudents.map((studentId) => {
                const student = students.find((s) => s.id === studentId);
                const waiver = studentWaivers[studentId];
                return (
                  <div
                    key={studentId}
                    className="bg-white/5 p-6 rounded-lg animate-fadeIn"
                    style={{ animationDelay: `${selectedStudents.indexOf(studentId) * 0.1}s` }}
                  >
                    <h5 className="text-md font-semibold text-[#441a05] mb-4">
                      Waiver for {student?.name} (ID: {student?.user_id})
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        isMulti
                        options={feeTypeOptions}
                        value={feeTypeOptions.filter((option) => waiver.fee_types.includes(option.value))}
                        onChange={(selected) =>
                          handleWaiverChange(studentId, "fee_types", selected.map((opt) => opt.value))
                        }
                        placeholder="Select Fee Types"
                        isLoading={isFeeHeadsLoading}
                        styles={selectStyles}
                        className="w-full"
                        isDisabled={isCreating}
                      />
                      <input
                        type="number"
                        value={waiver.waiver_amount}
                        onChange={(e) => handleWaiverChange(studentId, "waiver_amount", e.target.value)}
                        className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                        placeholder="Waiver Amount (e.g., 500)"
                        disabled={isCreating}
                        min="0"
                        step="0.01"
                      />
                      <Select
                        options={academicYearOptions}
                        value={academicYearOptions.find((option) => option.value === waiver.academic_year) || null}
                        onChange={(selected) => handleWaiverChange(studentId, "academic_year", selected?.value || null)}
                        placeholder="Select Academic Year"
                        isLoading={isAcademicYearLoading}
                        styles={selectStyles}
                        className="w-full"
                        isDisabled={isCreating}
                      />
                      <input
                        type="text"
                        value={waiver.description}
                        onChange={(e) => handleWaiverChange(studentId, "description", e.target.value)}
                        className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                        placeholder="Description (e.g., Need-based support)"
                        disabled={isCreating}
                      />
                    </div>
                  </div>
                );
              })}
              <button
                type="submit"
                disabled={isCreating}
                title="Create waivers"
                className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isCreating ? "cursor-not-allowed" : "hover:text-white hover:shadow-md"
                }`}
              >
                {isCreating ? (
                  <span className="flex items-center space-x-3">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Creating...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <IoAdd className="w-5 h-5" />
                    <span>Create Waivers</span>
                  </span>
                )}
              </button>
            </form>
          )}
          {createError && (
            <div
              id="waiver-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              Error: {createError.status || "Unknown"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>
      )}

      {/* Edit Waiver Form */}
      {!isAdd && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <FaEdit className="text-3xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Edit Waiver</h3>
          </div>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
            <Select
              options={students?.map((s) => ({ value: s.id, label: `${s.name} - ${s.user_id}` })) || []}
              value={
                students?.find((s) => s.id === editWaiverData.student_id)
                  ? { value: editWaiverData.student_id, label: `${students.find((s) => s.id === editWaiverData.student_id).name} - ${students.find((s) => s.id === editWaiverData.student_id).user_id}` }
                  : null
              }
              onChange={(selected) => setEditWaiverData({ ...editWaiverData, student_id: selected?.value || null })}
              placeholder="Select Student"
              isLoading={isStudentLoading}
              styles={selectStyles}
              className="w-full"
              isDisabled={isUpdating}
              aria-describedby="edit-waiver-error"
            />
            <Select
              isMulti
              options={feeTypeOptions}
              value={feeTypeOptions.filter((option) => editWaiverData.fee_types.includes(option.value))}
              onChange={(selected) => setEditWaiverData({ ...editWaiverData, fee_types: selected.map((opt) => opt.value) })}
              placeholder="Select Fee Types"
              isLoading={isFeeHeadsLoading}
              styles={selectStyles}
              className="w-full"
              isDisabled={isUpdating}
            />
            <input
              type="number"
              value={editWaiverData.waiver_amount}
              onChange={(e) => setEditWaiverData({ ...editWaiverData, waiver_amount: e.target.value })}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
              placeholder="Waiver Amount (e.g., 500)"
              disabled={isUpdating}
              min="0"
              step="0.01"
            />
            <Select
              options={academicYearOptions}
              value={academicYearOptions.find((option) => option.value === editWaiverData.academic_year) || null}
              onChange={(selected) => setEditWaiverData({ ...editWaiverData, academic_year: selected?.value || null })}
              placeholder="Select Academic Year"
              isLoading={isAcademicYearLoading}
              styles={selectStyles}
              className="w-full"
              isDisabled={isUpdating}
            />
            <input
              type="text"
              value={editWaiverData.description}
              onChange={(e) => setEditWaiverData({ ...editWaiverData, description: e.target.value })}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
              placeholder="Description (e.g., Need-based support)"
              disabled={isUpdating}
            />
            <button
              type="submit"
              disabled={isUpdating}
              title="Update waiver"
              className={`relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isUpdating ? "cursor-not-allowed" : "hover:text-white hover:shadow-md"
              }`}
            >
              {isUpdating ? (
                <span className="flex items-center space-x-2">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Updating...</span>
                </span>
              ) : (
                <span>Update Waiver</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditWaiverId(null);
                setEditWaiverData({ student_id: null, waiver_amount: "", academic_year: null, description: "", fee_types: [] });
                setIsAdd(true);
              }}
              title="Cancel editing"
              className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
            >
              Cancel
            </button>
          </form>
          {updateError && (
            <div
              id="edit-waiver-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              Error: {updateError.status || "Unknown"} - {JSON.stringify(updateError.data || {})}
            </div>
          )}
        </div>
      )}

      {/* Waivers Table */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Waivers List</h3>
        {isWaiverLoading ? (
          <p className="p-4 text-[#441a05]/70">Loading waivers...</p>
        ) : waiverError ? (
          <p className="p-4 text-red-400">
            Error loading waivers: {waiverError.status || "Unknown"} - {JSON.stringify(waiverError.data || {})}
          </p>
        ) : waivers?.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">No waivers available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    Waiver Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    Fee Types
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    Updated At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    Actions
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
                      {students?.find((s) => s.id === waiver.student_id)?.name || `Student ${waiver.student_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {waiver.waiver_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {academicYears?.find((y) => y.id === waiver.academic_year)?.year || `Year ${waiver.academic_year}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {waiver.fee_types
                        .map((id) => feeTypeOptions.find((opt) => opt.value === id)?.label || `Fee ${id}`)
                        .join(", ")}
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
                        title="Edit waiver"
                        className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(waiver.id)}
                        title="Delete waiver"
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
        {(isDeleting || deleteError) && (
          <div
            className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            {isDeleting
              ? "Deleting waiver..."
              : `Error deleting waiver: ${deleteError?.status || "Unknown"} - ${JSON.stringify(
                  deleteError?.data || {}
                )}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddWaivers;