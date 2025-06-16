import React, { useState, useMemo } from 'react';
import { useSearchJointUsersQuery } from '../../redux/features/api/jointUsers/jointUsersApi';
import { useCreateLeaveRequestApiMutation, useGetLeaveRequestApiQuery } from '../../redux/features/api/leave/leaveRequestApi';
import { useGetLeaveApiQuery } from '../../redux/features/api/leave/leaveApi';
import { FaSpinner } from 'react-icons/fa';

const AddLeaveRequest = () => {
  // ফর্ম ইনপুটের জন্য স্টেট
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [description, setDescription] = useState('');
  const [updateMessage, setUpdateMessage] = useState(null);

  // API হুক
  const { data: users = [], isLoading: usersLoading } = useSearchJointUsersQuery(searchTerm, {
    skip: searchTerm.length < 3, // ৩+ অক্ষর হলে কেবল ফেচ করবে
  });
  const { data: leaveTypes = [], isLoading: leaveTypesLoading, error: leaveTypesError } = useGetLeaveApiQuery();
  const { data: leaveRequests = [], isLoading: leaveRequestsLoading, error: leaveRequestsError } = useGetLeaveRequestApiQuery();
  const [createLeaveRequestApi, { isLoading: isSubmitting, error: submitError }] = useCreateLeaveRequestApiMutation();

  // ইউজার নির্বাচন হ্যান্ডলার
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(`${user.name} (${user?.student_profile?.class_name})`);
    setShowDropdown(false);
  };

  console.log(users);

  // ফর্ম সাবমিশন হ্যান্ডলার
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !startDate || !endDate || !leaveType || !description) {
      setUpdateMessage({ type: 'error', text: 'দয়া করে সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন।' });
      return;
    }

    const formData = new FormData();
    formData.append('user_id', selectedUser.id);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('leave_type', parseInt(leaveType));
    formData.append('leave_description', description);
    formData.append('academic_year', 1);
    formData.append('status', 'PENDING');

    try {
      console.log('পাঠানো ফর্ম ডেটা:', Object.fromEntries(formData));
      await createLeaveRequestApi(formData).unwrap();
      setSelectedUser(null);
      setSearchTerm('');
      setStartDate('');
      setEndDate('');
      setLeaveType('');
      setDescription('');
      setShowDropdown(false);
      setUpdateMessage({ type: 'success', text: 'ছুটির আবেদন সফলভাবে জমা হয়েছে!' });
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err) {
      console.error('সাবমিশন ত্রুটি:', err);
      setUpdateMessage({
        type: 'error',
        text: `ত্রুটি: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || err.message || {})}`,
      });
    }
  };

  return (
    <div className="py-8 w-full relative mx-auto">
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

      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <h3 className="text-2xl font-bold text-[#441a05] tracking-tight mb-6">ছুটির আবেদন যোগ করুন</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ইউজার সার্চ */}
          <div className="relative ">
            <label className="block text-sm font-medium text-[#441a05]">ইউজার খুঁজুন</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(e.target.value.length >= 3);
                if (!e.target.value) setSelectedUser(null);
              }}
              placeholder="অন্তত ৩টি অক্ষর লিখুন..."
              className="mt-1 block w-full rounded-md border-[#9d9087] bg-transparent text-[#441a05] shadow-sm focus:border-[#DB9E30] focus:ring focus:ring-[#DB9E30] focus:ring-opacity-50 animate-scaleIn outline-none"
            />
            {showDropdown && searchTerm.length >= 3 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-[#9d9087] rounded-md shadow-lg max-h-60 overflow-auto">
                {usersLoading ? (
                  <div className="p-2 text-[#441a05] flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>ইউজার লোড হচ্ছে...</span>
                  </div>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="p-2 text-[#441a05] bg-white hover:bg-[#DB9E30] cursor-pointer"
                    >
                      {user.name} ({user?.student_profile?.class_name})
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-[#441a05]">কোনো ইউজার পাওয়া যায়নি</div>
                )}
              </div>
            )}
            {selectedUser && (
              <div className="mt-2 text-sm text-[#441a05]/70">
                নির্বাচিত: {selectedUser.name} ({selectedUser?.student_profile?.class_name})
              </div>
            )}
          </div>

          {/* ছুটির ধরন */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-medium text-[#441a05]">ছুটির ধরন</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="mt-1 block w-full rounded-md border-[#9d9087] bg-transparent text-[#441a05] shadow-sm focus:border-[#DB9E30] focus:ring focus:ring-[#DB9E30] focus:ring-opacity-50 animate-scaleIn outline-none"
            >
              <option value="" className="text-[#441a05]/70">ছুটির ধরন নির্বাচন করুন</option>
              {leaveTypesLoading ? (
                <option>লোড হচ্ছে...</option>
              ) : leaveTypesError ? (
                <option>ছুটির ধরন লোডে ত্রুটি</option>
              ) : (
                leaveTypes.map((type) => (
                  <option key={type.id} value={type.id} className="text-[#441a05]">
                    {type.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* তারিখ ইনপুট */}
          <div className="grid grid-cols-2 gap-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div>
              <label className="block text-sm font-medium text-[#441a05]">শুরুর তারিখ</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-[#9d9087] bg-transparent text-[#441a05] shadow-sm focus:border-[#DB9E30] focus:ring focus:ring-[#DB9E30] focus:ring-opacity-50 animate-scaleIn outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#441a05]">শেষের তারিখ</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-[#9d9087] bg-transparent text-[#441a05] shadow-sm focus:border-[#DB9E30] focus:ring focus:ring-[#DB9E30] focus:ring-opacity-50 animate-scaleIn outline-none"
              />
            </div>
          </div>

          {/* বিবরণ */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <label className="block text-sm font-medium text-[#441a05]">বিবরণ</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-[#9d9087] bg-transparent text-[#441a05] shadow-sm focus:border-[#DB9E30] focus:ring focus:ring-[#DB9E30] focus:ring-opacity-50 animate-scaleIn outline-none"
              rows="4"
            ></textarea>
          </div>

          {/* সাবমিট বোতাম */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#DB9E30] text-[#441a05] py-2 px-4 rounded-md hover:bg-[#c48e2a] disabled:bg-[#9d9087] transition-all duration-300 animate-scaleIn"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin text-lg mr-2" />
                  জমা হচ্ছে...
                </span>
              ) : (
                'ছুটির আবেদন জমা দিন'
              )}
            </button>
            {updateMessage && (
              <div
                className={`mt-4 p-3 rounded-lg animate-fadeIn ${
                  updateMessage.type === 'error'
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-[#441a05]/70 bg-[#DB9E30]/10'
                }`}
                style={{ animationDelay: '0.4s' }}
              >
                {updateMessage.type === 'info' && <FaSpinner className="animate-spin text-lg mr-2 inline" />}
                {updateMessage.text}
              </div>
            )}
            {(leaveTypesError || leaveRequestsError || submitError) && (
              <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                ত্রুটি: {(leaveTypesError || leaveRequestsError || submitError)?.status || 'অজানা'} -{' '}
                {JSON.stringify((leaveTypesError || leaveRequestsError || submitError)?.data || {})}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* ছুটির আবেদন টেবিল */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">জমাকৃত ছুটির আবেদনসমূহ</h3>
        {leaveRequestsLoading ? (
          <p className="p-4 text-[#441a05]/70 animate-fadeIn">
            <FaSpinner className="animate-spin text-lg mr-2" />
            ছুটির আবেদন লোড হচ্ছে...
          </p>
        ) : leaveRequestsError ? (
          <div className="p-4 text-red-400 bg-red-500/10 rounded-lg animate-fadeIn">
            ছুটির আবেদন লোডে ত্রুটি: {leaveRequestsError?.status || 'অজানা'} -{' '}
            {JSON.stringify(leaveRequestsError?.data || {})}
          </div>
        ) : leaveRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ইউজার</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ছুটির ধরন</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">শুরুর তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">শেষের তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">বিবরণ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">অবস্থা</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">তৈরির তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {leaveRequests.map((request, index) => (
                  <tr key={request.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.2}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">{request.user?.name || 'পাওয়া যায়নি'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                      {leaveTypes.find((lt) => lt.id === request.leave_type)?.name || 'অজানা'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">{request.start_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">{request.end_date}</td>
                    <td className="px-6 py-4 text-[#441a05]">{request.leave_description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">{request.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                      {new Date(request.created_at).toLocaleDateString('bn-BD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-4 text-[#441a05]/70 animate-fadeIn">কোনো ছুটির আবেদন পাওয়া যায়নি।</p>
        )}
      </div>
    </div>
  );
};

export default AddLeaveRequest;