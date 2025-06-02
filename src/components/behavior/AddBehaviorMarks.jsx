import React, { useState, useRef } from "react";
import {
  useGetStudentListApIQuery,
} from "../../redux/features/api/student/studentListApi";
import {
  useGetclassConfigApiQuery,
} from "../../redux/features/api/class/classConfigApi";
import { FaSpinner } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

// Placeholder for marks API (replace with actual API)
const useCreateSubjectMarksApiMutation = () => {
  const [createMarks, { isLoading, error }] = React.useState({ isLoading: false, error: null });
  const mutate = async (payload) => {
    // Simulate API call
    console.log("মার্কস সংরক্ষণ করা হচ্ছে:", payload);
    return { data: payload };
  };
  return [mutate, { isLoading, error }];
};

// Placeholder for delete marks API
const useDeleteSubjectMarksApiMutation = () => {
  const [deleteMarks, { isLoading, error }] = React.useState({ isLoading: false, error: null });
  const mutate = async (studentId) => {
    // Simulate API call
    console.log("ছাত্রের মার্কস মুছে ফেলা হচ্ছে:", studentId);
    return { data: { studentId } };
  };
  return [mutate, { isLoading, error }];
};

const AddBehaviorMarks = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [marksInput, setMarksInput] = useState({}); // { studentId: { subjectName: { marks, isEditing } } }
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, studentId: null });
  const inputRefs = useRef({}); // To store input refs for focusing

  // API hooks
  const { data: classConfig, isLoading: isConfigLoading, error: configError } = useGetclassConfigApiQuery();
  const { data: studentsList, isLoading: isStudentLoading, error: studentError } = useGetStudentListApIQuery();
  const [createSubjectMarks, { isLoading: isCreating, error: createError }] = useCreateSubjectMarksApiMutation();
  const [deleteSubjectMarks, { isLoading: isDeleting, error: deleteError }] = useDeleteSubjectMarksApiMutation();

  // Filter students by selected class
  const filteredStudents = studentsList?.students?.filter((student) => student?.class_name === selectedClass) || [];

  // Static subjects list (replace with API if available)
  const subjects = [
    { name: "গণিত", maxMarks: 100 },
    { name: "বিজ্ঞান", maxMarks: 100 },
    { name: "ইংরেজি", maxMarks: 100 },
    { name: "ইতিহাস", maxMarks: 100 },
    { name: "ভূগোল", maxMarks: 100 },
  ];

  // Handle marks input toggle and change
  const handleMarksInput = (studentId, subjectName, value = "", isEditing = false) => {
    setMarksInput((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectName]: { marks: value, isEditing },
      },
    }));
  };

  // Handle Enter key press to move focus to next student's same subject
  const handleKeyDown = (e, studentId, subjectName) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentStudentIndex = filteredStudents.findIndex((s) => s.id === studentId);
      const nextStudent = filteredStudents[currentStudentIndex + 1];
      if (nextStudent) {
        const nextInput = inputRefs.current[`${nextStudent.id}-${subjectName}`];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Handle submit marks for a student
  const handleSubmitMarks = async (studentId) => {
    const studentMarks = marksInput[studentId] || {};
    const subjectMarks = subjects
      .map((subject) => ({
        subject_name: subject.name,
        marks: Number(studentMarks[subject.name]?.marks) || 0,
      }))
      .filter((sm) => sm.marks > 0); // Only include non-zero marks

    if (subjectMarks.length === 0) {
      toast.error("অন্তত একটি মার্ক প্রবেশ করুন।");
      return;
    }

    for (const { marks, subject_name } of subjectMarks) {
      const maxMarks = subjects.find((s) => s.name === subject_name).maxMarks;
      if (marks > maxMarks) {
        toast.error(`${subject_name} এর মার্কস ${maxMarks} এর বেশি হতে পারে না।`);
        return;
      }
      if (marks < 0) {
        toast.error(`${subject_name} এর মার্কস নেগেটিভ হতে পারে না।`);
        return;
      }
    }

    try {
      const payload = {
        student_id: studentId,
        subject_marks: subjectMarks,
      };
      await createSubjectMarks(payload).unwrap();
      toast.success("মার্কস সফলভাবে সংরক্ষিত হয়েছে!");
      setMarksInput((prev) => ({ ...prev, [studentId]: {} })); // Clear marks for this student
    } catch (err) {
      console.error("মার্কস সংরক্ষণে ত্রুটি:", err);
      toast.error(`মার্কস সংরক্ষণে ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    }
  };

  // Handle delete marks confirmation
  const handleDeleteMarks = async (studentId) => {
    try {
      await deleteSubjectMarks(studentId).unwrap();
      toast.success("মার্কস সফলভাবে মুছে ফেলা হয়েছে!");
      setMarksInput((prev) => ({ ...prev, [studentId]: {} })); // Clear marks for this student
      setDeleteConfirm({ isOpen: false, studentId: null });
    } catch (err) {
      console.error("মার্কস মুছতে ত্রুটি:", err);
      toast.error(`মার্কস মুছতে ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    }
  };

  // Open delete confirmation modal
  const openDeleteConfirm = (studentId) => {
    setDeleteConfirm({ isOpen: true, studentId });
  };

  // Close delete confirmation modal
  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, studentId: null });
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
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out forwards;
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
          }
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
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
          .sticky-col {
            position: sticky;
            background: #DB9E30;
            z-index: 10;
          }
          .sticky-col-first {
            left: 0;
          }
          .sticky-col-second {
            left: 200px;
          }
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 50;
          }
          .modal-content {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #fff;
            border-top-left-radius: 1rem;
            border-top-right-radius: 1rem;
            padding: 1.5rem;
            z-index: 60;
            max-width: 500px;
            margin: 0 auto;
          }
        `}
      </style>



      <div className="">
        {/* Class Selection */}
        <div className="bg-black/10 backdrop-blur-sm borderດ
        border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">শ্রেণি নির্বাচন করুন</h3>
          </div>
          <div className="max-w-md">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isConfigLoading}
            >
              <option value="">শ্রেণি নির্বাচন করুন</option>
              {classConfig?.map((cls) => (
                <option key={cls.id} value={cls.class_name}>
                  {cls.class_name}
                </option>
              ))}
            </select>
            {configError && (
              <div
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                শ্রেণি লোড করতে ত্রুটি: {configError.status || "অজানা"} -{" "}
                {JSON.stringify(configError.data || {})}
              </div>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-x-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">ছাত্রদের মার্কস</h3>
          {isStudentLoading || isConfigLoading ? (
            <p className="p-4 text-[#441a05]/70">ছাত্রদের তথ্য লোড হচ্ছে...</p>
          ) : studentError ? (
            <p className="p-4 text-red-400">
              ছাত্রদের তথ্য লোড করতে ত্রুটি: {studentError.status || "অজানা"} -{" "}
              {JSON.stringify(studentError.data || {})}
            </p>
          ) : !selectedClass ? (
            <p className="p-4 text-[#441a05]/70">ছাত্রদের দেখতে একটি শ্রেণি নির্বাচন করুন।</p>
          ) : filteredStudents.length === 0 ? (
            <p className="p-4 text-yellow-400 bg-yellow-500/10 rounded-lg">
              নির্বাচিত শ্রেণির জন্য কোনো ছাত্র পাওয়া যায়নি। শ্রেণি নিয়োগ পরীক্ষা করুন।
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20 table-fixed">
                <thead className="bg-white/5">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider sticky-col sticky-col-first"
                      style={{ minWidth: "200px" }}
                    >
                      ছাত্রের নাম
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider sticky-col sticky-col-second"
                      style={{ minWidth: "100px" }}
                    >
                      রোল নম্বর
                    </th>
                    {subjects.map((subject) => (
                      <th
                        key={subject.name}
                        className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
                        style={{ minWidth: "150px" }}
                      >
                        {subject.name} ({subject.maxMarks} এর মধ্যে)
                      </th>
                    ))}
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
                      style={{ minWidth: "150px" }}
                    >
                      ক্রিয়াকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05] sticky-col sticky-col-first"
                        style={{ minWidth: "200px" }}
                      >
                        {student.name}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05] sticky-col sticky-col-second"
                        style={{ minWidth: "100px" }}
                      >
                        {student.roll_no}
                      </td>
                      {subjects.map((subject) => {
                        const studentMarks = marksInput[student.id]?.[subject.name] || {};
                        return (
                          <td
                            key={subject.name}
                            className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]"
                            style={{ minWidth: "150px" }}
                          >
                            <input
                              type="number"
                              value={studentMarks.marks || ""}
                              onChange={(e) =>
                                handleMarksInput(student.id, subject.name, e.target.value, true)
                              }
                              onBlur={() =>
                                handleMarksInput(student.id, subject.name, studentMarks.marks, false)
                              }
                              onKeyDown={(e) => handleKeyDown(e, student.id, subject.name)}
                              ref={(el) => (inputRefs.current[`${student.id}-${subject.name}`] = el)}
                              className="w-20 bg-transparent text-[#441a05] placeholder:text-[#441a05] pl-3 py-1 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                              placeholder="মার্কস"
                              min={0}
                              max={subject.maxMarks}
                            />
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ minWidth: "150px" }}>
                        <button
                          onClick={() => handleSubmitMarks(student.id)}
                          disabled={isCreating}
                          className={`px-4 py-1 rounded-lg font-medium bg-[#441a05] text-[#DB9E30] hover:bg-[#DB9E30] hover:text-[#441a05] transition-all duration-300 animate-scaleIn mr-2 ${
                            isCreating ? "cursor-not-allowed" : ""
                          }`}
                        >
                          {isCreating ? <FaSpinner className="animate-spin text-lg" /> : "জমা দিন"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {createError && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              মার্কস সংরক্ষণে ত্রুটি: {createError.status || "অজানা"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
          {deleteError && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              মার্কস মুছতে ত্রুটি: {deleteError.status || "অজানা"} - {JSON.stringify(deleteError.data || {})}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm.isOpen && (
          <>
            <div className="modal-overlay" onClick={closeDeleteConfirm}></div>
            <div className="modal-content animate-slideUp">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#441a05]">মুছে ফেলার নিশ্চিতকরণ</h3>
                <button onClick={closeDeleteConfirm}>
                  <IoClose className="text-2xl text-[#441a05]" />
                </button>
              </div>
              <p className="text-[#441a05] mb-6">
                আপনি কি এই ছাত্রের সকল মার্কস মুছে ফেলতে নিশ্চিত?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeDeleteConfirm}
                  className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-[#441a05] hover:bg-gray-300 transition-all duration-300"
                >
                  বাতিল
                </button>
                <button
                  onClick={() => handleDeleteMarks(deleteConfirm.studentId)}
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-all duration-300 ${
                    isDeleting ? "cursor-not-allowed" : ""
                  }`}
                >
                  {isDeleting ? <FaSpinner className="animate-spin text-lg" /> : "মুছুন"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddBehaviorMarks;