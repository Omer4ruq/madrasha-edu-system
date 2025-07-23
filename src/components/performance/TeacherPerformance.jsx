import React, { useState, useMemo, useRef } from 'react';
import { useGetPerformanceApiQuery } from '../../redux/features/api/performance/performanceApi';
import Select from 'react-select';
import { FaSpinner, FaPrint } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useGetRoleStaffProfileApiQuery } from '../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useCreateTeacherPerformanceApiMutation, useGetTeacherPerformanceApiQuery, useUpdateTeacherPerformanceApiMutation } from '../../redux/features/api/performance/teacherPerformanceApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { IoAddCircle } from 'react-icons/io5';
import selectStyles from '../../utilitis/selectStyles';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';

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
  const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();

  // Permission Logic
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_teacher_performance') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_teacher_performance') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_teacher_performance') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_teacher_performance') || false;

  // Academic year options
  const academicYearOptions = useMemo(() => academicYears.map((year) => ({
    value: year.id,
    label: year.name,
  })), [academicYears]);

  // Transform teacher data for react-select
  const teacherOptions = useMemo(() => teachers.map((teacher) => ({
    value: teacher.id,
    label: teacher.name,
  })), [teachers]);

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

  // Generate PDF Report (simplified Madrasa layout with check/cross)
  const generatePDFReport = () => {
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

    if (instituteLoading) {
      toast.error('ইনস্টিটিউট তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন!');
      return;
    }

    if (!institute) {
      toast.error('ইনস্টিটিউট তথ্য পাওয়া যায়নি!');
      return;
    }

    const totalMetrics = performanceMetrics.length;
    const completedMetrics = Object.values(performanceData).filter(Boolean).length;
    const averagePercentage = totalMetrics > 0 ? (completedMetrics / totalMetrics) * 100 : 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>শিক্ষক কর্মক্ষমতা প্রতিবেদন</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4 portrait; margin: 20mm; }
          body {
            font-family: 'Noto Sans Bengali', Arial, sans-serif;
            font-size: 12px;
            margin: 30px;
            padding: 0;
            color: #000;
          }
          .header {
            text-align: center;
            // margin-bottom: 20px;
            // border-bottom: 2px solid #DB9E30;
            // padding-bottom: 5px;
          }
          .header h1 {
            font-size: 24px;
            margin: 0;
            color: #000;
          }
          .header p {
            font-size: 14px;
            margin: 5px 0;
            color: #000;
          }
          .logo-placeholder {
            text-align: center;
            margin-bottom: 10px;
          }
          // .logo-placeholder::before {
          //   content: '[লোগো এখানে স্থাপন করুন]';
          //   font-style: italic;
          //   color: #666;
          // }
          .teacher-details {
               text-align: center;
            margin-bottom: 30px;
            font-weight: 600;
          }
          .teacher-details p {
            margin: 5px 0;

          }
          .table-container {
            width: 100%;
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            color: #000;
          }
          .check-mark::before { content: '✓'; color: green; font-weight: bold; }
          .cross-mark::before { content: '✗'; color: red; font-weight: bold; }
          .summary {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #000;
            background-color: #F8F9FA;
          }
          .summary p {
            margin: 5px 0;
            font-weight: 600;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          .footer p {
            margin: 5px 0;
          }
          // .stamp-placeholder::before {
          //   content: '[মোহর এখানে স্থাপন করুন]';
          //   font-style: italic;
          //   color: #666;
          // }
          .title{
               text-align: center;
               font-size: 20px;
               font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-placeholder"></div>
          <h1>${institute.institute_name || 'আদর্শ মাদ্রাসা'}</h1>
          <p>${institute.institute_address || 'ঢাকা, বাংলাদেশ'}</p>
        </div>

        <h1 class='title'>শিক্ষকের কর্মক্ষমতার রিপোর্ট</h1>

        <div class="teacher-details">
          <p><strong>শিক্ষকের নাম:</strong> ${selectedTeacher?.label || 'অজানা'}</p>
          <p><strong>পরিচয় নম্বর:</strong> ${selectedTeacher?.value || 'N/A'}</p>
          <p><strong>বিভাগ/বিষয়:</strong> ${selectedTeacher?.department || 'নির্দিষ্ট নয়'}</p>
          <p><strong>মূল্যায়নের মাস:</strong> ${selectedMonth?.label || 'অজানা'}</p>
          <p><strong>শিক্ষাবর্ষ:</strong> ${selectedAcademicYear?.label || 'অজানা'}</p>
          <p><strong>তারিখ:</strong> ${new Date().toLocaleDateString('bn')}</p>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ক্রমিক নং</th>
                <th>কর্মক্ষমতা বিষয়</th>
                <th>অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              ${performanceMetrics.map((metric, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${metric.name}</td>
                  <td class="${performanceData[metric.name] ? 'check-mark' : 'cross-mark'}"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="summary">
          <p><strong>মোট মেট্রিক্স:</strong> ${performanceMetrics.length}</p>
          <p><strong>সম্পন্ন মেট্রিক্স:</strong> ${completedMetrics}</p>
          <p><strong>গড় (%):</strong> ${averagePercentage.toFixed(2)}%</p>
        </div>

        <div class="footer">
          <p>প্রধান শিক্ষকের স্বাক্ষর: ____________________</p>
          <p>মুফতির স্বাক্ষর: ____________________</p>
          <p class="stamp-placeholder"></p>
          <p>তারিখ: ${new Date().toLocaleDateString('bn')}</p>
        </div>

        <script>
          let printAttempted = false;
          window.onbeforeprint = () => { printAttempted = true; };
          window.onafterprint = () => { window.close(); };
          window.addEventListener('beforeunload', (event) => {
            if (!printAttempted) { window.close(); }
          });
          window.print();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open(' ', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('PDF রিপোর্ট তৈরি হয়েছে!');
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
      <p className="p-4 text-[#441a05]/70 animate-fadeIn flex justify-center items-center h-full">
        শিক্ষক, মাস এবং শিক্ষাবর্ষ নির্বাচন করুন
      </p>
    );
    if (isMetricsLoading || isPerformanceLoading) return (
      <p className="p-4 text-[#441a05]/70 animate-fadeIn flex justify-center items-center h-full">
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
    if (performanceMetrics.length === 0) return <p className="p-4 text-[#441a05]/70 animate-fadeIn flex justify-center items-center h-full">কোনো কর্মক্ষমতা মেট্রিক্স নেই</p>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/20 !border-red-400">
          <thead className="">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]">চেকবক্স</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]">কর্মক্ষমতা মেট্রিক</th>
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
          @keyframes ripple {
            0% { transform: scale(0); opacity: 0.5; }
            100% { transform: scale(4); opacity: 0; }
          }
          @keyframes iconHover {
            to { transform: scale(1.1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
          .input-icon:hover svg {
            animation: iconHover 0.3s ease-out forwards;
          }
          .btn-ripple {
            position: relative;
            overflow: hidden;
          }
          .btn-ripple::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 5px;
            height: 5px;
            background: rgba(255, 255, 255, 0.5);
            opacity: 0;
            border-radius: 100%;
            transform: scale(1);
            transform-origin: 50% 50%;
            animation: none;
          }
          .btn-ripple:active::after {
            animation: ripple 0.6s ease-out;
          }
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(157, 144, 135, 0.5);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #441a05;
          }
          .table-container {
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          th, td {
            padding: 8px;
            // text-align: center;
          }
          th {
            font-weight: bold;
             text-align: center;
            color: #000;
            text-transform: uppercase;
          }
          td {
            color: #000;
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
          
          {/* Report Button */}
          {selectedTeacher && selectedMonth && selectedAcademicYear && (
            <div className="flex justify-end mt-6 animate-fadeIn">
              <button
                onClick={generatePDFReport}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 btn-ripple ${
                  isMetricsLoading || isPerformanceLoading || !performanceMetrics.length
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-[#DB9E30] text-[#441a05] hover:text-white btn-glow'
                }`}
                aria-label="PDF রিপোর্ট ডাউনলোড"
                title="PDF রিপোর্ট ডাউনলোড করুন"
              >
                <FaPrint className="text-lg" />
                <span>PDF রিপোর্ট</span>
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
        </div>
        {renderPerformanceTable()}
      </div>
    </div>
  );
};

export default TeacherPerformance;