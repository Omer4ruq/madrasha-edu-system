import React, { useState } from 'react';
import { FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import toast from 'react-hot-toast';

// Register Noto Sans Bengali font
try {
  Font.register({
    family: 'NotoSansBengali',
    src: 'https://fonts.gstatic.com/ea/notosansbengali/v3/NotoSansBengali-Regular.ttf',
  });
} catch (error) {
  console.error('Font registration failed:', error);
  Font.register({
    family: 'Helvetica',
    src: 'https://fonts.gstatic.com/s/helvetica/v13/Helvetica.ttf',
  });
}

// PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'NotoSansBengali',
    fontSize: 10,
    color: '#222',
  },
  header: {
    textAlign: 'center',
    marginBottom: 15,
  },
  schoolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#441a05',
  },
  headerText: {
    fontSize: 10,
    marginTop: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 10,
    color: '#441a05',
    textDecoration: 'underline',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    marginBottom: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#441a05',
    marginVertical: 6,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#441a05',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#441a05',
  },
  tableHeader: {
    backgroundColor: '#441a05',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#fff',
  },
  tableCell: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    flex: 1,
    textAlign: 'left',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableRowAlternate: {
    backgroundColor: '#f2f2f2',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#555',
  },
});

// PDF Document Component
const PDFDocument = ({ feeRecords, filterType, startDate, endDate, selectedStudent, institute }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>{institute?.institute_name}</Text>
        <Text style={styles.headerText}>{institute?.institute_address}</Text>
        <Text style={styles.headerText}>{institute?.institute_email_address} | {institute?.institute_mobile}</Text>
          
        <Text style={styles.title}>
          ফি ইতিহাস প্রতিবেদন - {filterType === 'due' ? 'বকেয়া ফি' : filterType === 'paid' ? 'পরিশোধিত ' : 'সমস্ত ফি'}
        </Text>
        {selectedStudent && (
          <Text style={styles.headerText}>
            ছাত্র: {selectedStudent.name} (রোল: {selectedStudent.roll_no || 'অজানা'})
          </Text>
        )}
        <View style={styles.metaContainer}>
          <Text>
            তারিখ পরিসীমা: {startDate ? new Date(startDate).toLocaleDateString('bn-BD') : 'শুরু'} থেকে {endDate ? new Date(endDate).toLocaleDateString('bn-BD') : 'শেষ'}
          </Text>
          <Text>
            তৈরির তারিখ: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
          </Text>
        </View>
        <View style={styles.divider} />
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { flex: 1.5 }]}>ফি প্রকার</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>মোট প্রদান পরিমাণ</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>ওয়েভার পরিমাণ</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>ডিসকাউন্ট পরিমাণ</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>স্থিতি</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>তৈরির তারিখ</Text>
        </View>
        {feeRecords.map((fee, index) => (
          <View key={fee.id} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlternate]}>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{fee.feetype_name}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>{fee.amount}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>{fee.waiver_amount || '0.00'}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>{fee.discount_amount}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
              {fee.status === 'PAID' ? 'প্রদান' : fee.status === 'PARTIAL' ? 'আংশিক' : 'অপ্রদান'}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
              {fee.created_at ? new Date(fee.created_at).toLocaleDateString('bn-BD') : 'অজানা'}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.footer} fixed>
        <Text>প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</Text>
        <Text render={({ pageNumber, totalPages }) => `পৃষ্ঠা ${pageNumber} এর ${totalPages}`} />
      </View>
    </Page>
  </Document>
);

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
console.log("feeRecords", feeRecords)
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

  // Generate PDF report
  const generatePDFReport = async () => {
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

    try {
      const doc = <PDFDocument
        feeRecords={filteredFeeRecords}
        filterType={filterType}
        startDate={dateFilter.startDate}
        endDate={dateFilter.endDate}
        selectedStudent={selectedStudent}
        institute={institute}
      />;
      
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filterName = filterType === 'due' ? 'বকেয়া' : filterType === 'paid' ? 'পরিশোধিত' : 'সমস্ত';
      const dateRange = dateFilterType && dateFilter.startDate && dateFilter.endDate 
        ? `_${dateFilter.startDate}_থেকে_${dateFilter.endDate}` 
        : '';
      
      link.download = `ফি_ইতিহাস_${filterName}_${selectedStudent?.name || 'সব_ছাত্র'}${dateRange}_${new Date().toLocaleDateString('bn-BD')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('প্রতিবেদন সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
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
                  title="প্রতিবেদন ডাউনলোড করুন"
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
              title="প্রতিবেদন ডাউনলোড করুন"
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