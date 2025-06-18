import React, { useState } from "react";
import {
  useCreateBehaviorTypeApiMutation,
  useGetBehaviorTypeApiQuery,
  useUpdateBehaviorTypeApiMutation,
  useDeleteBehaviorTypeApiMutation,
} from "../../redux/features/api/behavior/behaviorTypeApi";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";

const AddBehaviorType = () => {
  const [behavior, setBehavior] = useState("");
  const [marks, setMarks] = useState("");
  const [editBehaviorId, setEditBehaviorId] = useState(null);
  const [editBehaviorName, setEditBehaviorName] = useState("");
  const [editMarks, setEditMarks] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks
  const {
    data: behaviorTypes,
    isLoading: isBehaviorLoading,
    error: behaviorError,
    refetch,
  } = useGetBehaviorTypeApiQuery();
  const [createBehavior, { isLoading: isCreating, error: createError }] = useCreateBehaviorTypeApiMutation();
  const [updateBehavior, { isLoading: isUpdating, error: updateError }] = useUpdateBehaviorTypeApiMutation();
  const [deleteBehavior, { isLoading: isDeleting, error: deleteError }] = useDeleteBehaviorTypeApiMutation();

  // Validate marks
  const validateMarks = (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  // Handle form submission for adding new behavior
  const handleSubmitBehavior = async (e) => {
    e.preventDefault();
    if (!behavior.trim() || !marks.trim()) {
      toast.error("অনুগ্রহ করে আচরণের ধরন এবং নম্বর উভয়ই লিখুন");
      return;
    }
    if (!validateMarks(marks)) {
      toast.error("নম্বর ০ থেকে ১০০ এর মধ্যে হতে হবে");
      return;
    }
    if (behaviorTypes?.some((bt) => bt.name.toLowerCase() === behavior.toLowerCase())) {
      toast.error("এই আচরণের ধরন ইতিমধ্যে বিদ্যমান!");
      return;
    }

    setModalAction("create");
    setModalData({
      name: behavior.trim(),
      obtain_mark: Number(marks),
      is_active: true,
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (behavior) => {
    setEditBehaviorId(behavior.id);
    setEditBehaviorName(behavior.name);
    setEditMarks(behavior.obtain_mark.toString());
  };

  // Handle update behavior
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editBehaviorName.trim() || !editMarks.trim()) {
      toast.error("অনুগ্রহ করে আচরণের ধরন এবং নম্বর উভয়ই লিখুন");
      return;
    }
    if (!validateMarks(editMarks)) {
      toast.error("নম্বর ০ থেকে ১০০ এর মধ্যে হতে হবে");
      return;
    }

    setModalAction("update");
    setModalData({
      id: editBehaviorId,
      name: editBehaviorName.trim(),
      obtain_mark: Number(editMarks),
      is_active: behaviorTypes.find((bt) => bt.id === editBehaviorId)?.is_active || true,
    });
    setIsModalOpen(true);
  };

  // Handle toggle active status
  const handleToggleActive = (behavior) => {
    setModalAction("toggle");
    setModalData({
      id: behavior.id,
      name: behavior.name,
      obtain_mark: behavior.obtain_mark,
      is_active: !behavior.is_active,
    });
    setIsModalOpen(true);
  };

  // Handle delete behavior
  const handleDelete = (id) => {
    setModalAction("delete");
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        await createBehavior(modalData).unwrap();
        toast.success("আচরণের ধরন সফলভাবে তৈরি করা হয়েছে!");
        setBehavior("");
        setMarks("");
      } else if (modalAction === "update") {
        await updateBehavior(modalData).unwrap();
        toast.success("আচরণের ধরন সফলভাবে আপডেট করা হয়েছে!");
        setEditBehaviorId(null);
        setEditBehaviorName("");
        setEditMarks("");
      } else if (modalAction === "delete") {
        await deleteBehavior(modalData.id).unwrap();
        toast.success("আচরণের ধরন সফলভাবে মুছে ফেলা হয়েছে!");
      } else if (modalAction === "toggle") {
        await updateBehavior(modalData).unwrap();
        toast.success(`আচরণ ${modalData.name} এখন ${modalData.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}!`);
      }
      refetch(); // Refresh data after successful action
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === "create" ? "তৈরি করা" : modalAction === "update" ? "আপডেট" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"}:`, err);
      toast.error(`আচরণ ${modalAction === "create" ? "তৈরি" : modalAction === "update" ? "আপডেট" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"} ব্যর্থ: ${err.status || "অজানা"} - ${JSON.stringify(err.data || {})}`);
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
        {/* Form to Add Behavior Type */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">নতুন আচরণের ধরন যোগ করুন</h3>
          </div>
          <form onSubmit={handleSubmitBehavior} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              id="behaviorName"
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="আচরণের ধরন লিখুন (যেমন, সময়ানুবর্তিতা)"
              disabled={isCreating}
              aria-label="আচরণের ধরন"
              title="আচরণের ধরন লিখুন (উদাহরণ: সময়ানুবর্তিতা) / Enter behavior type (e.g., Punctuality)"
              aria-describedby={createError ? "behavior-error" : undefined}
            />
            <input
              type="number"
              id="marks"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="নম্বর লিখুন (যেমন, ১০)"
              disabled={isCreating}
              aria-label="নম্বর"
              title="নম্বর লিখুন (উদাহরণ: ১০) / Enter marks (e.g., 10)"
              aria-describedby={createError ? "behavior-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="নতুন আচরণের ধরন তৈরি করুন / Create a new behavior type"
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
                  <span>আচরণ তৈরি করুন</span>
                </span>
              )}
            </button>
          </form>
          {createError && (
            <div
              id="behavior-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              ত্রুটি: {createError.status || "অজানা"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Behavior Form */}
        {editBehaviorId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">আচরণের ধরন সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl">
              <input
                type="text"
                id="editBehaviorName"
                value={editBehaviorName}
                onChange={(e) => setEditBehaviorName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="আচরণের ধরন সম্পাদনা করুন (যেমন, সময়ানুবর্তিতা)"
                disabled={isUpdating}
                aria-label="আচরণের ধরন সম্পাদনা"
                title="আচরণের ধরন সম্পাদনা করুন (উদাহরণ: সময়ানুবর্তিতা) / Edit behavior type (e.g., Punctuality)"
                aria-describedby="edit-behavior-error"
              />
              <input
                type="number"
                id="editMarks"
                value={editMarks}
                onChange={(e) => setEditMarks(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="নম্বর সম্পাদনা করুন (যেমন, ১০)"
                disabled={isUpdating}
                aria-label="নম্বর সম্পাদনা"
                title="নম্বর সম্পাদনা করুন (উদাহরণ: ১০) / Edit marks (e.g., 10)"
                aria-describedby="edit-behavior-error"
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="আচরণের ধরন আপডেট করুন / Update behavior type"
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
                  <span>আচরণ আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditBehaviorId(null);
                  setEditBehaviorName("");
                  setEditMarks("");
                }}
                title="সম্পাদনা বাতিল করুন / Cancel editing"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
            {updateError && (
              <div
                id="edit-behavior-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                ত্রুটি: {updateError.status || "অজানা"} - {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Behavior Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">আচরণের ধরনের তালিকা</h3>
          {isBehaviorLoading ? (
            <p className="p-4 text-[#441a05]/70">আচরণের ধরন লোড হচ্ছে...</p>
          ) : behaviorError ? (
            <p className="p-4 text-red-400">
              আচরণের ধরন লোড করতে ত্রুটি: {behaviorError.status || "অজানা"} -{" "}
              {JSON.stringify(behaviorError.data || {})}
            </p>
          ) : behaviorTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো আচরণের ধরন উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আচরণের ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      নম্বর
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
                  {behaviorTypes?.map((behavior, index) => (
                    <tr
                      key={behavior.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {behavior.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {behavior.obtain_mark}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={behavior.is_active}
                            onChange={() => handleToggleActive(behavior)}
                            className="hidden"
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                              behavior.is_active
                                ? "bg-[#DB9E30] border-[#DB9E30]"
                                : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                            }`}
                          >
                            {behavior.is_active && (
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
                        {new Date(behavior.created_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(behavior.updated_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(behavior)}
                          title="আচরণের ধরন সম্পাদনা করুন / Edit behavior type"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(behavior.id)}
                          title="আচরণের ধরন মুছুন / Delete behavior type"
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
                ? "আচরণের ধরন মুছে ফেলা হচ্ছে..."
                : `আচরণ মুছে ফেলতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(
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
                {modalAction === "create" && "নতুন আচরণের ধরন নিশ্চিত করুন"}
                {modalAction === "update" && "আচরণের ধরন আপডেট নিশ্চিত করুন"}
                {modalAction === "delete" && "আচরণের ধরন মুছে ফেলা নিশ্চিত করুন"}
                {modalAction === "toggle" && "আচরণের ধরনের স্থিতি পরিবর্তন নিশ্চিত করুন"}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === "create" && "আপনি কি নিশ্চিত যে নতুন আচরণের ধরন তৈরি করতে চান?"}
                {modalAction === "update" && "আপনি কি নিশ্চিত যে আচরণের ধরন আপডেট করতে চান?"}
                {modalAction === "delete" && "আপনি কি নিশ্চিত যে এই আচরণের ধরনটি মুছে ফেলতে চান?"}
                {modalAction === "toggle" && `আপনি কি নিশ্চিত যে আচরণের ধরনটি ${modalData?.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"} করতে চান?`}
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

export default AddBehaviorType;