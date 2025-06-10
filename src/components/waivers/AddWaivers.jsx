import { useState } from "react";
import Select from "react-select";

import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useCreateWaiverMutation, useDeleteWaiverMutation, useGetWaiversQuery, useUpdateWaiverMutation } from "../../redux/features/api/waivers/waiversApi";
import { useGetStudentActiveApiQuery } from "../../redux/features/api/student/studentActiveApi";

const AddWaivers = () => {
  const [isAdd, setIsAdd] = useState(true);
  const [waiverData, setWaiverData] = useState({
    student_id: null,
    waiver_amount: "",
    academic_year: "",
    description: "",
    fee_types: [],
  });
  const [editWaiverId, setEditWaiverId] = useState(null);
  const [editWaiverData, setEditWaiverData] = useState({
    student_id: null,
    waiver_amount: "",
    academic_year: "",
    description: "",
    fee_types: [],
  });

  // API hooks
  const { data: waivers, isLoading: isWaiverLoading, error: waiverError } = useGetWaiversQuery();
  const { data: students, isLoading: isStudentLoading } = useGetStudentActiveApiQuery();
  const [createWaiver, { isLoading: isCreating, error: createError }] = useCreateWaiverMutation();
  const [updateWaiver, { isLoading: isUpdating, error: updateError }] = useUpdateWaiverMutation();
  const [deleteWaiver, { isLoading: isDeleting, error: deleteError }] = useDeleteWaiverMutation();

  // Handle form submission for adding a new waiver
  const handleSubmitWaiver = async (e) => {
    e.preventDefault();
    if (!waiverData.student_id || !waiverData.waiver_amount || !waiverData.academic_year || !waiverData.fee_types.length) {
      alert("Please fill all required fields: Student, Fee Types, Waiver Amount, and Academic Year");
      return;
    }

    try {
      const payload = {
        student_id: waiverData.student_id,
        waiver_amount: parseFloat(waiverData.waiver_amount),
        academic_year: parseInt(waiverData.academic_year),
        description: waiverData.description.trim() || null,
        fee_types: waiverData.fee_types,
        created_by: 1,
        updated_by: 1,
      };
      await createWaiver(payload).unwrap();
      alert("Waiver created successfully!");
      setWaiverData({ student_id: null, waiver_amount: "", academic_year: "", description: "", fee_types: [] });
    } catch (err) {
      console.error("Error creating waiver:", err);
      alert(`Failed to create waiver: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle edit button click
  const handleEditClick = (waiver) => {
    setEditWaiverId(waiver.id);
    setEditWaiverData({
      student_id: waiver.student_id,
      waiver_amount: waiver.waiver_amount.toString(),
      academic_year: waiver.academic_year.toString(),
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
        academic_year: parseInt(editWaiverData.academic_year),
        description: editWaiverData.description.trim() || null,
        fee_types: editWaiverData.fee_types,
        updated_by: 1,
      };
      await updateWaiver(payload).unwrap();
      alert("Waiver updated successfully!");
      setEditWaiverId(null);
      setEditWaiverData({ student_id: null, waiver_amount: "", academic_year: "", description: "", fee_types: [] });
      setIsAdd(true);
    } catch (err) {
      console.error("Error updating waiver:", err);
      alert(`Failed to update waiver: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
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
        alert(`Failed to delete waiver: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
      }
    }
  };

  // Prepare student options for react-select
  const studentOptions = students?.map((student) => ({
    value: student.id,
    label: student.name || `Student ${student.id}`,
  })) || [];

  // Fee types options (adjust based on your actual fee types)
  const feeTypeOptions = [
    { value: 1, label: "Tuition Fee" },
    { value: 2, label: "Lab Fee" },
  ];

  // Custom styles for react-select to match theme
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
    singleValue: (provided) => ({
      ...provided,
      color: "#441a05",
    }),
    multiValue: (provided) => ({
      ...provided,
      background: "#DB9E30",
      color: "#441a05",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#441a05",
    }),
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

  // Format dates for +06 timezone
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
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Add New Waiver</h3>
          </div>
          <form onSubmit={handleSubmitWaiver} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Select
              options={studentOptions}
              value={studentOptions.find((option) => option.value === waiverData.student_id) || null}
              onChange={(selected) => setWaiverData({ ...waiverData, student_id: selected?.value || null })}
              placeholder="Select Student"
              isLoading={isStudentLoading}
              styles={selectStyles}
              className="w-full"
              isDisabled={isCreating}
              aria-describedby={createError ? "waiver-error" : undefined}
            />
            <Select
              isMulti
              options={feeTypeOptions}
              value={feeTypeOptions.filter((option) => waiverData.fee_types.includes(option.value))}
              onChange={(selected) => setWaiverData({ ...waiverData, fee_types: selected.map((opt) => opt.value) })}
              placeholder="Select Fee Types"
              styles={selectStyles}
              className="w-full"
              isDisabled={isCreating}
            />
            <input
              type="number"
              value={waiverData.waiver_amount}
              onChange={(e) => setWaiverData({ ...waiverData, waiver_amount: e.target.value })}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Waiver Amount (e.g., 500)"
              disabled={isCreating}
              min="0"
              step="0.01"
            />
            <input
              type="number"
              value={waiverData.academic_year}
              onChange={(e) => setWaiverData({ ...waiverData, academic_year: e.target.value })}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Academic Year (e.g., 2023)"
              disabled={isCreating}
              min="2000"
            />
            <input
              type="text"
              value={waiverData.description}
              onChange={(e) => setWaiverData({ ...waiverData, description: e.target.value })}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Description (e.g., Need-based support)"
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="Create a new waiver"
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
                  <span>Create Waiver</span>
                </span>
              )}
            </button>
          </form>
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
              options={studentOptions}
              value={studentOptions.find((option) => option.value === editWaiverData.student_id) || null}
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
            <input
              type="number"
              value={editWaiverData.academic_year}
              onChange={(e) => setEditWaiverData({ ...editWaiverData, academic_year: e.target.value })}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
              placeholder="Academic Year (e.g., 2023)"
              disabled={isUpdating}
              min="2000"
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
                setEditWaiverData({ student_id: null, waiver_amount: "", academic_year: "", description: "", fee_types: [] });
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
                      {waiver.academic_year}
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