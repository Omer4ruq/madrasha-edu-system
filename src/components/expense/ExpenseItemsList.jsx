import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import {
  useGetExpenseItemsQuery,
  useGetFilteredExpenseItemsQuery,
  useDeleteExpenseItemMutation,
} from "../../redux/features/api/expense-items/expenseItemsApi";
import { useGetFundsQuery } from "../../redux/features/api/funds/fundsApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetExpenseHeadsQuery } from "../../redux/features/api/expense-heads/expenseHeadsApi";
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

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
const PDFDocument = ({ expenseItems, expenseTypes, fundTypes, academicYears, startDate, endDate }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.schoolName}>আদর্শ বিদ্যালয়</Text>
        <Text style={styles.headerText}>ঢাকা, বাংলাদেশ</Text>
        <Text style={styles.title}>ব্যয় আইটেম প্রতিবেদন</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            তারিখ পরিসীমা: {startDate ? new Date(startDate).toLocaleDateString('bn-BD') : 'শুরু'} থেকে {endDate ? new Date(endDate).toLocaleDateString('bn-BD') : 'শেষ'}
          </Text>
          <Text style={styles.metaText}>
            তৈরির তারিখ: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
          </Text>
        </View>
        <View style={styles.divider} />
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { flex: 1 }]}>ব্যয়ের ধরন</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>নাম</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>ফান্ড</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>লেনদেন নম্বর</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>কর্মচারী আইডি</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>তারিখ</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>পরিমাণ</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>শিক্ষাবর্ষ</Text>
        </View>
        {expenseItems.map((item, index) => (
          <View key={item.id} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlternate]}>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
              {expenseTypes.find((type) => type.id === item.expensetype_id)?.expensetype || 'অজানা'}
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.name || 'N/A'}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
              {fundTypes.find((fund) => fund.id === item.fund_id)?.name || 'অজানা'}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>{item.transaction_number || '-'}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>{item.employee_id || '-'}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>{item.expense_date || 'N/A'}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>{item.amount || '0'}</Text>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
              {academicYears.find((year) => year.id === item.academic_year)?.name || 'অজানা'}
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

const ExpenseItemsList = ({ onEditClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [dateFilter, setDateFilter] = useState({ start_date: "", end_date: "", fund_id: "", expensetype_id: "" });
  const itemsPerPage = 3;

  const { data: expenseTypes = [], isLoading: isTypesLoading } = useGetExpenseHeadsQuery();
  const { data: fundTypes = [], isLoading: isFundLoading, error: fundError } = useGetFundsQuery();
  const { data: academicYears = [], isLoading: isYearsLoading } = useGetAcademicYearApiQuery();
  const {
    data: expenseData,
    isLoading: isItemsLoading,
    error: itemsError,
  } = useGetExpenseItemsQuery({ page: currentPage, page_size: itemsPerPage });
  const {
    data: filteredExpenseData,
    isLoading: isFilteredLoading,
    error: filteredError,
  } = useGetFilteredExpenseItemsQuery(
    dateFilter.start_date && dateFilter.end_date
      ? {
          start_date: dateFilter.start_date,
          end_date: dateFilter.end_date,
          fund_id: dateFilter.fund_id || "",
          expensetype_id: dateFilter.expensetype_id || "",
        }
      : { skip: true }
  );
  const [deleteExpenseItem, { isLoading: isDeleting, error: deleteError }] = useDeleteExpenseItemMutation();

  const expenseItems = expenseData?.results || [];
  const totalItems = expenseData?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNext = !!expenseData?.next;
  const hasPrevious = !!expenseData?.previous;
  const filteredExpenseItems = filteredExpenseData?.results || [];

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = (id) => {
    setDeleteItemId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteExpenseItem(deleteItemId).unwrap();
      toast.success("ব্যয় আইটেম সফলভাবে মুছে ফেলা হয়েছে!");
      setIsModalOpen(false);
      setDeleteItemId(null);
      setCurrentPage(1);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(`ব্যয় আইটেম মুছতে ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
      setIsModalOpen(false);
      setDeleteItemId(null);
    }
  };

  // Generate PDF report
  const generatePDFReport = async () => {
    if (!dateFilter.start_date || !dateFilter.end_date) {
      toast.error('অনুগ্রহ করে শুরু এবং শেষ তারিখ নির্বাচন করুন।');
      return;
    }
    if (isFilteredLoading) {
      toast.error('তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।');
      return;
    }
    if (filteredError) {
      toast.error(`তথ্য লোড করতে ত্রুটি: ${filteredError.status || 'অজানা ত্রুটি'}`);
      return;
    }
    if (!filteredExpenseItems.length) {
      toast.error('নির্বাচিত ফিল্টারে কোনো ব্যয় আইটেম পাওয়া যায়নি।');
      return;
    }
    try {
      const doc = <PDFDocument 
        expenseItems={filteredExpenseItems}
        expenseTypes={expenseTypes}
        fundTypes={fundTypes}
        academicYears={academicYears}
        startDate={dateFilter.start_date}
        endDate={dateFilter.end_date}
      />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ব্যয়_প্রতিবেদন_${dateFilter.start_date}_থেকে_${dateFilter.end_date}_${new Date().toLocaleDateString('bn-BD')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('প্রতিবেদন সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
  };

  // Pagination logic
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="py-8 w-full relative">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.1)",
            color: "#441a05",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "0.5rem",
            backdropFilter: "blur(4px)",
          },
          success: { style: { background: "rgba(219, 158, 48, 0.1)", borderColor: "#DB9E30" } },
          error: { style: { background: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444" } },
        }}
      />
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
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
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
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
          .table-container {
            max-height: 60vh;
            overflow-x: auto;
            overflow-y: auto;
            position: relative;
          }
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
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
          select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23441a05' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.5rem center;
            background-size: 1.5em;
          }
          .report-button {
            background-color: #441a05;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            transition: background-color 0.3s;
          }
          .report-button:hover {
            background-color: #5a2e0a;
          }
        `}
      </style>

      {/* মডাল */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              ব্যয় আইটেম মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই ব্যয় আইটেমটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                aria-label="বাতিল"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${
                  isDeleting ? "cursor-not-allowed opacity-60" : "hover:text-white"
                }`}
                aria-label="নিশ্চিত করুন"
              >
                {isDeleting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>মুছছে...</span>
                  </span>
                ) : (
                  "নিশ্চিত করুন"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ব্যয় আইটেম তালিকা */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn p-6">
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05]">ব্যয় আইটেম তালিকা</h3>
          <div className="flex items-center space-x-4">
            <select
              name="expensetype_id"
              value={dateFilter.expensetype_id}
              onChange={handleDateFilterChange}
              className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
            >
              <option value="">সকল ব্যয়ের ধরন</option>
              {expenseTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.expensetype}</option>
              ))}
            </select>
            <select
              name="fund_id"
              value={dateFilter.fund_id}
              onChange={handleDateFilterChange}
              className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
            >
              <option value="">সকল ফান্ড</option>
              {fundTypes.map((fund) => (
                <option key={fund.id} value={fund.id}>{fund.name}</option>
              ))}
            </select>
            <input
              type="date"
              name="start_date"
              value={dateFilter.start_date}
              onChange={handleDateFilterChange}
              className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              placeholder="শুরু তারিখ"
            />
            <input
              type="date"
              name="end_date"
              value={dateFilter.end_date}
              onChange={handleDateFilterChange}
              className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              placeholder="শেষ তারিখ"
            />
            <button onClick={generatePDFReport} className="report-button" title="Download Expense Report">
              রিপোর্ট
            </button>
          </div>
        </div>
        {isItemsLoading || isTypesLoading || isFundLoading || isYearsLoading ? (
          <div className="p-4 flex items-center justify-center">
            <FaSpinner className="animate-spin text-[#441a05] text-2xl mr-2" />
            <p className="text-[#441a05]/70">লোড হচ্ছে...</p>
          </div>
        ) : itemsError || fundError ? (
          <p className="p-4 text-red-400 bg-red-500/10 rounded-lg">
            ত্রুটি: {itemsError?.status || fundError?.status || "অজানা"} - {JSON.stringify(itemsError?.data || fundError?.data || {})}
          </p>
        ) : expenseItems.length === 0 ? (
          <p className="p-4 text-[#441a05]/70 text-center">কোনো ব্যয় আইটেম পাওয়া যায়নি।</p>
        ) : (
          <>
            <div className="table-container">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ব্যয়ের ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ফান্ড
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      লেনদেন নম্বর
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      কর্মচারী আইডি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      পরিমাণ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শিক্ষাবর্ষ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      অ্যাকশন
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {expenseItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {expenseTypes.find((type) => type.id === item.expensetype_id)?.expensetype || "অজানা"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {fundTypes.find((fund) => fund.id === item.fund_id)?.name || item.fund_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {item.transaction_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {item.employee_id || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {item.expense_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {item.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {academicYears.find((year) => year.id === item.academic_year)?.name || item.academic_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => onEditClick(item)}
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-all duration-300"
                          aria-label={`সম্পাদনা ${item.name}`}
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-[#441a05] hover:text-red-500 transition-all duration-300"
                          aria-label={`মুছুন ${item.name}`}
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* পেজিনেশন নিয়ন্ত্রণ */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevious}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    !hasPrevious
                      ? 'bg-gray-500/20 text-[#441a05]/30 cursor-not-allowed'
                      : 'bg-[#DB9E30] text-[#441a05] hover:text-white'
                  }`}
                  aria-label="পূর্ববর্তী পৃষ্ঠা"
                >
                  পূর্ববর্তী
                </button>
                {getPageNumbers().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-300 ${
                      currentPage === pageNumber
                        ? 'bg-[#DB9E30] text-white'
                        : 'bg-white/20 text-[#441a05] hover:bg-white/30'
                    }`}
                    aria-label={`পৃষ্ঠা ${pageNumber} এ যান`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    !hasNext
                      ? 'bg-gray-500/20 text-[#441a05]/30 cursor-not-allowed'
                      : 'bg-[#DB9E30] text-[#441a05] hover:text-white'
                  }`}
                  aria-label="পরবর্তী পৃষ্ঠা"
                >
                  পরবর্তী
                </button>
              </div>
            )}
            {(isDeleting || deleteError) && (
              <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
                {isDeleting ? "মুছছে..." : `ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})} `}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExpenseItemsList;