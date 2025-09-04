import React, { useState, useMemo } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';

const LiabilityTable = ({ 
  liabilityEntries = [], 
  liabilityHeads = [],
  funds = [], 
  parties = [],
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
    head_id: '',
    fund_id: '',
    party_id: '',
    movement: ''
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' বা 'card'

  // মুভমেন্ট টাইপ
  const movementTypes = [
    { value: 'INCREASE', label: 'বৃদ্ধি' },
    { value: 'DECREASE', label: 'হ্রাস' }
  ];

  // ফিল্টার করা এন্ট্রি
  const filteredEntries = useMemo(() => {
    return liabilityEntries.filter((entry) => {
      if (activeTab === 'all') return true;
      
      if (activeTab === 'head' && dateFilter.head_id) {
        return entry.head === parseInt(dateFilter.head_id);
      }
      
      if (activeTab === 'fund' && dateFilter.fund_id) {
        return entry.fund === parseInt(dateFilter.fund_id);
      }
      
      if (activeTab === 'party' && dateFilter.party_id) {
        return entry.party === parseInt(dateFilter.party_id);
      }
      
      if (activeTab === 'movement' && dateFilter.movement) {
        return entry.movement === dateFilter.movement;
      }
      
      if (activeTab === 'date' && dateFilter.start_date && dateFilter.end_date) {
        const entryDate = new Date(entry.date);
        const startDate = new Date(dateFilter.start_date);
        const endDate = new Date(dateFilter.end_date);
        return entryDate >= startDate && entryDate <= endDate;
      }
      
      return true;
    });
  }, [liabilityEntries, activeTab, dateFilter]);

  // ফিল্টার করা এন্ট্রির মোট পরিমাণ (মুভমেন্ট বিবেচনা করে)
  const totalAmount = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => {
      const amount = parseFloat(entry.amount) || 0;
      return entry.movement === 'INCREASE' ? sum + amount : sum - amount;
    }, 0).toFixed(2);
  }, [filteredEntries]);

  // ফিল্টার পরিবর্তন হ্যান্ডলার
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // এন্টিটির নাম পাওয়া
  const getHeadName = (headId) => {
    const head = liabilityHeads.find(h => h.id === headId);
    return head ? head.name : `হেড ${headId}`;
  };

  const getFundName = (fundId) => {
    const fund = funds.find(f => f.id === fundId);
    return fund ? fund.name : `ফান্ড ${fundId}`;
  };

  const getPartyName = (partyId) => {
    const party = parties.find(p => p.id === partyId);
    return party ? party.name : `পার্টি ${partyId}`;
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
    
    if (activeTab === 'head' && !dateFilter.head_id) {
      toast.error('হেড ফিল্টারের জন্য একটি দায়বদ্ধতা হেড নির্বাচন করুন');
      return;
    }
    
    if (activeTab === 'fund' && !dateFilter.fund_id) {
      toast.error('ফান্ড ফিল্টারের জন্য একটি ফান্ড নির্বাচন করুন');
      return;
    }
    
    if (activeTab === 'party' && !dateFilter.party_id) {
      toast.error('পার্টি ফিল্টারের জন্য একটি পার্টি নির্বাচন করুন');
      return;
    }
    
    if (activeTab === 'movement' && !dateFilter.movement) {
      toast.error('মুভমেন্ট ফিল্টারের জন্য একটি মুভমেন্ট টাইপ নির্বাচন করুন');
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
    
    if (!filteredEntries.length) {
      toast.error('নির্বাচিত ফিল্টারের জন্য কোনো দায়বদ্ধতা এন্ট্রি পাওয়া যায়নি');
      return;
    }

    const printWindow = window.open('', '_blank');
    const rowsPerPage = 20;
    const entryPages = [];
    
    for (let i = 0; i < filteredEntries.length; i += rowsPerPage) {
      entryPages.push(filteredEntries.slice(i, i + rowsPerPage));
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>দায়বদ্ধতা এন্ট্রি রিপোর্ট</title>
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
          }
          .increase {
            color: #d32f2f;
          }
          .decrease {
            color: #2e7d32;
          }
          .movement-badge {
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 8px;
            font-weight: bold;
          }
          .movement-increase {
            background-color: #ffebee;
            color: #c62828;
          }
          .movement-decrease {
            background-color: #e8f5e8;
            color: #2e7d32;
          }
        </style>
      </head>
      <body>
        ${entryPages.map((pageItems, pageIndex) => `
          <div class="page-container">
            <div class="header">
              <h1>দায়বদ্ধতা এন্ট্রি রিপোর্ট</h1>
              <h2 class="title">আর্থিক দায়বদ্ধতার সারাংশ</h2>
              <div class="meta-container">
                <span>তারিখের সীমা: ${activeTab === "date" ? (dateFilter.start_date ? new Date(dateFilter.start_date).toLocaleDateString('bn-BD') : 'শুরু') + ' থেকে ' + (dateFilter.end_date ? new Date(dateFilter.end_date).toLocaleDateString('bn-BD') : 'শেষ') : 'সব'}</span>
                <span>তৈরি করা হয়েছে: ${new Date().toLocaleDateString('bn-BD')} ${new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 150px;">দায়বদ্ধতা হেড</th>
                  <th style="width: 100px;">ফান্ড</th>
                  <th style="width: 100px;">পার্টি</th>
                  <th style="width: 100px;">তারিখ</th>
                  <th style="width: 120px;">পরিমাণ (টাকা)</th>
                  <th style="width: 100px;">মুভমেন্ট</th>
                  <th style="width: 200px;">নোট</th>
                </tr>
              </thead>
              <tbody>
                ${pageItems.map((entry, index) => `
                  <tr style="${index % 2 === 1 ? 'background-color: #f9f9f9;' : ''}">
                    <td>${getHeadName(entry.head)}</td>
                    <td>${getFundName(entry.fund)}</td>
                    <td>${getPartyName(entry.party)}</td>
                    <td>${entry.date || 'N/A'}</td>
                    <td class="amount-cell ${entry.movement === 'INCREASE' ? 'increase' : 'decrease'}">${entry.movement === 'INCREASE' ? '+' : '-'}${parseFloat(entry.amount || 0).toLocaleString('bn-BD')}</td>
                    <td><span class="movement-badge movement-${entry.movement.toLowerCase()}">${movementTypes.find(m => m.value === entry.movement)?.label || entry.movement}</span></td>
                    <td style="text-align: left;">${entry.note || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
              ${pageIndex === entryPages.length - 1 ? `
                <tfoot>
                  <tr>
                    <td colspan="4"><strong>নেট দায়বদ্ধতার পরিমাণ</strong></td>
                    <td class="amount-cell"><strong>${totalAmount.toLocaleString('bn-BD')}</strong></td>
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
              <span>পৃষ্ঠা ${pageIndex + 1} এর মধ্যে ${entryPages.length}</span>
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
        আপনার দায়বদ্ধতা দেখার অনুমতি নেই।
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
          দায়বদ্ধতা তালিকা
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
              onClick={() => setActiveTab('head')}
              className={`tab ${activeTab === 'head' ? 'tab-active' : 'tab-inactive'}`}
            >
              হেড
            </button>
            <button
              onClick={() => setActiveTab('fund')}
              className={`tab ${activeTab === 'fund' ? 'tab-active' : 'tab-inactive'}`}
            >
              ফান্ড
            </button>
            <button
              onClick={() => setActiveTab('party')}
              className={`tab ${activeTab === 'party' ? 'tab-active' : 'tab-inactive'}`}
            >
              পার্টি
            </button>
            <button
              onClick={() => setActiveTab('movement')}
              className={`tab ${activeTab === 'movement' ? 'tab-active' : 'tab-inactive'}`}
            >
              মুভমেন্ট
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
            {activeTab === 'head' && (
              <select
                name="head_id"
                value={dateFilter.head_id}
                onChange={handleFilterChange}
                className="bg-transparent min-w-[150px] text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB9E30]"
              >
                <option value="" hidden>হেড নির্বাচন করুন</option>
                {liabilityHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name}
                  </option>
                ))}
              </select>
            )}
            
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
            
            {activeTab === 'party' && (
              <select
                name="party_id"
                value={dateFilter.party_id}
                onChange={handleFilterChange}
                className="bg-transparent min-w-[150px] text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB9E30]"
              >
                <option value="" hidden>পার্টি নির্বাচন করুন</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </select>
            )}
            
            {activeTab === 'movement' && (
              <select
                name="movement"
                value={dateFilter.movement}
                onChange={handleFilterChange}
                className="bg-transparent min-w-[150px] text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB9E30]"
              >
                <option value="" hidden>মুভমেন্ট নির্বাচন করুন</option>
                {movementTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
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
          {/* <div className="flex border border-[#9d9087] rounded-lg overflow-hidden">
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
          </div> */}

          {/* রিপোর্ট বাটন */}
          <button
            onClick={generateReport}
            className="report-button w-full sm:w-auto animate-scaleIn"
            title="দায়বদ্ধতা রিপোর্ট তৈরি করুন"
          >
            রিপোর্ট
          </button>
        </div>
      </div>

      {/* ফলাফলের সংখ্যা */}
      {!isLoading && !error && liabilityEntries.length > 0 && (
        <div className="text-sm text-[#441a05]/70 mb-4">
          {dateFilter.start_date || dateFilter.end_date || dateFilter.head_id || dateFilter.fund_id || dateFilter.party_id || dateFilter.movement ? (
            <>মোট {liabilityEntries.length}টি এন্ট্রির মধ্যে {filteredEntries.length}টি দেখানো হচ্ছে</>
          ) : (
            <>মোট {liabilityEntries.length}টি এন্ট্রি</>
          )}
        </div>
      )}

      {/* লোডিং স্টেট */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#DB9E30]"></div>
          <p className="mt-2 text-[#441a05]/70">দায়বদ্ধতা লোড হচ্ছে...</p>
        </div>
      )}

      {/* ত্রুটি স্টেট */}
      {error && (
        <div className="p-4 text-red-400 bg-red-500/10 rounded-lg animate-fadeIn">
          <p>দায়বদ্ধতা লোড করতে ত্রুটি: {error?.data?.message || error?.message || 'অজানা ত্রুটি'}</p>
        </div>
      )}

      {/* খালি স্টেট */}
      {!isLoading && !error && filteredEntries.length === 0 && liabilityEntries.length === 0 && (
        <div className="text-center py-8 text-[#441a05]/70">
          <p className="text-lg">কোনো দায়বদ্ধতা এন্ট্রি পাওয়া যায়নি</p>
          <p className="text-sm">উপরের ফর্ম ব্যবহার করে আপনার প্রথম এন্ট্রি তৈরি করুন</p>
        </div>
      )}

      {/* ফিল্টারে কোনো ফলাফল নেই */}
      {!isLoading && !error && filteredEntries.length === 0 && liabilityEntries.length > 0 && (
        <div className="text-center py-8 text-[#441a05]/70">
          <p className="text-lg">আপনার ফিল্টারের সাথে কোনো দায়বদ্ধতা এন্ট্রি মেলেনি</p>
          <p className="text-sm">আপনার অনুসন্ধানের মানদণ্ড সামঞ্জস্য করুন</p>
          <button
            onClick={() => setDateFilter({ start_date: '', end_date: '', head_id: '', fund_id: '', party_id: '', movement: '' })}
            className="mt-2 text-[#DB9E30] hover:text-[#441a05] text-sm underline"
          >
            ফিল্টার সাফ করুন
          </button>
        </div>
      )}

      {/* টেবিল ভিউ */}
      {!isLoading && !error && filteredEntries.length > 0 && viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/5 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  দায়বদ্ধতা হেড
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  ফান্ড
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  পার্টি
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  তারিখ
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  পরিমাণ
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  মুভমেন্ট
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  নোট
                </th>
                {(hasEditPermission || hasDeletePermission) && (
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ক্রিয়াকলাপ
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {filteredEntries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className="bg-white/5 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-[#441a05]">
                    {getHeadName(entry.head)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-[#441a05]">
                    {getFundName(entry.fund)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-[#441a05]">
                    {getPartyName(entry.party)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-[#441a05]">
                    {entry.date}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-[#441a05] text-right">
                    {parseInt(entry.amount).toLocaleString('bn-BD')} টাকা
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      entry.movement === 'INCREASE' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {movementTypes.find(m => m.value === entry.movement)?.label || entry.movement}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#441a05] max-w-xs truncate">
                    {entry.note || '-'}
                  </td>
                  {(hasEditPermission || hasDeletePermission) && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 justify-center">
                        {hasEditPermission && (
                          <button
                            onClick={() => onEdit(entry)}
                            className="text-[#441a05] hover:text-blue-500 transition-colors duration-300"
                            title="এন্ট্রি সম্পাদনা করুন"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => onDelete(entry)}
                            className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                            title="এন্ট্রি মুছে ফেলুন"
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
                <td colSpan={hasEditPermission || hasDeletePermission ? "4" : "4"} className="px-4 py-4 text-sm font-bold text-[#441a05]">
                  নেট দায়বদ্ধতার পরিমাণ:
                </td>
                <td className="px-4 py-4 text-sm font-bold text-[#441a05] text-right">
                  {totalAmount.toLocaleString('bn-BD')} টাকা
                </td>
                <td colSpan={hasEditPermission || hasDeletePermission ? "3" : "2"}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* কার্ড ভিউ */}
      {!isLoading && !error && filteredEntries.length > 0 && viewMode === 'card' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {filteredEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="bg-white/5 border border-white/20 rounded-lg p-4 hover:shadow-md transition-shadow h-full flex flex-col animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-grow space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-[#441a05] line-clamp-1">{getHeadName(entry.head)}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      entry.movement === 'INCREASE' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {movementTypes.find(m => m.value === entry.movement)?.label || entry.movement}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-[#441a05]">
                      {parseInt(entry.amount).toLocaleString('bn-BD')} টাকা
                    </p>
                    <p className="text-[#441a05]/70 flex items-center text-sm">
                      <span className="inline-block w-4 h-4 mr-2">💰</span>
                      <span className="truncate">{getFundName(entry.fund)}</span>
                    </p>
                    <p className="text-[#441a05]/70 flex items-center text-sm">
                      <span className="inline-block w-4 h-4 mr-2">👤</span>
                      <span className="truncate">{getPartyName(entry.party)}</span>
                    </p>
                    <p className="text-[#441a05]/70 flex items-center text-sm">
                      <span className="inline-block w-4 h-4 mr-2">📅</span>
                      <span>{entry.date}</span>
                    </p>
                    {entry.note && (
                      <p className="text-[#441a05]/70 text-sm">
                        <span className="inline-block w-4 h-4 mr-2">📝</span>
                        <span className="break-words line-clamp-2">{entry.note}</span>
                      </p>
                    )}
                  </div>
                </div>
                {(hasEditPermission || hasDeletePermission) && (
                  <div className="flex space-x-2 mt-4 pt-4 border-t border-white/20">
                    {hasEditPermission && (
                      <button
                        onClick={() => onEdit(entry)}
                        className="flex-1 px-3 py-2 text-sm text-[#441a05] hover:text-blue-500 rounded-lg transition-colors duration-300"
                        title="এন্ট্রি সম্পাদনা করুন"
                      >
                        <FaEdit className="w-5 h-5 mx-auto" />
                      </button>
                    )}
                    {hasDeletePermission && (
                      <button
                        onClick={() => onDelete(entry)}
                        className="flex-1 px-3 py-2 text-sm text-[#441a05] hover:text-red-500 rounded-lg transition-colors duration-300"
                        title="এন্ট্রি মুছে ফেলুন"
                      >
                        <FaTrash className="w-5 h-5 mx-auto" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* কার্ড ভিউয়ের জন্য নেট */}
          <div className="p-4 text-right font-bold text-[#441a05] bg-white/5 rounded-lg">
            নেট দায়বদ্ধতার পরিমাণ: {totalAmount.toLocaleString('bn-BD')} টাকা
          </div>
        </>
      )}
    </div>
  );
};

export default LiabilityTable;