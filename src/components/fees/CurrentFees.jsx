import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import Select from 'react-select';
import { Toaster, toast } from 'react-hot-toast';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetStudentCurrentFeesQuery } from '../../redux/features/api/studentFeesCurrentApi/studentFeesCurrentApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetFundsQuery } from '../../redux/features/api/funds/fundsApi';
import { useGetWaiversQuery } from '../../redux/features/api/waivers/waiversApi';
import { useCreateFeeMutation, useDeleteFeeMutation, useUpdateFeeMutation } from '../../redux/features/api/fees/feesApi';
import selectStyles from '../../utilitis/selectStyles';


const CurrentFees = () => {
  const [userId, setUserId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedFund, setSelectedFund] = useState('');
  const [selectedFees, setSelectedFees] = useState([]);
  const [paymentInputs, setPaymentInputs] = useState({});
  const [discountInputs, setDiscountInputs] = useState({});
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [selectAll, setSelectAll] = useState(false); // State for Select All checkbox
  const dropdownRef = useRef(null);

  // API Queries
  const { data: studentData, isLoading: studentLoading, error: studentError } = useGetStudentActiveApiQuery(
    userId ? { user_id: userId } : undefined,
    { skip: !userId }
  );
  const {
    data: feesData,
    refetch: refetchFees
  } = useGetStudentCurrentFeesQuery(selectedStudent?.id, { skip: !selectedStudent });
  const { data: academicYears } = useGetAcademicYearApiQuery();
  const { data: funds } = useGetFundsQuery();
  const { data: waivers } = useGetWaiversQuery();
  const [createFee, { isLoading: isCreating }] = useCreateFeeMutation();
  const [updateFee, { isLoading: isUpdating }] = useUpdateFeeMutation();
  const [deleteFee, { isLoading: isDeleting }] = useDeleteFeeMutation();
console.log("feesData",feesData)
console.log("waivers",waivers)
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

  // Handle student search
  useEffect(() => {
    if (studentData && studentData.length > 0) {
      const matchedStudent = studentData.find(
        (student) => student.user_id.toString() === userId
      );
      setSelectedStudent(matchedStudent || null);
    } else {
      setSelectedStudent(null);
    }
  }, [studentData, userId]);

  // Reset selectAll when feesData changes
  useEffect(() => {
    setSelectAll(false);
    setSelectedFees([]);
  }, [feesData]);

  // Calculate payable amount with waiver
  const calculatePayableAmount = (fee, waivers) => {
    const feeHeadId = parseInt(fee.fee_head_id);
    const waiver = waivers?.find(
      (w) =>
        w.student_id === selectedStudent?.id &&
        w.academic_year.toString() === selectedAcademicYear &&
        Array.isArray(w.fee_types) &&
        w.fee_types.map(Number).includes(feeHeadId)
    );

    const waiverPercentage = waiver ? parseFloat(waiver.waiver_amount) / 100 : 0;
    const feeAmount = parseFloat(fee.amount) || 0;
    const waiverAmount = feeAmount * waiverPercentage;
    const payableAfterWaiver = feeAmount - waiverAmount;
    return {
      waiverAmount: waiverAmount.toFixed(2),
      payableAfterWaiver: payableAfterWaiver.toFixed(2)
    };
  };

  // Filter out deleted fees
  const filteredFees = feesData?.fees_name_records?.filter(
    (fee) =>
      !feesData?.delete_fee_records?.some((del) =>
        del.feetype.some((df) => df.id === fee.id)
      )
  ) || [];

  // Get latest fee status and amounts
  const getFeeStatus = (fee) => {
    const feeRecord = feesData?.fees_records?.find((fr) => fr.feetype_id === fee.id);
    if (!feeRecord) {
      return {
        status: 'UNPAID',
        storedDiscountAmount: '0.00',
        totalPaidAmount: '0.00',
      };
    }

    const recordAmount = parseFloat(feeRecord.amount || 0);
    const storedDiscountAmount = parseFloat(feeRecord.discount_amount || 0);

    return {
      status: feeRecord.status || 'UNPAID',
      storedDiscountAmount: storedDiscountAmount.toFixed(2),
      totalPaidAmount: recordAmount.toFixed(2),
    };
  };

  // Handle payment input change
  const handlePaymentInput = (feeId, value) => {
    setPaymentInputs((prev) => ({ ...prev, [feeId]: value }));
  };

  // Handle discount input change
  const handleDiscountInput = (feeId, value, payableAfterWaiver) => {
    const discount = parseFloat(value) || 0;
    if (discount > parseFloat(payableAfterWaiver)) {
      toast.error(`ডিসকাউন্ট পেয়েবল পরিমাণ (${payableAfterWaiver}) অতিক্রম করতে পারে না`);
      return;
    }
    setDiscountInputs((prev) => ({ ...prev, [feeId]: value }));
  };

  // Handle fee selection
  const handleFeeSelect = (feeId) => {
    setSelectedFees((prev) =>
      prev.includes(feeId)
        ? prev.filter((id) => id !== feeId)
        : [...prev, feeId]
    );
  };

  // Handle Select All checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFees([]);
      setSelectAll(false);
    } else {
      const selectableFees = filteredFees
        .filter((fee) => getFeeStatus(fee).status !== 'PAID')
        .map((fee) => fee.id);
      setSelectedFees(selectableFees);
      setSelectAll(true);
    }
  };

  // Update selectAll state based on selectedFees
  useEffect(() => {
    const selectableFees = filteredFees
      .filter((fee) => getFeeStatus(fee).status !== 'PAID')
      .map((fee) => fee.id);
    if (selectableFees.length > 0 && selectedFees.length === selectableFees.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedFees, filteredFees]);

  // Validate form
  const validateForm = () => {
    if (!selectedAcademicYear) {
      toast.error('অনুগ্রহ করে একাডেমিক বছর নির্বাচন করুন');
      return false;
    }
    if (!selectedFund) {
      toast.error('অনুগ্রহ করে ফান্ড নির্বাচন করুন');
      return false;
    }
    if (!selectedStudent) {
      toast.error('অনুগ্রহ করে ছাত্র নির্বাচন করুন');
      return false;
    }
    if (selectedFees.length === 0) {
      toast.error('অনুগ্রহ করে কমপক্ষে একটি ফি নির্বাচন করুন');
      return false;
    }
    return true;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setModalAction('submit');
    setModalData({ fees: selectedFees });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'submit') {
        const promises = modalData.fees.map(async (feeId) => {
          const fee = filteredFees.find((f) => f.id === feeId);
          const { waiverAmount, payableAfterWaiver } = calculatePayableAmount(fee, waivers);
          const { totalPaidAmount, storedDiscountAmount } = getFeeStatus(fee);

          const currentDiscount = discountInputs[feeId] ?
            parseFloat(discountInputs[feeId]) :
            parseFloat(storedDiscountAmount || 0);

          const currentPayment = parseFloat(paymentInputs[feeId] || 0);
          const previouslyPaid = parseFloat(totalPaidAmount || 0);

          const totalPaidAfterThisTransaction = previouslyPaid + currentPayment;
          const totalPayableAfterWaiverAndDiscount = parseFloat(payableAfterWaiver) - currentDiscount;

          let status = 'UNPAID';
          if (totalPaidAfterThisTransaction >= totalPayableAfterWaiverAndDiscount) {
            status = 'PAID';
          } else if (totalPaidAfterThisTransaction > 0) {
            status = 'PARTIAL';
          }

          const feeData = {
            amount: totalPaidAfterThisTransaction.toFixed(2),
            discount_amount: currentDiscount.toFixed(2),
            waiver_amount: waiverAmount,
            status: status,
            is_enable: true,
            description: '',
            payment_method: 'ONLINE',
            payment_status: '',
            online_transaction_id: '',
            fees_record: '',
            student_id: selectedStudent.id,
            feetype_id: feeId,
            fund_id: parseInt(selectedFund),
            academic_year: parseInt(selectedAcademicYear),
          };

          const existingFeeRecord = feesData?.fees_records?.find(
            (record) => record.feetype_id === feeId
          );

          if (existingFeeRecord) {
            return updateFee({ id: existingFeeRecord.id, ...feeData }).unwrap();
          } else {
            return createFee(feeData).unwrap();
          }
        });

        await Promise.all(promises);
        toast.success('ফি সফলভাবে প্রক্রিয়া করা হয়েছে!');
        setSelectedFees([]);
        setPaymentInputs({});
        setDiscountInputs({});
        setSelectAll(false); // Reset Select All after submission
        refetchFees();
      } else if (modalAction === 'update') {
        await updateFee(modalData).unwrap();
        toast.success('ফি সফলভাবে আপডেট করা হয়েছে!');
        refetchFees();
      } else if (modalAction === 'delete') {
        await deleteFee(modalData.id).unwrap();
        toast.success('ফি সফলভাবে মুছে ফেলা হয়েছে!');
        refetchFees();
      }
    } catch (error) {
      console.error(`ত্রুটি ${modalAction === 'submit' ? 'প্রক্রিয়াকরণ' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'}:`, error);
      toast.error(`ফি ${modalAction === 'submit' ? 'প্রক্রিয়াকরণ' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'} ব্যর্থ: ${error.status || 'অজানা'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle fee update
  const handleUpdateFee = (feeId, updatedData) => {
    setModalAction('update');
    setModalData({ id: feeId, ...updatedData });
    setIsModalOpen(true);
  };

  // Handle fee deletion
  const handleDeleteFee = (feeId) => {
    setModalAction('delete');
    setModalData({ id: feeId });
    setIsModalOpen(true);
  };

  // Options for react-select
  const academicYearOptions = academicYears?.map((year) => ({
    value: year.id,
    label: year.name,
  })) || [];
  const fundOptions = funds?.map((fund) => ({
    value: fund.id,
    label: fund.name,
  })) || [];

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
        {/* Student Search */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl mb-8 animate-fadeIn shadow-xl" ref={dropdownRef}>
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-3xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              বর্তমান ফি
            </h3>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-1">ইউজার আইডি লিখুন</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onFocus={() => setIsUserDropdownOpen(true)}
                placeholder="ইউজার আইডি লিখুন"
                className="w-full bg-transparent p-2 text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isCreating || isUpdating}
                aria-label="ইউজার আইডি"
                title="ইউজার আইডি / User ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-1">একাডেমিক বছর</label>
              <Select
                options={academicYearOptions}
                value={academicYearOptions.find((opt) => opt.value === selectedAcademicYear) || null}
                onChange={(selected) => setSelectedAcademicYear(selected ? selected.value : '')}
                isDisabled={isCreating || isUpdating}
                placeholder="একাডেমিক বছর নির্বাচন করুন"
                className="react-select-container"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isSearchable={false}
                aria-label="একাডেমিক বছর"
                title="একাডেমিক বছর নির্বাচন করুন / Select academic year"
                styles={selectStyles}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-1">ফান্ড</label>
              <Select
                options={fundOptions}
                value={fundOptions.find((opt) => opt.value === selectedFund) || null}
                onChange={(selected) => setSelectedFund(selected ? selected.value : '')}
                isDisabled={isCreating || isUpdating}
                placeholder="ফান্ড নির্বাচন করুন"
                className="react-select-container"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isSearchable={false}
                aria-label="ফান্ড"
                title="ফান্ড নির্বাচন করুন / Select fund"
                styles={selectStyles}
              />
            </div>
          </div>
        </div>

        {/* Student Information */}
        {selectedStudent && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <h2 className="text-xl font-semibold text-[#441a05] mb-4">ছাত্রের তথ্য</h2>
            <p><strong>নাম:</strong> {selectedStudent.name}</p>
            <p><strong>পিতার নাম:</strong> {selectedStudent.father_name || 'অজানা'}</p>
            <p><strong>মাতার নাম:</strong> {selectedStudent.mother_name || 'অজানা'}</p>
            <p><strong>রোল নং:</strong> {selectedStudent.roll_no || 'অজানা'}</p>
          </div>
        )}
        {!selectedStudent && userId && !studentLoading && (
          <p className="text-red-400 mb-8 animate-fadeIn">ইউজার আইডি দিয়ে কোনো ছাত্র পাওয়া যায়নি: {userId}</p>
        )}

        {/* Current Fees Table */}
        {filteredFees.length > 0 && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6 mb-8">
            <h2 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">বর্তমান ফি</h2>
            <form onSubmit={handleSubmit}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ফি শিরোনাম
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        পরিমাণ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ওয়েভার পরিমাণ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ডিসকাউন্ট ইনপুট
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        পেয়েবল পরিমাণ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ইতিমধ্যে প্রদান
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        এখন প্রদান
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        বাকি পরিমাণ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        স্থিতি
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            disabled={isCreating || isUpdating || filteredFees.every(fee => getFeeStatus(fee).status === 'PAID')}
                            className="hidden"
                            aria-label="সব ফি নির্বাচন করুন"
                            title="সব ফি নির্বাচন করুন / Select all fees"
                          />
                          <span
                            className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${selectAll ? 'bg-[#DB9E30] border-[#DB9E30]' : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'}`}
                          >
                            {selectAll && (
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
                          <span className="ml-2 text-[#441a05]/70 text-nowrap">সব নির্বাচন</span>
                        </label>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {filteredFees.map((fee, index) => {
                      const { waiverAmount, payableAfterWaiver } = calculatePayableAmount(fee, waivers);
                      const { status, storedDiscountAmount, totalPaidAmount } = getFeeStatus(fee);
                      const effectiveDiscount = discountInputs[fee.id] ?
                        parseFloat(discountInputs[fee.id]) :
                        parseFloat(storedDiscountAmount || 0);
                      const currentPayment = parseFloat(paymentInputs[fee.id] || 0);
                      const alreadyPaid = parseFloat(totalPaidAmount || 0);
                      const finalPayableAmount = parseFloat(payableAfterWaiver) - effectiveDiscount;
                      const dueAmount = Math.max(0, finalPayableAmount - alreadyPaid - currentPayment).toFixed(2);
                      const existingRecord = feesData?.fees_records?.find(
                        (record) => record.feetype_id === fee.id
                      );
                      const rowClass = status === 'PAID'
                        ? 'bg-green-50/10'
                        : status === 'PARTIAL'
                          ? 'bg-yellow-50/10'
                          : '';

                      return (
                        <tr
                          key={fee.id}
                          className={`bg-white/5 animate-fadeIn ${rowClass}`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                            {fee.fees_title}
                            {existingRecord && (
                              <span className="ml-2 text-xs bg-blue-100/10 text-blue-400 px-2 py-1 rounded">
                                {status === 'PARTIAL' ? 'আপডেট' : 'বিদ্যমান'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                            {fee.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                            {waiverAmount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                            <input
                              type="number"
                              value={discountInputs[fee.id] || ''}
                              onChange={(e) => handleDiscountInput(fee.id, e.target.value, payableAfterWaiver)}
                              className="w-full bg-transparent p-2 text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                              min="0"
                              disabled={status === 'PAID' || isCreating || isUpdating}
                              placeholder={existingRecord ? `বর্তমান: ${storedDiscountAmount}` : '0'}
                              aria-label="ডিসকাউন্ট ইনপুট"
                              title="ডিসকাউন্ট ইনপুট / Discount input"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                            {finalPayableAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                            {alreadyPaid.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                            <input
                              type="number"
                              value={paymentInputs[fee.id] || ''}
                              onChange={(e) => handlePaymentInput(fee.id, e.target.value)}
                              className="w-full bg-transparent p-2 text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                              min="0"
                              disabled={status === 'PAID' || isCreating || isUpdating}
                              placeholder={status === 'PARTIAL' ? `বাকি: ${dueAmount}` : '0'}
                              aria-label="এখন প্রদান"
                              title="এখন প্রদান / Pay now"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-800">
                            {dueAmount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${status === 'PAID'
                                ? 'text-[#441a05] bg-[#DB9E30]'
                                : status === 'PARTIAL'
                                  ? 'text-yellow-800'
                                  : 'text-red-800'
                                }`}
                            >
                              {status === 'PAID' ? 'প্রদান' : status === 'PARTIAL' ? 'আংশিক' : 'অপ্রদান'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedFees.includes(fee.id)}
                                onChange={() => handleFeeSelect(fee.id)}
                                disabled={status === 'PAID' || isCreating || isUpdating}
                                className="hidden"
                                aria-label={`ফি নির্বাচন ${fee.fees_title}`}
                                title={`ফি নির্বাচন করুন / Select fee ${fee.fees_title}`}
                              />
                              <span
                                className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${selectedFees.includes(fee.id)
                                  ? 'bg-[#DB9E30] border-[#DB9E30]'
                                  : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                                  }`}
                              >
                                {selectedFees.includes(fee.id) && (
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                type="submit"
                disabled={selectedFees.length === 0 || isCreating || isUpdating}
                className={`mt-4 relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${selectedFees.length === 0 || isCreating || isUpdating ? 'cursor-not-allowed' : 'hover:text-white hover:shadow-md'
                  }`}
                aria-label="নির্বাচিত ফি জমা দিন"
                title={selectedFees.some(feeId => feesData?.fees_records?.find((record) => record.feetype_id === feeId))
                  ? 'নির্বাচিত ফি আপডেট করুন / Update selected fees'
                  : 'নির্বাচিত ফি জমা দিন / Submit selected fees'}
              >
                {(isCreating || isUpdating) ? (
                  <span className="flex items-center space-x-3">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>প্রক্রিয়াকরণ...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <IoAdd className="w-5 h-5" />
                    <span>
                      {selectedFees.some(feeId => feesData?.fees_records?.find((record) => record.feetype_id === feeId))
                        ? 'নির্বাচিত ফি আপডেট করুন'
                        : 'নির্বাচিত ফি জমা দিন'}
                    </span>
                  </span>
                )}
              </button>
            </form>
          </div>
        )}
        {filteredFees.length === 0 && selectedStudent && (
          <p className="text-[#441a05]/70 mb-8 animate-fadeIn">এই ছাত্রের জন্য কোনো বর্তমান ফি উপলব্ধ নেই।</p>
        )}

        {/* Fee History Table */}
        {feesData?.fees_records?.length > 0 && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
            <h2 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">ফি ইতিহাস</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ফি প্রকার
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      মোট প্রদান পরিমাণ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ওয়েভার পরিমাণ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ডিসকাউন্ট পরিমাণ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      স্থিতি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রিয়াকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {feesData.fees_records.map((fee, index) => {
                    const feeNameRecord = feesData.fees_name_records?.find(
                      (f) => f.id === fee.feetype_id
                    );
                    const waiverAmount = feeNameRecord
                      ? calculatePayableAmount(feeNameRecord, waivers).waiverAmount
                      : '0.00';

                    return (
                      <tr
                        key={fee.id}
                        className="bg-white/5 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {fee.feetype_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {fee.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {fee.waiver_amount || waiverAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {fee.discount_amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${fee.status === 'PAID'
                              ? 'text-[#441a05] bg-[#DB9E30]'
                              : fee.status === 'PARTIAL'
                                ? 'text-yellow-800 bg-yellow-100/50'
                                : 'text-red-800 bg-red-100/50'
                              }`}
                          >
                            {fee.status === 'PAID' ? 'প্রদান' : fee.status === 'PARTIAL' ? 'আংশিক' : 'অপ্রদান'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() =>
                              handleUpdateFee(fee.id, {
                                amount: fee.amount,
                                discount_amount: fee.discount_amount,
                                status: fee.status,
                                waiver_amount: fee.waiver_amount || waiverAmount,
                              })
                            }
                            title="ফি আপডেট করুন / Update fee"
                            className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFee(fee.id)}
                            title="ফি মুছুন / Delete fee"
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
            {(isDeleting || isUpdating) && (
              <div
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: '0.4s' }}
              >
                {isDeleting
                  ? 'ফি মুছে ফেলা হচ্ছে...'
                  : 'ফি আপডেট করা হচ্ছে...'}
              </div>
            )}
          </div>
        )}
        {feesData?.fees_records?.length === 0 && selectedStudent && (
          <p className="text-[#441a05]/70 animate-fadeIn">এই ছাত্রের জন্য কোনো ফি ইতিহাস উপলব্ধ নেই।</p>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'submit' && 'নির্বাচিত ফি নিশ্চিত করুন'}
                {modalAction === 'update' && 'ফি আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'ফি মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'submit' && 'আপনি কি নিশ্চিত যে নির্বাচিত ফি প্রক্রিয়া করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে ফি আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই ফি মুছে ফেলতে চান?'}
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

export default CurrentFees;