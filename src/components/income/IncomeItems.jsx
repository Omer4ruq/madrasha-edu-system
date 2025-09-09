import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import {
  useCreateIncomeItemMutation,
  useDeleteIncomeItemMutation,
  useGetIncomeItemsQuery,
  useUpdateIncomeItemMutation,
  useGetFilteredIncomeListQuery,
} from "../../redux/features/api/income-items/incomeItemsApi";
import { useGetIncomeHeadsQuery } from "../../redux/features/api/income-heads/incomeHeadsApi";
import { useGetFundsQuery } from "../../redux/features/api/funds/fundsApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetTransactionBooksQuery } from "../../redux/features/api/transaction-books/transactionBooksApi";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { useSelector } from "react-redux";
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import IncomeItemsList from "./IncomeItemsList";


const IncomeItems = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    incometype_id: "",
    name: "",
    fund_id: "",
    transaction_book_id: "",
    transaction_number: "",
    invoice_number: "",
    income_date: "",
    amount: "",
    attach_doc: null,
    description: "",
    academic_year: "",
  });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState({ start_date: "", end_date: "", fund_id: "", incometype_id: "" });
  const pageSize = 3;

  // API hooks
  const {
    data: incomeItems,
    isLoading: isItemsLoading,
    error: itemsError,
  } = useGetIncomeItemsQuery({ page: currentPage, page_size: pageSize });
  const {
    data: filteredIncomeData,
    isLoading: isFilteredLoading,
    error: filteredError,
  } = useGetFilteredIncomeListQuery(
    dateFilter.start_date && dateFilter.end_date
      ? {
          start_date: dateFilter.start_date,
          end_date: dateFilter.end_date,
          fund_id: dateFilter.fund_id || "",
          incometype_id: dateFilter.incometype_id || "",
        }
      : { skip: true }
  );
  const { data: incomeHeads = [], isLoading: isHeadsLoading } = useGetIncomeHeadsQuery();
  const { data: fundTypes = [], isLoading: isFundLoading, error: fundError } = useGetFundsQuery();
  const { data: academicYears = [], isLoading: isYearsLoading } = useGetAcademicYearApiQuery();
  const { data: transactionBooks = [], isLoading: isBooksLoading } = useGetTransactionBooksQuery();
  const [createIncomeItem, { isLoading: isCreating, error: createError }] = useCreateIncomeItemMutation();
  const [updateIncomeItem, { isLoading: isUpdating, error: updateError }] = useUpdateIncomeItemMutation();
  const [deleteIncomeItem, { isLoading: isDeleting, error: deleteError }] = useDeleteIncomeItemMutation();
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Check permissions
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_incomeitemlist') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_incomeitemlist') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_incomeitemlist') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_incomeitemlist') || false;

  const safeIncomeItems = Array.isArray(incomeItems?.results) ? incomeItems.results : [];
  const filteredIncomeItems = filteredIncomeData?.results || [];
  const totalPages = Math.ceil((incomeItems?.count || 0) / pageSize);
  const hasNextPage = !!incomeItems?.next;
  const hasPreviousPage = !!incomeItems?.previous;

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

  const validateForm = ({
    incometype_id,
    name,
    fund_id,
    income_date,
    amount,
    academic_year,
    transaction_book_id,
    transaction_number,
    invoice_number,
  }) => {
    const errors = {};
    if (!incometype_id) errors.incometype_id = "আয়ের ধরণ প্রয়োজন";
    if (!name) errors.name = "নাম প্রয়োজন";
    if (!fund_id) errors.fund_id = "তহবিল প্রয়োজন";
    if (!income_date) errors.income_date = "আয়ের তারিখ প্রয়োজন";
    if (!amount) errors.amount = "পরিমাণ প্রয়োজন";
    else if (parseFloat(amount) <= 0) errors.amount = "পরিমাণ ০-এর বেশি হতে হবে";
    if (!academic_year) errors.academic_year = "শিক্ষাবর্ষ প্রয়োজন";

    if (
      transaction_book_id &&
      (isNaN(parseInt(transaction_book_id)) || parseInt(transaction_book_id) <= 0)
    ) {
      errors.transaction_book_id = "লেনদেন বইয়ের আইডি বৈধ ধনাত্মক সংখ্যা হতে হবে";
    }

    if (
      transaction_number &&
      (isNaN(parseInt(transaction_number)) || parseInt(transaction_number) <= 0)
    ) {
      errors.transaction_number = "লেনদেন নম্বর বৈধ ধনাত্মক সংখ্যা হতে হবে";
    }

    if (invoice_number && !invoice_number.trim()) {
      errors.invoice_number = "ইনভয়েস নম্বর খালি হতে পারে না";
    }

    return Object.keys(errors).length ? errors : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error('আয় আইটেম যোগ করার অনুমতি নেই।');
      return;
    }
    const validationErrors = validateForm(formData);
    if (validationErrors) {
      setErrors(validationErrors);
      toast.error("অনুগ্রহ করে ফর্মের সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন");
      return;
    }
    const toastId = toast.loading("আয় আইটেম তৈরি হচ্ছে...");
    try {
      const payload = {
        incometype_id: parseInt(formData.incometype_id),
        name: formData.name.trim(),
        fund_id: parseInt(formData.fund_id),
        income_date: formData.income_date,
        amount: parseFloat(formData.amount),
        attach_doc: formData.attach_doc,
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

      if (formData.invoice_number.trim()) {
        payload.invoice_number = formData.invoice_number.trim();
      }

      await createIncomeItem(payload).unwrap();
      toast.success("আয় আইটেম সফলভাবে তৈরি করা হয়েছে!", { id: toastId });
      setFormData({
        incometype_id: "",
        name: "",
        fund_id: "",
        transaction_book_id: "",
        transaction_number: "",
        invoice_number: "",
        income_date: "",
        amount: "",
        attach_doc: null,
        description: "",
        academic_year: "",
      });
      setErrors({});
      setCurrentPage(1);
    } catch (err) {
      console.error("Create error:", err);
      toast.error(
        `আয় আইটেম তৈরি ব্যর্থ: ${err.status || "অজানা"} - ${JSON.stringify(err.data || {})}`,
        { id: toastId }
      );
      setErrors(err.data || {});
    }
  };

  const handleEditClick = (item) => {
    if (!hasChangePermission) {
      toast.error('আয় আইটেম সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setEditId(item.id);
    setFormData({
      incometype_id: item.incometype_id.toString(),
      name: item.name,
      fund_id: item.fund_id.toString(),
      transaction_book_id: item.transaction_book_id ? item.transaction_book_id.toString() : "",
      transaction_number: item.transaction_number ? item.transaction_number.toString() : "",
      invoice_number: item.invoice_number || "",
      income_date: item.income_date,
      amount: item.amount,
      attach_doc: null,
      description: item.description || "",
      academic_year: item.academic_year.toString(),
    });
    setErrors({});
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error('আয় আইটেম আপডেট করার অনুমতি নেই।');
      return;
    }
    const validationErrors = validateForm(formData);
    if (validationErrors) {
      setErrors(validationErrors);
      toast.error("অনুগ্রহ করে ফর্মের সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন");
      return;
    }
    const toastId = toast.loading("আয় আইটেম আপডেট হচ্ছে...");
    try {
      const payload = {
        id: editId,
        incometype_id: parseInt(formData.incometype_id),
        name: formData.name.trim(),
        fund_id: parseInt(formData.fund_id),
        income_date: formData.income_date,
        amount: parseFloat(formData.amount),
        attach_doc: formData.attach_doc,
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

      if (formData.invoice_number.trim()) {
        payload.invoice_number = formData.invoice_number.trim();
      }

      await updateIncomeItem(payload).unwrap();
      toast.success("আয় আইটেম সফলভাবে আপডেট করা হয়েছে!", { id: toastId });
      setEditId(null);
      setFormData({
        incometype_id: "",
        name: "",
        fund_id: "",
        transaction_book_id: "",
        transaction_number: "",
        invoice_number: "",
        income_date: "",
        amount: "",
        attach_doc: null,
        description: "",
        academic_year: "",
      });
      setErrors({});
      setCurrentPage(1);
    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        `আয় আইটেম আপডেট ব্যর্থ: ${err.status || "অজানা"} - ${JSON.stringify(err.data || {})}`,
        { id: toastId }
      );
      setErrors(err.data || {});
    }
  };

  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('আয় আইটেম মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setDeleteItemId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!hasDeletePermission) {
      toast.error('আয় আইটেম মুছে ফেলার অনুমতি নেই।');
      return;
    }
    const toastId = toast.loading("আয় আইটেম মুছে ফেলা হচ্ছে...");
    try {
      await deleteIncomeItem(deleteItemId).unwrap();
      toast.success("আয় আইটেম সফলভাবে মুছে ফেলা হয়েছে!", { id: toastId });
      setIsModalOpen(false);
      setDeleteItemId(null);
      setCurrentPage(1);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(
        `আয় আইটেম মুছে ফেলা ব্যর্থ: ${err.status || "অজানা"} - ${JSON.stringify(err.data || {})}`,
        { id: toastId }
      );
      setIsModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const generatePDFReport = async () => {
    if (!hasViewPermission) {
      toast.error('আয় আইটেম প্রতিবেদন দেখার অনুমতি নেই।');
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
    if (!filteredIncomeItems.length) {
      toast.error('নির্বাচিত ফিল্টারে কোনো আয় আইটেম পাওয়া যায়নি।');
      return;
    }
    try {
      const doc = <PDFDocument 
        incomeItems={filteredIncomeItems}
        incomeTypes={incomeHeads}
        fundTypes={fundTypes}
        academicYears={academicYears}
        startDate={dateFilter.start_date}
        endDate={dateFilter.end_date}
      />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `আয়_প্রতিবেদন_${dateFilter.start_date}_থেকে_${dateFilter.end_date}_${new Date().toLocaleDateString('bn-BD')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('প্রতিবেদন সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
  };

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
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">আয় আইটেম তালিকা</h3>
          {isItemsLoading ? (
            <p className="p-4 text-[#441a05]/70">লোড হচ্ছে...</p>
          ) : itemsError ? (
            <p className="p-4 text-red-400">
              আয় আইটেম লোড করতে ত্রুটি: {itemsError.status || "অজানা"} - {JSON.stringify(itemsError.data || {})}
            </p>
          ) : safeIncomeItems.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো আয় আইটেম উপলব্ধ নেই।</p>
          ) : (
            <IncomeItemsList incomeItems={safeIncomeItems} incomeHeads={incomeHeads} fundTypes={fundTypes} academicYears={academicYears} />
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
    <div className="py-8 w-full">
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

        {/* Confirmation Modal */}
        {(hasAddPermission || hasChangePermission || hasDeletePermission) && isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                আয় আইটেম মুছে ফেলা নিশ্চিত করুন
              </h3>
              <p className="text-[#441a05] mb-6">
                আপনি কি নিশ্চিত যে এই আয় আইটেমটি মুছে ফেলতে চান?
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
                    isDeleting ? 'cursor-not-allowed opacity-60' : 'hover:text-white'
                  }`}
                  aria-label="নিশ্চিত করুন"
                >
                  {isDeleting ? (
                    <span className="flex items-center space-x-2">
                      <FaSpinner className="animate-spin text-lg" />
                      <span>মুছছে...</span>
                    </span>
                  ) : (
                    'নিশ্চিত করুন'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form to Add/Edit Income Item */}
        {hasAddPermission && !editId && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
                নতুন আয় আইটেম যোগ করুন
              </h3>
            </div>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <div>
                <select
                  name="incometype_id"
                  value={formData.incometype_id}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  disabled={isCreating || isUpdating || isHeadsLoading}
                  required
                  aria-label="আয়ের ধরণ নির্বাচন করুন"
                  aria-describedby={errors.incometype_id ? "incometype_id-error" : undefined}
                >
                  <option value="" disabled hidden>
                    আয়ের ধরণ নির্বাচন করুন
                  </option>
                  {incomeHeads.map((head) => (
                    <option key={head.id} value={head.id}>
                      {head.incometype || "N/A"}
                    </option>
                  ))}
                </select>
                {errors.incometype_id && (
                  <p id="incometype_id-error" className="text-red-400 text-sm mt-1">
                    {errors.incometype_id}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                  placeholder="আয়ের আইটেমের নাম লিখুন"
                  disabled={isCreating || isUpdating}
                  required
                  aria-label="আয় আইটেমের নাম"
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-red-400 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <select
                  name="fund_id"
                  value={formData.fund_id}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  disabled={isCreating || isUpdating || isFundLoading}
                  required
                  aria-label="তহবিল নির্বাচন করুন"
                  aria-describedby={errors.fund_id ? "fund_id-error" : undefined}
                >
                  <option value="" disabled hidden>
                    তহবিল নির্বাচন করুন
                  </option>
                  {fundTypes.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.name || "N/A"}
                    </option>
                  ))}
                </select>
                {errors.fund_id && (
                  <p id="fund_id-error" className="text-red-400 text-sm mt-1">
                    {errors.fund_id}
                  </p>
                )}
              </div>
              {/* <div>
                <select
                  name="transaction_book_id"
                  value={formData.transaction_book_id}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  disabled={isCreating || isUpdating || isBooksLoading}
                  aria-label="লেনদেন বই নির্বাচন করুন"
                  aria-describedby={errors.transaction_book_id ? "transaction_book_id-error" : undefined}
                >
                  <option value="" disabled>
                    লেনদেন বই নির্বাচন করুন
                  </option>
                  {transactionBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.name || "N/A"}
                    </option>
                  ))}
                </select>
                {errors.transaction_book_id && (
                  <p id="transaction_book_id-error" className="text-red-400 text-sm mt-1">
                    {errors.transaction_book_id}
                  </p>
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
                  aria-label="লেনদেন নম্বর"
                  aria-describedby={errors.transaction_number ? "transaction_number-error" : undefined}
                />
                {errors.transaction_number && (
                  <p id="transaction_number-error" className="text-red-400 text-sm mt-1">
                    {errors.transaction_number}
                  </p>
                )}
              </div> */}
              <div>
                <input
                  type="text"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                  placeholder="ইনভয়েস নম্বর লিখুন (ঐচ্ছিক)"
                  disabled={isCreating || isUpdating}
                  aria-label="ইনভয়েস নম্বর"
                  aria-describedby={errors.invoice_number ? "invoice_number-error" : undefined}
                />
                {errors.invoice_number && (
                  <p id="invoice_number-error" className="text-red-400 text-sm mt-1">
                    {errors.invoice_number}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="date"
                  name="income_date"
                  value={formData.income_date}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                  disabled={isCreating || isUpdating}
                  required
                  aria-label="আয়ের তারিখ"
                  aria-describedby={errors.income_date ? "income_date-error" : undefined}
                />
                {errors.income_date && (
                  <p id="income_date-error" className="text-red-400 text-sm mt-1">
                    {errors.income_date}
                  </p>
                )}
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
                  aria-label="পরিমাণ"
                  aria-describedby={errors.amount ? "amount-error" : undefined}
                />
                {errors.amount && (
                  <p id="amount-error" className="text-red-400 text-sm mt-1">
                    {errors.amount}
                  </p>
                )}
              </div>
              <div>
                <select
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  disabled={isCreating || isUpdating || isYearsLoading}
                  required
                  aria-label="শিক্ষাবর্ষ নির্বাচন করুন"
                  aria-describedby={errors.academic_year ? "academic_year-error" : undefined}
                >
                  <option value="" disabled hidden>
                    শিক্ষাবর্ষ নির্বাচন করুন
                  </option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name || "N/A"}
                    </option>
                  ))}
                </select>
                {errors.academic_year && (
                  <p id="academic_year-error" className="text-red-400 text-sm mt-1">
                    {errors.academic_year}
                  </p>
                )}
              </div>
              <div className="md:col-span-3">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                  placeholder="বিবরণ লিখুন (ঐচ্ছিক)"
                  rows="4"
                  aria-label="বিবরণ"
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && (
                  <p id="description-error" className="text-red-400 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
              <div className="flex space-x-4 md:col-span-2">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                    isCreating || isUpdating ? "cursor-not-allowed opacity-70" : "hover:text-white btn-glow"
                  }`}
                  aria-label="আয় আইটেম তৈরি করুন"
                >
                  {isCreating ? (
                    <>
                      <FaSpinner className="animate-spin text-lg mr-2" />
                      তৈরি হচ্ছে...
                    </>
                  ) : (
                    <>
                      <IoAdd className="w-5 h-5 mr-2" />
                      আয় আইটেম তৈরি করুন
                    </>
                  )}
                </button>
              </div>
            </form>
            {(createError || fundError) && (
              <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-scaleIn">
                {fundError && (
                  <p id="fund-error">তহবিল লোড করতে ত্রুটি: {JSON.stringify(fundError)}</p>
                )}
                {createError && (
                  <p id="form-error">
                    ত্রুটি: {createError?.status || "অজানা"} - {JSON.stringify(createError?.data || {})}
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
                আয় আইটেম সম্পাদনা করুন
              </h3>
            </div>
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <div>
                <select
                  name="incometype_id"
                  value={formData.incometype_id}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  disabled={isCreating || isUpdating || isHeadsLoading}
                  required
                  aria-label="আয়ের ধরণ নির্বাচন করুন"
                  aria-describedby={errors.incometype_id ? "incometype_id-error" : undefined}
                >
                  <option value="" disabled>
                    আয়ের ধরণ নির্বাচন করুন
                  </option>
                  {incomeHeads.map((head) => (
                    <option key={head.id} value={head.id}>
                      {head.incometype || "N/A"}
                    </option>
                  ))}
                </select>
                {errors.incometype_id && (
                  <p id="incometype_id-error" className="text-red-400 text-sm mt-1">
                    {errors.incometype_id}
                  </p>
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
                  aria-label="আয় আইটেমের নাম"
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-red-400 text-sm mt-1">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <select
                  name="fund_id"
                  value={formData.fund_id}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  disabled={isCreating || isUpdating || isFundLoading}
                  required
                  aria-label="তহবিল নির্বাচন করুন"
                  aria-describedby={errors.fund_id ? "fund_id-error" : undefined}
                >
                  <option value="" disabled>
                    তহবিল নির্বাচন করুন
                  </option>
                  {fundTypes.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.name || "N/A"}
                    </option>
                  ))}
                </select>
                {errors.fund_id && (
                  <p id="fund_id-error" className="text-red-400 text-sm mt-1">
                    {errors.fund_id}
                  </p>
                )}
              </div>
              {/* <div>
                <select
                  name="transaction_book_id"
                  value={formData.transaction_book_id}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  disabled={isCreating || isUpdating || isBooksLoading}
                  aria-label="লেনদেন বই নির্বাচন করুন"
                  aria-describedby={errors.transaction_book_id ? "transaction_book_id-error" : undefined}
                >
                  <option value="" disabled>
                    লেনদেন বই নির্বাচন করুন
                  </option>
                  {transactionBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.name || "N/A"}
                    </option>
                  ))}
                </select>
                {errors.transaction_book_id && (
                  <p id="transaction_book_id-error" className="text-red-400 text-sm mt-1">
                    {errors.transaction_book_id}
                  </p>
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
                  aria-label="লেনদেন নম্বর"
                  aria-describedby={errors.transaction_number ? "transaction_number-error" : undefined}
                />
                {errors.transaction_number && (
                  <p id="transaction_number-error" className="text-red-400 text-sm mt-1">
                    {errors.transaction_number}
                  </p>
                )}
              </div> */}
              {/* <div>
                <input
                  type="text"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                  placeholder="ইনভয়েস নম্বর লিখুন (ঐচ্ছিক)"
                  disabled={isCreating || isUpdating}
                  aria-label="ইনভয়েস নম্বর"
                  aria-describedby={errors.invoice_number ? "invoice_number-error" : undefined}
                />
                {errors.invoice_number && (
                  <p id="invoice_number-error" className="text-red-400 text-sm mt-1">
                    {errors.invoice_number}
                  </p>
                )}
              </div> */}
              <div>
                <input
                  type="date"
                  name="income_date"
                  value={formData.income_date}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                  disabled={isCreating || isUpdating}
                  required
                  aria-label="আয়ের তারিখ"
                  aria-describedby={errors.income_date ? "income_date-error" : undefined}
                />
                {errors.income_date && (
                  <p id="income_date-error" className="text-red-400 text-sm mt-1">
                    {errors.income_date}
                  </p>
                )}
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
                  aria-label="পরিমাণ"
                  aria-describedby={errors.amount ? "amount-error" : undefined}
                />
                {errors.amount && (
                  <p id="amount-error" className="text-red-400 text-sm mt-1">
                    {errors.amount}
                  </p>
                )}
              </div>
              <div>
                <select
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
                  disabled={isCreating || isUpdating || isYearsLoading}
                  required
                  aria-label="শিক্ষাবর্ষ নির্বাচন করুন"
                  aria-describedby={errors.academic_year ? "academic_year-error" : undefined}
                >
                  <option value="" disabled>
                    শিক্ষাবর্ষ নির্বাচন করুন
                  </option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name || "N/A"}
                    </option>
                  ))}
                </select>
                {errors.academic_year && (
                  <p id="academic_year-error" className="text-red-400 text-sm mt-1">
                    {errors.academic_year}
                  </p>
                )}
              </div>
              <div className="md:col-span-3">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                  placeholder="বিবরণ লিখুন (ঐচ্ছিক)"
                  rows="4"
                  aria-label="বিবরণ"
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && (
                  <p id="description-error" className="text-red-400 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
              <div className="flex space-x-4 md:col-span-2">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                    isCreating || isUpdating ? "cursor-not-allowed opacity-70" : "hover:text-white btn-glow"
                  }`}
                  aria-label="আয় আইটেম আপডেট করুন"
                >
                  {isUpdating ? (
                    <>
                      <FaSpinner className="animate-spin text-lg mr-2" />
                      আপডেট হচ্ছে...
                    </>
                  ) : (
                    <>
                      <IoAdd className="w-5 h-5 mr-2" />
                      আয় আইটেম আপডেট করুন
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setFormData({
                      incometype_id: "",
                      name: "",
                      fund_id: "",
                      transaction_book_id: "",
                      transaction_number: "",
                      invoice_number: "",
                      income_date: "",
                      amount: "",
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
            {(updateError || fundError) && (
              <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-scaleIn">
                {fundError && (
                  <p id="fund-error">তহবিল লোড করতে ত্রুটি: {JSON.stringify(fundError)}</p>
                )}
                {updateError && (
                  <p id="form-error">
                    ত্রুটি: {updateError?.status || "অজানা"} - {JSON.stringify(updateError?.data || {})}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Income Items Table */}
        {/* <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh]">
          {isItemsLoading ? (
            <p className="p-4 text-[#441a05]/70">লোড হচ্ছে...</p>
          ) : itemsError ? (
            <p className="p-4 text-red-400">
              আয় আইটেম লোড করতে ত্রুটি: {itemsError.status || "অজানা"} - {JSON.stringify(itemsError.data || {})}
            </p>
          ) : safeIncomeItems.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো আয় আইটেম উপলব্ধ নেই।</p>
          ) : (
            <IncomeItemsList 
              incomeItems={safeIncomeItems} 
              incomeHeads={incomeHeads} 
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
              {isDeleting ? "মুছছে..." : `আয় আইটেম মুছতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})}`}
            </div>
          )}
        </div> */}
      </div>
    );
};

export default IncomeItems;