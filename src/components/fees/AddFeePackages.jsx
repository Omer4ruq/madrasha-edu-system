import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { toast, Toaster } from "react-hot-toast";

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
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data: feePackages = [], isLoading: isPackagesLoading, error: packagesError } = useGetFeePackagesQuery();
  const { data: feeHeads, isLoading: isHeadsLoading } = useGetFeeHeadsQuery();
  const { data: studentClasses = [], isLoading: isClassesLoading } = useGetClassListApiQuery();
  const { data: academicYears = [], isLoading: isYearsLoading } = useGetAcademicYearApiQuery();
  const [createFeePackage, { isLoading: isCreating, error: createError }] = useCreateFeePackageMutation();
  const [updateFeePackage, { isLoading: isUpdating, error: updateError }] = useUpdateFeePackageMutation();
  const [deleteFeePackage, { isLoading: isDeleting, error: deleteError }] = useDeleteFeePackageMutation();

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
    if (!fees_head_id) errors.fees_head_id = "ফি প্রকার নির্বাচন করুন";
    if (!student_class) errors.student_class = "শ্রেণি নির্বাচন করুন";
    if (!amount) errors.amount = "পরিমাণ প্রবেশ করুন";
    else if (parseFloat(amount) <= 0) errors.amount = "পরিমাণ ০ এর চেয়ে বড় হতে হবে";
    if (!academic_year) errors.academic_year = "শিক্ষাবর্ষ নির্বাচন করুন";

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
      toast.success("ফি প্যাকেজ সফলভাবে তৈরি হয়েছে!");
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
      toast.error(`ফি প্যাকেজ তৈরি ব্যর্থ: ${err.status || "অজানা"}`);
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
      toast.success("ফি প্যাকেজ সফলভাবে আপডেট হয়েছে!");
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
      toast.error(`ফি প্যাকেজ আপডেট ব্যর্থ: ${err.status || "অজানা"}`);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteFeePackage(deleteId).unwrap();
      toast.success("ফি প্যাকেজ সফলভাবে মুছে ফেলা হয়েছে!");
      setShowModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(`ফি প্যাকেজ মুছতে ব্যর্থ: ${err.status || "অজানা"}`);
      setShowModal(false);
      setDeleteId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDeleteId(null);
  };

  return (
    <div className="py-8 w-full">
      <Toaster position="top-right" />
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
          .btn-glow:hover { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
        `}
      </style>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              ফি প্যাকেজ মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই ফি প্যাকেজটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${
                  isDeleting ? "cursor-not-allowed opacity-60" : "hover:text-white"
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

      {/* Form to Add/Edit Fee Package */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">{editId ? "ফি প্যাকেজ সম্পাদনা" : "নতুন ফি প্যাকেজ যোগ"}</h3>
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
              <option value="" disabled>ফি প্রকার নির্বাচন করুন</option>
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
              <option value="" disabled>শ্রেণি নির্বাচন করুন</option>
              {studentClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.student_class.name}</option>
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
              placeholder="পরিমাণ প্রবেশ করুন"
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
              <option value="" disabled>শিক্ষাবর্ষ নির্বাচন করুন</option>
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
              className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${isCreating || isUpdating ? "cursor-not-allowed opacity-70" : "hover:text-white hover:shadow-md"}`}
            >
              {isCreating || isUpdating ? (
                <>
                  <FaSpinner className="animate-spin text-lg mr-2" />
                  {editId ? "আপডেট হচ্ছে..." : "তৈরি হচ্ছে..."}
                </>
              ) : (
                <>
                  <IoAdd className="w-5 h-5 mr-2" />
                  {editId ? "ফি প্যাকেজ আপডেট" : "ফি প্যাকেজ তৈরি"}
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

      {/* Fee Packages Table */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">ফি প্যাকেজ তালিকা</h3>
        {isPackagesLoading ? (
          <p className="p-4 text-[#441a05]/70">লোড হচ্ছে...</p>
        ) : packagesError ? (
          <p className="p-4 text-red-400">ত্রুটি: {packagesError.status || "অজানা"} - {JSON.stringify(packagesError.data || {})}</p>
        ) : feePackages.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">কোনো ফি প্যাকেজ উপলব্ধ নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ফি প্রকার</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">শ্রেণি</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">পরিমাণ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">শিক্ষাবর্ষ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ক্রিয়াকলাপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {feePackages.map((item, index) => (
                  <tr key={item.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {feeHeads?.find((head) => head.id === item.fees_head_id)?.name || "অজানা"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {studentClasses.find((cls) => cls.id === item.student_class)?.student_class?.name || "অজানা"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{item.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {academicYears.find((year) => year.id === item.academic_year)?.name || "অজানা"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-[#441a05] hover:text-blue-500 mr-4 transition-all duration-300"
                        aria-label={`শ্রেণির জন্য ফি প্যাকেজ সম্পাদনা ${item.student_class}`}
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-[#441a05] hover:text-red-500 transition-all duration-300"
                        aria-label={`শ্রেণির জন্য ফি প্যাকেজ মুছুন ${item.student_class}`}
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
            {isDeleting ? "মুছছে..." : `ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFeePackages;