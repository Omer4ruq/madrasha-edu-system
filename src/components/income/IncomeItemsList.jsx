import React, { useState, useMemo, useEffect } from "react";
import { FaEdit, FaSpinner, FaTrash, FaCalendarAlt, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  useGetAllIncomeItemsQuery,
  useDeleteIncomeItemMutation,
} from "../../redux/features/api/income-items/incomeItemsApi";
import { useGetFundsQuery } from "../../redux/features/api/funds/fundsApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetIncomeHeadsQuery } from "../../redux/features/api/income-heads/incomeHeadsApi";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";
import { useSelector } from "react-redux";

const IncomeItemsList = ({ onEditClick, onDelete }) => {
  const { group_id } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [dateFilter, setDateFilter] = useState({ 
    start_date: "", 
    end_date: "", 
    fund_id: "", 
    incometype_id: "" 
  });

  // API Queries
  const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();
  const { data: incomeTypes = [], isLoading: isTypesLoading } = useGetIncomeHeadsQuery();
  const { data: fundTypes = [], isLoading: isFundLoading, error: fundError } = useGetFundsQuery();
  const { data: academicYears = [], isLoading: isYearsLoading } = useGetAcademicYearApiQuery();
  const {
    data: allIncomeData,
    isLoading: isAllItemsLoading,
    error: allItemsError,
  } = useGetAllIncomeItemsQuery();
  const [deleteIncomeItem, { isLoading: isDeleting, error: deleteError }] = useDeleteIncomeItemMutation();
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Bengali month and day names
  const bengaliMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  
  const bengaliDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
  const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  
  // Convert English numbers to Bengali
  const toBengaliNumber = (num) => {
    return num.toString().split('').map(digit => bengaliNumbers[parseInt(digit)]).join('');
  };

  // Check permissions
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_incomeitemlist') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_incomeitemlist') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_incomeitemlist') || false;

  // Filter items based on active tab and filter selections
  const filteredItems = useMemo(() => {
    return allIncomeData?.results?.filter((item) => {
      if (activeTab === "all") return true;
      if (activeTab === "incomeType" && dateFilter.incometype_id) {
        return item.incometype_id === parseInt(dateFilter.incometype_id);
      }
      if (activeTab === "fund" && dateFilter.fund_id) {
        return item.fund_id === parseInt(dateFilter.fund_id);
      }
      if (activeTab === "date" && dateFilter.start_date && dateFilter.end_date) {
        const itemDate = new Date(item.income_date);
        const startDate = new Date(dateFilter.start_date);
        const endDate = new Date(dateFilter.end_date);
        return itemDate >= startDate && itemDate <= endDate;
      }
      return true;
    }) || [];
  }, [allIncomeData, activeTab, dateFilter]);

  // Calculate total amount for filtered items
  const totalAmount = useMemo(() => {
    return filteredItems.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      return sum + amount;
    }, 0);
  }, [filteredItems]);

  // Convert English date to Bengali date display
  const convertToBengaliDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format number with Bengali locale
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle custom calendar date selection
  const handleCalendarDateSelect = (fieldName, dateValue) => {
    setDateFilter((prev) => ({
      ...prev,
      [fieldName]: dateValue,
    }));
  };

  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('আয় আইটেম মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setDeleteItemId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!hasDeletePermission) {
      toast.error('আয় আইটেম মুছে ফেলার অনুমতি নেই।');
      return;
    }
    const toastId = toast.loading("আয় আইটেম মুছে ফেলা হচ্ছে...");
    try {
      await deleteIncomeItem(deleteItemId).unwrap();
      toast.success("আয় আইটেম সফলভাবে মুছে ফেলা হয়েছে!", { id: toastId });
      setIsModalOpen(false);
      setDeleteItemId(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(`আয় আইটেম মুছতে ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`, { id: toastId });
      setIsModalOpen(false);
      setDeleteItemId(null);
    }
  };

  // Custom Bengali Calendar Component with slide animation
  const BengaliCalendar = ({ isOpen, onClose, onDateSelect, selectedDate, fieldName }) => {
    const [currentMonth, setCurrentMonth] = useState(() => {
      const date = selectedDate ? new Date(selectedDate) : new Date();
      return new Date(date.getFullYear(), date.getMonth(), 1);
    });

    if (!isOpen) return null;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarDays = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    const handleDateClick = (day) => {
      if (day) {
        const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onDateSelect(fieldName, selectedDateStr);
        onClose();
      }
    };

    const navigateMonth = (direction) => {
      setCurrentMonth(prev => {
        const newMonth = new Date(prev);
        newMonth.setMonth(prev.getMonth() + direction);
        return newMonth;
      });
    };

    const today = new Date();
    const isToday = (day) => {
      return day === today.getDate() && 
             month === today.getMonth() && 
             year === today.getFullYear();
    };

    const isSelected = (day) => {
      if (!selectedDate || !day) return false;
      const selected = new Date(selectedDate);
      return day === selected.getDate() && 
             month === selected.getMonth() && 
             year === selected.getFullYear();
    };

    const handleTodayClick = () => {
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      onDateSelect(fieldName, todayStr);
      onClose();
    };

    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-1">
        <div className="bg-white rounded-lg shadow-2xl border border-yellow-200 p-4 w-80 max-w-sm mx-auto animate-slideDown">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-yellow-100 rounded-lg transition-colors duration-200 text-amber-800"
            >
              <span className="text-xl font-bold">‹</span>
            </button>
            <h3 className="text-lg font-semibold text-amber-800 flex-1 text-center">
              {bengaliMonths[month]} {toBengaliNumber(year)}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-yellow-100 rounded-lg transition-colors duration-200 text-amber-800"
            >
              <span className="text-xl font-bold">›</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200 ml-2 text-red-500"
            >
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {bengaliDays.map((day, index) => (
              <div key={index} className="text-center text-sm font-medium text-amber-700 p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                disabled={!day}
                className={`
                  p-2 text-sm rounded-lg transition-all duration-200 min-h-[40px] flex items-center justify-center
                  ${!day ? 'invisible' : 'hover:bg-yellow-100 hover:scale-105'}
                  ${isToday(day) ? 'bg-yellow-500 text-white font-bold shadow-md' : ''}
                  ${isSelected(day) ? 'bg-amber-800 text-white ring-2 ring-yellow-300' : 'text-amber-800'}
                  ${day && !isToday(day) && !isSelected(day) ? 'hover:bg-yellow-50' : ''}
                  active:scale-95
                `}
              >
                {day ? toBengaliNumber(day) : ''}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={handleTodayClick}
              className="w-full py-2 px-4 bg-gradient-to-r from-amber-800 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              আজ ({toBengaliNumber(today.getDate())} {bengaliMonths[today.getMonth()]})
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    if (!hasViewPermission) {
      toast.error('আয় আইটেম প্রতিবেদন দেখার অনুমতি নেই।');
      return;
    }
    if (activeTab === "date" && (!dateFilter.start_date || !dateFilter.end_date)) {
      toast.error('অনুগ্রহ করে শুরু এবং শেষ তারিখ নির্বাচন করুন।');
      return;
    }
    if (activeTab === "incomeType" && !dateFilter.incometype_id) {
      toast.error('অনুগ্রহ করে আয়ের ধরন নির্বাচন করুন।');
      return;
    }
    if (activeTab === "fund" && !dateFilter.fund_id) {
      toast.error('অনুগ্রহ করে তহবিল নির্বাচন করুন।');
      return;
    }
    if (isAllItemsLoading || instituteLoading) {
      toast.error('তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।');
      return;
    }
    if (allItemsError) {
      toast.error(`তথ্য লোড করতে ত্রুটি: ${allItemsError.status || 'অজানা ত্রুটি'}`);
      return;
    }
    if (!filteredItems.length) {
      toast.error('নির্বাচিত ফিল্টারে কোনো আয় আইটেম পাওয়া যায়নি।');
      return;
    }
    if (!institute) {
      toast.error('ইনস্টিটিউট তথ্য পাওয়া যায়নি!');
      return;
    }

    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>আয় আইটেম প্রতিবেদন</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4 landscape; margin: 20mm; }
          body { font-family: 'Noto Sans Bengali', Arial, sans-serif; font-size: 12px; margin: 0; padding: 0; }
          .header { text-align: center; margin-bottom: 20px; }
          .total-section { background: #f0f0f0; padding: 15px; margin: 20px 0; border: 2px solid #DB9E30; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; }
          th { background-color: #f5f5f5; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${institute.institute_name || 'ইনস্টিটিউট'}</h1>
          <h2>আয় আইটেম প্রতিবেদন</h2>
        </div>
        <div class="total-section">
          <h3>মোট পরিমাণ: ${formatAmount(totalAmount)} টাকা</h3>
          <p>মোট আইটেম: ${filteredItems.length}টি</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>আয়ের ধরন</th>
              <th>নাম</th>
              <th>তহবিল</th>
              <th>তারিখ</th>
              <th>পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            ${filteredItems.map((item) => `
              <tr>
                <td>${incomeTypes.find((type) => type.id === item.incometype_id)?.incometype || 'অজানা'}</td>
                <td>${item.name || 'N/A'}</td>
                <td>${fundTypes.find((fund) => fund.id === item.fund_id)?.name || 'অজানা'}</td>
                <td>${item.income_date || 'N/A'}</td>
                <td>${formatAmount(parseFloat(item.amount) || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          window.print();
          window.onafterprint = () => window.close();
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('প্রতিবেদন সফলভাবে তৈরি হয়েছে!');
  };

  // Loading and permission checks
  if (permissionsLoading) {
    return <div className="p-4 text-amber-800 animate-pulse">লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-500">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="w-full relative">
      <style jsx>{`
        @keyframes slideDown {
          from { transform: translateY(-20px) scaleY(0.8); opacity: 0; }
          to { transform: translateY(0) scaleY(1); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .table-container {
          max-height: 60vh;
          overflow: auto;
        }
      `}</style>

      {/* Delete Modal */}
      {hasDeletePermission && isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-amber-800 mb-4">
              আয় আইটেম মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-gray-600 mb-6">
              আপনি কি নিশ্চিত যে এই আয় আইটেমটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <FaSpinner className="animate-spin" /> : "নিশ্চিত করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border-b border-amber-200 mb-6">
          <h3 className="text-lg font-semibold text-amber-800">আয় আইটেম তালিকা</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {["all", "incomeType", "fund", "date"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tab === "all" && "সকল"}
                  {tab === "incomeType" && "আয়ের ধরন"}
                  {tab === "fund" && "তহবিল"}
                  {tab === "date" && "তারিখ"}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {activeTab === "incomeType" && (
                <select
                  name="incometype_id"
                  value={dateFilter.incometype_id}
                  onChange={handleDateFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">আয়ের ধরন নির্বাচন করুন</option>
                  {incomeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.incometype}
                    </option>
                  ))}
                </select>
              )}

              {activeTab === "fund" && (
                <select
                  name="fund_id"
                  value={dateFilter.fund_id}
                  onChange={handleDateFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">তহবিল নির্বাচন করুন</option>
                  {fundTypes.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.name}
                    </option>
                  ))}
                </select>
              )}

              {activeTab === "date" && (
                <React.Fragment>
                  <div className="flex flex-col relative">
                    <div className="relative">
                      <input
                        type="text"
                        value={dateFilter.start_date ? convertToBengaliDate(dateFilter.start_date) : ''}
                        readOnly
                        onClick={() => {
                          setShowEndCalendar(false);
                          setShowStartCalendar(true);
                        }}
                        className="px-3 py-2 pr-10 border border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400 transition-colors"
                        placeholder="শুরুর তারিখ নির্বাচন করুন"
                      />
                      <FaCalendarAlt 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 cursor-pointer"
                        onClick={() => {
                          setShowEndCalendar(false);
                          setShowStartCalendar(true);
                        }}
                      />
                    </div>
                    
                    <BengaliCalendar
                      isOpen={showStartCalendar}
                      onClose={() => setShowStartCalendar(false)}
                      onDateSelect={handleCalendarDateSelect}
                      selectedDate={dateFilter.start_date}
                      fieldName="start_date"
                    />
                  </div>

                  <div className="flex flex-col relative">
                    <div className="relative">
                      <input
                        type="text"
                        value={dateFilter.end_date ? convertToBengaliDate(dateFilter.end_date) : ''}
                        readOnly
                        onClick={() => {
                          setShowStartCalendar(false);
                          setShowEndCalendar(true);
                        }}
                        className="px-3 py-2 pr-10 border border-gray-300 rounded-lg cursor-pointer hover:border-yellow-400 transition-colors"
                        placeholder="শেষের তারিখ নির্বাচন করুন"
                      />
                      <FaCalendarAlt 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 cursor-pointer"
                        onClick={() => {
                          setShowStartCalendar(false);
                          setShowEndCalendar(true);
                        }}
                      />
                    </div>

                    <BengaliCalendar
                      isOpen={showEndCalendar}
                      onClose={() => setShowEndCalendar(false)}
                      onDateSelect={handleCalendarDateSelect}
                      selectedDate={dateFilter.end_date}
                      fieldName="end_date"
                    />
                  </div>
                </React.Fragment>
              )}
            </div>

            <button
              onClick={generatePDFReport}
              className="px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              রিপোর্ট
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isAllItemsLoading || isTypesLoading || isFundLoading || isYearsLoading ? (
          <div className="flex items-center justify-center p-8">
            <FaSpinner className="animate-spin text-2xl mr-2 text-amber-600" />
            <p className="text-amber-800">লোড হচ্ছে...</p>
          </div>
        ) : allItemsError || fundError ? (
          <p className="p-4 text-red-500 bg-red-50 rounded-lg">
            ত্রুটি: {allItemsError?.status || fundError?.status || "অজানা"}
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="p-4 text-center text-gray-600">কোনো আয় আইটেম পাওয়া যায়নি।</p>
        ) : (
          <React.Fragment>
            {/* Total Summary Card */}
            <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-700 mb-1">মোট আর্থিক সংক্ষিপ্তসার</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-yellow-600">{formatAmount(totalAmount)}</span>
                    <span className="text-lg text-amber-700">টাকা</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="bg-white rounded-lg px-4 py-2 text-center min-w-[100px] shadow-sm">
                    <div className="text-amber-800 font-semibold">{filteredItems.length}</div>
                    <div className="text-amber-600 text-xs">মোট আইটেম</div>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 text-center min-w-[100px] shadow-sm">
                    <div className="text-amber-800 font-semibold">
                      {filteredItems.length > 0 ? formatAmount(totalAmount / filteredItems.length) : "০.০০"}
                    </div>
                    <div className="text-amber-600 text-xs">গড় পরিমাণ</div>
                  </div>
                  {activeTab !== "all" && (
                    <div className="bg-yellow-100 rounded-lg px-4 py-2 text-center min-w-[100px] shadow-sm">
                      <div className="text-amber-800 font-semibold text-xs">ফিল্টারকৃত</div>
                      <div className="text-amber-600 text-xs">
                        {activeTab === "date" && "তারিখ অনুযায়ী"}
                        {activeTab === "incomeType" && "আয়ের ধরন অনুযায়ী"}
                        {activeTab === "fund" && "তহবিল অনুযায়ী"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="table-container bg-white rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      আয়ের ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      তহবিল
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      লেনদেন নম্বর
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ইনভয়েস নম্বর
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      তারিখ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      পরিমাণ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      শিক্ষাবর্ষ
                    </th>
                    {(hasChangePermission || hasDeletePermission) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        অ্যাকশন
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {incomeTypes.find((type) => type.id === item.incometype_id)?.incometype || "অজানা"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fundTypes.find((fund) => fund.id === item.fund_id)?.name || item.fund_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.transaction_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.invoice_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span>{item.income_date}</span>
                          <span className="text-xs text-gray-500">
                            {convertToBengaliDate(item.income_date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                        {formatAmount(parseFloat(item.amount) || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {academicYears.find((year) => year.id === item.academic_year)?.name || item.academic_year}
                      </td>
                      {(hasChangePermission || hasDeletePermission) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {hasChangePermission && (
                              <button
                                onClick={() => onEditClick(item)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="সম্পাদনা"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                            )}
                            {hasDeletePermission && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="মুছুন"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </React.Fragment>
        )}

        {/* Delete Error Display */}
        {(isDeleting || deleteError) && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-700">
              {isDeleting ? "মুছছে..." : `ত্রুটি: ${deleteError?.status || "অজানা"}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeItemsList;