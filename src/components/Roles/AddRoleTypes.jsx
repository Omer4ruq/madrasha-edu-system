import React, { useState } from "react";
import {
  useCreateRoleTypeMutation,
  useGetRoleTypesQuery,
  useUpdateRoleTypeMutation,
  useDeleteRoleTypeMutation,
} from "../../redux/features/api/roleType/roleTypesApi";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";

const AddRoleTypes = () => {
  const [formData, setFormData] = useState({
    name: "",
    bn_name: "",
    status: "Active",
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // For forced re-rendering

  // API hooks
  const {
    data: roleTypes,
    isLoading: isRoleLoading,
    error: roleError,
    refetch,
  } = useGetRoleTypesQuery();
  const [createRoleType, { isLoading: isCreating, error: createError }] = useCreateRoleTypeMutation();
  const [updateRoleType, { isLoading: isUpdating, error: updateError }] = useUpdateRoleTypeMutation();
  const [deleteRoleType, { isLoading: isDeleting, error: deleteError }] = useDeleteRoleTypeMutation();

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle status change
  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.checked ? "Active" : "Deactive" });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, bn_name } = formData;
    if (!name.trim() || !bn_name.trim()) {
      toast.error("অনুগ্রহ করে নাম এবং বাংলা নাম উভয়ই লিখুন");
      return;
    }
    if (
      roleTypes?.some(
        (rt) => rt.name.toLowerCase() === name.toLowerCase() && rt.id !== editingId
      )
    ) {
      toast.error("এই ভূমিকার নাম ইতিমধ্যে বিদ্যমান!");
      return;
    }

    setModalAction(editingId ? "update" : "create");
    setModalData({ id: editingId, ...formData });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEdit = (roleType) => {
    setFormData({
      name: roleType.name,
      bn_name: roleType.bn_name,
      status: roleType.status,
    });
    setEditingId(roleType.id);
  };

  // Handle toggle status
  const handleToggleStatus = (roleType) => {
    setModalAction("toggle");
    setModalData({
      id: roleType.id,
      name: roleType.name,
      bn_name: roleType.bn_name,
      status: roleType.status === "Active" ? "Deactive" : "Active",
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    setModalAction("delete");
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        await createRoleType(modalData).unwrap();
        toast.success("ভূমিকার ধরন সফলভাবে তৈরি করা হয়েছে!");
        resetForm();
      } else if (modalAction === "update") {
        await updateRoleType(modalData).unwrap();
        toast.success("ভূমিকার ধরন সফলভাবে আপডেট করা হয়েছে!");
        resetForm();
      } else if (modalAction === "delete") {
        await deleteRoleType(modalData.id).unwrap();
        toast.success("ভূমিকার ধরন সফলভাবে মুছে ফেলা হয়েছে!");
      } else if (modalAction === "toggle") {
        await updateRoleType(modalData).unwrap();
        toast.success(`ভূমিকা ${modalData.name} এখন ${modalData.status === "Active" ? "সক্রিয়" : "নিষ্ক্রিয়"}!`);
      }
      refetch();
      setRefreshKey((prev) => prev + 1); // Force table re-render
    } catch (err) {
      console.error(
        `ত্রুটি ${modalAction === "create" ? "তৈরি করা" : modalAction === "update" ? "আপডেট" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"}:`,
        err
      );
      toast.error(
        `ভূমিকা ${modalAction === "create" ? "তৈরি" : modalAction === "update" ? "আপডেট" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"} ব্যর্থ: ${err.status || "অজানা"} - ${JSON.stringify(err.data || {})}`
      );
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      bn_name: "",
      status: "Active",
    });
    setEditingId(null);
  };

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
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
          @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
          }
          .animate-slideDown {
            animation: slideDown 0.4s ease-out forwards;
          }
          .tick-glow {
            transition: all 0.3s ease;
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.4); /* Match #DB9E30 */
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

      <div>
        {/* Add/Edit Role Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            {editingId ? (
              <FaEdit className="text-4xl text-[#441a05]" />
            ) : (
              <IoAddCircle className="text-4xl text-[#441a05]" />
            )}
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              {editingId ? "ভূমিকার ধরন সম্পাদনা করুন" : "নতুন ভূমিকার ধরন যোগ করুন"}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="নাম লিখুন"
              disabled={isCreating || isUpdating}
              aria-label="নাম"
              title="নাম লিখুন (উদাহরণ: Admin)"
              aria-describedby={createError || updateError ? "role-error" : undefined}
            />
            <input
              type="text"
              id="bn_name"
              name="bn_name"
              value={formData.bn_name}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="বাংলা নাম লিখুন"
              disabled={isCreating || isUpdating}
              lang="bn"
              aria-label="বাংলা নাম"
              title="বাংলা নাম লিখুন (উদাহরণ: প্রশাসক)"
              aria-describedby={createError || updateError ? "role-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              title={editingId ? "ভূমিকার ধরন আপডেট করুন" : "নতুন ভূমিকার ধরন তৈরি করুন"}
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isCreating || isUpdating ? "cursor-not-allowed" : "hover:text-white hover:shadow-md"
              }`}
            >
              {(isCreating || isUpdating) ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>{editingId ? "আপডেট করা হচ্ছে..." : "তৈরি করা হচ্ছে..."}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  {editingId ? <FaEdit className="w-5 h-5" /> : <IoAdd className="w-5 h-5" />}
                  <span>{editingId ? "ভূমিকা আপডেট করুন" : "ভূমিকা তৈরি করুন"}</span>
                </span>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                title="সম্পাদনা বাতিল করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            )}
          </form>
          {(createError || updateError) && (
            <div
              id="role-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              ত্রুটি: {(createError || updateError).status || "অজানা"} - {JSON.stringify((createError || updateError).data || {})}
            </div>
          )}
        </div>

        {/* Role Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">ভূমিকার ধরনের তালিকা</h3>
          {isRoleLoading ? (
            <p className="p-4 text-[#441a05]/70">ভূমিকার ধরন লোড হচ্ছে...</p>
          ) : roleError ? (
            <p className="p-4 text-red-400">
              ভূমিকার ধরন লোড করতে ত্রুটি: {roleError.status || "অজানা"} - {JSON.stringify(roleError.data || {})}
            </p>
          ) : roleTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো ভূমিকার ধরন উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto" key={refreshKey}>
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      বাংলা নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      সক্রিয়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      তৈরির সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আপডেটের সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রিয়াকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {roleTypes?.map((roleType, index) => (
                    <tr
                      key={roleType.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {roleType.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {roleType.bn_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={roleType.status === "Active"}
                            onChange={() => handleToggleStatus(roleType)}
                            className="hidden"
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${
                              roleType.status === "Active"
                                ? "bg-[#DB9E30] border-[#DB9E30] tick-glow"
                                : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                            }`}
                          >
                            {roleType.status === "Active" && (
                              <svg
                                className="w-4 h-4 text-[#441a05]"
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
                        {new Date(roleType.created_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(roleType.updated_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(roleType)}
                          title="ভূমিকার ধরন সম্পাদনা করুন"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(roleType.id)}
                          title="ভূমিকার ধরন মুছুন"
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
                ? "ভূমিকার ধরন মুছে ফেলা হচ্ছে..."
                : `ভূমিকা মুছে ফেলতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})}`}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border-t border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === "create" && "নতুন ভূমিকার ধরন নিশ্চিত করুন"}
                {modalAction === "update" && "ভূমিকার ধরন আপডেট নিশ্চিত করুন"}
                {modalAction === "delete" && "ভূমিকার ধরন মুছে ফেলা নিশ্চিত করুন"}
                {modalAction === "toggle" && "ভূমিকার ধরনের স্থিতি পরিবর্তন নিশ্চিত করুন"}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === "create" && "আপনি কি নিশ্চিত যে নতুন ভূমিকার ধরন তৈরি করতে চান?"}
                {modalAction === "update" && "আপনি কি নিশ্চিত যে ভূমিকার ধরন আপডেট করতে চান?"}
                {modalAction === "delete" && "আপনি কি নিশ্চিত যে এই ভূমিকার ধরনটি মুছে ফেলতে চান?"}
                {modalAction === "toggle" && `আপনি কি নিশ্চিত যে ভূমিকার ধরনটি ${modalData?.status === "Active" ? "সক্রিয়" : "নিষ্ক্রিয়"} করতে চান?`}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddRoleTypes;