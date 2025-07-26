import React, { useState } from 'react';
import { FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CurrentFeeHistoryTable = ({
  feeRecords = [],
  feesNameRecords = [],
  waivers = [],
  selectedStudent = null,
  hasChangePermission = false,
  hasDeletePermission = false,
  hasViewPermission = true,
  onUpdateFee = () => {},
  onDeleteFee = () => {},
  calculatePayableAmount = () => ({ waiverAmount: '0.00' }),
  isUpdating = false,
  isDeleting = false,
  institute
}) => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'due', 'paid'
  const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
  const [dateFilterType, setDateFilterType] = useState(''); // 'date', 'month'

  // Filter fee records based on status and date
  const filteredFeeRecords = feeRecords.filter((fee) => {
    // Status filter
    if (filterType === 'due' && fee.status === 'PAID') return false;
    if (filterType === 'paid' && fee.status !== 'PAID') return false;
    
    // Date filter
    if (dateFilterType && dateFilter.startDate && dateFilter.endDate) {
      const feeDate = new Date(fee.created_at || fee.updated_at);
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate);
      
      if (dateFilterType === 'month') {
        const feeMonth = feeDate.getMonth();
        const feeYear = feeDate.getFullYear();
        const startMonth = startDate.getMonth();
        const startYear = startDate.getFullYear();
        const endMonth = endDate.getMonth();
        const endYear = endDate.getFullYear();
        
        if (feeYear < startYear || feeYear > endYear) return false;
        if (feeYear === startYear && feeMonth < startMonth) return false;
        if (feeYear === endYear && feeMonth > endMonth) return false;
      } else {
        if (feeDate < startDate || feeDate > endDate) return false;
      }
    }
    
    return true;
  });

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({ ...prev, [name]: value }));
  };

  // Generate HTML-based report for printing
  const generatePDFReport = () => {
    if (!hasViewPermission) {
      toast.error('ফি ইতিহাস প্রতিবেদন দেখার অনুমতি নেই।');
      return;
    }
    
    if (dateFilterType && (!dateFilter.startDate || !dateFilter.endDate)) {
      toast.error('অনুগ্রহ করে শুরু এবং শেষ তারিখ নির্বাচন করুন।');
      return;
    }
    
    if (filteredFeeRecords.length === 0) {
      toast.error('নির্বাচিত ফিল্টারে কোনো ফি রেকর্ড পাওয়া যায়নি।');
      return;
    }

    if (!institute) {
      toast.error('ইনস্টিটিউট তথ্য পাওয়া যায়নি!');
      return;
    }

    const printWindow = window.open('', '_blank');

    // Group fee records into pages (assuming ~20 rows per page to fit A4 landscape)
    const rowsPerPage = 20;
    const feePages = [];
    for (let i = 0; i < filteredFeeRecords.length; i += rowsPerPage) {
      feePages.push(filteredFeeRecords.slice(i, i + rowsPerPage));
    }

    const filterName = filterType === 'due' ? 'বকেয়া ফি' : filterType === 'paid' ? 'পরিশোধিত ফি' : 'সমস্ত ফি';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ফি ইতিহাস প্রতিবেদন</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 landscape; 
            margin: 20mm;
          }
          body { 
            font-family: 'Noto Sans Bengali', Arial, sans-serif;  
            font-size: 12px; 
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #000;
          }
          .page-container {
            width: 100%;
            min-height: 190mm;
            page-break-after: always;
          }
          .page-container:last-child {
            page-break-after: auto;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 10px; 
            margin-top: 10px;
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
            text-transform: uppercase;
          }
          td { 
            color: #000; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 15px; 
            padding-bottom: 10px;
          }
          .institute-info {
            margin-bottom: 10px;
          }
          .institute-info h1 {
            font-size: 22px;
            margin: 0;
            color: #000;
          }
          .institute-info p {
            font-size: 14px;
            margin: 5px 0;
            color: #000;
          }
          .title {
            font-size: 18px;
            color: #DB9E30;
            margin: 10px 0;
          }
          .meta-container {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-bottom: 8px;
          }
          .date { 
            margin-top: 20px; 
            text-align: right; 
            font-size: 10px; 
            color: #000;
          }
          .footer {
            position: absolute;
            bottom: 20px;
            left: 40px;
            right: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #555;
          }
        </style>
      </head>
      <body>
        ${feePages.map((pageItems, pageIndex) => `
          <div class="page-container">
            <div class="header">
              <div class="institute-info">
                <h1>${institute.institute_name || 'অজানা ইনস্টিটিউট'}</h1>
                <p>${institute.institute_address || 'ঠিকানা উপলব্ধ নয়'}</p>
                <p>${institute.institute_email_address || ''} ${institute.institute_mobile ? '| ' + institute.institute_mobile : ''}</p>
                ${selectedStudent ? `<p>ছাত্র: ${selectedStudent.name} (রোল: ${selectedStudent.roll_no || 'অজানা'})</p>` : ''}
              </div>
              <h2 class="title">ফি ইতিহাস প্রতিবেদন - ${filterName}</h2>
              <div class="meta-container">
                <span>তারিখ পরিসীমা: ${dateFilterType && dateFilter.startDate && dateFilter.endDate ? (new Date(dateFilter.startDate).toLocaleDateString('bn-BD') + ' থেকে ' + new Date(dateFilter.endDate).toLocaleDateString('bn-BD')) : 'সকল'}</span>
                <span>তৈরির তারিখ: ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 150px;">ফি প্রকার</th>
                  <th style="width: 100px;">মোট প্রদান পরিমাণ</th>
                  <th style="width: 100px;">ওয়েভার পরিমাণ</th>
                  <th style="width: 100px;">ডিসকাউন্ট পরিমাণ</th>
                  <th style="width: 100px;">স্থিতি</th>
                  <th style="width: 100px;">তৈরির তারিখ</th>
                </tr>
              </thead>
              <tbody>
                ${pageItems.map((fee, index) => `
                  <tr style="${index % 2 === 1 ? 'background-color: #f2f2f2;' : ''}">
                    <td>${fee.feetype_name}</td>
                    <td>${fee.amount}</td>
                    <td>${fee.waiver_amount || '0.00'}</td>
                    <td>${fee.discount_amount}</td>
                    <td>${fee.status === 'PAID' ? 'প্রদান' : fee.status === 'PARTIAL' ? 'আংশিক' : 'অপ্রদান'}</td>
                    <td>${fee.created_at ? new Date(fee.created_at).toLocaleDateString('bn-BD') : 'অজানা'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="date">
              রিপোর্ট তৈরির তারিখ: ${new Date().toLocaleDateString('bn-BD')}
            </div>
            <div class="footer">
              <span>প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</span>
              <span>পৃষ্ঠা ${pageIndex + 1} এর ${feePages.length}</span>
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
    toast.success('প্রতিবেদন সফলভাবে তৈরি হয়েছে!');
  };

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
      <style>
        {`
          .filter-button {
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            border: 1px solid #9d9087;
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
          .date-filter-button {
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 0.875rem;
          }
          .date-filter-active {
            background-color: #441a05;
            color: white;
          }
          .date-filter-inactive {
            background-color: transparent;
            color: #441a05;
            border: 1px solid #9d9087;
          }
          .date-filter-inactive:hover {
            background-color: rgba(68, 26, 5, 0.1);
          }
          .report-button {
            background-color: #441a05;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            transition: background-color 0.3s;
            border: none;
            cursor: pointer;
          }
          .report-button:hover {
            background-color: #5a2e0a;
          }
          .report-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}
      </style>

      {/* Header with filters */}
      <div className="flex flex-col gap-4 p-4 border-b border-white/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#441a05]">ফি ইতিহাস</h2>
          
          {/* Main filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`filter-button ${filterType === 'all' ? 'filter-button-active' : 'filter-button-inactive'}`}
            >
              সমস্ত
            </button>
            <button
              onClick={() => setFilterType('due')}
              className={`filter-button ${filterType === 'due' ? 'filter-button-active' : 'filter-button-inactive'}`}
            >
              বকেয়া
            </button>
            <button
              onClick={() => setFilterType('paid')}
              className={`filter-button ${filterType === 'paid' ? 'filter-button-active' : 'filter-button-inactive'}`}
            >
              পরিশোধিত
            </button>
          </div>
        </div>

        {/* Date filter section - only show if a status filter is active */}
        {filterType !== 'all' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setDateFilterType(dateFilterType === 'date' ? '' : 'date')}
                className={`date-filter-button ${dateFilterType === 'date' ? 'date-filter-active' : 'date-filter-inactive'}`}
              >
                তারিখ অনুযায়ী
              </button>
              <button
                onClick={() => setDateFilterType(dateFilterType === 'month' ? '' : 'month')}
                className={`date-filter-button ${dateFilterType === 'month' ? 'date-filter-active' : 'date-filter-inactive'}`}
              >
                মাস অনুযায়ী
              </button>
            </div>

            {dateFilterType && (
              <div className="flex gap-3 items-center">
                <input
                  type={dateFilterType === 'month' ? 'month' : 'date'}
                  name="startDate"
                  value={dateFilter.startDate}
                  onChange={handleDateFilterChange}
                  className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg"
                  placeholder="শুরু"
                />
                <span className="text-[#441a05]">থেকে</span>
                <input
                  type={dateFilterType === 'month' ? 'month' : 'date'}
                  name="endDate"
                  value={dateFilter.endDate}
                  onChange={handleDateFilterChange}
                  className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg"
                  placeholder="শেষ"
                />
                <button
                  onClick={generatePDFReport}
                  className="report-button"
                  disabled={!dateFilter.startDate || !dateFilter.endDate}
                  title="প্রতিবেদন প্রিন্ট করুন"
                >
                  রিপোর্ট
                </button>
              </div>
            )}
          </div>
        )}

        {/* Simple report button for non-date filters */}
        {filterType !== 'all' && !dateFilterType && (
          <div className="flex justify-end">
            <button
              onClick={generatePDFReport}
              className="report-button"
              title="প্রতিবেদন প্রিন্ট করুন"
            >
              রিপোর্ট
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {filteredFeeRecords.length === 0 ? (
        <p className="p-4 text-[#441a05]/70 text-center">
          {filterType === 'all' 
            ? 'এই ছাত্রের জন্য কোনো ফি ইতিহাস উপলব্ধ নেই।' 
            : `${filterType === 'due' ? 'বকেয়া' : 'পরিশোধিত'} ফি পাওয়া যায়নি।`
          }
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ফি প্রকার
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  মোট প্রদান পরিমাণ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ওয়েভার পরিমাণ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ডিসকাউন্ট পরিমাণ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  স্থিতি
                </th>
                {(hasChangePermission || hasDeletePermission) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ক্রিয়াকলাপ
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {filteredFeeRecords.map((fee, index) => {
                const feeNameRecord = feesNameRecords?.find((f) => f.id === fee.feetype_id);
                const waiverAmount = feeNameRecord
                  ? calculatePayableAmount(feeNameRecord, waivers).waiverAmount
                  : '0.00';

                return (
                  <tr
                    key={fee.id}
                    className="bg-white/5 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {fee.feetype_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {fee.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {fee.waiver_amount || waiverAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {fee.discount_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          fee.status === 'PAID'
                            ? 'text-[#441a05] bg-[#DB9E30]'
                            : fee.status === 'PARTIAL'
                            ? 'text-yellow-800 bg-yellow-100/50'
                            : 'text-red-800 bg-red-100/50'
                        }`}
                      >
                        {fee.status === 'PAID' ? 'প্রদান' : fee.status === 'PARTIAL' ? 'আংশিক' : 'অপ্রদান'}
                      </span>
                    </td>
                    {(hasChangePermission || hasDeletePermission) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {hasChangePermission && (
                          <button
                            onClick={() =>
                              onUpdateFee(fee.id, {
                                amount: fee.amount,
                                discount_amount: fee.discount_amount,
                                status: fee.status,
                                waiver_amount: fee.waiver_amount || waiverAmount,
                              })
                            }
                            title="ফি আপডেট করুন / Update fee"
                            className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => onDeleteFee(fee.id)}
                            title="ফি মুছুন / Delete fee"
                            className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
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
        </div>
      )}
      
      {/* Loading/Error states */}
      {(isDeleting || isUpdating) && (
        <div
          className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
          style={{ animationDelay: '0.4s' }}
        >
          {isDeleting ? 'ফি মুছে ফেলা হচ্ছে...' : 'ফি আপডেট করা হচ্ছে...'}
        </div>
      )}
    </div>
  );
};

export default CurrentFeeHistoryTable;