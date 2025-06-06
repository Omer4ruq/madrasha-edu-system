import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoSchool } from "react-icons/io5";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { useGetClassListApiQuery } from "../../redux/features/api/class/classListApi";
import {
  useCreateStudentClassApIMutation,
  useGetStudentClassApIQuery,
} from "../../redux/features/api/student/studentClassApi";

const AddClass = () => {
  const navigate = useNavigate();
  const { data: classData, isLoading, error } = useGetClassListApiQuery();
  const {
    data: classList,
    isLoading: isListLoading,
    error: listError,
  } = useGetStudentClassApIQuery();
  console.log("class list of selected", classList)
  const [createClass, { isLoading: isCreating }] =
    useCreateStudentClassApIMutation();
  const [selectedClasses, setSelectedClasses] = useState({});

  useEffect(() => {
    if (classList) {
      const initialSelected = classList.reduce((acc, classItem) => {
        acc[classItem.student_class.id] = true;
        return acc;
      }, {});
      setSelectedClasses(initialSelected);
    }
  }, [classList]);

  const handleToggle = (classId) => {
    setSelectedClasses((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  };

  const handleSubmit = async () => {
    try {
      const existingClassIds = classList
        ? classList.map((item) => item.student_class.id)
        : [];
      const classesToCreate = Object.keys(selectedClasses)
        .filter(
          (classId) =>
            selectedClasses[classId] &&
            !existingClassIds.includes(parseInt(classId))
        )
        .map((classId) => ({
          student_class_id: parseInt(classId),
          is_active: true,
        }));

      if (classesToCreate.length > 0) {
        await Promise.all(
          classesToCreate.map((classData) => createClass(classData).unwrap())
        );
        alert("Selected classes created successfully!");
      } else if (Object.values(selectedClasses).some((v) => v)) {
        alert("All selected classes are already added!");
      } else {
        alert("Please select at least one class");
      }
    } catch (err) {
      console.error("Error creating classes:", err);
      alert(
        `Failed to create classes: ${err.status || "Unknown"} - ${JSON.stringify(
          err.data || {}
        )}`
      );
    }
  };

  const handleViewClasses = () => {
    navigate("/class-management/view-classes/subjects");
  };

  if (isLoading || isListLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-4 p-6 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 animate-fadeIn">
          <FaSpinner className="animate-spin text-3xl text-[#DB9E30]" />
          <span className="text-lg font-medium text-[#441a05]">
            Loading Classes...
          </span>
        </div>
      </div>
    );
  }

  if (error || listError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-500/10 border-l-4 border-red-600 text-red-400 p-6 rounded-2xl shadow-xl max-w-md animate-fadeIn">
          <p className="font-semibold text-lg">Error</p>
          <p className="mt-2">
            {error ? JSON.stringify(error) : JSON.stringify(listError)}
          </p>
        </div>
      </div>
    );
  }

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

      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center animate-fadeIn w-full">
        {/* <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <IoSchool className="text-4xl text-[#441a05]" />
          <h2 className="text-3xl font-bold text-[#441a05] tracking-tight">
            Add Classes
          </h2>
        </div> */}
        {/* <button
          onClick={handleViewClasses}
          className="relative inline-flex items-center px-6 py-3 bg-[#DB9E30] text-[#441a05] font-medium rounded-lg hover:text-white  transition-all duration-300 animate-scaleIn"
        >
          View Classes
        </button> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Select Classes */}
        <div className="lg:col-span-1 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 animate-fadeIn h-full border border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05] border-b border-white/20 pb-2 mb-4">
            Select Classes
          </h3>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {classData?.map((classItem, index) => (
              <div
                key={classItem.id}
                className="flex items-center justify-between p-3 hover:bg-white/20 border border-white/30 rounded-lg transition-colors duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-[#441a05] font-medium">
                  {classItem.name}
                </span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedClasses[classItem.id]}
                    onChange={() => handleToggle(classItem.id)}
                    className="hidden"
                  />
                  <span
                    className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${
                      selectedClasses[classItem.id]
                        ? "bg-[#DB9E30] border-[#DB9E30]"
                        : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                    }`}
                  >
                    {selectedClasses[classItem.id] && (
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
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Classes */}
        <div className="lg:col-span-3 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 animate-fadeIn max-h-[72vh] overflow-y-auto flex flex-col border border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05] border-b border-white/20 pb-2 mb-4">
            Selected Classes
          </h3>
          {Object.keys(selectedClasses).length === 0 ||
          !Object.values(selectedClasses).some((v) => v) ? (
            <p className="text-[#441a05]/70 italic">No classes selected yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
              {Object.keys(selectedClasses)
                .filter((id) => selectedClasses[id])
                .map((id) => {
                  const classItem = classData?.find(
                    (item) => item.id === parseInt(id)
                  );
                  return classItem ? (
                    <div
                      key={id}
                      className="p-3 border border-white/30 rounded-lg flex items-center justify-between animate-scaleIn"
                    >
                      <span className="text-[#441a05] font-medium">
                        {classItem.name}
                      </span>
                      <button
                        onClick={() => handleToggle(id)}
                        title="Remove class"
                        className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  ) : null;
                })}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className={`relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isCreating
                  ? "cursor-not-allowed opacity-60"
                  : "hover:text-white btn-glow"
              }`}
            >
              {isCreating ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Submitting...</span>
                </span>
              ) : (
                "Submit Selected Classes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClass;