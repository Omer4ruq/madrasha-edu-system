import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
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

  const { data: expenseTypes = [], isLoading: isTypesLoading } = useGetExpenseHeadsQuery();
  const { data: fundTypes = [], isLoading: isFundLoading, error: fundError } = useGetFundsQuery();
  const { data: academicYears = [], isLoading: isYearsLoading } = useGetAcademicYearApiQuery();
  const { data: transactionBooks = [], isLoading: isBooksLoading } = useGetTransactionBooksQuery();
  const { data: expenseItems = [], isLoading: isItemsLoading, error: itemsError } = useGetExpenseItemsQuery();
  const [createExpenseItem, { isLoading: isCreating, error: createError }] = useCreateExpenseItemMutation();
  const [updateExpenseItem, { isLoading: isUpdating, error: updateError }] = useUpdateExpenseItemMutation();
  const [deleteExpenseItem, { isLoading: isDeleting, error: deleteError }] = useDeleteExpenseItemMutation();

  console.log("expenseItems:", expenseItems);
  console.log("expenseTypes:", expenseTypes);
  console.log("fundTypes:", fundTypes);
  console.log("academicYears:", academicYears);
  console.log("transactionBooks:", transactionBooks);

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
    if (!expensetype_id) errors.expensetype_id = "Expense type is required";
    if (!name) errors.name = "Name is required";
    if (!fund_id) errors.fund_id = "Fund is required";
    if (!expense_date) errors.expense_date = "Expense date is required";
    if (!amount) errors.amount = "Amount is required";
    else if (parseFloat(amount) <= 0) errors.amount = "Amount must be greater than 0";
    if (!academic_year) errors.academic_year = "Academic year is required";
    
    // Validate transaction_book_id if provided
    if (transaction_book_id && (isNaN(parseInt(transaction_book_id)) || parseInt(transaction_book_id) <= 0)) {
      errors.transaction_book_id = "Transaction book ID must be a valid positive integer";
    }
    
    // Validate transaction_number if provided
    if (transaction_number && (isNaN(parseInt(transaction_number)) || parseInt(transaction_number) <= 0)) {
      errors.transaction_number = "Transaction number must be a valid positive integer";
    }

    // Validate employee_id if provided
    if (employee_id && !employee_id.trim()) {
      errors.employee_id = "Employee ID cannot be empty if provided";
    }

    return Object.keys(errors).length ? errors : null;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validateForm(formData);
  if (validationErrors) {
    setErrors(validationErrors);
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

    // Only include transaction_book_id if valid
    if (formData.transaction_book_id && !isNaN(parseInt(formData.transaction_book_id))) {
      payload.transaction_book_id = parseInt(formData.transaction_book_id);
    }

    // Only include transaction_number if valid
    if (formData.transaction_number && !isNaN(parseInt(formData.transaction_number))) {
      payload.transaction_number = parseInt(formData.transaction_number);
    }

    // Only include employee_id if provided
    if (formData.employee_id.trim()) {
      payload.employee_id = formData.employee_id.trim();
    }

    // Only include attach_doc if provided
    if (formData.attach_doc) {
      payload.attach_doc = formData.attach_doc;
    }

    console.log("Create payload:", payload);
    await createExpenseItem(payload).unwrap();
    alert("Expense item created successfully!");
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
    console.error("Create error:", err);
    setErrors(err.data || {});
    alert(`Failed to create expense item: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
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
      attach_doc: null, // File input cannot prefill
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

      // Only include transaction_book_id if valid
      if (formData.transaction_book_id && !isNaN(parseInt(formData.transaction_book_id))) {
        payload.transaction_book_id = parseInt(formData.transaction_book_id);
      }

      // Only include transaction_number if valid
      if (formData.transaction_number && !isNaN(parseInt(formData.transaction_number))) {
        payload.transaction_number = parseInt(formData.transaction_number);
      }

      // Only include employee_id if provided
      if (formData.employee_id.trim()) {
        payload.employee_id = formData.employee_id.trim();
      }

      // Only include attach_doc if provided
      if (formData.attach_doc) {
        payload.attach_doc = formData.attach_doc;
      }

      console.log("Update payload:", payload);
      await updateExpenseItem(payload).unwrap();
      alert("Expense item updated successfully!");
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
      alert(`Failed to update expense item: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense item?")) {
      try {
        await deleteExpenseItem(id).unwrap();
        alert("Expense item deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err);
        alert(`Failed to delete expense item: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
      }
    }
  };

  return (
    <div className="py-8 w-full">
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .btn-glow:hover { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
        `}
      </style>

      {/* Form to Add/Edit Expense Item */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">{editId ? "Edit Expense Item" : "Add New Expense Item"}</h3>
        </div>
        <form onSubmit={editId ? handleUpdate : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
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
              <option value="" disabled>Select Expense Type</option>
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
              placeholder="Enter name"
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
              <option value="" disabled>Select Fund Type</option>
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
              <option value="" disabled>Select Transaction Book</option>
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
              placeholder="Enter transaction number"
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
              placeholder="Enter employee ID (optional)"
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
              placeholder="Enter amount"
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
              <option value="" disabled>Select Academic Year</option>
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
              placeholder="Enter description (optional)"
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
                  {editId ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <IoAdd className="w-5 h-5 mr-2" />
                  {editId ? "Update Expense Item" : "Create Expense Item"}
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
                Cancel
              </button>
            )}
          </div>
        </form>
        {(createError || updateError) && (
          <div id="form-error" className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            Error: {createError?.status || updateError?.status || "Unknown"} - {JSON.stringify(createError?.data || updateError?.data || {})}
          </div>
        )}
      </div>

      {/* Expense Items Table */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Expense Items List</h3>
        {isItemsLoading ? (
          <p className="p-4 text-[#441a05]/70">Loading...</p>
        ) : itemsError ? (
          <p className="p-4 text-red-400">Error: {itemsError.status || "Unknown"} - {JSON.stringify(itemsError.data || {})}</p>
        ) : expenseItems.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">No expense items available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Expense Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Fund</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Transaction #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {expenseItems?.map((item, index) => (
                  <tr key={item.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {expenseTypes.find((type) => type.id === item.expensetype_id)?.expensetype || "Unknown"}
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
                        aria-label={`Edit ${item.name}`}
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-[#441a05] hover:text-red-500 transition-all duration-300"
                        aria-label={`Delete ${item.name}`}
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(isDeleting || deleteError) && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            {isDeleting ? "Deleting..." : `Error: ${deleteError?.status || "Unknown"} - ${JSON.stringify(deleteError?.data || {})}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseItems;