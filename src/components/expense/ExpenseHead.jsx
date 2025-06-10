import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useCreateExpenseHeadMutation, useDeleteExpenseHeadMutation, useGetExpenseHeadsQuery, useUpdateExpenseHeadMutation } from "../../redux/features/api/expense-heads/expenseHeadsApi";


const ExpenseHead = () => {
  const [expenseHeadName, setExpenseHeadName] = useState("");
  const [editExpenseHeadId, setEditExpenseHeadId] = useState(null);
  const [editExpenseHeadName, setEditExpenseHeadName] = useState("");

  // API hooks
  const { data: expenseHeads = [], isLoading: isExpenseHeadLoading, error: expenseHeadError } = useGetExpenseHeadsQuery();
  const [createExpenseHead, { isLoading: isCreating, error: createError }] = useCreateExpenseHeadMutation();
  const [updateExpenseHead, { isLoading: isUpdating, error: updateError }] = useUpdateExpenseHeadMutation();
  const [deleteExpenseHead, { isLoading: isDeleting, error: deleteError }] = useDeleteExpenseHeadMutation();

  // Handle form submission for adding new expense head
  const handleSubmitExpenseHead = async (e) => {
    e.preventDefault();
    if (!expenseHeadName.trim()) {
      alert("Please enter an expense head name");
      return;
    }
    if (expenseHeads.some((eh) => eh.expensetype.toLowerCase() === expenseHeadName.toLowerCase())) {
      alert("This expense head already exists!");
      return;
    }
    try {
      const payload = {
        expensetype: expenseHeadName.trim(),
      };
      console.log("Create payload:", payload);
      await createExpenseHead(payload).unwrap();
      alert("Expense head created successfully!");
      setExpenseHeadName("");
    } catch (err) {
      console.error("Error creating expense head:", err);
      alert(`Failed to create expense head: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
    }
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
      alert("Please enter an expense head name");
      return;
    }
    try {
      const payload = {
        id: editExpenseHeadId,
        expensetype: editExpenseHeadName.trim(),
      };
      console.log("Update payload:", payload);
      await updateExpenseHead(payload).unwrap();
      alert("Expense head updated successfully!");
      setEditExpenseHeadId(null);
      setEditExpenseHeadName("");
    } catch (err) {
      console.error("Error updating expense head:", err);
      alert(`Failed to update expense head: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle delete expense head
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpenseHead(id).unwrap();
        alert("Expense head deleted successfully!");
      } catch (err) {
        console.error("Error deleting expense head:", err);
        alert(`Failed to delete expense head: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
      }
    }
  };

  return (
    <div className="py-8 w-full relative">
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
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
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Add New Expense Head</h3>
          </div>
          <form onSubmit={handleSubmitExpenseHead} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <input
              type="text"
              id="expenseHeadName"
              value={expenseHeadName}
              onChange={(e) => setExpenseHeadName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Enter expense head (e.g., Office Supplies)"
              disabled={isCreating}
              aria-describedby={createError ? "expense-head-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="Create a new expense head"
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
                  <span>Create Expense Head</span>
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
              Error: {createError.status || "Unknown"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Expense Head Form */}
        {editExpenseHeadId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Edit Expense Head</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editExpenseHeadName"
                value={editExpenseHeadName}
                onChange={(e) => setEditExpenseHeadName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="Edit expense head (e.g., Office Supplies)"
                disabled={isUpdating}
                aria-label="Edit Expense Head"
                aria-describedby={updateError ? "edit-expense-head-error" : undefined}
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="Update expense head"
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
                  <span>Update Expense Head</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditExpenseHeadId(null);
                  setEditExpenseHeadName("");
                }}
                title="Cancel editing"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                Cancel
              </button>
            </form>
            {updateError && (
              <div
                id="edit-expense-head-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                Error: {updateError.status || "Unknown"} - {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Expense Heads Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Expense Heads List</h3>
          {isExpenseHeadLoading ? (
            <p className="p-4 text-[#441a05]/70">Loading expense heads...</p>
          ) : expenseHeadError ? (
            <p className="p-4 text-red-400">
              Error loading expense heads: {expenseHeadError.status || "Unknown"} -{" "}
              {JSON.stringify(expenseHeadError.data || {})}
            </p>
          ) : expenseHeads.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">No expense heads available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Serial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Expense Head
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Actions
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
                          title="Edit expense head"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expenseHead.id)}
                          title="Delete expense head"
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
                ? "Deleting expense head..."
                : `Error deleting expense head: ${deleteError?.status || "Unknown"} - ${JSON.stringify(
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