import React, { useState, useMemo } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';

const WithdrawTable = ({ 
  withdraws = [], 
  funds = [], 
  isLoading = false, 
  error = null, 
  onEdit, 
  onDelete,
  hasEditPermission = true,
  hasDeletePermission = true,
  hasViewPermission = true
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState({
    start_date: '',
    end_date: '',
    fund_id: '',
    method: ''
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' বা 'card'

  // উপলব্ধ পেমেন্ট পদ্ধতি
  const paymentMethods = [
    { value: 'cash', label: 'নগদ' },
    { value: 'bank_transfer', label: 'ব্যাংক ট্রান্সফার' },
    { value: 'check', label: 'চেক' },
    { value: 'online', label: 'অনলাইন পেমেন্ট' },
    { value: 'mobile_banking', label: 'মোবাইল ব্যাংকিং' },
    { value: 'other', label: 'অন্যান্য' }
  ];

  // ফিল্টার করা উত্তোলন
  const filteredWithdraws = useMemo(() => {
    return withdraws.filter((withdraw) => {
      if (activeTab === 'all') return true;
      
      if (activeTab === 'fund' && dateFilter.fund_id) {
        return withdraw.fund === parseInt(dateFilter.fund_id);
      }
      
      if (activeTab === 'method' && dateFilter.method) {
        return withdraw.method === dateFilter.method;
      }
      
      if (activeTab === 'date' && dateFilter.start_date && dateFilter.end_date) {
        const withdrawDate = new Date(withdraw.date);
        const startDate = new Date(dateFilter.start_date);
        const endDate = new Date(dateFilter.end_date);
        return withdrawDate >= startDate && withdrawDate <= endDate;
      }
      
      return true;
    });
  }, [withdraws, activeTab, dateFilter]);

  // ফিল্টার করা উত্তোলনের মোট পরিমাণ
  const totalAmount = useMemo(() => {
    return filteredWithdraws.reduce((sum, withdraw) => {
      const amount = parseFloat(withdraw.amount) || 0;
      return sum + Math.abs(amount);
    }, 0).toFixed(2);
  }, [filteredWithdraws]);

  // ফিল্টার পরিবর্তন হ্যান্ডলার
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ফান্ডের নাম পাওয়া
  const getFundName = (fundId) => {
    const fund = funds.find(f => f.id === fundId);
    return fund ? fund.name : `ফান্ড ${fundId}`;
  };

  // রিপোর্ট জেনারেট করা
  const generateReport = () => {
    if (!hasViewPermission) {
      toast.error('আপনার রিপোর্ট তৈরি করার অনুমতি নেই');
      return;
    }
    
    if (activeTab === 'date' && (!dateFilter.start_date || !dateFilter.end_date)) {
      toast.error('তারিখ ফিল্টারের জন্য শুরু এবং শেষ তারিখ নির্বাচন করুন');
      return;
    }
    
    if (activeTab === 'fund' && !dateFilter.fund_id) {
      toast.error('ফান্ড ফিল্টারের জন্য একটি ফান্ড নির্বাচন করুন');
      return;
    }
    
    if (activeTab === 'method' && !dateFilter.method) {
      toast.error('পদ্ধতি ফিল্টারের জন্য একটি পদ্ধতি নির্বাচন করুন');
      return;
    }
    
    if (isLoading) {
      toast.error('ডেটা লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন');
      return;
    }
    
    if (error) {
      toast.error(`ডেটা লোড করতে ত্রুটি: ${error.status || 'অজানা ত্রুটি'}`);
      return;
    }
    
    if (!filteredWithdraws.length) {
      toast.error('নির্বাচিত ফিল্টারের জন্য কোনো উত্তোলন পাওয়া যায়নি');
      return;
    }

    const printWindow = window.open('', '_blank');
    const rowsPerPage = 20;
    const withdrawPages = [];
    
    for (let i = 0; i < filteredWithdraws.length; i += rowsPerPage) {
      withdrawPages.push(filteredWithdraws.slice(i, i + rowsPerPage));
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>উত্তোলন রিপোর্ট</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 landscape; 
            margin: 20mm;
          }
          body { 
            font-family: Arial, sans-serif;  
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
          .title {
            font-size: 18px;
            color: #333;
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
          tfoot td {
            font-weight: bold;
            background-color: #f0f0f0;
          }
          .amount-cell {
            text-align: right;
            font-weight: bold;
            color: #d32f2f;
          }
        </style>
      </head>
      <body>
        ${withdrawPages.map((pageItems, pageIndex) => `
          <div class="page-container">
            <div class="header">
              <h1>উত্তোলন রিপোর্ট</h1>
              <h2 class="title">আর্থিক উত্তোলনের সারাংশ</h2>
              <div class="meta-container">
                <span>তারিখের সীমা: ${activeTab === "date" ? (dateFilter.start_date ? new Date(dateFilter.start_date).toLocaleDateString('bn-BD') : 'শুরু') + ' থেকে ' + (dateFilter.end_date ? new Date(dateFilter.end_date).toLocaleDateString('bn-BD') : 'শেষ') : 'সব'}</span>
                <span>তৈরি করা হয়েছে: ${new Date().toLocaleDateString('bn-BD')} ${new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 150px;">ফান্ড</th>
                  <th style="width: 100px;">তারিখ</th>
                  <th style="width: 120px;">পরিমাণ (টাকা)</th>
                  <th style="width: 120px;">পদ্ধতি</th>
                  <th style="width: 200px;">নোট</th>
                </tr>
              </thead>
              <tbody>
                ${pageItems.map((withdraw, index) => `
                  <tr style="${index % 2 === 1 ? 'background-color: #f9f9f9;' : ''}">
                    <td>${getFundName(withdraw.fund)}</td>
                    <td>${withdraw.date || 'N/A'}</td>
                    <td class="amount-cell">-${Math.abs(withdraw.amount || 0).toLocaleString('bn-BD')}</td>
                    <td style="text-transform: capitalize;">${paymentMethods.find(m => m.value === withdraw.method)?.label || withdraw.method.replace('_', ' ')}</td>
                    <td style="text-align: left;">${withdraw.note || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
              ${pageIndex === withdrawPages.length - 1 ? `
                <tfoot>
                  <tr>
                    <td colspan="2"><strong>মোট উত্তোলন</strong></td>
                    <td class="amount-cell"><strong>-${totalAmount.toLocaleString('bn-BD')}</strong></td>
                    <td colspan="2"></td>
                  </tr>
                </tfoot>
              ` : ''}
            </table>
            <div class="date">
              রিপোর্ট তৈরি করা হয়েছে: ${new Date().toLocaleDateString('bn-BD')}
            </div>
            <div class="footer">
              <span>এই রিপোর্ট স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</span>
              <span>পৃষ্ঠা ${pageIndex + 1} এর মধ্যে ${withdrawPages.length}</span>
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
  };

  if (!hasViewPermission) {
    return (
      <div className="p-4 text-red-400 bg-red-500/10 rounded-lg animate-fadeIn text-center">
        আপনার উত্তোলন দেখার অনুমতি নেই।
      </div>
    );
  }

  return (
    <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
      <Toaster position="top-right" reverseOrder={false} />
      <style>
        {`
          .tab {
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            border: 1px solid #9d9087;
          }
          .tab-active {
            background-color: #DB9E30;
            color: #441a05;
            font-weight: bold;
            border-color: #DB9E30;
          }
          .tab-inactive {
            background-color: transparent;
            color: #441a05;
          }
          .tab-inactive:hover {
            background-color: #DB9E30/20;
          }
          .report-button {
            background-color: #DB9E30;
            color: #441a05;
            padding: 8px 16px;
            border-radius: 8px;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
          }
          .report-button:hover {
            color: white;
            background-color: #b38226;
          }
        `}
      </style>

      {/* হেডার এবং ফিল্টার */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
          উত্তোলন তালিকা
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* ট্যাব */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`tab ${activeTab === 'all' ? 'tab-active' : 'tab-inactive'}`}
            >
              সব
            </button>
            <button
              onClick={() => setActiveTab('fund')}
              className={`tab ${activeTab === 'fund' ? 'tab-active' : 'tab-inactive'}`}
            >
              ফান্ড
            </button>
            <button
              onClick={() => setActiveTab('method')}
              className={`tab ${activeTab === 'method' ? 'tab-active' : 'tab-inactive'}`}
            >
              পদ্ধতি
            </button>
            <button
              onClick={() => setActiveTab('date')}
              className={`tab ${activeTab === 'date' ? 'tab-active' : 'tab-inactive'}`}
            >
              তারিখ
            </button>
          </div>

          {/* ফিল্টার */}
          <div className="flex flex-col sm:flex-row gap-3">
            {activeTab === 'fund' && (
              <select
                name="fund_id"
                value={dateFilter.fund_id}
                onChange={handleFilterChange}
                className="bg-transparent min-w-[150px] text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB9E30]"
              >
                <option value="">ফান্ড নির্বাচন করুন</option>
                {funds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name}
                  </option>
                ))}
              </select>
            )}
            
            {activeTab === 'method' && (
              <select
                name="method"
                value={dateFilter.method}
                onChange={handleFilterChange}
                className="bg-transparent min-w-[150px] text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB9E30]"
              >
                <option value="">পদ্ধতি নির্বাচন করুন</option>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            )}
            
            {activeTab === 'date' && (
              <>
                <input
                  type="date"
                  name="start_date"
                  value={dateFilter.start_date}
                  onChange={handleFilterChange}
                  className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB9E30]"
                  placeholder="শুরু তারিখ"
                />
                <input
                  type="date"
                  name="end_date"
                  value={dateFilter.end_date}
                  onChange={handleFilterChange}
                  className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB9E30]"
                  placeholder="শেষ তারিখ"
                />
              </>
            )}
          </div>

          {/* ভিউ মোড টগল */}
          <div className="flex border border-[#9d9087] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#DB9E30] text-[#441a05]'
                  : 'bg-transparent text-[#441a05] hover:bg-[#DB9E30]/20'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9m-9 4h9" />
              </svg>
              টেবিল
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-[#DB9E30] text-[#441a05]'
                  : 'bg-transparent text-[#441a05] hover:bg-[#DB9E30]/20'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
              </svg>
              কার্ড
            </button>
          </div>

          {/* রিপোর্ট বাটন */}
          <button
            onClick={generateReport}
            className="report-button w-full sm:w-auto animate-scaleIn"
            title="উত্তোলন রিপোর্ট তৈরি করুন"
          >
            রিপোর্ট
          </button>
        </div>
      </div>

      {/* ফলাফলের সংখ্যা */}
      {!isLoading && !error && withdraws.length > 0 && (
        <div className="text-sm text-[#441a05]/70 mb-4">
          {dateFilter.start_date || dateFilter.end_date || dateFilter.fund_id || dateFilter.method ? (
            <>মোট {withdraws.length}টি উত্তোলনের মধ্যে {filteredWithdraws.length}টি দেখানো হচ্ছে</>
          ) : (
            <>মোট {withdraws.length}টি উত্তোলন</>
          )}
        </div>
      )}

      {/* লোডিং স্টেট */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#DB9E30]"></div>
          <p className="mt-2 text-[#441a05]/70">উত্তোলন লোড হচ্ছে...</p>
        </div>
      )}

      {/* ত্রুটি স্টেট */}
      {error && (
        <div className="p-4 text-red-400 bg-red-500/10 rounded-lg animate-fadeIn">
          <p>উত্তোলন লোড করতে ত্রুটি: {error?.data?.message || error?.message || 'অজানা ত্রুটি'}</p>
        </div>
      )}

      {/* খালি স্টেট */}
      {!isLoading && !error && filteredWithdraws.length === 0 && withdraws.length === 0 && (
        <div className="text-center py-8 text-[#441a05]/70">
          <p className="text-lg">কোনো উত্তোলন পাওয়া যায়নি</p>
          <p className="text-sm">উপরের ফর্ম ব্যবহার করে আপনার প্রথম উত্তোলন তৈরি করুন</p>
        </div>
      )}

      {/* ফিল্টারে কোনো ফলাফল নেই */}
      {!isLoading && !error && filteredWithdraws.length === 0 && withdraws.length > 0 && (
        <div className="text-center py-8 text-[#441a05]/70">
          <p className="text-lg">আপনার ফিল্টারের সাথে কোনো উত্তোলন মেলেনি</p>
          <p className="text-sm">আপনার অনুসন্ধানের মানদণ্ড সামঞ্জস্য করুন</p>
          <button
            onClick={() => setDateFilter({ start_date: '', end_date: '', fund_id: '', method: '' })}
            className="mt-2 text-[#DB9E30] hover:text-[#441a05] text-sm underline"
          >
            ফিল্টার সাফ করুন
          </button>
        </div>
      )}

      {/* টেবিল ভিউ */}
      {!isLoading && !error && filteredWithdraws.length > 0 && viewMode === 'table' && (
        <div className="table-container">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/5 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ফান্ড
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  তারিখ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  পরিমাণ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  পদ্ধতি
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  নোট
                </th>
                {(hasEditPermission || hasDeletePermission) && (
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ক্রিয়াকলাপ
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {filteredWithdraws.map((withdraw, index) => (
                <tr
                  key={withdraw.id}
                  className="bg-white/5 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                    {getFundName(withdraw.fund)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                    {withdraw.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 text-right">
                    -{Math.abs(withdraw.amount).toLocaleString('bn-BD')} টাকা
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05] capitalize">
                    {paymentMethods.find(m => m.value === withdraw.method)?.label || withdraw.method.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#441a05] max-w-xs truncate">
                    {withdraw.note || '-'}
                  </td>
                  {(hasEditPermission || hasDeletePermission) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 justify-center">
                        {hasEditPermission && (
                          <button
                            onClick={() => onEdit(withdraw)}
                            className="text-[#441a05] hover:text-blue-500 transition-colors duration-300"
                            title="উত্তোলন সম্পাদনা করুন"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => onDelete(withdraw)}
                            className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                            title="উত্তোলন মুছে ফেলুন"
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-white/5">
              <tr>
                <td colSpan={hasEditPermission || hasDeletePermission ? "2" : "2"} className="px-6 py-4 text-sm font-bold text-[#441a05]">
                  মোট উত্তোলন:
                </td>
                <td className="px-6 py-4 text-sm font-bold text-red-600 text-right">
                  -{totalAmount.toLocaleString('bn-BD')} টাকা
                </td>
                <td colSpan={hasEditPermission || hasDeletePermission ? "3" : "2"}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* কার্ড ভিউ */}
      {!isLoading && !error && filteredWithdraws.length > 0 && viewMode === 'card' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {filteredWithdraws.map((withdraw, index) => (
              <div
                key={withdraw.id}
                className="bg-white/5 border border-white/20 rounded-lg p-4 hover:shadow-md transition-shadow h-full flex flex-col animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-grow space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-[#441a05]">{getFundName(withdraw.fund)}</h3>
                    <span className="text-sm text-[#441a05]/70">{withdraw.date}</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-red-600">
                      -{Math.abs(withdraw.amount).toLocaleString('bn-BD')} টাকা
                    </p>
                    <p className="text-[#441a05]/70 flex items-center">
                      <span className="inline-block w-4 h-4 mr-2">💳</span>
                      <span className="capitalize">{paymentMethods.find(m => m.value === withdraw.method)?.label || withdraw.method.replace('_', ' ')}</span>
                    </p>
                    {withdraw.note && (
                      <p className="text-[#441a05]/70 text-sm">
                        <span className="inline-block w-4 h-4 mr-2">📝</span>
                        <span className="break-words line-clamp-2">{withdraw.note}</span>
                      </p>
                    )}
                  </div>
                </div>
                {(hasEditPermission || hasDeletePermission) && (
                  <div className="flex space-x-2 mt-4 pt-4 border-t border-white/20">
                    {hasEditPermission && (
                      <button
                        onClick={() => onEdit(withdraw)}
                        className="flex-1 px-3 py-2 text-sm text-[#441a05] hover:text-blue-500 rounded-lg transition-colors duration-300"
                        title="উত্তোলন সম্পাদনা করুন"
                      >
                        <FaEdit className="w-5 h-5 mx-auto" />
                      </button>
                    )}
                    {hasDeletePermission && (
                      <button
                        onClick={() => onDelete(withdraw)}
                        className="flex-1 px-3 py-2 text-sm text-[#441a05] hover:text-red-500 rounded-lg transition-colors duration-300"
                        title="উত্তোলন মুছে ফেলুন"
                      >
                        <FaTrash className="w-5 h-5 mx-auto" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* কার্ড ভিউয়ের জন্য মোট */}
          <div className="p-4 text-right font-bold text-[#441a05] bg-white/5 rounded-lg">
            মোট উত্তোলন: -{totalAmount.toLocaleString('bn-BD')} টাকা
          </div>
        </>
      )}
    </div>
  );
};

export default WithdrawTable;