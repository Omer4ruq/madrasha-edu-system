import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';
import { useSearchJointUsersQuery } from '../../redux/features/api/jointUsers/jointUsersApi';
import { useGetLeaveApiQuery } from '../../redux/features/api/leave/leaveApi';
import {
  useCreateLeaveRequestApiMutation,
  useDeleteLeaveRequestApiMutation,
  useGetLeaveRequestApiQuery,
  useUpdateLeaveRequestApiMutation,
} from '../../redux/features/api/leave/leaveRequestApi';

const AddLeaveRequest = () => {
  // Form states
  const [isAdd, setIsAdd] = useState(true);
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');
  const [leaveApplicationFile, setLeaveApplicationFile] = useState(null);
  const [leaveDescription, setLeaveDescription] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Edit states
  const [editRequestId, setEditRequestId] = useState(null);
  const [editLeaveTypeId, setEditLeaveTypeId] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editStartHour, setEditStartHour] = useState('');
  const [editEndHour, setEditEndHour] = useState('');
  const [editLeaveApplicationFile, setEditLeaveApplicationFile] = useState(null);
  const [editLeaveDescription, setEditLeaveDescription] = useState('');
  const [editSelectedUser, setEditSelectedUser] = useState(null);
  // User label cache
  const [userCache, setUserCache] = useState({});

  // API hooks
  const { data: leaveTypes, isLoading: isLeaveLoading } = useGetLeaveApiQuery();
  const { data: leaveRequests, isLoading: isRequestLoading } = useGetLeaveRequestApiQuery();
  const [createRequest, { isLoading: isCreating }] = useCreateLeaveRequestApiMutation();
  const [updateRequest, { isLoading: isUpdating }] = useUpdateLeaveRequestApiMutation();
  const [deleteRequest, { isLoading: isDeleting }] = useDeleteLeaveRequestApiMutation();
  const { data: searchResults, isLoading: isSearchLoading } = useSearchJointUsersQuery(searchQuery, {
    skip: !searchQuery || searchQuery.length < 3,
  });

  // Debug logs
  useEffect(() => {
    console.log('Search Results:', searchResults);
    console.log('Selected User:', selectedUser);
  }, [searchResults, selectedUser]);

  // Handle search input
  const handleSearch = useCallback((inputValue) => {
    setSearchQuery(inputValue);
  }, []);

  // Create user options for dropdown
  const userOptions = useMemo(() => {
    if (!searchResults || !Array.isArray(searchResults)) return [];
    return searchResults.map((user) => {
      const isStudent = !!user?.student_profile;
      const label = isStudent
        ? `${user.name || 'N/A'} - ${user.student_profile?.class_name || 'N/A'} (${user.student_profile?.roll_no || 'N/A'})`
        : `${user.name || 'N/A'} - ${user.staff_profile?.designation || 'N/A'} (${user.staff_profile?.staff_id_no || 'N/A'})`;
      return {
        value: user.user_id,
        label,
        userData: user,
        isStudent,
      };
    });
  }, [searchResults]);

  // Cache user labels
  useEffect(() => {
    if (searchResults?.length > 0) {
      setUserCache((prev) => {
        const newCache = { ...prev };
        searchResults.forEach((user) => {
          const isStudent = !!user?.student_profile;
          const label = isStudent
            ? `${user.name || 'N/A'} - ${user.student_profile?.class_name || 'N/A'} (${user.student_profile?.roll_no || 'N/A'})`
            : `${user.name || 'N/A'} - ${user.staff_profile?.designation || 'N/A'} (${user.staff_profile?.staff_id_no || 'N/A'})`;
          newCache[user.user_id] = label;
        });
        return newCache;
      });
    }
  }, [searchResults]);

  // Submit new leave request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!leaveTypeId || !startDate || !endDate || !selectedUser) {
      toast.error('সব ফিল্ড পূরণ করুন');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      toast.error('শুরুর তারিখ অতীতের হতে পারে না');
      return;
    }
    if (end < start) {
      toast.error('শেষের তারিখ শুরুর তারিখের পরে হতে হবে');
      return;
    }

    try {
      const formData = new FormData();
console.log(formData)

      // formData.append('id', 0);
      formData.append('leave_application', leaveApplicationFile || '');
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      formData.append('start_hour', startHour || '');
      formData.append('end_hour', endHour || '');
      formData.append('status', 'PENDING');
      formData.append('leave_description', leaveDescription.trim() || '');
      formData.append('created_at', new Date().toISOString());
      formData.append('updated_at', new Date().toISOString());
      formData.append('user_id', selectedUser.value);
      formData.append('leave_type', Number(leaveTypeId));
      formData.append(
        'academic_year',
        selectedUser.isStudent ? Number(selectedUser.userData.student_profile?.admission_year || 0) : 0
      );
      formData.append('created_by', 0); // Replace with actual user ID
      formData.append('updated_by', 0); // Replace with actual user ID
      formData.append(
        'user',
        JSON.stringify({
          id: selectedUser.userData.id || 0,
          name: selectedUser.userData.name || '',
          user_id: selectedUser.value,
          email: selectedUser.userData.email || '',
          phone_number: selectedUser.userData.phone_number || '',
          status: selectedUser.userData.status || 'Active',
          avatar: selectedUser.userData.avatar || '',
          gender: selectedUser.userData.gender || '',
          dob: selectedUser.userData.dob || '',
          blood_group: selectedUser.userData.blood_group || '',
          student_profile: selectedUser.userData.student_profile
            ? JSON.stringify(selectedUser.userData.student_profile)
            : '',
          staff_profile: selectedUser.userData.staff_profile ? JSON.stringify(selectedUser.userData.staff_profile) : '',
        })
      );

      await createRequest(formData).unwrap();
      toast.success('ছুটির আবেদন সফলভাবে জমা দেওয়া হয়েছে!');
      setLeaveTypeId('');
      setStartDate('');
      setEndDate('');
      setStartHour('');
      setEndHour('');
      setLeaveApplicationFile(null);
      setLeaveDescription('');
      setSelectedUser(null);
      setSearchQuery('');
    } catch (err) {
      toast.error(`ছুটির আবেদন জমা ব্যর্থ: ${err?.data?.detail || err.status || 'অজানা ত্রুটি'}`);
      console.error('Submit Error:', err);
    }
  };

  // Handle edit click
  const handleEditClick = useCallback(
    (request) => {
      if (request.status !== 'PENDING') {
        toast.error('শুধু মুলতুবি আবেদনগুলো সম্পাদনা করা যায়');
        return;
      }
      setEditRequestId(request.id);
      setEditLeaveTypeId(request.leave_type?.toString() || '');
      setEditStartDate(request.start_date || '');
      setEditEndDate(request.end_date || '');
      setEditStartHour(request.start_hour || '');
      setEditEndHour(request.end_hour || '');
      setEditLeaveApplicationFile(null);
      setEditLeaveDescription(request.leave_description || '');
      setIsAdd(false);

      const user = request.user;
      if (!user) {
        toast.error('ব্যবহারকারীর তথ্য পাওয়া যায়নি');
        return;
      }
      const isStudent = !!user.student_profile;
      const label = isStudent
        ? `${user.name || 'N/A'} - ${user.student_profile?.class_name || 'N/A'} (${user.student_profile?.roll_no || 'N/A'})`
        : `${user.name || 'N/A'} - ${user.staff_profile?.designation || 'N/A'} (${user.staff_profile?.staff_id_no || 'N/A'})`;
      setEditSelectedUser({
        value: user.user_id,
        label,
        userData: user,
        isStudent,
      });
      setUserCache((prev) => ({ ...prev, [user.user_id]: label }));
    },
    []
  );

  // Update leave request
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editLeaveTypeId || !editStartDate || !editEndDate || !editSelectedUser) {
      toast.error('সব ফিল্ড পূরণ করুন');
      return;
    }
    const start = new Date(editStartDate);
    const end = new Date(editEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      toast.error('শুরুর তারিখ অতীতের হতে পারে না');
      return;
    }
    if (end < start) {
      toast.error('শেষের তারিখ শুরুর তারিখের পরে হতে হবে');
      return;
    }

    try {
      const formData = new FormData();

           console.log(formData)
      formData.append('id', editRequestId);
      formData.append('leave_application', editLeaveApplicationFile || '');
      formData.append('start_date', editStartDate);
      formData.append('end_date', editEndDate);
      formData.append('start_hour', editStartHour || '');
      formData.append('end_hour', editEndHour || '');
      formData.append('status', 'PENDING');
      formData.append('leave_description', editLeaveDescription.trim() || '');
      formData.append('user_id', editSelectedUser.value);
      formData.append('leave_type', Number(editLeaveTypeId));
      formData.append(
        'academic_year',
        editSelectedUser.isStudent ? Number(editSelectedUser.userData.student_profile?.admission_year || 0) : 0
      );
      formData.append('updated_at', new Date().toISOString());
      formData.append('updated_by', 0); // Replace with actual user ID
      formData.append(
        'user',
        JSON.stringify({
          id: editSelectedUser.userData.id || 0,
          name: editSelectedUser.userData.name || '',
          user_id: editSelectedUser.value,
          email: editSelectedUser.userData.email || '',
          phone_number: editSelectedUser.userData.phone_number || '',
          status: editSelectedUser.userData.status || 'Active',
          avatar: editSelectedUser.userData.avatar || '',
          gender: editSelectedUser.userData.gender || '',
          dob: editSelectedUser.userData.dob || '',
          blood_group: editSelectedUser.userData.blood_group || '',
          student_profile: editSelectedUser.userData.student_profile
            ? JSON.stringify(editSelectedUser.userData.student_profile)
            : '',
          staff_profile: editSelectedUser.userData.staff_profile
            ? JSON.stringify(editSelectedUser.userData.staff_profile)
            : '',
        })
      );

    

      await updateRequest(formData).unwrap();

   
      toast.success('ছুটির আবেদন সফলভাবে আপডেট হয়েছে!');
      setEditRequestId(null);
      setEditLeaveTypeId('');
      setEditStartDate('');
      setEditEndDate('');
      setEditStartHour('');
      setEditEndHour('');
      setEditLeaveApplicationFile(null);
      setEditLeaveDescription('');
      setEditSelectedUser(null);
      setSearchQuery('');
      setIsAdd(true);
    } catch (err) {
      toast.error(`ছুটির আবেদন আপডেট ব্যর্থ: ${err?.data?.detail || err.status || 'অজানা ত্রুটি'}`);
      console.error('Update Error:', err);
    }
  };

  // Delete leave request
  const handleDelete = async (id, status) => {
    if (status !== 'PENDING') {
      toast.error('শুধু মুলতুবি আবেদনগুলো মুছে ফেলা যায়');
      return;
    }
    if (window.confirm('আপনি কি নিশ্চিত এই ছুটির আবেদন মুছে ফেলতে চান?')) {
      try {
        await deleteRequest(id).unwrap();
        toast.success('ছুটির আবেদন সফলভাবে মুছে ফেলা হয়েছে!');
      } catch (err) {
        toast.error(`ছুটির আবেদন মুছে ফেলতে ব্যর্থ: ${err?.data?.detail || err.status || 'অজানা ত্রুটি'}`);
        console.error('Delete Error:', err);
      }
    }
  };

  // Get user label for table
  const getUserLabel = useCallback((userId) => userCache[userId] || 'লোড হচ্ছে...', [userCache]);

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" />
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
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .btn-glow:hover { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
          .react-select__control {
            background: transparent !important;
            border: 1px solid #9d9087 !important;
            color: #441a05 !important;
            border-radius: 0.5rem !important;
            transition: all 0.3s !important;
          }
          .react-select__menu {
            background: rgba(0, 0, 0, 0.8) !important;
            backdrop-filter: blur(4px) !important;
            color: #441a05 !important;
          }
          .react-select__option { color: #441a05 !important; }
          .react-select__option--is-focused { background: rgba(219, 158, 48, 0.2) !important; }
          .react-select__option--is-selected { background: #DB9E30 !important; color: #441a05 !important; }
          .react-select__single-value { color: #441a05 !important; }
          .react-select__placeholder { color: #441a05 !important; }
          .react-select__input { color: #441a05 !important; }
        `}
      </style>

      <div>
        {/* New Leave Request Form */}
        {isAdd && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">ছুটির জন্য আবেদন করুন</h3>
            </div>
            <form onSubmit={handleSubmitRequest} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">ব্যবহারকারী অনুসন্ধান করুন</label>
                <Select
                  key={userOptions.length} // Force re-render when options change
                  options={userOptions}
                  value={selectedUser}
                  onChange={(option) => setSelectedUser(option)}
                  onInputChange={handleSearch}
                  placeholder="নাম বা ইউজার আইডি দিয়ে অনুসন্ধান করুন"
                  isDisabled={isCreating || isSearchLoading}
                  isLoading={isSearchLoading}
                  className="text-[#441a05]"
                  classNamePrefix="react-select"
                  inputValue={searchQuery}
                  noOptionsMessage={() =>
                    searchQuery.length < 3 ? 'অন্তত ৩টি অক্ষর লিখুন' : 'কোনো ব্যবহারকারী পাওয়া যায়নি'
                  }
                  aria-label="ব্যবহারকারী অনুসন্ধান করুন"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">ছুটির প্রকার</label>
                <select
                  value={leaveTypeId}
                  onChange={(e) => setLeaveTypeId(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isCreating || isLeaveLoading}
                  aria-label="ছুটির প্রকার নির্বাচন করুন"
                >
                  <option value="">ছুটির প্রকার নির্বাচন করুন</option>
                  {leaveTypes?.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-full">
                  <label className="block text-sm font-medium text-[#441a05] mb-1">শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                    disabled={isCreating}
                    aria-label="শুরুর তারিখ"
                  />
                </div>
                <label className="self-end mb-2">থেকে</label>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-full">
                  <label className="block text-sm font-medium text-[#441a05] mb-1">শেষের তারিখ</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                    disabled={isCreating}
                    aria-label="শেষের তারিখ"
                  />
                </div>
                <label className="self-end mb-2">পর্যন্ত</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">শুরুর সময়</label>
                <input
                  type="time"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="যেমন, ০৯:০০"
                  disabled={isCreating}
                  aria-label="শুরুর সময়"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">শেষের সময়</label>
                <input
                  type="time"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="যেমন, ১৭:০০"
                  disabled={isCreating}
                  aria-label="শেষের সময়"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">ছুটির আবেদন (ফাইল আপলোড, ঐচ্ছিক)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setLeaveApplicationFile(e.target.files[0])}
                  disabled={isCreating}
                  className="block w-full text-sm text-[#441a05] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:text-[#441a05] file:bg-transparent hover:file:bg-[#d5c2b8] transition-all duration-300 cursor-pointer border border-[#9d9087] rounded-lg bg-transparent"
                  aria-label="ছুটির আবেদন ফাইল আপলোড"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#441a05] mb-1">ছুটির বিবরণ</label>
                <textarea
                  value={leaveDescription}
                  onChange={(e) => setLeaveDescription(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="ছুটির বিস্তারিত বিবরণ লিখুন (ঐচ্ছিক)"
                  rows={3}
                  disabled={isCreating}
                  aria-label="ছুটির বিবরণ"
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                aria-label="ছুটির আবেদন জমা দিন"
                className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isCreating ? 'cursor-not-allowed' : 'hover:text-white hover:shadow-md'
                }`}
              >
                {isCreating ? (
                  <span className="flex items-center space-x-3">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>জমা দেওয়া হচ্ছে...</span>
                  </span>
                ) : (
                  <span>ছুটির আবেদন জমা দিন</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Edit Leave Request Form */}
        {!isAdd && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">ছুটির আবেদন সম্পাদনা করুন</h3>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">ব্যবহারকারী অনুসন্ধান করুন</label>
                <Select
                  key={userOptions.length} // Force re-render when options change
                  options={userOptions}
                  value={editSelectedUser}
                  onChange={(option) => setEditSelectedUser(option)}
                  onInputChange={handleSearch}
                  placeholder="নাম বা ইউজার আইডি দিয়ে অনুসন্ধান করুন"
                  isDisabled={isUpdating || isSearchLoading}
                  isLoading={isSearchLoading}
                  className="text-[#441a05]"
                  classNamePrefix="react-select"
                  inputValue={searchQuery}
                  noOptionsMessage={() =>
                    searchQuery.length < 3 ? 'অন্তত ৩টি অক্ষর লিখুন' : 'কোনো ব্যবহারকারী পাওয়া যায়নি'
                  }
                  aria-label="ব্যবহারকারী অনুসন্ধান করুন"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">ছুটির প্রকার</label>
                <select
                  value={editLeaveTypeId}
                  onChange={(e) => setEditLeaveTypeId(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isUpdating || isLeaveLoading}
                  aria-label="ছুটির প্রকার নির্বাচন করুন"
                >
                  <option value="">ছুটির প্রকার নির্বাচন করুন</option>
                  {leaveTypes?.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">শুরুর তারিখ</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isUpdating}
                  aria-label="শুরুর তারিখ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">শেষের তারিখ</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isUpdating}
                  aria-label="শেষের তারিখ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">শুরুর সময়</label>
                <input
                  type="time"
                  value={editStartHour}
                  onChange={(e) => setEditStartHour(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="যেমন, ০৯:০০"
                  disabled={isUpdating}
                  aria-label="শুরুর সময়"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">শেষের সময়</label>
                <input
                  type="time"
                  value={editEndHour}
                  onChange={(e) => setEditEndHour(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="যেমন, ১৭:০০"
                  disabled={isUpdating}
                  aria-label="শেষের সময়"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#441a05] mb-1">ছুটির আবেদন (নতুন ফাইল আপলোড, ঐচ্ছিক)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setEditLeaveApplicationFile(e.target.files[0])}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isUpdating}
                  aria-label="ছুটির আবেদন ফাইল আপলোড"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#441a05] mb-1">ছুটির বিবরণ</label>
                <textarea
                  value={editLeaveDescription}
                  onChange={(e) => setEditLeaveDescription(e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  placeholder="ছুটির বিস্তারিত বিবরণ সম্পাদনা করুন (ঐচ্ছিক)"
                  rows={4}
                  disabled={isUpdating}
                  aria-label="ছুটির বিবরণ"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                aria-label="ছুটির আবেদন আপডেট করুন"
                className={`relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isUpdating ? 'cursor-not-allowed' : 'hover:text-white hover:shadow-md'
                }`}
              >
                {isUpdating ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>আপডেট হচ্ছে...</span>
                  </span>
                ) : (
                  <span>ছুটির আবেদন আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditRequestId(null);
                  setEditLeaveTypeId('');
                  setEditStartDate('');
                  setEditEndDate('');
                  setEditStartHour('');
                  setEditEndHour('');
                  setEditLeaveApplicationFile(null);
                  setEditLeaveDescription('');
                  setEditSelectedUser(null);
                  setSearchQuery('');
                  setIsAdd(true);
                }}
                aria-label="সম্পাদনা বাতিল"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
          </div>
        )}

        {/* Leave Requests Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">আপনার ছুটির আবেদনসমূহ</h3>
          {isRequestLoading ? (
            <p className="p-4 text-[#441a05]/70">ছুটির আবেদন লোড হচ্ছে...</p>
          ) : !leaveRequests?.length ? (
            <p className="p-4 text-[#441a05]/70">কোনো ছুটির আবেদন পাওয়া যায়নি।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ছুটির প্রকার
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ব্যবহারকারী
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শুরুর তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শেষের তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শুরুর সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শেষের সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      বিবরণ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      অবস্থা
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      তৈরির সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রিয়াকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {leaveRequests.map((request, index) => {
                    const leaveType = leaveTypes?.find((lt) => lt.id === request.leave_type)?.name || 'অজানা';
                    return (
                      <tr
                        key={request.id}
                        className="bg-white/5 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{leaveType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {getUserLabel(request.user?.user_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {new Date(request.start_date).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {new Date(request.end_date).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{request.start_hour || 'না'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{request.end_hour || 'না'}</td>
                        <td className="px-6 py-4 text-sm text-[#441a05] max-w-xs truncate">
                          {request.leave_description || 'না'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              request.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {request.status === 'PENDING'
                              ? 'মুলতুবি'
                              : request.status === 'APPROVED'
                              ? 'অনুমোদিত'
                              : 'প্রত্যাখ্যাত'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                          {new Date(request.created_at).toLocaleString('bn-BD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(request)}
                            aria-label="ছুটির আবেদন সম্পাদনা"
                            className="text-blue-500 hover:text-blue-700 mr-4 transition-colors duration-200"
                            disabled={request.status !== 'PENDING'}
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(request.id, request.status)}
                            aria-label="ছুটির আবেদন মুছে ফেলুন"
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                            disabled={request.status !== 'PENDING'}
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
          {isDeleting && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              ছুটির আবেদন মুছে ফেলা হচ্ছে...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLeaveRequest;