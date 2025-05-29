import React, { useState } from "react";
import {
  useCreateBehaviorTypeApiMutation,
  useGetBehaviorTypeApiQuery,
  useUpdateBehaviorTypeApiMutation,
  useDeleteBehaviorTypeApiMutation,
} from "../../redux/features/api/behaviorTypeApi";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";

const AddBehaviorType = () => {
  const [behavior, setBehavior] = useState("");
  const [marks, setMarks] = useState("");
  const [editBehaviorId, setEditBehaviorId] = useState(null);
  const [editBehaviorName, setEditBehaviorName] = useState("");
  const [editMarks, setEditMarks] = useState("");

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

  // Handle form submission for adding new behavior
  const handleSubmitBehavior = async (e) => {
    e.preventDefault();
    if (!behavior.trim() || !marks.trim()) {
      alert("Please enter both behavior type and marks");
      return;
    }
    if (behaviorTypes?.some((bt) => bt.name.toLowerCase() === behavior.toLowerCase())) {
      alert("This behavior type already exists!");
      return;
    }

    try {
      const payload = {
        name: behavior.trim(),
        obtain_mark: Number(marks),
        is_active: true,
      };
      await createBehavior(payload).unwrap();
      alert("Behavior type created successfully!");
      setBehavior("");
      setMarks("");
    } catch (err) {
      console.error("Error creating behavior:", err);
      alert(`Failed to create behavior: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
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
      alert("Please enter both behavior type and marks");
      return;
    }

    try {
      const payload = {
        id: editBehaviorId,
        name: editBehaviorName.trim(),
        obtain_mark: Number(editMarks),
        is_active: behaviorTypes.find((bt) => bt.id === editBehaviorId)?.is_active || true,
      };
      await updateBehavior(payload).unwrap();
      alert("Behavior type updated successfully!");
      setEditBehaviorId(null);
      setEditBehaviorName("");
      setEditMarks("");
    } catch (err) {
      console.error("Error updating behavior:", err);
      alert(`Failed to update behavior: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (behavior) => {
    try {
      const payload = {
        id: behavior.id,
        name: behavior.name,
        obtain_mark: behavior.obtain_mark,
        is_active: !behavior.is_active,
      };
      await updateBehavior(payload).unwrap();
      alert(`Behavior ${behavior.name} is now ${!behavior.is_active ? "active" : "inactive"}!`);
    } catch (err) {
      console.error("Error toggling behavior active status:", err);
      alert(`Failed to toggle active status: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle delete behavior
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this behavior type?")) {
      try {
        await deleteBehavior(id).unwrap();
        alert("Behavior type deleted successfully!");
      } catch (err) {
        console.error("Error deleting behavior:", err);
        alert(`Failed to delete behavior: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
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

      <div className="">
        <div className="flex items-center space-x-4 mb-10 animate-fadeIn">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h2 className="text-3xl font-bold text-[#441a05] tracking-tight">Add Behavior Type</h2>
        </div>

        {/* Form to Add Behavior Type */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Add New Behavior Type</h3>
          </div>
          <form onSubmit={handleSubmitBehavior} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
            <input
              type="text"
              id="behaviorName"
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Enter behavior type (e.g., Punctuality)"
              disabled={isCreating}
              aria-describedby={createError ? "behavior-error" : undefined}
            />
            <input
              type="number"
              id="marks"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Enter marks (e.g., 10)"
              disabled={isCreating}
              aria-describedby={createError ? "behavior-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="Create a new behavior type"
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
                  <span>Create Behavior</span>
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
              Error: {createError.status || "Unknown"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Behavior Form */}
        {editBehaviorId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Edit Behavior Type</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl">
              <input
                type="text"
                id="editBehaviorName"
                value={editBehaviorName}
                onChange={(e) => setEditBehaviorName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="Edit behavior type (e.g., Punctuality)"
                disabled={isUpdating}
                aria-label="Edit Behavior Type"
                aria-describedby="edit-behavior-error"
              />
              <input
                type="number"
                id="editMarks"
                value={editMarks}
                onChange={(e) => setEditMarks(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="Edit marks (e.g., 10)"
                disabled={isUpdating}
                aria-label="Edit Marks"
                aria-describedby="edit-behavior-error"
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="Update behavior type"
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
                  <span>Update Behavior</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditBehaviorId(null);
                  setEditBehaviorName("");
                  setEditMarks("");
                }}
                title="Cancel editing"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                Cancel
              </button>
            </form>
            {updateError && (
              <div
                id="edit-behavior-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                Error: {updateError.status || "Unknown"} - {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Behavior Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Behavior Types List</h3>
          {isBehaviorLoading ? (
            <p className="p-4 text-[#441a05]/70">Loading behavior types...</p>
          ) : behaviorError ? (
            <p className="p-4 text-red-400">
              Error loading behavior types: {behaviorError.status || "Unknown"} -{" "}
              {JSON.stringify(behaviorError.data || {})}
            </p>
          ) : behaviorTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">No behavior types available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Behavior Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Updated At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Actions
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
                        {new Date(behavior.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(behavior.updated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(behavior)}
                          title="Edit behavior type"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(behavior.id)}
                          title="Delete behavior type"
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
                ? "Deleting behavior type..."
                : `Error deleting behavior: ${deleteError?.status || "Unknown"} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBehaviorType;