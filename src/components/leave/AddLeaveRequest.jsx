import React, { useState } from "react";
import { useGetLeaveApiQuery } from "../../redux/features/api/leave/leaveApi";
import {
  useGetLeaveRequestApiQuery,
  useCreateLeaveRequestApiMutation,
  useUpdateLeaveRequestApiMutation,
  useDeleteLeaveRequestApiMutation,
} from "../../redux/features/api/leave/leaveRequestApi";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";

const AddLeaveRequest = () => {
  const [isAdd, setIsAdd] = useState(true); // Toggle add/edit mode
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [editRequestId, setEditRequestId] = useState(null);
  const [editLeaveTypeId, setEditLeaveTypeId] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editReason, setEditReason] = useState("");

  // API hooks
  const {
    data: leaveTypes,
    isLoading: isLeaveLoading,
    error: leaveError,
  } = useGetLeaveApiQuery();
  const {
    data: leaveRequests,
    isLoading: isRequestLoading,
    error: requestError,
  } = useGetLeaveRequestApiQuery();
  const [createRequest, { isLoading: isCreating, error: createError }] =
    useCreateLeaveRequestApiMutation();
  const [updateRequest, { isLoading: isUpdating, error: updateError }] =
    useUpdateLeaveRequestApiMutation();
  const [deleteRequest, { isLoading: isDeleting, error: deleteError }] =
    useDeleteLeaveRequestApiMutation();
  console.log(leaveTypes);
  // Filter active leave types
  const activeLeaveTypes = leaveTypes?.filter((lt) => lt.is_active) || [];

  // Handle form submission for new leave request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!leaveTypeId || !startDate || !endDate || !reason.trim()) {
      alert("Please fill in all fields");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      alert("Start date cannot be in the past");
      return;
    }
    if (end < start) {
      alert("End date must be after start date");
      return;
    }

    try {
      const payload = {
        student_id: 1, // Placeholder; replace with actual student ID
        leave_type_id: Number(leaveTypeId),
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim(),
        status: "Pending",
      };
      await createRequest(payload).unwrap();
      alert("Leave request submitted successfully!");
      setLeaveTypeId("");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (err) {
      console.error("Error creating leave request:", err);
      alert(
        `Failed to create leave request: ${
          err.status || "Unknown error"
        } - ${JSON.stringify(err.data || {})}`
      );
    }
  };

  // Handle edit button click
  const handleEditClick = (request) => {
    if (request.status !== "Pending") {
      alert("Only pending requests can be edited");
      return;
    }
    setEditRequestId(request.id);
    setEditLeaveTypeId(request.leave_type_id.toString());
    setEditStartDate(request.start_date);
    setEditEndDate(request.end_date);
    setEditReason(request.reason);
    setIsAdd(false);
  };

  // Handle update leave request
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (
      !editLeaveTypeId ||
      !editStartDate ||
      !editEndDate ||
      !editReason.trim()
    ) {
      alert("Please fill in all fields");
      return;
    }
    const start = new Date(editStartDate);
    const end = new Date(editEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      alert("Start date cannot be in the past");
      return;
    }
    if (end < start) {
      alert("End date must be after start date");
      return;
    }

    try {
      const payload = {
        id: editRequestId,
        student_id: 1, // Placeholder; replace with actual student ID
        leave_type_id: Number(editLeaveTypeId),
        start_date: editStartDate,
        end_date: editEndDate,
        reason: editReason.trim(),
        status: "Pending",
      };
      await updateRequest(payload).unwrap();
      alert("Leave request updated successfully!");
      setEditRequestId(null);
      setEditLeaveTypeId("");
      setEditStartDate("");
      setEditEndDate("");
      setEditReason("");
      setIsAdd(true);
    } catch (err) {
      console.error("Error updating leave request:", err);
      alert(
        `Failed to update leave request: ${
          err.status || "Unknown error"
        } - ${JSON.stringify(err.data || {})}`
      );
    }
  };

  // Handle delete leave request
  const handleDelete = async (id, status) => {
    if (status !== "Pending") {
      alert("Only pending requests can be deleted");
      return;
    }
    if (window.confirm("Are you sure you want to delete this leave request?")) {
      try {
        await deleteRequest(id).unwrap();
        alert("Leave request deleted successfully!");
      } catch (err) {
        console.error("Error deleting leave request:", err);
        alert(
          `Failed to delete leave request: ${
            err.status || "Unknown error"
          } - ${JSON.stringify(err.data || {})}`
        );
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
        {/* Add Leave Request Form */}
        {isAdd && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
                Apply for Leave
              </h3>
            </div>
            <form
              onSubmit={handleSubmitRequest}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl"
            >
              <select
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isCreating || isLeaveLoading}
                aria-describedby={createError ? "request-error" : undefined}
              >
                <option value="">Select Leave Type</option>
                {leaveTypes?.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt?.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isCreating}
                  aria-describedby={createError ? "request-error" : undefined}
                />
                <label htmlFor="">To</label>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isCreating}
                  aria-describedby={createError ? "request-error" : undefined}
                />
                <label htmlFor="">From</label>
              </div>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 md:col-span-2"
                placeholder="Enter reason for leave"
                rows={4}
                disabled={isCreating}
                aria-describedby={createError ? "request-error" : undefined}
              />
              <button
                type="submit"
                disabled={isCreating}
                title="Submit leave request"
                className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn md:col-span-2 ${
                  isCreating
                    ? "cursor-not-allowed"
                    : "hover:text-white hover:shadow-md"
                }`}
              >
                {isCreating ? (
                  <span className="flex items-center space-x-3">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Submitting...</span>
                  </span>
                ) : (
                  <span>Submit Leave Request</span>
                )}
              </button>
            </form>
            {createError && (
              <div
                id="request-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                Error: {createError.status || "Unknown"} -{" "}
                {JSON.stringify(createError.data || {})}
              </div>
            )}
            {leaveError && (
              <div
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                Error loading leave types: {leaveError.status || "Unknown"} -{" "}
                {JSON.stringify(leaveError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Edit Leave Request Form */}
        {!isAdd && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
                Edit Leave Request
              </h3>
            </div>
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl"
            >
              <select
                value={editLeaveTypeId}
                onChange={(e) => setEditLeaveTypeId(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isUpdating || isLeaveLoading}
                aria-describedby={
                  updateError ? "edit-request-error" : undefined
                }
              >
                <option value="">Select Leave Type</option>
                {activeLeaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isUpdating}
                aria-describedby={
                  updateError ? "edit-request-error" : undefined
                }
              />
              <input
                type="date"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isUpdating}
                aria-describedby={
                  updateError ? "edit-request-error" : undefined
                }
              />
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 md:col-span-2"
                placeholder="Edit reason for leave"
                rows={4}
                disabled={isUpdating}
                aria-describedby={
                  updateError ? "edit-request-error" : undefined
                }
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="Update leave request"
                className={`relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isUpdating
                    ? "cursor-not-allowed"
                    : "hover:text-white hover:shadow-md"
                }`}
              >
                {isUpdating ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Updating...</span>
                  </span>
                ) : (
                  <span>Update Leave Request</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditRequestId(null);
                  setEditLeaveTypeId("");
                  setEditStartDate("");
                  setEditEndDate("");
                  setEditReason("");
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
                id="edit-request-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                Error: {updateError.status || "Unknown"} -{" "}
                {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Leave Requests Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
            Your Leave Requests
          </h3>
          {isRequestLoading ? (
            <p className="p-4 text-[#441a05]/70">Loading leave requests...</p>
          ) : requestError ? (
            <p className="p-4 text-red-400">
              Error loading leave requests: {requestError.status || "Unknown"} -{" "}
              {JSON.stringify(requestError.data || {})}
            </p>
          ) : leaveRequests?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">No leave requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {leaveRequests?.map((request, index) => {
                    const leaveType =
                      leaveTypes?.find((lt) => lt.id === request.leave_type_id)
                        ?.name || "Unknown";
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
                          {new Date(request.start_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {new Date(request.end_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#441a05] max-w-xs truncate">
                          {request.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              request.status === "Approved"
                                ? "bg-green-500/20 text-green-400"
                                : request.status === "Rejected"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                          {new Date(request.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(request)}
                            title="Edit leave request"
                            className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                            disabled={request.status !== "Pending"}
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(request.id, request.status)
                            }
                            title="Delete leave request"
                            className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                            disabled={request.status !== "Pending"}
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
          {(isDeleting || deleteError) && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              {isDeleting
                ? "Deleting leave request..."
                : `Error deleting leave request: ${
                    deleteError?.status || "Unknown"
                  } - ${JSON.stringify(deleteError?.data || {})}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLeaveRequest;
