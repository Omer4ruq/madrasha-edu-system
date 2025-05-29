import React, { useState } from "react";
import { useGetClassListApiQuery } from "../../redux/features/api/classListApi";
import { useGetStudentSectionApiQuery } from "../../redux/features/api/studentSectionApi";
import { useGetStudentShiftApiQuery } from "../../redux/features/api/studentShiftApi";
import { useGetStudentClassApIQuery } from "../../redux/features/api/studentClassApi";
import {
  useCreateClassConfigApiMutation,
  useDeleteClassConfigApiMutation,
  useGetclassConfigApiQuery,
} from "../../redux/features/api/classConfigApi";
import { FaChalkboard, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoBookmark, IoSettings, IoTime } from "react-icons/io5";

const AddClassConfig = () => {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [shiftId, setShiftId] = useState("");

  // Fetch data from APIs
  const {
    data: classData,
    isLoading: classLoading,
    error: classError,
  } = useGetClassListApiQuery();
  const {
    data: sectionData,
    isLoading: sectionLoading,
    error: sectionError,
  } = useGetStudentSectionApiQuery();
  const {
    data: shiftData,
    isLoading: shiftLoading,
    error: shiftError,
  } = useGetStudentShiftApiQuery();
  const {
    data: classList,
    isLoading: isListLoading,
    error: listError,
  } = useGetStudentClassApIQuery();
  const {
    data: configurations,
    isLoading: configLoading,
    error: configError,
  } = useGetclassConfigApiQuery();

  // API mutations
  const [createClassConfig] = useCreateClassConfigApiMutation();
  const [deleteClassConfig] = useDeleteClassConfigApiMutation();

  // Filter active sections and shifts
  const activeSections = sectionData?.filter((sec) => sec.is_active) || [];
  const activeShifts = shiftData?.filter((shf) => shf.is_active) || [];

  // Handle form submission to create a configuration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (classLoading || sectionLoading || shiftLoading || isListLoading) {
      alert("Please wait, data is still loading");
      return;
    }

    if (classError || sectionError || shiftError || listError) {
      alert("Error loading data. Please try again later.");
      return;
    }

    if (!classId || !sectionId || !shiftId) {
      alert("Please select a class, section, and shift");
      return;
    }

    try {
      await createClassConfig({
        is_active: true,
        class_id: parseInt(classId),
        section_id: parseInt(sectionId),
        shift_id: parseInt(shiftId),
      }).unwrap();

      setClassId("");
      setSectionId("");
      setShiftId("");
      alert("Configuration created successfully!");
    } catch (error) {
      console.error("Error creating configuration:", error);
      alert(
        `Failed to create configuration: ${error.status || "Unknown"} - ${JSON.stringify(error.data || {})}`
      );
    }
  };

  // Handle delete configuration
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this configuration?")) {
      try {
        await deleteClassConfig(id).unwrap();
        alert("Configuration deleted successfully!");
      } catch (error) {
        console.error("Error deleting configuration:", error);
        alert(
          `Failed to delete configuration: ${error.status || "Unknown"} - ${JSON.stringify(error.data || {})}`
        );
      }
    }
  };

  return (
    <div className="py-12 w-full relative">
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
          select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23441a05' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.5rem center;
            background-size: 1.5em;
          }
        `}
      </style>

      <div className="mx-auto">
        <div className="flex items-center space-x-4 mb-10 animate-fadeIn">
          <IoSettings className="text-4xl text-[#441a05]" />
          <h2 className="text-3xl font-bold text-[#441a05] tracking-tight">
            Class Configuration
          </h2>
        </div>

        {/* Form to Create Configuration */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoSettings className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              Create New Configuration
            </h3>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {/* Class Dropdown */}
            <div className="relative">
              <FaChalkboard
                className="absolute left-3 top-[10px] transform -translate-y-1/2 text-[#441a05] w-5 h-5 animate-scaleIn"
                title="Select class"
              />
              <select
                id="classSelect"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-transparent text-[#441a05] pl-10 pr-8 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                disabled={classLoading || isListLoading}
                aria-label="Select Class"
                aria-describedby={classError ? "class-error" : undefined}
              >
                <option value="" disabled className="bg-black/10 backdrop-blur-sm">
                  Select a class
                </option>
                {classList?.map((cls) => (
                  <option key={cls.id} value={cls.id} className="bg-black/10 backdrop-blur-sm">
                    {cls.student_class?.name || "N/A"}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Dropdown */}
            <div className="relative">
              <IoBookmark
                className="absolute left-3 top-[10px] transform -translate-y-1/2 text-[#441a05] w-5 h-5 animate-scaleIn"
                title="Select section"
              />
              <select
                id="sectionSelect"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full bg-transparent text-[#441a05] pl-10 pr-8 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                disabled={sectionLoading || activeSections.length === 0}
                aria-label="Select Section"
                aria-describedby={sectionError ? "section-error" : undefined}
              >
                <option value="" disabled className="backdrop-blur-sm bg-black/10">
                  Select a section
                </option>
                {activeSections.map((sec) => (
                  <option key={sec.id} value={sec.id} className="backdrop-blur-sm bg-black/10">
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Dropdown */}
            <div className="relative">
              <IoTime
                className="absolute left-3 top-[10px] transform -translate-y-1/2 text-[#441a05] w-5 h-5 animate-scaleIn"
                title="Select shift"
              />
              <select
                id="shiftSelect"
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full bg-transparent text-[#441a05] pl-10 pr-8 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                disabled={shiftLoading || activeShifts.length === 0}
                aria-label="Select Shift"
                aria-describedby={shiftError ? "shift-error" : undefined}
              >
                <option value="" disabled className="backdrop-blur-sm bg-black/10">
                  Select a shift
                </option>
                {activeShifts.map((shf) => (
                  <option key={shf.id} value={shf.id} className="backdrop-blur-sm bg-black/10">
                    {shf.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={configLoading}
              title="Add new configuration"
              className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                configLoading ? "cursor-not-allowed opacity-60" : "hover:text-white btn-glow"
              }`}
            >
              {configLoading ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Adding...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>Add Configuration</span>
                </span>
              )}
            </button>
          </form>

          {/* Error Messages */}
          {(classError || sectionError || shiftError || listError || configError) && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              {classError && (
                <p id="class-error">
                  Error loading classes: {JSON.stringify(classError)}
                </p>
              )}
              {sectionError && (
                <p id="section-error">
                  Error loading sections: {JSON.stringify(sectionError)}
                </p>
              )}
              {shiftError && (
                <p id="shift-error">
                  Error loading shifts: {JSON.stringify(shiftError)}
                </p>
              )}
              {listError && (
                <p id="list-error">
                  Error loading class list: {JSON.stringify(listError)}
                </p>
              )}
              {configError && (
                <p id="config-error">
                  Error loading configurations: {JSON.stringify(configError)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Configurations Table */}
        <div className="bg-black/10 px-5 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] border border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
            Configurations List
          </h3>
          {classLoading || sectionLoading || shiftLoading || isListLoading || configLoading ? (
            <p className="p-4 text-[#441a05]/70">Loading data...</p>
          ) : !configurations || configurations.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">No configurations available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Shift
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {configurations.map((config, index) => (
                    <tr
                      key={config.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {config.class_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {config.section_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {config.shift_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(config.id)}
                          title="Delete configuration"
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
        </div>
      </div>
    </div>
  );
};

export default AddClassConfig;