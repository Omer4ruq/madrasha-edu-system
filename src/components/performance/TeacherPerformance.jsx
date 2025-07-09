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
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' },
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
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">কর্মক্ষমতা মেট্রিক্স</h3>
        {renderPerformanceTable()}
      </div>
    </div>
  );
};

export default TeacherPerformance;