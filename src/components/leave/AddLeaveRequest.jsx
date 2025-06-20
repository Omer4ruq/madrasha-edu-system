import React, { useState } from "react";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import { toast, Toaster } from "react-hot-toast";
import {
  useSearchJointUsersQuery,
} from "../../redux/features/api/jointUsers/jointUsersApi";
import {
  useCreateLeaveRequestApiMutation,
  useGetLeaveRequestApiQuery,
  useDeleteLeaveRequestApiMutation,
} from "../../redux/features/api/leave/leaveRequestApi";
import { useGetLeaveApiQuery } from "../../redux/features/api/leave/leaveApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";

const AddLeaveRequest = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    start_date: "",
    end_date: "",
    leave_type: "",
    leave_description: "",
    academic_year: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // API Hooks
  const { data: users = [], isLoading: usersLoading } = useSearchJointUsersQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });
  const { data: leaveTypes = [], isLoading: leaveTypesLoading, error: leaveTypesError } = useGetLeaveApiQuery();
  const { data: academicYears = [], isLoading: academicYearsLoading, error: academicYearsError } = useGetAcademicYearApiQuery();
  const { data: leaveRequests = [], isLoading: leaveRequestsLoading, error: leaveRequestsError } = useGetLeaveRequestApiQuery();
  const [createLeaveRequestApi, { isLoading: isCreating, error: createError }] = useCreateLeaveRequestApiMutation();
  const [deleteLeaveRequestApi, { isLoading: isDeleting, error: deleteError }] = useDeleteLeaveRequestApiMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormData((prev) => ({
      ...prev,
      user_id: user.id.toString(),
    }));
    setSearchTerm(`${user.name} (${user?.student_profile?.class_name})`);
    setShowDropdown(false);
    setErrors((prev) => ({ ...prev, user_id: null }));
  };

  const validateForm = ({ user_id, start_date, end_date, leave_type, leave_description, academic_year }) => {
    const errors = {};
    if (!user_id) errors.user_id = "ইউজার নির্বাচন করুন";
    if (!start_date) errors.start_date = "শুরুর তারিখ নির্বাচন করুন";
    if (!end_date) errors.end_date = "শেষের তারিখ নির্বাচন করুন";
    if (!leave_type) errors.leave_type = "ছুটির ধরন নির্বাচন করুন";
    if (!leave_description) errors.leave_description = "বিবরণ প্রবেশ করুন";
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
        user_id: parseInt(formData.user_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        leave_type: parseInt(formData.leave_type),
        leave_description: formData.leave_description,
        academic_year: parseInt(formData.academic_year),
        status: "Pending", // Changed to lowercase 'pending' to match assumed backend choice
        created_by: parseInt(localStorage.getItem("userId")) || 1,
      };

      await createLeaveRequestApi(payload).unwrap();
      toast.success("ছুটির আবেদন সফলভাবে জমা হয়েছে!");
      setFormData({
        user_id: "",
        start_date: "",
        end_date: "",
        leave_type: "",
        leave_description: "",
        academic_year: "",
      });
      setSearchTerm("");
      setSelectedUser(null);
      setShowDropdown(false);
      setErrors({});
    } catch (err) {
      console.error("Create error:", err);
      setErrors(err.data || {});
      toast.error(`ছুটির আবেদন জমা ব্যর্থ: ${err.status || "অজানা"}`);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteLeaveRequestApi(deleteId).unwrap();
      toast.success("ছুটির আবেদন সফলভাবে মুছে ফেলা হয়েছে!");
      setShowModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(`ছুটির আবেদন মুছতে ব্যর্থ: ${err.status || "অজানা"}`);
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
              ছুটির আবেদন মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই ছুটির আবেদনটি মুছে ফেলতে চান?
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

      {/* Form to Add Leave Request */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">নতুন ছুটির আবেদন যোগ</h3>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label htmlFor="user_id" className="block text-sm font-medium text-[#441a05] mb-1">
              ইউজার
            </label>
            <div className="relative">
              <input
                id="user_id"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(e.target.value.length >= 3);
                  if (!e.target.value) {
                    setSelectedUser(null);
                    setFormData((prev) => ({ ...prev, user_id: "" }));
                  }
                }}
                placeholder="ইউজার খুঁজুন (অন্তত ৩টি অক্ষর)"
                className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
                disabled={isCreating}
                aria-describedby={errors.user_id ? "user_id-error" : undefined}
              />
              {showDropdown && searchTerm.length >= 3 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-[#9d9087] rounded-md shadow-lg max-h-60 overflow-auto">
                  {usersLoading ? (
                    <div className="p-2 text-[#441a05] flex items-center space-x-2">
                      <FaSpinner className="animate-spin text-lg" />
                      <span>ইউজার লোড হচ্ছে...</span>
                    </div>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="p-2 text-[#441a05] bg-white hover:bg-[#DB9E30] cursor-pointer"
                      >
                        {user.name} ({user?.student_profile?.class_name})
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-[#441a05]">কোনো ইউজার পাওয়া যায়নি</div>
                  )}
                </div>
              )}
            </div>
            {errors.user_id && (
              <p id="user_id-error" className="text-red-400 text-sm mt-1">{errors.user_id}</p>
            )}
          </div>
          <div>
            <label htmlFor="leave_type" className="block text-sm font-medium text-[#441a05] mb-1">
              ছুটির ধরন
            </label>
            <select
              id="leave_type"
              name="leave_type"
              value={formData.leave_type}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating || leaveTypesLoading}
              required
              aria-describedby={errors.leave_type ? "leave_type-error" : undefined}
            >
              <option value="" disabled>ছুটির ধরন নির্বাচন করুন</option>
              {leaveTypesLoading ? (
                <option>লোড হচ্ছে...</option>
              ) : leaveTypesError ? (
                <option>ছুটির ধরন লোডে ত্রুটি</option>
              ) : (
                leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))
              )}
            </select>
            {errors.leave_type && (
              <p id="leave_type-error" className="text-red-400 text-sm mt-1">{errors.leave_type}</p>
            )}
          </div>
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-[#441a05] mb-1">
              শুরুর তারিখ
            </label>
            <input
              id="start_date"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating}
              required
              aria-describedby={errors.start_date ? "start_date-error" : undefined}
            />
            {errors.start_date && (
              <p id="start_date-error" className="text-red-400 text-sm mt-1">{errors.start_date}</p>
            )}
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-[#441a05] mb-1">
              শেষের তারিখ
            </label>
            <input
              id="end_date"
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating}
              required
              aria-describedby={errors.end_date ? "end_date-error" : undefined}
            />
            {errors.end_date && (
              <p id="end_date-error" className="text-red-400 text-sm mt-1">{errors.end_date}</p>
            )}
          </div>
          <div>
            <label htmlFor="academic_year" className="block text-sm font-medium text-[#441a05] mb-1">
              শিক্ষাবর্ষ
            </label>
            <select
              id="academic_year"
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              disabled={isCreating || academicYearsLoading}
              required
              aria-describedby={errors.academic_year ? "academic_year-error" : undefined}
            >
              <option value="" disabled>শিক্ষাবর্ষ নির্বাচন করুন</option>
              {academicYearsLoading ? (
                <option>লোড হচ্ছে...</option>
              ) : academicYearsError ? (
                <option>শিক্ষাবর্ষ লোডে ত্রুটি</option>
              ) : (
                academicYears.map((year) => (
                  <option key={year.id} value={year.id}>{year.name}</option>
                ))
              )}
            </select>
            {errors.academic_year && (
              <p id="academic_year-error" className="text-red-400 text-sm mt-1">{errors.academic_year}</p>
            )}
          </div>
          <div className="md:col-span-3">
            <label htmlFor="leave_description" className="block text-sm font-medium text-[#441a05] mb-1">
              বিবরণ
            </label>
            <textarea
              id="leave_description"
              name="leave_description"
              value={formData.leave_description}
              onChange={handleChange}
              className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300"
              rows="4"
              placeholder="বিবরণ প্রবেশ করুন"
              disabled={isCreating}
              required
              aria-describedby={errors.leave_description ? "leave_description-error" : undefined}
            />
            {errors.leave_description && (
              <p id="leave_description-error" className="text-red-400 text-sm mt-1">{errors.leave_description}</p>
            )}
          </div>
          <div className="flex space-x-4 md:col-span-2">
            <button
              type="submit"
              disabled={isCreating}
              className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${isCreating ? "cursor-not-allowed opacity-70" : "hover:text-white hover:shadow-md"}`}
            >
              {isCreating ? (
                <>
                  <FaSpinner className="animate-spin text-lg mr-2" />
                  জমা হচ্ছে...
                </>
              ) : (
                <>
                  <IoAdd className="w-5 h-5 mr-2" />
                  ছুটির আবেদন জমা
                </>
              )}
            </button>
          </div>
        </form>
        {(createError || leaveTypesError || academicYearsError) && (
          <div id="form-error" className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            ত্রুটি: {createError?.status || leaveTypesError?.status || academicYearsError?.status || "অজানা"} - {JSON.stringify(createError?.data || leaveTypesError?.data || academicYearsError?.data || {})}
          </div>
        )}
      </div>

      {/* Leave Requests Table */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">জমাকৃত ছুটির আবেদনসমূহ</h3>
        {leaveRequestsLoading ? (
          <p className="p-4 text-[#441a05]/70">লোড হচ্ছে...</p>
        ) : leaveRequestsError ? (
          <p className="p-4 text-red-400">ত্রুটি: {leaveRequestsError.status || "অজানা"} - {JSON.stringify(leaveRequestsError.data || {})}</p>
        ) : leaveRequests.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">কোনো ছুটির আবেদন উপলব্ধ নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ইউজার</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ছুটির ধরন</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">শুরুর তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">শেষের তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">বিবরণ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">অবস্থা</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ক্রিয়াকলাপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {leaveRequests.map((request, index) => (
                  <tr key={request.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {request.user?.name || "অজানা"} ({request.user?.student_profile?.class_name || "অজানা"})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                      {leaveTypes.find((lt) => lt.id === request.leave_type)?.name || "অজানা"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{request.start_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{request.end_date}</td>
                    <td className="px-6 py-4 text-sm text-[#441a05]">{request.leave_description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">{request.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="text-[#441a05] hover:text-red-500 transition-all duration-300"
                        aria-label={`ছুটির আবেদন মুছুন ${request.id}`}
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

export default AddLeaveRequest;