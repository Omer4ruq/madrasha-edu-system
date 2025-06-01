import React, { useState } from "react";

import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useCreateMealsNameApiMutation, useDeleteMealsNameApiMutation, useGetMealsNameApiQuery, useUpdateMealsNameApiMutation } from "../../redux/features/api/meal/mealsNameApi";

const AddMealsType = () => {
  const [mealName, setMealName] = useState("");
  const [editMealId, setEditMealId] = useState(null);
  const [editMealName, setEditMealName] = useState("");

  // API hooks
  const {
    data: mealTypes,
    isLoading: isMealsLoading,
    error: mealsError,
  } = useGetMealsNameApiQuery();
  const [createMeal, { isLoading: isCreating, error: createError }] = useCreateMealsNameApiMutation();
  const [updateMeal, { isLoading: isUpdating, error: updateError }] = useUpdateMealsNameApiMutation();
  const [deleteMeal, { isLoading: isDeleting, error: deleteError }] = useDeleteMealsNameApiMutation();

  // Handle form submission for adding new meal type
  const handleSubmitMeal = async (e) => {
    e.preventDefault();
    if (!mealName.trim()) {
      alert("Please enter a meal type name");
      return;
    }
    if (mealTypes?.some((mt) => mt.name.toLowerCase() === mealName.toLowerCase())) {
      alert("This meal type already exists!");
      return;
    }

    try {
      const payload = {
        name: mealName.trim(),
        is_active: true,
      };
      await createMeal(payload).unwrap();
      alert("Meal type created successfully!");
      setMealName("");
    } catch (err) {
      console.error("Error creating meal type:", err);
      alert(`Failed to create meal type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle edit button click
  const handleEditClick = (meal) => {
    setEditMealId(meal.id);
    setEditMealName(meal.name);
  };

  // Handle update meal type
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editMealName.trim()) {
      alert("Please enter a meal type name");
      return;
    }

    try {
      const payload = {
        id: editMealId,
        name: editMealName.trim(),
        is_active: mealTypes.find((mt) => mt.id === editMealId)?.is_active || true,
      };
      await updateMeal(payload).unwrap();
      alert("Meal type updated successfully!");
      setEditMealId(null);
      setEditMealName("");
    } catch (err) {
      console.error("Error updating meal type:", err);
      alert(`Failed to update meal type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (meal) => {
    try {
      const payload = {
        id: meal.id,
        name: meal.name,
        is_active: !meal.is_active,
      };
      await updateMeal(payload).unwrap();
      alert(`Meal type ${meal.name} is now ${!meal.is_active ? "active" : "inactive"}!`);
    } catch (err) {
      console.error("Error toggling meal type active status:", err);
      alert(`Failed to toggle active status: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle delete meal type
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this meal type?")) {
      try {
        await deleteMeal(id).unwrap();
        alert("Meal type deleted successfully!");
      } catch (err) {
        console.error("Error deleting meal type:", err);
        alert(`Failed to delete meal type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
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
          <h2 className="text-3xl font-bold text-[#441a05] tracking-tight">Add Meal Type</h2>
        </div>

        {/* Form to Add Meal Type */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Add New Meal Type</h3>
          </div>
          <form onSubmit={handleSubmitMeal} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <input
              type="text"
              id="mealName"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Enter meal type (e.g., Breakfast)"
              disabled={isCreating}
              aria-describedby={createError ? "meal-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="Create a new meal type"
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
                  <span>Create Meal Type</span>
                </span>
              )}
            </button>
          </form>
          {createError && (
            <div
              id="meal-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              Error: {createError.status || "Unknown"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Meal Form */}
        {editMealId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Edit Meal Type</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editMealName"
                value={editMealName}
                onChange={(e) => setEditMealName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="Edit meal type (e.g., Breakfast)"
                disabled={isUpdating}
                aria-label="Edit Meal Type"
                aria-describedby="edit-meal-error"
              />
              <button
                type="submit"
                disabled={isUpdating}
                title="Update meal type"
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
                  <span>Update Meal Type</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMealId(null);
                  setEditMealName("");
                }}
                title="Cancel editing"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                Cancel
              </button>
            </form>
            {updateError && (
              <div
                id="edit-meal-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                Error: {updateError.status || "Unknown"} - {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Meal Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Meal Types List</h3>
          {isMealsLoading ? (
            <p className="p-4 text-[#441a05]/70">Loading meal types...</p>
          ) : mealsError ? (
            <p className="p-4 text-red-400">
              Error loading meal types: {mealsError.status || "Unknown"} -{" "}
              {JSON.stringify(mealsError.data || {})}
            </p>
          ) : mealTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">No meal types available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Meal Type
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
                  {mealTypes?.map((meal, index) => (
                    <tr
                      key={meal.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {meal.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={meal.is_active}
                            onChange={() => handleToggleActive(meal)}
                            className="hidden"
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                              meal.is_active
                                ? "bg-[#DB9E30] border-[#DB9E30]"
                                : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                            }`}
                          >
                            {meal.is_active && (
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
                        {new Date(meal.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(meal.updated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(meal)}
                          title="Edit meal type"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(meal.id)}
                          title="Delete meal type"
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
                ? "Deleting meal type..."
                : `Error deleting meal type: ${deleteError?.status || "Unknown"} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMealsType;