import React, { useState } from "react";
import {
  useCreateBehaviorTypeApiMutation,
  useGetBehaviorTypeApiQuery,
  useUpdateBehaviorTypeApiMutation,
  useDeleteBehaviorTypeApiMutation,
} from "../../redux/features/api/behavior/behaviorTypeApi";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";

const AddBehaviorType = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [behavior, setBehavior] = useState("");
  const [marks, setMarks] = useState("");
  const [editBehaviorId, setEditBehaviorId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Start of Permission Logic ---
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_student_behavior_report_type') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_student_behavior_report_type') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_student_behavior_report_type') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_student_behavior_report_type') || false;
  // --- End of Permission Logic ---

  // API hooks
  const {
    data: behaviorTypes,
    isLoading: isBehaviorLoading,
    error: behaviorError,
    refetch,
  } = useGetBehaviorTypeApiQuery();
  const [createBehavior, { isLoading: isCreating, error: createError }] = useCreateBehaviorTypeApiMutation();
  const [updateBehavior, { isLoading: isUpdating, error: updateError }] = useUpdateBehaviorTypeApiMutation();
  const [deleteBehavior, { isLoading: isDeleting, error: deleteError }] = useDeleteBehaviorTypeApiMutation();

  // Validate marks
  const validateMarks = (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  // Handle form submission for adding or updating behavior
  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPermission = editBehaviorId ? hasChangePermission : hasAddPermission;
    if (!actionPermission) {
      toast.error('আপনার এই কাজটি করার অনুমতি নেই।');
      return;
    }

    const name = behavior.trim();
    if (!name || !marks.trim()) {
      toast.error("অনুগ্রহ করে আচরণের ধরন এবং নম্বর উভয়ই লিখুন");
      return;
    }
    if (!validateMarks(marks)) {
      toast.error("নম্বর ০ থেকে ১০০ এর মধ্যে হতে হবে");
      return;
    }
    if (
      behaviorTypes?.some(
        (bt) => bt.name.toLowerCase() === name.toLowerCase() && bt.id !== editBehaviorId
      )
    ) {
      toast.error("এই আচরণের ধরন ইতিমধ্যে বিদ্যমান!");
      return;
    }

    setModalAction(editBehaviorId ? "update" : "create");
    setModalData({
      id: editBehaviorId,
      name,
      obtain_mark: Number(marks),
      is_active: editBehaviorId
        ? behaviorTypes.find((bt) => bt.id === editBehaviorId)?.is_active || true
        : true,
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (behavior) => {
    if (!hasChangePermission) {
      toast.error('সম্পাদনা করার অনুমতি আপনার নেই।');
      return;
    }
    setEditBehaviorId(behavior.id);
    setBehavior(behavior.name);
    setMarks(behavior.obtain_mark.toString());
  };

  // Handle toggle active status
  const handleToggleActive = (behavior) => {
    if (!hasChangePermission) {
      toast.error('স্থিতি পরিবর্তন করার অনুমতি আপনার নেই।');
      return;
    }
    setModalAction("toggle");
    setModalData({
      id: behavior.id,
      name: behavior.name,
      obtain_mark: behavior.obtain_mark,
      is_active: !behavior.is_active,
    });
    setIsModalOpen(true);
  };

  // Handle delete behavior
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('মুছে ফেলার অনুমতি আপনার নেই।');
      return;
    }
    setModalAction("delete");
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        if (!hasAddPermission) { toast.error('তৈরি করার অনুমতি আপনার নেই।'); return; }
        await createBehavior(modalData).unwrap();
        toast.success("আচরণের ধরন সফলভাবে তৈরি করা হয়েছে!");
        setBehavior("");
        setMarks("");
      } else if (modalAction === "update") {
        if (!hasChangePermission) { toast.error('আপডেট করার অনুমতি আপনার নেই।'); return; }
        await updateBehavior(modalData).unwrap();
        toast.success("আচরণের ধরন সফলভাবে আপডেট করা হয়েছে!");
        setEditBehaviorId(null);
        setBehavior("");
        setMarks("");
      } else if (modalAction === "delete") {
        if (!hasDeletePermission) { toast.error('মুছে ফেলার অনুমতি আপনার নেই।'); return; }
        await deleteBehavior(modalData.id).unwrap();
        toast.success("আচরণের ধরন সফলভাবে মুছে ফেলা হয়েছে!");
      } else if (modalAction === "toggle") {
        if (!hasChangePermission) { toast.error('স্থিতি পরিবর্তন করার অনুমতি আপনার নেই।'); return; }
        await updateBehavior(modalData).unwrap();
        toast.success(`আচরণ ${modalData.name} এখন ${modalData.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}!`);
      }
      refetch();
      setRefreshKey((prev) => prev + 1); // Force table re-render
    } catch (err) {
      console.error(
        `ত্রুটি ${modalAction === "create" ? "তৈরি করা" : modalAction === "update" ? "আপডেট" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"}:`,
        err
      );
      toast.error(
        `আচরণ ${modalAction === "create" ? "তৈরি" : modalAction === "update" ? "আপডেট" : modalAction === "delete" ? "মুছে ফেলা" : "টগল করা"} ব্যর্থ: ${err.status || "অজানা"} - ${JSON.stringify(err.data || {})}`
      );
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // --- Start of Permission-based Rendering ---
  if (permissionsLoading) {
    return <div className="p-4 text-center">অনুমতি লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-center text-red-500">এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।</div>;
  }
  // --- End of Permission-based Rendering ---

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      <style>
        {`
          /* Styles remain the same */
        `}
      </style>

      <div>
        {/* Add/Edit Behavior Form */}
        {(hasAddPermission || hasChangePermission) && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              {editBehaviorId ? (
                <FaEdit className="text-4xl text-[#441a05]" />
              ) : (
                <IoAddCircle className="text-4xl text-[#441a05]" />
              )}
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
                {editBehaviorId ? "আচরণের ধরন সম্পাদনা করুন" : "নতুন আচরণের ধরন যোগ করুন"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input
                type="text"
                id="behaviorName"
                value={behavior}
                onChange={(e) => setBehavior(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="আচরণের ধরন"
                disabled={isCreating || isUpdating}
                aria-label="আচরণের ধরন"
                title="আচরণের ধরন লিখুন (উদাহরণ: সময়ানুবর্তিতা)"
                aria-describedby={createError || updateError ? "behavior-error" : undefined}
              />
              <input
                type="number"
                id="marks"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="নম্বর লিখুন"
                disabled={isCreating || isUpdating}
                aria-label="নম্বর"
                title="নম্বর লিখুন (উদাহরণ: ১০)"
                aria-describedby={createError || updateError ? "behavior-error" : undefined}
              />
              <button
                type="submit"
                disabled={isCreating || isUpdating || (editBehaviorId ? !hasChangePermission : !hasAddPermission)}
                title={editBehaviorId ? "আচরণের ধরন আপডেট করুন" : "নতুন আচরণের ধরন তৈরি করুন"}
                className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isCreating || isUpdating || (editBehaviorId ? !hasChangePermission : !hasAddPermission) ? "cursor-not-allowed opacity-50" : "hover:text-white hover:shadow-md"
                }`}
              >
                {(isCreating || isUpdating) ? (
                  <span className="flex items-center space-x-3">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>{editBehaviorId ? "আপডেট করা হচ্ছে..." : "তৈরি করা হচ্ছে..."}</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    {editBehaviorId ? <FaEdit className="w-5 h-5" /> : <IoAdd className="w-5 h-5" />}
                    <span>{editBehaviorId ? "আচরণ আপডেট করুন" : "আচরণ তৈরি করুন"}</span>
                  </span>
                )}
              </button>
              {editBehaviorId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditBehaviorId(null);
                    setBehavior("");
                    setMarks("");
                  }}
                  title="সম্পাদনা বাতিল করুন"
                  className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-white transition-all duration-300 animate-scaleIn"
                >
                  বাতিল
                </button>
              )}
            </form>
            {(createError || updateError) && (
              <div
                id="behavior-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                ত্রুটি: {(createError || updateError).status || "অজানা"} - {JSON.stringify((createError || updateError).data || {})}
              </div>
            )}
          </div>
        )}

        {/* Behavior Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">আচরণের ধরনের তালিকা</h3>
          {isBehaviorLoading ? (
            <p className="p-4 text-[#441a05]/70">আচরণের ধরন লোড হচ্ছে...</p>
          ) : behaviorError ? (
            <p className="p-4 text-red-400">
              আচরণের ধরন লোড করতে ত্রুটি: {behaviorError.status || "অজানা"} - {JSON.stringify(behaviorError.data || {})}
            </p>
          ) : behaviorTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো আচরণের ধরন উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto" key={refreshKey}>
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আচরণের ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      নম্বর
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
                  {behaviorTypes?.map((behavior, index) => (
                    <tr
                      key={behavior.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {behavior.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {behavior.obtain_mark}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={behavior.is_active}
                            onChange={() => handleToggleActive(behavior)}
                            className="hidden"
                            disabled={!hasChangePermission}
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${
                              behavior.is_active
                                ? "bg-[#DB9E30] border-[#DB9E30] tick-glow"
                                : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                            }`}
                          >
                            {behavior.is_active && (
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
                        {new Date(behavior.created_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(behavior.updated_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {hasChangePermission && (
                          <button
                            onClick={() => handleEditClick(behavior)}
                            title="আচরণের ধরন সম্পাদনা করুন"
                            className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => handleDelete(behavior.id)}
                            title="আচরণের ধরন মুছুন"
                            className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        )}
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
                ? "আচরণের ধরন মুছে ফেলা হচ্ছে..."
                : `আচরণ মুছে ফেলতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})}`}
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
                {modalAction === "create" && "নতুন আচরণের ধরন নিশ্চিত করুন"}
                {modalAction === "update" && "আচরণের ধরন আপডেট নিশ্চিত করুন"}
                {modalAction === "delete" && "আচরণের ধরন মুছে ফেলা নিশ্চিত করুন"}
                {modalAction === "toggle" && "আচরণের ধরনের স্থিতি পরিবর্তন নিশ্চিত করুন"}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === "create" && "আপনি কি নিশ্চিত যে নতুন আচরণের ধরন তৈরি করতে চান?"}
                {modalAction === "update" && "আপনি কি নিশ্চিত যে আচরণের ধরন আপডেট করতে চান?"}
                {modalAction === "delete" && "আপনি কি নিশ্চিত যে এই আচরণের ধরনটি মুছে ফেলতে চান?"}
                {modalAction === "toggle" && `আপনি কি নিশ্চিত যে আচরণের ধরনটি ${modalData?.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"} করতে চান?`}
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

export default AddBehaviorType;