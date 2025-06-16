import React, { useState, useMemo } from 'react';

import { useGetPerformanceApiQuery } from '../../redux/features/api/performance/performanceApi';

import Select from 'react-select';
import { FaSpinner } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useGetRoleStaffProfileApiQuery } from '../../redux/features/api/roleStaffProfile/roleStaffProfileApi';
import { useCreateTeacherPerformanceApiMutation, useGetTeacherPerformanceApiQuery, useUpdateTeacherPerformanceApiMutation, } from '../../redux/features/api/performance/teacherPerformanceApi';

const TeacherPerformance = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // API হুক
  const { data: teachers = [], isLoading: isTeachersLoading, error: teachersError } = useGetRoleStaffProfileApiQuery();
  const { data: performanceMetrics = [], isLoading: isMetricsLoading, error: metricsError } = useGetPerformanceApiQuery();
  const { data: allPerformances = [], isLoading: isPerformanceLoading, error: performanceError } = useGetTeacherPerformanceApiQuery();
  const [createTeacherPerformance, { isLoading: isCreating }] = useCreateTeacherPerformanceApiMutation();
  const [patchTeacherPerformance, { isLoading: isUpdating }] = useUpdateTeacherPerformanceApiMutation();

  // নির্বাচিত শিক্ষকের জন্য কর্মক্ষমতা ফিল্টার
  const teacherPerformances = useMemo(() => {
    if (!selectedTeacher) return [];
    return allPerformances.filter((perf) => perf.teacher_id === selectedTeacher.value);
  }, [allPerformances, selectedTeacher]);

  // কর্মক্ষমতা ডেটা গণনা
  const performanceData = useMemo(() => {
    const map = {};
    if (performanceMetrics.length === 0 || !selectedTeacher) return map;

    performanceMetrics.forEach((metric) => {
      const perf = teacherPerformances.find((p) => p.performance_name_id === metric.id);
      map[metric.name] = perf ? perf.status : false;
    });

    return map;
  }, [teacherPerformances, performanceMetrics, selectedTeacher]);

  // রিঅ্যাক্ট সিলেক্টের জন্য শিক্ষক ডেটা রূপান্তর
  const teacherOptions = useMemo(() => teachers.map((teacher) => ({
    value: teacher.id,
    label: teacher.name,
  })), [teachers]);

  // শিক্ষক নির্বাচন হ্যান্ডলার
  const handleTeacherSelect = (selectedOption) => {
    setSelectedTeacher(selectedOption);
  };

  // চেকবক্স পরিবর্তন হ্যান্ডলার
  const handleCheckboxChange = async (metricName) => {
    const metricId = performanceMetrics.find((m) => m.name === metricName)?.id;
    if (!metricId || !selectedTeacher) {
      toast.error('শিক্ষক নির্বাচন করুন এবং মেট্রিক্স লোড হয়েছে তা নিশ্চিত করুন।');
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
      };

      if (existingPerf) {
        // বিদ্যমান কর্মক্ষমতা আপডেট (PATCH)
        await patchTeacherPerformance({ id: existingPerf.id, ...payload }).unwrap();
      } else {
        // নতুন কর্মক্ষমতা তৈরি (POST)
        await createTeacherPerformance(payload).unwrap();
      }

      toast.success('কর্মক্ষমতা সফলভাবে আপডেট হয়েছে!', { id: toastId });
    } catch (err) {
      toast.error(`ত্রুটি: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || err.message || {})}`, { id: toastId });
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      background: "transparent",
      borderColor: "#9d9087",
      color: "#fff",
      padding: "1px",
      borderRadius: "0.5rem",
      "&:hover": { borderColor: "#DB9E30" },
    }),
    singleValue: (provided) => ({ ...provided, color: "#441a05" }),
    multiValue: (provided) => ({
      ...provided,
      background: "#DB9E30",
      color: "#fff",
    }),
    multiValueLabel: (provided) => ({ ...provided, color: "#441a05" }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#441a05",
      "&:hover": { background: "#441a05", color: "#DB9E30" },
    }),
    menu: (provided) => ({
      ...provided,
      background: "#fff",
      color: "#441a05",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (provided, state) => ({
      ...provided,
      background: state.isSelected ? "#DB9E30" : "#fff",
      color: "#441a05",
      "&:hover": { background: "#DB9E30", color: "#441a05" },
    }),
  };

  // কর্মক্ষমতা টেবিল রেন্ডার
  const renderPerformanceTable = () => {
    if (!selectedTeacher) return <p className="p-4 text-[#441a05]/70 animate-fadeIn">শিক্ষক নির্বাচন করুন</p>;
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

    const rows = [];
    for (let i = 0; i < performanceMetrics.length; i += 10) {
      rows.push(performanceMetrics.slice(i, i + 10));
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/20">
          <tbody className="divide-y divide-white/20">
            {rows.map((rowMetrics, rowIndex) => (
              <tr key={rowIndex} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${rowIndex * 0.2}s` }}>
                {rowMetrics.map((metric) => (
                  <td key={metric.id} className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                    <div className="flex flex-col-reverse gap-3 items-center justify-center">
                      <label htmlFor={`checkbox-${metric.id}`} className="inline-flex items-center cursor-pointer">
                        <input
                          id={`checkbox-${metric.id}`}
                          type="checkbox"
                          checked={performanceData[metric.name] || false}
                          onChange={() => handleCheckboxChange(metric.name)}
                          className="hidden"
                          disabled={isCreating || isUpdating}
                        />
                        <span
                          className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${performanceData[metric.name]
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
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="py-8 w-full relative mx-auto">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.1)',
            color: '#441a05',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.5rem',
            backdropFilter: 'blur(4px)',
          },
          success: { style: { background: 'rgba(219, 158, 48, 0.1)', borderColor: '#DB9E30' } },
          error: { style: { background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' } },
        }}
      />
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

      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <h3 className="text-2xl font-bold text-[#441a05] tracking-tight mb-6">শিক্ষক কর্মক্ষমতা মূল্যায়ন</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <label className="flex items-center space-x-4 animate-fadeIn">
            <span className="text-[#441a05] font-medium text-nowrap">শিক্ষক খুঁজুন:</span>
            <div className="w-full">
              <Select
                options={teacherOptions}
                value={selectedTeacher}
                onChange={handleTeacherSelect}
                placeholder="শিক্ষকের নাম লিখুন"
                isLoading={isTeachersLoading}
                isDisabled={isTeachersLoading}
                styles={customStyles}
                className="animate-scaleIn"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isClearable
                isSearchable
              />
            </div>
          </label>
          {isTeachersLoading && (
            <div className="flex items-center space-x-2 text-[#441a05]/70 animate-fadeIn">
              <FaSpinner className="animate-spin text-lg" />
              <span>শিক্ষক লোড হচ্ছে...</span>
            </div>
          )}
          {teachersError && (
            <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              শিক্ষক ত্রুটি: {teachersError.status || 'অজানা'} - {JSON.stringify(teachersError.data || {})}
            </div>
          )}
        </div>
      </div>

      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">কর্মক্ষমতা মেট্রিক্স</h3>
        {renderPerformanceTable()}
      </div>

      {/* ভবিষ্যতের ডিলিট কনফার্ম মডালের টেমপ্লেট */}
      {/*
      <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-t-2xl w-full max-w-md animate-slideUp">
          <h3 className="text-lg font-semibold text-[#441a05] mb-4">মুছে ফেলার নিশ্চিতকরণ</h3>
          <p className="text-[#441a05]/70 mb-6">আপনি কি নিশ্চিতভাবে এই কর্মক্ষমতা মুছে ফেলতে চান?</p>
          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-2 bg-[#9d9087] text-[#441a05] rounded-md hover:bg-[#7d7067] transition-all duration-300"
              onClick={() => setShowModal(false)}
            >
              বাতিল
            </button>
            <button
              className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-md hover:bg-[#c48e2a] transition-all duration-300"
              onClick={handleDeleteConfirm}
            >
              মুছে ফেলুন
            </button>
          </div>
        </div>
      </div>
      */}
    </div>
  );
};

export default TeacherPerformance;

