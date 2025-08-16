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
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { useSelector } from 'react-redux';

import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer'; // Add PDF imports
import CurrentFeeHistoryTable from './CurrentFeeHistoryTable';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';

// Register Noto Sans Bengali font for voucher
try {
  Font.register({
    family: 'NotoSansBengali',
    src: 'https://fonts.gstatic.com/ea/notosansbengali/v3/NotoSansBengali-Regular.ttf',
  });
} catch (error) {
  console.error('Font registration failed:', error);
  Font.register({
    family: 'Helvetica',
    src: 'https://fonts.gstatic.com/s/helvetica/v13/Helvetica.ttf',
  });
}

// PDF styles for voucher
const voucherStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'NotoSansBengali',
    fontSize: 12,
    color: '#222',
    backgroundColor: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#441a05',
    paddingBottom: 15,
  },
  schoolName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#441a05',
    marginBottom: 5,
  },
  headerText: {
    fontSize: 12,
    marginBottom: 3,
    color: '#666',
  },
  voucherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#441a05',
    textDecoration: 'underline',
  },
  voucherNumber: {
    fontSize: 10,
    color: '#888',
    marginTop: 5,
  },
  studentInfo: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  studentInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#441a05',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 120,
    color: '#555',
  },
  infoValue: {
    fontSize: 11,
    flex: 1,
    color: '#333',
  },
  table: {
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#441a05',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#441a05',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    padding: 8,
    backgroundColor: '#fff',
  },
  tableRowAlternate: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    textAlign: 'left',
    paddingHorizontal: 4,
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#441a05',
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#441a05',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#555',
  },
  summaryValue: {
    fontSize: 11,
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#441a05',
    paddingTop: 8,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#441a05',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#441a05',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#666',
  },
  signature: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    textAlign: 'center',
    width: 150,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 5,
    height: 40,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#666',
  },
});

// Fee Voucher PDF Component
const FeeVoucherPDF = ({ 
  student, 
  feeDetails, 
  academicYear, 
  fund, 
  totalAmount, 
  totalWaiver, 
  totalDiscount, 
  netPayable,
  voucherNumber,
  institute
}) => (
  
  <Document>
    <Page size="A4" style={voucherStyles.page}>
      {/* Header */}
      <View style={voucherStyles.header}>
        <Text style={voucherStyles.schoolName}>{institute?.institute_name}</Text>
        <Text style={voucherStyles.headerText}>{institute?.institute_address}</Text>
        <Text style={voucherStyles.headerText}>{institute?.institute_email_address} | {institute?.institute_mobile}</Text>
        <Text style={voucherStyles.voucherTitle}>ফি পেমেন্ট ভাউচার</Text>
        <Text style={voucherStyles.voucherNumber}>ভাউচার নং: {voucherNumber}</Text>
      </View>

      {/* Student Information */}
      <View style={voucherStyles.studentInfo}>
        <Text style={voucherStyles.studentInfoTitle}>ছাত্র/ছাত্রীর তথ্য</Text>
        <View style={voucherStyles.infoRow}>
          <Text style={voucherStyles.infoLabel}>নাম:</Text>
          <Text style={voucherStyles.infoValue}>{student.name}</Text>
        </View>
        <View style={voucherStyles.infoRow}>
          <Text style={voucherStyles.infoLabel}>রোল নং:</Text>
          <Text style={voucherStyles.infoValue}>{student.roll_no || 'অজানা'}</Text>
        </View>
        <View style={voucherStyles.infoRow}>
          <Text style={voucherStyles.infoLabel}>পিতার নাম:</Text>
          <Text style={voucherStyles.infoValue}>{student.father_name || 'অজানা'}</Text>
        </View>
        <View style={voucherStyles.infoRow}>
          <Text style={voucherStyles.infoLabel}>শিক্ষাবর্ষ:</Text>
          <Text style={voucherStyles.infoValue}>{academicYear}</Text>
        </View>
        <View style={voucherStyles.infoRow}>
          <Text style={voucherStyles.infoLabel}>তহবিল:</Text>
          <Text style={voucherStyles.infoValue}>{fund}</Text>
        </View>
        <View style={voucherStyles.infoRow}>
          <Text style={voucherStyles.infoLabel}>পেমেন্ট তারিখ:</Text>
          <Text style={voucherStyles.infoValue}>
            {new Date().toLocaleDateString('bn-BD', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      </View>

      {/* Fee Details Table */}
      <View style={voucherStyles.table}>
        <View style={voucherStyles.tableHeader}>
          <Text style={[voucherStyles.tableCell, { flex: 2 }]}>ফি বিবরণ</Text>
          <Text style={[voucherStyles.tableCell, voucherStyles.tableCellCenter]}>মূল পরিমাণ</Text>
          <Text style={[voucherStyles.tableCell, voucherStyles.tableCellCenter]}>ওয়েভার</Text>
          <Text style={[voucherStyles.tableCell, voucherStyles.tableCellCenter]}>ডিসকাউন্ট</Text>
          <Text style={[voucherStyles.tableCell, voucherStyles.tableCellCenter]}>প্রদেয় পরিমাণ</Text>
        </View>
        {feeDetails.map((fee, index) => (
          <View key={fee.id} style={[voucherStyles.tableRow, index % 2 === 1 && voucherStyles.tableRowAlternate]}>
            <Text style={[voucherStyles.tableCell, { flex: 2 }]}>{fee.name}</Text>
            <Text style={[voucherStyles.tableCell, voucherStyles.tableCellCenter]}>{fee.originalAmount}</Text>
            <Text style={[voucherStyles.tableCell, voucherStyles.tableCellCenter]}>{fee.waiverAmount}</Text>
            <Text style={[voucherStyles.tableCell, voucherStyles.tableCellCenter]}>{fee.discountAmount}</Text>
            <Text style={[voucherStyles.tableCell, voucherStyles.tableCellCenter]}>{fee.paidAmount}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={voucherStyles.summary}>
        <Text style={voucherStyles.summaryTitle}>পেমেন্ট সারসংক্ষেপ</Text>
        <View style={voucherStyles.summaryRow}>
          <Text style={voucherStyles.summaryLabel}>মোট ফি:</Text>
          <Text style={voucherStyles.summaryValue}>{totalAmount} টাকা</Text>
        </View>
        <View style={voucherStyles.summaryRow}>
          <Text style={voucherStyles.summaryLabel}>মোট ওয়েভার:</Text>
          <Text style={voucherStyles.summaryValue}>{totalWaiver} টাকা</Text>
        </View>
        <View style={voucherStyles.summaryRow}>
          <Text style={voucherStyles.summaryLabel}>মোট ডিসকাউন্ট:</Text>
          <Text style={voucherStyles.summaryValue}>{totalDiscount} টাকা</Text>
        </View>
        <View style={voucherStyles.totalRow}>
          <Text style={voucherStyles.totalLabel}>মোট প্রদেয় পরিমাণ:</Text>
          <Text style={voucherStyles.totalValue}>{netPayable} টাকা</Text>
        </View>
      </View>

      {/* Signatures */}
      <View style={voucherStyles.signature}>
        <View style={voucherStyles.signatureBox}>
          <View style={voucherStyles.signatureLine}></View>
          <Text style={voucherStyles.signatureLabel}>ছাত্র/অভিভাবক স্বাক্ষর</Text>
        </View>
        <View style={voucherStyles.signatureBox}>
          <View style={voucherStyles.signatureLine}></View>
          <Text style={voucherStyles.signatureLabel}>ক্যাশিয়ার স্বাক্ষর</Text>
        </View>
        <View style={voucherStyles.signatureBox}>
          <View style={voucherStyles.signatureLine}></View>
          <Text style={voucherStyles.signatureLabel}>প্রিন্সিপাল স্বাক্ষর</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={voucherStyles.footer} fixed>
        <Text style={voucherStyles.footerText}>
          এই ভাউচারটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।
        </Text>
        <Text style={voucherStyles.footerText}>
          মুদ্রণ তারিখ: {new Date().toLocaleDateString('bn-BD')} {new Date().toLocaleTimeString('bn-BD')}
        </Text>
      </View>
    </Page>
  </Document>
);

const CurrentFees = () => {
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
const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();
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
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  console.log("studentData", studentData)
  console.log("feesData", feesData)
  console.log("waivers", waivers)

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

  // Generate voucher number
  const generateVoucherNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `FV-${timestamp}-${random}`;
  };
console.log("institute", institute)
  // Generate and download fee voucher
  const generateFeeVoucher = async (processedFees) => {
    try {
      const voucherNumber = generateVoucherNumber();
      
      // Calculate totals
      let totalAmount = 0;
      let totalWaiver = 0;
      let totalDiscount = 0;
      let netPayable = 0;

      const feeDetails = processedFees.map(feeId => {
        const fee = filteredFees.find(f => f.id === feeId);
        const { waiverAmount, payableAfterWaiver } = calculatePayableAmount(fee, waivers);
        const { storedDiscountAmount } = getFeeStatus(fee);
        
        const currentDiscount = discountInputs[feeId] ? 
          parseFloat(discountInputs[feeId]) : 
          parseFloat(storedDiscountAmount || 0);
        const paidAmount = parseFloat(paymentInputs[feeId] || 0);
        const originalAmount = parseFloat(fee.amount);
        
        totalAmount += originalAmount;
        totalWaiver += parseFloat(waiverAmount);
        totalDiscount += currentDiscount;
        netPayable += paidAmount;

        return {
          id: fee.id,
          name: fee.fees_title,
          originalAmount: originalAmount.toFixed(2),
          waiverAmount: waiverAmount,
          discountAmount: currentDiscount.toFixed(2),
          paidAmount: paidAmount.toFixed(2)
        };
      });

      // Get academic year and fund names
      const academicYearName = academicYears?.find(year => year.id === selectedAcademicYear)?.name || 'অজানা';
      const fundName = funds?.find(fund => fund.id === selectedFund)?.name || 'অজানা';

      const voucherData = {
        student: selectedStudent,
        feeDetails,
        academicYear: academicYearName,
        fund: fundName,
        totalAmount: totalAmount.toFixed(2),
        totalWaiver: totalWaiver.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        netPayable: netPayable.toFixed(2),
        voucherNumber,
        institute
      };

      const doc = <FeeVoucherPDF {...voucherData} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ফি_ভাউচার_${selectedStudent.name}_${voucherNumber}_${new Date().toLocaleDateString('bn-BD')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('ভাউচার সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('Voucher generation error:', error);
      toast.error(`ভাউচার তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
  };

  // Calculate payable amount with waiver
// Calculate payable amount with waiver - Fixed version
const calculatePayableAmount = (fee, waivers) => {
  console.log('Calculating waiver for fee:', fee);
  console.log('Available waivers:', waivers);
  console.log('Selected student:', selectedStudent);
  console.log('Selected academic year:', selectedAcademicYear);
  
  if (!fee || !waivers || !selectedStudent || !selectedAcademicYear) {
    console.log('Missing required data for waiver calculation');
    return {
      waiverAmount: '0.00',
      payableAfterWaiver: parseFloat(fee?.amount || 0).toFixed(2)
    };
  }

  const feeHeadId = parseInt(fee.fee_head_id);
  console.log('Looking for fee head ID:', feeHeadId);
  
  // Find waiver for this student and academic year
  const waiver = waivers?.find((w) => {
    console.log('Checking waiver:', w);
    console.log('Waiver student_id:', w.student_id, 'Selected student ID:', selectedStudent.id);
    console.log('Waiver academic_year:', w.academic_year, 'Selected academic year:', selectedAcademicYear);
    console.log('Waiver fee_types:', w.fee_types);
    
    // Check if student matches
    const studentMatches = w.student_id === selectedStudent.id;
    
    // Check if academic year matches (convert both to string for comparison)
    const academicYearMatches = String(w.academic_year) === String(selectedAcademicYear);
    
    // Check if fee type is included
    let feeTypeMatches = false;
    if (Array.isArray(w.fee_types)) {
      // Convert all fee types to numbers for comparison
      const feeTypesAsNumbers = w.fee_types.map(ft => parseInt(ft));
      feeTypeMatches = feeTypesAsNumbers.includes(feeHeadId);
    }
    
    console.log('Student matches:', studentMatches);
    console.log('Academic year matches:', academicYearMatches);
    console.log('Fee type matches:', feeTypeMatches);
    
    return studentMatches && academicYearMatches && feeTypeMatches;
  });
  
  console.log('Found waiver:', waiver);
  
  const waiverPercentage = waiver ? parseFloat(waiver.waiver_amount) / 100 : 0;
  const feeAmount = parseFloat(fee.amount) || 0;
  const waiverAmount = feeAmount * waiverPercentage;
  const payableAfterWaiver = feeAmount - waiverAmount;
  
  console.log('Waiver percentage:', waiverPercentage);
  console.log('Fee amount:', feeAmount);
  console.log('Waiver amount:', waiverAmount);
  console.log('Payable after waiver:', payableAfterWaiver);
  
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
    if (!hasAddPermission) {
      toast.error('ফি যোগ করার অনুমতি নেই।');
      return false;
    }
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
        
        // Generate and download voucher
        await generateFeeVoucher(modalData.fees);
        
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

  // View-only mode for users with only view permission
  if (hasViewPermission && !hasAddPermission && !hasChangePermission && !hasDeletePermission) {
    return (
      <div className="py-8">
        <Toaster position="top-right" reverseOrder={false} />
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h2 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">বর্তমান ফি</h2>
          {studentLoading ? (
            <p className="p-4 text-[#441a05]/70">লোড হচ্ছে...</p>
          ) : studentError ? (
            <p className="p-4 text-red-400">ত্রুটি: {studentError.status || "অজানা"} - {JSON.stringify(studentError.data || {})}</p>
          ) : !selectedStudent ? (
            <p className="p-4 text-[#441a05]/70">কোনো ছাত্র নির্বাচিত নয়।</p>
          ) : filteredFees.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">এই ছাত্রের জন্য কোনো বর্তমান ফি উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ফি শিরোনাম</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">পরিমাণ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ওয়েভার পরিমাণ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ডিসকাউন্ট</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">পেয়েবল পরিমাণ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ইতিমধ্যে প্রদান</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">বাকি পরিমাণ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">স্থিতি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredFees.map((fee, index) => {
                    const { waiverAmount, payableAfterWaiver } = calculatePayableAmount(fee, waivers);
                    const { status, storedDiscountAmount, totalPaidAmount } = getFeeStatus(fee);
                    const finalPayableAmount = parseFloat(payableAfterWaiver) - parseFloat(storedDiscountAmount || 0);
                    const dueAmount = Math.max(0, finalPayableAmount - parseFloat(totalPaidAmount || 0)).toFixed(2);
                    const rowClass = status === 'PAID' ? 'bg-green-50/10' : status === 'PARTIAL' ? 'bg-yellow-50/10' : '';

                    return (
                      <tr key={fee.id} className={`bg-white/5 animate-fadeIn ${rowClass}`} style={{ animationDelay: `${index * 0.1}s` }}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{fee.fees_title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{fee.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{waiverAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{storedDiscountAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{finalPayableAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{totalPaidAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-800">{dueAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status === 'PAID' ? 'text-[#441a05] bg-[#DB9E30]' : status === 'PARTIAL' ? 'text-yellow-800' : 'text-red-800'}`}>
                            {status === 'PAID' ? 'প্রদান' : status === 'PARTIAL' ? 'আংশিক' : 'অপ্রদান'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Fee History Table - Using the new component */}
        {/* {feesData?.fees_records?.length > 0 && (
          <div className="mt-8">
            <FeeHistoryTable
              feeRecords={feesData.fees_records}
              feesNameRecords={feesData.fees_name_records}
              waivers={waivers}
              selectedStudent={selectedStudent}
              hasChangePermission={false}
              hasDeletePermission={false}
              hasViewPermission={hasViewPermission}
              calculatePayableAmount={calculatePayableAmount}
            />
          </div>
        )} */}
      </div>
    );
  }

  if (permissionsLoading) {
    return <div className="p-4 text-[#441a05]/70 animate-fadeIn">লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

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
        {(hasAddPermission || hasChangePermission || hasDeletePermission) && (
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

        {/* Current Fees Table */}
        {(hasAddPermission || hasChangePermission) && filteredFees.length > 0 && (
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
        {(hasAddPermission || hasChangePermission) && filteredFees.length === 0 && selectedStudent && (
          <p className="text-[#441a05]/70 mb-8 animate-fadeIn">এই ছাত্রের জন্য কোনো বর্তমান ফি উপলব্ধ নেই।</p>
        )}

        {/* Fee History Table - Using the new component */}
        {feesData?.fees_records?.length > 0 && (
          <CurrentFeeHistoryTable
            feeRecords={feesData.fees_records}
            feesNameRecords={feesData.fees_name_records}
            waivers={waivers}
            selectedStudent={selectedStudent}
            hasChangePermission={hasChangePermission}
            hasDeletePermission={hasDeletePermission}
            hasViewPermission={hasViewPermission}
            onUpdateFee={handleUpdateFee}
            onDeleteFee={handleDeleteFee}
            calculatePayableAmount={calculatePayableAmount}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            institute={institute}
          />
        )}

        {/* Confirmation Modal */}
        {(hasAddPermission || hasChangePermission || hasDeletePermission) && isModalOpen && (
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