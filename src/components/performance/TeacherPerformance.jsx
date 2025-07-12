import React, { useState, useMemo } from 'react';
import { useGetPerformanceApiQuery } from '../../redux/features/api/performance/performanceApi';
import Select from 'react-select';
import { FaSpinner } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useGetRoleStaffProfileApiQuery } from '../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useCreateTeacherPerformanceApiMutation, useGetTeacherPerformanceApiQuery, useUpdateTeacherPerformanceApiMutation } from '../../redux/features/api/performance/teacherPerformanceApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
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

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSansBengali',
    fontSize: 10,
    color: '#2c3e50',
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    backgroundColor: '#441a05',
    marginHorizontal: -30,
    marginTop: -30,
    paddingHorizontal: 30,
    paddingVertical: 25,
    marginBottom: 25,
  },
  header: {
    textAlign: 'center',
  },
  schoolName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerText: {
    fontSize: 12,
    color: '#f8f9fa',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DB9E30',
    textAlign: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DB9E30',
  },
  metaText: {
    color: '#6c757d',
  },
  performanceInfoCard: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  performanceInfoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#441a05',
    marginBottom: 10,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 5,
  },
  performanceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  performanceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#495057',
    flex: 1,
  },
  performanceValue: {
    fontSize: 10,
    color: '#212529',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  table: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#441a05',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
    paddingVertical: 12,
    paddingHorizontal: 8,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  tableCell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    flex: 1,
    textAlign: 'left',
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  tableCellCenter: {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableRowAlternate: {
    backgroundColor: '#f8f9fa',
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  statusIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusCompleted: {
    color: '#28a745',
  },
  statusPending: {
    color: '#dc3545',
  },
  statusText: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  summarySection: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderLeftWidth: 5,
    borderLeftColor: '#441a05',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#441a05',
    marginBottom: 15,
    textAlign: 'center',
    textDecoration: 'underline',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6c757d',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#441a05',
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginTop: 15,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 10,
    color: '#495057',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#6c757d',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: 'rgba(68, 26, 5, 0.05)',
    zIndex: -1,
  },
});

// PDF Document Component
const PDFDocument = ({ performanceData, performanceMetrics, selectedTeacher, selectedMonth, selectedAcademicYear }) => {
  const completedCount = Object.values(performanceData).filter(Boolean).length;
  const totalCount = performanceMetrics.length;
  const pendingCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>আদর্শ বিদ্যালয়</Text>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.schoolName}>আদর্শ বিদ্যালয়</Text>
            <Text style={styles.headerText}>ঢাকা, বাংলাদেশ</Text>
            <Text style={styles.headerText}>ফোন: ০১৭xxxxxxxx | ইমেইল: info@school.edu.bd</Text>
            <Text style={styles.title}>শিক্ষক কর্মক্ষমতা মূল্যায়ন প্রতিবেদন</Text>
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

        {/* Teacher Information Card */}
        <View style={styles.performanceInfoCard}>
          <Text style={styles.performanceInfoTitle}>শিক্ষকের তথ্য</Text>
          <View style={styles.performanceInfoRow}>
            <Text style={styles.performanceLabel}>শিক্ষকের নাম:</Text>
            <Text style={styles.performanceValue}>{selectedTeacher?.label || 'অজানা'}</Text>
          </View>
          <View style={styles.performanceInfoRow}>
            <Text style={styles.performanceLabel}>মূল্যায়নের মাস:</Text>
            <Text style={styles.performanceValue}>{selectedMonth?.label || 'অজানা'}</Text>
          </View>
          <View style={styles.performanceInfoRow}>
            <Text style={styles.performanceLabel}>শিক্ষাবর্ষ:</Text>
            <Text style={styles.performanceValue}>{selectedAcademicYear?.label || 'অজানা'}</Text>
          </View>
          <View style={styles.performanceInfoRow}>
            <Text style={styles.performanceLabel}>মূল্যায়নের তারিখ:</Text>
            <Text style={styles.performanceValue}>
              {new Date().toLocaleDateString('bn-BD', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        {/* Performance Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, { flex: 3 }]}>কর্মক্ষমতা মেট্রিক</Text>
            <Text style={[styles.tableHeader, { flex: 1 }]}>স্থিতি</Text>
            <Text style={[styles.tableHeader, { flex: 1 }]}>চিহ্ন</Text>
          </View>
          {performanceMetrics.map((metric, index) => (
            <View key={metric.id} style={[
              styles.tableRow, 
              index % 2 === 0 ? styles.tableRowEven : styles.tableRowAlternate
            ]}>
              <Text style={[styles.tableCell, { flex: 3 }]}>{metric.name}</Text>
              <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
                {performanceData[metric.name] ? 'সম্পন্ন' : 'অসম্পন্ন'}
              </Text>
              <View style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
                <Text style={[
                  styles.statusIcon,
                  performanceData[metric.name] ? styles.statusCompleted : styles.statusPending
                ]}>
                  {performanceData[metric.name] ? '+' : 'X'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Performance Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>কর্মক্ষমতা সারাংশ</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>মোট মেট্রিক্স</Text>
              <Text style={styles.summaryValue}>{totalCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>সম্পন্ন কাজ</Text>
              <Text style={[styles.summaryValue, { color: '#28a745' }]}>{completedCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>অসম্পন্ন কাজ</Text>
              <Text style={[styles.summaryValue, { color: '#dc3545' }]}>{pendingCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>সাফল্যের হার</Text>
              <Text style={[styles.summaryValue, { color: '#441a05' }]}>{completionPercentage}%</Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            অগ্রগতি: {completedCount}/{totalCount} ({completionPercentage}%)
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>এই প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে | আদর্শ বিদ্যালয় - শিক্ষক ব্যবস্থাপনা সিস্টেম</Text>
          <Text render={({ pageNumber, totalPages }) => `পৃষ্ঠা ${pageNumber} এর ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

const TeacherPerformance = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);

  // Get group_id from auth state
  const { group_id } = useSelector((state) => state.auth);

  // API Hooks
  const { data: teachers = [], isLoading: isTeachersLoading, error: teachersError } = useGetRoleStaffProfileApiQuery();
  const { data: performanceMetrics = [], isLoading: isMetricsLoading, error: metricsError } = useGetPerformanceApiQuery();
  const { data: allPerformances = [], isLoading: isPerformanceLoading, error: performanceError } = useGetTeacherPerformanceApiQuery();
  const { data: academicYears = [], isLoading: isAcademicYearsLoading, error: academicYearsError } = useGetAcademicYearApiQuery();
  const [createTeacherPerformance, { isLoading: isCreating }] = useCreateTeacherPerformanceApiMutation();
  const [patchTeacherPerformance, { isLoading: isUpdating }] = useUpdateTeacherPerformanceApiMutation();

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
   const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_teacher_performance') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_teacher_performance') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_teacher_performance') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_teacher_performance') || false;

  // Month options
  const monthOptions = [
    { value: 'January', label: 'জানুয়ারি' },
    { value: 'February', label: 'ফেব্রুয়ারি' },
    { value: 'March', label: 'মার্চ' },
    { value: 'April', label: 'এপ্রিল' },
    { value: 'May', label: 'মে' },
    { value: 'June', label: 'জুন' },
    { value: 'July', label: 'জুলাই' },
    { value: 'August', label: 'আগস্ট' },
    { value: 'September', label: 'সেপ্টেম্বর' },
    { value: 'October', label: 'অক্টোবর' },
    { value: 'November', label: 'নভেম্বর' },
    { value: 'December', label: 'ডিসেম্বর' },
  ];

  // Academic year options
  const academicYearOptions = useMemo(() => academicYears.map((year) => ({
    value: year.id,
    label: year.name,
  })), [academicYears]);

  // Filter performances for the selected teacher, month, and academic year
  const teacherPerformances = useMemo(() => {
    if (!selectedTeacher || !selectedMonth || !selectedAcademicYear) return [];
    return allPerformances.filter(
      (perf) =>
        perf.teacher_id === selectedTeacher.value &&
        perf.month === selectedMonth.value &&
        perf.academic_year === selectedAcademicYear.value
    );
  }, [allPerformances, selectedTeacher, selectedMonth, selectedAcademicYear]);

  // Calculate performance data
  const performanceData = useMemo(() => {
    const map = {};
    if (performanceMetrics.length === 0 || !selectedTeacher || !selectedMonth || !selectedAcademicYear) return map;

    performanceMetrics.forEach((metric) => {
      const perf = teacherPerformances.find((p) => p.performance_name_id === metric.id);
      map[metric.name] = perf ? perf.status : false;
    });

    return map;
  }, [teacherPerformances, performanceMetrics, selectedTeacher, selectedMonth, selectedAcademicYear]);

  // Transform teacher data for react-select
  const teacherOptions = useMemo(() => teachers.map((teacher) => ({
    value: teacher.id,
    label: teacher.name,
  })), [teachers]);

  // Handle selections
  const handleTeacherSelect = (selectedOption) => {
    setSelectedTeacher(selectedOption);
  };

  const handleMonthSelect = (selectedOption) => {
    setSelectedMonth(selectedOption);
  };

  const handleAcademicYearSelect = (selectedOption) => {
    setSelectedAcademicYear(selectedOption);
  };

  // Generate PDF report
  const generatePDFReport = async () => {
    if (!hasViewPermission) {
      toast.error('কর্মক্ষমতা প্রতিবেদন দেখার অনুমতি নেই।');
      return;
    }
    
    if (!selectedTeacher || !selectedMonth || !selectedAcademicYear) {
      toast.error('অনুগ্রহ করে শিক্ষক, মাস এবং শিক্ষাবর্ষ নির্বাচন করুন।');
      return;
    }
    
    if (performanceMetrics.length === 0) {
      toast.error('কোনো কর্মক্ষমতা মেট্রিক্স পাওয়া যায়নি।');
      return;
    }

    try {
      const doc = <PDFDocument
        performanceData={performanceData}
        performanceMetrics={performanceMetrics}
        selectedTeacher={selectedTeacher}
        selectedMonth={selectedMonth}
        selectedAcademicYear={selectedAcademicYear}
      />;
      
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `শিক্ষক_কর্মক্ষমতা_${selectedTeacher?.label || 'অজানা'}_${selectedMonth?.label || 'অজানা'}_${selectedAcademicYear?.label || 'অজানা'}_${new Date().toLocaleDateString('bn-BD')}.pdf`;
      
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('প্রতিবেদন সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = async (metricName) => {
    const actionPermission = performanceData[metricName] ? hasChangePermission : hasAddPermission;
    if (!actionPermission) {
      toast.error('আপনার এই কাজটি করার অনুমতি নেই।');
      return;
    }

    const metricId = performanceMetrics.find((m) => m.name === metricName)?.id;
    if (!metricId || !selectedTeacher || !selectedMonth || !selectedAcademicYear) {
      toast.error('শিক্ষক, মাস এবং শিক্ষাবর্ষ নির্বাচন করুন এবং মেট্রিক্স লোড হয়েছে তা নিশ্চিত করুন।');
      return;
    }

    const currentStatus = performanceData[metricName];
    const newStatus = !currentStatus;
    const toastId = toast.loading('কর্মক্ষমতা আপডেট হচ্ছে...');

    try {
      const existingPerf = teacherPerformances.find((p) => p.performance_name_id === metricId);
      const payload = {
        teacher_id: selectedTeacher.value,
        performance_name_id: metricId,
        status: newStatus,
        comment: existingPerf?.comment || 'ডিফল্ট মন্তব্য',
        month: selectedMonth.value,
        academic_year: selectedAcademicYear.value,
      };

      if (existingPerf) {
        // Update existing performance (PATCH)
        if (!hasChangePermission) {
          toast.error('আপডেট করার অনুমতি আপনার নেই।', { id: toastId });
          return;
        }
        await patchTeacherPerformance({ id: existingPerf.id, ...payload }).unwrap();
      } else {
        // Create new performance (POST)
        if (!hasAddPermission) {
          toast.error('তৈরি করার অনুমতি আপনার নেই।', { id: toastId });
          return;
        }
        await createTeacherPerformance(payload).unwrap();
      }

      toast.success('কর্মক্ষমতা সফলভাবে আপডেট হয়েছে!', { id: toastId });
    } catch (err) {
      toast.error(`ত্রুটি: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || err.message || {})}`, { id: toastId });
    }
  };

  // Permission-based Rendering
  if (permissionsLoading) {
    return <div className="p-4 text-center">অনুমতি লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-center text-red-500">এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।</div>;
  }

  // Render performance table
  const renderPerformanceTable = () => {
    if (!selectedTeacher || !selectedMonth || !selectedAcademicYear) return (
      <p className="p-4 text-[#441a05]/70 animate-fadeIn">
        শিক্ষক, মাস এবং শিক্ষাবর্ষ নির্বাচন করুন
      </p>
    );
    if (isMetricsLoading || isPerformanceLoading) return (
      <p className="p-4 text-[#441a05]/70 animate-fadeIn">
        <FaSpinner className="animate-spin text-lg mr-2" />
        কর্মক্ষমতা ডেটা লোড হচ্ছে...
      </p>
    );
    if (metricsError) return (
      <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        মেট্রিক্স ত্রুটি: {metricsError.status || 'অজানা'} - {JSON.stringify(metricsError.data || {})}
      </div>
    );
    if (performanceError) return (
      <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        কর্মক্ষমতা ত্রুটি: {performanceError.status || 'অজানা'} - {JSON.stringify(performanceError.data || {})}
      </div>
    );
    if (performanceMetrics.length === 0) return <p className="p-4 text-[#441a05]/70 animate-fadeIn">কোনো কর্মক্ষমতা মেট্রিক্স নেই</p>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/20">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">চেকবক্স</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">কর্মক্ষমতা মেট্রিক</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {performanceMetrics.map((metric, index) => (
              <tr key={metric.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                  <label htmlFor={`checkbox-${metric.id}`} className="inline-flex items-center cursor-pointer">
                    <input
                      id={`checkbox-${metric.id}`}
                      type="checkbox"
                      checked={performanceData[metric.name] || false}
                      onChange={() => handleCheckboxChange(metric.name)}
                      className="hidden"
                      disabled={isCreating || isUpdating || (!performanceData[metric.name] ? !hasAddPermission : !hasChangePermission)}
                    />
                    <span
                      className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${
                        performanceData[metric.name]
                          ? 'bg-[#DB9E30] border-[#DB9E30]'
                          : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                      }`}
                    >
                      {performanceData[metric.name] && (
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{metric.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="py-8 w-full relative mx-auto">
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
          }
          .tick-glow:checked + span {
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
            background-color: #5a2e0a;
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
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">শিক্ষক কর্মক্ষমতা মূল্যায়ন</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="flex items-center space-x-4 animate-fadeIn">
              <span className="text-[#441a05] sm:text-base text-xs font-medium text-nowrap">মাস নির্বাচন:</span>
              <div className="w-full">
                <Select
                  options={monthOptions}
                  value={selectedMonth}
                  onChange={handleMonthSelect}
                  placeholder="মাস নির্বাচন"
                  isLoading={false}
                  isDisabled={isCreating || isUpdating}
                  styles={selectStyles}
                  className="animate-scaleIn"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isClearable
                  isSearchable
                />
              </div>
            </label>
            <label className="flex items-center space-x-4 animate-fadeIn">
              <span className="text-[#441a05] sm:text-base text-xs font-medium text-nowrap">শিক্ষাবর্ষ নির্বাচন:</span>
              <div className="w-full">
                <Select
                  options={academicYearOptions}
                  value={selectedAcademicYear}
                  onChange={handleAcademicYearSelect}
                  placeholder="শিক্ষাবর্ষ নির্বাচন"
                  isLoading={isAcademicYearsLoading}
                  isDisabled={isAcademicYearsLoading || isCreating || isUpdating}
                  styles={selectStyles}
                  className="animate-scaleIn"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isClearable
                  isSearchable
                />
              </div>
            </label>
            <label className="flex items-center space-x-4 animate-fadeIn">
              <span className="text-[#441a05] sm:text-base text-xs font-medium text-nowrap">শিক্ষক খুঁজুন:</span>
              <div className="w-full">
                <Select
                  options={teacherOptions}
                  value={selectedTeacher}
                  onChange={handleTeacherSelect}
                  placeholder="শিক্ষকের নাম"
                  isLoading={isTeachersLoading}
                  isDisabled={isTeachersLoading || isCreating || isUpdating}
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
          
          {/* PDF Report Button - Show when all selections are made */}
          {selectedTeacher && selectedMonth && selectedAcademicYear && (
            <div className="flex justify-end mt-6 animate-fadeIn">
              <button
                onClick={generatePDFReport}
                className="report-button btn-glow"
                disabled={!performanceMetrics.length || isMetricsLoading || isPerformanceLoading}
                title="কর্মক্ষমতা প্রতিবেদন ডাউনলোড করুন"
              >
                কর্মক্ষমতা রিপোর্ট
              </button>
            </div>
          )}

          {isTeachersLoading && (
            <div className="flex items-center space-x-2 text-[#441a05]/70 animate-fadeIn mt-4">
              <FaSpinner className="animate-spin text-lg" />
              <span>শিক্ষক লোড হচ্ছে...</span>
            </div>
          )}
          {isAcademicYearsLoading && (
            <div className="flex items-center space-x-2 text-[#441a05]/70 animate-fadeIn mt-4">
              <FaSpinner className="animate-spin text-lg" />
              <span>শিক্ষাবর্ষ লোড হচ্ছে...</span>
            </div>
          )}
          {teachersError && (
            <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              শিক্ষক ত্রুটি: {teachersError.status || 'অজানা'} - {JSON.stringify(teachersError.data || {})}
            </div>
          )}
          {academicYearsError && (
            <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              শিক্ষাবর্ষ ত্রুটি: {academicYearsError.status || 'অজানা'} - {JSON.stringify(academicYearsError.data || {})}
            </div>
          )}
        </div>
      )}

      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05]">কর্মক্ষমতা মেট্রিক্স</h3>
          
          {/* Additional PDF Report Button in table header */}
          {selectedTeacher && selectedMonth && selectedAcademicYear && performanceMetrics.length > 0 && (
            <button
              onClick={generatePDFReport}
              className="report-button btn-glow"
              disabled={isMetricsLoading || isPerformanceLoading}
              title="কর্মক্ষমতা প্রতিবেদন ডাউনলোড করুন"
            >
              রিপোর্ট ডাউনলোড
            </button>
          )}
        </div>
        {renderPerformanceTable()}
      </div>
    </div>
  );
};

export default TeacherPerformance;