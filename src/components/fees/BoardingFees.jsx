import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import Select from 'react-select';
import { Toaster, toast } from 'react-hot-toast';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetStudentCurrentFeesQuery } from '../../redux/features/api/studentFeesCurrentApi/studentFeesCurrentApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetFundsQuery } from '../../redux/features/api/funds/fundsApi';
import { useGetWaiversQuery } from '../../redux/features/api/waivers/waiversApi';
import { useCreateFeeMutation, useUpdateFeeMutation, useDeleteFeeMutation } from '../../redux/features/api/fees/feesApi';
import selectStyles from '../../utilitis/selectStyles'; // Assuming this path is correct
import { useSelector } from 'react-redux'; // Import useSelector
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi'; // Import permission hook
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';

// Register Noto Sans Bengali font
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

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'NotoSansBengali',
    fontSize: 10,
    color: '#222',
  },
  header: {
    textAlign: 'center',
    marginBottom: 15,
  },
  schoolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#441a05',
  },
  headerText: {
    fontSize: 10,
    marginTop: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 10,
    color: '#441a05',
    textDecoration: 'underline',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    marginBottom: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#441a05',
    marginVertical: 6,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#441a05',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#441a05',
  },
  tableHeader: {
    backgroundColor: '#441a05',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#fff',
  },
  tableCell: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    flex: 1,
    textAlign: 'left',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableRowAlternate: {
    backgroundColor: '#f2f2f2',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#555',
  },
});

// PDF Document Component
const PDFDocument = ({ feeRecords, filterType, feeTypeFilter, startDate, endDate, selectedStudent, institute }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>{institute?.institute_name}</Text>
        <Text style={styles.headerText}>{institute?.institute_address}</Text>
        <Text style={styles.headerText}>{institute?.institute_email_address} | {institute?.institute_mobile}</Text>
          
        <Text style={styles.title}>
          বোর্ডিং ফি ইতিহাস প্রতিবেদন - {filterType === 'due' ? 'বকেয়া ' : filterType === 'paid' ? 'পরিশোধিত ফি' : 'সমস্ত ফি'}
        </Text>
        {selectedStudent && (
          <Text style={styles.headerText}>
            ছাত্র: {selectedStudent.name} (রোল: {selectedStudent.roll_no || 'অজানা'})
          </Text>
        )}
        {feeTypeFilter && (
          <Text style={styles.headerText}>
            ফি প্রকার: {feeTypeFilter}
          </Text>
        )}
        <View style={styles.metaContainer}>
          <Text>
            তারিখ পরিসীমা: {startDate ? new Date(startDate).toLocaleDateString('bn-BD') : 'শুরু'} থেকে {endDate ? new Date(endDate).toLocaleDateString('bn-BD') : 'শেষ'}
          </Text>
          <Text>
            তৈরির তারিখ: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
          </Text>
        </View>
        <View style={styles.divider} />
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { flex: 1.5 }]}>ফি প্রকার</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>মোট প্রদান পরিমাণ</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>ওয়েভার পরিমাণ</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>ডিসকাউন্ট পরিমাণ</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>স্থিতি</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>তৈরির তারিখ</Text>
        </View>
        {feeRecords.map((fee, index) => (
          <View key={fee.id} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlternate]}>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{fee.feetype_name}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>{fee.amount}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>{fee.waiver_amount || '0.00'}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>{fee.discount_amount}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
              {fee.status === 'PAID' ? 'প্রদান' : fee.status === 'PARTIAL' ? 'আংশিক' : 'অপ্রদান'}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
              {fee.created_at ? new Date(fee.created_at).toLocaleDateString('bn-BD') : 'অজানা'}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.footer} fixed>
        <Text>প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</Text>
        <Text render={({ pageNumber, totalPages }) => `পৃষ্ঠা ${pageNumber} এর ${totalPages}`} />
      </View>
    </Page>
  </Document>
);

const BoardingFees = () => {
  const { user, group_id } = useSelector((state) => state.auth); // Get user and group_id
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
  
  // History filter states
  const [historyFilterType, setHistoryFilterType] = useState('all'); // 'all', 'due', 'paid'
  const [historyFeeTypeFilter, setHistoryFeeTypeFilter] = useState(''); // Filter by fee type
  const [historyDateFilter, setHistoryDateFilter] = useState({ startDate: '', endDate: '' });
  const [historyDateFilterType, setHistoryDateFilterType] = useState(''); // 'date', 'month'
  
  const dropdownRef = useRef(null);

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_fees') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_fees') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_fees') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_fees') || false;

  // API Queries
  const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();
  const { data: studentData, isLoading: studentLoading, error: studentError } = useGetStudentActiveApiQuery(
    userId ? { user_id: userId } : undefined,
    { skip: !userId || !hasViewPermission } // Skip query if no view permission
  );
  const {
    data: feesData,
    refetch: refetchFees,
    isLoading: feesDataLoading, // Added loading state
  } = useGetStudentCurrentFeesQuery(selectedStudent?.id, { skip: !selectedStudent || !hasViewPermission });
  const { data: academicYears, isLoading: academicYearsLoading } = useGetAcademicYearApiQuery(undefined, { skip: !hasViewPermission });
  const { data: funds, isLoading: fundsLoading } = useGetFundsQuery(undefined, { skip: !hasViewPermission });
  const { data: waivers, isLoading: waiversLoading } = useGetWaiversQuery(undefined, { skip: !hasViewPermission });
  const [createFee, { isLoading: isCreating }] = useCreateFeeMutation();
  const [updateFee, { isLoading: isUpdating }] = useUpdateFeeMutation();
  const [deleteFee, { isLoading: isDeleting }] = useDeleteFeeMutation();

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

  // Filter out deleted fees and only show boarding fees
  const filteredFees = feesData?.fees_name_records?.filter(
    (fee) =>
      fee.is_boarding === true &&
      !feesData?.delete_fee_records?.some((del) =>
        del.feetype.some((df) => df.id === fee.id)
      )
  ) || [];

  // Get boarding fee history records with filters
  const getBoardingFeeHistory = () => {
    if (!feesData?.fees_records) return [];
    
    return feesData.fees_records.filter((fee) => {
      const feeNameRecord = feesData.fees_name_records?.find(
        (f) => f.id === fee.feetype_id
      );
      
      // Only boarding fees
      if (!feeNameRecord?.is_boarding) return false;
      
      // Status filter
      if (historyFilterType === 'due' && fee.status === 'PAID') return false;
      if (historyFilterType === 'paid' && fee.status !== 'PAID') return false;
      
      // Fee type filter
      if (historyFeeTypeFilter && fee.feetype_name !== historyFeeTypeFilter) return false;
      
      // Date filter
      if (historyDateFilterType && historyDateFilter.startDate && historyDateFilter.endDate) {
        const feeDate = new Date(fee.created_at || fee.updated_at);
        const startDate = new Date(historyDateFilter.startDate);
        const endDate = new Date(historyDateFilter.endDate);
        
        if (historyDateFilterType === 'month') {
          const feeMonth = feeDate.getMonth();
          const feeYear = feeDate.getFullYear();
          const startMonth = startDate.getMonth();
          const startYear = startDate.getFullYear();
          const endMonth = endDate.getMonth();
          const endYear = endDate.getFullYear();
          
          if (feeYear < startYear || feeYear > endYear) return false;
          if (feeYear === startYear && feeMonth < startMonth) return false;
          if (feeYear === endYear && feeMonth > endMonth) return false;
        } else {
          if (feeDate < startDate || feeDate > endDate) return false;
        }
      }
      
      return true;
    });
  };

  // Get unique fee types for filter dropdown
  const getUniqueFeeTypes = () => {
    if (!feesData?.fees_records) return [];
    
    const boardingFeeTypes = feesData.fees_records
      .filter((fee) => {
        const feeNameRecord = feesData.fees_name_records?.find(
          (f) => f.id === fee.feetype_id
        );
        return feeNameRecord?.is_boarding === true;
      })
      .map((fee) => fee.feetype_name)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return boardingFeeTypes;
  };

  // Generate PDF report for history
  const generateHistoryPDFReport = async () => {
    if (!hasViewPermission) {
      toast.error('বোর্ডিং ফি ইতিহাস প্রতিবেদন দেখার অনুমতি নেই।');
      return;
    }
    
    const filteredRecords = getBoardingFeeHistory();
    
    if (filteredRecords.length === 0) {
      toast.error('নির্বাচিত ফিল্টারে কোনো বোর্ডিং ফি রেকর্ড পাওয়া যায়নি।');
      return;
    }

    try {
      const doc = <PDFDocument
        feeRecords={filteredRecords}
        filterType={historyFilterType}
        feeTypeFilter={historyFeeTypeFilter}
        startDate={historyDateFilter.startDate}
        endDate={historyDateFilter.endDate}
        selectedStudent={selectedStudent}
        institute={institute}
      />;
      
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filterName = historyFilterType === 'due' ? 'বকেয়া' : historyFilterType === 'paid' ? 'পরিশোধিত' : 'সমস্ত';
      const feeTypeFilterName = historyFeeTypeFilter ? `_${historyFeeTypeFilter}` : '';
      const dateRange = historyDateFilterType && historyDateFilter.startDate && historyDateFilter.endDate 
        ? `_${historyDateFilter.startDate}_থেকে_${historyDateFilter.endDate}` 
        : '';
      
      link.download = `বোর্ডিং_ফি_ইতিহাস_${filterName}${feeTypeFilterName}_${selectedStudent?.name || 'সব_ছাত্র'}${dateRange}_${new Date().toLocaleDateString('bn-BD')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('বোর্ডিং ফি প্রতিবেদন সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
  };

  // Handle history date filter change
  const handleHistoryDateFilterChange = (e) => {
    const { name, value } = e.target;
    setHistoryDateFilter(prev => ({ ...prev, [name]: value }));
  };

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
    if (!hasChangePermission) {
      toast.error('পেমেন্ট ইনপুট পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    setPaymentInputs((prev) => ({ ...prev, [feeId]: value }));
  };

  // Handle discount input change
  const handleDiscountInput = (feeId, value, payableAfterWaiver) => {
    if (!hasChangePermission) {
      toast.error('ডিসকাউন্ট ইনপুট পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    const discount = parseFloat(value) || 0;
    if (discount > parseFloat(payableAfterWaiver)) {
      toast.error(`ডিসকাউন্ট পেয়েবল পরিমাণ (${payableAfterWaiver}) অতিক্রম করতে পারে না`);
      return;
    }
    setDiscountInputs((prev) => ({ ...prev, [feeId]: value }));
  };

  // Handle fee selection
  const handleFeeSelect = (feeId) => {
    if (!hasAddPermission && !hasChangePermission) { // Allow selection if either add or change
      toast.error('ফি নির্বাচন করার অনুমতি নেই।');
      return;
    }
    setSelectedFees((prev) =>
      prev.includes(feeId)
        ? prev.filter((id) => id !== feeId)
        : [...prev, feeId]
    );
  };

  // Handle Select All checkbox
  const handleSelectAll = () => {
    if (!hasAddPermission && !hasChangePermission) { // Allow select all if either add or change
      toast.error('সব ফি নির্বাচন করার অনুমতি নেই।');
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
    if (!hasAddPermission && !hasChangePermission) { // Allow submit if either add or change
      toast.error('ফি প্রক্রিয়া করার অনুমতি নেই।');
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
        if (!hasAddPermission && !hasChangePermission) { // Double check for security
          toast.error('ফি প্রক্রিয়া করার অনুমতি নেই।');
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
            if (!hasChangePermission) { toast.error('ফি আপডেট করার অনুমতি নেই।'); return Promise.reject("Permission denied"); }
            return updateFee({ id: existingFeeRecord.id, ...feeData }).unwrap();
          } else {
            if (!hasAddPermission) { toast.error('ফি তৈরি করার অনুমতি নেই।'); return Promise.reject("Permission denied"); }
            return createFee(feeData).unwrap();
          }
        });

        await Promise.all(promises);
        toast.success('বোর্ডিং ফি সফলভাবে প্রক্রিয়া করা হয়েছে!');
        setSelectedFees([]);
        setPaymentInputs({});
        setDiscountInputs({});
        setSelectAll(false); // Reset Select All after submission
        refetchFees();
      } else if (modalAction === 'update') {
        if (!hasChangePermission) { toast.error('বোর্ডিং ফি আপডেট করার অনুমতি নেই।'); return; }
        await updateFee(modalData).unwrap();
        toast.success('বোর্ডিং ফি সফলভাবে আপডেট করা হয়েছে!');
        refetchFees();
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) { toast.error('বোর্ডিং ফি মুছে ফেলার অনুমতি নেই।'); return; }
        await deleteFee(modalData.id).unwrap();
        toast.success('বোর্ডিং ফি সফলভাবে মুছে ফেলা হয়েছে!');
        refetchFees();
      }
    } catch (error) {
      console.error(`ত্রুটি ${modalAction === 'submit' ? 'প্রক্রিয়াকরণ' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'}:`, error);
      toast.error(`বোর্ডিং ফি ${modalAction === 'submit' ? 'প্রক্রিয়াকরণ' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'} ব্যর্থ: ${error.status || 'অজানা'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle fee update
  const handleUpdateFee = (feeId, updatedData) => {
    if (!hasChangePermission) {
      toast.error('বোর্ডিং ফি আপডেট করার অনুমতি নেই।');
      return;
    }
    setModalAction('update');
    setModalData({ id: feeId, ...updatedData });
    setIsModalOpen(true);
  };

  // Handle fee deletion
  const handleDeleteFee = (feeId) => {
    if (!hasDeletePermission) {
      toast.error('বোর্ডিং ফি মুছে ফেলার অনুমতি নেই।');
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

  const isLoadingData = studentLoading || feesDataLoading || academicYearsLoading || fundsLoading || waiversLoading || permissionsLoading;

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-4 p-6 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 animate-fadeIn">
          <FaSpinner className="animate-spin text-3xl text-[#DB9E30]" />
          <span className="text-lg font-medium text-[#441a05]">
            লোড হচ্ছে...
          </span>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="p-4 text-red-400 animate-fadeIn text-center text-lg font-semibold">
        এই পৃষ্ঠাটি দেখার অনুমতি নেই।
      </div>
    );
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
          .filter-button {
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            border: 1px solid #9d9087;
          }
          .filter-button-active {
            background-color: #DB9E30;
            color: #441a05;
            font-weight: bold;
            border-color: #DB9E30;
          }
          .filter-button-inactive {
            background-color: transparent;
            color: #441a05;
            border-color: #9d9087;
          }
          .filter-button-inactive:hover {
            background-color: rgba(219, 158, 48, 0.1);
            border-color: #DB9E30;
          }
          .date-filter-button {
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 0.875rem;
          }
          .date-filter-active {
            background-color: #441a05;
            color: white;
          }
          .date-filter-inactive {
            background-color: transparent;
            color: #441a05;
            border: 1px solid #9d9087;
          }
          .date-filter-inactive:hover {
            background-color: rgba(68, 26, 5, 0.1);
          }
          .report-button {
            background-color: #441a05;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            transition: background-color 0.3s;
            border: none;
            cursor: pointer;
          }
          .report-button:hover {
            background-color: #5a2e0a;
          }
          .report-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}
      </style>

      <div>
        {/* Student Search */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl mb-8 animate-fadeIn shadow-xl" ref={dropdownRef}>
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              বোর্ডিং ফি
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
                disabled={isCreating || isUpdating || !hasAddPermission} // Disable if no add permission
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
                isDisabled={isCreating || isUpdating || !hasAddPermission} // Disable if no add permission
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
                isDisabled={isCreating || isUpdating || !hasAddPermission} // Disable if no add permission
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

        {/* Boarding Fees Table */}
        {filteredFees.length > 0 && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6 mb-8">
            <h2 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">বোর্ডিং ফি</h2>
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
                      {(hasAddPermission || hasChangePermission) && ( // Only show select column if user has add/change permission
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              disabled={isCreating || isUpdating || filteredFees.every(fee => getFeeStatus(fee).status === 'PAID') || (!hasAddPermission && !hasChangePermission)} // Disable if no add/change permission
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
                      )}
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
                              disabled={status === 'PAID' || isCreating || isUpdating || !hasChangePermission} // Disable if no change permission
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
                              disabled={status === 'PAID' || isCreating || isUpdating || !hasAddPermission} // Disable if no add permission
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
                          {(hasAddPermission || hasChangePermission) && ( // Conditionally render checkbox
                            <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedFees.includes(fee.id)}
                                  onChange={() => handleFeeSelect(fee.id)}
                                  disabled={status === 'PAID' || isCreating || isUpdating || (!hasAddPermission && !hasChangePermission)} // Disable if no add/change permission
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
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {(hasAddPermission || hasChangePermission) && ( // Only show submit button if user has add/change permission
                <button
                  type="submit"
                  disabled={selectedFees.length === 0 || isCreating || isUpdating || (!hasAddPermission && !hasChangePermission)} // Disable if no add/change permission
                  className={`mt-4 relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${selectedFees.length === 0 || isCreating || isUpdating || (!hasAddPermission && !hasChangePermission) ? 'cursor-not-allowed' : 'hover:text-white hover:shadow-md'
                    }`}
                  aria-label="নির্বাচিত বোর্ডিং ফি জমা দিন"
                  title={selectedFees.some(feeId => feesData?.fees_records?.find((record) => record.feetype_id === feeId))
                    ? 'নির্বাচিত বোর্ডিং ফি আপডেট করুন / Update selected boarding fees'
                    : 'নির্বাচিত বোর্ডিং ফি জমা দিন / Submit selected boarding fees'}
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
                          ? 'নির্বাচিত বোর্ডিং ফি আপডেট করুন'
                          : 'নির্বাচিত বোর্ডিং ফি জমা দিন'}
                      </span>
                    </span>
                  )}
                </button>
              )}
            </form>
          </div>
        )}
        {filteredFees.length === 0 && selectedStudent && (
          <p className="text-[#441a05]/70 mb-8 animate-fadeIn">এই ছাত্রের জন্য কোনো বোর্ডিং ফি উপলব্ধ নেই।</p>
        )}

        {/* Boarding Fee History Table with Filters */}
        {getBoardingFeeHistory().length > 0 && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
            {/* Header with filters */}
            <div className="flex flex-col gap-4 p-4 border-b border-white/20">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-[#441a05]">বোর্ডিং ফি ইতিহাস</h2>
                
                {/* Main filter buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setHistoryFilterType('all')}
                    className={`filter-button ${historyFilterType === 'all' ? 'filter-button-active' : 'filter-button-inactive'}`}
                  >
                    সমস্ত
                  </button>
                  <button
                    onClick={() => setHistoryFilterType('due')}
                    className={`filter-button ${historyFilterType === 'due' ? 'filter-button-active' : 'filter-button-inactive'}`}
                  >
                    বকেয়া
                  </button>
                  <button
                    onClick={() => setHistoryFilterType('paid')}
                    className={`filter-button ${historyFilterType === 'paid' ? 'filter-button-active' : 'filter-button-inactive'}`}
                  >
                    পরিশোধিত
                  </button>
                </div>
              </div>

              {/* Secondary filters - only show if a status filter is active */}
              {historyFilterType !== 'all' && (
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  {/* Fee type filter */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-[#441a05]">ফি প্রকার:</label>
                    <select
                      value={historyFeeTypeFilter}
                      onChange={(e) => setHistoryFeeTypeFilter(e.target.value)}
                      className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg"
                    >
                      <option value="">সমস্ত ফি প্রকার</option>
                      {getUniqueFeeTypes().map((feeType) => (
                        <option key={feeType} value={feeType}>
                          {feeType}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date filter buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setHistoryDateFilterType(historyDateFilterType === 'date' ? '' : 'date')}
                      className={`date-filter-button ${historyDateFilterType === 'date' ? 'date-filter-active' : 'date-filter-inactive'}`}
                    >
                      তারিখ অনুযায়ী
                    </button>
                    <button
                      onClick={() => setHistoryDateFilterType(historyDateFilterType === 'month' ? '' : 'month')}
                      className={`date-filter-button ${historyDateFilterType === 'month' ? 'date-filter-active' : 'date-filter-inactive'}`}
                    >
                      মাস অনুযায়ী
                    </button>
                  </div>

                  {/* Date inputs and report button */}
                  {historyDateFilterType && (
                    <div className="flex gap-3 items-center">
                      <input
                        type={historyDateFilterType === 'month' ? 'month' : 'date'}
                        name="startDate"
                        value={historyDateFilter.startDate}
                        onChange={handleHistoryDateFilterChange}
                        className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg"
                        placeholder="শুরু"
                      />
                      <span className="text-[#441a05]">থেকে</span>
                      <input
                        type={historyDateFilterType === 'month' ? 'month' : 'date'}
                        name="endDate"
                        value={historyDateFilter.endDate}
                        onChange={handleHistoryDateFilterChange}
                        className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg"
                        placeholder="শেষ"
                      />
                      <button
                        onClick={generateHistoryPDFReport}
                        className="report-button"
                        disabled={!historyDateFilter.startDate || !historyDateFilter.endDate}
                        title="বোর্ডিং ফি প্রতিবেদন ডাউনলোড করুন"
                      >
                        রিপোর্ট
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Simple report button for non-date filters */}
              {historyFilterType !== 'all' && !historyDateFilterType && (
                <div className="flex justify-end">
                  <button
                    onClick={generateHistoryPDFReport}
                    className="report-button"
                    title="বোর্ডিং ফি প্রতিবেদন ডাউনলোড করুন"
                  >
                    রিপোর্ট
                  </button>
                </div>
              )}
            </div>

            {/* History Table */}
            {getBoardingFeeHistory().length === 0 ? (
              <p className="p-4 text-[#441a05]/70 text-center">
                {historyFilterType === 'all' 
                  ? 'এই ছাত্রের জন্য কোনো বোর্ডিং ফি ইতিহাস উপলব্ধ নেই।' 
                  : `${historyFilterType === 'due' ? 'বকেয়া' : 'পরিশোধিত'} বোর্ডিং ফি পাওয়া যায়নি।`
                }
              </p>
            ) : (
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
                        তৈরির তারিখ
                      </th>
                      {(hasChangePermission || hasDeletePermission) && ( // Conditionally render actions column
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          ক্রিয়াকলাপ
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {getBoardingFeeHistory().map((fee, index) => {
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                            {fee.created_at ? new Date(fee.created_at).toLocaleDateString('bn-BD') : 'অজানা'}
                          </td>
                          {(hasChangePermission || hasDeletePermission) && ( // Conditionally render action buttons
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {hasChangePermission && (
                                <button
                                  onClick={() =>
                                    handleUpdateFee(fee.id, {
                                      amount: fee.amount,
                                      discount_amount: fee.discount_amount,
                                      status: fee.status,
                                      waiver_amount: fee.waiver_amount || waiverAmount,
                                    })
                                  }
                                  title="বোর্ডিং ফি আপডেট করুন / Update boarding fee"
                                  className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                                >
                                  <FaEdit className="w-5 h-5" />
                                </button>
                              )}
                              {hasDeletePermission && (
                                <button
                                  onClick={() => handleDeleteFee(fee.id)}
                                  title="বোর্ডিং ফি মুছুন / Delete boarding fee"
                                  className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                                >
                                  <FaTrash className="w-5 h-5" />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Loading/Error states */}
            {(isDeleting || isUpdating) && (
              <div
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: '0.4s' }}
              >
                {isDeleting
                  ? 'বোর্ডিং ফি মুছে ফেলা হচ্ছে...'
                  : 'বোর্ডিং ফি আপডেট করা হচ্ছে...'}
              </div>
            )}
          </div>
        )}
        {getBoardingFeeHistory().length === 0 && selectedStudent && historyFilterType === 'all' && (
          <p className="text-[#441a05]/70 animate-fadeIn">এই ছাত্রের জন্য কোনো বোর্ডিং ফি ইতিহাস উপলব্ধ নেই।</p>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && (hasAddPermission || hasChangePermission || hasDeletePermission) && ( // Only show if user has relevant permissions
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'submit' && 'নির্বাচিত বোর্ডিং ফি নিশ্চিত করুন'}
                {modalAction === 'update' && 'বোর্ডিং ফি আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'বোর্ডিং ফি মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'submit' && 'আপনি কি নিশ্চিত যে নির্বাচিত বোর্ডিং ফি প্রক্রিয়া করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে বোর্ডিং ফি আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই বোর্ডিং ফি মুছে ফেলতে চান?'}
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

export default BoardingFees;