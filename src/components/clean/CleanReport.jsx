import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { FaSpinner, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import {
  useCreateCleanReportApiMutation,
  useGetCleanReportApiQuery,
  useUpdateCleanReportApiMutation,
  useDeleteCleanReportApiMutation,
} from '../../redux/features/api/clean/cleanReportApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetCleanReportTypeApiQuery } from '../../redux/features/api/clean/cleanReportTypeApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';
import { IoAddCircle } from 'react-icons/io5';
import selectStyles from '../../utilitis/selectStyles';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

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

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'NotoSansBengali',
    fontSize: 11,
    color: '#1A2A44',
    backgroundColor: '#FFFFFF',
    lineHeight: 1.5,
  },
  headerContainer: {
    backgroundColor: '#441a05',
    marginHorizontal: -40,
    marginTop: -40,
    paddingHorizontal: 40,
    paddingVertical: 20,
    marginBottom: 30,
    borderBottom: '5px solid #DB9E30',
  },
  header: {
    textAlign: 'center',
  },
  schoolName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20, // Prevent text cutoff
    wordWrap: 'break-word',
  },
  headerText: {
    fontSize: 10,
    color: '#E9ECEF',
    marginBottom: 6,
    fontWeight: 'normal',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DB9E30',
    textAlign: 'center',
    marginTop: 10,
    textTransform: 'uppercase',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    marginBottom: 25,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderLeft: '4px solid #DB9E30',
  },
  metaText: {
    color: '#495057',
    fontWeight: 'medium',
  },
  reportInfoCard: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    border: '1px solid #E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  reportInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#441a05',
    marginBottom: 12,
    textAlign: 'center',
    borderBottom: '1px solid #E9ECEF',
    paddingBottom: 8,
  },
  reportInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 5,
  },
  reportLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#495057',
    flex: 1,
  },
  reportValue: {
    fontSize: 10,
    color: '#212529',
    fontWeight: 'medium',
    flex: 1,
    textAlign: 'right',
  },
  table: {
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #DEE2E6',
    marginBottom: 25,
    breakInside: 'avoid', // Prevent table from splitting across pages
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E9ECEF',
  },
  tableHeader: {
    backgroundColor: '#441a05',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
    paddingVertical: 12,
    paddingHorizontal: 10,
    textAlign: 'center',
    borderRight: '1px solid rgba(255,255,255,0.2)',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 10,
    borderRight: '1px solid #E9ECEF',
    flex: 1,
    textAlign: 'left',
  },
  tableCellCenter: {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableRowAlternate: {
    backgroundColor: '#F8F9FA',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  statusIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusClean: {
    color: '#28A745',
  },
  statusDirty: {
    color: '#DC3545',
  },
  summarySection: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    border: '1px solid #E9ECEF',
    borderLeft: '5px solid #441a05',
    breakInside: 'avoid', // Prevent summary from splitting
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#441a05',
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    border: '1px solid #E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6C757D',
    marginBottom: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#441a05',
    textAlign: 'center',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 5,
    marginTop: 15,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28A745',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 10,
    color: '#495057',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#6C757D',
    paddingTop: 10,
    borderTop: '1px solid #E9ECEF',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 80,
    color: 'rgba(42, 63, 95, 0.05)',
    fontWeight: 'bold',
    zIndex: -1,
    textTransform: 'uppercase',
  },
});

// PDF Document Component
const PDFDocument = ({ cleanReportTypes, filteredReports, selectedClass, selectedDate, cleanReportData, institute }) => {
  const totalReports = cleanReportTypes.length;
  const cleanCount = filteredReports.filter(report => report.is_clean).length;
  const dirtyCount = totalReports - cleanCount;
  const cleanPercentage = totalReports > 0 ? ((cleanCount / totalReports) * 100).toFixed(1) : 0;

  // Format the selected date for display
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('bn-BD', options);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Watermark */}
        <Text style={styles.watermark}>{institute?.institute_name || 'আদর্শ বিদ্যালয়'}</Text>
        
        {/* Header Section */}
        <View style={styles.headerContainer} fixed>
          <View style={styles.header}>
            <Text style={styles.schoolName}>{institute?.institute_name || 'আদর্শ বিদ্যালয়'}</Text>
            <Text style={styles.headerText}>{institute?.institute_address || 'ঢাকা, বাংলাদেশ'}</Text>
            <Text style={styles.headerText}>
              {institute?.institute_email_address ? `ইমেইল: ${institute.institute_email_address}` : ''} 
              {institute?.headmaster_mobile ? ` | ফোন: ${institute.headmaster_mobile}` : ''}
            </Text>
            <Text style={styles.title}>পরিচ্ছন্নতা মূল্যায়ন প্রতিবেদন</Text>
          </View>
        </View>

        {/* Meta Information */}
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            প্রতিবেদনের তারিখ: {new Date().toLocaleDateString('bn-BD', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <Text style={styles.metaText}>
            সময়: {new Date().toLocaleTimeString('bn-BD', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            })}
          </Text>
        </View>

        {/* Report Information Card */}
        <View style={styles.reportInfoCard}>
          <Text style={styles.reportInfoTitle}>রিপোর্টের তথ্য</Text>
          <View style={styles.reportInfoRow}>
            <Text style={styles.reportLabel}>ক্লাস:</Text>
            <Text style={styles.reportValue}>{selectedClass?.label || 'অজানা'}</Text>
          </View>
          <View style={styles.reportInfoRow}>
            <Text style={styles.reportLabel}>তারিখ:</Text>
            <Text style={styles.reportValue}>{formatDate(selectedDate)}</Text>
          </View>
        </View>

        {/* Cleanliness Report Table */}
        <View style={styles.table} wrap={false}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, { flex: 3 }]}>পরিচ্ছন্নতার ধরন</Text>
            <Text style={[styles.tableHeader, { flex: 1 }]}>স্থিতি</Text>
            <Text style={[styles.tableHeader, { flex: 1 }]}>চিহ্ন</Text>
          </View>
          {cleanReportTypes.map((type, index) => {
            const isClean = cleanReportData[type.id] || false;
            return (
              <View key={type.id} style={[
                styles.tableRow, 
                index % 2 === 0 ? styles.tableRowEven : styles.tableRowAlternate
              ]}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{type.name}</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
                  {isClean ? 'পরিষ্কার' : 'অপরিষ্ক2ার'}
                </Text>
                <View style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
                  <Text style={[
                    styles.statusIcon,
                    isClean ? styles.statusClean : styles.statusDirty
                  ]}>
                    {isClean ? '✓' : 'X'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Cleanliness Summary */}
        <View style={styles.summarySection} wrap={false}>
          <Text style={styles.summaryTitle}>পরিচ্ছন্নতা সারাংশ</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>মোট পরিচ্ছন্নতার ধরন</Text>
              <Text style={styles.summaryValue}>{totalReports}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>পরিষ্কার</Text>
              <Text style={[styles.summaryValue, { color: '#28A745' }]}>{cleanCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>অপরিষ্কার</Text>
              <Text style={[styles.summaryValue, { color: '#DC3545' }]}>{dirtyCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>সাফল্যের হার</Text>
              <Text style={[styles.summaryValue, { color: '#441a05' }]}>{cleanPercentage}%</Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${cleanPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            অগ্রগতি: {cleanCount}/{totalReports} ({cleanPercentage}%)
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>এই প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে | {institute?.institute_name || 'আদর্শ বিদ্যালয়'} - পরিচ্ছন্নতা ব্যবস্থাপনা সিস্টেম</Text>
          <Text render={({ pageNumber, totalPages }) => `পৃষ্ঠা ${pageNumber} এর ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

const CleanReport = () => {
  // State for form inputs
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Get group_id from auth state
  const { group_id } = useSelector((state) => state.auth);

  // API Hooks
  const { data: cleanReports = [], isLoading: isReportsLoading, error: reportsError } =
    useGetCleanReportApiQuery();
  const { data: classConfigs = [], isLoading: isClassesLoading, error: classesError } =
    useGetclassConfigApiQuery();
  const { data: cleanReportTypes = [], isLoading: isTypesLoading, error: typesError } =
    useGetCleanReportTypeApiQuery();
  const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();
  const [createCleanReport, { isLoading: isCreating }] = useCreateCleanReportApiMutation();
  const [updateCleanReport, { isLoading: isUpdating }] = useUpdateCleanReportApiMutation();
  const [deleteCleanReport, { isLoading: isDeleting, error: deleteError }] = useDeleteCleanReportApiMutation();

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_clean_report') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_clean_report') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_clean_report') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_clean_report') || false;

  // Transform class config data for react-select
  const classOptions = useMemo(
    () =>
      classConfigs.map((cls) => ({
        value: cls.id,
        label: `${cls.class_name} - ${cls.section_name} (${cls.shift_name})`,
      })),
    [classConfigs]
  );

  // Filter clean reports for the selected class and date
  const filteredReports = useMemo(() => {
    if (!selectedClass || !selectedDate) return [];
    return cleanReports.filter(
      (report) => report.class_id === selectedClass.value && report.date_id === selectedDate
    );
  }, [cleanReports, selectedClass, selectedDate]);

  // Calculate clean report data
  const cleanReportData = useMemo(() => {
    const map = {};
    if (cleanReportTypes.length === 0 || !selectedClass || !selectedDate) return map;

    cleanReportTypes.forEach((type) => {
      const report = filteredReports.find((r) => r.Clean_report_type === type.id);
      map[type.id] = report ? report.is_clean : false;
    });

    return map;
  }, [filteredReports, cleanReportTypes, selectedClass, selectedDate]);

  // Handle class selection
  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);
  };

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Handle checkbox change
  const handleCheckboxChange = async (typeId) => {
    const actionPermission = cleanReportData[typeId] ? hasChangePermission : hasAddPermission;
    if (!actionPermission) {
      toast.error('আপনার এই কাজটি করার অনুমতি নেই।');
      return;
    }

    if (!selectedClass || !selectedDate) {
      toast.error('ক্লাস এবং তারিখ নির্বাচন করুন এবং রিপোর্টের ধরন লোড হয়েছে তা নিশ্চিত করুন।');
      return;
    }

    const currentStatus = cleanReportData[typeId];
    const newStatus = !currentStatus;
    const toastId = toast.loading('পরিচ্ছন্নতা রিপোর্ট আপডেট হচ্ছে...');

    try {
      const existingReport = filteredReports.find((r) => r.Clean_report_type === typeId);
      const payload = {
        date_id: selectedDate,
        is_clean: newStatus,
        Clean_report_type: typeId,
        class_id: selectedClass.value,
      };

      if (existingReport) {
        // Update existing report
        if (!hasChangePermission) {
          toast.error('আপডেট করার অনুমতি আপনার নেই।', { id: toastId });
          return;
        }
        await updateCleanReport({ id: existingReport.id, ...payload }).unwrap();
      } else {
        // Create new report
        if (!hasAddPermission) {
          toast.error('তৈরি করার অনুমতি আপনার নেই।', { id: toastId });
          return;
        }
        await createCleanReport(payload).unwrap();
      }

      toast.success('পরিচ্ছন্নতা রিপোর্ট সফলভাবে আপডেট হয়েছে!', { id: toastId });
    } catch (err) {
      toast.error(`ত্রুটি: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || err.message || {})}`, {
        id: toastId,
      });
    }
  };

  // Handle delete report
  const handleDelete = (reportId) => {
    if (!hasDeletePermission) {
      toast.error('মুছে ফেলার অনুমতি আপনার নেই।');
      return;
    }
    setModalAction('delete');
    setModalData({ id: reportId });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'delete') {
        if (!hasDeletePermission) {
          toast.error('মুছে ফেলার অনুমতি আপনার নেই।');
          return;
        }
        await deleteCleanReport(modalData.id).unwrap();
        toast.success('পরিচ্ছন্নতা রিপোর্ট সফলভাবে মুছে ফেলা হয়েছে!');
      }
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    } catch (err) {
      toast.error(`মুছে ফেলতে ত্রুটি: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || {})}`);
    }
  };

  // Generate PDF Report
  const generatePDFReport = async () => {
    if (!hasViewPermission) {
      toast.error('পরিচ্ছন্নতা প্রতিবেদন দেখার অনুমতি নেই।');
      return;
    }
    
    if (!selectedClass || !selectedDate) {
      toast.error('অনুগ্রহ করে ক্লাস এবং তারিখ নির্বাচন করুন।');
      return;
    }
    
    if (cleanReportTypes.length === 0) {
      toast.error('কোনো পরিচ্ছন্নতা রিপোর্টের ধরন পাওয়া যায়নি।');
      return;
    }

    try {
      const doc = <PDFDocument
        cleanReportTypes={cleanReportTypes}
        filteredReports={filteredReports}
        selectedClass={selectedClass}
        selectedDate={selectedDate}
        cleanReportData={cleanReportData}
        institute={institute}
      />;
      
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `পরিচ্ছন্নতা_রিপোর্ট_${selectedClass?.label || 'অজানা'}_${selectedDate}.pdf`;
      
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('প্রতিবেদন সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
  };

  // Permission-based Rendering
  if (permissionsLoading || instituteLoading) {
    return <div className="p-4 text-center">অনুমতি এবং প্রতিষ্ঠানের তথ্য লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-center text-red-500">এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।</div>;
  }

  if (instituteError) {
    return (
      <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
        প্রতিষ্ঠানের তথ্য ত্রুটি: {instituteError.status || 'অজানা'} - {JSON.stringify(instituteError.data || {})}
      </div>
    );
  }

  // Render clean report table
  const renderCleanReportTable = () => {
    if (!selectedClass || !selectedDate) {
      return <p className="p-4 text-[#441a05]/70 animate-fadeIn">ক্লাস এবং তারিখ নির্বাচন করুন</p>;
    }
    if (isTypesLoading || isReportsLoading) {
      return (
        <p className="p-4 text-[#441a05]/70 animate-fadeIn">
          <FaSpinner className="animate-spin text-lg mr-2" />
          পরিচ্ছন্নতা রিপোর্ট ডেটা লোড হচ্ছে...
        </p>
      );
    }
    if (typesError) {
      return (
        <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          রিপোর্টের ধরন ত্রুটি: {typesError.status || 'অজানা'} - {JSON.stringify(typesError.data || {})}
        </div>
      );
    }
    if (reportsError) {
      return (
        <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          রিপোর্ট ত্রুটি: {reportsError.status || 'অজানা'} - {JSON.stringify(reportsError.data || {})}
        </div>
      );
    }
    if (cleanReportTypes.length === 0) {
      return <p className="p-4 text-[#441a05]/70 animate-fadeIn">কোনো পরিচ্ছন্নতা রিপোর্টের ধরন নেই</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/20">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                চেকবক্স
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                পরিচ্ছন্নতা রিপোর্টের ধরন
              </th>
              {hasDeletePermission && (
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ক্রিয়াকলাপ
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {cleanReportTypes.map((type, index) => {
              const report = filteredReports.find((r) => r.Clean_report_type === type.id);
              return (
                <tr key={type.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                  <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                    <label htmlFor={`checkbox-${type.id}`} className="inline-flex items-center cursor-pointer">
                      <input
                        id={`checkbox-${type.id}`}
                        type="checkbox"
                        checked={cleanReportData[type.id] || false}
                        onChange={() => handleCheckboxChange(type.id)}
                        className="hidden"
                        disabled={isCreating || isUpdating || (!cleanReportData[type.id] ? !hasAddPermission : !hasChangePermission)}
                      />
                      <span
                        className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                          cleanReportData[type.id]
                            ? 'bg-[#DB9E30] border-[#DB9E30] tick-glow'
                            : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                        }`}
                      >
                        {cleanReportData[type.id] && (
                          <svg
                            className="w-4 h-4 text-[#441a05] animate-scaleIn"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{type.name}</td>
                  {hasDeletePermission && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {report && (
                        <button
                          onClick={() => handleDelete(report.id)}
                          title="পরিচ্ছন্নতা রিপোর্ট মুছুন"
                          className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                          disabled={isDeleting}
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
        {(isDeleting || deleteError) && (
          <div
            className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
            style={{ animationDelay: '0.4s' }}
          >
            {isDeleting
              ? 'পরিচ্ছন্নতা রিপোর্ট মুছে ফেলা হচ্ছে...'
              : `মুছে ফেলতে ত্রুটি: ${deleteError?.status || 'অজানা'} - ${JSON.stringify(deleteError?.data || {})}`}
          </div>
        )}
      </div>
    );
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
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
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
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.4);
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
          .report-button {
            background-color: #441a05;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }
          .report-button:hover {
            background-color: #3B567D;
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
          .report-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
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

      {(hasAddPermission || hasChangePermission) && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-2 mb-6">
            <IoAddCircle className="text-3xl text-[#441a05]" />
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">পরিচ্ছন্নতার রিপোর্ট</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-center space-x-4 animate-fadeIn">
              <span className="text-[#441a05] sm:text-base text-xs font-medium text-nowrap">তারিখ নির্বাচন করুন:</span>
              <div className="w-full">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  onClick={(e) => e.target.showPicker()}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-1.5 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  disabled={isCreating || isUpdating}
                  aria-label="তারিখ"
                  title="তারিখ নির্বাচন করুন / Select date"
                />
              </div>
            </label>
            <label className="flex items-center space-x-4 animate-fadeIn">
              <span className="text-[#441a05] sm:text-base text-xs font-medium text-nowrap">ক্লাস নির্বাচন করুন:</span>
              <div className="w-full">
                <Select
                  options={classOptions}
                  value={selectedClass}
                  onChange={handleClassSelect}
                  placeholder="ক্লাস নির্বাচন"
                  isLoading={isClassesLoading}
                  isDisabled={isClassesLoading || isCreating || isUpdating}
                  styles={selectStyles}
                  className="animate-scaleIn"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isClearable
                  isSearchable
                />
              </div>
            </label>
          </div>

          {/* PDF Report Button */}
          {selectedClass && selectedDate && (
            <div className="flex justify-end mt-6 animate-fadeIn">
              <button
                onClick={generatePDFReport}
                className="report-button btn-glow"
                disabled={!cleanReportTypes.length || isTypesLoading || isReportsLoading}
                title="পরিচ্ছন্নতা প্রতিবেদন ডাউনলোড করুন"
              >
                রিপোর্ট ডাউনলোড
              </button>
            </div>
          )}

          {isClassesLoading && (
            <div className="flex items-center space-x-2 text-[#441a05]/70 animate-fadeIn mt-4">
              <FaSpinner className="animate-spin text-lg" />
              <span>ক্লাস লোড হচ্ছে...</span>
            </div>
          )}
          {classesError && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              ক্লাস ত্রুটি: {classesError.status || 'অজানা'} - {JSON.stringify(classesError.data || {})}
            </div>
          )}
        </div>
      )}

      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05]">পরিচ্ছন্নতা রিপোর্টের ধরন</h3>
        </div>
        {renderCleanReportTable()}
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div
            className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border-t border-white/20 animate-slideUp"
          >
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              পরিচ্ছন্নতা রিপোর্ট মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই পরিচ্ছন্নতা রিপোর্টটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                title="বাতিল করুন"
              >
                বাতিল
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                title="নিশ্চিত করুন"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanReport;