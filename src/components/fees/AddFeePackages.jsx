import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";


import { 
  useGetFeePackagesQuery,
  useCreateFeePackageMutation,
  useUpdateFeePackageMutation,
  useDeleteFeePackageMutation
} from "../../redux/features/api/fee-packages/feePackagesApi";
import { useGetFeeHeadsQuery } from "../../redux/features/api/fee-heads/feeHeadsApi";
import { useGetClassListApiQuery } from "../../redux/features/api/class/classListApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";

const AddFeePackages = () => {
  const [formData, setFormData] = useState({
    fees_head_id: "",
    student_class: "",
    amount: "",
    academic_year: "",
  });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  const { data: feePackages = [], isLoading: isPackagesLoading, error: packagesError } = useGetFeePackagesQuery();
  const { data: feeHeads , isLoading: isHeadsLoading } = useGetFeeHeadsQuery();
  const { data: studentClasses = [], isLoading: isClassesLoading } = useGetClassListApiQuery();
  const { data: academicYears = [], isLoading: isYearsLoading } = useGetAcademicYearApiQuery();
  const [createFeePackage, { isLoading: isCreating, error: createError }] = useCreateFeePackageMutation();
  const [updateFeePackage, { isLoading: isUpdating, error: updateError }] = useUpdateFeePackageMutation();
  const [deleteFeePackage, { isLoading: isDeleting, error: deleteError }] = useDeleteFeePackageMutation();
console.log(feeHeads)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = ({ fees_head_id, student_class, amount, academic_year }) => {
    const errors = {};
    if (!fees_head_id) errors.fees_head_id = "Fee type is required";
    if (!student_class) errors.student_class = "Student class is required";
    if (!amount) errors.amount = "Amount is required";
    else if (parseFloat(amount) <= 0) errors.amount = "Amount must be greater than 0";
    if (!academic_year) errors.academic_year = "Academic year is required";

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
        fees_head_id: parseInt(formData.fees_head_id),
        student_class: parseInt(formData.student_class),
        amount: parseFloat(formData.amount),
        academic_year: parseInt(formData.academic_year),
        created_by: parseInt(localStorage.getItem("userId")) || 1,
      };

      await createFeePackage(payload).unwrap();
      alert("Fee package created successfully!");
      setFormData({
        fees_head_id: "",
        student_class: "",
        amount: "",
        academic_year: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Create error:", err);
      setErrors(err.data || {});
      alert(`Failed to create fee package: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setFormData({
      fees_head_id: item.fees_head_id.toString(),
      student_class: item.student_class.toString(),
      amount: item.amount,
      academic_year: item.academic_year.toString(),
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
        fees_head_id: parseInt(formData.fees_head_id),
        student_class: parseInt(formData.student_class),
        amount: parseFloat(formData.amount),
        academic_year: parseInt(formData.academic_year),
        updated_by: parseInt(localStorage.getItem("userId")) || 1,
      };

      await updateFeePackage(payload).unwrap();
      alert("Fee package updated successfully!");
      setEditId(null);
      setFormData({
        fees_head_id: "",
        student_class: "",
        amount: "",
        academic_year: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Update error:", err);
      setErrors(err.data || {});
      alert(`Failed to update fee package: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this fee package?")) {
      try {
        await deleteFeePackage(id).unwrap();
        alert("Fee package deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err);
        alert(`Failed to delete fee package: ${err.status || "Unknown"} - ${JSON.stringify(err.data || {})}`);
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

      {/* Form to Add/Edit Fee Package */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">{editId ? "Edit Fee Package" : "Add New Fee Package"}</h3>
        </div>
        <form onSubmit={editId ? handleUpdate : handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <select
              name="fees_head_id"
              value={formData.fees_head_id}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating || isUpdating || isHeadsLoading}
              required
              aria-describedby={errors.fees_head_id ? "fees_head_id-error" : undefined}
            >
              <option value="" disabled>Select Fee Type</option>
              {feeHeads?.map((head) => (
                <option key={head.id} value={head.id}>{head.name}</option>
              ))}
            </select>
            {errors.fees_head_id && (
              <p id="fees_head_id-error" className="text-red-400 text-sm mt-1">{errors.fees_head_id}</p>
            )}
          </div>
          <div>
            <select
              name="student_class"
              value={formData.student_class}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating || isUpdating || isClassesLoading}
              required
              aria-describedby={errors.student_class ? "student_class-error" : undefined}
            >
              <option value="" disabled>Select Student Class</option>
              {studentClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            {errors.student_class && (
              <p id="student_class-error" className="text-red-400 text-sm mt-1">{errors.student_class}</p>
            )}
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
                  {editId ? "Update Fee Package" : "Create Fee Package"}
                </>
              )}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setFormData({
                    fees_head_id: "",
                    student_class: "",
                    amount: "",
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

      {/* Fee Packages Table */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Fee Packages List</h3>
        {isPackagesLoading ? (
          <p className="p-4 text-[#441a05]/70">Loading...</p>
        ) : packagesError ? (
          <p className="p-4 text-red-400">Error: {packagesError.status || "Unknown"} - {JSON.stringify(packagesError.data || {})}</p>
        ) : feePackages.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">No fee packages available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Fee Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Student Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {feePackages.map((item, index) => (
                  <tr key={item.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {feeHeads?.find((head) => head.id === item.fees_head_id)?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {studentClasses.find((cls) => cls.id === item.student_class)?.name || item.student_class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {academicYears.find((year) => year.id === item.academic_year)?.name || item.academic_year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-[#441a05] hover:text-blue-500 mr-4 transition-all duration-300"
                        aria-label={`Edit fee package for class ${item.student_class}`}
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-[#441a05] hover:text-red-500 transition-all duration-300"
                        aria-label={`Delete fee package for class ${item.student_class}`}
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

export default AddFeePackages;