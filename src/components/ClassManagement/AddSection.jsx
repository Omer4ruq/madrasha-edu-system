import React, { useState } from "react";
import {
  useCreateStudentSectionApiMutation,
  useGetStudentSectionApiQuery,
  useGetStudentSectionApiByIdQuery,
  useDeleteStudentSectionApiMutation,
  useUpdateStudentSectionApiMutation,
} from "../../redux/features/api/studentSectionApi";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle, IoSchool } from "react-icons/io5";

const AddSection = () => {
  const [sectionName, setSectionName] = useState("");
  const [editSectionId, setEditSectionId] = useState(null);
  const [editSectionName, setEditSectionName] = useState("");

  // API hooks
  const {
    data: sectionData,
    isLoading: isSectionLoading,
    error: sectionDataError,
  } = useGetStudentSectionApiQuery();
  const [createSection, { isLoading, error }] =
    useCreateStudentSectionApiMutation();
  const [updateSection] = useUpdateStudentSectionApiMutation();
  const [deleteSection] = useDeleteStudentSectionApiMutation();
  const { data: sectionByIdData } = useGetStudentSectionApiByIdQuery(
    editSectionId,
    { skip: !editSectionId }
  );

  // Handle form submission for creating a new section
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      alert("Please enter a section name");
      return;
    }

    try {
      const payload = {
        name: sectionName.trim(),
        is_active: true,
      };
      await createSection(payload).unwrap();
      alert("Section created successfully!");
      setSectionName("");
    } catch (err) {
      console.error("Error creating section:", err);
      alert(
        `Failed to create section: ${
          err.status || "Unknown error"
        } - ${JSON.stringify(err.data || {})}`
      );
    }
  };

  // Handle edit button click
  const handleEditClick = (section) => {
    setEditSectionId(section.id);
    setEditSectionName(section.name);
  };

  // Handle update section
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editSectionName.trim()) {
      alert("Please enter a section name");
      return;
    }

    try {
      const payload = {
        id: editSectionId,
        name: editSectionName.trim(),
        is_active: sectionByIdData?.is_active || true,
      };
      await updateSection(payload).unwrap();
      alert("Section updated successfully!");
      setEditSectionId(null);
      setEditSectionName("");
    } catch (err) {
      console.error("Error updating section:", err);
      alert(
        `Failed to update section: ${
          err.status || "Unknown error"
        } - ${JSON.stringify(err.data || {})}`
      );
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (section) => {
    try {
      const payload = {
        id: section.id,
        name: section.name,
        is_active: !section.is_active, // Toggle the current status
      };
      await updateSection(payload).unwrap();
      alert(
        `Section ${section.name} is now ${
          !section.is_active ? "active" : "inactive"
        }!`
      );
    } catch (err) {
      console.error("Error toggling section active status:", err);
      alert(
        `Failed to toggle active status: ${
          err.status || "Unknown error"
        } - ${JSON.stringify(err.data || {})}`
      );
    }
  };

  // Handle delete section
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      try {
        await deleteSection(id).unwrap();
        alert("Section deleted successfully!");
      } catch (err) {
        console.error("Error deleting section:", err);
        alert(
          `Failed to delete section: ${
            err.status || "Unknown error"
          } - ${JSON.stringify(err.data || {})}`
        );
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

      /* Custom Scrollbar */
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
          <IoSchool className="text-4xl text-[#441a05]" />
          <h2 className="text-3xl font-bold text-[#441a05] tracking-tight">
            Add Section
          </h2>
        </div>

        {/* Form to Add Section */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
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
        box-shadow: 0 0 20px rgba(37, 99, 235, 0.4); /* Stronger glow */
      }

      /* Custom Scrollbar */
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

          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              Add New Section
            </h3>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl"
          >
            <input
              type="text"
              id="sectionName"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="Enter section name (e.g., Section A)"
              disabled={isLoading}
              aria-describedby={error ? "section-error" : undefined}
            />

            <button
              type="submit"
              disabled={isLoading}
              title="Create a new section"
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:text-white hover:shadow-md"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Creating...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>Create Section</span>
                </span>
              )}
            </button>
          </form>

          {error && (
            <div
              id="section-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              Error: {error.status || "Unknown"} -{" "}
              {JSON.stringify(error.data || {})}
            </div>
          )}
        </div>

        {/* Edit Section Form (appears when editing) */}
        {editSectionId && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl mb-8 animate-fadeIn">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              Edit Section
            </h3>
            <form onSubmit={handleUpdate} className="flex gap-4 items-center">
              <div className="relative border-2 border-blue-600 rounded-lg p-4 flex-1">
                <label
                  htmlFor="editSectionName"
                  className="absolute -top-3 left-4 bg-white/10 px-2 text-blue-600 text-sm"
                >
                  Section Name
                </label>
                <input
                  type="text"
                  id="editSectionName"
                  value={editSectionName}
                  onChange={(e) => setEditSectionName(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] focus:outline-none placeholder-white/50"
                  placeholder="Edit section name"
                />
              </div>
              <button
                type="submit"
                className="relative inline-flex items-center px-6 py-2 rounded-xl font-medium text-[#441a05] bg-blue-600 hover:bg-blue-700 btn-glow transition-all duration-300 animate-scaleIn"
              >
                Update Section
              </button>
              <button
                type="button"
                onClick={() => setEditSectionId(null)}
                className="relative inline-flex items-center px-6 py-2 rounded-xl font-medium text-[#441a05] bg-gray-500 hover:bg-gray-600 btn-glow transition-all duration-300 animate-scaleIn"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Sections Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh]">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
            Sections List
          </h3>
          {isSectionLoading ? (
            <p className="p-4 text-[#441a05]/70">Loading sections...</p>
          ) : sectionDataError ? (
            <p className="p-4 text-red-400">
              Error loading sections: {sectionDataError.status || "Unknown"} -{" "}
              {JSON.stringify(sectionDataError.data || {})}
            </p>
          ) : sectionData?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">No sections available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Section Name
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
                  {sectionData?.map((section, index) => (
                    <tr
                      key={section.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {section.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={section.is_active}
                            onChange={() => handleToggleActive(section)}
                            className="hidden"
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                              section.is_active
                                ? "bg-[#DB9E30] border-[#DB9E30]"
                                : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                            }`}
                          >
                            {section.is_active && (
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
                        {new Date(section.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(section.updated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(section)}
                          title="Edit section"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(section.id)}
                          title="Delete section"
                          className=""
                        >
                          <FaTrash className="w-5 h-5 text-[#441a05] hover:text-red-500 transition-colors duration-300" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSection;
