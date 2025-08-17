import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes, FaFileDownload, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetFeesQuery } from '../../redux/features/api/fees/feesApi';
// import { useGetFeesNameQuery } from '../../redux/features/api/feesName/feesNameApi';
import { useGetWaiversQuery } from '../../redux/features/api/waivers/waiversApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { useGetFeesNamesQuery } from '../../redux/features/api/fees-name/feesName';

const PaidTable = ({
  className = "",
  title = "পেইড ফি রিপোর্ট"
}) => {
  const { group_id } = useSelector((state) => state.auth);

  // API Queries
  const { data: allStudents, isLoading: studentsLoading } = useGetStudentActiveApiQuery();
  const { data: allFeeRecords, isLoading: feesLoading } = useGetFeesQuery();
  const { data: allFeesNameRecords, isLoading: feesNameLoading } = useGetFeesNamesQuery();
  const { data: waivers, isLoading: waiversLoading } = useGetWaiversQuery();
  const { data: institute, isLoading: instituteLoading } = useGetInstituteLatestQuery();
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Check permissions
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_fees') || false;

  // Filter only paid/partial records
  const paidFeeRecords = allFeeRecords?.filter(record => 
    record.status === 'PAID' || record.status === 'PARTIAL'
  ) || [];

  // Calculate payable amount with waiver
  const calculatePayableAmount = (fee, waivers, studentId, academicYear) => {
    if (!fee || !waivers || !studentId || !academicYear) {
      return {
        waiverAmount: '0.00',
        payableAfterWaiver: parseFloat(fee?.amount || 0).toFixed(2)
      };
    }

    const feeHeadId = parseInt(fee.fee_head_id || fee.id);
    
    // Find waiver for this student and academic year
    const waiver = waivers?.find((w) => {
      const studentMatches = w.student_id === studentId;
      const academicYearMatches = String(w.academic_year) === String(academicYear);
      let feeTypeMatches = false;
      
      if (Array.isArray(w.fee_types)) {
        const feeTypesAsNumbers = w.fee_types.map(ft => parseInt(ft));
        feeTypeMatches = feeTypesAsNumbers.includes(feeHeadId);
      }
      
      return studentMatches && academicYearMatches && feeTypeMatches;
    });
    
    const waiverPercentage = waiver ? parseFloat(waiver.waiver_amount) / 100 : 0;
    const feeAmount = parseFloat(fee.amount) || 0;
    const waiverAmount = feeAmount * waiverPercentage;
    const payableAfterWaiver = feeAmount - waiverAmount;
    
    return {
      waiverAmount: waiverAmount.toFixed(2),
      payableAfterWaiver: payableAfterWaiver.toFixed(2)
    };
  };
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'paid', 'partial'
    feeType: 'all',
    student: 'all',
    dateType: '', // 'date', 'month'
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);

  // Loading state
  const isLoading = studentsLoading || feesLoading || feesNameLoading || waiversLoading || instituteLoading || permissionsLoading;

  // Get unique fee types for filter
  const feeTypes = [...new Set(allFeesNameRecords?.map(fee => fee.fees_title))].sort() || [];
  
  // Get students who have paid fees for filter
  const studentsWithPaidFees = (allStudents?.filter(student => 
    paidFeeRecords.some(record => record.student_id === student.id)
  ).sort((a, b) => a.name.localeCompare(b.name))) || [];

  // Filter records based on current filters
  useEffect(() => {
    let filtered = [...paidFeeRecords];

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'paid') {
        filtered = filtered.filter(record => record.status === 'PAID');
      } else if (filters.status === 'partial') {
        filtered = filtered.filter(record => record.status === 'PARTIAL');
      }
    }

    // Fee type filter
    if (filters.feeType !== 'all') {
      filtered = filtered.filter(record => {
        const feeNameRecord = allFeesNameRecords?.find(f => f.id === record.feetype_id);
        return feeNameRecord?.fees_title === filters.feeType;
      });
    }

    // Student filter
    if (filters.student !== 'all') {
      filtered = filtered.filter(record => record.student_id === parseInt(filters.student));
    }

    // Date filter
    if (filters.dateType && filters.startDate && filters.endDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.created_at || record.updated_at);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);

        if (filters.dateType === 'month') {
          const recordMonth = recordDate.getMonth();
          const recordYear = recordDate.getFullYear();
          const startMonth = startDate.getMonth();
          const startYear = startDate.getFullYear();
          const endMonth = endDate.getMonth();
          const endYear = endDate.getFullYear();

          if (recordYear < startYear || recordYear > endYear) return false;
          if (recordYear === startYear && recordMonth < startMonth) return false;
          if (recordYear === endYear && recordMonth > endMonth) return false;
          return true;
        } else {
          return recordDate >= startDate && recordDate <= endDate;
        }
      });
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(record => {
        const student = allStudents?.find(s => s.id === record.student_id);
        const feeType = allFeesNameRecords?.find(f => f.id === record.feetype_id);
        
        return (
          student?.name?.toLowerCase().includes(searchLower) ||
          student?.roll_no?.toLowerCase().includes(searchLower) ||
          feeType?.fees_title?.toLowerCase().includes(searchLower) ||
          record.amount?.toString().includes(searchLower)
        );
      });
    }

    // Sort by latest first
    filtered.sort((a, b) => new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at));

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [filters, paidFeeRecords, allStudents, allFeesNameRecords]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      feeType: 'all',
      student: 'all',
      dateType: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Generate report
  const generateReport = () => {
    if (!hasViewPermission) {
      toast.error('রিপোর্ট তৈরি করার অনুমতি নেই।');
      return;
    }

    if (filteredRecords.length === 0) {
      toast.error('নির্বাচিত ফিল্টারে কোনো রেকর্ড পাওয়া যায়নি।');
      return;
    }

    if (!institute) {
      toast.error('ইনস্টিটিউট তথ্য পাওয়া যায়নি!');
      return;
    }

    const printWindow = window.open('', '_blank');

    // Group records into pages
    const rowsPerPage = 25;
    const pages = [];
    for (let i = 0; i < filteredRecords.length; i += rowsPerPage) {
      pages.push(filteredRecords.slice(i, i + rowsPerPage));
    }

    // Calculate totals
    const totalAmount = filteredRecords.reduce((sum, record) => sum + parseFloat(record.amount || 0), 0);
    const totalWaiver = filteredRecords.reduce((sum, record) => sum + parseFloat(record.waiver_amount || 0), 0);
    const totalDiscount = filteredRecords.reduce((sum, record) => sum + parseFloat(record.discount_amount || 0), 0);

    const statusText = filters.status === 'paid' ? 'পরিশোধিত ফি' : 
                     filters.status === 'partial' ? 'আংশিক পরিশোধিত ফি' : 
                     'সমস্ত পেইড ফি';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 landscape; 
            margin: 15mm;
          }
          body { 
            font-family: 'Noto Sans Bengali', Arial, sans-serif;  
            font-size: 11px; 
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #000;
          }
          .page-container {
            width: 100%;
            min-height: 200mm;
            page-break-after: always;
          }
          .page-container:last-child {
            page-break-after: auto;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 9px; 
            margin-top: 10px;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 6px; 
            text-align: center; 
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
            color: #000;
          }
          td { 
            color: #000; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 15px; 
            padding-bottom: 10px;
            border-bottom: 2px solid #441a05;
          }
          .institute-info h1 {
            font-size: 20px;
            margin: 0;
            color: #441a05;
          }
          .institute-info p {
            font-size: 12px;
            margin: 3px 0;
            color: #666;
          }
          .title {
            font-size: 16px;
            color: #DB9E30;
            margin: 8px 0;
            font-weight: bold;
          }
          .filter-info {
            font-size: 10px;
            margin: 8px 0;
            color: #555;
            text-align: left;
          }
          .summary-box {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 10px;
            margin: 15px 0;
            border-radius: 5px;
          }
          .summary-title {
            font-weight: bold;
            color: #441a05;
            margin-bottom: 8px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          .footer {
            position: absolute;
            bottom: 15px;
            left: 40px;
            right: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #555;
            border-top: 1px solid #eee;
            padding-top: 5px;
          }
        </style>
      </head>
      <body>
        ${pages.map((pageRecords, pageIndex) => `
          <div class="page-container">
            <div class="header">
              <div class="institute-info">
                <h1>${institute.institute_name || 'অজানা ইনস্টিটিউট'}</h1>
                <p>${institute.institute_address || 'ঠিকানা উপলব্ধ নয়'}</p>
                <p>${institute.institute_email_address || ''} ${institute.institute_mobile ? '| ' + institute.institute_mobile : ''}</p>
              </div>
              <h2 class="title">${title} - ${statusText}</h2>
              <div class="filter-info">
                <strong>ফিল্টার তথ্য:</strong>
                ${filters.feeType !== 'all' ? 'ফি প্রকার: ' + filters.feeType + ' | ' : ''}
                ${filters.student !== 'all' ? 'ছাত্র: ' + (allStudents?.find(s => s.id === parseInt(filters.student))?.name || 'অজানা') + ' | ' : ''}
                ${filters.dateType && filters.startDate && filters.endDate ? 
                  'তারিখ পরিসীমা: ' + new Date(filters.startDate).toLocaleDateString('bn-BD') + ' থেকে ' + new Date(filters.endDate).toLocaleDateString('bn-BD') + ' | ' : ''}
                ${filters.searchTerm ? 'অনুসন্ধান: ' + filters.searchTerm + ' | ' : ''}
                <strong>মোট রেকর্ড:</strong> ${filteredRecords.length}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 15%;">ছাত্রের নাম</th>
                  <th style="width: 8%;">রোল নং</th>
                  <th style="width: 15%;">ফি প্রকার</th>
                  <th style="width: 10%;">মোট পরিমাণ</th>
                  <th style="width: 10%;">ওয়েভার</th>
                  <th style="width: 10%;">ডিসকাউন্ট</th>
                  <th style="width: 10%;">প্রদান পরিমাণ</th>
                  <th style="width: 8%;">স্থিতি</th>
                  <th style="width: 12%;">তারিখ</th>
                </tr>
              </thead>
              <tbody>
                ${pageRecords.map((record, index) => {
                  const student = allStudents?.find(s => s.id === record.student_id);
                  const feeType = allFeesNameRecords?.find(f => f.id === record.feetype_id);
                  return `
                    <tr style="${index % 2 === 1 ? 'background-color: #f8f8f8;' : ''}">
                      <td style="text-align: left;">${student?.name || 'অজানা'}</td>
                      <td>${student?.roll_no || 'N/A'}</td>
                      <td style="text-align: left;">${feeType?.fees_title || 'অজানা'}</td>
                      <td>${parseFloat(feeType?.amount || 0).toFixed(2)}</td>
                      <td>${record.waiver_amount || '0.00'}</td>
                      <td>${record.discount_amount || '0.00'}</td>
                      <td>${record.amount || '0.00'}</td>
                      <td>${record.status === 'PAID' ? 'প্রদান' : record.status === 'PARTIAL' ? 'আংশিক' : 'অপ্রদান'}</td>
                      <td>${record.created_at ? new Date(record.created_at).toLocaleDateString('bn-BD') : 'অজানা'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            ${pageIndex === pages.length - 1 ? `
              <div class="summary-box">
                <div class="summary-title">সারসংক্ষেপ</div>
                <div class="summary-row">
                  <span>মোট প্রদান পরিমাণ:</span>
                  <span>${totalAmount.toFixed(2)} টাকা</span>
                </div>
                <div class="summary-row">
                  <span>মোট ওয়েভার পরিমাণ:</span>
                  <span>${totalWaiver.toFixed(2)} টাকা</span>
                </div>
                <div class="summary-row">
                  <span>মোট ডিসকাউন্ট পরিমাণ:</span>
                  <span>${totalDiscount.toFixed(2)} টাকা</span>
                </div>
                <div class="summary-row">
                  <span><strong>মোট রেকর্ড সংখ্যা:</strong></span>
                  <span><strong>${filteredRecords.length} টি</strong></span>
                </div>
              </div>
            ` : ''}

            <div class="footer" fixed>
              <span>প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</span>
              <span>পৃষ্ঠা ${pageIndex + 1} এর ${pages.length} | তৈরির তারিখ: ${new Date().toLocaleDateString('bn-BD')} ${new Date().toLocaleTimeString('bn-BD')}</span>
            </div>
          </div>
        `).join('')}
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

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('রিপোর্ট সফলভাবে তৈরি হয়েছে!');
  };

  // Loading check
  if (isLoading) {
    return (
      <div className={`bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn ${className}`}>
        <div className="flex items-center justify-center p-8">
          <FaSpinner className="animate-spin text-2xl text-[#441a05] mr-3" />
          <span className="text-[#441a05]">ডেটা লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="p-4 text-red-400 animate-fadeIn">
        এই পৃষ্ঠাটি দেখার অনুমতি নেই।
      </div>
    );
  }

  return (
    <div className={`bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn ${className}`}>
      <style>
        {`
          .filter-button {
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
            border: 1px solid #9d9087;
            font-size: 0.875rem;
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
          .pagination-button {
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
            border: 1px solid #9d9087;
            background-color: transparent;
            color: #441a05;
          }
          .pagination-button:hover:not(:disabled) {
            background-color: rgba(219, 158, 48, 0.1);
            border-color: #DB9E30;
          }
          .pagination-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .pagination-button.active {
            background-color: #DB9E30;
            color: #441a05;
            font-weight: bold;
            border-color: #DB9E30;
          }
        `}
      </style>

      {/* Header */}
      <div className="flex flex-col gap-4 p-6 border-b border-white/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[#441a05]">{title}</h2>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`filter-button flex items-center gap-2 ${isFilterOpen ? 'filter-button-active' : 'filter-button-inactive'}`}
            >
              <FaFilter className="w-4 h-4" />
              ফিল্টার
            </button>
            <button
              onClick={generateReport}
              className="filter-button filter-button-inactive hover:filter-button-active flex items-center gap-2"
              title="রিপোর্ট প্রিন্ট করুন"
            >
              <FaFileDownload className="w-4 h-4" />
              রিপোর্ট
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#441a05]/50 w-4 h-4" />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            placeholder="নাম, রোল নং, ফি প্রকার অনুসন্ধান করুন..."
            className="w-full bg-transparent text-[#441a05] pl-10 pr-4 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#DB9E30] transition-all duration-300"
          />
        </div>

        {/* Filters */}
        {isFilterOpen && (
          <div className="bg-white/5 rounded-lg p-4 space-y-4 animate-fadeIn">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">স্থিতি</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'paid', 'partial'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange('status', status)}
                    className={`filter-button ${filters.status === status ? 'filter-button-active' : 'filter-button-inactive'}`}
                  >
                    {status === 'all' ? 'সমস্ত' : status === 'paid' ? 'প্রদান' : 'আংশিক'}
                  </button>
                ))}
              </div>
            </div>

            {/* Fee Type Filter */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">ফি প্রকার</label>
              <select
                value={filters.feeType}
                onChange={(e) => handleFilterChange('feeType', e.target.value)}
                className="w-full bg-transparent text-[#441a05] p-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#DB9E30]"
              >
                <option value="all">সমস্ত ফি প্রকার</option>
                {feeTypes.map(feeType => (
                  <option key={feeType} value={feeType}>{feeType}</option>
                ))}
              </select>
            </div>

            {/* Student Filter */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">ছাত্র</label>
              <select
                value={filters.student}
                onChange={(e) => handleFilterChange('student', e.target.value)}
                className="w-full bg-transparent text-[#441a05] p-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#DB9E30]"
              >
                <option value="all">সমস্ত ছাত্র</option>
                {studentsWithPaidFees.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.roll_no ? `(${student.roll_no})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">তারিখ ফিল্টার</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => handleFilterChange('dateType', filters.dateType === 'date' ? '' : 'date')}
                  className={`filter-button ${filters.dateType === 'date' ? 'filter-button-active' : 'filter-button-inactive'}`}
                >
                  তারিখ অনুযায়ী
                </button>
                <button
                  onClick={() => handleFilterChange('dateType', filters.dateType === 'month' ? '' : 'month')}
                  className={`filter-button ${filters.dateType === 'month' ? 'filter-button-active' : 'filter-button-inactive'}`}
                >
                  মাস অনুযায়ী
                </button>
              </div>
              
              {filters.dateType && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type={filters.dateType === 'month' ? 'month' : 'date'}
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="bg-transparent text-[#441a05] p-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#DB9E30]"
                    placeholder="শুরু"
                  />
                  <input
                    type={filters.dateType === 'month' ? 'month' : 'date'}
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="bg-transparent text-[#441a05] p-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#DB9E30]"
                    placeholder="শেষ"
                  />
                </div>
              )}
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="filter-button filter-button-inactive hover:filter-button-active flex items-center gap-2"
              >
                <FaTimes className="w-4 h-4" />
                ফিল্টার পরিষ্কার করুন
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-[#441a05]/70">
          মোট {filteredRecords.length} টি রেকর্ড পাওয়া গেছে
          {filteredRecords.length !== paidFeeRecords.length && (
            <span> (সর্বমোট {paidFeeRecords.length} টির মধ্যে)</span>
          )}
        </div>
      </div>

      {/* Table */}
      {currentRecords.length === 0 ? (
        <div className="p-8 text-center text-[#441a05]/70">
          {filteredRecords.length === 0 ? (
            filters.searchTerm || filters.status !== 'all' || filters.feeType !== 'all' || filters.student !== 'all' || filters.dateType ? 
            'নির্বাচিত ফিল্টারে কোনো রেকর্ড পাওয়া যায়নি।' : 
            'কোনো পেইড ফি রেকর্ড পাওয়া যায়নি।'
          ) : (
            'এই পৃষ্ঠায় কোনো রেকর্ড নেই।'
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ছাত্রের নাম
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  রোল নং
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ফি প্রকার
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  মোট পরিমাণ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ওয়েভার পরিমাণ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ডিসকাউন্ট পরিমাণ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  প্রদান পরিমাণ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  স্থিতি
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  তারিখ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {currentRecords.map((record, index) => {
                const student = allStudents?.find(s => s.id === record.student_id);
                const feeNameRecord = allFeesNameRecords?.find(f => f.id === record.feetype_id);
                const originalAmount = feeNameRecord ? parseFloat(feeNameRecord.amount || 0) : 0;

                return (
                  <tr
                    key={`${record.id}-${index}`}
                    className="bg-white/5 hover:bg-white/10 transition-colors duration-200 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {student?.name || 'অজানা ছাত্র'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#441a05]">
                      {student?.roll_no || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {feeNameRecord?.fees_title || 'অজানা ফি'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {originalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {record.waiver_amount || '0.00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {record.discount_amount || '0.00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {record.amount || '0.00'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'PAID'
                            ? 'text-[#441a05] bg-[#DB9E30]'
                            : record.status === 'PARTIAL'
                            ? 'text-yellow-800 bg-yellow-100/50'
                            : 'text-red-800 bg-red-100/50'
                        }`}
                      >
                        {record.status === 'PAID' ? 'প্রদান' : record.status === 'PARTIAL' ? 'আংশিক' : 'অপ্রদান'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#441a05]">
                      {record.created_at ? new Date(record.created_at).toLocaleDateString('bn-BD') : 'অজানা'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/20">
          <div className="flex items-center space-x-2 text-sm text-[#441a05]/70">
            <span>
              পৃষ্ঠা {currentPage} এর {totalPages} 
              ({indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredRecords.length)} এর {filteredRecords.length})
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              পূর্ববর্তী
            </button>
            
            {/* Page numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              পরবর্তী
            </button>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {filteredRecords.length > 0 && (
        <div className="bg-white/5 px-6 py-4 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-[#441a05]/70">মোট রেকর্ড</div>
              <div className="font-semibold text-[#441a05]">{filteredRecords.length} টি</div>
            </div>
            <div className="text-center">
              <div className="text-[#441a05]/70">মোট প্রদান</div>
              <div className="font-semibold text-[#441a05]">
                {filteredRecords.reduce((sum, record) => sum + parseFloat(record.amount || 0), 0).toFixed(2)} টাকা
              </div>
            </div>
            <div className="text-center">
              <div className="text-[#441a05]/70">মোট ওয়েভার</div>
              <div className="font-semibold text-[#441a05]">
                {filteredRecords.reduce((sum, record) => sum + parseFloat(record.waiver_amount || 0), 0).toFixed(2)} টাকা
              </div>
            </div>
            <div className="text-center">
              <div className="text-[#441a05]/70">মোট ডিসকাউন্ট</div>
              <div className="font-semibold text-[#441a05]">
                {filteredRecords.reduce((sum, record) => sum + parseFloat(record.discount_amount || 0), 0).toFixed(2)} টাকা
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaidTable;