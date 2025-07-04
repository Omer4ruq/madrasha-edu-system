import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useCreateCleanReportApiMutation, useGetCleanReportApiQuery, useUpdateCleanReportApiMutation } from '../../redux/features/api/clean/cleanReportApi';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetCleanReportTypeApiQuery } from '../../redux/features/api/clean/cleanReportTypeApi';
import { IoAddCircle } from 'react-icons/io5';
import selectStyles from '../../utilitis/selectStyles';

const CleanReport = () => {
  // State for form inputs
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // API Hooks
  const { data: cleanReports = [], isLoading: isReportsLoading, error: reportsError } =
    useGetCleanReportApiQuery();
  const { data: classConfigs = [], isLoading: isClassesLoading, error: classesError } =
    useGetclassConfigApiQuery();
  const { data: cleanReportTypes = [], isLoading: isTypesLoading, error: typesError } =
    useGetCleanReportTypeApiQuery();
  const [createCleanReport, { isLoading: isCreating }] = useCreateCleanReportApiMutation();
  const [updateCleanReport, { isLoading: isUpdating }] = useUpdateCleanReportApiMutation();

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
      map[type.name] = report ? report.is_clean : false;
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
  const handleCheckboxChange = async (typeName) => {
    const typeId = cleanReportTypes.find((t) => t.name === typeName)?.id;
    if (!typeId || !selectedClass || !selectedDate) {
      toast.error('ক্লাস এবং তারিখ নির্বাচন করুন এবং রিপোর্টের ধরন লোড হয়েছে তা নিশ্চিত করুন।');
      return;
    }

    const currentStatus = cleanReportData[typeName];
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
        await updateCleanReport({ id: existingReport.id, ...payload }).unwrap();
      } else {
        // Create new report
        await createCleanReport(payload).unwrap();
      }

      toast.success('পরিচ্ছন্নতা রিপোর্ট সফলভাবে আপডেট হয়েছে!', { id: toastId });
    } catch (err) {
      toast.error(`ত্রুটি: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || err.message || {})}`, {
        id: toastId,
      });
    }
  };


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
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {cleanReportTypes.map((type, index) => (
              <tr key={type.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                <td className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                  <label htmlFor={`checkbox-${type.id}`} className="inline-flex items-center cursor-pointer">
                    <input
                      id={`checkbox-${type.id}`}
                      type="checkbox"
                      checked={cleanReportData[type.name] || false}
                      onChange={() => handleCheckboxChange(type.name)}
                      className="hidden"
                      disabled={isCreating || isUpdating}
                    />
                    <span
                      className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${
                        cleanReportData[type.name]
                          ? 'bg-[#DB9E30] border-[#DB9E30] tick-glow'
                          : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                      }`}
                    >
                      {cleanReportData[type.name] && (
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
              </tr>
            ))}
          </tbody>
        </table>
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
        <div className="flex items-center space-x-2 mb-6">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">পরিচ্ছন্নতার রিপোর্ট</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-center space-x-4 animate-fadeIn">
            <span className="text-[#441a05] font-medium text-nowrap">তারিখ নির্বাচন করুন:</span>
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
            <span className="text-[#441a05] font-medium text-nowrap">ক্লাস নির্বাচন করুন:</span>
            <div className="w-full">
              <Select
                options={classOptions}
                value={selectedClass}
                onChange={handleClassSelect}
                placeholder="ক্লাস নির্বাচন করুন"
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

      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
          পরিচ্ছন্নতা রিপোর্টের ধরন
        </h3>
        {renderCleanReportTable()}
      </div>
    </div>
  );
};

export default CleanReport;