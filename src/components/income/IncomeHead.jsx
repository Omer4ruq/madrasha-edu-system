import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useCreateIncomeHeadMutation, useDeleteIncomeHeadMutation, useGetIncomeHeadsQuery, useUpdateIncomeHeadMutation } from "../../redux/features/api/income-heads/incomeHeadsApi";


const IncomeHead = () => {
  const [incomeHeadName, setIncomeHeadName] = useState("");
  const [editIncomeHeadId, setEditIncomeHeadId] = useState(null);
  const [editIncomeHeadName, setEditIncomeHeadName] = useState("");

  // API hooks
  const { data: incomeHeads, isLoading: isIncomeHeadLoading, error: incomeHeadError } = useGetIncomeHeadsQuery();
  const [createIncomeHead, { isLoading: isCreating, error: createError }] = useCreateIncomeHeadMutation();
  const [updateIncomeHead, { isLoading: isUpdating, error: updateError }] = useUpdateIncomeHeadMutation();
  const [deleteIncomeHead, { isLoading: isDeleting, error: deleteError }] = useDeleteIncomeHeadMutation();

  // Handle form submission for adding new income head
  const handleSubmitIncomeHead = async (e) => {
    e.preventDefault();
    if (!incomeHeadName.trim()) {
      alert("Please enter an income head name");
      return;
    }
    if (incomeHeads?.some((ih) => ih.name.toLowerCase() === incomeHeadName.toLowerCase())) {
      alert("This income head already exists!");
      return;
    }
    try {
      const payload = {
        
        incometype: incomeHeadName.trim(),
      };
      await createIncomeHead(payload).unwrap();
      alert("Income head created successfully!");
      setIncomeHeadName("");
    } catch (err) {
      console.error("Error creating income head:", err);
      alert(`Failed to create income head: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle edit button click
  const handleEditClick = (incomeHead) => {
    setEditIncomeHeadId(incomeHead?.id); // Use id as the identifier
    setEditIncomeHeadName(incomeHead?.incometype);
  };

  // Handle update income head
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editIncomeHeadName.trim()) {
      alert("Please enter an income head name");
      return;
    }
    try {
      const payload = {
        id: editIncomeHeadId, // Use id as the identifier
        incometype: editIncomeHeadName.trim(),
      };
      console.log("Update payload:", payload); // Log payload for debugging
      await updateIncomeHead(payload).unwrap();
      alert("Income head updated successfully!");
      setEditIncomeHeadId(null);
      setEditIncomeHeadName("");
    } catch (err) {
      console.error("Error updating income head:", err);
      alert(`Failed to update income head: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle delete income head
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income head?")) {
      try {
        await deleteIncomeHead(id).unwrap(); // Use id for deletion
        alert("Income head deleted successfully!");
      } catch (err) {
        console.error("Error deleting income head:", err);
        alert(`Failed to delete income head: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
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

      <div>
        {/* Form to Add Income Head */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Add New Income Head</h3>
          </div>
          <form onSubmit={handleSubmitIncomeHead} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <input
              type="text"
              id="incomeHeadName"
              value={incomeHeadName}
              onChange={(e) => setIncomeHeadName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Enter income head (e.g., Sales Revenue)"
              disabled={isCreating}
              aria-describedby={createError ? "income-head-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="Create a new income head"
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
                  <span>Create Income Head</span>
                </span>
              )}
            </button>
          </form>
          {createError && (
            <div
              id="income-head-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              Error: {createError.status || "Unknown"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Income Head Form */}
        {editIncomeHeadId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Edit Income Head</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editIncomeHeadName"
                value={editIncomeHeadName}
                onChange={(e) => setEditIncomeHeadName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="Edit income head (e.g., Sales Revenue)"
                disabled={isUpdating}
                aria-label="Edit Income Head"
                aria-describedby={updateError ? "edit-income-head-error" : undefined}
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="Update income head"
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
                  <span>Update Income Head</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditIncomeHeadId(null);
                  setEditIncomeHeadName("");
                }}
                title="Cancel editing"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                Cancel
              </button>
            </form>
            {updateError && (
              <div
                id="edit-income-head-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                Error: {updateError.status || "Unknown"} - {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Income Heads Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Income Heads List</h3>
          {isIncomeHeadLoading ? (
            <p className="p-4 text-[#441a05]/70">Loading income heads...</p>
          ) : incomeHeadError ? (
            <p className="p-4 text-red-400">
              Error loading income heads: {incomeHeadError.status || "Unknown"} -{" "}
              {JSON.stringify(incomeHeadError.data || {})}
            </p>
          ) : incomeHeads?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">No income heads available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Serial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Income Head
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {incomeHeads?.map((incomeHead, index) => (
                    <tr
                      key={incomeHead.sl}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {incomeHead.sl}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {incomeHead?.incometype}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(incomeHead)}
                          title="Edit income head"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(incomeHead.id)} // Use id for deletion
                          title="Delete income head"
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
                ? "Deleting income head..."
                : `Error deleting income head: ${deleteError?.status || "Unknown"} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomeHead;