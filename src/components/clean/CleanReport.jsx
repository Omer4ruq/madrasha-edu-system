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
  const generatePDFReport = () => {
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

    if (instituteLoading) {
      toast.error('ইনস্টিটিউট তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন!');
      return;
    }

    if (!institute) {
      toast.error('ইনস্টিটিউট তথ্য পাওয়া যায়নি!');
      return;
    }

    const totalReports = cleanReportTypes.length;
    const cleanCount = Object.values(cleanReportData).filter(Boolean).length;
    const averagePercentage = totalReports > 0 ? (cleanCount / totalReports) * 100 : 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>পরিচ্ছন্নতা মূল্যায়ন প্রতিবেদন</title>
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
          .title {
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

        <h1 class='title'>পরিচ্ছন্নতা মূল্যায়ন রিপোর্ট</h1>

        <div class="teacher-details">
          <p><strong>ক্লাস:</strong> ${selectedClass?.label || 'অজানা'}</p>
          <p><strong>তারিখ:</strong> ${selectedDate}</p>
          <p><strong>প্রতিবেদনের তারিখ:</strong> ${new Date().toLocaleDateString('bn')}</p>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ক্রমিক নং</th>
                <th>পরিচ্ছন্নতার ধরন</th>
                <th>অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              ${cleanReportTypes.map((type, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${type.name}</td>
                  <td class="${cleanReportData[type.id] ? 'check-mark' : 'cross-mark'}"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="summary">
          <p><strong>মোট ধরন:</strong> ${cleanReportTypes.length}</p>
          <p><strong>পরিষ্কার:</strong> ${cleanCount}</p>
          <p><strong>গড় (%):</strong> ${averagePercentage.toFixed(2)}%</p>
        </div>

        <div class="footer">
          <p>প্রধান শিক্ষকের স্বাক্ষর: ____________________</p>
          <p>মুফতির স্বাক্ষর: ____________________</p>
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
    toast.success('পরিচ্ছন্নতা রিপোর্ট তৈরি হয়েছে!');
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
                        className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${
                          cleanReportData[type.id]
                            ? 'bg-[#DB9E30] border-[#DB9E30]'
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
                  className="animate-scaleIn"
                  styles={selectStyles}
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