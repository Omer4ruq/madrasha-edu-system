import { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import {
  useCreateIncomeItemMutation,
  useDeleteIncomeItemMutation,
  useGetIncomeItemsQuery,
  useUpdateIncomeItemMutation,
} from "../../redux/features/api/income-items/incomeItemsApi";
import { useGetIncomeHeadsQuery } from "../../redux/features/api/income-heads/incomeHeadsApi";
import { useGetFundsQuery } from "../../redux/features/api/funds/fundsApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetTransactionBooksQuery } from "../../redux/features/api/transaction-books/transactionBooksApi";

const IncomeItems = () => {
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
  const [modalData, setModalData] = useState(null);

  const {
    data: incomeItems = [],
    isLoading: isItemsLoading,
    error: itemsError,
  } = useGetIncomeItemsQuery();
  const { data: incomeHeads = [], isLoading: isHeadsLoading } = useGetIncomeHeadsQuery();
  const { data: fundTypes = [], isLoading: isFundLoading, error: fundError } = useGetFundsQuery();
  const {
    data: academicYears = [],
    isLoading: isYearsLoading,
  } = useGetAcademicYearApiQuery();
  const {
    data: transactionBooks = [],
    isLoading: isBooksLoading,
  } = useGetTransactionBooksQuery();
  const [createIncomeItem, { isLoading: isCreating, error: createError }] = useCreateIncomeItemMutation();
  const [updateIncomeItem, { isLoading: isUpdating, error: updateError }] = useUpdateIncomeItemMutation();
  const [deleteIncomeItem, { isLoading: isDeleting, error: deleteError }] = useDeleteIncomeItemMutation();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
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

    return Object.keys(errors).length ? errors : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      if (formData.invoice_number) {
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

      if (formData.invoice_number) {
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
    setModalData({ id });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    const toastId = toast.loading("আয় আইটেম মুছে ফেলা হচ্ছে...");
    try {
      await deleteIncomeItem(modalData.id).unwrap();
      toast.success("আয় আইটেম সফলভাবে মুছে ফেলা হয়েছে!", { id: toastId });
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(
        `আয় আইটেম মুছে ফেলা ব্যর্থ: ${err.status || "অজানা"} - ${JSON.stringify(err.data || {})}`,
        { id: toastId }
      );
    } finally {
      setIsModalOpen(false);
      setModalData(null);
    }
  };

  const safeIncomeItems = Array.isArray(incomeItems) ? incomeItems : [];

  return (
    <div className="py-8 w-full">
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
          select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23441a05' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.5rem center;
            background-size: 1.5em;
          }
        `}
      </style>

      {/* Form to Add/Edit Income Item */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
            {editId ? "আয় আইটেম সম্পাদনা করুন" : "নতুন আয় আইটেম যোগ করুন"}
          </h3>
        </div>
        <form
          onSubmit={editId ? handleUpdate : handleSubmit}
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
          <div>
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
          </div>
          <div>
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
          </div>
          <div>
            <input
              type="text"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
              placeholder="ইনভয়েস নম্বর লিখুন"
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
            <input
              type="file"
              name="attach_doc"
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] text-sm pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
              disabled={isCreating || isUpdating}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              aria-label="ডকুমেন্ট সংযুক্ত করুন"
              aria-describedby={errors.attach_doc ? "attach_doc-error" : undefined}
            />
            {errors.attach_doc && (
              <p id="attach_doc-error" className="text-red-400 text-sm mt-1">
                {errors.attach_doc}
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
          <div className="md:col-span-2">
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
              aria-label={editId ? "আয় আইটেম আপডেট করুন" : "আয় আইটেম তৈরি করুন"}
            >
              {isCreating || isUpdating ? (
                <>
                  <FaSpinner className="animate-spin text-lg mr-2" />
                  {editId ? "আপডেট হচ্ছে..." : "তৈরি হচ্ছে..."}
                </>
              ) : (
                <>
                  <IoAdd className="w-5 h-5 mr-2" />
                  {editId ? "আয় আইটেম আপডেট করুন" : "আয় আইটেম তৈরি করুন"}
                </>
              )}
            </button>
            {editId && (
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
                aria-label="বাতিল করুন"
              >
                বাতিল
              </button>
            )}
          </div>
        </form>
        {(createError || updateError || fundError) && (
          <div
            className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-scaleIn"
          >
            {fundError && (
              <p id="fund-error">
                তহবিল লোড করতে ত্রুটি: {JSON.stringify(fundError)}
              </p>
            )}
            {(createError || updateError) && (
              <p id="form-error">
                ত্রুটি: {createError?.status || updateError?.status || "অজানা"} -{" "}
                {JSON.stringify(createError?.data || updateError?.data || {})}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Income Items Table */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
          আয় আইটেম তালিকা
        </h3>
        {isItemsLoading ? (
          <p className="p-4 text-[#441a05]/70 flex items-center">
            <FaSpinner className="animate-spin text-sm mr-2" />
            লোড হচ্ছে...
          </p>
        ) : itemsError ? (
          <p className="p-4 text-red-400 bg-red-500/10 rounded-lg">
            ত্রুটি: {itemsError.status || "অজানা"} -{" "}
            {JSON.stringify(itemsError.data || {})}
          </p>
        ) : safeIncomeItems.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">কোনো আয় আইটেম উপলব্ধ নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    আয়ের ধরণ
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
                    ইনভয়েস নম্বর
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
                    ক্রিয়া
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {safeIncomeItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="bg-white/5 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {incomeHeads.find((head) => head.id === item.incometype_id)?.incometype || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {item.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {fundTypes.find((fund) => fund.id === item.fund_id)?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {item.transaction_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {item.invoice_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {item.income_date || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {item.amount || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {academicYears.find((year) => year.id === item.academic_year)?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="text-[#441a05] hover:text-blue-500 transition-all duration-300"
                          aria-label={`সম্পাদনা করুন ${item.name || "আয় আইটেম"}`}
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-[#441a05] hover:text-red-500 transition-all duration-300"
                          aria-label={`মুছুন ${item.name || "আয় আইটেম"}`}
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(isDeleting || deleteError) && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-scaleIn">
            {isDeleting
              ? "মুছে ফেলা হচ্ছে..."
              : `ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})}`}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div
            className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
          >
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              আয় আইটেম মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই আয় আইটেমটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-all duration-300"
                aria-label="বাতিল"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-all duration-300 btn-glow"
                aria-label="নিশ্চিত করুন"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeItems;