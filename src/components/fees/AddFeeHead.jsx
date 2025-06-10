import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useCreateFeeHeadMutation, useDeleteFeeHeadMutation, useGetFeeHeadsQuery, useUpdateFeeHeadMutation } from "../../redux/features/api/fee-heads/feeHeadsApi";


const AddFeeHead = () => {
  const [feeHeadName, setFeeHeadName] = useState("");
  const [editFeeHeadId, setEditFeeHeadId] = useState(null);
  const [editFeeHeadName, setEditFeeHeadName] = useState("");

  const { data: feeHeads = [], isLoading: isFeeHeadLoading, error: feeHeadError } = useGetFeeHeadsQuery();
  const [createFeeHead, { isLoading: isCreating, error: createError }] = useCreateFeeHeadMutation();
  const [updateFeeHead, { isLoading: isUpdating, error: updateError }] = useUpdateFeeHeadMutation();
  const [deleteFeeHead, { isLoading: isDeleting, error: deleteError }] = useDeleteFeeHeadMutation();

  const handleSubmitFeeHead = async (e) => {
    e.preventDefault();
    if (!feeHeadName.trim()) {
      alert("Please enter a fee head name");
      return;
    }
    if (feeHeads.some((fh) => fh.name.toLowerCase() === feeHeadName.toLowerCase())) {
      alert("This fee head already exists!");
      return;
    }
    try {
      await createFeeHead({ sl: Math.floor(Math.random() * 2147483647), name: feeHeadName.trim() }).unwrap();
      alert("Fee head created successfully!");
      setFeeHeadName("");
    } catch (err) {
      alert(`Failed to create fee head: ${err.status || "Unknown error"}`);
    }
  };

  const handleEditClick = (feeHead) => {
    setEditFeeHeadId(feeHead.id);
    setEditFeeHeadName(feeHead.name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFeeHeadName.trim()) {
      alert("Please enter a fee head name");
      return;
    }
    try {
      await updateFeeHead({ id: editFeeHeadId, name: editFeeHeadName.trim() }).unwrap();
      alert("Fee head updated successfully!");
      setEditFeeHeadId(null);
      setEditFeeHeadName("");
    } catch (err) {
      alert(`Failed to update fee head: ${err.status || "Unknown error"}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this fee head?")) {
      try {
        await deleteFeeHead(id).unwrap();
        alert("Fee head deleted successfully!");
      } catch (err) {
        alert(`Failed to delete fee head: ${err.status || "Unknown error"}`);
      }
    }
  };

  return (
    <div className="py-8 w-full">
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .btn-glow:hover { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
        `}
      </style>

      {/* Form to Add Fee Head */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Add New Fee Head</h3>
        </div>
        <form onSubmit={handleSubmitFeeHead} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <input
            type="text"
            id="feeHeadName"
            value={feeHeadName}
            onChange={(e) => setFeeHeadName(e.target.value)}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
            placeholder="Enter fee head (e.g., Tuition Fee)"
            disabled={isCreating}
            aria-describedby={createError ? "fee-head-error" : undefined}
          />
          <button
            type="submit"
            disabled={isCreating}
            className={`flex items-center justify-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
              isCreating ? "cursor-not-allowed opacity-70" : "hover:text-white hover:shadow-md"
            }`}
          >
            {isCreating ? (
              <>
                <FaSpinner className="animate-spin text-lg mr-2" />
                Creating...
              </>
            ) : (
              <>
                <IoAdd className="w-5 h-5 mr-2" />
                Create Fee Head
              </>
            )}
          </button>
        </form>
        {createError && (
          <div id="fee-head-error" className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            Error: {createError.status || "Unknown"}
          </div>
        )}
      </div>

      {/* Edit Fee Head Form */}
      {editFeeHeadId && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <FaEdit className="text-3xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Edit Fee Head</h3>
          </div>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
            <input
              type="text"
              id="editFeeHeadName"
              value={editFeeHeadName}
              onChange={(e) => setEditFeeHeadName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
              placeholder="Edit fee head (e.g., Tuition Fee)"
              disabled={isUpdating}
              aria-label="Edit Fee Head"
              aria-describedby={updateError ? "edit-fee-head-error" : undefined}
            />
            <button
              type="submit"
              disabled={isUpdating}
              className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isUpdating ? "cursor-not-allowed opacity-70" : "hover:text-white hover:shadow-md"
              }`}
            >
              {isUpdating ? (
                <>
                  <FaSpinner className="animate-spin text-lg mr-2" />
                  Updating...
                </>
              ) : (
                "Update Fee Head"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditFeeHeadId(null);
                setEditFeeHeadName("");
              }}
              className="flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
            >
              Cancel
            </button>
          </form>
          {updateError && (
            <div id="edit-fee-head-error" className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
              Error: {updateError.status || "Unknown"}
            </div>
          )}
        </div>
      )}

      {/* Fee Heads Table */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Fee Heads List</h3>
        {isFeeHeadLoading ? (
          <p className="p-4 text-[#441a05]/70">Loading...</p>
        ) : feeHeadError ? (
          <p className="p-4 text-red-400">Error: {feeHeadError.status || "Unknown"}</p>
        ) : feeHeads.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">No fee heads available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    Serial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    Fee Head
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {feeHeads.map((feeHead, index) => (
                  <tr key={feeHead.sl} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{feeHead.sl}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{feeHead.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditClick(feeHead)}
                        className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        aria-label={`Edit ${feeHead.name}`}
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(feeHead.id)}
                        className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                        aria-label={`Delete ${feeHead.name}`}
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
          <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            {isDeleting ? "Deleting..." : `Error: ${deleteError?.status || "Unknown"}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFeeHead;