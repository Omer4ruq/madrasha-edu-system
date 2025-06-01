import React, { useState } from "react";
import {
  useGetLeaveApiQuery,
  useCreateLeaveApiMutation,
  useUpdateLeaveApiMutation,
  useDeleteLeaveApiMutation,
} from "../../redux/features/api/leave/leaveApi";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";

const AddLeaveType = () => {
  const [isAdd, setIsAdd] = useState(true); // Added state for toggle
  const [leaveName, setLeaveName] = useState("");
  const [editLeaveId, setEditLeaveId] = useState(null);
  const [editLeaveName, setEditLeaveName] = useState("");

  // API hooks
  const {
    data: leaveTypes,
    isLoading: isLeaveLoading,
    error: leaveError,
  } = useGetLeaveApiQuery();
  const [createLeave, { isLoading: isCreating, error: createError }] = useCreateLeaveApiMutation();
  const [updateLeave, { isLoading: isUpdating, error: updateError }] = useUpdateLeaveApiMutation();
  const [deleteLeave, { isLoading: isDeleting, error: deleteError }] = useDeleteLeaveApiMutation();

  // Handle form submission for adding new leave type
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!leaveName.trim()) {
      alert("Please enter a leave type name");
      return;
    }
    if (leaveTypes?.some((lt) => lt.name.toLowerCase() === leaveName.toLowerCase())) {
      alert("This leave type already exists!");
      return;
    }

    try {
      const payload = {
        name: leaveName.trim(),
        is_active: true,
      };
      await createLeave(payload).unwrap();
      alert("Leave type created successfully!");
      setLeaveName("");
    } catch (err) {
      console.error("Error creating leave type:", err);
      alert(`Failed to create leave type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle edit button click
  const handleEditClick = (leave) => {
    setEditLeaveId(leave.id);
    setEditLeaveName(leave.name);
    setIsAdd(false); // Switch to edit mode
  };

  // Handle update leave type
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editLeaveName.trim()) {
      alert("Please enter a leave type name");
      return;
    }

    try {
      const payload = {
        id: editLeaveId,
        name: editLeaveName.trim(),
        is_active: leaveTypes.find((lt) => lt.id === editLeaveId)?.is_active || true,
      };
      await updateLeave(payload).unwrap();
      alert("Leave type updated successfully!");
      setEditLeaveId(null);
      setEditLeaveName("");
      setIsAdd(true); // Switch back to add mode
    } catch (err) {
      console.error("Error updating leave type:", err);
      alert(`Failed to update leave type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (leave) => {
    try {
      const payload = {
        id: leave.id,
        name: leave.name,
        is_active: !leave.is_active,
      };
      await updateLeave(payload).unwrap();
      alert(`Leave type ${leave.name} is now ${!leave.is_active ? "active" : "inactive"}!`);
    } catch (err) {
      console.error("Error toggling leave type active status:", err);
      alert(`Failed to toggle active status: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle delete leave type
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this leave type?")) {
      try {
        await deleteLeave(id).unwrap();
        alert("Leave type deleted successfully!");
      } catch (err) {
        console.error("Error deleting leave type:", err);
        alert(`Failed to delete leave type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
      }
    }
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

      <div className="">
        <div className="flex items-center space-x-4 mb-10 animate-fadeIn">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h2 className="text-3xl font-bold text-[#441a05] tracking-tight">Add Leave Type</h2>
        </div>

        {/* Toggle Buttons */}
        <div className="flex space-x-4 mb-6 animate-fadeIn">
          <button
            onClick={() => setIsAdd(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isAdd ? "bg-[#DB9E30] text-[#441a05]" : "bg-gray-500 text-white"
            }`}
          >
            Add New Leave Type
          </button>
          <button
            onClick={() => setIsAdd(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              !isAdd ? "bg-[#DB9E30] text-[#441a05]" : "bg-gray-500 text-white"
            }`}
          >
            Edit Leave Type
          </button>
        </div>

        {/* Add Leave Form */}
        {isAdd && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Add New Leave Type</h3>
            </div>
            <form onSubmit={handleSubmitLeave} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <input
                type="text"
                id="leaveName"
                value={leaveName}
                onChange={(e) => setLeaveName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="Enter leave type (e.g., Sick Leave)"
                disabled={isCreating}
                aria-describedby={createError ? "leave-error" : undefined}
              />
              <button
                type="submit"
                disabled={isCreating}
                title="Create a new leave type"
                className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
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
                    <span>Create Leave Type</span>
                  </span>
                )}
              </button>
            </form>
            {createError && (
              <div
                id="leave-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                Error: {createError.status || "Unknown"} - {JSON.stringify(createError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Edit Leave Form */}
        {!isAdd && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Edit Leave Type</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editLeaveName"
                value={editLeaveName}
                onChange={(e) => setEditLeaveName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="Edit leave type (e.g., Sick Leave)"
                disabled={isUpdating}
                aria-label="Edit Leave Type"
                aria-describedby="edit-leave-error"
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="Update leave type"
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
                  <span>Update Leave Type</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditLeaveId(null);
                  setEditLeaveName("");
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
                id="edit-leave-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                Error: {updateError.status || "Unknown"} - {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Leave Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Leave Types List</h3>
          {isLeaveLoading ? (
            <p className="p-4 text-[#441a05]/70">Loading leave types...</p>
          ) : leaveError ? (
            <p className="p-4 text-red-400">
              Error loading leave types: {leaveError.status || "Unknown"} -{" "}
              {JSON.stringify(leaveError.data || {})}
            </p>
          ) : leaveTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">No leave types available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Active
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
                  {leaveTypes?.map((leave, index) => (
                    <tr
                      key={leave.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {leave.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={leave.is_active}
                            onChange={() => handleToggleActive(leave)}
                            className="hidden"
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                              leave.is_active
                                ? "bg-[#DB9E30] border-[#DB9E30]"
                                : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                            }`}
                          >
                            {leave.is_active && (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(leave.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(leave.updated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(leave)}
                          title="Edit leave type"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(leave.id)}
                          title="Delete leave type"
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
                ? "Deleting leave type..."
                : `Error deleting leave type: ${deleteError?.status || "Unknown"} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLeaveType;