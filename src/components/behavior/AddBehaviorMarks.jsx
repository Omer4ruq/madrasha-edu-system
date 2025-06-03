import React, { useState, useRef, useEffect } from "react";
import {
  useGetStudentListApIQuery,
} from "../../redux/features/api/student/studentListApi";
import {
  useGetclassConfigApiQuery,
} from "../../redux/features/api/class/classConfigApi";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";
import { IoAddCircle, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import {
  useCreateBehaviorReportApiMutation,
  useGetBehaviorReportApiQuery,
  useUpdateBehaviorReportApiMutation,
} from "../../redux/features/api/behavior/behaviorReportApi";
import { useGetBehaviorTypeApiQuery } from "../../redux/features/api/behavior/behaviorTypeApi";
import { useGetExamApiQuery } from "../../redux/features/api/exam/examApi";
import { useGetStudentActiveApiQuery } from "../../redux/features/api/student/studentActiveApi";

const AddBehaviorMarks = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [marksInput, setMarksInput] = useState({});
  const [existingMarks, setExistingMarks] = useState({}); // Store existing marks from database
  const [savingStatus, setSavingStatus] = useState({}); // Track saving status for each input
  const inputRefs = useRef({});

  // API hooks
  const { data: classConfig, isLoading: isConfigLoading, error: configError } = useGetclassConfigApiQuery();
  const { data: studentsList, isLoading: isStudentLoading, error: studentError } = useGetStudentActiveApiQuery();
  const { data: updatedmarks, isLoading: isMarksLoading, error: marksError } =   useGetBehaviorReportApiQuery();
  const { data: examlist, isLoading: isExamLoading, error: examError } = useGetExamApiQuery();
  const [createBehaviorReportMarks, { isLoading: isCreating }] = useCreateBehaviorReportApiMutation();
  const [updateBehaviorReportMarks, { isLoading: isUpdating }] = useUpdateBehaviorReportApiMutation();
  const {
    data: behaviorTypes,
    isLoading: isBehaviorLoading,
    error: behaviorError,
  } = useGetBehaviorTypeApiQuery();

  // Filter students by selected class
  const filteredStudents = studentsList?.filter((student) => student?.class_name === selectedClass) || [];
console.log(updatedmarks)
  // Fetch existing marks when class and exam are selected
  useEffect(() => {
    const fetchExistingMarks = async () => {
      if (selectedClass && selectedExam) {
        try {
          // You'll need to create this API endpoint to fetch existing marks
          // const response = await fetch(`${BASE_URL}/behavior-report/get-by-exam/${selectedExam}/`);
          // const data = await response.json();
          // setExistingMarks(data);
          
          // For now, initialize empty existing marks
          setExistingMarks({});
        } catch (error) {
          console.error("Error fetching existing marks:", error);
        }
      }
    };

    fetchExistingMarks();
  }, [selectedClass, selectedExam]);

  // Handle marks input with auto-save
  const handleMarksInput = (studentId, behaviorType, value) => {
    setMarksInput((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [behaviorType]: { marks: value, isEditing: true },
      },
    }));
  };

  // Handle comment input
  const handleCommentInput = (studentId, value) => {
    setMarksInput((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        comment: value,
      },
    }));
  };

  // Auto-save marks when Enter is pressed
  const handleKeyDown = async (e, studentId, behaviorType) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      if (!selectedExam) {
        toast.error("পরীক্ষা নির্বাচন করুন।");
        return;
      }

      await handleAutoSave(studentId, behaviorType);
      
      // Move focus to next student's same behavior type
      const currentStudentIndex = filteredStudents.findIndex((s) => s.id === studentId);
      const nextStudent = filteredStudents[currentStudentIndex + 1];
      if (nextStudent) {
        const nextInput = inputRefs.current[`${nextStudent.id}-${behaviorType}`];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Auto-save function
  const handleAutoSave = async (studentId, behaviorType) => {
    const inputKey = `${studentId}-${behaviorType}`;
    const studentMarks = marksInput[studentId] || {};
    const behaviorMarkData = studentMarks[behaviorType];
    
    if (!behaviorMarkData || !behaviorMarkData.marks) {
      return;
    }

    const mark = Number(behaviorMarkData.marks);
    const behavior = behaviorTypes.find((b) => b.name === behaviorType);
    
    if (!behavior) return;

    // Validation
    if (mark > behavior.obtain_mark) {
      toast.error(`${behavior.name} এর মার্কস ${behavior.obtain_mark} এর বেশি হতে পারে না।`);
      return;
    }
    if (mark < 0) {
      toast.error(`${behavior.name} এর মার্কস নেগেটিভ হতে পারে না।`);
      return;
    }

    // Set saving status
    setSavingStatus(prev => ({ ...prev, [inputKey]: 'saving' }));

    try {
      const behaviorMarks = [{
        student_id: studentId,
        behavior_type: behavior.id,
        mark: mark,
      }];

      const payload = [{
        exam_name_id: Number(selectedExam),
        comment: studentMarks.comment || "",
        behavior_marks: behaviorMarks,
      }];

      // Check if this is an update or create operation
      const existingMark = existingMarks[studentId]?.[behaviorType];
      
      if (existingMark) {
        // Update existing mark
        await updateBehaviorReportMarks({ id: existingMark.id, ...payload[0] }).unwrap();
      } else {
        // Create new mark
        await createBehaviorReportMarks(payload).unwrap();
      }

      // Update existing marks state
      setExistingMarks(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [behaviorType]: {
            id: existingMark?.id || Date.now(), // Use actual ID from response
            marks: mark,
            comment: studentMarks.comment || ""
          }
        }
      }));

      // Set success status
      setSavingStatus(prev => ({ ...prev, [inputKey]: 'success' }));
      
      // Clear success status after 2 seconds
      setTimeout(() => {
        setSavingStatus(prev => ({ ...prev, [inputKey]: null }));
      }, 2000);

    } catch (err) {
      console.error("মার্কস সংরক্ষণে ত্রুটি:", err);
      toast.error(`মার্কস সংরক্ষণে ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
      setSavingStatus(prev => ({ ...prev, [inputKey]: 'error' }));
      
      // Clear error status after 3 seconds
      setTimeout(() => {
        setSavingStatus(prev => ({ ...prev, [inputKey]: null }));
      }, 3000);
    }
  };

  // Handle comment save on blur
  const handleCommentBlur = async (studentId) => {
    if (!selectedExam || !marksInput[studentId]?.comment) return;

    try {
      const payload = [{
        exam_name_id: Number(selectedExam),
        comment: marksInput[studentId].comment,
        behavior_marks: [], // Empty array as we're only updating comment
      }];

      const existingRecord = Object.values(existingMarks[studentId] || {})[0];
      
      if (existingRecord) {
        await updateBehaviorReportMarks({ id: existingRecord.id, ...payload[0] }).unwrap();
      } else {
        await createBehaviorReportMarks(payload).unwrap();
      }

      toast.success("মন্তব্য সংরক্ষিত হয়েছে!");
    } catch (err) {
      console.error("মন্তব্য সংরক্ষণে ত্রুটি:", err);
      toast.error("মন্তব্য সংরক্ষণে ব্যর্থ!");
    }
  };

  // Get current marks value (from input or existing)
  const getCurrentMarks = (studentId, behaviorType) => {
    const inputValue = marksInput[studentId]?.[behaviorType]?.marks;
    const existingValue = existingMarks[studentId]?.[behaviorType]?.marks;
    return inputValue !== undefined ? inputValue : existingValue || "";
  };

  // Get current comment value
  const getCurrentComment = (studentId) => {
    const inputValue = marksInput[studentId]?.comment;
    const existingValue = Object.values(existingMarks[studentId] || {})[0]?.comment;
    return inputValue !== undefined ? inputValue : existingValue || "";
  };

  // Get saving status icon
  const getSavingStatusIcon = (studentId, behaviorType) => {
    const inputKey = `${studentId}-${behaviorType}`;
    const status = savingStatus[inputKey];
    
    switch (status) {
      case 'saving':
        return <FaSpinner className="animate-spin text-blue-500 ml-2" />;
      case 'success':
        return <FaCheck className="text-green-500 ml-2" />;
      case 'error':
        return <FaTimes className="text-red-500 ml-2" />;
      default:
        return null;
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
        `}
      </style>

      <div className="">
        {/* Class and Exam Selection */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">শ্রেণি এবং পরীক্ষা নির্বাচন করুন</h3>
          </div>
          <div className="flex space-x-4 max-w-2xl">
            <div className="flex-1">
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
                <div className="mt-2 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
                  শ্রেণি লোড করতে ত্রুটি: {configError.status || "অজানা"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isExamLoading}
              >
                <option value="">পরীক্ষা নির্বাচন করুন</option>
                {examlist?.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
              {examError && (
                <div className="mt-2 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
                  পরীক্ষা লোড করতে ত্রুটি: {examError.status || "অজানা"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-x-auto max-h-[60vh] py-2 px-6">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-[#441a05]">ছাত্রদের মার্কস</h3>
            <div className="text-sm text-[#441a05]/70">
              <span className="bg-blue-100 px-2 py-1 rounded mr-2">💡 Enter চেপে সংরক্ষণ করুন</span>
            </div>
          </div>
          
          {isStudentLoading || isConfigLoading || isExamLoading || isBehaviorLoading ? (
            <p className="p-4 text-[#441a05]/70">ছাত্রদের তথ্য লোড হচ্ছে...</p>
          ) : studentError ? (
            <p className="p-4 text-red-400">
              ছাত্রদের তথ্য লোড করতে ত্রুটি: {studentError.status || "অজানা"}
            </p>
          ) : behaviorError ? (
            <p className="p-4 text-red-400">
              আচরণের ধরন লোড করতে ত্রুটি: {behaviorError.status || "অজানা"}
            </p>
          ) : !selectedClass || !selectedExam ? (
            <p className="p-4 text-[#441a05]/70">ছাত্রদের দেখতে একটি শ্রেণি এবং পরীক্ষা নির্বাচন করুন।</p>
          ) : filteredStudents.length === 0 ? (
            <p className="p-4 text-yellow-400 bg-yellow-500/10 rounded-lg">
              নির্বাচিত শ্রেণির জন্য কোনো ছাত্র পাওয়া যায়নি।
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
                    {behaviorTypes?.map((behavior) => (
                      <th
                        key={behavior.id}
                        className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
                        style={{ minWidth: "180px" }}
                      >
                        {behavior.name} ({behavior.obtain_mark} এর মধ্যে)
                      </th>
                    ))}
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
                      style={{ minWidth: "200px" }}
                    >
                      মন্তব্য
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
                      {behaviorTypes?.map((behavior) => (
                        <td
                          key={behavior.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]"
                          style={{ minWidth: "180px" }}
                        >
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={getCurrentMarks(student.id, behavior.name)}
                              onChange={(e) =>
                                handleMarksInput(student.id, behavior.name, e.target.value)
                              }
                              onKeyDown={(e) => handleKeyDown(e, student.id, behavior.name)}
                              ref={(el) => (inputRefs.current[`${student.id}-${behavior.name}`] = el)}
                              className="w-20 bg-transparent text-[#441a05] placeholder:text-[#441a05] pl-3 py-1 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-1 focus:ring-[#441a05]"
                              placeholder="মার্কস"
                              min={0}
                              max={behavior.obtain_mark}
                            />
                            {getSavingStatusIcon(student.id, behavior.name)}
                          </div>
                        </td>
                      ))}
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]"
                        style={{ minWidth: "200px" }}
                      >
                        <input
                          type="text"
                          value={getCurrentComment(student.id)}
                          onChange={(e) => handleCommentInput(student.id, e.target.value)}
                          onBlur={() => handleCommentBlur(student.id)}
                          className="w-full bg-transparent text-[#441a05] placeholder:text-[#441a05] pl-3 py-1 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 focus:border-[#441a05] focus:ring-1 focus:ring-[#441a05]"
                          placeholder="মন্তব্য (ঐচ্ছিক)"
                        />
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

export default AddBehaviorMarks;