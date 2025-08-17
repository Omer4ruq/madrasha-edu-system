import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes, FaFileDownload, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DueFeeList = ({
  className = "",
  title = "বকেয়া ফি তালিকা"
}) => {
  // Fake data - replace with actual API calls when available
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fake institute data
  const institute = {
    institute_name: "আল-হেরা ইসলামিয়া মাদ্রাসা",
    institute_address: "ঢাকা-১২১৫, বাংলাদেশ",
    institute_email_address: "info@alhera.edu.bd",
    institute_mobile: "০১৭১২৩৪৫৬৭৮"
  };

  // Fake students data
  const allStudents = [
    { id: 1, name: "মোহাম্মদ রহিম উদ্দিন", roll_no: "001", father_name: "আব্দুল করিম", class: "অষ্টম শ্রেণী" },
    { id: 2, name: "ফাতিমা খাতুন", roll_no: "002", father_name: "মোহাম্মদ আলী", class: "সপ্তম শ্রেণী" },
    { id: 3, name: "আব্দুল্লাহ আল মামুন", roll_no: "003", father_name: "নুরুল ইসলাম", class: "নবম শ্রেণী" },
    { id: 4, name: "আয়েশা সিদ্দিকা", roll_no: "004", father_name: "আবু বকর", class: "ষষ্ঠ শ্রেণী" },
    { id: 5, name: "মোহাম্মদ হাসান", roll_no: "005", father_name: "ইমামুল হক", class: "দশম শ্রেণী" },
    { id: 6, name: "খাদিজা বেগম", roll_no: "006", father_name: "রশিদুল হাসান", class: "অষ্টম শ্রেণী" },
    { id: 7, name: "উমর ফারুক", roll_no: "007", father_name: "সালাহুদ্দিন", class: "সপ্তম শ্রেণী" },
    { id: 8, name: "জয়নব আক্তার", roll_no: "008", father_name: "মাহবুবুর রহমান", class: "নবম শ্রেণী" }
  ];

  // Fake fee types
  const allFeesNameRecords = [
    { id: 1, fees_title: "মাসিক বেতন", amount: "1500.00" },
    { id: 2, fees_title: "পরীক্ষার ফি", amount: "500.00" },
    { id: 3, fees_title: "ভর্তি ফি", amount: "2000.00" },
    { id: 4, fees_title: "বই ফি", amount: "800.00" },
    { id: 5, fees_title: "খেলার ফি", amount: "300.00" },
    { id: 6, fees_title: "কম্পিউটার ফি", amount: "600.00" }
  ];

  // Fake due fee records
  const dueFeeRecords = [
    {
      id: 1,
      student_id: 1,
      feetype_id: 1,
      original_amount: "1500.00",
      waiver_amount: "0.00",
      discount_amount: "0.00",
      paid_amount: "0.00",
      due_amount: "1500.00",
      status: "UNPAID",
      due_date: "2024-12-15",
      academic_year: "2024",
      created_at: "2024-11-01"
    },
    {
      id: 2,
      student_id: 1,
      feetype_id: 2,
      original_amount: "500.00",
      waiver_amount: "50.00",
      discount_amount: "0.00",
      paid_amount: "200.00",
      due_amount: "250.00",
      status: "PARTIAL",
      due_date: "2024-12-20",
      academic_year: "2024",
      created_at: "2024-11-05"
    },
    {
      id: 3,
      student_id: 2,
      feetype_id: 1,
      original_amount: "1500.00",
      waiver_amount: "150.00",
      discount_amount: "100.00",
      paid_amount: "0.00",
      due_amount: "1250.00",
      status: "UNPAID",
      due_date: "2024-12-15",
      academic_year: "2024",
      created_at: "2024-11-01"
    },
    {
      id: 4,
      student_id: 3,
      feetype_id: 3,
      original_amount: "2000.00",
      waiver_amount: "0.00",
      discount_amount: "200.00",
      paid_amount: "1000.00",
      due_amount: "800.00",
      status: "PARTIAL",
      due_date: "2024-12-25",
      academic_year: "2024",
      created_at: "2024-10-15"
    },
    {
      id: 5,
      student_id: 4,
      feetype_id: 4,
      original_amount: "800.00",
      waiver_amount: "80.00",
      discount_amount: "0.00",
      paid_amount: "0.00",
      due_amount: "720.00",
      status: "UNPAID",
      due_date: "2024-12-10",
      academic_year: "2024",
      created_at: "2024-11-10"
    },
    {
      id: 6,
      student_id: 5,
      feetype_id: 5,
      original_amount: "300.00",
      waiver_amount: "0.00",
      discount_amount: "0.00",
      paid_amount: "100.00",
      due_amount: "200.00",
      status: "PARTIAL",
      due_date: "2024-12-30",
      academic_year: "2024",
      created_at: "2024-11-15"
    },
    {
      id: 7,
      student_id: 6,
      feetype_id: 6,
      original_amount: "600.00",
      waiver_amount: "0.00",
      discount_amount: "50.00",
      paid_amount: "0.00",
      due_amount: "550.00",
      status: "UNPAID",
      due_date: "2024-12-18",
      academic_year: "2024",
      created_at: "2024-11-08"
    },
    {
      id: 8,
      student_id: 7,
      feetype_id: 1,
      original_amount: "1500.00",
      waiver_amount: "300.00",
      discount_amount: "0.00",
      paid_amount: "600.00",
      due_amount: "600.00",
      status: "PARTIAL",
      due_date: "2024-12-15",
      academic_year: "2024",
      created_at: "2024-11-01"
    },
    {
      id: 9,
      student_id: 8,
      feetype_id: 2,
      original_amount: "500.00",
      waiver_amount: "0.00",
      discount_amount: "0.00",
      paid_amount: "0.00",
      due_amount: "500.00",
      status: "UNPAID",
      due_date: "2024-12-20",
      academic_year: "2024",
      created_at: "2024-11-05"
    },
    {
      id: 10,
      student_id: 2,
      feetype_id: 4,
      original_amount: "800.00",
      waiver_amount: "80.00",
      discount_amount: "20.00",
      paid_amount: "300.00",
      due_amount: "400.00",
      status: "PARTIAL",
      due_date: "2024-12-12",
      academic_year: "2024",
      created_at: "2024-11-12"
    }
  ];

  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'unpaid', 'partial', 'overdue'
    feeType: 'all',
    student: 'all',
    dateType: '', // 'date', 'month'
    startDate: '',
    endDate: '',
    searchTerm: '',
    dueStatus: 'all' // 'all', 'overdue', 'upcoming'
  });

  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);

  // Get unique fee types for filter
  const feeTypes = [...new Set(allFeesNameRecords.map(fee => fee.fees_title))].sort();
  
  // Get students who have due fees for filter
  const studentsWithDueFees = allStudents.filter(student => 
    dueFeeRecords.some(record => record.student_id === student.id)
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Check if fee is overdue
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  // Filter records based on current filters
  useEffect(() => {
    let filtered = [...dueFeeRecords];

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'unpaid') {
        filtered = filtered.filter(record => record.status === 'UNPAID');
      } else if (filters.status === 'partial') {
        filtered = filtered.filter(record => record.status === 'PARTIAL');
      } else if (filters.status === 'overdue') {
        filtered = filtered.filter(record => isOverdue(record.due_date));
      }
    }

    // Due status filter
    if (filters.dueStatus !== 'all') {
      if (filters.dueStatus === 'overdue') {
        filtered = filtered.filter(record => isOverdue(record.due_date));
      } else if (filters.dueStatus === 'upcoming') {
        filtered = filtered.filter(record => !isOverdue(record.due_date));
      }
    }

    // Fee type filter
    if (filters.feeType !== 'all') {
      filtered = filtered.filter(record => {
        const feeNameRecord = allFeesNameRecords.find(f => f.id === record.feetype_id);
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
        const recordDate = new Date(record.due_date);
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
        const student = allStudents.find(s => s.id === record.student_id);
        const feeType = allFeesNameRecords.find(f => f.id === record.feetype_id);
        
        return (
          student?.name?.toLowerCase().includes(searchLower) ||
          student?.roll_no?.toLowerCase().includes(searchLower) ||
          feeType?.fees_title?.toLowerCase().includes(searchLower) ||
          record.due_amount?.toString().includes(searchLower)
        );
      });
    }

    // Sort by due date (earliest first for overdue, then by latest)
    filtered.sort((a, b) => {
      const aOverdue = isOverdue(a.due_date);
      const bOverdue = isOverdue(b.due_date);
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      return new Date(a.due_date) - new Date(b.due_date);
    });

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [filters]);

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
      searchTerm: '',
      dueStatus: 'all'
    });
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Generate report
  const generateReport = () => {
    if (filteredRecords.length === 0) {
      toast.error('নির্বাচিত ফিল্টারে কোনো রেকর্ড পাওয়া যায়নি।');
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
    const totalDueAmount = filteredRecords.reduce((sum, record) => sum + parseFloat(record.due_amount || 0), 0);
    const totalOriginalAmount = filteredRecords.reduce((sum, record) => sum + parseFloat(record.original_amount || 0), 0);
    const totalWaiver = filteredRecords.reduce((sum, record) => sum + parseFloat(record.waiver_amount || 0), 0);
    const totalDiscount = filteredRecords.reduce((sum, record) => sum + parseFloat(record.discount_amount || 0), 0);
    const overdueRecords = filteredRecords.filter(record => isOverdue(record.due_date)).length;

    const statusText = filters.status === 'unpaid' ? 'অপরিশোধিত ফি' : 
                     filters.status === 'partial' ? 'আংশিক পরিশোধিত ফি' : 
                     filters.status === 'overdue' ? 'বকেয়া পরিশোধ' :
                     'সমস্ত বকেয়া ফি';

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
          .overdue {
            background-color: #ffebee;
            color: #c62828;
          }
          .partial {
            background-color: #fff3e0;
            color: #ef6c00;
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
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .summary-item {
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
                <h1>${institute.institute_name}</h1>
                <p>${institute.institute_address}</p>
                <p>${institute.institute_email_address} | ${institute.institute_mobile}</p>
              </div>
              <h2 class="title">${title} - ${statusText}</h2>
              <div class="filter-info">
                <strong>ফিল্টার তথ্য:</strong>
                ${filters.feeType !== 'all' ? 'ফি প্রকার: ' + filters.feeType + ' | ' : ''}
                ${filters.student !== 'all' ? 'ছাত্র: ' + (allStudents.find(s => s.id === parseInt(filters.student))?.name || 'অজানা') + ' | ' : ''}
                ${filters.dueStatus !== 'all' ? 'বকেয়া স্থিতি: ' + (filters.dueStatus === 'overdue' ? 'বকেয়া' : 'আসন্ন') + ' | ' : ''}
                ${filters.dateType && filters.startDate && filters.endDate ? 
                  'তারিখ পরিসীমা: ' + new Date(filters.startDate).toLocaleDateString('bn-BD') + ' থেকে ' + new Date(filters.endDate).toLocaleDateString('bn-BD') + ' | ' : ''}
                ${filters.searchTerm ? 'অনুসন্ধান: ' + filters.searchTerm + ' | ' : ''}
                <strong>মোট রেকর্ড:</strong> ${filteredRecords.length}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 12%;">ছাত্রের নাম</th>
                  <th style="width: 6%;">রোল</th>
                  <th style="width: 12%;">ফি প্রকার</th>
                  <th style="width: 8%;">মূল পরিমাণ</th>
                  <th style="width: 8%;">ওয়েভার</th>
                  <th style="width: 8%;">ডিসকাউন্ট</th>
                  <th style="width: 8%;">প্রদান</th>
                  <th style="width: 8%;">বকেয়া</th>
                  <th style="width: 6%;">স্থিতি</th>
                  <th style="width: 10%;">নির্ধারিত তারিখ</th>
                  <th style="width: 8%;">দিন বাকি</th>
                </tr>
              </thead>
              <tbody>
                ${pageRecords.map((record, index) => {
                  const student = allStudents.find(s => s.id === record.student_id);
                  const feeType = allFeesNameRecords.find(f => f.id === record.feetype_id);
                  const dueDate = new Date(record.due_date);
                  const today = new Date();
                  const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                  const overdueStatus = daysDiff < 0;
                  const rowClass = overdueStatus ? 'overdue' : record.status === 'PARTIAL' ? 'partial' : '';
                  
                  return `
                    <tr class="${rowClass}" style="${index % 2 === 1 && !rowClass ? 'background-color: #f8f8f8;' : ''}">
                      <td style="text-align: left;">${student?.name || 'অজানা'}</td>
                      <td>${student?.roll_no || 'N/A'}</td>
                      <td style="text-align: left;">${feeType?.fees_title || 'অজানা'}</td>
                      <td>${record.original_amount}</td>
                      <td>${record.waiver_amount}</td>
                      <td>${record.discount_amount}</td>
                      <td>${record.paid_amount}</td>
                      <td style="font-weight: bold;">${record.due_amount}</td>
                      <td>${record.status === 'UNPAID' ? 'অপ্রদান' : 'আংশিক'}</td>
                      <td>${dueDate.toLocaleDateString('bn-BD')}</td>
                      <td style="font-weight: bold; color: ${overdueStatus ? '#c62828' : daysDiff <= 7 ? '#ef6c00' : '#2e7d32'};">
                        ${overdueStatus ? Math.abs(daysDiff) + ' দিন বকেয়া' : daysDiff + ' দিন বাকি'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            ${pageIndex === pages.length - 1 ? `
              <div class="summary-box">
                <div class="summary-title">সারসংক্ষেপ</div>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span>মোট মূল পরিমাণ:</span>
                    <span>${totalOriginalAmount.toFixed(2)} টাকা</span>
                  </div>
                  <div class="summary-item">
                    <span>মোট ওয়েভার:</span>
                    <span>${totalWaiver.toFixed(2)} টাকা</span>
                  </div>
                  <div class="summary-item">
                    <span>মোট ডিসকাউন্ট:</span>
                    <span>${totalDiscount.toFixed(2)} টাকা</span>
                  </div>
                  <div class="summary-item">
                    <span><strong>মোট বকেয়া পরিমাণ:</strong></span>
                    <span><strong>${totalDueAmount.toFixed(2)} টাকা</strong></span>
                  </div>
                  <div class="summary-item">
                    <span>মোট রেকর্ড:</span>
                    <span>${filteredRecords.length} টি</span>
                  </div>
                  <div class="summary-item">
                    <span style="color: #c62828;"><strong>বকেয়া রেকর্ড:</strong></span>
                    <span style="color: #c62828;"><strong>${overdueRecords} টি</strong></span>
                  </div>
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

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn ${className}`}>
        <div className="flex items-center justify-center p-8">
          <FaSpinner className="animate-spin text-2xl text-[#441a05] mr-3" />
          <span className="text-[#441a05]">বকেয়া ফি ডেটা লোড হচ্ছে...</span>
        </div>
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
          .overdue-row {
            background-color: rgba(244, 67, 54, 0.1);
          }
          .partial-row {
            background-color: rgba(255, 152, 0, 0.1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
        `}
      </style>

      {/* Header */}
      <div className="flex flex-col gap-4 p-6 border-b border-white/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-2xl text-red-500" />
            <h2 className="text-xl font-semibold text-[#441a05]">{title}</h2>
          </div>
          
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
            {/* Status Filters */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">পেমেন্ট স্থিতি</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'unpaid', 'partial'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange('status', status)}
                    className={`filter-button ${filters.status === status ? 'filter-button-active' : 'filter-button-inactive'}`}
                  >
                    {status === 'all' ? 'সমস্ত' : status === 'unpaid' ? 'অপ্রদান' : 'আংশিক'}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Status Filter */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">বকেয়া স্থিতি</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'overdue', 'upcoming'].map(dueStatus => (
                  <button
                    key={dueStatus}
                    onClick={() => handleFilterChange('dueStatus', dueStatus)}
                    className={`filter-button ${filters.dueStatus === dueStatus ? 'filter-button-active' : 'filter-button-inactive'}`}
                  >
                    {dueStatus === 'all' ? 'সমস্ত' : dueStatus === 'overdue' ? 'বকেয়া' : 'আসন্ন'}
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
                {studentsWithDueFees.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.roll_no ? `(${student.roll_no})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-[#441a05] mb-2">নির্ধারিত তারিখ ফিল্টার</label>
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
          মোট {filteredRecords.length} টি বকেয়া রেকর্ড পাওয়া গেছে
          {filteredRecords.length !== dueFeeRecords.length && (
            <span> (সর্বমোট {dueFeeRecords.length} টির মধ্যে)</span>
          )}
          {filteredRecords.filter(record => isOverdue(record.due_date)).length > 0 && (
            <span className="ml-2 text-red-600 font-medium">
              • {filteredRecords.filter(record => isOverdue(record.due_date)).length} টি বকেয়া
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      {currentRecords.length === 0 ? (
        <div className="p-8 text-center text-[#441a05]/70">
          {filteredRecords.length === 0 ? (
            filters.searchTerm || filters.status !== 'all' || filters.feeType !== 'all' || filters.student !== 'all' || filters.dateType || filters.dueStatus !== 'all' ? 
            'নির্বাচিত ফিল্টারে কোনো বকেয়া রেকর্ড পাওয়া যায়নি।' : 
            'কোনো বকেয়া ফি রেকর্ড পাওয়া যায়নি। 🎉'
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
                  মূল পরিমাণ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ওয়েভার
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ডিসকাউন্ট
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  প্রদান
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  বকেয়া পরিমাণ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  স্থিতি
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  নির্ধারিত তারিখ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  দিন বাকি/বকেয়া
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {currentRecords.map((record, index) => {
                const student = allStudents.find(s => s.id === record.student_id);
                const feeNameRecord = allFeesNameRecords.find(f => f.id === record.feetype_id);
                const dueDate = new Date(record.due_date);
                const today = new Date();
                const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                const overdueStatus = daysDiff < 0;
                
                let rowClass = "bg-white/5 hover:bg-white/10 transition-colors duration-200";
                if (overdueStatus) {
                  rowClass += " overdue-row";
                } else if (record.status === 'PARTIAL') {
                  rowClass += " partial-row";
                }

                return (
                  <tr
                    key={`${record.id}-${index}`}
                    className={`${rowClass} animate-fadeIn`}
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
                      {record.original_amount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {record.waiver_amount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {record.discount_amount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {record.paid_amount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-600">
                      {record.due_amount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'UNPAID'
                            ? 'text-red-800 bg-red-100/50'
                            : 'text-yellow-800 bg-yellow-100/50'
                        }`}
                      >
                        {record.status === 'UNPAID' ? 'অপ্রদান' : 'আংশিক'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#441a05]">
                      {dueDate.toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          overdueStatus
                            ? 'text-red-800 bg-red-100/50'
                            : daysDiff <= 7
                            ? 'text-orange-800 bg-orange-100/50'
                            : 'text-green-800 bg-green-100/50'
                        }`}
                      >
                        {overdueStatus 
                          ? `${Math.abs(daysDiff)} দিন বকেয়া` 
                          : `${daysDiff} দিন বাকি`
                        }
                      </span>
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="text-[#441a05]/70">মোট রেকর্ড</div>
              <div className="font-semibold text-[#441a05]">{filteredRecords.length} টি</div>
            </div>
            <div className="text-center">
              <div className="text-red-600/70">বকেয়া রেকর্ড</div>
              <div className="font-semibold text-red-600">
                {filteredRecords.filter(record => isOverdue(record.due_date)).length} টি
              </div>
            </div>
            <div className="text-center">
              <div className="text-[#441a05]/70">মোট বকেয়া</div>
              <div className="font-semibold text-red-600">
                {filteredRecords.reduce((sum, record) => sum + parseFloat(record.due_amount || 0), 0).toFixed(2)} টাকা
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

export default DueFeeList;