import React, { useState, useCallback } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import debounce from 'lodash.debounce';
import Select from 'react-select';
import {
  useDeleteStudentListMutation,
  useGetStudentListQuery,
  useUpdateStudentListMutation,
} from '../../../redux/features/api/student/studentListApi';
import { useGetClassListApiQuery } from '../../../redux/features/api/class/classListApi';
import { useGetStudentSectionApiQuery } from '../../../redux/features/api/student/studentSectionApi';
import { useGetStudentShiftApiQuery } from '../../../redux/features/api/student/studentShiftApi';
import { useGetAcademicYearApiQuery } from '../../../redux/features/api/academic-year/academicYearApi';


const StudentList = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    user_id: '',
    roll: '',
    phone: '',
    class: '', // Changed to match backend parameter
    section: '', // Changed to match backend parameter
    shift: '', // Changed to match backend parameter
    admission_year: '',
    status: '',
  });
  const [editStudentId, setEditStudentId] = useState(null);
  const [editStudentData, setEditStudentData] = useState({
    name: '',
    user_id: '',
    class_name: '',
    section_name: '',
    shift_name: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const pageSize = 3;

  // Fetch student data
  const {
    data: studentData,
    isLoading,
    isError,
    error,
  } = useGetStudentListQuery({
    page,
    page_size: pageSize,
    ...filters,
  });

  // Fetch dropdown data
  const { data: classes, isLoading: isClassesLoading } = useGetClassListApiQuery();
  const { data: sections, isLoading: isSectionsLoading } = useGetStudentSectionApiQuery();
  const { data: shifts, isLoading: isShiftsLoading } = useGetStudentShiftApiQuery();
  const { data: academicYears, isLoading: isAcademicYearsLoading } = useGetAcademicYearApiQuery();


  console.log(classes)

  const [updateStudent, { isLoading: isUpdating, error: updateError }] =
    useUpdateStudentListMutation();
  const [deleteStudent, { isLoading: isDeleting, error: deleteError }] =
    useDeleteStudentListMutation();

  const students = studentData?.students || [];
  const totalItems = studentData?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = !!studentData?.next;
  const hasPreviousPage = !!studentData?.previous;

  // Format dropdown options
  const classOptions = classes?.map((cls) => ({
    value: cls.student_class.name,
    label: cls.student_class.name,
  })) || [];
  const sectionOptions = sections?.map((sec) => ({
    value: sec.name,
    label: sec.name,
  })) || [];
  const shiftOptions = shifts?.map((shift) => ({
    value: shift.name,
    label: shift.name,
  })) || [];
  const academicYearOptions = academicYears?.map((year) => ({
    value: year.name, // Assuming the API returns { id, year }
    label: year.name,
  })) || [];
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

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

  // Handle select changes
  const handleSelectChange = (selectedOption, { name }) => {
    debouncedSetFilters((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : '',
    }));
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
  const handleEditClick = (student) => {
    setEditStudentId(student.id);
    setEditStudentData({
      name: student.name,
      user_id: student.user_id,
      class_name: student.class_name,
      section_name: student.section_name,
      shift_name: student.shift_name,
    });
  };

  // Handle update form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editStudentData.name.trim()) {
      toast.error('অনুগ্রহ করে ছাত্রের নাম লিখুন');
      return;
    }
    try {
      await updateStudent({ id: editStudentId, ...editStudentData }).unwrap();
      toast.success('ছাত্রের তথ্য সফলভাবে আপডেট হয়েছে!');
      setEditStudentId(null);
      setEditStudentData({
        name: '',
        user_id: '',
        class_name: '',
        section_name: '',
        shift_name: '',
      });
    } catch (err) {
      console.error('Error updating student:', err);
      toast.error(`ছাত্রের তথ্য আপডেট ব্যর্থ: ${err.status || 'অজানা ত্রুটি'}`);
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
        await deleteStudent(modalData.id).unwrap();
        toast.success('ছাত্র সফলভাবে মুছে ফেলা হয়েছে!');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      toast.error(`ছাত্র মুছে ফেলা ব্যর্থ: ${err.status || 'অজানা ত্রুটি'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      background: 'transparent',
      borderColor: '#9d9087',
      borderRadius: '0.5rem',
      padding: '0.2rem',
      color: '#441a05',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#DB9E30',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#DB9E30' : state.isFocused ? '#DB9E30' : 'transparent',
      color: state.isSelected || state.isFocused ? '#fff' : '#441a05',
      '&:hover': {
        backgroundColor: '#94640f',
        color: '#fff',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#441a05',
    }),
    menu: (provided) => ({
      ...provided,
      background: '#fff',
      borderRadius: '0.5rem',
      border: '1px solid #9d9087',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#441a05',
      opacity: 0.7,
    }),
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
          ছাত্র তালিকা
        </h3>

        {/* Filter Form */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-[#441a05] mb-4">ফিল্টার</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              name="roll"
              value={filters.roll}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
              placeholder="রোল"
            />
            <input
              type="text"
              name="phone"
              value={filters.phone}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
              placeholder="ফোন নম্বর"
            />
            <Select
              name="class"
              options={classOptions}
              onChange={handleSelectChange}
              placeholder="ক্লাস"
              isClearable
              isLoading={isClassesLoading}
              styles={customSelectStyles}
              className="w-full"
            />
            <Select
              name="section"
              options={sectionOptions}
              onChange={handleSelectChange}
              placeholder="সেকশন"
              isClearable
              isLoading={isSectionsLoading}
              styles={customSelectStyles}
              className="w-full"
            />
            <Select
              name="shift"
              options={shiftOptions}
              onChange={handleSelectChange}
              placeholder="শিফট"
              isClearable
              isLoading={isShiftsLoading}
              styles={customSelectStyles}
              className="w-full"
            />
            <Select
              name="admission_year"
              options={academicYearOptions}
              onChange={handleSelectChange}
              placeholder="ভর্তির বছর"
              isClearable
              isLoading={isAcademicYearsLoading}
              styles={customSelectStyles}
              className="w-full"
            />
            <Select
              name="status"
              options={statusOptions}
              onChange={handleSelectChange}
              placeholder="স্ট্যাটাস"
              isClearable
              styles={customSelectStyles}
              className="w-full"
            />
          </div>
        </div>

        {/* Edit Student Form */}
        {editStudentId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
                ছাত্রের তথ্য সম্পাদনা
              </h3>
            </div>
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl"
            >
              <input
                type="text"
                name="name"
                value={editStudentData.name}
                onChange={(e) =>
                  setEditStudentData({ ...editStudentData, name: e.target.value })
                }
                className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                placeholder="নাম"
                disabled={isUpdating}
              />
              <input
                type="text"
                name="user_id"
                value={editStudentData.user_id}
                onChange={(e) =>
                  setEditStudentData({
                    ...editStudentData,
                    user_id: e.target.value,
                  })
                }
                className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                placeholder="ইউজার আইডি"
                disabled={isUpdating}
              />
              <input
                type="text"
                name="class_name"
                value={editStudentData.class_name}
                onChange={(e) =>
                  setEditStudentData({
                    ...editStudentData,
                    class_name: e.target.value,
                  })
                }
                className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                placeholder="ক্লাস"
                disabled={isUpdating}
              />
              <input
                type="text"
                name="section_name"
                value={editStudentData.section_name}
                onChange={(e) =>
                  setEditStudentData({
                    ...editStudentData,
                    section_name: e.target.value,
                  })
                }
                className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                placeholder="সেকশন"
                disabled={isUpdating}
              />
              <input
                type="text"
                name="shift_name"
                value={editStudentData.shift_name}
                onChange={(e) =>
                  setEditStudentData({
                    ...editStudentData,
                    shift_name: e.target.value,
                  })
                }
                className="w-full bg-transparent text-[#441a05] placeholder-black/70 pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                placeholder="শিফট"
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
                  setEditStudentId(null);
                  setEditStudentData({
                    name: '',
                    user_id: '',
                    class_name: '',
                    section_name: '',
                    shift_name: '',
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

        {/* Student Table */}
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
          ) : students.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো ছাত্র পাওয়া যায়নি।</p>
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
                    ক্লাস
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    সেকশন
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    শিফট
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {students.map((student, index) => (
                  <tr
                    key={student.id}
                    className="bg-white/5 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#441a05]">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {student.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {student.class_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {student.section_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {student.shift_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditClick(student)}
                        className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        aria-label={`সম্পাদনা ${student.name}`}
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                        aria-label={`মুছুন ${student.name}`}
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
                ? 'ছাত্র মুছছে...'
                : `ছাত্র মুছতে ত্রুটি: ${deleteError?.status || 'অজানা'} - ${JSON.stringify(
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
              ছাত্র মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই ছাত্রটিকে মুছে ফেলতে চান?
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

export default StudentList;