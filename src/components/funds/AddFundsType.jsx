import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useCreateFundsMutation, useDeleteFundsMutation, useGetFundsQuery, useUpdateFundsMutation } from "../../redux/features/api/funds/fundsApi";

const AddFundsType = () => {
  const [fundName, setFundName] = useState("");
  const [editFundId, setEditFundId] = useState(null);
  const [editFundName, setEditFundName] = useState("");

  // API hooks
  const { data: fundTypes, isLoading: isFundLoading, error: fundError } = useGetFundsQuery();
  const [createFund, { isLoading: isCreating, error: createError }] = useCreateFundsMutation();
  const [updateFund, { isLoading: isUpdating, error: updateError }] = useUpdateFundsMutation();
  const [deleteFund, { isLoading: isDeleting, error: deleteError }] = useDeleteFundsMutation();

  // Handle form submission for adding new fund type
  const handleSubmitFund = async (e) => {
    e.preventDefault();
    if (!fundName.trim()) {
      alert("Please enter a fund type name");
      return;
    }
    if (fundTypes?.some((ft) => ft.name.toLowerCase() === fundName.toLowerCase())) {
      alert("This fund type already exists!");
      return;
    }
    try {
      const payload = {
        sl: Math.floor(Math.random() * 2147483647), // Generate random sl number
        name: fundName.trim(),
      };
      await createFund(payload).unwrap();
      alert("Fund type created successfully!");
      setFundName("");
    } catch (err) {
      console.error("Error creating fund type:", err);
      alert(`Failed to create fund type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle edit button click
  const handleEditClick = (fund) => {
    setEditFundId(fund.id); // Use id as the identifier
    setEditFundName(fund.name);
  };

  // Handle update fund type
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFundName.trim()) {
      alert("Please enter a fund type name");
      return;
    }
    try {
      const payload = {
        id: editFundId, // Use id as the identifier
        name: editFundName.trim(),
      };
      console.log("Update payload:", payload); // Log payload for debugging
      await updateFund(payload).unwrap();
      alert("Fund type updated successfully!");
      setEditFundId(null);
      setEditFundName("");
    } catch (err) {
      console.error("Error updating fund type:", err);
      alert(`Failed to update fund type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle delete fund type
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this fund type?")) {
      try {
        await deleteFund(id).unwrap(); // Use id for deletion
        alert("Fund type deleted successfully!");
      } catch (err) {
        console.error("Error deleting fund type:", err);
        alert(`Failed to delete fund type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
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
        {/* Form to Add Fund Type */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Add New Fund Type</h3>
          </div>
          <form onSubmit={handleSubmitFund} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <input
              type="text"
              id="fundName"
              value={fundName}
              onChange={(e) => setFundName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Enter fund type (e.g., Equity Fund)"
              disabled={isCreating}
              aria-describedby={createError ? "fund-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="Create a new fund type"
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
                  <span>Create Fund Type</span>
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
              Error: {createError.status || "Unknown"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Fund Form */}
        {editFundId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Edit Fund Type</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editFundName"
                value={editFundName}
                onChange={(e) => setEditFundName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="Edit fund type (e.g., Equity Fund)"
                disabled={isUpdating}
                aria-label="Edit Fund Type"
                aria-describedby={updateError ? "edit-fund-error" : undefined}
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="Update fund type"
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
                  <span>Update Fund Type</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditFundId(null);
                  setEditFundName("");
                }}
                title="Cancel editing"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                Cancel
              </button>
            </form>
            {updateError && (
              <div
                id="edit-fund-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                Error: {updateError.status || "Unknown"} - {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Fund Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Fund Types List</h3>
          {isFundLoading ? (
            <p className="p-4 text-[#441a05]/70">Loading fund types...</p>
          ) : fundError ? (
            <p className="p-4 text-red-400">
              Error loading fund types: {fundError.status || "Unknown"} -{" "}
              {JSON.stringify(fundError.data || {})}
            </p>
          ) : fundTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">No fund types available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Serial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Fund Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Actions
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
                          title="Edit fund type"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(fund.id)} // Use id for deletion
                          title="Delete fund type"
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
                ? "Deleting fund type..."
                : `Error deleting fund type: ${deleteError?.status || "Unknown"} - ${JSON.stringify(
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