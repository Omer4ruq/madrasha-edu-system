import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import {
  useCreateExpenseItemMutation,
  useDeleteExpenseItemMutation,
  useGetExpenseItemsQuery,
  useUpdateExpenseItemMutation,
  useGetFilteredExpenseItemsQuery,
} from "../../redux/features/api/expense-items/expenseItemsApi";
import { useGetFundsQuery } from "../../redux/features/api/funds/fundsApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetTransactionBooksQuery } from "../../redux/features/api/transaction-books/transactionBooksApi";
import { useGetExpenseHeadsQuery } from "../../redux/features/api/expense-heads/expenseHeadsApi";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { useSelector } from "react-redux";
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import ExpenseItemsList from "./ExpenseItemsList";



const ExpenseItems = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    expensetype_id: "",
    name: "",
    fund_id: "",
    transaction_book_id: "",
    transaction_number: "",
    expense_date: "",
    amount: "",
    employee_id: "",
    attach_doc: null,
    description: "",
    academic_year: "",
  });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [dateFilter, setDateFilter] = useState({ start_date: "", end_date: "", fund_id: "", expensetype_id: "" });
  const itemsPerPage = 3;

  const { data: expenseTypes = [], isLoading: isTypesLoading } = useGetExpenseHeadsQuery();
  const { data: fundTypes = [], isLoading: isFundLoading, error: fundError } = useGetFundsQuery();
  const { data: academicYears = [], isLoading: isYearsLoading } = useGetAcademicYearApiQuery();
  const { data: transactionBooks = [], isLoading: isBooksLoading } = useGetTransactionBooksQuery();
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
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });
  const [createExpenseItem, { isLoading: isCreating, error: createError }] = useCreateExpenseItemMutation();
  const [updateExpenseItem, { isLoading: isUpdating, error: updateError }] = useUpdateExpenseItemMutation();
  const [deleteExpenseItem, { isLoading: isDeleting, error: deleteError }] = useDeleteExpenseItemMutation();

  // Check permissions
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_expenseitemlist') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_expenseitemlist') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_expenseitemlist') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_expenseitemlist') || false;

  const expenseItems = expenseData?.results || [];
  const totalItems = expenseData?.count || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNext = !!expenseData?.next;
  const hasPrevious = !!expenseData?.previous;
  const filteredExpenseItems = filteredExpenseData?.results || [];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = ({ expensetype_id, name, fund_id, expense_date, amount, academic_year, transaction_book_id, transaction_number, employee_id }) => {
    const errors = {};
    if (!expensetype_id) errors.expensetype_id = "ব্যয়ের ধরন নির্বাচন করুন";
    if (!name) errors.name = "নাম প্রয়োজন";
    if (!fund_id) errors.fund_id = "ফান্ড নির্বাচন করুন";
    if (!expense_date) errors.expense_date = "ব্যয়ের তারিখ প্রয়োজন";
    if (!amount) errors.amount = "পরিমাণ প্রয়োজন";
    else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) errors.amount = "পরিমাণ অবশ্যই একটি বৈধ ধনাত্মক সংখ্যা হতে হবে";
    if (!academic_year) errors.academic_year = "শিক্ষাবর্ষ নির্বাচন করুন";

    if (transaction_book_id && (isNaN(parseInt(transaction_book_id)) || parseInt(transaction_book_id) <= 0)) {
      errors.transaction_book_id = "লেনদেন বইয়ের আইডি অবশ্যই একটি বৈধ ধনাত্মক পূর্ণসংখ্যা হতে হবে";
    }

    if (transaction_number && (isNaN(parseInt(transaction_number)) || parseInt(transaction_number) <= 0)) {
      errors.transaction_number = "লেনদেন নম্বর অবশ্যই একটি বৈধ ধনাত্মক পূর্ণসংখ্যা হতে হবে";
    }

    if (employee_id && !employee_id.trim()) {
      errors.employee_id = "কর্মচারী আইডি খালি হতে পারে না";
    }

    return Object.keys(errors).length ? errors : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error('ব্যয় আইটেম যোগ করার অনুমতি নেই।');
      return;
    }
    const validationErrors = validateForm(formData);
    if (validationErrors) {
      setErrors(validationErrors);
      toast.error("অনুগ্রহ করে সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন।");
      return;
    }
    try {
      const payload = {
        expensetype_id: parseInt(formData.expensetype_id),
        name: formData.name.trim(),
        fund_id: parseInt(formData.fund_id),
        expense_date: formData.expense_date,
        amount: parseFloat(formData.amount),
        description: formData.description.trim() || "",
        academic_year: parseInt(formData.academic_year),
        created_by: parseInt(localStorage.getItem("userId")) || 1,
      };

      if (formData.transaction_book_id && !isNaN(parseInt(formData.transaction_book_id))) {
        payload.transaction_book_id = parseInt(formData.transaction_book_id);
      }

      if (formData.transaction_number && !isNaN(parseInt(formData.transaction_number))) {
        payload.transaction_number = parseInt(formData.transaction_number);
      }

      if (formData.employee_id.trim()) {
        payload.employee_id = formData.employee_id.trim();
      }

      if (formData.attach_doc) {
        payload.attach_doc = formData.attach_doc;
      }

      await createExpenseItem(payload).unwrap();
      toast.success("ব্যয় আইটেম সফলভাবে তৈরি হয়েছে!");
      setFormData({
        expensetype_id: "",
        name: "",
        fund_id: "",
        transaction_book_id: "",
        transaction_number: "",
        expense_date: "",
        amount: "",
        employee_id: "",
        attach_doc: null,
        description: "",
        academic_year: "",
      });
      setErrors({});
      setCurrentPage(1);
    } catch (err) {
      setErrors(err.data || {});
      toast.error(`ব্যয় আইটেম তৈরি ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    }
  };

  const handleEditClick = (item) => {
    if (!hasChangePermission) {
      toast.error('ব্যয় আইটেম সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setEditId(item.id);
    setFormData({
      expensetype_id: item.expensetype_id?.toString() || "",
      name: item.name || "",
      fund_id: item.fund_id?.toString() || "",
      transaction_book_id: item.transaction_book_id?.toString() || "",
      transaction_number: item.transaction_number?.toString() || "",
      expense_date: item.expense_date || "",
      amount: item.amount || "",
      employee_id: item.employee_id || "",
      attach_doc: null,
      description: item.description || "",
      academic_year: item.academic_year?.toString() || "",
    });
    setErrors({});
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error('ব্যয় আইটেম আপডেট করার অনুমতি নেই।');
      return;
    }
    const validationErrors = validateForm(formData);
    if (validationErrors) {
      setErrors(validationErrors);
      toast.error("অনুগ্রহ করে সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন।");
      return;
    }
    try {
      const payload = {
        id: editId,
        expensetype_id: parseInt(formData.expensetype_id),
        name: formData.name.trim(),
        fund_id: parseInt(formData.fund_id),
        expense_date: formData.expense_date,
        amount: parseFloat(formData.amount),
        description: formData.description.trim() || "",
        academic_year: parseInt(formData.academic_year),
        updated_by: parseInt(localStorage.getItem("userId")) || 1,
      };

      if (formData.transaction_book_id && !isNaN(parseInt(formData.transaction_book_id))) {
        payload.transaction_book_id = parseInt(formData.transaction_book_id);
      }

      if (formData.transaction_number && !isNaN(parseInt(formData.transaction_number))) {
        payload.transaction_number = parseInt(formData.transaction_number);
      }

      if (formData.employee_id.trim()) {
        payload.employee_id = formData.employee_id.trim();
      }

      if (formData.attach_doc) {
        payload.attach_doc = formData.attach_doc;
      }

      await updateExpenseItem(payload).unwrap();
      toast.success("ব্যয় আইটেম সফলভাবে আপডেট হয়েছে!");
      setEditId(null);
      setFormData({
        expensetype_id: "",
        name: "",
        fund_id: "",
        transaction_book_id: "",
        transaction_number: "",
        expense_date: "",
        amount: "",
        employee_id: "",
        attach_doc: null,
        description: "",
        academic_year: "",
      });
      setErrors({});
      setCurrentPage(1);
    } catch (err) {
      setErrors(err.data || {});
      toast.error(`ব্যয় আইটেম আপডেট ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    }
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
    try {
      await deleteExpenseItem(deleteItemId).unwrap();
      toast.success("ব্যয় আইটেম সফলভাবে মুছে ফেলা হয়েছে!");
      setIsModalOpen(false);
      setDeleteItemId(null);
      setCurrentPage(1);
    } catch (err) {
      toast.error(`ব্যয় আইটেম মুছতে ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
      setIsModalOpen(false);
      setDeleteItemId(null);
    }
  };

  // Generate PDF report
  const generatePDFReport = async () => {
    if (!hasViewPermission) {
      toast.error('ব্যয় আইটেম প্রতিবেদন দেখার অনুমতি নেই।');
      return;
    }
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

  // View-only mode for users with only view permission
  if (hasViewPermission && !hasAddPermission && !hasChangePermission && !hasDeletePermission) {
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
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">ব্যয় আইটেম তালিকা</h3>
          {isItemsLoading ? (
            <p className="p-4 text-[#441a05]/70">লোড হচ্ছে...</p>
          ) : itemsError ? (
            <p className="p-4 text-red-400">
              ব্যয় আইটেম লোড করতে ত্রুটি: {itemsError.status || "অজানা"} - {JSON.stringify(itemsError.data || {})}
            </p>
          ) : expenseItems.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো ব্যয় আইটেম উপলব্ধ নেই।</p>
          ) : (
            <ExpenseItemsList
              expenseItems={expenseItems}
              expenseTypes={expenseTypes}
              fundTypes={fundTypes}
              academicYears={academicYears}
              hasChangePermission={hasChangePermission}
              hasDeletePermission={hasDeletePermission}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
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
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23441a05' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
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
      {(hasAddPermission || hasChangePermission || hasDeletePermission) && isModalOpen && (
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

      {/* ফর্ম */}
      {hasAddPermission && !editId && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              নতুন ব্যয় আইটেম যোগ করুন
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <select
                name="expensetype_id"
                value={formData.expensetype_id}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                disabled={isCreating || isUpdating || isTypesLoading}
                required
                aria-describedby={errors.expensetype_id ? "expensetype_id-error" : undefined}
              >
                <option value="" disabled hidden>
                  ব্যয়ের ধরন নির্বাচন করুন
                </option>
                {expenseTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.expensetype}</option>
                ))}
              </select>
              {errors.expensetype_id && (
                <p id="expensetype_id-error" className="text-red-400 text-sm mt-1">{errors.expensetype_id}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="ব্যয়ের আইটেমের নাম লিখুন"
                disabled={isCreating || isUpdating}
                
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && <p id="name-error" className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <select
                name="fund_id"
                value={formData.fund_id}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                disabled={isCreating || isUpdating || isFundLoading}
                required
                aria-describedby={errors.fund_id ? "fund_id-error" : undefined}
              >
                <option value="" disabled hidden>
                  ফান্ড নির্বাচন করুন
                </option>
                {fundTypes.map((fund) => (
                  <option key={fund.id} value={fund.id}>{fund.name}</option>
                ))}
              </select>
              {errors.fund_id && <p id="fund_id-error" className="text-red-400 text-sm mt-1">{errors.fund_id}</p>}
            </div>
            {/* <div>
              <select
                name="transaction_book_id"
                value={formData.transaction_book_id}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                disabled={isCreating || isUpdating || isBooksLoading}
                aria-describedby={errors.transaction_book_id ? "transaction_book_id-error" : undefined}
              >
                <option value="" disabled>
                  লেনদেন বই নির্বাচন করুন
                </option>
                {transactionBooks.map((book) => (
                  <option key={book.id} value={book.id}>{book.name}</option>
                ))}
              </select>
              {errors.transaction_book_id && (
                <p id="transaction_book_id-error" className="text-red-400 text-sm mt-1">{errors.transaction_book_id}</p>
              )}
            </div> */}
            {/* <div>
              <input
                type="number"
                name="transaction_number"
                value={formData.transaction_number}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="লেনদেন নম্বর লিখুন"
                disabled={isCreating || isUpdating}
                aria-describedby={errors.transaction_number ? "transaction_number-error" : undefined}
              />
              {errors.transaction_number && (
                <p id="transaction_number-error" className="text-red-400 text-sm mt-1">{errors.transaction_number}</p>
              )}
            </div> */}
            <div>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="কর্মচারী আইডি লিখুন (ঐচ্ছিক)"
                disabled={isCreating || isUpdating}
                aria-describedby={errors.employee_id ? "employee_id-error" : undefined}
              />
              {errors.employee_id && <p id="employee_id-error" className="text-red-400 text-sm mt-1">{errors.employee_id}</p>}
            </div>
            <div>
              <input
                type="date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                disabled={isCreating || isUpdating}
                required
                aria-describedby={errors.expense_date ? "expense_date-error" : undefined}
              />
              {errors.expense_date && <p id="expense_date-error" className="text-red-400 text-sm mt-1">{errors.expense_date}</p>}
            </div>
            <div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="পরিমাণ লিখুন"
                disabled={isCreating || isUpdating}
                required
                step="0.01"
                aria-describedby={errors.amount ? "amount-error" : undefined}
              />
              {errors.amount && <p id="amount-error" className="text-red-400 text-sm mt-1">{errors.amount}</p>}
            </div>
            <div>
              <select
                name="academic_year"
                value={formData.academic_year}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                disabled={isCreating || isUpdating || isYearsLoading}
                required
                aria-describedby={errors.academic_year ? "academic_year-error" : undefined}
              >
                <option value="" disabled hidden>
                  শিক্ষাবর্ষ নির্বাচন করুন
                </option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>{year.name}</option>
                ))}
              </select>
              {errors.academic_year && (
                <p id="academic_year-error" className="text-red-400 text-sm mt-1">{errors.academic_year}</p>
              )}
            </div>
            <div className="md:col-span-3">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="বর্ণনা লিখুন (ঐচ্ছিক)"
                disabled={isCreating || isUpdating}
                rows="3"
                aria-describedby={errors.description ? "description-error" : undefined}
              />
              {errors.description && <p id="description-error" className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>
            <div className="flex space-x-4 md:col-span-2">
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isCreating || isUpdating ? "cursor-not-allowed opacity-70" : "hover:text-white btn-glow"
                }`}
                aria-label="ব্যয় আইটেম তৈরি করুন"
              >
                {isCreating ? (
                  <>
                    <FaSpinner className="animate-spin text-lg mr-2" />
                    তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <IoAdd className="w-5 h-5 mr-2" />
                    ব্যয় আইটেম তৈরি করুন
                  </>
                )}
              </button>
            </div>
          </form>
          {(createError || updateError || fundError) && (
            <div id="form-error" className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
              {fundError && <p id="fund-error">ফান্ড লোড করতে ত্রুটি: {JSON.stringify(fundError)}</p>}
              {(createError || updateError) && (
                <p id="form-error">
                  ত্রুটি: {createError?.status || updateError?.status || "অজানা"} -{" "}
                  {JSON.stringify(createError?.data || updateError?.data || {})}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Form */}
      {hasChangePermission && editId && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <FaEdit className="text-3xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              ব্যয় আইটেম সম্পাদনা করুন
            </h3>
          </div>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <select
                name="expensetype_id"
                value={formData.expensetype_id}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                disabled={isCreating || isUpdating || isTypesLoading}
                required
                aria-describedby={errors.expensetype_id ? "expensetype_id-error" : undefined}
              >
                <option value="" disabled>
                  ব্যয়ের ধরন নির্বাচন করুন
                </option>
                {expenseTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.expensetype}</option>
                ))}
              </select>
              {errors.expensetype_id && (
                <p id="expensetype_id-error" className="text-red-400 text-sm mt-1">{errors.expensetype_id}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="নাম লিখুন"
                disabled={isCreating || isUpdating}
                required
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && <p id="name-error" className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <select
                name="fund_id"
                value={formData.fund_id}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                disabled={isCreating || isUpdating || isFundLoading}
                required
                aria-describedby={errors.fund_id ? "fund_id-error" : undefined}
              >
                <option value="" disabled>
                  ফান্ড নির্বাচন করুন
                </option>
                {fundTypes.map((fund) => (
                  <option key={fund.id} value={fund.id}>{fund.name}</option>
                ))}
              </select>
              {errors.fund_id && <p id="fund_id-error" className="text-red-400 text-sm mt-1">{errors.fund_id}</p>}
            </div>
            {/* <div>
              <select
                name="transaction_book_id"
                value={formData.transaction_book_id}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                disabled={isCreating || isUpdating || isBooksLoading}
                aria-describedby={errors.transaction_book_id ? "transaction_book_id-error" : undefined}
              >
                <option value="" disabled>
                  লেনদেন বই নির্বাচন করুন
                </option>
                {transactionBooks.map((book) => (
                  <option key={book.id} value={book.id}>{book.name}</option>
                ))}
              </select>
              {errors.transaction_book_id && (
                <p id="transaction_book_id-error" className="text-red-400 text-sm mt-1">{errors.transaction_book_id}</p>
              )}
            </div> */}
            {/* <div>
              <input
                type="number"
                name="transaction_number"
                value={formData.transaction_number}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="লেনদেন নম্বর লিখুন"
                disabled={isCreating || isUpdating}
                aria-describedby={errors.transaction_number ? "transaction_number-error" : undefined}
              />
              {errors.transaction_number && (
                <p id="transaction_number-error" className="text-red-400 text-sm mt-1">{errors.transaction_number}</p>
              )}
            </div> */}
            <div>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="কর্মচারী আইডি লিখুন (ঐচ্ছিক)"
                disabled={isCreating || isUpdating}
                aria-describedby={errors.employee_id ? "employee_id-error" : undefined}
              />
              {errors.employee_id && <p id="employee_id-error" className="text-red-400 text-sm mt-1">{errors.employee_id}</p>}
            </div>
            <div>
              <input
                type="date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                disabled={isCreating || isUpdating}
                required
                aria-describedby={errors.expense_date ? "expense_date-error" : undefined}
              />
              {errors.expense_date && <p id="expense_date-error" className="text-red-400 text-sm mt-1">{errors.expense_date}</p>}
            </div>
            <div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="পরিমাণ লিখুন"
                disabled={isCreating || isUpdating}
                required
                step="0.01"
                aria-describedby={errors.amount ? "amount-error" : undefined}
              />
              {errors.amount && <p id="amount-error" className="text-red-400 text-sm mt-1">{errors.amount}</p>}
            </div>
            <div>
              <select
                name="academic_year"
                value={formData.academic_year}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                disabled={isCreating || isUpdating || isYearsLoading}
                required
                aria-describedby={errors.academic_year ? "academic_year-error" : undefined}
              >
                <option value="" disabled>
                  শিক্ষাবর্ষ নির্বাচন করুন
                </option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>{year.name}</option>
                ))}
              </select>
              {errors.academic_year && (
                <p id="academic_year-error" className="text-red-400 text-sm mt-1">{errors.academic_year}</p>
              )}
            </div>
            <div className="md:col-span-3">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                placeholder="বর্ণনা লিখুন (ঐচ্ছিক)"
                disabled={isCreating || isUpdating}
                rows="3"
                aria-describedby={errors.description ? "description-error" : undefined}
              />
              {errors.description && <p id="description-error" className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>
            <div className="flex space-x-4 md:col-span-2">
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                  isCreating || isUpdating ? "cursor-not-allowed opacity-70" : "hover:text-white btn-glow"
                }`}
                aria-label="ব্যয় আইটেম আপডেট করুন"
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="animate-spin text-lg mr-2" />
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  <>
                    <FaEdit className="w-5 h-5 mr-2" />
                    ব্যয় আইটেম আপডেট করুন
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setFormData({
                    expensetype_id: "",
                    name: "",
                    fund_id: "",
                    transaction_book_id: "",
                    transaction_number: "",
                    expense_date: "",
                    amount: "",
                    employee_id: "",
                    attach_doc: null,
                    description: "",
                    academic_year: "",
                  });
                  setErrors({});
                }}
                className="flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-gray-500/20 text-[#441a05] hover:bg-gray-500/30 transition-all duration-300 animate-scaleIn"
                aria-label="বাতিল"
              >
                বাতিল
              </button>
            </div>
          </form>
          {(createError || updateError || fundError) && (
            <div id="form-error" className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
              {fundError && <p id="fund-error">ফান্ড লোড করতে ত্রুটি: {JSON.stringify(fundError)}</p>}
              {(createError || updateError) && (
                <p id="form-error">
                  ত্রুটি: {createError?.status || updateError?.status || "অজানা"} -{" "}
                  {JSON.stringify(createError?.data || updateError?.data || {})}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ব্যয় আইটেম তালিকা */}
      {/* <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh]">
        {isItemsLoading ? (
          <p className="p-4 text-[#441a05]/70">লোড হচ্ছে...</p>
        ) : itemsError ? (
          <p className="p-4 text-red-400">
            ব্যয় আইটেম লোড করতে ত্রুটি: {itemsError.status || "অজানা"} - {JSON.stringify(itemsError.data || {})}
          </p>
        ) : expenseItems.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">কোনো ব্যয় আইটেম উপলব্ধ নেই।</p>
        ) : (
          <ExpenseItemsList
            expenseItems={expenseItems}
            expenseTypes={expenseTypes}
            fundTypes={fundTypes}
            academicYears={academicYears}
            hasChangePermission={hasChangePermission}
            hasDeletePermission={hasDeletePermission}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        )}
        {(isDeleting || deleteError) && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            {isDeleting ? "মুছছে..." : `ব্যয় আইটেম মুছতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})}`}
          </div>
        )}
      </div> */}
    </div>
  );
};

export default ExpenseItems;