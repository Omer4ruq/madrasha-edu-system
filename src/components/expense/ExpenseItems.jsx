import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import {
  useCreateExpenseItemMutation,
  useDeleteExpenseItemMutation,
  useGetExpenseItemsQuery,
  useUpdateExpenseItemMutation,
} from "../../redux/features/api/expense-items/expenseItemsApi";
import { useGetFundsQuery } from "../../redux/features/api/funds/fundsApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetTransactionBooksQuery } from "../../redux/features/api/transaction-books/transactionBooksApi";
import { useGetExpenseHeadsQuery } from "../../redux/features/api/expense-heads/expenseHeadsApi";

const ExpenseItems = () => {
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
  const itemsPerPage = 10;

  const { data: expenseTypes = [], isLoading: isTypesLoading } = useGetExpenseHeadsQuery();
  const { data: fundTypes = [], isLoading: isFundLoading, error: fundError } = useGetFundsQuery();
  const { data: academicYears = [], isLoading: isYearsLoading } = useGetAcademicYearApiQuery();
  const { data: transactionBooks = [], isLoading: isBooksLoading } = useGetTransactionBooksQuery();
  const { 
    data: expenseData, 
    isLoading: isItemsLoading, 
    error: itemsError 
  } = useGetExpenseItemsQuery(currentPage);
  
  const expenseItems = expenseData?.items || [];
  const totalItems = expenseData?.count || 0;
  const hasNext = !!expenseData?.next;
  const hasPrevious = !!expenseData?.previous;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [createExpenseItem, { isLoading: isCreating, error: createError }] = useCreateExpenseItemMutation();
  const [updateExpenseItem, { isLoading: isUpdating, error: updateError }] = useUpdateExpenseItemMutation();
  const [deleteExpenseItem, { isLoading: isDeleting, error: deleteError }] = useDeleteExpenseItemMutation();

  console.log("expenseData:", expenseData);
  console.log("expenseItems:", expenseItems);
  console.log("totalItems:", totalItems, "currentPage:", currentPage);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
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

      console.log("Create payload:", payload);
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
      console.error("Create error:", err);
      setErrors(err.data || {});
      toast.error(`ব্যয় আইটেম তৈরি ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    }
  };

  const handleEditClick = (item) => {
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

      console.log("Update payload:", payload);
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
    } catch (err) {
      console.error("Update error:", err);
      setErrors(err.data || {});
      toast.error(`ব্যয় আইটেম আপডেট ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    }
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
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(`ব্যয় আইটেম মুছতে ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
      setIsModalOpen(false);
      setDeleteItemId(null);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  return (
    <div className="py-8 w-full relative">
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: "#DB9E30", color: "#441a05" } }}
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
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
          }
          ::-webkit-scrollbar {
            width: 8px;
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
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${
                  isDeleting
                    ? "cursor-not-allowed opacity-60"
                    : "hover:text-white"
                }`}
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
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">{editId ? "ব্যয় আইটেম সম্পাদনা করুন" : "নতুন ব্যয় আইটেম যোগ করুন"}</h3>
        </div>
        <form onSubmit={editId ? handleUpdate : handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <select
              name="expensetype_id"
              value={formData.expensetype_id}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating || isUpdating || isTypesLoading}
              required
              aria-describedby={errors.expensetype_id ? "expensetype_id-error" : undefined}
            >
              <option value="" disabled>ব্যয়ের ধরন নির্বাচন করুন</option>
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
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
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
              className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating || isUpdating || isFundLoading}
              required
              aria-describedby={errors.fund_id ? "fund_id-error" : undefined}
            >
              <option value="" disabled>ফান্ড নির্বাচন করুন</option>
              {fundTypes.map((fund) => (
                <option key={fund.id} value={fund.id}>{fund.name}</option>
              ))}
            </select>
            {errors.fund_id && <p id="fund_id-error" className="text-red-400 text-sm mt-1">{errors.fund_id}</p>}
          </div>
          <div>
            <select
              name="transaction_book_id"
              value={formData.transaction_book_id}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating || isUpdating || isBooksLoading}
              aria-describedby={errors.transaction_book_id ? "transaction_book_id-error" : undefined}
            >
              <option value="" disabled>লেনদেন বই নির্বাচন করুন</option>
              {transactionBooks.map((book) => (
                <option key={book.id} value={book.id}>{book.name}</option>
              ))}
            </select>
            {errors.transaction_book_id && (
              <p id="transaction_book_id-error" className="text-red-400 text-sm mt-1">{errors.transaction_book_id}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              name="transaction_number"
              value={formData.transaction_number}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="লেনদেন নম্বর লিখুন"
              disabled={isCreating || isUpdating}
              aria-describedby={errors.transaction_number ? "transaction_number-error" : undefined}
            />
            {errors.transaction_number && (
              <p id="transaction_number-error" className="text-red-400 text-sm mt-1">{errors.transaction_number}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
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
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
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
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="পরিমাণ লিখুন"
              disabled={isCreating || isUpdating}
              required
              step="0.01"
              aria-describedby={errors.amount ? "amount-error" : undefined}
            />
            {errors.amount && <p id="amount-error" className="text-red-400 text-sm mt-1">{errors.amount}</p>}
          </div>
          <div>
            <input
              type="file"
              name="attach_doc"
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] text-sm pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating || isUpdating}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              aria-describedby={errors.attach_doc ? "attach_doc-error" : undefined}
            />
            {errors.attach_doc && <p id="attach_doc-error" className="text-red-400 text-sm mt-1">{errors.attach_doc}</p>}
          </div>
          <div>
            <select
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating || isUpdating || isYearsLoading}
              required
              aria-describedby={errors.academic_year ? "academic_year-error" : undefined}
            >
              <option value="" disabled>শিক্ষাবর্ষ নির্বাচন করুন</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>{year.name}</option>
              ))}
            </select>
            {errors.academic_year && (
              <p id="academic_year-error" className="text-red-400 text-sm mt-1">{errors.academic_year}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
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
                isCreating || isUpdating ? "cursor-not-allowed opacity-70" : "hover:text-white hover:shadow-md"
              }`}
            >
              {isCreating || isUpdating ? (
                <>
                  <FaSpinner className="animate-spin text-lg mr-2" />
                  {editId ? "আপডেট হচ্ছে..." : "তৈরি হচ্ছে..."}
                </>
              ) : (
                <>
                  <IoAdd className="w-5 h-5 mr-2" />
                  {editId ? "ব্যয় আইটেম আপডেট করুন" : "ব্যয় আইটেম তৈরি করুন"}
                </>
              )}
            </button>
            {editId && (
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
                className="flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            )}
          </div>
        </form>
        {(createError || updateError) && (
          <div id="form-error" className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            ত্রুটি: {createError?.status || updateError?.status || "অজানা"} - {JSON.stringify(createError?.data || updateError?.data || {})}
          </div>
        )}
      </div>

      {/* ব্যয় আইটেম তালিকা */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">ব্যয় আইটেম তালিকা</h3>
        {isItemsLoading ? (
          <p className="p-4 text-[#441a05]/70">লোড হচ্ছে...</p>
        ) : itemsError ? (
          <p className="p-4 text-red-400">ত্রুটি: {itemsError.status || "অজানা"} - {JSON.stringify(itemsError.data || {})}</p>
        ) : expenseItems.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">কোনো ব্যয় আইটেম পাওয়া যায়নি।</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ব্যয়ের ধরন</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">নাম</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ফান্ড</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">লেনদেন নম্বর</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">কর্মচারী আইডি</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">তারিখ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">পরিমাণ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">শিক্ষাবর্ষ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {expenseItems.map((item, index) => (
                    <tr key={item.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {expenseTypes.find((type) => type.id === item.expensetype_id)?.expensetype || "অজানা"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {fundTypes.find((fund) => fund.id === item.fund_id)?.name || item.fund_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.transaction_number || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.employee_id || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.expense_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {academicYears.find((year) => year.id === item.academic_year)?.name || item.academic_year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEditClick(item)}
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
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-[#441a05]/70">
                {totalItems} আইটেমের মধ্যে {(currentPage - 1) * itemsPerPage + 1} থেকে {Math.min(currentPage * itemsPerPage, totalItems)} দেখানো হচ্ছে
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevious}
                  className={`px-4 py-2 rounded-lg text-[#441a05] transition-all duration-300 ${
                    hasPrevious ? "bg-[#DB9E30] hover:text-white" : "bg-gray-500 cursor-not-allowed opacity-50"
                  }`}
                >
                  পূর্ববর্তী
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      currentPage === page ? "bg-[#DB9E30] text-white" : "bg-gray-500 text-[#441a05] hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                  className={`px-4 py-2 rounded-lg text-[#441a05] transition-all duration-300 ${
                    hasNext ? "bg-[#DB9E30] hover:text-white" : "bg-gray-500 cursor-not-allowed opacity-50"
                  }`}
                >
                  পরবর্তী
                </button>
              </div>
            </div>
          </>
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

export default ExpenseItems;