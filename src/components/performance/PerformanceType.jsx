import React, { useState } from 'react';
import { useCreatePerformanceApiMutation, useDeletePerformanceApiMutation, useGetPerformanceApiQuery, useUpdatePerformanceApiMutation } from '../../redux/features/api/performance/performanceApi';
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
const PerformanceType = () => {
     const [isAdd, setIsAdd] = useState(true); // Added state for toggle
      const [performanceName, setPerformanceName] = useState("");
      const [editPerformanceId, setEditPerformanceId] = useState(null);
      const [editPerformanceName, setEditPerformanceName] = useState("");
    
      // API hooks
      const {
        data: performanceTypes,
        isLoading: isPerformanceLoading,
        error: PerformanceError,
      } = useGetPerformanceApiQuery();
      const [createPerformance, { isLoading: isCreating, error: createError }] = useCreatePerformanceApiMutation();
      const [updatePerformance, { isLoading: isUpdating, error: updateError }] = useUpdatePerformanceApiMutation();
      const [deletePerformance, { isLoading: isDeleting, error: deleteError }] = useDeletePerformanceApiMutation();
    console.log("permormance type", performanceTypes)
      // Handle form submission for adding new Performance type
      const handleSubmitPerformance = async (e) => {
        e.preventDefault();
        if (!performanceName.trim()) {
          alert("Please enter a Performance type name");
          return;
        }
        if (performanceTypes?.some((lt) => lt.name.toLowerCase() === performanceName.toLowerCase())) {
          alert("This Performance type already exists!");
          return;
        }
    
        try {
          const payload = {
            name: performanceName.trim(),
            is_active: true,
          };
          await createPerformance(payload).unwrap();
          alert("Performance type created successfully!");
          setPerformanceName("");
        } catch (err) {
          console.error("Error creating Performance type:", err);
          alert(`Failed to create Performance type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
        }
      };
    
      // Handle edit button click
      const handleEditClick = (Performance) => {
        setEditPerformanceId(Performance.id);
        setEditPerformanceName(Performance.name);
        setIsAdd(false); // Switch to edit mode
      };
    
      // Handle update Performance type
      const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editPerformanceName.trim()) {
          alert("Please enter a Performance type name");
          return;
        }
    
        try {
          const payload = {
            id: editPerformanceId,
            name: editPerformanceName.trim(),
            is_active: performanceTypes.find((lt) => lt.id === editPerformanceId)?.is_active || true,
          };
          await updatePerformance(payload).unwrap();
          alert("Performance type updated successfully!");
          setEditPerformanceId(null);
          setEditPerformanceName("");
          setIsAdd(true); // Switch back to add mode
        } catch (err) {
          console.error("Error updating Performance type:", err);
          alert(`Failed to update Performance type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
        }
      };
    
      // Handle toggle active status
      const handleToggleActive = async (Performance) => {
        try {
          const payload = {
            id: Performance.id,
            name: Performance.name,
            is_active: !Performance.is_active,
          };
          await updatePerformance(payload).unwrap();
          alert(`Performance type ${Performance.name} is now ${!Performance.is_active ? "active" : "inactive"}!`);
        } catch (err) {
          console.error("Error toggling Performance type active status:", err);
          alert(`Failed to toggle active status: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
        }
      };
    
      // Handle delete Performance type
      const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this Performance type?")) {
          try {
            await deletePerformance(id).unwrap();
            alert("Performance type deleted successfully!");
          } catch (err) {
            console.error("Error deleting Performance type:", err);
            alert(`Failed to delete Performance type: ${err.status || "Unknown error"} - ${JSON.stringify(err.data || {})}`);
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
     
             {isAdd && (
               <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
                 <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
                   <IoAddCircle className="text-4xl text-[#441a05]" />
                   <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">নতুন পারফরম্যান্স টাইপ যোগ করুন</h3>
                 </div>
                 <form onSubmit={handleSubmitPerformance} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <input
                     type="text"
                     id="performanceName"
                     value={performanceName}
                     onChange={(e) => setPerformanceName(e.target.value)}
                     className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                     placeholder="পারফরম্যান্সের ধরণ লিখুন"
                     disabled={isCreating}
                     aria-describedby={createError ? "Performance-error" : undefined}
                   />
                   <button
                     type="submit"
                     disabled={isCreating}
                     title="Create a new Performance type"
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
                         <span>পারফরম্যান্স টাইপ তৈরি করুন</span>
                       </span>
                     )}
                   </button>
                 </form>
                 {createError && (
                   <div
                     id="Performance-error"
                     className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                     style={{ animationDelay: "0.4s" }}
                   >
                     Error: {createError.status || "Unknown"} - {JSON.stringify(createError.data || {})}
                   </div>
                 )}
               </div>
             )}
     
             {/* Edit Performance Form */}
             {!isAdd && (
               <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
                 <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
                   <FaEdit className="text-3xl text-[#441a05]" />
                   <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">পারফরম্যান্সের ধরণ সম্পাদনা করুন</h3>
                 </div>
                 <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                   <input
                     type="text"
                     id="editPerformanceName"
                     value={editPerformanceName}
                     onChange={(e) => setEditPerformanceName(e.target.value)}
                     className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                     placeholder="Edit Performance type (e.g., Sick Performance)"
                     disabled={isUpdating}
                     aria-label="Edit Performance Type"
                     aria-describedby="edit-Performance-error"
                   />
                   <button
                     type="submit"
                     disabled={isUpdating}
                     title="Update Performance type"
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
                       <span>Update Performance Type</span>
                     )}
                   </button>
                   <button
                     type="button"
                     onClick={() => {
                       setEditPerformanceId(null);
                       setEditPerformanceName("");
                       setIsAdd(true);
                     }}
                     title="Cancel editing"
                     className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
                   >
                     Cancel
                   </button>
                 </form>
                 {updateError && (
                   <div
                     id="edit-Performance-error"
                     className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                     style={{ animationDelay: "0.4s" }}
                   >
                     Error: {updateError.status || "Unknown"} - {JSON.stringify(updateError.data || {})}
                   </div>
                 )}
               </div>
             )}
     
             {/* Performance Types Table */}
             <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
               <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">কর্মক্ষমতা প্রকারের তালিকা</h3>
               {isPerformanceLoading ? (
                 <p className="p-4 text-[#441a05]/70">Loading Performance types...</p>
               ) : PerformanceError ? (
                 <p className="p-4 text-red-400">
                   Error loading Performance types: {PerformanceError.status || "Unknown"} -{" "}
                   {JSON.stringify(PerformanceError.data || {})}
                 </p>
               ) : performanceTypes?.length === 0 ? (
                 <p className="p-4 text-[#441a05]/70">No Performance types available.</p>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-white/20">
                     <thead className="bg-white/5">
                       <tr>
                         <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                           কর্মক্ষমতা প্রকার
                         </th>
                         {/* <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                           সক্রিয়
                         </th> */}
                         {/* <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                           তৈরি করা হয়েছে
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                           আপডেট করা হয়েছে
                         </th> */}
                         <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                           কর্ম
                         </th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/20">
                       {performanceTypes?.map((Performance, index) => (
                         <tr
                           key={Performance.id}
                           className="bg-white/5 animate-fadeIn"
                           style={{ animationDelay: `${index * 0.1}s` }}
                         >
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                             {Performance.name}
                           </td>
                           {/* <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                             <label className="inline-flex items-center cursor-pointer">
                               <input
                                 type="checkbox"
                                 checked={Performance.is_active}
                                 onChange={() => handleToggleActive(Performance)}
                                 className="hidden"
                               />
                               <span
                                 className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                                   Performance.is_active
                                     ? "bg-[#DB9E30] border-[#DB9E30]"
                                     : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                                 }`}
                               >
                                 {Performance.is_active && (
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
                           </td> */}
                           {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                             {new Date(Performance.created_at).toLocaleString()}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                             {new Date(Performance.updated_at).toLocaleString()}
                           </td> */}
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                             <button
                               onClick={() => handleEditClick(Performance)}
                               title="Edit Performance type"
                               className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                             >
                               <FaEdit className="w-5 h-5" />
                             </button>
                             <button
                               onClick={() => handleDelete(Performance.id)}
                               title="Delete Performance type"
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
                     ? "Deleting Performance type..."
                     : `Error deleting Performance type: ${deleteError?.status || "Unknown"} - ${JSON.stringify(
                         deleteError?.data || {}
                       )}`}
                 </div>
               )}
             </div>
           </div>
         </div>
    );
};

export default PerformanceType;