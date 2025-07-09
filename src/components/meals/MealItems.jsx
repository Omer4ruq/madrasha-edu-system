import React, { useState } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import { useCreateMealItemApiMutation, useDeleteMealItemApiMutation, useGetMealItemApiQuery, useUpdateMealItemApiMutation } from '../../redux/features/api/meal/mealItemApi';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from 'react-redux'; // Import useSelector
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi'; // Import permission hook


const MealItems = () => {
  const { user, group_id } = useSelector((state) => state.auth); // Get user and group_id
  const [formData, setFormData] = useState({ name: '', is_active: true });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_meal_item') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_meal_item') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_meal_item') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_meal_item') || false;


  // Fetch meal items
  const { data: mealItems = [], isLoading: isItemsLoading, error: itemsError, refetch } = useGetMealItemApiQuery(undefined, { skip: !hasViewPermission });
  const [createMealItem, { isLoading: isCreating, error: createError }] = useCreateMealItemApiMutation();
  const [updateMealItem, { isLoading: isUpdating, error: updateError }] = useUpdateMealItemApiMutation();
  const [deleteMealItem, { isLoading: isDeleting, error: deleteError }] = useDeleteMealItemApiMutation();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId && !hasChangePermission) {
      toast.error('খাবার সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    if (!editingId && !hasAddPermission) {
      toast.error('নতুন খাবার যোগ করার অনুমতি নেই।');
      return;
    }

    const name = formData.name.trim();
    if (!name) {
      toast.error('অনুগ্রহ করে খাবারের নাম লিখুন');
      return;
    }
    if (mealItems?.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== editingId)) {
      toast.error('এই খাবারের নাম ইতিমধ্যে বিদ্যমান!');
      return;
    }

    setModalAction(editingId ? 'update' : 'create');
    setModalData({
      id: editingId,
      name: name,
      is_active: formData.is_active,
    });
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEdit = (item) => {
    if (!hasChangePermission) {
      toast.error('খাবার সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setFormData({ name: item.name, is_active: item.is_active });
    setEditingId(item.id);
  };

  // Handle toggle active status
  const handleToggleActive = (item) => {
    if (!hasChangePermission) {
      toast.error('খাবারের স্থিতি পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    setModalAction('toggle');
    setModalData({
      id: item.id,
      name: item.name,
      is_active: !item.is_active,
    });
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('খাবার মুছতে অনুমতি নেই।');
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
        if (!hasAddPermission) { toast.error('খাবার তৈরি করার অনুমতি নেই।'); return; }
        await createMealItem({ name: modalData.name, is_active: modalData.is_active }).unwrap();
        toast.success('খাবার সফলভাবে তৈরি করা হয়েছে!');
        setFormData({ name: '', is_active: true });
      } else if (modalAction === 'update') {
        if (!hasChangePermission) { toast.error('খাবার আপডেট করার অনুমতি নেই।'); return; }
        await updateMealItem(modalData).unwrap();
        toast.success('খাবার সফলভাবে আপডেট করা হয়েছে!');
        setEditingId(null);
        setFormData({ name: '', is_active: true });
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) { toast.error('খাবার মুছে ফেলার অনুমতি নেই।'); return; }
        await deleteMealItem(modalData.id).unwrap();
        toast.success('খাবার সফলভাবে মুছে ফেলা হয়েছে!');
      } else if (modalAction === 'toggle') {
        if (!hasChangePermission) { toast.error('খাবারের স্থিতি পরিবর্তন করার অনুমতি নেই।'); return; }
        await updateMealItem(modalData).unwrap();
        toast.success(`খাবার ${modalData.name} এখন ${modalData.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}!`);
      }
      refetch();
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি করা' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'}:`, err);
      toast.error(`খাবার ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'} ব্যর্থ: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  const isFormDisabled = isCreating || isUpdating || (!editingId && !hasAddPermission) || (editingId && !hasChangePermission);

  if (isItemsLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-4 p-6 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 animate-fadeIn">
          <FaSpinner className="animate-spin text-3xl text-[#DB9E30]" />
          <span className="text-lg font-medium text-[#441a05]">
            লোড হচ্ছে...
          </span>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="p-4 text-red-400 animate-fadeIn text-center text-lg font-semibold">
        এই পৃষ্ঠাটি দেখার অনুমতি নেই।
      </div>
    );
  }

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
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
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

      <div>
        {/* Add/Edit Meal Item Form */}
        {(hasAddPermission || hasChangePermission) && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              {editingId ? (
                <FaEdit className="text-4xl text-[#441a05]" />
              ) : (
                <IoAddCircle className="text-4xl text-[#441a05]" />
              )}
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
                {editingId ? 'খাবার সম্পাদনা করুন' : 'নতুন খাবার যোগ করুন'}
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
                placeholder="খাবারের নাম"
                disabled={isFormDisabled}
                aria-label="খাবারের নাম"
                title="খাবারের নাম লিখুন (উদাহরণ: চিকেন বিরিয়ানি) / Enter meal item name (e.g., Chicken Biryani)"
                aria-describedby={createError || updateError ? 'meal-error' : undefined}
              />
              <button
                type="submit"
                disabled={isFormDisabled}
                title={editingId ? 'খাবার আপডেট করুন / Update meal item' : 'নতুন খাবার তৈরি করুন / Create a new meal item'}
                className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isFormDisabled ? 'cursor-not-allowed' : 'hover:text-white hover:shadow-md'
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
                    <span>{editingId ? 'খাবার আপডেট করুন' : 'খাবার তৈরি করুন'}</span>
                  </span>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: '', is_active: true });
                    setEditingId(null);
                  }}
                  title="সম্পাদনা বাতিল করুন / Cancel editing"
                  className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
                >
                  বাতিল
                </button>
              )}
            </form>
            {(createError || updateError) && (
              <div
                id="meal-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: '0.4s' }}
              >
                ত্রুটি: {(createError || updateError).status || 'অজানা'} - {JSON.stringify((createError || updateError).data || {})}
              </div>
            )}
          </div>
        )}

        {/* Meal Items Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">খাবারের তালিকা</h3>
          {isItemsLoading ? (
            <p className="p-4 text-[#441a05]/70">খাবার লোড হচ্ছে...</p>
          ) : itemsError ? (
            <p className="p-4 text-red-400">
              খাবার লোড করতে ত্রুটি: {itemsError.status || 'অজানা'} - {JSON.stringify(itemsError.data || {})}
            </p>
          ) : mealItems?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো খাবার উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আইডি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      নাম
                    </th>
                    {hasChangePermission && ( // Conditionally render active column
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        সক্রিয়
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      তৈরির সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আপডেটের সময়
                    </th>
                    {(hasChangePermission || hasDeletePermission) && ( // Conditionally render actions column
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ক্রিয়াকলাপ
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {mealItems?.map((item, index) => (
                    <tr
                      key={item.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {item.name}
                      </td>
                      {hasChangePermission && ( // Conditionally render active toggle
                        <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.is_active}
                              onChange={() => handleToggleActive(item)}
                              className="hidden"
                              disabled={!hasChangePermission} // Disable if no change permission
                            />
                            <span
                              className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${
                                item.is_active
                                  ? 'bg-[#DB9E30] border-[#DB9E30]'
                                  : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                              }`}
                            >
                              {item.is_active && (
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
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(item.created_at).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(item.updated_at).toLocaleString('bn-BD')}
                      </td>
                      {(hasChangePermission || hasDeletePermission) && ( // Conditionally render action buttons
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {hasChangePermission && (
                            <button
                              onClick={() => handleEdit(item)}
                              title="খাবার সম্পাদনা করুন / Edit meal item"
                              className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              title="খাবার মুছুন / Delete meal item"
                              className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(isDeleting || deleteError) && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              {isDeleting
                ? 'খাবার মুছে ফেলা হচ্ছে...'
                : `খাবার মুছে ফেলতে ত্রুটি: ${deleteError?.status || 'অজানা'} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (hasAddPermission || hasChangePermission || hasDeletePermission) && ( // Only show if user has relevant permissions
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'create' && 'নতুন খাবার নিশ্চিত করুন'}
                {modalAction === 'update' && 'খাবার আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'খাবার মুছে ফেলা নিশ্চিত করুন'}
                {modalAction === 'toggle' && 'খাবারের স্থিতি পরিবর্তন নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন খাবার তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে খাবার আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই খাবারটি মুছে ফেলতে চান?'}
                {modalAction === 'toggle' && `আপনি কি নিশ্চিত যে খাবারটি ${modalData?.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করতে চান?`}
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

export default MealItems;