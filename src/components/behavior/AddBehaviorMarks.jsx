// import React, { useState } from "react";
// import {
//   useGetStudentListApIQuery,
// } from "../../redux/features/api/student/studentListApi";
// import {
//   useGetclassConfigApiQuery,
// } from "../../redux/features/api/class/classConfigApi";
// import { FaSpinner } from "react-icons/fa";
// import { IoAddCircle } from "react-icons/io5";

// // Placeholder for marks API (replace with actual API)
// const useCreateSubjectMarksApiMutation = () => {
//   const [createMarks, { isLoading, error }] = React.useState({ isLoading: false, error: null });
//   const mutate = async (payload) => {
//     // Simulate API call
//     console.log("Saving marks:", payload);
//     return { data: payload };
//   };
//   return [mutate, { isLoading, error }];
// };

// const AddBehaviorMarks = () => {
//   const [selectedClass, setSelectedClass] = useState("");
//   const [marksInput, setMarksInput] = useState({}); // { studentId: { subjectName: { marks, isEditing } } }

//   // API hooks
//   const { data: classConfig, isLoading: isConfigLoading, error: configError } = useGetclassConfigApiQuery();
//   const { data: studentsList, isLoading: isStudentLoading, error: studentError } = useGetStudentListApIQuery();
//   const [createSubjectMarks, { isLoading: isCreating, error: createError }] = useCreateSubjectMarksApiMutation();

//   // Filter students by selected class
//   const filteredStudents = studentsList?.students?.filter((student) => student?.class_name === selectedClass) || [];

//   // Static subjects list (replace with API if available)
//   const subjects = [
//     { name: "Math", maxMarks: 100 },
//     { name: "Science", maxMarks: 100 },
//     { name: "English", maxMarks: 100 },
//     { name: "History", maxMarks: 100 },
//     { name: "Geography", maxMarks: 100 },
//   ];

//   // Handle marks input toggle and change
//   const handleMarksInput = (studentId, subjectName, value = "", isEditing = false) => {
//     setMarksInput((prev) => ({
//       ...prev,
//       [studentId]: {
//         ...prev[studentId],
//         [subjectName]: { marks: value, isEditing },
//       },
//     }));
//   };

//   // Handle submit marks for a student
//   const handleSubmitMarks = async (studentId) => {
//     const studentMarks = marksInput[studentId] || {};
//     const subjectMarks = subjects
//       .map((subject) => ({
//         subject_name: subject.name,
//         marks: Number(studentMarks[subject.name]?.marks) || 0,
//       }))
//       .filter((sm) => sm.marks > 0); // Only include non-zero marks

//     if (subjectMarks.length === 0) {
//       alert("Please enter at least one mark.");
//       return;
//     }

//     for (const { marks, subject_name } of subjectMarks) {
//       const maxMarks = subjects.find((s) => s.name === subject_name).maxMarks;
//       if (marks > maxMarks) {
//         alert(`Marks for ${subject_name} cannot exceed ${maxMarks}.`);
//         return;
//       }
//       if (marks < 0) {
//         alert(`Marks for ${subject_name} cannot be negative.`);
//         return;
//       }
//     }

//     try {
//       const payload = {
//         student_id: studentId,
//         subject_marks: subjectMarks,
//       };
//       await createSubjectMarks(payload).unwrap();
//       alert("Marks saved successfully!");
//       setMarksInput((prev) => ({ ...prev, [studentId]: {} })); // Clear marks for this student
//     } catch (err) {
//       console.error("Error saving marks:", err);
//       alert(`Failed to save marks: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
//     }
//   };

//   return (
//     <div className="py-8 w-full relative">
//       <style>
//         {`
//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(20px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//           @keyframes scaleIn {
//             from { transform: scale(0.95); opacity: 0; }
//             to { transform: scale(1); opacity: 1; }
//           }
//           .animate-fadeIn {
//             animation: fadeIn 0.6s ease-out forwards;
//           }
//           .animate-scaleIn {
//             animation: scaleIn 0.4s ease-out forwards;
//           }
//           .btn-glow:hover {
//             box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
//           }
//           ::-webkit-scrollbar {
//             width: 8px;
//             height: 8px;
//           }
//           ::-webkit-scrollbar-track {
//             background: transparent;
//           }
//           ::-webkit-scrollbar-thumb {
//             background: rgba(22, 31, 48, 0.26);
//             border-radius: 10px;
//           }
//           ::-webkit-scrollbar-thumb:hover {
//             background: rgba(10, 13, 21, 0.44);
//           }
//           .sticky-col {
//             position: sticky;
//             background: rgba(255, 255, 255, 0.05);
//             z-index: 10;
//           }
//           .sticky-col-first {
//             left: 0;
//           }
//           .sticky-col-second {
//             left: 200px; /* Adjust based on first column width */
//           }
//         `}
//       </style>

//       <div className="">
//         {/* <div className="flex items-center space-x-4 mb-10 animate-fadeIn">
//           <IoAddCircle className="text-4xl text-[#441a05]" />
//           <h2 className="text-3xl font-bold text-[#441a05] tracking-tight">Add Subject Marks</h2>
//         </div> */}

//         {/* Class Selection */}
//         <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
//           <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
//             <IoAddCircle className="text-4xl text-[#441a05]" />
//             <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Select Class</h3>
//           </div>
//           <div className="max-w-md">
//             <select
//               value={selectedClass}
//               onChange={(e) => setSelectedClass(e.target.value)}
//               className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
//               disabled={isConfigLoading}
//             >
//               <option value="">Select Class</option>
//               {classConfig?.map((cls) => (
//                 <option key={cls.id} value={cls.class_name}>
//                   {cls.class_name}
//                 </option>
//               ))}
//             </select>
//             {configError && (
//               <div
//                 className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
//                 style={{ animationDelay: "0.4s" }}
//               >
//                 Error loading classes: {configError.status || "Unknown"} -{" "}
//                 {JSON.stringify(configError.data || {})}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Students Table */}
//         <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-x-auto max-h-[60vh] py-2 px-6">
//           <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Student Marks</h3>
//           {isStudentLoading || isConfigLoading ? (
//             <p className="p-4 text-[#441a05]/70">Loading students...</p>
//           ) : studentError ? (
//             <p className="p-4 text-red-400">
//               Error loading students: {studentError.status || "Unknown"} -{" "}
//               {JSON.stringify(studentError.data || {})}
//             </p>
//           ) : !selectedClass ? (
//             <p className="p-4 text-[#441a05]/70">Please select a class to view students.</p>
//           ) : filteredStudents.length === 0 ? (
//             <p className="p-4 text-yellow-400 bg-yellow-500/10 rounded-lg">
//               No students found for the selected class. Please check class assignments.
//             </p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-white/20 table-fixed">
//                 <thead className="bg-white/5">
//                   <tr>
//                     <th
//                       className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider sticky-col sticky-col-first"
//                       style={{ minWidth: "200px" }}
//                     >
//                       Student Name
//                     </th>
//                     <th
//                       className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider sticky-col sticky-col-second"
//                       style={{ minWidth: "100px" }}
//                     >
//                       Roll No
//                     </th>
//                     {subjects.map((subject) => (
//                       <th
//                         key={subject.name}
//                         className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
//                         style={{ minWidth: "150px" }}
//                       >
//                         {subject.name} (out of {subject.maxMarks})
//                       </th>
//                     ))}
//                     <th
//                       className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
//                       style={{ minWidth: "100px" }}
//                     >
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-white/20">
//                   {filteredStudents.map((student, index) => (
//                     <tr
//                       key={student.id}
//                       className="bg-white/5 animate-fadeIn"
//                       style={{ animationDelay: `${index * 0.1}s` }}
//                     >
//                       <td
//                         className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05] sticky-col sticky-col-first"
//                         style={{ minWidth: "200px" }}
//                       >
//                         {student.name}
//                       </td>
//                       <td
//                         className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05] sticky-col sticky-col-second"
//                         style={{ minWidth: "100px" }}
//                       >
//                         {student.roll_no}
//                       </td>
//                       {subjects.map((subject) => {
//                         const studentMarks = marksInput[student.id]?.[subject.name] || {};
//                         return (
//                           <td
//                             key={subject.name}
//                             className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]"
//                             style={{ minWidth: "150px" }}
//                           >
//                             {studentMarks.isEditing ? (
//                               <input
//                                 type="number"
//                                 value={studentMarks.marks || ""}
//                                 onChange={(e) =>
//                                   handleMarksInput(student.id, subject.name, e.target.value, true)
//                                 }
//                                 onBlur={() =>
//                                   handleMarksInput(student.id, subject.name, studentMarks.marks, false)
//                                 }
//                                 className="w-20 bg-transparent text-[#441a05] pl-3 py-1 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
//                                 placeholder="Marks"
//                                 min={0}
//                                 max={subject.maxMarks}
//                               />
//                             ) : (
//                               <button
//                                 onClick={() => handleMarksInput(student.id, subject.name, studentMarks.marks || "0", true)}
//                                 className="px-4 py-1 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
//                               >
//                                 {studentMarks.marks ? `Edit (${studentMarks.marks})` : "Give Marks"}
//                               </button>
//                             )}
//                           </td>
//                         );
//                       })}
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ minWidth: "100px" }}>
//                         <button
//                           onClick={() => handleSubmitMarks(student.id)}
//                           disabled={isCreating}
//                           className={`px-4 py-1 rounded-lg font-medium bg-[#441a05] text-[#DB9E30] hover:bg-[#DB9E30] hover:text-[#441a05] transition-all duration-300 animate-scaleIn ${
//                             isCreating ? "cursor-not-allowed" : ""
//                           }`}
//                         >
//                           {isCreating ? <FaSpinner className="animate-spin text-lg" /> : "Submit"}
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//           {createError && (
//             <div
//               className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
//               style={{ animationDelay: "0.4s" }}
//             >
//               Error saving marks: {createError.status || "Unknown"} - {JSON.stringify(createError.data || {})}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddBehaviorMarks;

















import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";

// Static data for classes
const classConfig = [
  { id: 1, class_name: "Class 1" },
  { id: 2, class_name: "Class 2" },
  { id: 3, class_name: "Class 3" },
];

// Static data for students
const studentsList = {
  students: [
    { id: 1, name: "John Doe", roll_no: "101", class_name: "Class 1" },
    { id: 2, name: "Jane Smith", roll_no: "102", class_name: "Class 1" },
    { id: 3, name: "Alice Johnson", roll_no: "201", class_name: "Class 2" },
    { id: 4, name: "Bob Brown", roll_no: "202", class_name: "Class 2" },
    { id: 5, name: "Emma Davis", roll_no: "301", class_name: "Class 3" },
  ],
};

// Static subjects list
const subjects = [
  { name: "Math", maxMarks: 100 },
  { name: "Science", maxMarks: 100 },
  { name: "English", maxMarks: 100 },
  { name: "History", maxMarks: 100 },
  { name: "Geography", maxMarks: 100 },
];

// Mock mutation for saving marks
const useCreateSubjectMarksApiMutation = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const mutate = async (payload) => {
    setIsLoading(true);
    try {
      // Simulate API call
      console.log("Saving marks:", payload);
      return { data: payload };
    } catch (err) {
      setError({ status: "Mock Error", data: "Failed to save marks" });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [mutate, { isLoading, error }];
};

const AddBehaviorMarks = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [marksInput, setMarksInput] = useState({}); // { studentId: { subjectName: { marks, isEditing } } }

  // Filter students by selected class
  const filteredStudents = studentsList.students.filter((student) => student.class_name === selectedClass) || [];

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

  // Mock submit marks function
  const [createSubjectMarks, { isLoading: isCreating, error: createError }] = useCreateSubjectMarksApiMutation();

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
      alert("Please enter at least one mark.");
      return;
    }

    for (const { marks, subject_name } of subjectMarks) {
      const maxMarks = subjects.find((s) => s.name === subject_name).maxMarks;
      if (marks > maxMarks) {
        alert(`Marks for ${subject_name} cannot exceed ${maxMarks}.`);
        return;
      }
      if (marks < 0) {
        alert(`Marks for ${subject_name} cannot be negative.`);
        return;
      }
    }

    try {
      const payload = {
        student_id: studentId,
        subject_marks: subjectMarks,
      };
      await createSubjectMarks(payload);
      alert("Marks saved successfully!");
      setMarksInput((prev) => ({ ...prev, [studentId]: {} })); // Clear marks for this student
    } catch (err) {
      console.error("Error saving marks:", err);
      alert(`Failed to save marks: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
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
            left: 200px; /* Adjust based on first column width */
          }
        `}
      </style>

      <div className="">
        {/* Class Selection */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">Select Class</h3>
          </div>
          <div className="max-w-md">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
            >
              <option value="">Select Class</option>
              {classConfig.map((cls) => (
                <option key={cls.id} value={cls.class_name}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-x-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Student Marks</h3>
          {!selectedClass ? (
            <p className="p-4 text-[#441a05]/70">Please select a class to view students.</p>
          ) : filteredStudents.length === 0 ? (
            <p className="p-4 text-yellow-400 bg-yellow-500/10 rounded-lg">
              No students found for the selected class. Please check class assignments.
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
                      Student Name
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider sticky-col sticky-col-second"
                      style={{ minWidth: "100px" }}
                    >
                      Roll No
                    </th>
                    {subjects.map((subject) => (
                      <th
                        key={subject.name}
                        className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
                        style={{ minWidth: "150px" }}
                      >
                        {subject.name} (out of {subject.maxMarks})
                      </th>
                    ))}
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider"
                      style={{ minWidth: "100px" }}
                    >
                      Action
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
                                className="w-20 bg-transparent text-[#441a05] pl-3 py-1 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 placeholder:text-[#441a05]"
                                placeholder="Marks"
                                min={0}
                                max={subject.maxMarks}
                              />
                          
                            
                        
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ minWidth: "100px" }}>
                        <button
                          onClick={() => handleSubmitMarks(student.id)}
                          disabled={isCreating}
                          className={`px-4 py-1 rounded-lg font-medium bg-[#441a05] text-[#DB9E30] hover:bg-[#DB9E30] hover:text-[#441a05] transition-all duration-300 animate-scaleIn ${
                            isCreating ? "cursor-not-allowed" : ""
                          }`}
                        >
                          {isCreating ? <FaSpinner className="animate-spin text-lg" /> : "Submit"}
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
              Error saving marks: {createError.status || "Unknown"} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBehaviorMarks;