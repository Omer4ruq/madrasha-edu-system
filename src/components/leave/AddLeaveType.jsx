import React, { useState } from "react";
import {
  useGetLeaveApiQuery,
  useCreateLeaveApiMutation,
  useUpdateLeaveApiMutation,
  useDeleteLeaveApiMutation,
} from "../../redux/features/api/leave/leaveApi";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";

const AddLeaveType = () => {
  const [leaveName, setLeaveName] = useState("");
  const [editLeaveId, setEditLeaveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Added for forced re-rendering

  // API hooks
  const {
    data: leaveTypes,
    isLoading: isLeaveLoading,
    error: leaveError,
    refetch,
  } = useGetLeaveApiQuery();
  const [createLeave, { isLoading: isCreating, error: createError }] = useCreateLeaveApiMutation();
  const [updateLeave, { isLoading: isUpdating, error: updateError }] = useUpdateLeaveApiMutation();
  const [deleteLeave, { isLoading: isDeleting, error: deleteError }] = useDeleteLeaveApiMutation();
console.log("leave", leaveTypes)
  // Validate leave name
  const validateLeaveName = (name) => {
    const regex = /^[a-zA-Z0-9\s\-_,()]{1,50}$/;
    return regex.test(name);
  };

  // Handle form submission for adding or updating leave type
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = editLeaveId ? leaveName.trim() : leaveName.trim();
    if (!name) {
      toast.error("অনুগ্রহ করে ছুটির ধরনের নাম লিখুন");
      return;
    }
    if (!validateLeaveName(name)) {
      toast.error("নাম ৫০ অক্ষরের মধ্যে এবং বৈধ অক্ষর ধারণ করবে");
      return;
    }
    if (leaveTypes?.some((lt) => lt.name.toLowerCase() === name.toLowerCase() && lt.id !== editLeaveId)) {
      toast.error("এই ছুটির ধরন ইতিমধ্যে বিদ্যমান!");
      return;
    }

    setModalAction(editLeaveId ? "update" : "create");
    setModalData({
      id: editLeaveId,
      name: name,
      is_active: editLeaveId ? leaveTypes.find((lt) => lt.id === editLeaveId)?.is_active || true : true,
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (leave) => {
    setEditLeaveId(leave.id);
    setLeaveName(leave.name);
  };

  // Handle toggle active status
  const handleToggleActive = (leave) => {
    setModalAction("toggle");
    setModalData({
      id: leave.id,
      name: leave.name,
      is_active: !leave.is_active,
    });
    setIsModalOpen(true);
  };

  // Handle delete leave type
  const handleDelete = (id) => {
    setModalAction("delete");
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        await createLeave({ name: modalData.name, is_active: modalData.is_active }).unwrap();
        toast.success("ছুটির ধরন সফলভাবে তৈরি করা হয়েছে!");
        setLeaveName("");
      } else if (modalAction === "update") {
        await updateLeave(modalData).unwrap();
        toast.success("ছুটির ধরন সফলভাবে আপডেট করা হয়েছে!");
        setEditLeaveId(null);
        setLeaveName("");
      } else if (modalAction === "delete") {
        await deleteLeave(modalData.id).unwrap();
        toast.success("ছুটির ধরন সফলভাবে মুছে ফেলা হয়েছে!");
      } else if (modalAction === "toggle") {
        console.log("Toggling leave:", modalData); // Debug log
        await updateLeave(modalData).unwrap();
        toast.success(`ছুটির ধরন ${modalData.name} এখন ${modalData.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}!`);
      }
      refetch();
      console.log("Refetched leave types"); // Debug log
      setRefreshKey((prev) => prev + 1); // Force table re-render
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === "create" ? "তৈরি করা" : modalAction === "update" ? "আপডেট" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"}:`, err);
      toast.error(`ছুটির ধরন ${modalAction === "create" ? "তৈরি" : modalAction === "update" ? "আপডেট" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"} ব্যর্থ: ${err.status || "অজানা"} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

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
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.4); /* Match #DB9E30 */
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

      <div>
        {/* Add/Edit Leave Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            {editLeaveId ? (
              <FaEdit className="text-3xl text-[#441a05]" />
            ) : (
              <IoAddCircle className="text-4xl text-[#441a05]" />
            )}
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              {editLeaveId ? "ছুটির ধরন সম্পাদনা করুন" : "নতুন ছুটির ধরন যোগ করুন"}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              id="leaveName"
              value={leaveName}
              onChange={(e) => setLeaveName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="ছুটির ধরন লিখুন (যেমন, অসুস্থতার ছুটি)"
              disabled={isCreating || isUpdating}
              aria-label="ছুটির ধরন"
              title="ছুটির ধরন লিখুন (উদাহরণ: অসুস্থতার ছুটি) / Enter leave type (e.g., Sick Leave)"
              aria-describedby={createError || updateError ? "leave-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              title={editLeaveId ? "ছুটির ধরন আপডেট করুন / Update leave type" : "নতুন ছুটির ধরন তৈরি করুন / Create a new leave type"}
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isCreating || isUpdating ? "cursor-not-allowed" : "hover:text-white hover:shadow-md"
              }`}
            >
              {(isCreating || isUpdating) ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>{editLeaveId ? "আপডেট করা হচ্ছে..." : "তৈরি করা হচ্ছে..."}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd class Ponta = "w-5 h-5" />
                  <span>{editLeaveId ? "ছুটি আপডেট করুন" : "ছুটি তৈরি করুন"}</span>
                </span>
              )}
            </button>
            {editLeaveId && (
              <button
                type="button"
                onClick={() => {
                  setEditLeaveId(null);
                  setLeaveName("");
                }}
                title="সম্পাদনা বাতিল করুন / Cancel editing"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            )}
          </form>
          {(createError || updateError) && (
            <div
              id="leave-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              ত্রুটি: {(createError || updateError).status || "অজানা"} - {JSON.stringify((createError || updateError).data || {})}
            </div>
          )}
        </div>

        {/* Leave Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">ছুটির ধরনের তালিকা</h3>
          {isLeaveLoading ? (
            <p className="p-4 text-[#441a05]/70">ছুটির ধরন লোড হচ্ছে...</p>
          ) : leaveError ? (
            <p className="p-4 text-red-400">
              ছুটির ধরন লোড করতে ত্রুটি: {leaveError.status || "অজানা"} - {JSON.stringify(leaveError.data || {})}
            </p>
          ) : leaveTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো ছুটির ধরন উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto" key={refreshKey}>
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ছুটির ধরন
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      সক্রিয়
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      তৈরির সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আপডেটের সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রিয়াকলাপ
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
                      {/* <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={leave.is_active}
                            onChange={() => handleToggleActive(leave)}
                            className="hidden"
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${
                              leave.is_active
                                ? "bg-[#DB9E30] border-[#DB9E30] tick-glow"
                                : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                            }`}
                          >
                            {leave.is_active && (
                              <svg
                                className="w-4 h-4 text-[#441a05]"
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
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(leave.created_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(leave.updated_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(leave)}
                          title="ছুটির ধরন সম্পাদনা করুন / Edit leave type"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(leave.id)}
                          title="ছুটির ধরন মুছুন / Delete leave type"
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
              className="mt-4 text-red-500 bg-red-400/10 p-3 rounded-lg animate-fadeIn"
            >
              {isDeleting
                ? "ছুটির ধরন মুছে ফেলা হচ্ছে..."
                : `ছুটির ধরন মুছে ফেলতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})}`}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border-t border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === "create" && "নতুন ছুটির ধরন নিশ্চিত করুন"}
                {modalAction === "update" && "ছুটির ধরন আপডেট নিশ্চিত করুন"}
                {modalAction === "delete" && "ছুটির ধরন মুছে ফেলা নিশ্চিত করুন"}
                {modalAction === "toggle" && "ছুটির ধরনের স্থিতি পরিবর্তন নিশ্চিত করুন"}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === "create" && "আপনি কি নিশ্চিত যে নতুন ছুটির ধরন তৈরি করতে চান?"}
                {modalAction === "update" && "আপনি কি নিশ্চিত যে ছুটির ধরন আপডেট করতে চান?"}
                {modalAction === "delete" && "আপনি কি নিশ্চিত যে এই ছুটির ধরনটি মুছে ফেলতে চান?"}
                {modalAction === "toggle" && `আপনি কি নিশ্চিত যে ছুটির ধরনটি ${modalData?.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"} করতে চান?`}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন / Cancel"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন / Confirm"
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
};

export default AddLeaveType;