import React, { useState } from 'react';
import {
  useGetPerformanceApiQuery,
  useCreatePerformanceApiMutation,
  useUpdatePerformanceApiMutation,
  useDeletePerformanceApiMutation,
} from '../../redux/features/api/performance/performanceApi';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';

const PerformanceType = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [performanceName, setPerformanceName] = useState('');
  const [editPerformanceId, setEditPerformanceId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- Start of Permission Logic ---
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_performance_name') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_performance_name') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_performance_name') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_performance_name') || false;
  // --- End of Permission Logic ---

  // API hooks
  const {
    data: performanceTypes = [],
    isLoading: isPerformanceLoading,
    error: performanceError,
    refetch,
  } = useGetPerformanceApiQuery();
  const [createPerformance, { isLoading: isCreating, error: createError }] =
    useCreatePerformanceApiMutation();
  const [updatePerformance, { isLoading: isUpdating, error: updateError }] =
    useUpdatePerformanceApiMutation();
  const [deletePerformance, { isLoading: isDeleting, error: deleteError }] =
    useDeletePerformanceApiMutation();

  // Handle form submission for adding or updating performance type
  const handleSubmit = async (e) => {
    e.preventDefault();
    const actionPermission = editPerformanceId ? hasChangePermission : hasAddPermission;
    if (!actionPermission) {
      toast.error('আপনার এই কাজটি করার অনুমতি নেই।');
      return;
    }

    const name = editPerformanceId ? performanceName.trim() : performanceName.trim();
    if (!name) {
      toast.error('অনুগ্রহ করে পারফরম্যান্সের ধরনের নাম লিখুন');
      return;
    }
    if (
      performanceTypes?.some(
        (pt) => pt.name.toLowerCase() === name.toLowerCase() && pt.id !== editPerformanceId
      )
    ) {
      toast.error('এই পারফরম্যান্সের ধরন ইতিমধ্যে বিদ্যমান!');
      return;
    }

    setModalAction(editPerformanceId ? 'update' : 'create');
    setModalData({
      id: editPerformanceId,
      name: name,
      is_active: editPerformanceId
        ? performanceTypes.find((pt) => pt.id === editPerformanceId)?.is_active || true
        : true,
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (performance) => {
    if (!hasChangePermission) {
      toast.error('সম্পাদনা করার অনুমতি আপনার নেই।');
      return;
    }
    setEditPerformanceId(performance.id);
    setPerformanceName(performance.name);
  };

  // Handle toggle active status
  const handleToggleActive = (performance) => {
    if (!hasChangePermission) {
      toast.error('স্থিতি পরিবর্তন করার অনুমতি আপনার নেই।');
      return;
    }
    setModalAction('toggle');
    setModalData({
      id: performance.id,
      name: performance.name,
      is_active: !performance.is_active,
    });
    setIsModalOpen(true);
  };

  // Handle delete performance type
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('মুছে ফেলার অনুমতি আপনার নেই।');
      return;
    }
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        if (!hasAddPermission) { toast.error('তৈরি করার অনুমতি আপনার নেই।'); return; }
        await createPerformance({ name: modalData.name, is_active: modalData.is_active }).unwrap();
        toast.success('পারফরম্যান্সের ধরন সফলভাবে তৈরি করা হয়েছে!');
        setPerformanceName('');
      } else if (modalAction === 'update') {
        if (!hasChangePermission) { toast.error('আপডেট করার অনুমতি আপনার নেই।'); return; }
        await updatePerformance(modalData).unwrap();
        toast.success('পারফরম্যান্সের ধরন সফলভাবে আপডেট করা হয়েছে!');
        setEditPerformanceId(null);
        setPerformanceName('');
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) { toast.error('মুছে ফেলার অনুমতি আপনার নেই।'); return; }
        await deletePerformance(modalData.id).unwrap();
        toast.success('পারফরম্যান্সের ধরন সফলভাবে মুছে ফেলা হয়েছে!');
      } else if (modalAction === 'toggle') {
        if (!hasChangePermission) { toast.error('স্থিতি পরিবর্তন করার অনুমতি আপনার নেই।'); return; }
        await updatePerformance(modalData).unwrap();
        toast.success(
          `পারফরম্যান্সের ধরন ${modalData.name} এখন ${modalData.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}!`
        );
      }
      refetch();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error( `ত্রুটি ${modalAction}:`, err );
      toast.error( `পারফরম্যান্সের ধরন ${modalAction} ব্যর্থ: ${ err.status || 'অজানা' } - ${JSON.stringify(err.data || {})}` );
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setEditPerformanceId(null);
    setPerformanceName('');
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
        {/* Add/Edit Performance Form */}
        {(hasAddPermission || hasChangePermission) && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              {editPerformanceId ? (
                <FaEdit className="text-4xl text-[#441a05]" />
              ) : (
                <IoAddCircle className="text-4xl text-[#441a05]" />
              )}
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
                {editPerformanceId ? 'পারফরম্যান্সের ধরন সম্পাদনা করুন' : 'নতুন পারফরম্যান্সের ধরন যোগ করুন'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input
                type="text"
                id="performanceName"
                value={performanceName}
                onChange={(e) => setPerformanceName(e.target.value)}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="পারফরম্যান্সের ধরন"
                disabled={isCreating || isUpdating}
                aria-label="পারফরম্যান্সের ধরন"
                title="পারফরম্যান্সের ধরন লিখুন (উদাহরণ: সময়ানুবর্তিতা) / Enter performance type (e.g., Punctuality)"
                aria-describedby={createError || updateError ? 'performance-error' : undefined}
              />
              <button
                type="submit"
                disabled={isCreating || isUpdating || (editPerformanceId ? !hasChangePermission : !hasAddPermission)}
                title={
                  editPerformanceId
                    ? 'পারফরম্যান্সের ধরন আপডেট করুন / Update performance type'
                    : 'নতুন পারফরম্যান্সের ধরন তৈরি করুন / Create a new performance type'
                }
                className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isCreating || isUpdating || (editPerformanceId ? !hasChangePermission : !hasAddPermission) ? 'cursor-not-allowed opacity-50' : 'hover:text-white hover:shadow-md'
                }`}
              >
                {(isCreating || isUpdating) ? (
                  <span className="flex items-center space-x-3">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>{editPerformanceId ? 'আপডেট করা হচ্ছে...' : 'তৈরি করা হচ্ছে...'}</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <IoAdd className="w-5 h-5" />
                    <span>{editPerformanceId ? 'পারফরম্যান্স আপডেট করুন' : 'পারফরম্যান্স তৈরি করুন'}</span>
                  </span>
                )}
              </button>
              {editPerformanceId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  title="সম্পাদনা বাতিল করুন / Cancel editing"
                  className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-white hover:text-white transition-all duration-300 animate-scaleIn"
                >
                  বাতিল
                </button>
              )}
            </form>
            {(createError || updateError) && (
              <div
                id="performance-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: '0.4s' }}
              >
                ত্রুটি: {(createError || updateError).status || 'অজানা'} -{' '}
                {JSON.stringify((createError || updateError).data || {})}
              </div>
            )}
          </div>
        )}

        {/* Performance Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
            পারফরম্যান্সের ধরনের তালিকা
          </h3>
          {isPerformanceLoading ? (
            <p className="p-4 text-[#441a05]/70">পারফরম্যান্সের ধরন লোড হচ্ছে...</p>
          ) : performanceError ? (
            <p className="p-4 text-red-400">
              পারফরম্যান্সের ধরন লোড করতে ত্রুটি: {performanceError.status || 'অজানা'} -{' '}
              {JSON.stringify(performanceError.data || {})}
            </p>
          ) : performanceTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো পারফরম্যান্সের ধরন উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto" key={refreshKey}>
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      পারফরম্যান্সের ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রিয়াকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {performanceTypes?.map((performance, index) => (
                    <tr
                      key={performance.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {performance.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {hasChangePermission && (
                          <button
                            onClick={() => handleEditClick(performance)}
                            title="পারফরম্যান্সের ধরন সম্পাদনা করুন / Edit performance type"
                            className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => handleDelete(performance.id)}
                            title="পারফরম্যান্সের ধরন মুছুন / Delete performance type"
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
              className="mt-4 text-red-500 bg-red-400/10 p-3 rounded-lg animate-fadeIn"
            >
              {isDeleting
                ? 'পারফরম্যান্সের ধরন মুছে ফেলা হচ্ছে...'
                : `পারফরম্যান্সের ধরন মুছে ফেলতে ত্রুটি: ${deleteError?.status || 'অজানা'} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
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
                {modalAction === 'create' && 'নতুন পারফরম্যান্সের ধরন নিশ্চিত করুন'}
                {modalAction === 'update' && 'পারফরম্যান্সের ধরন আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'পারফরম্যান্সের ধরন মুছে ফেলা নিশ্চিত করুন'}
                {modalAction === 'toggle' && 'পারফরম্যান্সের ধরনের স্থিতি পরিবর্তন নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন পারফরম্যান্সের ধরন তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে পারফরম্যান্সের ধরন আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই পারফরম্যান্সের ধরনটি মুছে ফেলতে চান?'}
                {modalAction === 'toggle' &&
                  `আপনি কি নিশ্চিত যে পারফরম্যান্সের ধরনটি ${modalData?.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করতে চান?`}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন / Cancel"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন / Confirm"
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

export default PerformanceType;