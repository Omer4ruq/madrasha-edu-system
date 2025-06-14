import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useCreateFundsMutation, useDeleteFundsMutation, useGetFundsQuery, useUpdateFundsMutation } from "../../redux/features/api/funds/fundsApi";
import toast, { Toaster } from "react-hot-toast";

const AddFundsType = () => {
  const [fundName, setFundName] = useState("");
  const [editFundId, setEditFundId] = useState(null);
  const [editFundName, setEditFundName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks
  const { data: fundTypes, isLoading: isFundLoading, error: fundError } = useGetFundsQuery();
  const [createFund, { isLoading: isCreating, error: createError }] = useCreateFundsMutation();
  const [updateFund, { isLoading: isUpdating, error: updateError }] = useUpdateFundsMutation();
  const [deleteFund, { isLoading: isDeleting, error: deleteError }] = useDeleteFundsMutation();

  // Handle form submission for adding new fund type
  const handleSubmitFund = async (e) => {
    e.preventDefault();
    if (!fundName.trim()) {
      toast.error("অনুগ্রহ করে ফান্ডের নাম লিখুন");
      return;
    }
    if (fundTypes?.some((ft) => ft.name.toLowerCase() === fundName.toLowerCase())) {
      toast.error("এই ফান্ড টাইপ ইতি�মধ্যে বিদ্যমান!");
      return;
    }
    setModalAction("create");
    setModalData({
      sl: Math.floor(Math.random() * 2147483647), // Generate random sl number
      name: fundName.trim(),
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (fund) => {
    setEditFundId(fund.id);
    setEditFundName(fund.name);
  };

  // Handle update fund type
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFundName.trim()) {
      toast.error("অনুগ্রহ করে ফান্ডের নাম লিখুন");
      return;
    }
    setModalAction("update");
    setModalData({
      id: editFundId,
      name: editFundName.trim(),
    });
    setIsModalOpen(true);
  };

  // Handle delete fund type
  const handleDelete = (id) => {
    setModalAction("delete");
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        await createFund(modalData).unwrap();
        toast.success("ফান্ড টাইপ সফলভাবে তৈরি হয়েছে!");
        setFundName("");
      } else if (modalAction === "update") {
        await updateFund(modalData).unwrap();
        toast.success("ফান্ড টাইপ সফলভাবে আপডেট হয়েছে!");
        setEditFundId(null);
        setEditFundName("");
      } else if (modalAction === "delete") {
        await deleteFund(modalData.id).unwrap();
        toast.success("ফান্ড টাইপ সফলভাবে মুছে ফেলা হয়েছে!");
      }
    } catch (err) {
      console.error(`Error ${modalAction === "create" ? "creating" : modalAction === "update" ? "updating" : "deleting"} fund type:`, err);
      toast.error(`ফান্ড টাইপ ${modalAction === "create" ? "তৈরি" : modalAction === "update" ? "আপডেট" : "মুছে ফেলা"} ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
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

      <div>
        {/* Form to Add Fund Type */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">নতুন ফান্ড টাইপ যোগ করুন</h3>
          </div>
          <form onSubmit={handleSubmitFund} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <input
              type="text"
              id="fundName"
              value={fundName}
              onChange={(e) => setFundName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="ফান্ড টাইপ লিখুন (যেমন: ইকুইটি ফান্ড)"
              disabled={isCreating}
              aria-describedby={createError ? "fund-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="নতুন ফান্ড টাইপ তৈরি করুন"
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
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
                  <span>ফান্ড টাইপ তৈরি করুন</span>
                </span>
              )}
            </button>
          </form>
          {createError && (
            <div
              id="fund-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              ত্রুটি: {createError.status || "অজানা"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Fund Form */}
        {editFundId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">ফান্ড টাইপ সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editFundName"
                value={editFundName}
                onChange={(e) => setEditFundName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="ফান্ড টাইপ সম্পাদনা করুন (যেমন: ইকুইটি ফান্ড)"
                disabled={isUpdating}
                aria-label="ফান্ড টাইপ সম্পাদনা"
                aria-describedby={updateError ? "edit-fund-error" : undefined}
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="ফান্ড টাইপ আপডেট করুন"
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
                  <span>ফান্ড টাইপ আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditFundId(null);
                  setEditFundName("");
                }}
                title="সম্পাদনা বাতিল করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
            {updateError && (
              <div
                id="edit-fund-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                ত্রুটি: {updateError.status || "অজানা"} - {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === "create" && "নতুন ফান্ড টাইপ নিশ্চিত করুন"}
                {modalAction === "update" && "ফান্ড টাইপ আপডেট নিশ্চিত করুন"}
                {modalAction === "delete" && "ফান্ড টাইপ মুছে ফেলা নিশ্চিত করুন"}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === "create" && "আপনি কি নিশ্চিত যে নতুন ফান্ড টাইপ তৈরি করতে চান?"}
                {modalAction === "update" && "আপনি কি নিশ্চিত যে ফান্ড টাইপ আপডেট করতে চান?"}
                {modalAction === "delete" && "আপনি কি নিশ্চিত যে এই ফান্ড টাইপটি মুছে ফেলতে চান?"}
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
                  disabled={isCreating || isUpdating || isDeleting}
                  className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${
                    (isCreating || isUpdating || isDeleting) ? "cursor-not-allowed opacity-60" : "hover:text-white"
                  }`}
                >
                  {isCreating || isUpdating || isDeleting ? (
                    <span className="flex items-center space-x-2">
                      <FaSpinner className="animate-spin text-lg" />
                      <span>
                        {modalAction === "create" && "তৈরি হচ্ছে..."}
                        {modalAction === "update" && "আপডেট হচ্ছে..."}
                        {modalAction === "delete" && "মুছছে..."}
                      </span>
                    </span>
                  ) : (
                    "নিশ্চিত করুন"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fund Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">ফান্ড টাইপ তালিকা</h3>
          {isFundLoading ? (
            <p className="p-4 text-[#441a05]/70">ফান্ড টাইপ লোড হচ্ছে...</p>
          ) : fundError ? (
            <p className="p-4 text-red-400">
              ফান্ড টাইপ লোড করতে ত্রুটি: {fundError.status || "অজানা"} -{" "}
              {JSON.stringify(fundError.data || {})}
            </p>
          ) : fundTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো ফান্ড টাইপ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রমিক
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ফান্ড টাইপ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      কার্যক্রম
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {fundTypes?.map((fund, index) => (
                    <tr
                      key={fund.sl}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {fund.sl}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {fund.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(fund)}
                          title="ফান্ড টাইপ সম্পাদনা"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(fund.id)}
                          title="ফান্ড টাইপ মুছুন"
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
                ? "ফান্ড টাইপ মুছছে..."
                : `ফান্ড টাইপ মুছতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFundsType;