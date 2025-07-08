import React, { useState } from "react";
import { FaEdit, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import {
  useCreateGradeRuleMutation,
  useDeleteGradeRuleMutation,
  useGetGradeRulesQuery,
  useUpdateGradeRuleMutation,
} from "../../redux/features/api/result/gradeRuleApi";

const ResultConfig = () => {
  const [newGrade, setNewGrade] = useState({
    grade_name: "",
    grade_name_op: "",
    gpa: "",
    min_mark: "",
    max_mark: "",
    remarks: "",
  });
  const [editGradeId, setEditGradeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // API hooks
  const {
    data: grades,
    isLoading: gradesLoading,
    error: gradesError,
    refetch,
  } = useGetGradeRulesQuery();
  const [createGradeRule, { isLoading: isCreating, error: createError }] =
    useCreateGradeRuleMutation();
  const [updateGradeRule, { isLoading: isUpdating, error: updateError }] =
    useUpdateGradeRuleMutation();
  const [deleteGradeRule, { isLoading: isDeleting, error: deleteError }] =
    useDeleteGradeRuleMutation();

  const validateGrade = (grade) => {
    if (!grade.grade_name.trim() || !grade.grade_name_op.trim()) {
      toast.error("গ্রেড নাম এবং গ্রেড কোড পূরণ করুন!");
      return false;
    }
    const gpaNum = Number(grade.gpa);
    const minNum = Number(grade.min_mark);
    const maxNum = Number(grade.max_mark);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 5) {
      toast.error("GPA ০ থেকে ৫ এর মধ্যে হতে হবে!");
      return false;
    }
    if (
      isNaN(minNum) ||
      isNaN(maxNum) ||
      minNum < 0 ||
      maxNum < 0 ||
      minNum > maxNum
    ) {
      toast.error(
        "সর্বনিম্ন এবং সর্বোচ্চ মান বৈধ হতে হবে এবং সর্বনিম্ন ≤ সর্বোচ্চ!"
      );
      return false;
    }
    if (
      grades?.some(
        (g) =>
          g.grade_name.toLowerCase() === grade.grade_name.toLowerCase() &&
          g.id !== editGradeId
      )
    ) {
      toast.error("এই গ্রেড নাম ইতিমধ্যে বিদ্যমান!");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const gradeData = {
      id: editGradeId,
      grade_name: newGrade.grade_name.trim(),
      grade_name_op: newGrade.grade_name_op.trim(),
      gpa: Number(newGrade.gpa),
      min_mark: Number(newGrade.min_mark),
      max_mark: Number(newGrade.max_mark),
      remarks: newGrade.remarks.trim(),
    };
    if (!validateGrade(gradeData)) return;

    setModalAction(editGradeId ? "update" : "create");
    setModalData(gradeData);
    setIsModalOpen(true);
  };

  const handleEditClick = (grade) => {
    setEditGradeId(grade.id);
    setNewGrade({
      grade_name: grade.grade_name,
      grade_name_op: grade.grade_name_op,
      gpa: grade.gpa.toString(),
      min_mark: grade.min_mark.toString(),
      max_mark: grade.max_mark.toString(),
      remarks: grade.remarks || "",
    });
  };

  const handleDelete = (id) => {
    setModalAction("delete");
    setModalData({ id });
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        await createGradeRule(modalData).unwrap();
        toast.success("গ্রেড সফলভাবে তৈরি করা হয়েছে!");
        setNewGrade({
          grade_name: "",
          grade_name_op: "",
          gpa: "",
          min_mark: "",
          max_mark: "",
          remarks: "",
        });
      } else if (modalAction === "update") {
        await updateGradeRule(modalData).unwrap();
        toast.success("গ্রেড সফলভাবে আপডেট করা হয়েছে!");
        setEditGradeId(null);
        setNewGrade({
          grade_name: "",
          grade_name_op: "",
          gpa: "",
          min_mark: "",
          max_mark: "",
          remarks: "",
        });
      } else if (modalAction === "delete") {
        await deleteGradeRule(modalData.id).unwrap();
        toast.success("গ্রেড সফলভাবে মুছে ফেলা হয়েছে!");
      }
      refetch();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(
        `ত্রুটি ${
          modalAction === "create"
            ? "তৈরি করা"
            : modalAction === "update"
            ? "আপডেট"
            : "মুছে ফেলা"
        }:`,
        err
      );
      toast.error(
        `গ্রেড ${
          modalAction === "create"
            ? "তৈরি"
            : modalAction === "update"
            ? "আপডেট"
            : "মুছে ফেলা"
        } ব্যর্থ: ${err.status || "অজানা"} - ${JSON.stringify(err.data || {})}`
      );
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
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

      <div>
        {/* Add/Edit Grade Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            {editGradeId ? (
              <FaEdit className="text-4xl text-[#441a05]" />
            ) : (
              <IoAddCircle className="text-4xl text-[#441a05]" />
            )}
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              {editGradeId ? "গ্রেড সম্পাদনা করুন" : "নতুন গ্রেড যোগ করুন"}
            </h3>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <input
              type="text"
              value={newGrade.grade_name}
              onChange={(e) =>
                setNewGrade({ ...newGrade, grade_name: e.target.value })
              }
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="গ্রেড নাম (বাংলা)"
              aria-label="গ্রেড নাম"
              title="গ্রেড নাম লিখুন (উদাহরণ: পাস)"
              disabled={isCreating || isUpdating}
            />
            <input
              type="text"
              value={newGrade.grade_name_op}
              onChange={(e) =>
                setNewGrade({ ...newGrade, grade_name_op: e.target.value })
              }
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="গ্রেড কোড (A+)"
              aria-label="গ্রেড কোড"
              title="গ্রেড কোড লিখুন (উদাহরণ: A+)"
              disabled={isCreating || isUpdating}
            />
            <input
              type="number"
              value={newGrade.gpa}
              onChange={(e) =>
                setNewGrade({ ...newGrade, gpa: e.target.value })
              }
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="GPA (0-5)"
              aria-label="GPA"
              title="GPA লিখুন (উদাহরণ: ৫)"
              disabled={isCreating || isUpdating}
            />
            <input
              type="number"
              value={newGrade.min_mark}
              onChange={(e) =>
                setNewGrade({ ...newGrade, min_mark: e.target.value })
              }
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="সর্বনিম্ন মার্ক"
              aria-label="সর্বনিম্ন মার্ক"
              title="সর্বনিম্ন মার্ক লিখুন (উদাহরণ: ৮০)"
              disabled={isCreating || isUpdating}
            />
            <input
              type="number"
              value={newGrade.max_mark}
              onChange={(e) =>
                setNewGrade({ ...newGrade, max_mark: e.target.value })
              }
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="সর্বোচ্চ মার্ক"
              aria-label="সর্বোচ্চ মার্ক"
              title="সর্বোচ্চ মার্ক লিখুন (উদাহরণ: ১০০)"
              disabled={isCreating || isUpdating}
            />
            <input
              type="text"
              value={newGrade.remarks}
              onChange={(e) =>
                setNewGrade({ ...newGrade, remarks: e.target.value })
              }
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="মন্তব্য"
              aria-label="মন্তব্য"
              title="মন্তব্য লিখুন (উদাহরণ: চমৎকার)"
              disabled={isCreating || isUpdating}
            />
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isCreating || isUpdating
                  ? "cursor-not-allowed"
                  : "hover:text-white btn-glow"
              }`}
              title={editGradeId ? "গ্রেড আপডেট করুন" : "গ্রেড তৈরি করুন"}
            >
              {isCreating || isUpdating ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>
                    {editGradeId ? "আপডেট করা হচ্ছে..." : "তৈরি করা হচ্ছে..."}
                  </span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  {editGradeId ? (
                    <FaEdit className="w-5 h-5" />
                  ) : (
                    <IoAddCircle className="w-5 h-5" />
                  )}
                  <span>
                    {editGradeId ? "গ্রেড আপডেট করুন" : "গ্রেড তৈরি করুন"}
                  </span>
                </span>
              )}
            </button>
            {editGradeId && (
              <button
                type="button"
                onClick={() => {
                  setEditGradeId(null);
                  setNewGrade({
                    grade_name: "",
                    grade_name_op: "",
                    gpa: "",
                    min_mark: "",
                    max_mark: "",
                    remarks: "",
                  });
                }}
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-white transition-all duration-300 animate-scaleIn"
                title="সম্পাদনা বাতিল করুন"
              >
                বাতিল
              </button>
            )}
          </form>
          {(createError || updateError) && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              ত্রুটি: {(createError || updateError).status || "অজানা"} -{" "}
              {JSON.stringify((createError || updateError).data || {})}
            </div>
          )}
        </div>

        {/* Grades Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
            বর্তমান গ্রেড তালিকা
          </h3>
          {gradesLoading ? (
            <p className="p-4 text-[#441a05]/70">গ্রেড লোড হচ্ছে...</p>
          ) : gradesError ? (
            <p className="p-4 text-red-400">
              গ্রেড লোড করতে ত্রুটি: {gradesError.status || "অজানা"} -{" "}
              {JSON.stringify(gradesError.data || {})}
            </p>
          ) : grades?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো গ্রেড যোগ করা হয়নি।</p>
          ) : (
            <div className="overflow-x-auto" key={refreshKey}>
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      গ্রেড নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      গ্রেড কোড
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      GPA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      সর্বনিম্ন মার্ক
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      সর্বোচ্চ মার্ক
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      মন্তব্য
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রিয়াকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {grades?.map((grade, index) => (
                    <tr
                      key={grade.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {grade.grade_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {grade.grade_name_op}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {grade.gpa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {grade.min_mark}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {grade.max_mark}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {grade.remarks || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(grade)}
                          title="গ্রেড সম্পাদনা করুন"
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(grade.id)}
                          title="গ্রেড মুছুন"
                          className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
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
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              {isDeleting
                ? "গ্রেড মুছে ফেলা হচ্ছে..."
                : `গ্রেড মুছে ফেলতে ত্রুটি: ${
                    deleteError?.status || "অজানা"
                  } - ${JSON.stringify(deleteError?.data || {})}`}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border-t border-white/20 animate-slideUp">
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === "create" && "নতুন গ্রেড নিশ্চিত করুন"}
                {modalAction === "update" && "গ্রেড আপডেট নিশ্চিত করুন"}
                {modalAction === "delete" && "গ্রেড মুছে ফেলা নিশ্চিত করুন"}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === "create" &&
                  "আপনি কি নিশ্চিত যে নতুন গ্রেড তৈরি করতে চান?"}
                {modalAction === "update" &&
                  "আপনি কি নিশ্চিত যে গ্রেড আপডেট করতে চান?"}
                {modalAction === "delete" &&
                  "আপনি কি নিশ্চিত যে এই গ্রেডটি মুছে ফেলতে চান?"}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultConfig;
