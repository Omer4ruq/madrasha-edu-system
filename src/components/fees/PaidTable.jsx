import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaFileDownload, FaSpinner, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetFeesQuery } from '../../redux/features/api/fees/feesApi';
import { useGetWaiversQuery } from '../../redux/features/api/waivers/waiversApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { useGetFeesNamesQuery } from '../../redux/features/api/fees-name/feesName';

const PaidTable = ({
  className = "",
  title = "পেইড ফি রিপোর্ট",
  showHeader = true
}) => {
  const { group_id } = useSelector((state) => state.auth);

  // API
  const { data: allStudents, isLoading: studentsLoading } = useGetStudentActiveApiQuery();
  const { data: allFeeRecords, isLoading: feesLoading } = useGetFeesQuery();
  const { data: allFeesNameRecords, isLoading: feesNameLoading } = useGetFeesNamesQuery();
  const { data: waivers, isLoading: waiversLoading } = useGetWaiversQuery();
  const { data: institute, isLoading: instituteLoading } = useGetInstituteLatestQuery();
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, { skip: !group_id });

  // Permission
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_fees') || false;

  // Records: only PAID/PARTIAL
  const paidFeeRecords = useMemo(() => {
    return allFeeRecords?.filter(r => r.status === 'PAID' || r.status === 'PARTIAL') || [];
  }, [allFeeRecords]);

  // Filters (top bar)
  const [filters, setFilters] = useState({
    status: 'all',       // 'all' | 'paid' | 'partial'
    feeType: 'all',
    student: 'all',
    dateType: '',        // '' | 'date' | 'month'
    startDate: '',
    endDate: '',
    searchTerm: ''       // name/roll/user_id only
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);

  // Loading
  const isLoading = studentsLoading || feesLoading || feesNameLoading || waiversLoading || instituteLoading || permissionsLoading;

  // Fee types
  const feeTypes = useMemo(() => {
    return [...new Set(allFeesNameRecords?.map(fee => fee.fees_title))].sort() || [];
  }, [allFeesNameRecords]);

  // Students (only those who have paid/partial)
  const studentsWithPaidFees = useMemo(() => {
    const list = allStudents?.filter(s =>
      paidFeeRecords.some(r => r.student_id === s.id)
    ) || [];
    return list.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
  }, [allStudents, paidFeeRecords]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    let filtered = [...paidFeeRecords];

    // status
    if (filters.status === 'paid') {
      filtered = filtered.filter(r => r.status === 'PAID');
    } else if (filters.status === 'partial') {
      filtered = filtered.filter(r => r.status === 'PARTIAL');
    }

    // fee type
    if (filters.feeType !== 'all') {
      filtered = filtered.filter(r => {
        const feeName = allFeesNameRecords?.find(f => f.id === r.feetype_id);
        return (feeName?.fees_title || '') === filters.feeType;
      });
    }

    // student
    if (filters.student !== 'all') {
      filtered = filtered.filter(r => r.student_id === parseInt(filters.student));
    }

    // date range
    if (filters.dateType && filters.startDate && filters.endDate) {
      filtered = filtered.filter(r => {
        const recordDate = new Date(r.created_at || r.updated_at);
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

    // search — ONLY name, roll_no, user_id
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const q = filters.searchTerm.toString().toLowerCase().trim();
      filtered = filtered.filter(r => {
        const student = allStudents?.find(s => s.id === r.student_id);

        const name = (student?.name ?? '').toString().toLowerCase();
        const roll = (student?.roll_no ?? '').toString().toLowerCase();
        const userId = (student?.user_id ?? '').toString().toLowerCase();

        return (
          name.includes(q) ||
          roll.includes(q) ||
          userId.includes(q)
        );
      });
    }

    // sort latest first
    filtered.sort((a, b) =>
      new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at)
    );

    return filtered;
  }, [filters, paidFeeRecords, allStudents, allFeesNameRecords]);

  // reset page on data length change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRecords.length]);

  // handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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

  // pagination calc
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // small helpers
  const esc = (s) => String(s ?? '').replace(/[&<>]/g, (m) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));

  // report
  const generateReport = () => {
    if (!hasViewPermission) { toast.error('রিপোর্ট তৈরি করার অনুমতি নেই।'); return; }
    if (!filteredRecords.length) { toast.error('নির্বাচিত ফিল্টারে কোনো রেকর্ড পাওয়া যায়নি।'); return; }
    if (!institute) { toast.error('ইনস্টিটিউট তথ্য পাওয়া যায়নি!'); return; }

    const printWindow = window.open('', '_blank');

    // paginate rows
    const rowsPerPage = 25;
    const pages = [];
    for (let i = 0; i < filteredRecords.length; i += rowsPerPage) {
      pages.push(filteredRecords.slice(i, i + rowsPerPage));
    }

    const totalAmount = filteredRecords.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
    const totalWaiver = filteredRecords.reduce((s, r) => s + parseFloat(r.waiver_amount || 0), 0);
    const totalDiscount = filteredRecords.reduce((s, r) => s + parseFloat(r.discount_amount || 0), 0);

    const statusText =
      filters.status === 'paid' ? 'পরিশোধিত ফি' :
      filters.status === 'partial' ? 'আংশিক পরিশোধিত ফি' :
      'সমস্ত পেইড ফি';

    // ---- prepare filter labels safely ----
    const feeTypeLabel = filters.feeType !== 'all' ? `ফি প্রকার: ${esc(filters.feeType)} | ` : '';
    const studentNameForFilter = filters.student !== 'all'
      ? (allStudents?.find(s => s.id === Number(filters.student))?.name || '')
      : '';
    const studentLabel = filters.student !== 'all' ? `ছাত্র: ${esc(studentNameForFilter)} | ` : '';
    const dateLabel = (filters.dateType && filters.startDate && filters.endDate)
      ? `তারিখ পরিসীমা: ${new Date(filters.startDate).toLocaleDateString('bn-BD')} থেকে ${new Date(filters.endDate).toLocaleDateString('bn-BD')} | `
      : '';
    const searchLabel = filters.searchTerm
      ? `অনুসন্ধান: ${esc(String(filters.searchTerm))} | `
      : '';
    const filterInfoHTML = `${feeTypeLabel}${studentLabel}${dateLabel}${searchLabel}<strong>মোট রেকর্ড:</strong> ${filteredRecords.length}`;

    const htmlContent = `
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(title)}</title>
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: 'Noto Sans Bengali', Arial, sans-serif; font-size: 11px; margin:20px; color:#000; position: relative;}
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
          opacity: 0.1;
          width: 500px;
          height: 500px;
          pointer-events: none;
          text-align: center;
        }
        .watermark img {
          width: 500px;
          height: 500px;
          display: block;
        }
        .watermark.fallback::before {
          content: 'লোগো লোড হয়নি';
          color: #666;
          font-size: 16px;
          font-style: italic;
        }
        .page-container { width:100%; min-height:200mm; page-break-after: always; }
        .page-container:last-child { page-break-after: auto; }
        table { width:100%; border-collapse:collapse; font-size:9px; margin-top:10px; }
        th, td { border:1px solid #000; padding:6px; text-align:center; }
        th {font-weight:bold; }
        .header { text-align:center; margin-bottom:15px; padding-bottom:10px; border-bottom:2px solid #000; }
        .institute-info h1 { font-size:20px; margin:0; color:#000; }
        .institute-info p { font-size:12px; margin:3px 0; color:#666; }
        .title { font-size:16px; color:#DB9E30; margin:8px 0; font-weight:bold; }
        .filter-info { font-size:10px; margin:8px 0; color:#555; text-align:left; }
        .summary-box { border:1px solid #ddd; padding:10px; margin:15px 0; border-radius:5px; }
        .summary-title { font-weight:bold; color:#000; margin-bottom:8px; }
        .summary-row { display:flex; justify-content:space-between; margin:3px 0; }
        .footer { position:absolute; bottom:15px; left:40px; right:40px; display:flex; justify-content:space-between; font-size:8px; color:#555; border-top:1px solid #eee; padding-top:5px; }
      </style></head><body>
      ${
        institute.institute_logo
          ? `
            <div class="watermark">
              <img id="watermark-logo" src="${institute.institute_logo}" alt="Institute Logo" />
            </div>
          `
          : `
            <div class="watermark fallback"></div>
          `
      }
      ${pages.map((pageRecords, pageIndex) => {
        const rowsHTML = pageRecords.map((record, i) => {
          const st = (allStudents || []).find(s => s.id === record.student_id);
          const fee = (allFeesNameRecords || []).find(f => f.id === record.feetype_id);
          const originalAmount = parseFloat(fee?.amount || 0).toFixed(2);
          return `
            <tr style="${i % 2 === 1 ? '' : ''}">
              <td style="text-align:left;">${esc(st?.name || 'অজানা')}</td>
              <td>${esc(st?.roll_no ?? 'N/A')}</td>
              <td style="text-align:left;">${esc(fee?.fees_title || 'অজানা')}</td>
              <td>${originalAmount}</td>
              <td>${esc(record.waiver_amount || '0.00')}</td>
              <td>${esc(record.discount_amount || '0.00')}</td>
              <td>${esc(record.amount || '0.00')}</td>
              <td>${record.status === 'PAID' ? 'প্রদান' : record.status === 'PARTIAL' ? 'আংশিক' : 'অপ্রদান'}</td>
              <td>${record.created_at ? new Date(record.created_at).toLocaleDateString('bn-BD') : 'অজানা'}</td>
            </tr>`;
        }).join('');

        const isLastPage = pageIndex === (pages.length - 1);
        const summaryHTML = isLastPage ? `
          <div class="summary-box">
            <div class="summary-title">সারসংক্ষেপ</div>
            <div class="summary-row"><span>মোট প্রদান পরিমাণ:</span><span>${totalAmount.toFixed(2)} টাকা</span></div>
            <div class="summary-row"><span>মোট ওয়েভার পরিমাণ:</span><span>${totalWaiver.toFixed(2)} টাকা</span></div>
            <div class="summary-row"><span>মোট ডিসকাউন্ট পরিমাণ:</span><span>${totalDiscount.toFixed(2)} টাকা</span></div>
            <div class="summary-row"><span><strong>মোট রেকর্ড সংখ্যা:</strong></span><span><strong>${filteredRecords.length} টি</strong></span></div>
          </div>` : '';

        return `
          <div class="page-container">
            <div class="header">
              <div class="institute-info">
                <h1>${esc(institute?.institute_name || 'অজানা ইনস্টিটিউট')}</h1>
                <p>${esc(institute?.institute_address || 'ঠিকানা উপলব্ধ নয়')}</p>
                <p>${esc(institute?.institute_email_address || '')}${institute?.institute_mobile ? ' | ' + esc(institute?.institute_mobile) : ''}</p>
              </div>
              <h2 class="title">${esc(title)} - ${statusText}</h2>
              <div class="filter-info">${filterInfoHTML}</div>
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
              <tbody>${rowsHTML}</tbody>
            </table>
            ${summaryHTML}
            <div class="footer" fixed>
              <span>প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</span>
              <span>পৃষ্ঠা ${pageIndex + 1} এর ${pages.length} | তৈরির তারিখ: ${new Date().toLocaleDateString('bn-BD')} ${new Date().toLocaleTimeString('bn-BD')}</span>
            </div>
          </div>`;
      }).join('')}
      <script>
        let printAttempted = false;
        window.onbeforeprint = () => { printAttempted = true; };
        window.onafterprint = () => { window.close(); };
        window.addEventListener('beforeunload', (event) => {
          if (!printAttempted) { window.close(); }
        });

        // Wait for the logo to load before printing
        const logo = document.getElementById('watermark-logo');
        if (logo) {
          logo.onload = () => {
            console.log('Logo loaded successfully');
            window.print();
          };
          logo.onerror = () => {
            console.warn('Logo failed to load, proceeding with print.');
            document.querySelector('.watermark').classList.add('fallback');
            window.print();
          };
        } else {
          window.print();
        }
      </script>
      </body></html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('রিপোর্ট সফলভাবে তৈরি হয়েছে!');
  };

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
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  return (
    <div className={`bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn ${className}`}>
      <style>{`
        .btn {
          padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: all .2s;
          border: 1px solid #9d9087; background: transparent; color: #441a05; font-size: .9rem;
        }
        .btn:hover { background: rgba(219,158,48,.08); border-color: #DB9E30; }
        .btn-primary { background: #DB9E30; color: #441a05; border-color: #DB9E30; font-weight: 600; }
        .btn-primary:hover { opacity: .95; }
        .pagination-button {
          padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: all .3s;
          border: 1px solid #9d9087; background: transparent; color: #441a05;
        }
        .pagination-button:hover:not(:disabled) { background: rgba(219,158,48,.1); border-color: #DB9E30; }
        .pagination-button:disabled { opacity: .5; cursor: not-allowed; }
        .pagination-button.active { background: #DB9E30; color: #441a05; font-weight: 700; border-color: #DB9E30; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col gap-4 p-6 border-b border-white/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {showHeader && <h2 className="text-xl font-semibold text-[#441a05]">{title}</h2>}
          <div className="flex gap-2">
            <button onClick={generateReport} className="btn flex items-center gap-2" title="রিপোর্ট প্রিন্ট করুন">
              <FaFileDownload className="w-4 h-4" />
              রিপোর্ট
            </button>
          </div>
        </div>

        {/* Search (only name/roll/user_id) */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#441a05]/50 w-4 h-4" />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            placeholder="নাম, রোল নং বা ইউজার আইডি..."
            className="w-full bg-transparent text-[#441a05] pl-10 pr-4 py-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#DB9E30] transition-all duration-300"
          />
        </div>

        {/* FILTERS — always at top, symmetric grid */}
        <div className="bg-white/70 backdrop-blur rounded-xl border border-[#9d9087]/50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Status */}
            <div className="flex flex-col">
              <label className="text-xs text-[#441a05]/70 mb-1">স্থিতি</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full bg-transparent text-[#441a05] p-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#DB9E30]"
              >
                <option value="all">সমস্ত</option>
                <option value="paid">প্রদান</option>
                <option value="partial">আংশিক</option>
              </select>
            </div>

            {/* Fee Type */}
            <div className="flex flex-col">
              <label className="text-xs text-[#441a05]/70 mb-1">ফি প্রকার</label>
              <select
                value={filters.feeType}
                onChange={(e) => handleFilterChange('feeType', e.target.value)}
                className="w-full bg-transparent text-[#441a05] p-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#DB9E30]"
              >
                <option value="all">সমস্ত</option>
                {feeTypes.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Student */}
            <div className="flex flex-col">
              <label className="text-xs text-[#441a05]/70 mb-1">ছাত্র</label>
              <select
                value={filters.student}
                onChange={(e) => handleFilterChange('student', e.target.value)}
                className="w-full bg-transparent text-[#441a05] p-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#DB9E30]"
              >
                <option value="all">সমস্ত</option>
                {studentsWithPaidFees.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} {st.roll_no ? `(${st.roll_no})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date type */}
            <div className="flex flex-col">
              <label className="text-xs text-[#441a05]/70 mb-1">তারিখ ধরন</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleFilterChange('dateType', filters.dateType === 'date' ? '' : 'date')}
                  className={`btn flex-1 ${filters.dateType === 'date' ? 'btn-primary' : ''}`}
                >
                  তারিখ
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('dateType', filters.dateType === 'month' ? '' : 'month')}
                  className={`btn flex-1 ${filters.dateType === 'month' ? 'btn-primary' : ''}`}
                >
                  মাস
                </button>
              </div>
            </div>

            {/* Start */}
            <div className="flex flex-col">
              <label className="text-xs text-[#441a05]/70 mb-1">শুরু</label>
              <input
                type={filters.dateType === 'month' ? 'month' : 'date'}
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                disabled={!filters.dateType}
                className="bg-transparent text-[#441a05] p-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#DB9E30] disabled:opacity-50"
              />
            </div>

            {/* End */}
            <div className="flex flex-col">
              <label className="text-xs text-[#441a05]/70 mb-1">শেষ</label>
              <input
                type={filters.dateType === 'month' ? 'month' : 'date'}
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                disabled={!filters.dateType}
                className="bg-transparent text-[#441a05] p-2 border border-[#9d9087] rounded-lg focus:outline-none focus:border-[#DB9E30] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-3">
            <button type="button" onClick={clearFilters} className="btn flex items-center gap-2">
              <FaTimes className="w-4 h-4" />
              ফিল্টার পরিষ্কার
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {currentRecords.length === 0 ? (
        <div className="p-8 text-center text-[#441a05]/70">
          {filteredRecords.length === 0 ? (
            filters.searchTerm || filters.status !== 'all' || filters.feeType !== 'all' || filters.student !== 'all' || filters.dateType
              ? 'নির্বাচিত ফিল্টারে কোনো রেকর্ড পাওয়া যায়নি।'
              : 'কোনো পেইড ফি রেকর্ড পাওয়া যায়নি।'
          ) : (
            'এই পৃষ্ঠায় কোনো রেকর্ড নেই।'
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ছাত্রের নাম</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">রোল নং</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ফি প্রকার</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">মোট পরিমাণ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ওয়েভার পরিমাণ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ডিসকাউন্ট পরিমাণ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">প্রদান পরিমাণ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">স্থিতি</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {currentRecords.map((record, index) => {
                const student = allStudents?.find(s => s.id === record.student_id);
                const feeNameRecord = allFeesNameRecords?.find(f => f.id === record.feetype_id);
                const originalAmount = feeNameRecord ? parseFloat(feeNameRecord.amount || 0) : 0;
                return (
                  <tr key={`${record.id}-${index}`} className="bg-white/5 hover:bg-white/10 transition-colors duration-200">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">{student?.name || 'অজানা ছাত্র'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#441a05]">{student?.roll_no ?? 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">{feeNameRecord?.fees_title || 'অজানা ফি'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">{originalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">{record.waiver_amount || '0.00'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">{record.discount_amount || '0.00'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#441a05]">{record.amount || '0.00'}</td>
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
              পৃষ্ঠা {currentPage} এর {totalPages} ({indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, filteredRecords.length)} এর {filteredRecords.length})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="pagination-button">পূর্ববর্তী</button>
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}>
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="pagination-button">পরবর্তী</button>
          </div>
        </div>
      )}

      {/* Summary */}
      {filteredRecords.length > 0 && (
        <div className="bg-white/5 px-6 py-4 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center"><div className="text-[#441a05]/70">মোট রেকর্ড</div><div className="font-semibold text-[#441a05]">{filteredRecords.length} টি</div></div>
            <div className="text-center"><div className="text-[#441a05]/70">মোট প্রদান</div><div className="font-semibold text-[#441a05]">{filteredRecords.reduce((s, r) => s + parseFloat(r.amount || 0), 0).toFixed(2)} টাকা</div></div>
            <div className="text-center"><div className="text-[#441a05]/70">মোট ওয়েভার</div><div className="font-semibold text-[#441a05]">{filteredRecords.reduce((s, r) => s + parseFloat(r.waiver_amount || 0), 0).toFixed(2)} টাকা</div></div>
            <div className="text-center"><div className="text-[#441a05]/70">মোট ডিসকাউন্ট</div><div className="font-semibold text-[#441a05]">{filteredRecords.reduce((s, r) => s + parseFloat(r.discount_amount || 0), 0).toFixed(2)} টাকা</div></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaidTable;
