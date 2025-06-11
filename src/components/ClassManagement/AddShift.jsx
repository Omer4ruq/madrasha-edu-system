import React, { useState } from 'react';
import {
  useCreateStudentShiftApiMutation,
  useGetStudentShiftApiQuery,
  useUpdateStudentShiftApiMutation,
  useDeleteStudentShiftApiMutation,
} from '../../redux/features/api/student/studentShiftApi';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoTime } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';

const AddShift = () => {
  const [shiftName, setShiftName] = useState('');
  const [editShiftId, setEditShiftId] = useState(null);
  const [editShiftName, setEditShiftName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // API hooks
  const { data: shiftData, isLoading: isShiftLoading, error: shiftDataError } = useGetStudentShiftApiQuery();
  const [createShift, { isLoading: isCreating, error: createError }] = useCreateStudentShiftApiMutation();
  const [updateShift] = useUpdateStudentShiftApiMutation();
  const [deleteShift] = useDeleteStudentShiftApiMutation();

  // Handle form submission for creating a new shift
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shiftName.trim()) {
      toast.error('অনুগ্রহ করে একটি শিফটের নাম লিখুন');
      return;
    }
    setModalAction('create');
    setModalData({ name: shiftName.trim(), is_active: true });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (shift) => {
    setEditShiftId(shift.id);
    setEditShiftName(shift.name);
  };

  // Handle update shift
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editShiftName.trim()) {
      toast.error('অনুগ্রহ করে একটি শিফটের নাম লিখুন');
      return;
    }
    const selectedShift = shiftData?.find((shift) => shift.id === editShiftId);
    if (!selectedShift) {
      toast.error('নির্বাচিত শিফট পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      return;
    }
    setModalAction('update');
    setModalData({ id: editShiftId, name: editShiftName.trim(), is_active: selectedShift.is_active || true });
    setIsModalOpen(true);
  };

  // Handle toggle active status
  const handleToggleActive = (shift) => {
    if (!shift?.id) {
      toast.error('অবৈধ শিফট আইডি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      return;
    }
    setModalAction('toggle');
    setModalData({ id: shift.id, name: shift.name, is_active: !shift.is_active });
    setIsModalOpen(true);
  };

  // Handle delete shift
  const handleDelete = (id) => {
    if (!id) {
      toast.error('অবৈধ শিফট আইডি। অনুগ্রহ করে আবার চেষ্টা করুন।');
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
        await createShift(modalData).unwrap();
        toast.success('শিফট সফলভাবে তৈরি করা হয়েছে!');
        setShiftName('');
      } else if (modalAction === 'update') {
        await updateShift({ id: modalData.id, ...modalData }).unwrap();
        toast.success('শিফট সফলভাবে আপডেট করা হয়েছে!');
        setEditShiftId(null);
        setEditShiftName('');
      } else if (modalAction === 'delete') {
        await deleteShift(modalData.id).unwrap();
        toast.success('শিফট সফলভাবে মুছে ফেলা হয়েছে!');
      } else if (modalAction === 'toggle') {
        await updateShift({ id: modalData.id, ...modalData }).unwrap();
        toast.success(`শিফট ${modalData.name} এখন ${modalData.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}!`);
      }
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'}:`, err);
      toast.error(`শিফট ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'} ব্যর্থ: ${err.status || 'অজানা ত্রুটি'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
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

      <div className="mx-auto">
        {/* Form to Add Shift */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoTime className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">নতুন শিফট যোগ করুন</h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <input
              type="text"
              id="shiftName"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="শিফটের নাম লিখুন (যেমন, দিনের শিফট)"
              disabled={isCreating}
              aria-label="শিফটের নাম"
              aria-describedby={createError ? "shift-error" : undefined}
            />
            <button
              type="submit"
              disabled={isCreating}
              title="নতুন শিফট তৈরি করুন"
              className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isCreating ? 'cursor-not-allowed opacity-60' : 'hover:text-white'
              }`}
            >
              {isCreating ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>তৈরি করা হচ্ছে...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>শিফট তৈরি করুন</span>
                </span>
              )}
            </button>
          </form>
          {createError && (
            <div
              id="shift-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              ত্রুটি: {createError.status || 'অজানা'} - {JSON.stringify(createError.data || {})}
            </div>
          )}
        </div>

        {/* Edit Shift Form */}
        {editShiftId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">শিফট সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              <input
                type="text"
                id="editShiftName"
                value={editShiftName}
                onChange={(e) => setEditShiftName(e.target.value)}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="শিফটের নাম সম্পাদনা করুন (যেমন, দিনের শিফট)"
                aria-label="শিফটের নাম সম্পাদনা"
                aria-describedby="edit-shift-error"
              />
              <button
                type="submit"
                title="শিফট আপডেট করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                শিফট আপডেট করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditShiftId(null);
                  setEditShiftName('');
                }}
                title="সম্পাদনা বাতিল করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
          </div>
        )}

        {/* Shifts Table */}
        <div className="bg-black/10 px-6 py-2 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] border border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">শিফটের তালিকা</h3>
          {isShiftLoading ? (
            <p className="p-4 text-[#441a05]/70">শিফট লোড হচ্ছে...</p>
          ) : shiftDataError ? (
            <p className="p-4 text-red-400">
              শিফট লোড করতে ত্রুটি: {shiftDataError.status || 'অজানা'} -{' '}
              {JSON.stringify(shiftDataError.data || {})}
            </p>
          ) : shiftData?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো শিফট উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শিফটের নাম
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
                  {shiftData?.map((shift, index) => (
                    <tr
                      key={shift.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {shift.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shift.is_active}
                            onChange={() => handleToggleActive(shift)}
                            className="hidden"
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                              shift.is_active
                                ? 'bg-[#DB9E30] border-[#DB9E30]'
                                : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                            }`}
                          >
                            {shift.is_active && (
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(shift.created_at).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(shift.updated_at).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(shift)}
                          title="শিফট সম্পাদনা করুন"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(shift.id)}
                          title="শিফট মুছুন"
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
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'create' && 'নতুন শিফট নিশ্চিত করুন'}
                {modalAction === 'update' && 'শিফট আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'শিফট মুছে ফেলা নিশ্চিত করুন'}
                {modalAction === 'toggle' && 'শিফটের স্থিতি পরিবর্তন নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন শিফট তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে শিফট আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই শিফটটি মুছে ফেলতে চান?'}
                {modalAction === 'toggle' && `আপনি কি নিশ্চিত যে শিফটটি ${modalData?.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করতে চান?`}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
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

export default AddShift;