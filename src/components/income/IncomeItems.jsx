import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { useCreateIncomeItemMutation, useDeleteIncomeItemMutation, useGetIncomeItemsQuery, useUpdateIncomeItemMutation } from "../../redux/features/api/income-items/incomeItemsApi";
import { useGetIncomeHeadsQuery } from "../../redux/features/api/income-heads/incomeHeadsApi";

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
    attach_doc: "",
    description: "",
    academic_year: "",
  });
  const [editId, setEditId] = useState(null);

  const { data: incomeItems = [], isLoading: isItemsLoading, error: itemsError } = useGetIncomeItemsQuery();
  const { data: incomeHeads = [], isLoading: isHeadsLoading } = useGetIncomeHeadsQuery();
  const [createIncomeItem, { isLoading: isCreating, error: createError }] = useCreateIncomeItemMutation();
  const [updateIncomeItem, { isLoading: isUpdating, error: updateError }] = useUpdateIncomeItemMutation();
  const [deleteIncomeItem, { isLoading: isDeleting, error: deleteError }] = useDeleteIncomeItemMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = ({ incometype_id, name, fund_id, transaction_book_id, transaction_number, invoice_number, income_date, amount, academic_year }) => {
    if (!incometype_id || !name || !fund_id || !transaction_book_id || !transaction_number || !invoice_number || !income_date || !amount || !academic_year) {
      return "Please fill all required fields";
    }
    if (isNaN(parseInt(incometype_id)) || isNaN(parseInt(fund_id)) || isNaN(parseInt(transaction_book_id)) || isNaN(parseInt(transaction_number)) || isNaN(parseInt(academic_year))) {
      return "Numeric fields must be valid numbers";
    }
    if (parseFloat(amount) <= 0) {
      return "Amount must be greater than 0";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm(formData);
    if (error) {
      alert(error);
      return;
    }
    try {
      const payload = {
        incometype_id: parseInt(formData.incometype_id),
        name: formData.name.trim(),
        fund_id: parseInt(formData.fund_id),
        transaction_book_id: parseInt(formData.transaction_book_id),
        transaction_number: parseInt(formData.transaction_number),
        invoice_number: formData.invoice_number.trim(),
        income_date: formData.income_date,
        amount: parseFloat(formData.amount), // Try number; revert to string if backend rejects
        attach_doc: formData.attach_doc.trim() || "",
        description: formData.description.trim() || "",
        academic_year: parseInt(formData.academic_year),
        created_by: 1, // Placeholder; replace with actual user ID
      };
      console.log("Create payload:", payload);
      await createIncomeItem(payload).unwrap();
      alert("Income item created successfully!");
      setFormData({
        incometype_id: "",
        name: "",
        fund_id: "",
        transaction_book_id: "",
        transaction_number: "",
        invoice_number: "",
        income_date: "",
        amount: "",
        attach_doc: "",
        description: "",
        academic_year: "",
      });
    } catch (err) {
      console.error("Create error:", err);
      alert(`Failed to create income item: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setFormData({
      incometype_id: item.incometype_id.toString(),
      name: item.name,
      fund_id: item.fund_id.toString(),
      transaction_book_id: item.transaction_book_id.toString(),
      transaction_number: item.transaction_number.toString(),
      invoice_number: item.invoice_number,
      income_date: item.income_date,
      amount: item.amount,
      attach_doc: item.attach_doc || "",
      description: item.description || "",
      academic_year: item.academic_year.toString(),
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const error = validateForm(formData);
    if (error) {
      alert(error);
      return;
    }
    try {
      const payload = {
        id: editId,
        incometype_id: parseInt(formData.incometype_id),
        name: formData.name.trim(),
        fund_id: parseInt(formData.fund_id),
        transaction_book_id: parseInt(formData.transaction_book_id),
        transaction_number: parseInt(formData.transaction_number),
        invoice_number: formData.invoice_number.trim(),
        income_date: formData.income_date,
        amount: parseFloat(formData.amount), // Try number; revert to string if backend rejects
        attach_doc: formData.attach_doc.trim() || "",
        description: formData.description.trim() || "",
        academic_year: parseInt(formData.academic_year),
        updated_by: 1, // Placeholder; replace with actual user ID
      };
      console.log("Update payload:", payload);
      await updateIncomeItem(payload).unwrap();
      alert("Income item updated successfully!");
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
        attach_doc: "",
        description: "",
        academic_year: "",
      });
    } catch (err) {
      console.error("Update error:", err);
      alert(`Failed to update income item: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income item?")) {
      try {
        await deleteIncomeItem(id).unwrap();
        alert("Income item deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err);
        alert(`Failed to delete income item: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
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

      {/* Form to Add/Edit Income Item */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">{editId ? "Edit Income Item" : "Add New Income Item"}</h3>
        </div>
        <form onSubmit={editId ? handleUpdate : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <select
            name="incometype_id"
            value={formData.incometype_id}
            onChange={handleChange}
            className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
            disabled={isCreating || isUpdating || isHeadsLoading}
            required
            aria-describedby={createError || updateError ? "form-error" : undefined}
          >
            <option value="" disabled>Select Income Type</option>
            {incomeHeads.map((head) => (
              <option key={head.id} value={head.id}>{head.incometype}</option>
            ))}
          </select>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
            placeholder="Enter name"
            disabled={isCreating || isUpdating}
            required
          />
          <input
            type="number"
            name="fund_id"
            value={formData.fund_id}
            onChange={handleChange}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
            placeholder="Enter fund ID"
            disabled={isCreating || isUpdating}
            required
          />
          <input
            type="number"
            name="transaction_book_id"
            value={formData.transaction_book_id}
            onChange={handleChange}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
            placeholder="Enter transaction book ID"
            disabled={isCreating || isUpdating}
            required
          />
          <input
            type="number"
            name="transaction_number"
            value={formData.transaction_number}
            onChange={handleChange}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
            placeholder="Enter transaction number"
            disabled={isCreating || isUpdating}
            required
          />
          <input
            type="text"
            name="invoice_number"
            value={formData.invoice_number}
            onChange={handleChange}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
            placeholder="Enter invoice number"
            disabled={isCreating || isUpdating}
            required
          />
          <input
            type="date"
            name="income_date"
            value={formData.income_date}
            onChange={handleChange}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
            disabled={isCreating || isUpdating}
            required
          />
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
          />
          <input
            type="text"
            name="attach_doc"
            value={formData.attach_doc}
            onChange={handleChange}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
            placeholder="Enter document link (optional)"
            disabled={isCreating || isUpdating}
          />
          <input
            type="number"
            name="academic_year"
            value={formData.academic_year}
            onChange={handleChange}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
            placeholder="Enter academic year"
            disabled={isCreating || isUpdating}
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 md:col-span-2"
            placeholder="Enter description (optional)"
            disabled={isCreating || isUpdating}
            rows="3"
          />
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
                  {editId ? "Update Income Item" : "Create Income Item"}
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
                    attach_doc: "",
                    description: "",
                    academic_year: "",
                  });
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

      {/* Income Items Table */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Income Items List</h3>
        {isItemsLoading ? (
          <p className="p-4 text-[#441a05]/70">Loading...</p>
        ) : itemsError ? (
          <p className="p-4 text-red-400">Error: {itemsError.status || "Unknown"} - {JSON.stringify(itemsError.data || {})}</p>
        ) : incomeItems.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">No income items available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Income Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Fund ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Transaction #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {incomeItems.map((item, index) => (
                  <tr key={item.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {incomeHeads.find((head) => head.id === item.incometype_id)?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.fund_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.transaction_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.invoice_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.income_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.academic_year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        aria-label={`Edit ${item.name}`}
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
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

export default IncomeItems;