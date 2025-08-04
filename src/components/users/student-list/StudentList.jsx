import React, { useState, useCallback, useMemo } from "react";
import { FaEdit, FaSpinner, FaTrash, FaDownload } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import debounce from "lodash.debounce";
import Select from "react-select";
import {
  useDeleteStudentListMutation,
  useGetStudentListQuery,
  useUpdateStudentListMutation,
} from "../../../redux/features/api/student/studentListApi";
import { useGetStudentSectionApiQuery } from "../../../redux/features/api/student/studentSectionApi";
import { useGetStudentShiftApiQuery } from "../../../redux/features/api/student/studentShiftApi";
import { useGetAcademicYearApiQuery } from "../../../redux/features/api/academic-year/academicYearApi";
import { useGetStudentClassApIQuery } from "../../../redux/features/api/student/studentClassApi";
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../../redux/features/api/permissionRole/groupsApi";
import selectStyles from "../../../utilitis/selectStyles";
import { useGetInstituteLatestQuery } from "../../../redux/features/api/institute/instituteLatestApi";
import { useNavigate } from "react-router-dom";

const StudentList = () => {
  const navigate = useNavigate();
  const { user, group_id } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    name: "",
    user_id: "",
    roll: "",
    phone: "",
    class: "",
    section: "",
    shift: "",
    admission_year: "",
    status: "",
  });
  const [editStudentId, setEditStudentId] = useState(null);
  const [editStudentData, setEditStudentData] = useState({
    name: "",
    user_id: "",
    class_name: "",
    section_name: "",
    shift_name: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const pageSize = 20;

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } =
    useGetGroupPermissionsQuery(group_id, {
      skip: !group_id,
    });

  // Permission checks
  const hasViewPermission =
    groupPermissions?.some((perm) => perm.codename === "view_student") || false;
  const hasChangePermission =
    groupPermissions?.some((perm) => perm.codename === "change_student") ||
    false;
  const hasDeletePermission =
    groupPermissions?.some((perm) => perm.codename === "delete_student") ||
    false;

  // Fetch student data
  const {
    data: studentData,
    isLoading,
    isError,
    error,
  } = useGetStudentListQuery(
    {
      page,
      page_size: pageSize,
      ...filters,
    },
    { skip: !hasViewPermission }
  );

  // Fetch dropdown data
  const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();
  const { data: classes, isLoading: isClassesLoading } =
    useGetStudentClassApIQuery({ skip: !hasViewPermission });
  const { data: sections, isLoading: isSectionsLoading } =
    useGetStudentSectionApiQuery({ skip: !hasViewPermission });
  const { data: shifts, isLoading: isShiftsLoading } =
    useGetStudentShiftApiQuery({ skip: !hasViewPermission });
  const { data: academicYears, isLoading: isAcademicYearsLoading } =
    useGetAcademicYearApiQuery({ skip: !hasViewPermission });

  const [updateStudent, { isLoading: isUpdating, error: updateError }] =
    useUpdateStudentListMutation();
  const [deleteStudent, { isLoading: isDeleting, error: deleteError }] =
    useDeleteStudentListMutation();

  const students = studentData?.students || [];
  const totalItems = studentData?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = !!studentData?.next;
  const hasPreviousPage = !!studentData?.previous;

  // Format dropdown options
  const classOptions =
    classes?.map((cls) => ({
      value: cls.student_class.name,
      label: cls.student_class.name,
    })) || [];
  const sectionOptions =
    sections?.map((sec) => ({
      value: sec.name,
      label: sec.name,
    })) || [];
  const shiftOptions =
    shifts?.map((shift) => ({
      value: shift.name,
      label: shift.name,
    })) || [];
  const academicYearOptions =
    academicYears?.map((year) => ({
      value: year.name,
      label: year.name,
    })) || [];
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Debounced filter update
  const debouncedSetFilters = useCallback(
    debounce((newFilters) => {
      setFilters(newFilters);
      setPage(1);
    }, 300),
    []
  );

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    debouncedSetFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (selectedOption, { name }) => {
    debouncedSetFilters((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Generate page numbers for display
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages = [];
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Handle edit button click
  const handleEditClick = (studentId) => {
    if (!hasChangePermission) {
      toast.error("ছাত্রের তথ্য সম্পাদনা করার অনুমতি নেই।");
      return;
    }
    navigate(`/users/student?edit=${studentId}`);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error("ছাত্র মুছে ফেলার অনুমতি নেই।");
      return;
    }
    setModalAction("delete");
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm modal action
  const confirmAction = async () => {
    try {
      if (modalAction === "delete") {
        if (!hasDeletePermission) {
          toast.error("ছাত্র মুছে ফেলার অনুমতি নেই।");
          return;
        }
        await deleteStudent(modalData.id).unwrap();
        toast.success("ছাত্র সফলভাবে মুছে ফেলা হয়েছে!");
      }
    } catch (err) {
      console.error("Error deleting student:", err);
      toast.error(`ছাত্র মুছে ফেলা ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle Profile PDF Download
  const handleDownloadProfile = async (student) => {
    if (!hasViewPermission) {
      toast.error("প্রোফাইল দেখার অনুমতি নেই।");
      return;
    }
    if (instituteLoading) {
      toast.error('ইনস্টিটিউট তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন!');
      return;
    }
    if (!institute) {
      toast.error('ইনস্টিটিউট তথ্য পাওয়া যায়নি!');
      return;
    }

    const fullAddress = [
      student.village,
      student.post_office,
      student.ps_or_upazilla,
      student.district,
    ]
      .filter(Boolean)
      .join(", ") || "N/A";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ছাত্র তথ্য প্রতিবেদন</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4 portrait; margin: 20mm; }
          body {
            font-family: 'Noto Sans Bengali', Arial, sans-serif;
            font-size: 12px;
            margin: 20mm;
            padding: 0;
            color: #000;
            background-color: #fff;
          }
          .container {
            max-width: 210mm;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
          }
          .school-logo {
            max-width: 80px;
            margin-bottom: 10px;
          }
          .school-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .school-address {
            font-size: 10px;
            margin-bottom: 10px;
          }
          .title {
            font-size: 16px;
            font-weight: bold;
            text-decoration: underline;
          }
          .main-content {
            display: flex;
            margin-top: 20px;
            gap: 20px;
          }
          .left-section {
            width: 60%;
          }
          .right-section {
            width: 40%;
            text-align: center;
          }
          .student-photo {
            width: 120px;
            height: 150px;
            object-fit: cover;
            border: 2px solid #000;
            margin-bottom: 10px;
            background-color: #f0f0f0;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            background-color: #f0f0f0;
            padding: 6px;
            margin: 10px 0 5px;
            text-align: center;
            border: 1px solid #000;
            border-radius: 4px;
          }
          .table {
            width: 100%;
            margin-bottom: 15px;
            border-collapse: collapse;
          }
          .table-row {
            display: flex;
            border-bottom: 1px solid #ccc;
            min-height: 24px;
          }
          .label-cell {
            width: 40%;
            padding: 6px;
            font-size: 10px;
            font-weight: bold;
            background-color: #f8f8f8;
            border-right: 1px solid #ccc;
          }
          .value-cell {
            width: 60%;
            padding: 6px;
            font-size: 10px;
          }
          .two-col-row {
            display: flex;
            border-bottom: 1px solid #ccc;
            min-height: 24px;
          }
          .two-col-label {
            width: 20%;
            padding: 6px;
            font-size: 10px;
            font-weight: bold;
            background-color: #f8f8f8;
            border-right: 1px solid #ccc;
          }
          .two-col-value {
            width: 30%;
            padding: 6px;
            font-size: 10px;
          }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #000;
          }
          .signature-box {
            width: 30%;
            text-align: center;
          }
          .signature-line {
            width: 100%;
            border-bottom: 1px solid #000;
            height: 20px;
            margin-bottom: 5px;
          }
          .signature-label {
            font-size: 8px;
            font-weight: bold;
          }
          .footer {
            position: fixed;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            text-align: center;
            font-size: 8px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${institute.logo ? `<img src="${institute.logo}" class="school-logo" alt="School Logo" />` : ''}
            <div class="school-name">${institute.institute_name || 'আদর্শ বিদ্যালয়, ঢাকা'}</div>
            <div class="school-address">${institute.institute_address || '১২৩ মেইন রোড, ঢাকা, বাংলাদেশ'}</div>
            <div class="title">ছাত্র তথ্য প্রতিবেদন</div>
          </div>

          <div class="main-content">
            <div class="left-section">
              <div class="section-title">ব্যক্তিগত তথ্য</div>
              <div class="table">
                <div class="two-col-row">
                  <div class="two-col-label">নাম</div>
                  <div class="two-col-value">${student.name || "N/A"}</div>
                  <div class="two-col-label">ইউজার আইডি</div>
                  <div class="two-col-value">${student.user_id || "N/A"}</div>
                </div>
                <div class="two-col-row">
                  <div class="two-col-label">জন্ম তারিখ</div>
                  <div class="two-col-value">${student.dob || "N/A"}</div>
                  <div class="two-col-label">লিঙ্গ</div>
                  <div class="two-col-value">${student.gender || "N/A"}</div>
                </div>
                <div class="two-col-row">
                  <div class="two-col-label">রক্তের গ্রুপ</div>
                  <div class="two-col-value">${student.blood_group || "N/A"}</div>
                  <div class="two-col-label">জাতীয়তা</div>
                  <div class="two-col-value">${student.nationality || "N/A"}</div>
                </div>
                <div class="two-col-row">
                  <div class="two-col-label">মোবাইল নং</div>
                  <div class="two-col-value">${student.phone_number || "N/A"}</div>
                  <div class="two-col-label">ইমেইল</div>
                  <div class="two-col-value">${student.email || "N/A"}</div>
                </div>
                <div class="two-col-row">
                  <div class="two-col-label">জন্ম সনদ নং</div>
                  <div class="two-col-value">${student.birth_certificate_no || "N/A"}</div>
                  <div class="two-col-label">আরএফআইডি</div>
                  <div class="two-col-value">${student.rfid || "N/A"}</div>
                </div>
              </div>

              <div class="section-title">একাডেমিক তথ্য</div>
              <div class="table">
                <div class="table-row">
                  <div class="label-cell">ক্লাস</div>
                  <div class="value-cell">${student.class_name || "N/A"}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">সেকশন</div>
                  <div class="value-cell">${student.section_name || "N/A"}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">শিফট</div>
                  <div class="value-cell">${student.shift_name || "N/A"}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">রোল নং</div>
                  <div class="value-cell">${student.roll_no || "N/A"}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">ভর্তির বছর</div>
                  <div class="value-cell">${student.admission_year || "N/A"}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">ভর্তির তারিখ</div>
                  <div class="value-cell">${student.admission_date || "N/A"}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">নাম ট্যাগ</div>
                  <div class="value-cell">${student.name_tag || "N/A"}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">স্থানান্তর সনদ নং</div>
                  <div class="value-cell">${student.tc_no || "N/A"}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">আবাসিক অবস্থা</div>
                  <div class="value-cell">${student.residential_status || "N/A"}</div>
                </div>
              </div>

              <div class="section-title">ঠিকানা</div>
              <div class="table">
                <div class="table-row">
                  <div class="label-cell">বর্তমান ঠিকানা</div>
                  <div class="value-cell">${student.present_address || fullAddress}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">স্থায়ী ঠিকানা</div>
                  <div class="value-cell">${student.permanent_address || fullAddress}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">গ্রাম</div>
                  <div class="value-cell">${student.village || "N/A"}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">পোস্ট অফিস</div>
                  <div class="value-cell">${student.post_office || "N/A"}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">থানা/উপজেলা</div>
                  <div class="value-cell">${student.ps_or_upazilla || "N/A"}</div>
                </div>
                <div class="table-row">
                  <div class="label-cell">জেলা</div>
                  <div class="value-cell">${student.district || "N/A"}</div>
                </div>
              </div>

              <div class="section-title">পারিবারিক তথ্য</div>
              <div class="table">
                <div class="two-col-row">
                  <div class="two-col-label">অভিভাবকের নাম</div>
                  <div class="two-col-value">${student.parent?.g_name || "N/A"}</div>
                  <div class="two-col-label">অভিভাবকের ফোন</div>
                  <div class="two-col-value">${student.parent?.g_mobile_no || "N/A"}</div>
                </div>
                <div class="two-col-row">
                  <div class="two-col-label">পিতার নাম</div>
                  <div class="two-col-value">${student.parent?.father_name || "N/A"}</div>
                  <div class="two-col-label">পিতার ফোন</div>
                  <div class="two-col-value">${student.parent?.father_mobile_no || "N/A"}</div>
                </div>
                <div class="two-col-row">
                  <div class="two-col-label">মাতার নাম</div>
                  <div class="two-col-value">${student.parent?.mother_name || "N/A"}</div>
                  <div class="two-col-label">মাতার ফোন</div>
                  <div class="two-col-value">${student.parent?.mother_mobile_no || "N/A"}</div>
                </div>
                <div class="two-col-row">
                  <div class="two-col-label">সম্পর্ক</div>
                  <div class="two-col-value">${student.parent?.relation || "N/A"}</div>
                  <div class="two-col-label">পিতার পেশা</div>
                  <div class="two-col-value">${student.parent?.f_occupation || "N/A"}</div>
                </div>
                <div class="two-col-row">
                  <div class="two-col-label">মাতার পেশা</div>
                  <div class="two-col-value">${student.parent?.m_occupation || "N/A"}</div>
                  <div class="two-col-label">অভিভাবকের পেশা</div>
                  <div class="two-col-value">${student.parent?.g_occupation || "N/A"}</div>
                </div>
                <div class="two-col-row">
                  <div class="two-col-label">পিতার এনআইডি</div>
                  <div class="two-col-value">${student.parent?.f_nid || "N/A"}</div>
                  <div class="two-col-label">মাতার এনআইডি</div>
                  <div class="two-col-value">${student.parent?.m_nid || "N/A"}</div>
                </div>
              </div>

              <div class="section-title">অন্যান্য তথ্য</div>
              <div class="table">
                <div class="table-row">
                  <div class="label-cell">প্রতিবন্ধকতার তথ্য</div>
                  <div class="value-cell">${student.disability_info || "N/A"}</div>
                </div>
              </div>
            </div>

            <div class="right-section">
              <img src="${student.avatar || '/placeholder-avatar.png'}" class="student-photo" alt="Student Photo" />
            </div>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">ছাত্রের স্বাক্ষর</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">অভিভাবকের স্বাক্ষর</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">প্রধান শিক্ষকের স্বাক্ষর</div>
            </div>
          </div>

          <div class="footer">
            প্রতিবেদন তৈরি: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })} | ${institute.institute_name || 'আদর্শ বিদ্যালয়'} - ছাত্র ব্যবস্থাপনা সিস্টেম
          </div>
        </div>

        <script>
          let printAttempted = false;
          window.onbeforeprint = () => { printAttempted = true; };
          window.onafterprint = () => { window.close(); };
          window.addEventListener('beforeunload', (event) => {
            if (!printAttempted) { window.close(); }
          });
          window.print();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('ছাত্র প্রোফাইল তৈরি হয়েছে! প্রিন্ট বা সেভ করুন।', 'success');
  };

  if (
    isLoading ||
    isClassesLoading ||
    isSectionsLoading ||
    isShiftsLoading ||
    isAcademicYearsLoading ||
    permissionsLoading
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 animate-fadeIn">
          <FaSpinner className="animate-spin text-3xl text-[#DB9E30]" />
          <span className="text-lg font-medium text-[#441a05]">
            লোড হচ্ছে...
          </span>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="p-4 text-red-400 animate-fadeIn text-center text-lg font-semibold">
        এই পৃষ্ঠাটি দেখার অনুমতি নেই।
      </div>
    );
  }

  // Table headers
  const tableHeaders = [
    { key: "serial", label: "ক্রমিক", fixed: true, width: "70px" },
    { key: "avatar", label: "অ্যাভাটার", fixed: true, width: "100px" },
    { key: "name", label: "নাম", fixed: true, width: "150px" },
    { key: "user_id", label: "ইউজার আইডি", fixed: true, width: "120px" },
    { key: "roll_no", label: "রোল", fixed: false, width: "80px" },
    { key: "class_name", label: "ক্লাস", fixed: false, width: "100px" },
    { key: "section_name", label: "সেকশন", fixed: false, width: "100px" },
    { key: "shift_name", label: "শিফট", fixed: false, width: "100px" },
    { key: "phone_number", label: "ফোন নম্বর", fixed: false, width: "120px" },
    { key: "dob", label: "জন্ম তারিখ", fixed: false, width: "120px" },
    { key: "gender", label: "লিঙ্গ", fixed: false, width: "80px" },
    { key: "blood_group", label: "রক্তের গ্রুপ", fixed: false, width: "100px" },
    { key: "nationality", label: "জাতীয়তা", fixed: false, width: "100px" },
    { key: "father_name", label: "পিতার নাম", fixed: false, width: "120px" },
    { key: "mother_name", label: "মাতার নাম", fixed: false, width: "120px" },
    { key: "admission_year", label: "ভর্তির বছর", fixed: false, width: "120px" },
    { key: "admission_date", label: "ভর্তির তারিখ", fixed: false, width: "120px" },
    { key: "actions", label: "কার্যক্রম", fixed: false, width: "150px", actions: true },
  ];

  return (
    <div className="py-8 w-full">
      <Toaster position="top-right" reverseOrder={false} />
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes slideDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
          .animate-slideDown { animation: slideDown 0.4s ease-out forwards; }
          .btn-glow:hover { box-shadow: 0 0 15px rgba(219, 158, 48, 0.3); }
          
          .table-container {
            position: relative;
            max-height: 70vh;
            overflow: auto;
            background: rgba(255, 255, 255, 0.2);
          }

          table {
            width: 100%;
            border-collapse: separate;
            text-align: center;
            border-spacing: 0;
          }
          
          .sticky-header th {
            text-align: center;
            font-size: 12px;
            text-wrap: nowrap;
            position: sticky;
            top: 0;
            background: #DB9E30;
            backdrop-filter: blur(10px);
            z-index: 2;
            border-bottom: 2px solid rgba(219, 158, 48, 0.3);
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 12px 16px;
          }

          .fixed-col {
            position: sticky;
            font-size: 14px;
            background: white;
            border-right: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
          }
          
          .fixed-col.serial { 
            left: 0px; 
            background: #DB9E30;
            color: rgba(255, 255, 255, 0.9);
          }
          .fixed-col.avatar { 
            left: 70px;
            background: rgba(255, 255, 255);
          }
          .fixed-col.name { 
            left: 170px;
            background: rgba(255, 255, 255);
          }
          .fixed-col.user_id { 
            left: 320px;
            background: rgba(255, 255, 255);
          }

          .sticky-header .fixed-col.serial,
          .sticky-header .fixed-col.avatar,
          .sticky-header .fixed-col.name,
          .sticky-header .fixed-col.user_id {
            z-index: 10;
            background: #DB9E30;
            color: rgba(255, 255, 255);
          }
          
          .table-row {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(5px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
          }
          
          .table-row:hover {
            background: rgba(219, 158, 48, 0.1);
            backdrop-filter: blur(10px);
            transform: translateX(2px);
          }
          
          .table-cell {
            text-wrap: nowrap;
            font-size: 14px;
            padding: 12px 16px;
            color: #441a05;
            font-weight: 500;
            border-right: 1px solid rgba(219, 158, 64, 0.15);
            border: 1px solid rgba(0, 0, 0, 0.05);
          }

          .avatar-img {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 50%;
            border: 1px solid #DB9E30;
          }

          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .status-active {
            background: rgba(34, 197, 94, 0.2);
            color: #059669;
            border: 1px solid rgba(34, 197, 94, 0.3);
          }
          
          .status-inactive {
            background: #DB9E30;
            color: #dc2626;
            border: 1px solid rgba(239, 68, 68, 0.3);
          }
          
          .action-button {
            padding: 8px;
            border-radius: 6px;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          
          .action-edit:hover { background: rgba(59, 130, 246, 0.2); color: #2563eb; }
          .action-delete:hover { background: rgba(239, 68, 68, 0.2); color: #dc2626; }
          .action-download:hover { background: rgba(34, 197, 94, 0.2); color: #059669; }
          
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { 
            background: rgba(255, 255, 255, 0.1); 
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb { 
            background: rgba(68, 26, 5, 0.4); 
            border-radius: 10px;
            border: 2px solid rgba(255, 255, 255, 0.1);
          }
          ::-webkit-scrollbar-thumb:hover { 
            background: rgba(68, 26, 5, 0.6); 
          }
          
          .filter-card {
            background: rgba(0, 0, 0, 0.10);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>

      <div className="filter-card p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <h3 className="text-2xl font-bold text-[#441a05] tracking-tight mb-6">
          ছাত্র তালিকা
        </h3>

        {/* Filter Form */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-[#441a05] mb-4">ফিল্টার</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 outline-none border border-black/20 rounded-lg transition-all duration-300 focus:border-[#DB9E30]"
              placeholder="নাম"
            />
            <input
              type="text"
              name="user_id"
              value={filters.user_id}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 outline-none border border-black/20 rounded-lg transition-all duration-300 focus:border-[#DB9E30]"
              placeholder="ইউজার আইডি"
            />
            <input
              type="text"
              name="roll"
              value={filters.roll}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 outline-none border border-black/20 rounded-lg transition-all duration-300 focus:border-[#DB9E30]"
              placeholder="রোল"
            />
            <input
              type="text"
              name="phone"
              value={filters.phone}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 outline-none border border-black/20 rounded-lg transition-all duration-300 focus:border-[#DB9E30]"
              placeholder="ফোন নম্বর"
            />
            <Select
              name="class"
              options={classOptions}
              onChange={handleSelectChange}
              placeholder="ক্লাস"
              isClearable
              isLoading={isClassesLoading}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="w-full"
            />
            <Select
              name="section"
              options={sectionOptions}
              onChange={handleSelectChange}
              placeholder="সেকশন"
              isClearable
              isLoading={isSectionsLoading}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="w-full"
            />
            <Select
              name="shift"
              options={shiftOptions}
              onChange={handleSelectChange}
              placeholder="শিফট"
              isClearable
              isLoading={isShiftsLoading}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="w-full"
            />
            <Select
              name="admission_year"
              options={academicYearOptions}
              onChange={handleSelectChange}
              placeholder="ভর্তির বছর"
              isClearable
              isLoading={isAcademicYearsLoading}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="w-full"
            />
            <Select
              name="status"
              options={statusOptions}
              onChange={handleSelectChange}
              placeholder="স্ট্যাটাস"
              isClearable
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="w-full"
            />
          </div>
        </div>

        {/* Student Table */}
        <div className="table-container">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center">
              <FaSpinner className="animate-spin text-[#441a05] text-2xl mr-2" />
              <p className="text-[#441a05]/70">লোড হচ্ছে...</p>
            </div>
          ) : isError ? (
            <p className="p-4 text-red-400">
              ত্রুটি: {error?.status || "অজানা"} -{" "}
              {JSON.stringify(error?.data || {})}
            </p>
          ) : students.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো ছাত্র পাওয়া যায়নি।</p>
          ) : (
            <table className="min-w-max">
              <thead className="sticky-header">
                <tr>
                  {tableHeaders.map((header) => {
                    const isFixed = header.fixed;
                    const headerClasses = `table-cell text-xs font-medium uppercase tracking-wider ${isFixed ? ` ${header.key}` : ""}`;
                    const style = { width: header.width };
                    return (
                      <th key={header.key} className={headerClasses} style={style}>
                        {header.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const serial = (page - 1) * pageSize + index + 1;
                  return (
                    <tr key={student.id} className="table-row animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="table-cell serial" style={{ width: "70px" }}>{serial}</td>
                      <td className="table-cell avatar" style={{ width: "100px" }}>
                        <img 
                          src={student.avatar || '/placeholder-avatar.png'} 
                          alt={student.name} 
                          className="avatar-img" 
                        />
                      </td>
                      <td className="table-cell name" style={{ width: "150px" }}>
                        <div className="font-semibold">{student.name}</div>
                        {student.name_in_bangla && (
                          <div className="text-xs opacity-75">{student.name_in_bangla}</div>
                        )}
                      </td>
                      <td className="table-cell user_id" style={{ width: "120px" }}>
                        <span className="font-mono text-xs">{student.user_id}</span>
                      </td>
                      <td className="table-cell" style={{ width: "80px" }}>{student.roll_no || "N/A"}</td>
                      <td className="table-cell" style={{ width: "100px" }}>{student.class_name}</td>
                      <td className="table-cell" style={{ width: "100px" }}>{student.section_name}</td>
                      <td className="table-cell" style={{ width: "100px" }}>{student.shift_name}</td>
                      <td className="table-cell" style={{ width: "120px" }}>{student.phone_number || "N/A"}</td>
                      <td className="table-cell" style={{ width: "120px" }}>{student.dob || "N/A"}</td>
                      <td className="table-cell" style={{ width: "80px" }}>{student.gender || "N/A"}</td>
                      <td className="table-cell" style={{ width: "100px" }}>{student.blood_group || "N/A"}</td>
                      <td className="table-cell" style={{ width: "100px" }}>{student.nationality || "N/A"}</td>
                      <td className="table-cell" style={{ width: "120px" }}>{student.parent?.father_name || "N/A"}</td>
                      <td className="table-cell" style={{ width: "120px" }}>{student.parent?.mother_name || "N/A"}</td>
                      <td className="table-cell" style={{ width: "120px" }}>{student.admission_year || "N/A"}</td>
                      <td className="table-cell" style={{ width: "120px" }}>{student.admission_date || "N/A"}</td>
                      <td className="table-cell" style={{ width: "150px" }}>
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleDownloadProfile(student)}
                            className="action-button action-download"
                            aria-label={`প্রোফাইল ডাউনলোড ${student.name}`}
                            title="প্রোফাইল ডাউনলোড"
                          >
                            <FaDownload className="w-4 h-4" />
                          </button>
                          {hasChangePermission && (
                            <button
                              onClick={() => handleEditClick(student.student_field)}
                              className="action-button action-edit"
                              aria-label={`সম্পাদনা করুন ${student.name}`}
                              title="সম্পাদনা করুন"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="action-button action-delete"
                              aria-label={`মুছুন ${student.name}`}
                              title="মুছুন"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {(isDeleting || deleteError) && (
            <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
              {isDeleting
                ? "ছাত্র মুছছে..."
                : `ছাত্র মুছতে ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})}`}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!hasPreviousPage}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 btn-glow ${!hasPreviousPage
                ? "bg-gray-500/20 text-[#441a05]/30 cursor-not-allowed"
                : "bg-[#DB9E30] text-[#441a05] hover:text-white backdrop-blur-sm"
                }`}
            >
              পূর্ববর্তী
            </button>
            {getPageNumbers().map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm ${page === pageNumber
                  ? "bg-[#DB9E30] text-white"
                  : "bg-white/20 text-[#441a05] hover:bg-white/30"
                  }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNextPage}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 btn-glow ${!hasNextPage
                ? "bg-gray-500/20 text-[#441a05]/30 cursor-not-allowed"
                : "bg-[#DB9E30] text-[#441a05] hover:text-white backdrop-blur-sm"
                }`}
            >
              পরবর্তী
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && hasDeletePermission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp shadow-xl">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              ছাত্র মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই ছাত্রটিকে মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300 backdrop-blur-sm"
              >
                বাতিল
              </button>
              <button
                onClick={confirmAction}
                disabled={isDeleting}
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow backdrop-blur-sm ${isDeleting
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
    </div>
  );
};

export default StudentList;