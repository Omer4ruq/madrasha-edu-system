
import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import Select from 'react-select';
import { Toaster, toast } from 'react-hot-toast';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetStudentPreviousFeesQuery } from '../../redux/features/api/studentFeesPreviousApi/studentFeesPreviousApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetFundsQuery } from '../../redux/features/api/funds/fundsApi';
import { useGetWaiversQuery } from '../../redux/features/api/waivers/waiversApi';
import { useCreateFeeMutation, useDeleteFeeMutation, useUpdateFeeMutation } from '../../redux/features/api/fees/feesApi';
import selectStyles from '../../utilitis/selectStyles';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { useSelector } from 'react-redux';

const PreviousFees = () => {
  const { group_id } = useSelector((state) => state.auth);
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
  const [selectAll, setSelectAll] = useState(false);
  const dropdownRef = useRef(null);

  // API Queries
  const { data: studentData, isLoading: studentLoading, error: studentError } = useGetStudentActiveApiQuery(
    userId ? { user_id: userId } : undefined,
    { skip: !userId }
  );
  const { 
    data: feesData, 
    refetch: refetchFees 
  } = useGetStudentPreviousFeesQuery(selectedStudent?.id, { skip: !selectedStudent });
  const { data: academicYears } = useGetAcademicYearApiQuery();
  const { data: funds } = useGetFundsQuery();
  const { data: waivers } = useGetWaiversQuery();
  const [createFee, { isLoading: isCreating }] = useCreateFeeMutation();
  const [updateFee, { isLoading: isUpdating }] = useUpdateFeeMutation();
  const [deleteFee, { isLoading: isDeleting }] = useDeleteFeeMutation();
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Check permissions
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_fees') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_fees') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_fees') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_fees') || false;

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
    return {
      status: feeRecord?.status || 'UNPAID',
      discountAmount: feeRecord?.discount_amount || '0.00',
      paidAmount: feeRecord?.amount 
        ? (parseFloat(feeRecord.amount) - parseFloat(feeRecord.discount_amount || 0)).toFixed(2) 
        : '0.00',
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
    if (!hasAddPermission && !hasChangePermission) {
        toast.error('ফি নির্বাচন করার অনুমতি নেই।');
        return;
    }
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
    if (!hasAddPermission) {
        toast.error('ফি জমা দেওয়ার অনুমতি নেই।');
        return;
    }
    if (!validateForm()) return;

    setModalAction('submit');
    setModalData({ fees: selectedFees });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'submit') {
        if (!hasAddPermission) {
            toast.error('ফি জমা দেওয়ার অনুমতি নেই।');
            return;
        }
        const promises = modalData.fees.map(async (feeId) => {
          const fee = filteredFees.find((f) => f.id === feeId);
          const { waiverAmount, payableAfterWaiver } = calculatePayableAmount(fee, waivers);
          const { paidAmount, discountAmount } = getFeeStatus(fee);
          
          const currentDiscount = parseFloat(discountInputs[feeId] || discountAmount || 0);
          const currentPayment = parseFloat(paymentInputs[feeId] || 0);
          const previouslyPaid = parseFloat(paidAmount || 0);
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
            if (!hasChangePermission) {
                toast.error('ফি আপডেট করার অনুমতি নেই।');
                return;
            }
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
        setSelectAll(false); 
        refetchFees();
      } else if (modalAction === 'update') {
        if (!hasChangePermission) {
            toast.error('ফি আপডেট করার অনুমতি নেই।');
            return;
        }
        await updateFee(modalData).unwrap();
        toast.success('ফি সফলভাবে আপডেট করা হয়েছে!');
        refetchFees();
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) {
            toast.error('ফি মুছে ফেলার অনুমতি নেই।');
            return;
        }
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
    if (!hasChangePermission) {
        toast.error('ফি আপডেট করার অনুমতি নেই।');
        return;
    }
    setModalAction('update');
    setModalData({ id: feeId, ...updatedData });
    setIsModalOpen(true);
  };

  // Handle fee deletion
  const handleDeleteFee = (feeId) => {
    if (!hasDeletePermission) {
        toast.error('ফি মুছে ফেলার অনুমতি নেই।');
        return;
    }
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

  if (permissionsLoading) {
    return <div className="p-4 text-[#441a05]/70 animate-fadeIn">লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }
  
  // View-only mode
  if (hasViewPermission && !hasAddPermission && !hasChangePermission && !hasDeletePermission) {
    return (
        <div className="py-8">
            <Toaster position="top-right" reverseOrder={false} />
             {/* Student Search Form */}
             <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl mb-8 animate-fadeIn shadow-xl" ref={dropdownRef}>
                <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
                    <IoAddCircle className="text-3xl text-[#441a05]" />
                    <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
                    পূর্ববর্তী ফি
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                    <label className="block text-sm font-medium text-[#441a05] mb-1">ইউজার আইডি লিখুন</label>
                    <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="ইউজার আইডি লিখুন"
                        className="w-full bg-transparent p-2 text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
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
                        placeholder="একাডেমিক বছর নির্বাচন করুন"
                        className="react-select-container"
                        classNamePrefix="react-select"
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

            {/* Read-only Fees Table */}
            {filteredFees.length > 0 && (
                <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6 mb-8">
                    <h2 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">পূর্ববর্তী ফি</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/20">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ফি শিরোনাম</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">পরিমাণ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ওয়েভার</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ডিসকাউন্ট</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">প্রদান করা হয়েছে</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">বাকি</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">স্থিতি</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/20">
                                {filteredFees.map((fee, index) => {
                                    const { waiverAmount, payableAfterWaiver } = calculatePayableAmount(fee, waivers);
                                    const { status, discountAmount, paidAmount } = getFeeStatus(fee);
                                    const dueAmount = (parseFloat(payableAfterWaiver) - parseFloat(discountAmount) - parseFloat(paidAmount)).toFixed(2);
                                    return (
                                        <tr key={fee.id} className="bg-white/5">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{fee.fees_title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{fee.amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{waiverAmount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{discountAmount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{paidAmount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-400">{Math.max(0, dueAmount).toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status === 'PAID' ? 'text-[#441a05] bg-[#DB9E30]' : status === 'PARTIAL' ? 'text-yellow-800 bg-yellow-100/50' : 'text-red-800 bg-red-100/50'}`}>
                                                    {status === 'PAID' ? 'প্রদান' : status === 'PARTIAL' ? 'আংশিক' : 'অপ্রদান'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="py-8">
      <Toaster position="top-right" reverseOrder={false} />
      <style>
        {`
          /* Styles are unchanged */
        `}
      </style>

      <div>
        {/* Student Search */}
        {(hasAddPermission || hasChangePermission || hasDeletePermission) && (
            <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl mb-8 animate-fadeIn shadow-xl" ref={dropdownRef}>
                <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
                    <IoAddCircle className="text-3xl text-[#441a05]" />
                    <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
                    পূর্ববর্তী ফি
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isSearchable={false}
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
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isSearchable={false}
                    />
                    </div>
                </div>
            </div>
        )}

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

        {/* Previous Fees Table */}
        {(hasAddPermission || hasChangePermission) && filteredFees.length > 0 && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6 mb-8">
            <h2 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">পূর্ববর্তী ফি</h2>
            <form onSubmit={handleSubmit}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ফি শিরোনাম</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">পরিমাণ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ওয়েভার পরিমাণ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ডিসকাউন্ট ইনপুট</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">পেয়েবল পরিমাণ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">এখন প্রদান</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">বাকি পরিমাণ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ডিসকাউন্ট পরিমাণ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">স্থিতি</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            disabled={isCreating || isUpdating || !hasChangePermission || filteredFees.every(fee => getFeeStatus(fee).status === 'PAID')}
                            className="hidden"
                          />
                          <span className={`w-6 h-6 border-2 rounded-md flex items-center justify-center`}>
                            {selectAll && <svg className="w-4 h-4 text-[#441a05]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>}
                          </span>
                          <span className="ml-2 text-[#441a05]/70 text-nowrap">সব নির্বাচন</span>
                        </label>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {filteredFees.map((fee, index) => {
                      const { waiverAmount, payableAfterWaiver } = calculatePayableAmount(fee, waivers);
                      const { status, discountAmount, paidAmount } = getFeeStatus(fee);
                      const discount = parseFloat(discountInputs[fee.id] || 0);
                      const finalPayable = status === 'PAID' 
                        ? '0.00' 
                        : (parseFloat(payableAfterWaiver) - discount - parseFloat(paidAmount || 0)).toFixed(2);
                      const paidNow = parseFloat(paymentInputs[fee.id] || 0);
                      const dueAmount = (parseFloat(finalPayable) - paidNow).toFixed(2);

                      return (
                        <tr key={fee.id} className={`bg-white/5`}>
                          <td className="px-6 py-4">{fee.fees_title}</td>
                          <td className="px-6 py-4">{fee.amount}</td>
                          <td className="px-6 py-4">{waiverAmount}</td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={discountInputs[fee.id] || ''}
                              onChange={(e) => handleDiscountInput(fee.id, e.target.value, payableAfterWaiver)}
                              disabled={status === 'PAID' || isCreating || isUpdating || !hasChangePermission}
                              placeholder={discountAmount}
                            />
                          </td>
                          <td className="px-6 py-4">{finalPayable}</td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={paymentInputs[fee.id] || ''}
                              onChange={(e) => handlePaymentInput(fee.id, e.target.value)}
                              disabled={status === 'PAID' || isCreating || isUpdating || !hasChangePermission}
                              placeholder={status === 'PARTIAL' ? `বাকি: ${dueAmount}` : '0'}
                            />
                          </td>
                          <td className="px-6 py-4">{dueAmount}</td>
                          <td className="px-6 py-4">{discountAmount}</td>
                          <td className="px-6 py-4">{status}</td>
                          <td className="px-6 py-4">
                            <input
                                type="checkbox"
                                checked={selectedFees.includes(fee.id)}
                                onChange={() => handleFeeSelect(fee.id)}
                                disabled={status === 'PAID' || isCreating || isUpdating || !hasChangePermission}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {hasAddPermission && (
                <button
                    type="submit"
                    disabled={selectedFees.length === 0 || isCreating || isUpdating}
                    className={`mt-4 relative inline-flex items-center ...`}
                >
                    {(isCreating || isUpdating) ? 'প্রক্রিয়াকরণ...' : 'নির্বাচিত ফি জমা দিন'}
                </button>
              )}
            </form>
          </div>
        )}
        {(hasAddPermission || hasChangePermission) && filteredFees.length === 0 && selectedStudent && (
          <p className="text-[#441a05]/70 mb-8 animate-fadeIn">এই ছাত্রের জন্য কোনো পূর্ববর্তী ফি উপলব্ধ নেই।</p>
        )}

        {/* Fee History Table */}
        {feesData?.fees_records?.length > 0 && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
            <h2 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">ফি ইতিহাস</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3">ফি প্রকার</th>
                    <th className="px-6 py-3">মোট প্রদান পরিমাণ</th>
                    <th className="px-6 py-3">ডিসকাউন্ট পরিমাণ</th>
                    <th className="px-6 py-3">স্থিতি</th>
                    <th className="px-6 py-3">ক্রিয়াকলাপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {feesData.fees_records.map((fee, index) => (
                    <tr key={fee.id} >
                      <td className="px-6 py-4">{fee.feetype_name}</td>
                      <td className="px-6 py-4">{fee.amount}</td>
                      <td className="px-6 py-4">{fee.discount_amount}</td>
                      <td className="px-6 py-4">{fee.status}</td>
                      <td className="px-6 py-4">
                        {hasChangePermission && (
                            <button onClick={() => handleUpdateFee(fee.id, { ...fee })} >
                                <FaEdit />
                            </button>
                        )}
                        {hasDeletePermission && (
                            <button onClick={() => handleDeleteFee(fee.id)} >
                                <FaTrash />
                            </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(isDeleting || isUpdating) && <div>...</div>}
          </div>
        )}
        
        {/* Confirmation Modal */}
        {(hasAddPermission || hasChangePermission || hasDeletePermission) && isModalOpen && (
          <div className="fixed inset-0 bg-black/50 ...">
            <div className="bg-white ...">
              <h3>
                {modalAction === 'submit' && 'নির্বাচিত ফি নিশ্চিত করুন'}
                {modalAction === 'update' && 'ফি আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'ফি মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p>...</p>
              <div className="flex justify-end space-x-4">
                <button onClick={() => setIsModalOpen(false)}>বাতিল</button>
                <button onClick={confirmAction}>নিশ্চিত করুন</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousFees;

