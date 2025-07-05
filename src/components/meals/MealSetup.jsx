import React, { useState, useRef, useEffect } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import Select from 'react-select';
import {
  useGetMealSetupApiQuery,
  useCreateMealSetupApiMutation,
  useUpdateMealSetupApiMutation,
  useDeleteMealSetupApiMutation,
} from '../../redux/features/api/meal/mealSetupApi';
import { useGetMealsNameApiQuery } from '../../redux/features/api/meal/mealsNameApi';
import { useGetMealItemApiQuery } from '../../redux/features/api/meal/mealItemApi';
import { Toaster, toast } from 'react-hot-toast';

const MealSetup = () => {
  const [formData, setFormData] = useState({
    day: 'SUN',
    is_active: false,
    meal_name: '',
    meal_item: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch data
  const { data: mealSetups = [], isLoading: setupsLoading, error: setupsError, refetch } = useGetMealSetupApiQuery();
  const { data: mealNames = [], isLoading: namesLoading, error: namesError } = useGetMealsNameApiQuery();
  const { data: mealItems = [], isLoading: itemsLoading, error: itemsError } = useGetMealItemApiQuery();

  // Mutations
  const [createMealSetup, { isLoading: isCreating, error: createError }] = useCreateMealSetupApiMutation();
  const [updateMealSetup, { isLoading: isUpdating, error: updateError }] = useUpdateMealSetupApiMutation();
  const [deleteMealSetup, { isLoading: isDeleting, error: deleteError }] = useDeleteMealSetupApiMutation();

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validate form data
  const validateForm = () => {
    if (!formData.day) {
      toast.error('অনুগ্রহ করে সপ্তাহের দিন নির্বাচন করুন');
      return false;
    }
    if (!formData.meal_name) {
      toast.error('অনুগ্রহ করে খাবারের ধরন নির্বাচন করুন');
      return false;
    }
    if (formData.meal_item.length === 0) {
      toast.error('অনুগ্রহ করে কমপক্ষে একটি খাবারের আইটেম নির্বাচন করুন');
      return false;
    }
    return true;
  };

  // Handle form input changes
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Handle meal items checkbox changes
  const handleMealItemChange = (itemId) => {
    setFormData((prev) => {
      const mealItems = prev.meal_item.includes(itemId)
        ? prev.meal_item.filter((id) => id !== itemId)
        : [...prev.meal_item, itemId];
      return { ...prev, meal_item: mealItems };
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      id: editingId,
      day: formData.day,
      is_active: formData.is_active,
      meal_name: Number(formData.meal_name),
      meal_item: formData.meal_item,
    };

    setModalAction(editingId ? 'update' : 'create');
    setModalData(payload);
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEdit = (setup) => {
    setFormData({
      day: setup.day,
      is_active: setup.is_active,
      meal_name: setup.meal_name.toString(),
      meal_item: setup.meal_item,
    });
    setEditingId(setup.id);
  };

  // Handle toggle active status
  const handleToggleActive = (setup) => {
    setModalAction('toggle');
    setModalData({
      id: setup.id,
      day: setup.day,
      is_active: !setup.is_active,
      meal_name: setup.meal_name,
      meal_item: setup.meal_item,
    });
    setIsModalOpen(true);
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
        await createMealSetup({
          day: modalData.day,
          is_active: modalData.is_active,
          meal_name: modalData.meal_name,
          meal_item: modalData.meal_item,
        }).unwrap();
        toast.success('খাবার সেটআপ সফলভাবে তৈরি করা হয়েছে!');
        setFormData({ day: 'SUN', is_active: true, meal_name: '', meal_item: [] });
        setIsDropdownOpen(false);
      } else if (modalAction === 'update') {
        await updateMealSetup(modalData).unwrap();
        toast.success('খাবার সেটআপ সফলভাবে আপডেট করা হয়েছে!');
        setEditingId(null);
        setFormData({ day: 'SUN', is_active: true, meal_name: '', meal_item: [] });
        setIsDropdownOpen(false);
      } else if (modalAction === 'delete') {
        await deleteMealSetup(modalData.id).unwrap();
        toast.success('খাবার সেটআপ সফলভাবে মুছে ফেলা হয়েছে!');
      } else if (modalAction === 'toggle') {
        await updateMealSetup(modalData).unwrap();
        toast.success(`খাবার সেটআপ এখন ${modalData.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}!`);
      }
      refetch();
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি করা' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'}:`, err);
      toast.error(`খাবার সেটআপ ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'} ব্যর্থ: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Days of the week for dropdown (with Bangla translations)
  const days = [
    { value: 'SUN', label: 'রবিবার' },
    { value: 'MON', label: 'সোমবার' },
    { value: 'TUE', label: 'মঙ্গলবার' },
    { value: 'WED', label: 'বুধবার' },
    { value: 'THU', label: 'বৃহস্পতিবার' },
    { value: 'FRI', label: 'শুক্রবার' },
    { value: 'SAT', label: 'শনিবার' },
  ];

  // Custom styles for react-select
  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'transparent',
      borderColor: '#9d9087',
      borderRadius: '8px',
      paddingLeft: '0.75rem',
      padding:'3px',
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': { borderColor: '#441a05' },
      '&:focus': { outline: 'none', boxShadow: 'none' },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#441a05',
      opacity: 0.7,
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      zIndex: 9999,
      marginTop: '4px',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
      backgroundColor: isSelected ? '#DB9E30' : isFocused ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
      cursor: 'pointer',
      '&:active': { backgroundColor: '#DB9E30' },
    }),
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

      <div>
        {/* Add/Edit Meal Setup Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            {editingId ? (
              <FaEdit className="text-4xl text-[#441a05]" />
            ) : (
              <IoAddCircle className="text-4xl text-[#441a05]" />
            )}
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              {editingId ? 'খাবার সেটআপ সম্পাদনা করুন' : 'নতুন খাবার সেটআপ যোগ করুন'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className='flex items-center gap-5'>
              {/* <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleCheckboxChange}
                  className="hidden"
                  disabled={isCreating || isUpdating}
                  aria-label="সক্রিয়"
                  title="সক্রিয় / Active"
                />
                <span
                  className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${formData.is_active
                      ? 'bg-[#DB9E30] border-[#DB9E30]'
                      : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                    }`}
                >
                  {formData.is_active && (
                    <svg
                      className="w-4 h-4 text-[#441a05] animate-scaleIn"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="ml-2 text-sm text-[#441a05]">সক্রিয়</span>
              </label>
            </div> */}
              <Select
                options={days}
                value={days.find((day) => day.value === formData.day) || null}
                onChange={(selected) => handleInputChange('day', selected ? selected.value : 'SUN')}
                isDisabled={isCreating || isUpdating}
                placeholder="সপ্তাহের দিন নির্বাচন"
                className="react-select-container w-full"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isSearchable={false}
                aria-label="সপ্তাহের দিন"
                title="সপ্তাহের দিন নির্বাচন "
                styles={selectStyles}
              />
            </div>
            <div>
              <Select
                options={mealNames.map((meal) => ({ value: meal.id.toString(), label: meal.name }))}
                value={
                  formData.meal_name
                    ? { value: formData.meal_name, label: mealNames.find((meal) => meal.id.toString() === formData.meal_name)?.name || 'অজানা' }
                    : null
                }
                onChange={(selected) => handleInputChange('meal_name', selected ? selected.value : '')}
                isDisabled={isCreating || isUpdating || namesLoading}
                placeholder="খাবারের ধরন নির্বাচন"
                className="react-select-container"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isSearchable={false}
                aria-label="খাবারের ধরন"
                title="খাবারের ধরন"
                styles={selectStyles}
              />
            </div>
            <Select
              options={mealItems.map((item) => ({ value: item.id.toString(), label: item.name }))}
              value={formData.meal_item.map((itemId) =>
                ({ value: itemId.toString(), label: mealItems.find((item) => item.id === itemId)?.name || 'অজানা' })
              )}
              onChange={(selected) => handleInputChange('meal_item', selected ? selected.map(opt => Number(opt.value)) : [])}
              isDisabled={isCreating || isUpdating || itemsLoading}
              isMulti
              placeholder="খাবারের আইটেম নির্বাচন"
              className="react-select-container"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              isSearchable={false}
              aria-label="খাবারের আইটেম নির্বাচন করুন"
              title="খাবারের আইটেম নির্বাচন করুন / Select meal items"
              styles={selectStyles}
            />
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              title={editingId ? 'খাবার সেটআপ আপডেট করুন / Update meal setup' : 'নতুন খাবার সেটআপ তৈরি করুন / Create a new meal setup'}
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${isCreating || isUpdating ? 'cursor-not-allowed' : 'hover:text-white hover:shadow-md'
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
                  <span>{editingId ? 'সেটআপ আপডেট করুন' : 'সেটআপ তৈরি করুন'}</span>
                </span>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setFormData({ day: 'SUN', is_active: true, meal_name: '', meal_item: [] });
                  setEditingId(null);
                  setIsDropdownOpen(false);
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
              id="setup-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              ত্রুটি: {(createError || updateError).status || 'অজানা'} - {JSON.stringify((createError || updateError).data || {})}
            </div>
          )}
        </div>

        {/* Meal Setups Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">খাবার সেটআপের তালিকা</h3>
          {setupsLoading || namesLoading || itemsLoading ? (
            <p className="p-4 text-[#441a05]/70">খাবার সেটআপ লোড হচ্ছে...</p>
          ) : setupsError || namesError || itemsError ? (
            <p className="p-4 text-red-400">
              খাবার সেটআপ লোড করতে ত্রুটি: {(setupsError || namesError || itemsError).status || 'অজানা'} -{' '}
              {JSON.stringify((setupsError || namesError || itemsError).data || {})}
            </p>
          ) : mealSetups?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো খাবার সেটআপ উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আইডি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      দিন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      খাবারের ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      খাবারের আইটেম
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
                  {mealSetups?.map((setup, index) => (
                    <tr
                      key={setup.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {setup.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {days.find((day) => day.value === setup.day)?.label || setup.day}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {mealNames.find((meal) => meal.id === setup.meal_name)?.name || 'অজানা'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {setup.meal_item
                          .map((itemId) => mealItems.find((item) => item.id === itemId)?.name || 'অজানা')
                          .join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setup.is_active}
                            onChange={() => handleToggleActive(setup)}
                            className="hidden"
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${setup.is_active
                                ? 'bg-[#DB9E30] border-[#DB9E30]'
                                : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                              }`}
                          >
                            {setup.is_active && (
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
                        {new Date(setup.created_at).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(setup.updated_at).toLocaleString('bn-BD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(setup)}
                          title="খাবার সেটআপ সম্পাদনা করুন / Edit meal setup"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(setup.id)}
                          title="খাবার সেটআপ মুছুন / Delete meal setup"
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
              style={{ animationDelay: '0.4s' }}
            >
              {isDeleting
                ? 'খাবার সেটআপ মুছে ফেলা হচ্ছে...'
                : `খাবার সেটআপ মুছে ফেলতে ত্রুটি: ${deleteError?.status || 'অজানা'} - ${JSON.stringify(
                  deleteError?.data || {}
                )}`}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'create' && 'নতুন খাবার সেটআপ নিশ্চিত করুন'}
                {modalAction === 'update' && 'খাবার সেটআপ আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'খাবার সেটআপ মুছে ফেলা নিশ্চিত করুন'}
                {modalAction === 'toggle' && 'খাবার সেটআপের স্থিতি পরিবর্তন নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন খাবার সেটআপ তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে খাবার সেটআপ আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই খাবার সেটআপটি মুছে ফেলতে চান?'}
                {modalAction === 'toggle' && `আপনি কি নিশ্চিত যে খাবার সেটআপটি ${modalData?.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করতে চান?`}
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

export default MealSetup;