import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import {
  useGetAllExpenseItemsQuery,
  useDeleteExpenseItemMutation,
} from "../../redux/features/api/expense-items/expenseItemsApi";
import { useGetFundsQuery } from "../../redux/features/api/funds/fundsApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetExpenseHeadsQuery } from "../../redux/features/api/expense-heads/expenseHeadsApi";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { useSelector } from "react-redux";
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
          <Text style={[styles.tableHeader, { flex: 1 }]}>ব্যয়ের ধরন</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>নাম</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>তহবিল</Text>
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
  const { group_id } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [dateFilter, setDateFilter] = useState({ start_date: "", end_date: "", fund_id: "", expensetype_id: "" });

  const { data: expenseTypes = [], isLoading: isTypesLoading } = useGetExpenseHeadsQuery();
  const { data: fundTypes = [], isLoading: isFundLoading, error: fundError } = useGetFundsQuery();
  const { data: academicYears = [], isLoading: isYearsLoading } = useGetAcademicYearApiQuery();
  const {
    data: allExpenseData,
    isLoading: isAllItemsLoading,
    error: allItemsError,
  } = useGetAllExpenseItemsQuery();
  const [deleteExpenseItem, { isLoading: isDeleting, error: deleteError }] = useDeleteExpenseItemMutation();
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Check permissions
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_expenseitemlist') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_expenseitemlist') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_expenseitemlist') || false;

  // Filter items based on active tab and filter selections
  const filteredItems = allExpenseData?.results?.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "expenseType" && dateFilter.expensetype_id) {
      return item.expensetype_id === parseInt(dateFilter.expensetype_id);
    }
    if (activeTab === "fund" && dateFilter.fund_id) {
      return item.fund_id === parseInt(dateFilter.fund_id);
    }
    if (activeTab === "date" && dateFilter.start_date && dateFilter.end_date) {
      const itemDate = new Date(item.expense_date);
      const startDate = new Date(dateFilter.start_date);
      const endDate = new Date(dateFilter.end_date);
      return itemDate >= startDate && itemDate <= endDate;
    }
    return true;
  }) || [];

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('ব্যয় আইটেম মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setDeleteItemId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!hasDeletePermission) {
      toast.error('ব্যয় আইটেম মুছে ফেলার অনুমতি নেই।');
      return;
    }
    const toastId = toast.loading("ব্যয় আইটেম মুছে ফেলা হচ্ছে...");
    try {
      await deleteExpenseItem(deleteItemId).unwrap();
      toast.success("ব্যয় আইটেম সফলভাবে মুছে ফেলা হয়েছে!", { id: toastId });
      setIsModalOpen(false);
      setDeleteItemId(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(`ব্যয় আইটেম মুছতে ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`, { id: toastId });
      setIsModalOpen(false);
      setDeleteItemId(null);
    }
  };

  // Generate PDF report with filtered data
  const generatePDFReport = async () => {
    if (!hasViewPermission) {
      toast.error('ব্যয় আইটেম প্রতিবেদন দেখার অনুমতি নেই।');
      return;
    }
    if (activeTab === "date" && (!dateFilter.start_date || !dateFilter.end_date)) {
      toast.error('অনুগ্রহ করে শুরু এবং শেষ তারিখ নির্বাচন করুন।');
      return;
    }
    if (activeTab === "expenseType" && !dateFilter.expensetype_id) {
      toast.error('অনুগ্রহ করে ব্যয়ের ধরন নির্বাচন করুন।');
      return;
    }
    if (activeTab === "fund" && !dateFilter.fund_id) {
      toast.error('অনুগ্রহ করে তহবিল নির্বাচন করুন।');
      return;
    }
    if (isAllItemsLoading) {
      toast.error('তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।');
      return;
    }
    if (allItemsError) {
      toast.error(`তথ্য লোড করতে ত্রুটি: ${allItemsError.status || 'অজানা ত্রুটি'}`);
      return;
    }
    if (!filteredItems.length) {
      toast.error('নির্বাচিত ফিল্টারে কোনো ব্যয় আইটেম পাওয়া যায়নি।');
      return;
    }
    try {
      const doc = (
        <PDFDocument
          expenseItems={filteredItems}
          expenseTypes={expenseTypes}
          fundTypes={fundTypes}
          academicYears={academicYears}
          startDate={activeTab === "date" ? dateFilter.start_date : null}
          endDate={activeTab === "date" ? dateFilter.end_date : null}
        />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ব্যয়_প্রতিবেদন_${activeTab === "date" ? `${dateFilter.start_date}_থেকে_${dateFilter.end_date}` : activeTab}_${new Date().toLocaleDateString('bn-BD')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('প্রতিবেদন সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
  };

  // View-only mode for users with only view permission
  if (hasViewPermission && !hasChangePermission && !hasDeletePermission) {
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
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-[#441a05]">ব্যয় আইটেম তালিকা</h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 w-full md:w-auto">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`tab ${activeTab === "all" ? "tab-active" : "tab-inactive"}`}
                >
                  সকল
                </button>
                <button
                  onClick={() => setActiveTab("expenseType")}
                  className={`tab ${activeTab === "expenseType" ? "tab-active" : "tab-inactive"}`}
                >
                  ব্যয়ের ধরন
                </button>
                <button
                  onClick={() => setActiveTab("fund")}
                  className={`tab ${activeTab === "fund" ? "tab-active" : "tab-inactive"}`}
                >
                  তহবিল
                </button>
                <button
                  onClick={() => setActiveTab("date")}
                  className={`tab ${activeTab === "date" ? "tab-active" : "tab-inactive"}`}
                >
                  তারিখ
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {activeTab === "expenseType" && (
                  <select
                    name="expensetype_id"
                    value={dateFilter.expensetype_id}
                    onChange={handleDateFilterChange}
                    className="bg-transparent min-w-[150px] text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg w-full sm:w-auto"
                  >
                    <option value="">ব্যয়ের ধরন</option>
                    {expenseTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.expensetype}</option>
                    ))}
                  </select>
                )}
                {activeTab === "fund" && (
                  <select
                    name="fund_id"
                    value={dateFilter.fund_id}
                    onChange={handleDateFilterChange}
                    className="bg-transparent min-w-[150px] text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg w-full sm:w-auto"
                  >
                    <option value="">তহবিল নির্বাচন</option>
                    {fundTypes.map((fund) => (
                      <option key={fund.id} value={fund.id}>{fund.name}</option>
                    ))}
                  </select>
                )}
                {activeTab === "date" && (
                  <>
                    <input
                      type="date"
                      name="start_date"
                      value={dateFilter.start_date}
                      onChange={handleDateFilterChange}
                      className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg w-full sm:w-auto"
                      placeholder="শুরু তারিখ"
                    />
                    <input
                      type="date"
                      name="end_date"
                      value={dateFilter.end_date}
                      onChange={handleDateFilterChange}
                      className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg w-full sm:w-auto"
                      placeholder="শেষ তারিখ"
                    />
                  </>
                )}
              </div>
              <button
                onClick={generatePDFReport}
                className="report-button w-full sm:w-auto"
                title="Download Expense Report"
              >
                রিপোর্ট
              </button>
            </div>
          </div>
          {isAllItemsLoading || isTypesLoading || isFundLoading || isYearsLoading ? (
            <div className="p-4 flex items-center justify-center">
              <FaSpinner className="animate-spin text-[#441a05] text-2xl mr-2" />
              <p className="text-[#441a05]/70">লোড হচ্ছে...</p>
            </div>
          ) : allItemsError || fundError ? (
            <p className="p-4 text-red-400 bg-red-500/10 rounded-lg">
              ত্রুটি: {allItemsError?.status || fundError?.status || "অজানা"} - {JSON.stringify(allItemsError?.data || fundError?.data || {})}
            </p>
          ) : filteredItems.length === 0 ? (
            <p className="p-4 text-[#441a05]/70 text-center">কোনো ব্যয় আইটেম পাওয়া যায়নি।</p>
          ) : (
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
                      তহবিল
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredItems.map((item, index) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (permissionsLoading) {
    return <div className="p-4 text-[#441a05]/70 animate-fadeIn">লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

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
          .tab {
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
          }
          .tab-active {
            background-color: #DB9E30;
            color: #441a05;
            font-weight: bold;
          }
          .tab-inactive {
            background-color: transparent;
            color: #441a05;
          }
          .tab-inactive:hover {
            background-color: rgba(219, 158, 48, 0.1);
          }
        `}
      </style>

      {/* Modal */}
      {hasDeletePermission && isModalOpen && (
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
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${isDeleting ? "cursor-not-allowed opacity-60" : "hover:text-white"}`}
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

      {/* Expense Items List */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05]">ব্যয় আইটেম তালিকা</h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 w-full md:w-auto">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`tab ${activeTab === "all" ? "tab-active" : "tab-inactive"}`}
              >
                সকল
              </button>
              <button
                onClick={() => setActiveTab("expenseType")}
                className={`tab ${activeTab === "expenseType" ? "tab-active" : "tab-inactive"}`}
              >
                ব্যয়ের ধরন
              </button>
              <button
                onClick={() => setActiveTab("fund")}
                className={`tab ${activeTab === "fund" ? "tab-active" : "tab-inactive"}`}
              >
                তহবিল
              </button>
              <button
                onClick={() => setActiveTab("date")}
                className={`tab ${activeTab === "date" ? "tab-active" : "tab-inactive"}`}
              >
                তারিখ
              </button>
            </div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {activeTab === "expenseType" && (
                <select
                  name="expensetype_id"
                  value={dateFilter.expensetype_id}
                  onChange={handleDateFilterChange}
                  className="bg-transparent min-w-[150px] text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg w-full sm:w-auto"
                >
                  <option value="">ব্যয়ের ধরন</option>
                  {expenseTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.expensetype}</option>
                  ))}
                </select>
              )}
              {activeTab === "fund" && (
                <select
                  name="fund_id"
                  value={dateFilter.fund_id}
                  onChange={handleDateFilterChange}
                  className="bg-transparent min-w-[150px] text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg w-full sm:w-auto"
                >
                  <option value="">তহবিল নির্বাচন</option>
                  {fundTypes.map((fund) => (
                    <option key={fund.id} value={fund.id}>{fund.name}</option>
                  ))}
                </select>
              )}
              {activeTab === "date" && (
                <>
                  <input
                    type="date"
                    name="start_date"
                    value={dateFilter.start_date}
                    onChange={handleDateFilterChange}
                    className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg w-full sm:w-auto"
                    placeholder="শুরু তারিখ"
                  />
                  <input
                    type="date"
                    name="end_date"
                    value={dateFilter.end_date}
                    onChange={handleDateFilterChange}
                    className="bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg w-full sm:w-auto"
                    placeholder="শেষ তারিখ"
                  />
                </>
              )}
            </div>
            {/* Report Button */}
            <button
              onClick={generatePDFReport}
              className="report-button w-full sm:w-auto"
              title="Download Expense Report"
            >
              রিপোর্ট
            </button>
          </div>
        </div>
        {isAllItemsLoading || isTypesLoading || isFundLoading || isYearsLoading ? (
          <div className="p-4 flex items-center justify-center">
            <FaSpinner className="animate-spin text-[#441a05] text-2xl mr-2" />
            <p className="text-[#441a05]/70">লোড হচ্ছে...</p>
          </div>
        ) : allItemsError || fundError ? (
          <p className="p-4 text-red-400 bg-red-500/10 rounded-lg">
            ত্রুটি: {allItemsError?.status || fundError?.status || "অজানা"} - {JSON.stringify(allItemsError?.data || fundError?.data || {})}
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="p-4 text-[#441a05]/70 text-center">কোনো ব্যয় আইটেম পাওয়া যায়নি।</p>
        ) : (
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
                    তহবিল
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
                  {(hasChangePermission || hasDeletePermission) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      অ্যাকশন
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredItems.map((item, index) => (
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
                    {(hasChangePermission || hasDeletePermission) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {hasChangePermission && (
                          <button
                            onClick={() => onEditClick(item)}
                            className="text-[#441a05] hover:text-blue-500 mr-4 transition-all duration-300"
                            aria-label={`সম্পাদনা ${item.name}`}
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                        )}
                        {hasDeletePermission && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-[#441a05] hover:text-red-500 transition-all duration-300"
                            aria-label={`মুছুন ${item.name}`}
                          >
                            <FaTrash className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(isDeleting || deleteError) && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            {isDeleting ? "মুছছে..." : `ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseItemsList;