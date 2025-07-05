import React, { useState } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useCreateCleanReportTypeApiMutation, useDeleteCleanReportTypeApiMutation, useGetCleanReportTypeApiQuery, useUpdateCleanReportTypeApiMutation } from '../../redux/features/api/clean/cleanReportTypeApi';

const CleanType = () => {
  // State for form input, editing, and modal
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // For forced re-rendering

  // RTK Query hooks
  const {
    data: cleanReportTypes = [],
    isLoading,
    error,
    refetch,
  } = useGetCleanReportTypeApiQuery();
  const [createCleanReportType, { isLoading: isCreating, error: createError }] =
    useCreateCleanReportTypeApiMutation();
  const [updateCleanReportType, { isLoading: isUpdating, error: updateError }] =
    useUpdateCleanReportTypeApiMutation();
  const [deleteCleanReportType, { isLoading: isDeleting, error: deleteError }] =
    useDeleteCleanReportTypeApiMutation();

  // Handle form submission for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('অনুগ্রহ করে পরিচ্ছন্নতা রিপোর্টের ধরনের নাম লিখুন');
      return;
    }
    if (
      cleanReportTypes?.some(
        (item) => item.name.toLowerCase() === trimmedName.toLowerCase() && item.id !== editingId
      )
    ) {
      toast.error('এই পরিচ্ছন্নতা রিপোর্টের ধরন ইতিমধ্যে বিদ্যমান!');
      return;
    }

    setModalAction(editingId ? 'update' : 'create');
    setModalData({ id: editingId, name: trimmedName });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setName(item.name);
  };

  // Handle delete button click
  const handleDelete = (id) => {
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        await createCleanReportType({ name: modalData.name }).unwrap();
        toast.success('পরিচ্ছন্নতা রিপোর্টের ধরন সফলভাবে তৈরি করা হয়েছে!');
        setName('');
      } else if (modalAction === 'update') {
        await updateCleanReportType({ id: modalData.id, name: modalData.name }).unwrap();
        toast.success('পরিচ্ছন্নতা রিপোর্টের ধরন সফলভাবে আপডেট করা হয়েছে!');
        setEditingId(null);
        setName('');
      } else if (modalAction === 'delete') {
        await deleteCleanReportType(modalData.id).unwrap();
        toast.success('পরিচ্ছন্নতা রিপোর্টের ধরন সফলভাবে মুছে ফেলা হয়েছে!');
      }
      refetch();
      setRefreshKey((prev) => prev + 1); // Force table re-render
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি করা' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'}:`, err);
      toast.error(
        `পরিচ্ছন্নতা রিপোর্টের ধরন ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'} ব্যর্থ: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || {})}`
      );
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setEditingId(null);
    setName('');
  };

  return (
    <div className="py-8 w-full relative">

      <style>
        {`@keyframes fadeIn {
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
        {/* Add/Edit Clean Report Type Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            {editingId ? (
              <FaEdit className="text-4xl text-[#441a05]" />
            ) : (
              <IoAddCircle className="text-4xl text-[#441a05]" />
            )}
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              {editingId ? 'পরিচ্ছন্নতার ধরন সম্পাদনা করুন' : 'নতুন পরিচ্ছন্নতার ধরন যোগ করুন'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              id="cleanReportTypeName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="পরিচ্ছন্নতার ধরন"
              disabled={isCreating || isUpdating}
              aria-label="পরিচ্ছন্নতা রিপোর্টের ধরন"
              title="পরিচ্ছন্নতা রিপোর্টের ধরন লিখুন (উদাহরণ: দৈনিক পরিচ্ছন্নতা) / Enter clean report type (e.g., Daily Cleaning)"
              aria-describedby={createError || updateError ? 'clean-report-error' : undefined}
            />
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              title={
                editingId
                  ? 'পরিচ্ছন্নতা রিপোর্টের ধরন আপডেট করুন / Update clean report type'
                  : 'নতুন পরিচ্ছন্নতা রিপোর্টের ধরন তৈরি করুন / Create a new clean report type'
              }
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isCreating || isUpdating ? 'cursor-not-allowed' : 'hover:text-white hover:shadow-md'
              }`}
            >
              {(isCreating || isUpdating) ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>{editingId ? 'আপডেট করা হচ্ছে...' : 'তৈরি করা হচ্ছে...'}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>{editingId ? 'রিপোর্ট আপডেট করুন' : 'রিপোর্ট তৈরি করুন'}</span>
                </span>
              )}
            </button>
            {editingId && (
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
              id="clean-report-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              ত্রুটি: {(createError || updateError).status || 'অজানা'} -{' '}
              {JSON.stringify((createError || updateError).data || {})}
            </div>
          )}
        </div>

        {/* Clean Report Types Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
            পরিচ্ছন্নতার ধরনের তালিকা
          </h3>
          {isLoading ? (
            <p className="p-4 text-[#441a05]/70">পরিচ্ছন্নতার ধরন লোড হচ্ছে...</p>
          ) : error ? (
            <p className="p-4 text-red-400">
              পরিচ্ছন্নতার ধরন লোড করতে ত্রুটি: {error.status || 'আজানা'} -{' '}
              {JSON.stringify(error.data || {})}
            </p>
          ) : cleanReportTypes?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো পরিচ্ছন্নতার ধরন উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto" key={refreshKey}>
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      পরিচ্ছন্নতার ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রিয়াকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {cleanReportTypes?.map((item, index) => (
                    <tr
                      key={item.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(item)}
                          title="পরিচ্ছন্নতা রিপোর্টের ধরন সম্পাদনা করুন / Edit clean report type"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="পরিচ্ছন্নতা রিপোর্টের ধরন মুছুন / Delete clean report type"
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
              className="mt-4 text-red-500 bg-red-400/10 p-3 rounded-lg animate-fadeIn"
            >
              {isDeleting
                ? 'পরিচ্ছন্নতা রিপোর্টের ধরন মুছে ফেলা হচ্ছে...'
                : `পরিচ্ছন্নতা রিপোর্টের ধরন মুছে ফেলতে ত্রুটি: ${deleteError?.status || 'অজানা'} - ${JSON.stringify(
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
                {modalAction === 'create' && 'নতুন পরিচ্ছন্নতা রিপোর্টের ধরন নিশ্চিত করুন'}
                {modalAction === 'update' && 'পরিচ্ছন্নতার ধরন আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'পরিচ্ছন্নতার ধরন মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন পরিচ্ছন্নতার ধরন তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে পরিচ্ছন্নতার ধরন আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই পরিচ্ছন্নতার ধরনটি মুছে ফেলতে চান?'}
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

export default CleanType;