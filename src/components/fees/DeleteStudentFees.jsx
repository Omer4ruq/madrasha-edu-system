import React, { useState } from 'react';
import { FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import Select from 'react-select';
import { Toaster, toast } from 'react-hot-toast';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetFeesNamesQuery } from '../../redux/features/api/fees-name/feesName';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useCreateDeleteFeeMutation, useGetDeleteFeesQuery } from '../../redux/features/api/deleteFees/deleteFeesApi';
import { useDeleteFeeMutation } from '../../redux/features/api/fees/feesApi';

const DeleteStudentFees = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFees, setSelectedFees] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Fetch data
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentActiveApiQuery();
  const { data: feesData, isLoading: feesLoading } = useGetFeesNamesQuery();
  const { data: academicYearsData, isLoading: academicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: deletedFeesData, isLoading: deletedFeesLoading } = useGetDeleteFeesQuery();
  const [createDeleteFee, { isLoading: createLoading }] = useCreateDeleteFeeMutation();
  const [deleteFee, { isLoading: deleteLoading }] = useDeleteFeeMutation();

  // Prepare student options for select
  const studentOptions = studentsData?.filter(student => 
    student.user_id.toString().includes(searchTerm)
  ).map(student => ({
    value: student.id,
    label: `ID: ${student.user_id} - ${student.name || 'Unknown'}`
  })) || [];

  // Prepare fee options for select
  const feeOptions = feesData?.map(fee => ({
    value: fee.id,
    label: fee.fees_title
  })) || [];

  // Prepare academic year options for select
  const academicYearOptions = academicYearsData?.map(year => ({
    value: year.id,
    label: year.name || `Year ${year.id}`
  })) || [];

  // Custom styles for react-select
  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'transparent',
      borderColor: '#9d9087',
      borderRadius: '8px',
      paddingLeft: '0.75rem',
      padding: '3px',
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
    input: (base) => ({
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
      backgroundColor: isSelected ? '#DB9E30' : isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      cursor: 'pointer',
      '&:active': { backgroundColor: '#DB9E30' },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#DB9E30',
      borderRadius: '4px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '14px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#441a05',
      '&:hover': {
        backgroundColor: '#441a05',
        color: 'white',
      },
    }),
  };

  // Validate form
  const validateForm = () => {
    if (!selectedStudent) {
      toast.error('অনুগ্রহ করে একজন ছাত্র নির্বাচন করুন');
      return false;
    }
    if (selectedFees.length === 0) {
      toast.error('অনুগ্রহ করে কমপক্ষে একটি ফি নির্বাচন করুন');
      return false;
    }
    if (!selectedAcademicYear) {
      toast.error('অনুগ্রহ করে একাডেমিক বছর নির্বাচন করুন');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setModalAction('deleteFees');
    setModalData({
      student_id: selectedStudent.value,
      feetype_id: selectedFees.map(fee => fee.value),
      academic_year: selectedAcademicYear.value
    });
    setIsModalOpen(true);
  };

  // Handle fee deletion from table
  const handleDelete = async (id) => {
    setModalAction('removeRecord');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'deleteFees') {
        await createDeleteFee(modalData).unwrap();
        toast.success('ফি সফলভাবে মুছে ফেলা হয়েছে!');
        setSelectedFees([]);
        setSelectedAcademicYear(null);
      } else if (modalAction === 'removeRecord') {
        await deleteFee(modalData.id).unwrap();
        toast.success('রেকর্ড সফলভাবে সরানো হয়েছে!');
      }
    } catch (error) {
      console.error(`ত্রুটি ${modalAction === 'deleteFees' ? 'ফি মুছে ফেলা' : 'রেকর্ড সরানো'}:`, error);
      toast.error(`ব্যর্থ: ${error.status || 'অজানা ত্রুটি'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Filter deleted fees for selected student
  const filteredDeletedFees = selectedStudent 
    ? deletedFeesData?.filter(fee => fee.student_id === selectedStudent.value) 
    : deletedFeesData || [];

  // Get selected student details
  const studentDetails = selectedStudent 
    ? studentsData?.find(student => student.id === selectedStudent.value)
    : null;

  return (
    <div className="py-8">
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

      <div className="">
        {/* Header and Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-3xl text-[#441a05]" />
            <h2 className="text-2xl font-bold text-[#441a05] tracking-tight">
              ছাত্রের ফি মুছুন
            </h2>
          </div>
          <form onSubmit={handleSubmit} className=" grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Search */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-1">ছাত্র নির্বাচন করুন</label>
              <Select
                options={studentOptions}
                value={selectedStudent}
                onChange={setSelectedStudent}
                onInputChange={(input) => setSearchTerm(input)}
                isLoading={studentsLoading}
                placeholder="ইউজার আইডি দিয়ে ছাত্র খুঁজুন"
                className="react-select-container"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                inputValue={searchTerm}
                styles={selectStyles}
                aria-label="ছাত্র নির্বাচন"
                title="ছাত্র নির্বাচন করুন / Select student"
              />
            </div>

            {/* Student Details */}
            

            {/* Academic Year Selection */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-1">একাডেমিক বছর নির্বাচন করুন</label>
              <Select
                options={academicYearOptions}
                value={selectedAcademicYear}
                onChange={setSelectedAcademicYear}
                isLoading={academicYearsLoading}
                placeholder="একাডেমিক বছর নির্বাচন করুন"
                className="react-select-container"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isSearchable={false}
                styles={selectStyles}
                aria-label="একাডেমিক বছর"
                title="একাডেমিক বছর নির্বাচন করুন / Select academic year"
              />
            </div>

            {/* Fee Selection */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-1">মুছে ফেলার জন্য ফি নির্বাচন করুন</label>
              <Select
                isMulti
                options={feeOptions}
                value={selectedFees}
                onChange={setSelectedFees}
                isLoading={feesLoading}
                placeholder="ফি নির্বাচন করুন"
                className="react-select-container"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={selectStyles}
                aria-label="ফি নির্বাচন"
                title="ফি নির্বাচন করুন / Select fees"
              />
            </div>

            <button
              type="submit"
              disabled={createLoading || !selectedStudent || selectedFees.length === 0 || !selectedAcademicYear}
              className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                createLoading || !selectedStudent || selectedFees.length === 0 || !selectedAcademicYear
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:text-white hover:shadow-md btn-glow'
              }`}
              aria-label="ফি মুছুন"
              title="ফি মুছুন / Delete fees"
            >
              {createLoading ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>প্রক্রিয়াকরণ...</span>
                </span>
              ) : (
                <span>ফি মুছুন</span>
              )}
            </button>
          </form>
        </div>

    <div className='mb-8'> 
          {studentDetails && (
              <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg animate-fadeIn">
                <h3 className="text-lg font-semibold text-[#441a05] mb-2">ছাত্রের তথ্য</h3>
                <p><strong>নাম:</strong> {studentDetails.name || 'অজানা'}</p>
                <p><strong>রোল নং:</strong> {studentDetails.roll_no || 'অজানা'}</p>
                <p><strong>পিতার নাম:</strong> {studentDetails.father_name || 'অজানা'}</p>
                <p><strong>মাতার নাম:</strong> {studentDetails.mother_name || 'অজানা'}</p>
              </div>
            )}
            {searchTerm && !studentDetails && !studentsLoading && (
              <p className="text-red-400 animate-fadeIn">কোনো ছাত্র পাওয়া যায়নি: {searchTerm}</p>
            )}
    </div>

        {/* Deleted Fees Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">মুছে ফেলা ফি ইতিহাস</h3>
          {deletedFeesLoading ? (
            <p className="text-[#441a05]/70 p-4 animate-fadeIn">লোড হচ্ছে...</p>
          ) : filteredDeletedFees.length === 0 ? (
            <p className="text-[#441a05]/70 p-4 animate-fadeIn">
              {selectedStudent ? 'এই ছাত্রের জন্য কোনো মুছে ফেলা ফি পাওয়া যায়নি' : 'কোনো মুছে ফেলা ফি পাওয়া যায়নি'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ছাত্র আইডি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ফি প্রকার
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      একাডেমিক বছর
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রিয়াকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredDeletedFees.map((fee, index) => (
                    <tr
                      key={fee.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {fee.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {fee.feetype_id.map(id => 
                          feeOptions.find(opt => opt.value === id)?.label || 'অজানা'
                        ).join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {academicYearOptions.find(opt => opt.value === fee.academic_year)?.label || 'অজানা'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(fee.id)}
                          disabled={deleteLoading}
                          className={`text-[#441a05] hover:text-red-500 transition-colors duration-300 ${
                            deleteLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="রেকর্ড সরান / Remove record"
                          aria-label="রেকর্ড সরান"
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
          {deleteLoading && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              রেকর্ড সরানো হচ্ছে...
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
                {modalAction === 'deleteFees' && 'ফি মুছে ফেলা নিশ্চিত করুন'}
                {modalAction === 'removeRecord' && 'রেকর্ড সরানো নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'deleteFees' && 'আপনি কি নিশ্চিত যে নির্বাচিত ফি মুছে ফেলতে চান?'}
                {modalAction === 'removeRecord' && 'আপনি কি নিশ্চিত যে এই মুছে ফেলা ফি রেকর্ড সরাতে চান?'}
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

export default DeleteStudentFees;