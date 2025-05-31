import React, { useState } from "react";
import {
  useGetStudentListApIQuery,
} from "../../redux/features/api/student/studentListApi";
import {
  useGetBehaviorTypeApiQuery,
} from "../../redux/features/api/behavior/behaviorTypeApi";

import {
  useGetclassConfigApiQuery,
} from "../../redux/features/api/class/classConfigApi";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useCreateBehaviorMarksApiMutation, useDeleteBehaviorMarksApiMutation, useGetBehaviorMarksApiQuery, useUpdateBehaviorMarksApiMutation } from "../../redux/features/api/behavior/behaviorMarksApi";

const BehaviorMarks = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBehavior, setSelectedBehavior] = useState("");
  const [marks, setMarks] = useState("");
  const [editMarkId, setEditMarkId] = useState(null);
  const [editMarks, setEditMarks] = useState("");

  // API hooks
  const { data: studentsList, isLoading: isStudentLoading, error: studentError } = useGetStudentListApIQuery();
  const { data: behaviorList, isLoading: behaviorIsLoading, error: behaviorError } = useGetBehaviorTypeApiQuery();
  const { data: classConfig, isLoading: isConfigLoading, error: configError } = useGetclassConfigApiQuery();
  const { data: behaviorMarksList, isLoading: marksLoading, error: marksError } = useGetBehaviorMarksApiQuery();
  const [createBehaviorMarks, { isLoading: isCreating, error: createError }] = useCreateBehaviorMarksApiMutation();
  const [updateBehaviorMarks, { isLoading: isUpdating, error: updateError }] = useUpdateBehaviorMarksApiMutation();
  const [deleteBehaviorMarks, { isLoading: isDeleting, error: deleteError }] = useDeleteBehaviorMarksApiMutation();

  // Filter students by selected class
  const filteredStudents = studentsList?.students?.filter((student) => student.class_id === selectedClass) || [];

  // Filter active behavior types
  const activeBehaviorTypes = behaviorList?.filter((bt) => bt.is_active) || [];

  // Get max marks for selected behavior type
  const selectedBehaviorType = activeBehaviorTypes.find((bt) => bt.id === selectedBehavior);
  const maxMarks = selectedBehaviorType?.obtain_mark || 0;

  // Handle form submission for adding behavior marks
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedStudent || !selectedBehavior || !marks) {
      alert("Please fill all fields.");
      return;
    }
    if (Number(marks) > maxMarks) {
      alert(`Marks cannot exceed ${maxMarks}`);
      return;
    }
    if (Number(marks) < 0) {
      alert("Marks cannot be negative");
      return;
    }

    try {
      const payload = {
        mark: Number(marks),
        student_id: selectedStudent,
        behavior_type: selectedBehavior,
      };
      await createBehaviorMarks(payload).unwrap();
      alert("Behavior marks added successfully!");
      setSelectedClass("");
      setSelectedStudent("");
      setSelectedBehavior("");
      setMarks("");
    } catch (err) {
      console.error("Error creating behavior marks:", err);
      alert(`Failed to add behavior marks: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle edit button click
  const handleEditClick = (mark) => {
    setEditMarkId(mark.id);
    setEditMarks(mark.mark.toString());
    setSelectedStudent(mark.student_id); // Adjusted to use student_id
    setSelectedBehavior(mark.behavior_type);
    const student = studentsList?.students?.find((s) => s.id === mark.student_id);
    setSelectedClass(student?.class_id || "");
  };

  // Handle update behavior marks
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editMarks || !selectedStudent || !selectedBehavior) {
      alert("Please fill all fields.");
      return;
    }
    if (Number(editMarks) > maxMarks) {
      alert(`Marks exceed ${maxMarks}`);
      return;
    }
    if (Number(editMarks) < 0) {
      alert("Marks cannot be negative");
      return;
    }

    try {
      const payload = {
        id: editMarkId,
        mark: Number(editMarks),
        student_id: selectedStudent,
        behavior_type: selectedBehavior,
      };
      await updateBehaviorMarks(payload).unwrap();
      alert("Behavior marks updated successfully!");
      setEditMarkId(null);
      setEditMarks("");
      setSelectedStudent("");
      setSelectedBehavior("");
      setSelectedClass("");
    } catch (err) {
      console.error("Error updating behavior marks:", err);
      alert(`Failed to update behavior marks: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Handle delete behavior marks
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this behavior mark?")) {
      try {
        await deleteBehaviorMarks(id).unwrap();
        alert("Behavior mark deleted successfully!");
      } catch (err) {
        console.error("Error deleting behavior mark:", err);
        alert(`Failed to delete behavior mark: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
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
          <h2 className="text-3xl font-bold text-[#441a05] tracking-tight">Add Behavior Marks</h2>
        </div>

        {/* Form to Add Behavior Marks */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Add New Behavior Marks</h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStudent("");
              }}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating || isConfigLoading}
            >
              <option value="">Select Class</option>
              {classConfig?.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={!selectedClass || isCreating || isStudentLoading}
            >
              <option value="">Select Student</option>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))
              ) : (
                <option disabled>No students found for this class</option>
              )}
            </select>
            <select
              value={selectedBehavior}
              onChange={(e) => setSelectedBehavior(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={!selectedStudent || isCreating || behaviorIsLoading}
            >
              <option value="">Select Behavior Type</option>
              {activeBehaviorTypes.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                placeholder="Enter marks"
                disabled={!selectedBehavior || isCreating}
                max={maxMarks}
                min={0}
              />
              <span className="text-[#441a05]/70">/ {maxMarks}</span>
            </div>
            <button
              type="submit"
              disabled={isCreating}
              title="Add behavior marks"
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isCreating ? "cursor-not-allowed" : "hover:text-white hover:shadow-md"
              }`}
            >
              {isCreating ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Adding...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>Add Marks</span>
                </span>
              )}
            </button>
          </form>
          {createError && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              Error: {createError.status || "Unknown"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
          {filteredStudents.length === 0 && selectedClass && !isStudentLoading && (
            <div
              className="mt-4 text-yellow-400 bg-yellow-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              No students found for the selected class. Please check if students are assigned to this class.
            </div>
          )}
        </div>

        {/* Edit Behavior Marks Form */}
        {editMarkId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Edit Behavior Marks</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStudent("");
                }}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isUpdating || isConfigLoading}
              >
                <option value="">Select Class</option>
                {classConfig?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={!selectedClass || isUpdating || isStudentLoading}
              >
                <option value="">Select Student</option>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No students found for this class</option>
                )}
              </select>
              <select
                value={selectedBehavior}
                onChange={(e) => setSelectedBehavior(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={!selectedStudent || isUpdating || behaviorIsLoading}
              >
                <option value="">Select Behavior Type</option>
                {activeBehaviorTypes.map((bt) => (
                  <option key={bt.id} value={bt.id}>
                    {bt.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={editMarks}
                  onChange={(e) => setEditMarks(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="Edit marks"
                  disabled={!selectedBehavior || isUpdating}
                  max={maxMarks}
                  min={0}
                />
                <span className="text-[#441a05]/70">/ {maxMarks}</span>
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                title="Update behavior marks"
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
                  <span>Update Marks</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMarkId(null);
                  setEditMarks("");
                  setSelectedStudent("");
                  setSelectedBehavior("");
                  setSelectedClass("");
                }}
                title="Cancel editing"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                Cancel
              </button>
            </form>
            {updateError && (
              <div
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                Error: {updateError.status || "Unknown"} - {JSON.stringify(updateError.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Behavior Marks Cards */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Behavior Marks List</h3>
          {marksLoading ? (
            <p className="p-4 text-[#441a05]/70">Loading behavior marks...</p>
          ) : marksError ? (
            <p className="p-4 text-red-400">
              Error loading behavior marks: {marksError.status || "Unknown"} -{" "}
              {JSON.stringify(marksError.data || {})}
            </p>
          ) : behaviorMarksList?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">No behavior marks available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {behaviorMarksList?.map((mark, index) => {
                const student = studentsList?.students?.find((s) => s.id === mark.student_id);
                const behavior = behaviorList?.find((b) => b.id === mark.behavior_type);
                const classInfo = classConfig?.find((c) => c.id === student?.class_id);
                return (
                  <div
                    key={mark.id}
                    className="bg-white/5 p-6 rounded-lg shadow-md animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <h4 className="text-lg font-semibold text-[#441a05]">
                      {student?.name || "Unknown Student"}
                    </h4>
                    <p className="text-[#441a05]/70">Class: {classInfo?.class_name || "Not Assigned"}</p>
                    <p className="text-[#441a05]/70">Behavior: {behavior?.name || "Unknown Behavior"}</p>
                    <p className="text-[#441a05]/70">
                      Marks: {mark.mark} / {behavior?.obtain_mark || 0}
                    </p>
                    <p className="text-[#441a05]/70 text-sm">
                      Created: {new Date(mark.created_at).toLocaleString()}
                    </p>
                    <p className="text-[#441a05]/70 text-sm">
                      Updated: {new Date(mark.updated_at).toLocaleString()}
                    </p>
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() => handleEditClick(mark)}
                        title="Edit behavior marks"
                        className="text-[#441a05] hover:text-blue-500 transition-colors duration-300"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(mark.id)}
                        title="Delete behavior marks"
                        className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {(isDeleting || deleteError) && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              {isDeleting
                ? "Deleting behavior marks..."
                : `Error deleting behavior marks: ${deleteError?.status || "Unknown"} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BehaviorMarks;