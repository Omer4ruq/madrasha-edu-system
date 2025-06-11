import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useCreateExpenseHeadMutation, useDeleteExpenseHeadMutation, useGetExpenseHeadsQuery, useUpdateExpenseHeadMutation } from "../../redux/features/api/expense-heads/expenseHeadsApi";
import toast, { Toaster } from "react-hot-toast";

const ExpenseHead = () => {
  const [expenseHeadName, setExpenseHeadName] = useState("");
  const [editExpenseHeadId, setEditExpenseHeadId] = useState(null);
  const [editExpenseHeadName, setEditExpenseHeadName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks
  const { data: expenseHeads = [], isLoading: isExpenseHeadLoading, error: expenseHeadError } = useGetExpenseHeadsQuery();
  const [createExpenseHead, { isLoading: isCreating, error: createError }] = useCreateExpenseHeadMutation();
  const [updateExpenseHead, { isLoading: isUpdating, error: updateError }] = useUpdateExpenseHeadMutation();
  const [deleteExpenseHead, { isLoading: isDeleting, error: deleteError }] = useDeleteExpenseHeadMutation();

  // Handle form submission for adding new expense head
  const handleSubmitExpenseHead = async (e) => {
    e.preventDefault();
    if (!expenseHeadName.trim()) {
      toast.error("অনুগ্রহ করে খরচের শিরোনামের নাম লিখুন");
      return;
    }
    if (expenseHeads.some((eh) => eh.expensetype.toLowerCase() === expenseHeadName.toLowerCase())) {
      toast.error("এই খরচের শিরোনাম ইতিমধ্যে বিদ্যমান!");
      return;
    }
    setModalAction("create");
    setModalData({
      sl: Math.floor(Math.random() * 2147483647), // Generate random sl number for consistency
      expensetype: expenseHeadName.trim(),
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (expenseHead) => {
    setEditExpenseHeadId(expenseHead.id);
    setEditExpenseHeadName(expenseHead.expensetype);
  };

  // Handle update expense head
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editExpenseHeadName.trim()) {
      toast.error("অনুগ্রহ করে খরচের শিরোনামের নাম লিখুন");
      return;
    }
    setModalAction("update");
    setModalData({
      id: editExpenseHeadId,
      expensetype: editExpenseHeadName.trim(),
    });
    setIsModalOpen(true);
  };

  // Handle delete expense head
  const handleDelete = (id) => {
    setModalAction("delete");
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        await createExpenseHead(modalData).unwrap();
        toast.success("খরচের শিরোনাম সফলভাবে তৈরি হয়েছে!");
        setExpenseHeadName("");
      } else if (modalAction === "update") {
        await updateExpenseHead(modalData).unwrap();
        toast.success("খরচের শিরোনাম সফলভাবে আপডেট হয়েছে!");
        setEditExpenseHeadId(null);
        setEditExpenseHeadName("");
      } else if (modalAction === "delete") {
        await deleteExpenseHead(modalData.id).unwrap();
        toast.success("খরচের শিরোনাম সফলভাবে মুছে ফেলা হয়েছে!");
      }
    } catch (err) {
      console.error(`Error ${modalAction === "create" ? "creating" : modalAction === "update" ? "updating" : "deleting"} expense head:`, err);
      toast.error(`খরচের শিরোনাম ${modalAction === "create" ? "তৈরি" : modalAction === "update" ? "আপডেট" : "মুছে ফেলা"} ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
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
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes slideDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
          .animate-slideDown { animation: slideDown 0.4s ease-out forwards; }
          .tick-glow { transition: all 0.3s ease; }
          .tick-glow:checked + span { box-shadow: 0 0 10px rgba(37, 99, 235, 0.4); }
          .btn-glow:hover { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
        `}
      </style>

      <div>
        {/* Form to Add Expense Head */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">নতুন খরচের শিরোনাম যোগ করুন</h3>
          </div>
          <form onSubmit={handleSubmitExpenseHead} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <input
              type="text"
              id="expenseHeadName"
              value={expenseHeadName}
              onChange={(e) => setExpenseHeadName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="খরচের শিরোনাম লিখুন (যেমন: অফিস সরবরাহ)"
              disabled={isCreating}
              aria-describedby={createError ? "expense-head-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="নতুন খরচের শিরোনাম তৈরি করুন"
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isCreating ? "cursor-not-allowed opacity-70" : "hover:text-white hover:shadow-md"
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
                  <span>খরচের শিরোনাম তৈরি করুন</span>
                </span>
              )}
            </button>
          </form>
          {createError && (
            <div
              id="expense-head-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              ত্রুটি: {createError.status || "অজানা"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Expense Head Form */}
        {editExpenseHeadId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">খরচের শিরোনাম সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editExpenseHeadName"
                value={editExpenseHeadName}
                onChange={(e) => setEditExpenseHeadName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="খরচের শিরোনাম সম্পাদনা করুন (যেমন: অফিস সরবরাহ)"
                disabled={isUpdating}
                aria-label="খরচের শিরোনাম সম্পাদনা"
                aria-describedby={updateError ? "edit-expense-head-error" : undefined}
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="খরচের শিরোনাম আপডেট করুন"
                className={`relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isUpdating ? "cursor-not-allowed opacity-70" : "hover:text-white hover:shadow-md"
                }`}
              >
                {isUpdating ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>আপডেট হচ্ছে...</span>
                  </span>
                ) : (
                  <span>খরচের শিরোনাম আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditExpenseHeadId(null);
                  setEditExpenseHeadName("");
                }}
                title="সম্পাদনা বাতিল করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
            {updateError && (
              <div
                id="edit-expense-head-error"
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
                {modalAction === "create" && "নতুন খরচের শিরোনাম নিশ্চিত করুন"}
                {modalAction === "update" && "খরচের শিরোনাম আপডেট নিশ্চিত করুন"}
                {modalAction === "delete" && "খরচের শিরোনাম মুছে ফেলা নিশ্চিত করুন"}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === "create" && "আপনি কি নিশ্চিত যে নতুন খরচের শিরোনাম তৈরি করতে চান?"}
                {modalAction === "update" && "আপনি কি নিশ্চিত যে খরচের শিরোনাম আপডেট করতে চান?"}
                {modalAction === "delete" && "আপনি কি নিশ্চিত যে এই খরচের শিরোনামটি মুছে ফেলতে চান?"}
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

        {/* Expense Heads Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">খরচের শিরোনাম তালিকা</h3>
          {isExpenseHeadLoading ? (
            <p className="p-4 text-[#441a05]/70">খরচের শিরোনাম লোড হচ্ছে...</p>
          ) : expenseHeadError ? (
            <p className="p-4 text-red-400">
              খরচের শিরোনাম লোড করতে ত্রুটি: {expenseHeadError.status || "অজানা"} -{" "}
              {JSON.stringify(expenseHeadError.data || {})}
            </p>
          ) : expenseHeads.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো খরচের শিরোনাম উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রমিক
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      খরচের শিরোনাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      কার্যক্রম
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {expenseHeads.map((expenseHead, index) => (
                    <tr
                      key={expenseHead.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {expenseHead.expensetype}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(expenseHead)}
                          title="খরচের শিরোনাম সম্পাদনা"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                          aria-label={`সম্পাদনা ${expenseHead.expensetype}`}
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expenseHead.id)}
                          title="খরচের শিরোনাম মুছুন"
                          className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                          aria-label={`মুছুন ${expenseHead.expensetype}`}
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
                ? "খরচের শিরোনাম মুছছে..."
                : `খরচের শিরোনাম মুছতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseHead;