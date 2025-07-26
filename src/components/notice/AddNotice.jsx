import React, { useState, useRef } from "react";
import { FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import {
  useGetNoticesQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} from "../../redux/features/api/notice/noticeApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";

const AddNotice = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [newNotice, setNewNotice] = useState({
    notice_title: "",
    date: "",
    notice_description: "",
    expire_date: "",
    file_attached: null,
    academic_year: "",
    existing_file: null, // Store existing file URL for updates
  });
  const formRef = useRef(null);

  // API hooks
  const {
    data: notices,
    isLoading: noticesLoading,
    error: noticesError,
    refetch,
  } = useGetNoticesQuery();
  const {
    data: academicYears,
    isLoading: yearsLoading,
    error: yearsError,
  } = useGetAcademicYearApiQuery();
  const [createNotice, { isLoading: isCreating, error: createError }] =
    useCreateNoticeMutation();
  const [updateNotice, { isLoading: isUpdating, error: updateError }] =
    useUpdateNoticeMutation();
  const [deleteNotice, { isLoading: isDeleting, error: deleteError }] =
    useDeleteNoticeMutation();

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } =
    useGetGroupPermissionsQuery(group_id, {
      skip: !group_id,
    });

  // Permission checks
  const hasAddPermission =
    groupPermissions?.some((perm) => perm.codename === "add_notice") || false;
  const hasChangePermission =
    groupPermissions?.some((perm) => perm.codename === "change_notice") || false;
  const hasDeletePermission =
    groupPermissions?.some((perm) => perm.codename === "delete_notice") || false;
  const hasViewPermission =
    groupPermissions?.some((perm) => perm.codename === "view_notice") || false;

  // Handle form submission for adding new notice
  const handleSubmitNotice = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error("নোটিশ যোগ করার অনুমতি নেই।");
      return;
    }
    if (
      !newNotice.notice_title.trim() ||
      !newNotice.date ||
      !newNotice.notice_description.trim() ||
      !newNotice.expire_date ||
      !newNotice.academic_year ||
      !newNotice.file_attached
    ) {
      toast.error("অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন");
      return;
    }
    if (new Date(newNotice.expire_date) < new Date(newNotice.date)) {
      toast.error("মেয়াদ শেষের তারিখ প্রকাশের তারিখের আগে হতে পারে না");
      return;
    }
    if (
      notices?.some(
        (notice) =>
          notice.notice_title.toLowerCase() ===
            newNotice.notice_title.toLowerCase() &&
          notice.date === newNotice.date &&
          notice.academic_year === parseInt(newNotice.academic_year)
      )
    ) {
      toast.error("এই নোটিশ ইতিমধ্যে বিদ্যমান!");
      return;
    }

    const formData = new FormData();
    formData.append("notice_title", newNotice.notice_title.trim());
    formData.append("date", newNotice.date);
    formData.append("notice_description", newNotice.notice_description.trim());
    formData.append("expire_date", newNotice.expire_date);
    formData.append("file_attached", newNotice.file_attached);
    formData.append("academic_year", newNotice.academic_year);

    // Log FormData for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`Create Notice - ${key}: ${value}`);
    }

    setModalData(formData);
    setModalAction("create");
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (notice) => {
    if (!hasChangePermission) {
      toast.error("নোটিশ সম্পাদনা করার অনুমতি নেই।");
      return;
    }
    setSelectedNoticeId(notice.id);
    setNewNotice({
      notice_title: notice.notice_title,
      date: notice.date,
      notice_description: notice.notice_description,
      expire_date: notice.expire_date,
      file_attached: null, // File input cannot pre-populate
      academic_year: notice.academic_year.toString(),
      existing_file: notice.file_attached, // Store existing file URL
    });
  };

  // Handle update notice
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error("নোটিশ আপডেট করার অনুমতি নেই।");
      return;
    }
    if (
      !newNotice.notice_title.trim() ||
      !newNotice.date ||
      !newNotice.notice_description.trim() ||
      !newNotice.expire_date ||
      !newNotice.academic_year
    ) {
      toast.error("অনুগ্রহ করে সকল ক্ষেত্র পূরণ করুন");
      return;
    }
    if (new Date(newNotice.expire_date) < new Date(newNotice.date)) {
      toast.error("মেয়াদ শেষের তারিখ প্রকাশের তারিখের আগে হতে পারে না");
      return;
    }

    const noticeData = {
      notice_title: newNotice.notice_title.trim(),
      date: newNotice.date,
      notice_description: newNotice.notice_description.trim(),
      expire_date: newNotice.expire_date,
      academic_year: newNotice.academic_year,
      file_attached: newNotice.file_attached, // New file if uploaded
      existing_file: newNotice.existing_file, // Retain existing file if no new file
    };

    // Log payload for debugging
    // console.log("Update Notice Payload:", noticeData);

    setModalData({ id: selectedNoticeId, noticeData });
    setModalAction("update");
    setIsModalOpen(true);
  };

  // Handle delete notice
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error("নোটিশ মুছে ফেলার অনুমতি নেই।");
      return;
    }
    setModalData({ id });
    setModalAction("delete");
    setIsModalOpen(true);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewNotice({ ...newNotice, file_attached: file });
  };

  // Handle date picker click
  const handleDateClick = (e) => {
    e.target.showPicker();
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === "create") {
        if (!hasAddPermission) {
          toast.error("নোটিশ তৈরি করার অনুমতি নেই।");
          return;
        }
        await createNotice(modalData).unwrap();
        toast.success("নোটিশ সফলভাবে তৈরি করা হয়েছে!");
        setNewNotice({
          notice_title: "",
          date: "",
          notice_description: "",
          expire_date: "",
          file_attached: null,
          academic_year: "",
          existing_file: null,
        });
      } else if (modalAction === "update") {
        if (!hasChangePermission) {
          toast.error("নোটিশ আপডেট করার অনুমতি নেই।");
          return;
        }
        await updateNotice({
          id: modalData.id,
          noticeData: modalData.noticeData,
        }).unwrap();
        toast.success("নোটিশ সফলভাবে আপডেট করা হয়েছে!");
        setSelectedNoticeId(null);
        setNewNotice({
          notice_title: "",
          date: "",
          notice_description: "",
          expire_date: "",
          file_attached: null,
          academic_year: "",
          existing_file: null,
        });
      } else if (modalAction === "delete") {
        if (!hasDeletePermission) {
          toast.error("নোটিশ মুছে ফেলার অনুমতি নেই।");
          return;
        }
        await deleteNotice(modalData.id).unwrap();
        toast.success("নোটিশ সফলভাবে মুছে ফেলা হয়েছে!");
      }
      refetch();
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
        `নোটিশ ${
          modalAction === "create"
            ? "তৈরি"
            : modalAction === "update"
            ? "আপডেট"
            : "মুছে ফেলা"
        } ব্যর্থ: ${err?.data?.message || "অজানা ত্রুটি"}`
      );
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  if (noticesLoading || yearsLoading || permissionsLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black/10 backdrop-blur-sm rounded-xl shadow-lg p-8 flex items-center space-x-4 animate-fadeIn">
          <FaSpinner className="animate-spin text-2xl text-[#441a05]" />
          <span className="text-[#441a05] font-medium">লোড হচ্ছে...</span>
        </div>
      </div>
    );

  if (!hasViewPermission) {
    return (
      <div className="p-4 text-red-400 animate-fadeIn">
        এই পৃষ্ঠাটি দেখার অনুমতি নেই।
      </div>
    );
  }

  if (noticesError || yearsError)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 rounded-xl shadow-lg p-8 text-red-400 animate-fadeIn">
          ত্রুটি:{" "}
          {noticesError?.data?.message ||
            yearsError?.data?.message ||
            "অজানা ত্রুটি"}
        </div>
      </div>
    );

  return (
    <div className="py-8">
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
          .tick-glow {
            transition: all 0.3s ease;
          }
          .tick-glow:focus {
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.4);
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
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
          input[type="date"],
          input[type="file"],
          textarea {
            border: 1px solid #9d9087;
            border-radius: 0.5rem;
            color: #441a05;
            font-family: 'Noto Sans Bengali', sans-serif;
            width: 100%;
            transition: all 0.3s ease;
          }
          input[type="date"]:focus,
          input[type="file"]:focus,
          textarea:focus {
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.4);
            border-color: #DB9E30;
            outline: none;
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(20%) sepia(50%) saturate(300%) hue-rotate(10deg);
          }
        `}
      </style>

      {/* Header and Form */}
      <div className="">
        {(hasAddPermission || hasChangePermission) && (
          <div
            ref={formRef}
            className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl w-full"
          >
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-4xl text-[#441a05]" />
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
                নোটিশ যোগ করুন
              </h3>
            </div>

            <form
              onSubmit={selectedNoticeId ? handleUpdate : handleSubmitNotice}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
              encType="multipart/form-data"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#441a05]">
                  নোটিশ শিরোনাম
                </label>
                <input
                  type="text"
                  value={newNotice.notice_title}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, notice_title: e.target.value })
                  }
                  className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                  placeholder="নোটিশ শিরোনাম"
                  disabled={isCreating || isUpdating}
                  aria-label="নোটিশ শিরোনাম লিখুন"
                  title="নোটিশ শিরোনাম লিখুন / Enter notice title"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#441a05]">
                  প্রকাশের তারিখ
                </label>
                <input
                  type="date"
                  value={newNotice.date}
                  onClick={handleDateClick}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, date: e.target.value })
                  }
                  className="w-full p-3 animate-scaleIn bg-transparent"
                  disabled={isCreating || isUpdating}
                  aria-label="নোটিশের প্রকাশের তারিখ নির্বাচন করুন"
                  title="নোটিশের প্রকাশের তারিখ নির্বাচন করুন / Select notice date"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#441a05]">
                  মেয়াদ শেষের তারিখ
                </label>
                <input
                  type="date"
                  value={newNotice.expire_date}
                  onClick={handleDateClick}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, expire_date: e.target.value })
                  }
                  className="w-full p-3 animate-scaleIn bg-transparent"
                  disabled={isCreating || isUpdating}
                  aria-label="নোটিশের মেয়াদ শেষের তারিখ নির্বাচন করুন"
                  title="নোটিশের মেয়াদ শেষের তারিখ নির্বাচন করুন / Select notice expire date"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#441a05]">
                  একাডেমিক বছর
                </label>
                <select
                  value={newNotice.academic_year}
                  onChange={(e) =>
                    setNewNotice({
                      ...newNotice,
                      academic_year: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                  disabled={isCreating || isUpdating}
                  aria-label="একাডেমিক বছর নির্বাচন করুন"
                  title="একাডেমিক বছর নির্বাচন করুন / Select academic year"
                >
                  <option value="" disabled>
                    একাডেমিক বছর নির্বাচন করুন
                  </option>
                  {academicYears?.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-[#441a05]">
                  নোটিশ বিবরণ
                </label>
                <textarea
                  value={newNotice.notice_description}
                  onChange={(e) =>
                    setNewNotice({
                      ...newNotice,
                      notice_description: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                  placeholder="নোটিশ বিবরণ"
                  disabled={isCreating || isUpdating}
                  rows="4"
                  aria-label="নোটিশ বিবরণ লিখুন"
                  title="নোটিশ বিবরণ লিখুন / Enter notice description"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-[#441a05]">
                  ফাইল সংযুক্তি (ঐচ্ছিক)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full animate-scaleIn"
                  disabled={isCreating || isUpdating}
                  aria-label="ফাইল সংযুক্তি নির্বাচন করুন"
                  title="ফাইল সংযুক্তি নির্বাচন করুন / Select file attachment"
                />
                {newNotice.existing_file && !newNotice.file_attached && (
                  <p className="text-sm text-[#441a05]/70">
                    Existing file: {newNotice.existing_file}
                  </p>
                )}
              </div>
              <div className="flex items-end space-x-4">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className={`px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn btn-glow ${
                    isCreating || isUpdating
                      ? "cursor-not-allowed opacity-50"
                      : "hover:text-white hover:shadow-md"
                  }`}
                  title={
                    selectedNoticeId
                      ? "নোটিশ আপডেট করুন / Update notice"
                      : "নোটিশ তৈরি করুন / Create notice"
                  }
                  aria-label={
                    selectedNoticeId ? "নোটিশ আপডেট করুন" : "নোটিশ তৈরি করুন"
                  }
                >
                  {isCreating || isUpdating ? (
                    <span className="flex items-center space-x-3">
                      <FaSpinner className="animate-spin text-lg" />
                      <span>
                        {selectedNoticeId
                          ? "আপডেট করা হচ্ছে..."
                          : "তৈরি করা হচ্ছে..."}
                      </span>
                    </span>
                  ) : (
                    <span>{selectedNoticeId ? "আপডেট করুন" : "তৈরি করুন"}</span>
                  )}
                </button>
                {selectedNoticeId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNoticeId(null);
                      setNewNotice({
                        notice_title: "",
                        date: "",
                        notice_description: "",
                        expire_date: "",
                        file_attached: null,
                        academic_year: "",
                        existing_file: null,
                      });
                    }}
                    className="px-6 py-3 rounded-lg font-medium bg-gray-500/20 text-[#441a05] hover:bg-gray-500/30 transition-all duration-300 animate-scaleIn btn-glow"
                    title="সম্পাদনা বাতিল করুন / Cancel edit"
                    aria-label="সম্পাদনা বাতিল করুন"
                  >
                    বাতিল
                  </button>
                )}
              </div>
            </form>
            {(createError || updateError) && (
              <div
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                ত্রুটি:{" "}
                {(createError || updateError)?.data?.message || "অজানা ত্রুটি"}
              </div>
            )}
          </div>
        )}

        {/* Notices Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6 w-full">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
            নোটিশের তালিকা
          </h3>
          {noticesLoading ? (
            <div className="p-4 text-[#441a05]/70 flex items-center space-x-4 animate-fadeIn">
              <FaSpinner className="animate-spin text-lg" />
              <span>নোটিশ লোড হচ্ছে...</span>
            </div>
          ) : notices?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70 animate-fadeIn">
              কোনো নোটিশ উপলব্ধ নেই।
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শিরোনাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      বিবরণ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      প্রকাশের তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      মেয়াদ শেষের তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      একাডেমিক বছর
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      তৈরির সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আপডেটের সময়
                    </th>
                    {(hasChangePermission || hasDeletePermission) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ক্রিয়াকলাপ
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {notices?.map((notice, index) => (
                    <tr
                      key={notice.id}
                      className="animate-fadeIn hover:bg-white/10 transition-colors duration-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {notice.notice_title}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#441a05] max-w-xs truncate">
                        {notice.notice_description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {new Date(notice.date).toLocaleDateString("bn-BD", {
                          dateStyle: "short",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {new Date(notice.expire_date).toLocaleDateString(
                          "bn-BD",
                          { dateStyle: "short" }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {academicYears?.find(
                          (year) => year.id === notice.academic_year
                        )?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(notice.created_at).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {new Date(notice.updated_at).toLocaleString("bn-BD")}
                      </td>
                      {(hasChangePermission || hasDeletePermission) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {hasChangePermission && (
                            <button
                              onClick={() => handleEditClick(notice)}
                              className="text-[#441a05] hover:text-[#DB9E30] mr-4 transition-colors duration-300 btn-glow"
                              aria-label={`নোটিশ সম্পাদনা করুন ${notice.notice_title}`}
                              title={`নোটিশ সম্পাদনা করুন / Edit notice ${notice.notice_title}`}
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(notice.id)}
                              className="text-[#441a05] hover:text-red-500 transition-colors duration-300 btn-glow"
                              aria-label={`নোটিশ মুছুন ${notice.notice_title}`}
                              title={`নোটিশ মুছুন / Delete notice ${notice.notice_title}`}
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      )}
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
                ? "নোটিশ মুছে ফেলা হচ্ছে..."
                : `নোটিশ মুছে ফেলতে ত্রুটি: ${
                    deleteError?.data?.message || "অজানা ত্রুটি"
                  }`}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen &&
          (hasAddPermission || hasChangePermission || hasDeletePermission) && (
            <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10001]">
              <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
                <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                  {modalAction === "create" && "নতুন নোটিশ নিশ্চিত করুন"}
                  {modalAction === "update" && "নোটিশ আপডেট নিশ্চিত করুন"}
                  {modalAction === "delete" && "নোটিশ মুছে ফেলা নিশ্চিত করুন"}
                </h3>
                <p className="text-[#441a05] mb-6">
                  {modalAction === "create" &&
                    "আপনি কি নিশ্চিত যে নতুন নোটিশ তৈরি করতে চান?"}
                  {modalAction === "update" &&
                    "আপনি কি নিশ্চিত যে নোটিশ আপডেট করতে চান?"}
                  {modalAction === "delete" &&
                    "আপনি কি নিশ্চিত যে এই নোটিশটি মুছে ফেলতে চান?"}
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setModalAction(null);
                      setModalData(null);
                    }}
                    className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300 btn-glow"
                    title="বাতিল করুন / Cancel"
                    aria-label="বাতিল করুন"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={confirmAction}
                    className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                    title="নিশ্চিত করুন / Confirm"
                    aria-label="নিশ্চিত করুন"
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

export default AddNotice;