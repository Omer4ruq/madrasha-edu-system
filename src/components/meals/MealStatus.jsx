import React, { useState, useRef, useEffect } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import Select from 'react-select';
import { Toaster, toast } from 'react-hot-toast';
import { useGetMealStatusesQuery, useCreateMealStatusMutation, useUpdateMealStatusMutation, useDeleteMealStatusMutation } from '../../redux/features/api/meal/mealStatusApi';
import { useSearchJointUsersQuery } from '../../redux/features/api/jointUsers/jointUsersApi';
import selectStyles from '../../utilitis/selectStyles';

const MealStatus = () => {
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    status: 'ACTIVE',
    remarks: '',
    meal_user: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch data
  const { data: mealStatuses = [], isLoading: statusesLoading, error: statusesError, refetch } = useGetMealStatusesQuery();
  const { data: jointUsers = [], isLoading: usersLoading } = useSearchJointUsersQuery(searchTerm, { skip: searchTerm.length < 3 });

  // Mutations
  const [createMealStatus, { isLoading: isCreating, error: createError }] = useCreateMealStatusMutation();
  const [updateMealStatus, { isLoading: isUpdating, error: updateError }] = useUpdateMealStatusMutation();
  const [deleteMealStatus, { isLoading: isDeleting, error: deleteError }] = useDeleteMealStatusMutation();

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validate form data
  const validateForm = () => {
    if (!formData.meal_user) {
      toast.error('অনুগ্রহ করে একজন ব্যবহারকারী নির্বাচন করুন');
      return false;
    }
    if (!formData.start_time) {
      toast.error('অনুগ্রহ করে শুরুর তারিখ নির্বাচন করুন');
      return false;
    }
    if (!formData.end_time) {
      toast.error('অনুগ্রহ করে শেষের তারিখ নির্বাচন করুন');
      return false;
    }
    if (new Date(formData.start_time) > new Date(formData.end_time)) {
      toast.error('শুরুর তারিখ শেষের তারিখের পরে হতে পারে না');
      return false;
    }
    if (!formData.status) {
      toast.error('অনুগ্রহ করে স্থিতি নির্বাচন করুন');
      return false;
    }
    return true;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setFormData({ ...formData, meal_user: user.id });
    setSearchTerm(user.name || user.user_id);
    setIsUserDropdownOpen(false);
  };

  // Handle date click
  const handleDateClick = (e) => {
    if (e.target.type === 'date') {
      e.target.showPicker(); // Trigger calendar dropdown on click
    }
  };

  // Handle status toggle
  const handleToggleStatus = (status) => {
    setModalAction('toggle');
    setModalData({
      id: status.id,
      start_time: status.start_time,
      end_time: status.end_time,
      status: status.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVE',
      remarks: status.remarks,
      meal_user: status.meal_user,
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      id: editingId,
      start_time: formData.start_time,
      end_time: formData.end_time,
      status: formData.status,
      remarks: formData.remarks,
      meal_user: formData.meal_user,
    };

    setModalAction(editingId ? 'update' : 'create');
    setModalData(payload);
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEdit = (status) => {
    setFormData({
      start_time: status.start_time,
      end_time: status.end_time,
      status: status.status,
      remarks: status.remarks || '',
      meal_user: status.meal_user,
    });
    setSearchTerm(jointUsers.find((user) => user.id === status.meal_user)?.name || '');
    setEditingId(status.id);
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
        await createMealStatus(modalData).unwrap();
        toast.success('খাবারের স্থিতি সফলভাবে তৈরি করা হয়েছে!');
        setFormData({
          start_time: '',
          end_time: '',
          status: 'ACTIVE',
          remarks: '',
          meal_user: null,
        });
        setSearchTerm('');
      } else if (modalAction === 'update') {
        await updateMealStatus(modalData).unwrap();
        toast.success('খাবারের স্থিতি সফলভাবে আপডেট করা হয়েছে!');
        setEditingId(null);
        setFormData({
          start_time: '',
          end_time: '',
          status: 'ACTIVE',
          remarks: '',
          meal_user: null,
        });
        setSearchTerm('');
      } else if (modalAction === 'delete') {
        await deleteMealStatus(modalData.id).unwrap();
        toast.success('খাবারের স্থিতি সফলভাবে মুছে ফেলা হয়েছে!');
      } else if (modalAction === 'toggle') {
        await updateMealStatus(modalData).unwrap();
        toast.success(`খাবারের স্থিতি এখন ${modalData.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}!`);
      }
      refetch();
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি করা' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'}:`, err);
      toast.error(`খাবারের স্থিতি ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'} ব্যর্থ: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Status options
  const statusOptions = [
    { value: 'ACTIVE', label: 'সক্রিয়' },
    { value: 'DEACTIVATE', label: 'নিষ্ক্রিয়' },
  ];

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
        {/* Add/Edit Meal Status Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            {editingId ? (
              <FaEdit className="text-3xl text-[#441a05]" />
            ) : (
              <IoAddCircle className="text-3xl text-[#441a05]" />
            )}
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              {editingId ? 'খাবারের স্থিতি সম্পাদনা করুন' : 'নতুন খাবারের স্থিতি যোগ করুন'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div ref={dropdownRef}>
              <label className="block text-sm font-medium text-[#441a05] mb-1">ব্যবহারকারী নির্বাচন করুন</label>
              <input
                id="user_search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsUserDropdownOpen(true)}
                placeholder="নাম বা ব্যবহারকারীর আইডি লিখুন (ন্যূনতম ৩ অক্ষর)"
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isCreating || isUpdating}
                aria-label="ব্যবহারকারী নির্বাচন করুন"
                title="ব্যবহারকারী নির্বাচন করুন / Select user"
                required
              />
              {isUserDropdownOpen && searchTerm.length >= 3 && (
                <div className="absolute z-[10000] mt-1 w-full bg-black/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {usersLoading ? (
                    <p className="px-4 py-2 text-sm text-[#441a05]/70">লোড হচ্ছে...</p>
                  ) : jointUsers.length > 0 ? (
                    jointUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm text-[#441a05]"
                      >
                        {user.name || user.user_id}
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-sm text-[#441a05]/70">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-[#441a05] mb-1">
                শুরুর তারিখ
              </label>
              <input
                id="start_time"
                type="date"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                onClick={handleDateClick}
                className="w-full bg-transparent outline-none text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 focus:outline-none focus:border-[#441a05] focus:ring-[#441a05]"
                disabled={isCreating || isUpdating}
                required
                aria-label="শুরুর তারিখ"
                title="শুরুর তারিখ নির্বাচন করুন / Select start date"
              />
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-[#441a05] mb-1">
                শেষের তারিখ
              </label>
              <input
                id="end_time"
                type="date"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                onClick={handleDateClick}
                className="w-full bg-transparent outline-none text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 focus:outline-none focus:border-[#441a05] focus:ring-[#441a05]"
                disabled={isCreating || isUpdating}
                required
                aria-label="শেষের তারিখ"
                title="শেষের তারিখ নির্বাচন করুন / Select end date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-1">স্থিতি</label>
              <Select
                options={statusOptions}
                value={statusOptions.find((opt) => opt.value === formData.status) || null}
                onChange={(selected) => setFormData({ ...formData, status: selected ? selected.value : 'ACTIVE' })}
                isDisabled={isCreating || isUpdating}
                placeholder="স্থিতি নির্বাচন করুন"
                className="react-select-container"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isSearchable={false}
                aria-label="স্থিতি"
                title="স্থিতি নির্বাচন করুন / Select status"
                styles={selectStyles}
              />
            </div>
            <div className="md:col-span-4">
              <label htmlFor="remarks" className="block text-sm font-medium text-[#441a05] mb-1">
                মন্তব্য
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                rows={4}
                disabled={isCreating || isUpdating}
                aria-label="মন্তব্য"
                title="মন্তব্য / Remarks"
              />
            </div>
            <div className="flex space-x-4 md:col-span-3">
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                title={editingId ? 'খাবারের স্থিতি আপডেট করুন / Update meal status' : 'নতুন খাবারের স্থিতি তৈরি করুন / Create a new meal status'}
                className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isCreating || isUpdating ? 'cursor-not-allowed' : 'hover:text-white btn-glow'
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
                    <span>{editingId ? 'স্থিতি আপডেট করুন' : 'স্থিতি তৈরি করুন'}</span>
                  </span>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      start_time: '',
                      end_time: '',
                      status: 'ACTIVE',
                      remarks: '',
                      meal_user: null,
                    });
                    setSearchTerm('');
                    setEditingId(null);
                  }}
                  title="সম্পাদনা বাতিল করুন / Cancel editing"
                  className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
                >
                  বাতিল
                </button>
              )}
            </div>
          </form>
          {(createError || updateError) && (
            <div
              id="status-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              ত্রুটি: {(createError || updateError).status || 'অজানা'} - {JSON.stringify((createError || updateError).data || {})}
            </div>
          )}
        </div>

        {/* Meal Statuses Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">খাবারের স্থিতির তালিকা</h3>
          {statusesLoading ? (
            <p className="p-4 text-[#441a05]/70">খাবারের স্থিতি লোড হচ্ছে...</p>
          ) : statusesError ? (
            <p className="p-4 text-red-400">
              খাবারের স্থিতি লোড করতে ত্রুটি: {statusesError.status || 'অজানা'} - {JSON.stringify(statusesError.data || {})}
            </p>
          ) : mealStatuses?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো খাবারের স্থিতি উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আইডি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ব্যবহারকারীর নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শুরুর তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শেষের তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      স্থিতি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      মন্তব্য
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
                  {mealStatuses?.map((status, index) => {
                    const user = jointUsers.find((u) => u.id === status.meal_user);
                    return (
                      <tr
                        key={status.id}
                        className="bg-white/5 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {status.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {user ? user.name : status.meal_user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {status.start_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {status.end_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={status.status === 'ACTIVE'}
                              onChange={() => handleToggleStatus(status)}
                              className="hidden"
                              aria-label={`স্থিতি ${status.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}`}
                              title={`স্থিতি ${status.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} / Status ${status.status}`}
                            />
                            <span
                              className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${
                                status.status === 'ACTIVE'
                                  ? 'bg-[#DB9E30] border-[#DB9E30]'
                                  : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                              }`}
                            >
                              {status.status === 'ACTIVE' && (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {status.remarks || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                          {new Date(status.created_at).toLocaleString('bn-BD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                          {new Date(status.updated_at).toLocaleString('bn-BD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(status)}
                            title="খাবারের স্থিতি সম্পাদনা করুন / Edit meal status"
                            className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(status.id)}
                            title="খাবারের স্থিতি মুছুন / Delete meal status"
                            className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
                ? 'খাবারের স্থিতি মুছে ফেলা হচ্ছে...'
                : `খাবারের স্থিতি মুছে ফেলতে ত্রুটি: ${deleteError?.status || 'অজানা'} - ${JSON.stringify(
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
                {modalAction === 'create' && 'নতুন খাবারের স্থিতি নিশ্চিত করুন'}
                {modalAction === 'update' && 'খাবারের স্থিতি আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'খাবারের স্থিতি মুছে ফেলা নিশ্চিত করুন'}
                {modalAction === 'toggle' && 'খাবারের স্থিতি পরিবর্তন নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন খাবারের স্থিতি তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে খাবারের স্থিতি আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই খাবারের স্থিতি মুছে ফেলতে চান?'}
                {modalAction === 'toggle' && `আপনি কি নিশ্চিত যে খাবারের স্থিতি ${modalData?.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করতে চান?`}
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

export default MealStatus;