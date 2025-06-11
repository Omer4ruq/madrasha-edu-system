import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import {
  useCreateExamApiMutation,
  useDeleteExamApiMutation,
  useGetExamApiQuery,
  useUpdateExamApiMutation,
} from "../../../redux/features/api/exam/examApi";

const AddExamType = () => {
  const [examName, setExamName] = useState("");
  const [editExamId, setEditExamId] = useState(null);
  const [editExamName, setEditExamName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks
  const {
    data: examTypes,
    isLoading: isExamLoading,
    error: examError,
  } = useGetExamApiQuery();
  const [createExam, { isLoading: isCreating, error: createError }] = useCreateExamApiMutation();
  const [updateExam, { isLoading: isUpdating, error: updateError }] = useUpdateExamApiMutation();
  const [deleteExam, { isLoading: isDeleting, error: deleteError }] = useDeleteExamApiMutation();

  // Handle form submission for adding new exam type
  const handleSubmitExam = async (e) => {
    e.preventDefault();
    if (!examName.trim()) {
      toast.error("অনুগ্রহ করে একটি পরীক্ষার ধরনের নাম লিখুন");
      return;
    }
    if (examTypes?.some((et) => et.name.toLowerCase() === examName.toLowerCase())) {
      toast.error("এই পরীক্ষার ধরন ইতিমধ্যে বিদ্যমান!");
      return;
    }

    setModalAction("create");
    setModalData({
      name: examName.trim(),
      is_active: true,
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (exam) => {
    setEditExamId(exam.id);
    setEditExamName(exam.name);
  };

  // Handle update exam type
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editExamName.trim()) {
      toast.error("অনুগ্রহ করে একটি পরীক্ষার ধরনের নাম লিখুন");
      return;
    }

    setModalAction("update");
    setModalData({
      id: editExamId,
      name: editExamName.trim(),
      is_active: examTypes.find((et) => et.id === editExamId)?.is_active || true,
    });
    setIsModalOpen(true);
  };

  // Handle toggle active status
  const handleToggleActive = (exam) => {
    setModalAction("toggle");
    setModalData({
      id: exam.id,
      name: exam.name,
      is_active: !exam.is_active,
    });
    setIsModalOpen(true);
  };

  // Handle delete exam type
  const handleDelete = (id) => {
    setModalAction("delete");
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        await createExam(modalData).unwrap();
        toast.success("পরীক্ষার ধরন সফলভাবে তৈরি করা হয়েছে!");
        setExamName("");
      } else if (modalAction === "update") {
        await updateExam(modalData).unwrap();
        toast.success("পরীক্ষার ধরন সফলভাবে আপডেট করা হয়েছে!");
        setEditExamId(null);
        setEditExamName("");
      } else if (modalAction === "delete") {
        await deleteExam(modalData.id).unwrap();
        toast.success("পরীক্ষার ধরন সফলভাবে মুছে ফেলা হয়েছে!");
      } else if (modalAction === "toggle") {
        await updateExam(modalData).unwrap();
        toast.success(`পরীক্ষার ধরন ${modalData.name} এখন ${modalData.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}!`);
      }
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === "create" ? "তৈরি" : modalAction === "update" ? "আপডেট" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"}:`, err);
      toast.error(`পরীক্ষার ধরন ${modalAction === "create" ? "তৈরি করা" : modalAction === "update" ? "আপডেট করা" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"} ব্যর্থ: ${err.status || "অজানা ত্রুটি"} - ${JSON.stringify(err.data || {})}`);
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
            animation: slideUp 0.3s ease-out forwards;
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out forwards;
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
            background: rgba(10, 10, 21, 0.44);
          }
        `}
      </style>

      <div className="">
        {/* Form to Add Exam Type */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">নতুন পরীক্ষার ধরন যোগ করুন</h3>
          </div>
          <form onSubmit={handleSubmitExam} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <input
              type="text"
              id="examName"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="পরীক্ষার ধরন লিখুন (যেমন, মধ্যবর্তী)"
              disabled={isCreating}
              aria-describedby={createError ? "exam-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="নতুন পরীক্ষার ধরন তৈরি করুন"
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isCreating ? "cursor-not-allowed" : "hover:text-white hover:shadow-md"
              }`}
            >
              {isCreating ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>তৈরি করা হচ্ছে...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>পরীক্ষার ধরন তৈরি করুন</span>
                </span>
              )}
            </button>
          </form>
          {createError && (
            <div
              id="exam-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              ত্রুটি: {createError.status || "অজানা"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Exam Form */}
        {editExamId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">পরীক্ষার ধরন সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editExamName"
                value={editExamName}
                onChange={(e) => setEditExamName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="পরীক্ষার ধরন সম্পাদনা করুন (যেমন, মধ্যবর্তী)"
                disabled={isUpdating}
                aria-label="পরীক্ষার ধরন সম্পাদনা"
                aria-describedby="edit-exam-error"
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="পরীক্ষার ধরন আপডেট করুন"
                className={`relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isUpdating ? "cursor-not-allowed" : "hover:text-white hover:shadow-md"
                }`}
              >
                {isUpdating ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>আপডেট করা হচ্ছে...</span>
                  </span>
                ) : (
                  <span>পরীক্ষার ধরন আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditExamId(null);
                  setEditExamName("");
                }}
                title="সম্পাদনা বাতিল করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
            {updateError && (
              <div
                id="edit-exam-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                ত্রুটি: {updateError.status || "অজানা"} - {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Exam Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">পরীক্ষার ধরনের তালিকা</h3>
          {isExamLoading ? (
            <p className="p-4 text-[#441a05]/70">পরীক্ষার ধরন লোড হচ্ছে...</p>
          ) : examError ? (
            <p className="p-4 text-red-400">
              পরীক্ষার ধরন লোড করতে ত্রুটি: {examError.status || "অজানা"} -{" "}
              {JSON.stringify(examError.data || {})}
            </p>
          ) : examTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো পরীক্ষার ধরন উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      পরীক্ষার ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      সক্রিয়
                    </th>
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
                  {examTypes?.map((exam, index) => (
                    <tr
                      key={exam.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {exam.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exam.is_active}
                            onChange={() => handleToggleActive(exam)}
                            className="hidden"
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                              exam.is_active
                                ? "bg-[#DB9E30] border-[#DB9E30]"
                                : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                            }`}
                          >
                            {exam.is_active && (
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
                        {new Date(exam.created_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(exam.updated_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(exam)}
                          title="পরীক্ষার ধরন সম্পাদনা করুন"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          title="পরীক্ষার ধরন মুছুন"
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
                ? "পরীক্ষার ধরন মুছে ফেলা হচ্ছে..."
                : `পরীক্ষার ধরন মুছে ফেলতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === "create" && "নতুন পরীক্ষার ধরন নিশ্চিত করুন"}
                {modalAction === "update" && "পরীক্ষার ধরন আপডেট নিশ্চিত করুন"}
                {modalAction === "delete" && "পরীক্ষার ধরন মুছে ফেলা নিশ্চিত করুন"}
                {modalAction === "toggle" && "পরীক্ষার ধরনের স্থিতি পরিবর্তন নিশ্চিত করুন"}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === "create" && "আপনি কি নিশ্চিত যে নতুন পরীক্ষার ধরন তৈরি করতে চান?"}
                {modalAction === "update" && "আপনি কি নিশ্চিত যে পরীক্ষার ধরন আপডেট করতে চান?"}
                {modalAction === "delete" && "আপনি কি নিশ্চিত যে এই পরীক্ষার ধরনটি মুছে ফেলতে চান?"}
                {modalAction === "toggle" && `আপনি কি নিশ্চিত যে পরীক্ষার ধরনটি ${modalData?.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"} করতে চান?`}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
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

export default AddExamType;