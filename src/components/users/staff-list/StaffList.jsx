import React, { useState, useCallback } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import debounce from 'lodash.debounce';
import {
  useDeleteStaffListApIMutation,
  useGetStaffListApIQuery,
  useUpdateStaffListApIMutation,
} from '../../../redux/features/api/staff/staffListApi';

const StaffList = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    user_id: '',
    phone_number: '',
    email: '',
    designation: '',
  });
  const [editStaffId, setEditStaffId] = useState(null);
  const [editStaffData, setEditStaffData] = useState({
    name: '',
    user_id: '',
    phone_number: '',
    email: '',
    designation: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const pageSize = 3;

  // Fetch staff data
  const {
    data: staffData,
    isLoading,
    isError,
    error,
  } = useGetStaffListApIQuery({
    page,
    page_size: pageSize,
    ...filters,
  });

  const [updateStaff, { isLoading: isUpdating, error: updateError }] =
    useUpdateStaffListApIMutation();
  const [deleteStaff, { isLoading: isDeleting, error: deleteError }] =
    useDeleteStaffListApIMutation();

  const staff = staffData?.staff || [];
  const totalItems = staffData?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = !!staffData?.next;
  const hasPreviousPage = !!staffData?.previous;

  // Log data for debugging
  console.log('Staff Data:', staffData);
  console.log('Error:', error);

  // Debounced filter update
  const debouncedSetFilters = useCallback(
    debounce((newFilters) => {
      setFilters(newFilters);
      setPage(1);
    }, 300),
    []
  );

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    debouncedSetFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Generate page numbers for display
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Handle edit button click
  const handleEditClick = (staffMember) => {
    setEditStaffId(staffMember.id);
    setEditStaffData({
      name: staffMember.name,
      user_id: staffMember.user_id,
      phone_number: staffMember.phone_number,
      email: staffMember.email,
      designation: staffMember.designation,
    });
  };

  // Handle update form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editStaffData.name.trim()) {
      toast.error('অনুগ্রহ করে স্টাফের নাম লিখুন');
      return;
    }
    try {
      await updateStaff({ id: editStaffId, ...editStaffData }).unwrap();
      toast.success('স্টাফের তথ্য সফলভাবে আপডেট হয়েছে!');
      setEditStaffId(null);
      setEditStaffData({
        name: '',
        user_id: '',
        phone_number: '',
        email: '',
        designation: '',
      });
    } catch (err) {
      console.error('Error updating staff:', err);
      toast.error(`স্টাফের তথ্য আপডেট ব্যর্থ: ${err.status || 'অজানা ত্রুটি'}`);
    }
  };

  // Handle delete
  const handleDelete = (id) => {
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm modal action
  const confirmAction = async () => {
    try {
      if (modalAction === 'delete') {
        await deleteStaff(modalData.id).unwrap();
        toast.success('স্টাফ সফলভাবে মুছে ফেলা হয়েছে!');
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.error(`স্টাফ মুছে ফেলা ব্যর্থ: ${err.status || 'অজানা ত্রুটি'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  return (
    <div className="py-8 w-full">
      <Toaster position="top-right" reverseOrder={false} />
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes slideDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
          .animate-slideDown { animation: slideDown 0.4s ease-out forwards; }
          .btn-glow:hover { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
        `}
      </style>

      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <h3 className="text-2xl font-bold text-[#441a05] tracking-tight mb-6">
          স্টাফ তালিকা
        </h3>

        {/* Filter Form */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-[#441a05] mb-4">ফিল্টার</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
              placeholder="নাম"
            />
            <input
              type="text"
              name="user_id"
              value={filters.user_id}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
              placeholder="ইউজার আইডি"
            />
            <input
              type="text"
              name="phone_number"
              value={filters.phone_number}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
              placeholder="ফোন নম্বর"
            />
            {/* <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
              placeholder="ইমেইল"
            />
            <input
              type="text"
              name="designation"
              value={filters.designation}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
              placeholder="পদবী"
            /> */}
          </div>
        </div>

        {/* Edit Staff Form */}
        {editStaffId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-scaleIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
                স্টাফের তথ্য সম্পাদনা
              </h3>
            </div>
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl"
            >
              <input
                type="text"
                name="name"
                value={editStaffData.name}
                onChange={(e) =>
                  setEditStaffData({ ...editStaffData, name: e.target.value })
                }
                className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                placeholder="নাম"
                disabled={isUpdating}
              />
              <input
                type="text"
                name="user_id"
                value={editStaffData.user_id}
                onChange={(e) =>
                  setEditStaffData({ ...editStaffData, user_id: e.target.value })
                }
                className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                placeholder="ইউজার আইডি"
                disabled={isUpdating}
              />
              <input
                type="text"
                name="phone_number"
                value={editStaffData.phone_number}
                onChange={(e) =>
                  setEditStaffData({ ...editStaffData, phone_number: e.target.value })
                }
                className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                placeholder="ফোন নম্বর"
                disabled={isUpdating}
              />
              <input
                type="email"
                name="email"
                value={editStaffData.email}
                onChange={(e) =>
                  setEditStaffData({ ...editStaffData, email: e.target.value })
                }
                className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                placeholder="ইমেইল"
                disabled={isUpdating}
              />
              <input
                type="text"
                name="designation"
                value={editStaffData.designation}
                onChange={(e) =>
                  setEditStaffData({ ...editStaffData, designation: e.target.value })
                }
                className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                placeholder="পদবী"
                disabled={isUpdating}
              />
              <button
                type="submit"
                disabled={isUpdating}
                className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isUpdating
                    ? 'cursor-not-allowed opacity-70'
                    : 'hover:text-white hover:shadow-md'
                }`}
              >
                {isUpdating ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>আপডেট হচ্ছে...</span>
                  </span>
                ) : (
                  <span>আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditStaffId(null);
                  setEditStaffData({
                    name: '',
                    user_id: '',
                    phone_number: '',
                    email: '',
                    designation: '',
                  });
                }}
                className="flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
            {updateError && (
              <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
                ত্রুটি: {updateError?.status || 'অজানা'} -{' '}
                {JSON.stringify(updateError?.data || {})}
              </div>
            )}
          </div>
        )}

        {/* Staff Table */}
        <div className="overflow-x-auto max-h-[60vh]">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center">
              <FaSpinner className="animate-spin text-[#441a05] text-2xl mr-2" />
              <p className="text-[#441a05]/70">লোড হচ্ছে...</p>
            </div>
          ) : isError ? (
            <p className="p-4 text-red-400">
              ত্রুটি: {error?.status || 'অজানা'} -{' '}
              {JSON.stringify(error?.data || {})}
            </p>
          ) : staff.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো স্টাফ পাওয়া যায়নি।</p>
          ) : (
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ক্রমিক
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    নাম
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ইউজার আইডি
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ফোন নম্বর
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ইমেইল
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    পদবী
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {staff.map((staffMember, index) => (
                  <tr
                    key={staffMember.id}
                    className="bg-white/5 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#441a05]">
                      {staffMember.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {staffMember.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {staffMember.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {staffMember.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {staffMember.designation || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditClick(staffMember)}
                        className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        aria-label={`সম্পাদনা ${staffMember.name}`}
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(staffMember.id)}
                        className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                        aria-label={`মুছুন ${staffMember.name}`}
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(isDeleting || deleteError) && (
            <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
              {isDeleting
                ? 'স্টাফ মুছছে...'
                : `স্টাফ মুছতে ত্রুটি: ${deleteError?.status || 'অজানা'} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!hasPreviousPage}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                !hasPreviousPage
                  ? 'bg-gray-500/20 text-[#441a05]/30 cursor-not-allowed'
                  : 'bg-[#DB9E30] text-[#441a05] hover:text-white'
              }`}
            >
              পূর্ববর্তী
            </button>
            {getPageNumbers().map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 rounded-lg font-medium transition-all duration-300 ${
                  page === pageNumber
                    ? 'bg-[#DB9E30] text-white'
                    : 'bg-white/20 text-[#441a05] hover:bg-white/30'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNextPage}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                !hasNextPage
                  ? 'bg-gray-500/20 text-[#441a05]/30 cursor-not-allowed'
                  : 'bg-[#DB9E30] text-[#441a05] hover:text-white'
              }`}
            >
              পরবর্তী
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              স্টাফ মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই স্টাফটিকে মুছে ফেলতে চান?
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
                disabled={isDeleting}
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${
                  isDeleting ? 'cursor-not-allowed opacity-60' : 'hover:text-white'
                }`}
              >
                {isDeleting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>মুছছে...</span>
                  </span>
                ) : (
                  'নিশ্চিত করুন'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;