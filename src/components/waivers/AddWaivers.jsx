import React, { useState, useMemo } from "react";
import Select from "react-select";
import { FaEdit, FaSpinner, FaTrash, FaFilePdf } from "react-icons/fa";
import { IoAdd, IoAddCircle } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetStudentActiveApiQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetFeeHeadsQuery } from "../../redux/features/api/fee-heads/feeHeadsApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import {
  useCreateWaiverMutation,
  useDeleteWaiverMutation,
  useGetWaiversQuery,
  useUpdateWaiverMutation,
} from "../../redux/features/api/waivers/waiversApi";
import { useGetFundsQuery } from "../../redux/features/api/funds/fundsApi";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";
import { useSelector } from "react-redux";
import selectStyles from "../../utilitis/selectStyles";

const AddWaivers = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [isAdd, setIsAdd] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentWaivers, setStudentWaivers] = useState({});
  const [editWaiverId, setEditWaiverId] = useState(null);
  const [editWaiverData, setEditWaiverData] = useState({
    student_id: null,
    waiver_amount: "",
    academic_year: null,
    description: "",
    fee_types: [],
    fund_id: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteWaiverId, setDeleteWaiverId] = useState(null);

  // State for Waiver List filters
  const [waiverListFilters, setWaiverListFilters] = useState({
    studentSearch: "",
    feeTypeId: null,
  });

  // API hooks
  const { data: classes, isLoading: isClassLoading } =
    useGetclassConfigApiQuery();
  const { data: students, isLoading: isStudentLoading } =
    useGetStudentActiveApiQuery();
  const { data: feeHeads, isLoading: isFeeHeadsLoading } =
    useGetFeeHeadsQuery();
  const { data: academicYears, isLoading: isAcademicYearLoading } =
    useGetAcademicYearApiQuery();
  const { data: waivers, isLoading: isWaiverLoading } = useGetWaiversQuery();
  const { data: funds, isLoading: isFundsLoading } = useGetFundsQuery();
  const {
    data: institute,
    isLoading: isInstituteLoading,
    error: instituteError,
  } = useGetInstituteLatestQuery();
  const { data: groupPermissions, isLoading: permissionsLoading } =
    useGetGroupPermissionsQuery(group_id, {
      skip: !group_id,
    });
  const [createWaiver, { isLoading: isCreating, error: createError }] =
    useCreateWaiverMutation();
  const [updateWaiver, { isLoading: isUpdating, error: updateError }] =
    useUpdateWaiverMutation();
  const [deleteWaiver, { isLoading: isDeleting, error: deleteError }] =
    useDeleteWaiverMutation();

  // Check permissions
  const hasAddPermission =
    groupPermissions?.some((perm) => perm.codename === "add_waiver") || false;
  const hasChangePermission =
    groupPermissions?.some((perm) => perm.codename === "change_waiver") ||
    false;
  const hasDeletePermission =
    groupPermissions?.some((perm) => perm.codename === "delete_waiver") ||
    false;
  const hasViewPermission =
    groupPermissions?.some((perm) => perm.codename === "view_waiver") || false;

  // Class options
  const classOptions =
    classes?.map((cls) => ({
      value: cls.id,
      label: `${cls.class_name}${cls.section_name ? `-${cls.section_name}` : ''}${cls.shift_name ? `-${cls.shift_name}` : ''}`,
    })) || [];


  // Fund options
  const fundOptions =
    funds?.map((fund) => ({
      value: fund.id,
      label: fund.name,
    })) || [];

  // Fee type options
  const feeTypeOptions =
    feeHeads?.map((fee) => ({
      value: fee.id,
      label: fee.name || `ফি ${fee.id}`,
    })) || [];

  // Academic year options
  const academicYearOptions =
    academicYears?.map((year) => ({
      value: year.id,
      label: year.year || year.name || `বছর ${year.id}`,
    })) || [];

  // Filtered students for Add Waiver section (based on class and search query)
  const filteredStudents = useMemo(() => {
    if (!students || !selectedClassId) return [];
    return students.filter(
      (student) =>
        student.class_id === selectedClassId &&
        (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.user_id.toString().includes(searchQuery))
    );
  }, [students, selectedClassId, searchQuery]);

  // Filtered waivers for Waiver List section (based on student search and fee type filter)
  const filteredWaivers = useMemo(() => {
    if (!waivers) return [];

    return waivers.filter((waiver) => {
      // 1. Student Name/User ID filter
      if (waiverListFilters.studentSearch) {
        const student = students?.find((s) => s.id === waiver.student_id);
        const searchLower = waiverListFilters.studentSearch.toLowerCase();
        const studentMatch =
          student &&
          (student.name.toLowerCase().includes(searchLower) ||
            student.user_id.toString().includes(searchLower));
        if (!studentMatch) {
          return false;
        }
      }

      // 2. Fee Type filter
      if (waiverListFilters.feeTypeId !== null) {
        if (!waiver.fee_types.includes(waiverListFilters.feeTypeId)) {
          return false;
        }
      }

      return true;
    });
  }, [waivers, students, waiverListFilters]);

  // Helper functions for rendering data
  const getStudentName = (studentId) => {
    return (
      students?.find((s) => s.id === studentId)?.name || `ছাত্র ${studentId}`
    );
  };

  const getAcademicYearName = (yearId) => {
    return academicYears?.find((y) => y.id === yearId)?.name || `বছর ${yearId}`;
  };

  const getFundName = (fundId) => {
    return funds?.find((f) => f.id === fundId)?.name || `ফান্ড ${fundId}`;
  };

  const getFeeTypeNames = (feeTypeIds) => {
    return feeTypeIds
      .map((id) => feeHeads?.find((f) => f.id === id)?.name || `ফি ${id}`)
      .join(", ");
  };

  // Handle student selection toggle (for Add Waiver section)
  const handleStudentToggle = (studentId) => {
    if (!hasAddPermission && isAdd) {
      toast.error("ওয়েভার যোগ করার অনুমতি নেই।");
      return;
    }
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        const newWaivers = { ...studentWaivers };
        delete newWaivers[studentId];
        setStudentWaivers(newWaivers);
        return prev.filter((id) => id !== studentId);
      } else {
        setStudentWaivers((prevWaivers) => ({
          ...prevWaivers,
          [studentId]: {
            student_id: studentId,
            waiver_amount: "",
            academic_year: null,
            description: "",
            fee_types: [],
            fund_id: null,
          },
        }));
        return [...prev, studentId];
      }
    });
  };

  // Handle waiver data change (for Add Waiver section)
  const handleWaiverChange = (studentId, field, value) => {
    if (field === "waiver_amount" && value > 100) {
      toast.error("ওয়েভার পরিমাণ ১০০% এর বেশি হতে পারবে না।");
      return;
    }
    setStudentWaivers((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // Create waivers
  const handleSubmitWaivers = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) {
      toast.error("ওয়েভার যোগ করার অনুমতি নেই।");
      return;
    }
    if (selectedStudents.length === 0) {
      toast.error("অন্তত একজন ছাত্র নির্বাচন করুন।");
      return;
    }

    const errors = [];
    const payloads = selectedStudents.map((studentId) => {
      const waiver = studentWaivers[studentId];

      // Updated validation - now includes description as required
      if (
        !waiver.waiver_amount ||
        !waiver.academic_year ||
        !waiver.fee_types.length ||
        !waiver.fund_id ||
        !waiver.description?.trim() // Added description validation
      ) {
        errors.push(
          `ছাত্র আইডি ${studentId} এর জন্য প্রয়োজনীয় ক্ষেত্রগুলি পূরণ করুন (ফি প্রকার, ওয়েভার পরিমাণ, শিক্ষাবর্ষ, ফান্ড, বর্ণনা)।`
        );
        return null;
      }

      if (parseFloat(waiver.waiver_amount) > 100) {
        errors.push(
          `ছাত্র আইডি ${studentId} এর জন্য ওয়েভার পরিমাণ ১০০% এর বেশি হতে পারবে না।`
        );
        return null;
      }

      return {
        student_id: waiver.student_id,
        waiver_amount: parseFloat(waiver.waiver_amount),
        academic_year: waiver.academic_year,
        description: waiver.description.trim(), // Remove || null since it's now required
        fee_types: waiver.fee_types,
        fund_id: waiver.fund_id,
        created_by: parseInt(localStorage.getItem("userId")) || 1,
        updated_by: parseInt(localStorage.getItem("userId")) || 1,
      };
    });

    if (errors.length > 0) {
      toast.error(errors.join("\n"));
      return;
    }

    try {
      const validPayloads = payloads.filter((p) => p !== null);
      await Promise.all(
        validPayloads.map((payload) => createWaiver(payload).unwrap())
      );
      toast.success("ওয়েভারগুলি সফলভাবে তৈরি হয়েছে!");
      setSelectedStudents([]);
      setStudentWaivers({});
      setSelectedClassId(null);
      setSearchQuery("");
    } catch (err) {
      toast.error(`ওয়েভার তৈরি ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    }
  };

  // Edit button handler
  const handleEditClick = (waiver) => {
    if (!hasChangePermission) {
      toast.error("ওয়েভার সম্পাদনা করার অনুমতি নেই।");
      return;
    }
    setEditWaiverId(waiver.id);
    setEditWaiverData({
      student_id: waiver.student_id,
      waiver_amount: waiver.waiver_amount.toString(),
      academic_year: waiver.academic_year,
      description: waiver.description || "",
      fee_types: waiver.fee_types || [],
      fund_id: waiver.fund_id || null,
    });
    setIsAdd(false);
  };

  // Update waiver
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error("ওয়েভার আপডেট করার অনুমতি নেই।");
      return;
    }
    if (
      !editWaiverData.student_id ||
      !editWaiverData.waiver_amount ||
      !editWaiverData.academic_year ||
      !editWaiverData.fee_types.length ||
      !editWaiverData.fund_id
    ) {
      toast.error(
        "ছাত্র, ফি প্রকার, ওয়েভার পরিমাণ, শিক্ষাবর্ষ এবং ফান্ড পূরণ করুন।"
      );
      return;
    }
    if (parseFloat(editWaiverData.waiver_amount) > 100) {
      toast.error("ওয়েভার পরিমাণ ১০০% এর বেশি হতে পারবে না।");
      return;
    }

    try {
      const payload = {
        id: editWaiverId,
        student_id: editWaiverData.student_id,
        waiver_amount: parseFloat(editWaiverData.waiver_amount),
        academic_year: editWaiverData.academic_year,
        description: editWaiverData.description.trim() || null,
        fee_types: editWaiverData.fee_types,
        fund_id: editWaiverData.fund_id,
        updated_by: parseInt(localStorage.getItem("userId")) || 1,
      };
      await updateWaiver(payload).unwrap();
      toast.success("ওয়েভার সফলভাবে আপডেট হয়েছে!");
      setEditWaiverId(null);
      setEditWaiverData({
        student_id: null,
        waiver_amount: "",
        academic_year: null,
        description: "",
        fee_types: [],
        fund_id: null,
      });
      setIsAdd(true);
    } catch (err) {
      toast.error(`ওয়েভার আপডেট ব্যর্থ: ${err.status || "ত্রুটি"}`);
    }
  };

  // Delete waiver
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error("ওয়েভার মুছে ফেলার অনুমতি নেই।");
      return;
    }
    setDeleteWaiverId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!hasDeletePermission) {
      toast.error("ওয়েভার মুছে ফেলার অনুমতি নেই।");
      return;
    }
    try {
      await deleteWaiver(deleteWaiverId).unwrap();
      toast.success("ওয়েভার সফলভাবে মুছে ফেলা হয়েছে!");
      setIsModalOpen(false);
      setDeleteWaiverId(null);
    } catch (err) {
      toast.error(`ওয়েভার মুছতে ব্যর্থ: ${err.status || "ত্রুটি"}`);
      setIsModalOpen(false);
      setDeleteWaiverId(null);
    }
  };

  // Generate PDF report
  const generatePDFReport = () => {
    if (!hasViewPermission) {
      toast.error("ওয়েভার প্রতিবেদন দেখার অনুমতি নেই।");
      return;
    }

    if (
      isWaiverLoading ||
      isStudentLoading ||
      isAcademicYearLoading ||
      isFeeHeadsLoading ||
      isFundsLoading ||
      isInstituteLoading
    ) {
      toast.error("তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।");
      return;
    }

    if (filteredWaivers.length === 0) {
      toast.error("নির্বাচিত ফিল্টারে কোনো ওয়েভার পাওয়া যায়নি।");
      return;
    }

    if (!institute) {
      toast.error("ইনস্টিটিউট তথ্য পাওয়া যায়নি!");
      return;
    }

    const printWindow = window.open("", "_blank");

    // Group waivers into pages (assuming ~20 rows per page to fit A4 landscape)
    const rowsPerPage = 20;
    const waiverPages = [];
    for (let i = 0; i < filteredWaivers.length; i += rowsPerPage) {
      waiverPages.push(filteredWaivers.slice(i, i + rowsPerPage));
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ওয়েভার প্রতিবেদন</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 landscape; 
            padding: 5mm;
          }
          body { 
            font-family: 'Noto Sans Bengali', Arial, sans-serif;  
            font-size: 12px; 
            margin: 20px;
            padding: 0;
            background-color: #ffffff;
            color: #000;
                      position: relative;

          }
                      .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
          opacity: 0.1;
          width: 500px;
          height: 500px;
          pointer-events: none;
          text-align: center;
        }
        .watermark img {
          width: 500px;
          height: 500px;
          display: block;
        }
        .watermark.fallback::before {
          content: 'লোগো লোড হয়নি';
          color: #666;
          font-size: 16px;
          font-style: italic;
        }
          .page-container {
            width: 100%;
            min-height: 190mm;
            page-break-after: always;
          }
          .page-container:last-child {
            page-break-after: auto;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 10px; 
            margin-top: 10px;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: center; 
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
            color: #000;
            text-transform: uppercase;
          }
          td { 
            color: #000; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 15px; 
            padding-bottom: 10px;
          }
          .institute-info {
            margin-bottom: 10px;
          }
          .institute-info h1 {
            font-size: 22px;
            margin: 0;
            color: #000;
          }
          .institute-info p {
            font-size: 14px;
            margin: 5px 0;
            color: #000;
          }
          .title {
            font-size: 18px;
            color: #DB9E30;
            margin: 10px 0;
          }
          .date { 
            margin-top: 20px; 
            text-align: right; 
            font-size: 10px; 
            color: #000;
          }
        </style>
      </head>
      <body>
      ${
        institute.institute_logo
          ? `
            <div class="watermark">
              <img id="watermark-logo" src="${institute.institute_logo}" alt="Institute Logo" />
            </div>
          `
          : `
            <div class="watermark fallback"></div>
          `
      }
        ${waiverPages
        .map(
          (pageWaivers, pageIndex) => `
          <div class="page-container">
            <div class="header">
              <div class="institute-info">
                <h1>${institute.institute_name || "অজানা ইনস্টিটিউট"}</h1>
                <p>${institute.institute_address || "ঠিকানা উপলব্ধ নয়"}</p>
              </div>
              <h2 class="title">ওয়েভার প্রতিবেদন</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 150px;">ছাত্র</th>
                  <th style="width: 80px;">বৃত্তির পরিমাণ (%)</th>
                  <th style="width: 80px;">শিক্ষাবর্ষ</th>
                  <th style="width: 150px;">ফি প্রকার</th>
                  <th style="width: 100px;">ফান্ড</th>
                  <th style="width: 200px;">বর্ণনা</th>
                </tr>
              </thead>
              <tbody>
                ${pageWaivers
              .map(
                (waiver) => `
                  <tr>
                    <td>${getStudentName(waiver.student_id)}</td>
                    <td>${waiver.waiver_amount}%</td>
                    <td>${getAcademicYearName(waiver.academic_year)}</td>
                    <td>${getFeeTypeNames(waiver.fee_types)}</td>
                    <td>${getFundName(waiver.fund_id)}</td>
                    <td>${waiver.description || "-"}</td>
                  </tr>
                `
              )
              .join("")}
              </tbody>
            </table>
            <div class="date">
              রিপোর্ট তৈরির তারিখ: ${new Date().toLocaleDateString("bn-BD")}
            </div>
          </div>
        `
        )
        .join("")}
      <script>
        let printAttempted = false;
        window.onbeforeprint = () => { printAttempted = true; };
        window.onafterprint = () => { window.close(); };
        window.addEventListener('beforeunload', (event) => {
          if (!printAttempted) { window.close(); }
        });

        // Wait for the logo to load before printing
        const logo = document.getElementById('watermark-logo');
        if (logo) {
          logo.onload = () => {
            console.log('Logo loaded successfully');
            window.print();
          };
          logo.onerror = () => {
            console.warn('Logo failed to load, proceeding with print.');
            document.querySelector('.watermark').classList.add('fallback');
            window.print();
          };
        } else {
          window.print();
        }
      </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success("প্রতিবেদন সফলভাবে তৈরি হয়েছে!");
  };

  // View-only mode for users with only view permission
  if (
    hasViewPermission &&
    !hasAddPermission &&
    !hasChangePermission &&
    !hasDeletePermission
  ) {
    return (
      <div className="py-8 w-full relative">
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn py-2 px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-[#441a05]">
              ওয়েভার তালিকা
            </h3>

            {/* Filter Section (View Only Mode) */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="text"
                value={waiverListFilters.studentSearch}
                onChange={(e) =>
                  setWaiverListFilters({
                    ...waiverListFilters,
                    studentSearch: e.target.value,
                  })
                }
                className="w-full sm:w-auto bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="ছাত্রের নাম বা আইডি অনুসন্ধান"
              />
              <select
                value={waiverListFilters.feeTypeId || ""}
                onChange={(e) =>
                  setWaiverListFilters({
                    ...waiverListFilters,
                    feeTypeId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="bg-transparent min-w-[150px] text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg w-full sm:w-auto"
              >
                <option value="">ফি প্রকার নির্বাচন</option>
                {feeTypeOptions.map((fee) => (
                  <option key={fee.value} value={fee.value}>
                    {fee.label}
                  </option>
                ))}
              </select>
              <button
                onClick={generatePDFReport}
                className="report-button w-full sm:w-auto bg-[#441a05] text-white py-2 px-4 rounded-lg hover:bg-[#5a2e0a] transition-colors"
                title="Download Waiver Report"
              >
                <FaFilePdf className="inline-block mr-2" /> রিপোর্ট
              </button>
            </div>
          </div>

          {/* Waiver List Table (View Only Mode) */}
          <div className="overflow-y-auto max-h-[60vh]">
            {isWaiverLoading ||
              isStudentLoading ||
              isAcademicYearLoading ||
              isFeeHeadsLoading ||
              isFundsLoading ? (
              <p className="p-4 text-[#441a05]/70">ওয়েভার লোড হচ্ছে...</p>
            ) : filteredWaivers.length === 0 ? (
              <p className="p-4 text-[#441a05]/70">
                কোনো ওয়েভার পাওয়া যায়নি।
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ছাত্র
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        বৃত্তির পরিমাণ (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        শিক্ষাবর্ষ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ফি প্রকার
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ফান্ড
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        বর্ণনা
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {filteredWaivers.map((waiver, index) => (
                      <tr
                        key={waiver.id}
                        className="bg-white/5 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {students?.find((s) => s.id === waiver.student_id)
                            ?.name || `ছাত্র ${waiver.student_id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {waiver.waiver_amount}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {academicYears?.find(
                            (y) => y.id === waiver.academic_year
                          )?.name || `বছর ${waiver.academic_year}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {waiver.fee_types
                            .map(
                              (id) =>
                                feeTypeOptions.find((opt) => opt.value === id)
                                  ?.label || `ফি ${id}`
                            )
                            .join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {fundOptions.find(
                            (opt) => opt.value === waiver.fund_id
                          )?.label || `ফান্ড ${waiver.fund_id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          {waiver.description || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (permissionsLoading) {
    return (
      <div className="p-4 text-[#441a05]/70 animate-fadeIn">লোড হচ্ছে...</div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="p-4 text-red-400 animate-fadeIn">
        এই পৃষ্ঠাটি দেখার অনুমতি নেই।
      </div>
    );
  }

  return (
    <div className="py-8 w-full relative">
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
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
          .report-button {
            background-color: #441a05;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            transition: background-color 0.3s;
          }
          .report-button:hover {
            background-color: #5a2e0a;
          }
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
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
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23441a05' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.5rem center;
            background-size: 1.5em;
          }
        `}
      </style>

      {/* Modal */}
      {(hasAddPermission || hasChangePermission || hasDeletePermission) &&
        isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                ওয়েভার মুছে ফেলা নিশ্চিত করুন
              </h3>
              <p className="text-[#441a05] mb-6">
                আপনি কি নিশ্চিত যে এই ওয়েভারটি মুছে ফেলতে চান?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  aria-label="বাতিল"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${isDeleting
                      ? "cursor-not-allowed opacity-60"
                      : "hover:text-white"
                    }`}
                  aria-label="নিশ্চিত করুন"
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

      {/* Add Waiver Form */}
      {hasAddPermission && isAdd && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              নতুন ওয়েভার যোগ করুন
            </h3>
          </div>

          {/* Class Selection and Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Select
              options={classOptions}
              value={
                classOptions.find(
                  (option) => option.value === selectedClassId
                ) || null
              }
              onChange={(selected) => {
                setSelectedClassId(selected?.value || null);
                setSelectedStudents([]);
                setStudentWaivers({});
                setSearchQuery("");
              }}
              placeholder="ক্লাস নির্বাচন করুন"
              isLoading={isClassLoading}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="w-full"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="নাম বা ইউজার আইডি দিয়ে অনুসন্ধান করুন"
              disabled={isStudentLoading || !selectedClassId}
            />
          </div>

          {/* Student Selection Table */}
          {selectedClassId && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-[#441a05] mb-4">
                ছাত্র নির্বাচন করুন
              </h4>
              {isStudentLoading ? (
                <p className="text-[#441a05]/70">ছাত্রদের লোড হচ্ছে...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-[#441a05]/70">কোনো ছাত্র পাওয়া যায়নি।</p>
              ) : (
                <div className="overflow-x-auto max-h-[30vh]">
                  <table className="min-w-full divide-y divide-white/20">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          নির্বাচন
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          নাম
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          ইউজার আইডি
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          ফি প্রকার
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          ওয়েভার পরিমাণ (%)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          শিক্ষাবর্ষ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          ফান্ড
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                          বর্ণনা
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20">
                      {filteredStudents.map((student, index) => {
                        const waiver = studentWaivers[student.id] || {};
                        const isDisabled =
                          isCreating || !selectedStudents.includes(student.id);
                        const disabledClass = isDisabled
                          ? "opacity-40 cursor-not-allowed"
                          : "";

                        return (
                          <tr
                            key={student.id}
                            className="bg-white/5 animate-fadeIn"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedStudents.includes(
                                    student.id
                                  )}
                                  onChange={() =>
                                    handleStudentToggle(student.id)
                                  }
                                  className="hidden"
                                />
                                <span
                                  className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn ${selectedStudents.includes(student.id)
                                      ? "bg-[#DB9E30] border-[#DB9E30]"
                                      : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                                    }`}
                                >
                                  {selectedStudents.includes(student.id) && (
                                    <svg
                                      className="w-4 h-4 text-[#441a05] animate-scaleIn"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </span>
                              </label>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                              {student.user_id}
                            </td>

                            {/* Fee Types Select */}
                            <td className="px-6 py-4 whitespace-nowrap min-w-[300px]">
                              <Select
                                isMulti
                                options={feeTypeOptions}
                                value={feeTypeOptions.filter((option) =>
                                  waiver.fee_types?.includes(option.value)
                                )}
                                onChange={(selected) =>
                                  handleWaiverChange(
                                    student.id,
                                    "fee_types",
                                    selected.map((opt) => opt.value)
                                  )
                                }
                                placeholder="ফি প্রকার নির্বাচন"
                                isLoading={isFeeHeadsLoading}
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                className={`w-full max-w-xs ${disabledClass}`}
                                isDisabled={isDisabled}
                              />
                            </td>

                            {/* Waiver Amount Input */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={waiver.waiver_amount || ""}
                                onChange={(e) =>
                                  handleWaiverChange(
                                    student.id,
                                    "waiver_amount",
                                    e.target.value
                                  )
                                }
                                className={`w-[120px] bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 ${disabledClass}`}
                                placeholder="পরিমাণ (%)"
                                disabled={isDisabled}
                                min="0"
                                max="100"
                                step="0.01"
                              />
                            </td>

                            {/* Academic Year Select */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Select
                                options={academicYearOptions}
                                value={
                                  academicYearOptions.find(
                                    (option) =>
                                      option.value === waiver.academic_year
                                  ) || null
                                }
                                onChange={(selected) =>
                                  handleWaiverChange(
                                    student.id,
                                    "academic_year",
                                    selected?.value || null
                                  )
                                }
                                placeholder="শিক্ষাবর্ষ নির্বাচন"
                                isLoading={isAcademicYearLoading}
                                styles={selectStyles}
                                className={`w-full max-w-xs ${disabledClass}`}
                                isDisabled={isDisabled}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                              />
                            </td>

                            {/* Fund Select */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Select
                                options={fundOptions}
                                value={
                                  fundOptions.find(
                                    (option) => option.value === waiver.fund_id
                                  ) || null
                                }
                                onChange={(selected) =>
                                  handleWaiverChange(
                                    student.id,
                                    "fund_id",
                                    selected?.value || null
                                  )
                                }
                                placeholder="ফান্ড নির্বাচন"
                                isLoading={isFundsLoading}
                                styles={selectStyles}
                                className={`w-full max-w-xs ${disabledClass}`}
                                isDisabled={isDisabled}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                              />
                            </td>

                            {/* Description Input */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={waiver.description || ""}
                                onChange={(e) =>
                                  handleWaiverChange(
                                    student.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className={`w-[200px] bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 ${disabledClass} ${!waiver.description?.trim()
                                    ? "border-red-400"
                                    : ""
                                  }`}
                                placeholder="বর্ণনা (আবশ্যক)*"
                                disabled={isDisabled}
                                required
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Selected Students Data Table */}
          {selectedStudents.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-[#441a05] mb-4">
                নির্বাচিত ছাত্রদের তথ্য
              </h4>
              <div className="overflow-x-auto max-h-[30vh]">
                <table className="min-w-full divide-y divide-white/20">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        নাম
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ইউজার আইডি
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ফি প্রকার
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ওয়েভার পরিমাণ (%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        শিক্ষাবর্ষ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ফান্ড
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        বর্ণনা
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20">
                    {selectedStudents.map((studentId, index) => {
                      const student = students?.find((s) => s.id === studentId);
                      const waiver = studentWaivers[studentId] || {};
                      return (
                        <tr
                          key={studentId}
                          className="bg-white/5 animate-fadeIn"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {student?.name || `ছাত্র ${studentId}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {student?.user_id || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {waiver.fee_types
                              ?.map(
                                (id) =>
                                  feeTypeOptions.find((opt) => opt.value === id)
                                    ?.label || `ফি ${id}`
                              )
                              .join(", ") || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {waiver.waiver_amount || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {academicYearOptions.find(
                              (opt) => opt.value === waiver.academic_year
                            )?.label || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {fundOptions.find(
                              (opt) => opt.value === waiver.fund_id
                            )?.label || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                            {waiver.description || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedStudents.length > 0 && (
            <button
              onClick={handleSubmitWaivers}
              disabled={isCreating}
              title="ওয়েভার তৈরি করুন"
              className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${isCreating
                  ? "cursor-not-allowed opacity-70"
                  : "hover:text-white btn-glow"
                }`}
              aria-label="ওয়েভার তৈরি করুন"
            >
              {isCreating ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>তৈরি হচ্ছে...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>ওয়েভার তৈরি করুন</span>
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {/* Edit Waiver Form */}
      {hasChangePermission && !isAdd && (
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <FaEdit className="text-3xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              ওয়েভার সম্পাদনা করুন
            </h3>
          </div>
          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl"
          >
            <Select
              options={
                students?.map((s) => ({
                  value: s.id,
                  label: `${s.name} - ${s.user_id}`,
                })) || []
              }
              value={
                students?.find((s) => s.id === editWaiverData.student_id)
                  ? {
                    value: editWaiverData.student_id,
                    label: `${students.find((s) => s.id === editWaiverData.student_id)
                        .name
                      } - ${students.find((s) => s.id === editWaiverData.student_id)
                        .user_id
                      }`,
                  }
                  : null
              }
              onChange={(selected) =>
                setEditWaiverData({
                  ...editWaiverData,
                  student_id: selected?.value || null,
                })
              }
              placeholder="ছাত্র নির্বাচন করুন"
              isLoading={isStudentLoading}
              styles={selectStyles}
              className="w-full"
              isDisabled={isUpdating}
              aria-label="ছাত্র নির্বাচন করুন"
            />
            <div className="w-full md:min-w-[300px]"> {/* Adjust width as needed */}
              <Select
                isMulti
                options={feeTypeOptions}
                value={feeTypeOptions.filter((option) =>
                  editWaiverData.fee_types.includes(option.value)
                )}
                onChange={(selected) =>
                  setEditWaiverData({
                    ...editWaiverData,
                    fee_types: selected.map((opt) => opt.value),
                  })
                }
                placeholder="ফি প্রকার নির্বাচন"
                isLoading={isFeeHeadsLoading}
                styles={selectStyles}
                className="w-full"
                isDisabled={isUpdating}
                aria-label="ফি প্রকার নির্বাচন"
              />
            </div>
            <input
              type="number"
              value={editWaiverData.waiver_amount}
              onChange={(e) => {
                if (e.target.value > 100) {
                  toast.error("ওয়েভার পরিমাণ ১০০% এর বেশি হতে পারবে না।");
                  return;
                }
                setEditWaiverData({
                  ...editWaiverData,
                  waiver_amount: e.target.value,
                });
              }}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
              placeholder="ওয়েভার পরিমাণ (%)"
              disabled={isUpdating}
              min="0"
              max="100"
              step="0.01"
              aria-label="ওয়েভার পরিমাণ"
            />
            <Select
              options={academicYearOptions}
              value={
                academicYearOptions.find(
                  (option) => option.value === editWaiverData.academic_year
                ) || null
              }
              onChange={(selected) =>
                setEditWaiverData({
                  ...editWaiverData,
                  academic_year: selected?.value || null,
                })
              }
              placeholder="শিক্ষাবর্ষ নির্বাচন"
              isLoading={isAcademicYearLoading}
              styles={selectStyles}
              className="w-full"
              isDisabled={isUpdating}
              aria-label="শিক্ষাবর্ষ নির্বাচন"
            />
            <Select
              options={fundOptions}
              value={
                fundOptions.find(
                  (option) => option.value === editWaiverData.fund_id
                ) || null
              }
              onChange={(selected) =>
                setEditWaiverData({
                  ...editWaiverData,
                  fund_id: selected?.value || null,
                })
              }
              placeholder="ফান্ড নির্বাচন"
              isLoading={isFundsLoading}
              styles={selectStyles}
              className="w-full"
              isDisabled={isUpdating}
              aria-label="ফান্ড নির্বাচন"
            />
            <input
              type="text"
              value={editWaiverData.description}
              onChange={(e) =>
                setEditWaiverData({
                  ...editWaiverData,
                  description: e.target.value,
                })
              }
              className={`w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn ${!editWaiverData.description?.trim() ? "border-red-400" : ""
                }`}
              placeholder="বর্ণনা (আবশ্যক)*"
              disabled={isUpdating}
              aria-label="বর্ণনা"
              required
            />
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isUpdating}
                title="ওয়েভার আপডেট করুন"
                className={`relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${isUpdating
                    ? "cursor-not-allowed opacity-70"
                    : "hover:text-white btn-glow"
                  }`}
                aria-label="ওয়েভার আপডেট করুন"
              >
                {isUpdating ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>আপডেট হচ্ছে...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <FaEdit className="w-5 h-5" />
                    <span>ওয়েভার আপডেট করুন</span>
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditWaiverId(null);
                  setEditWaiverData({
                    student_id: null,
                    waiver_amount: "",
                    academic_year: null,
                    description: "",
                    fee_types: [],
                    fund_id: null,
                  });
                  setIsAdd(true);
                }}
                title="সম্পাদনা বাতিল করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500/20 text-[#441a05] hover:bg-gray-500/30 transition-all duration-300 animate-scaleIn"
                aria-label="বাতিল"
              >
                বাতিল
              </button>
            </div>
          </form>
          {(createError || updateError) && (
            <div
              id="form-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
            >
              <p id="form-error">
                ত্রুটি: {createError?.status || updateError?.status || "অজানা"}{" "}
                - {JSON.stringify(createError?.data || updateError?.data || {})}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Waiver List */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn py-2 px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05]">
            ওয়েভার তালিকা
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Student Search Filter */}
            <input
              type="text"
              value={waiverListFilters.studentSearch}
              onChange={(e) =>
                setWaiverListFilters({
                  ...waiverListFilters,
                  studentSearch: e.target.value,
                })
              }
              className="w-[200px] bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="ছাত্রের নাম বা আইডি"
            />
            {/* Fee Type Filter */}
            <select
              value={waiverListFilters.feeTypeId || ""}
              onChange={(e) =>
                setWaiverListFilters({
                  ...waiverListFilters,
                  feeTypeId: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="bg-transparent min-w-[180px] text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg sm:w-auto"
            >
              <option value="">ফি প্রকার নির্বাচন</option>
              {feeTypeOptions.map((fee) => (
                <option key={fee.value} value={fee.value}>
                  {fee.label}
                </option>
              ))}
            </select>
            <button
              onClick={generatePDFReport}
              className="report-button w-full sm:w-auto"
              title="Download Waiver Report"
            >
              <FaFilePdf className="inline-block mr-2" /> রিপোর্ট
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[60vh]">
          {isWaiverLoading ||
            isStudentLoading ||
            isAcademicYearLoading ||
            isFeeHeadsLoading ||
            isFundsLoading ? (
            <p className="p-4 text-[#441a05]/70">ওয়েভার লোড হচ্ছে...</p>
          ) : filteredWaivers.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো ওয়েভার পাওয়া যায়নি।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ছাত্র
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      বৃত্তির পরিমাণ (%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শিক্ষাবর্ষ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ফি প্রকার
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ফান্ড
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      বর্ণনা
                    </th>
                    {(hasChangePermission || hasDeletePermission) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        অ্যাকশন
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredWaivers.map((waiver, index) => (
                    <tr
                      key={waiver.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {students?.find((s) => s.id === waiver.student_id)
                          ?.name || `ছাত্র ${waiver.student_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {waiver.waiver_amount}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {academicYears?.find(
                          (y) => y.id === waiver.academic_year
                        )?.name || `বছর ${waiver.academic_year}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {waiver.fee_types
                          .map(
                            (id) =>
                              feeTypeOptions.find((opt) => opt.value === id)
                                ?.label || `ফি ${id}`
                          )
                          .join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {fundOptions.find((opt) => opt.value === waiver.fund_id)
                          ?.label || `ফান্ড ${waiver.fund_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {waiver.description || "-"}
                      </td>
                      {(hasChangePermission || hasDeletePermission) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {hasChangePermission && (
                            <button
                              onClick={() => handleEditClick(waiver)}
                              title="ওয়েভার সম্পাদনা করুন"
                              className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                              aria-label="ওয়েভার সম্পাদনা করুন"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                          )}
                          {hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(waiver.id)}
                              title="ওয়েভার মুছুন"
                              className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                              aria-label="ওয়েভার মুছুন"
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
        </div>
        {(isDeleting || deleteError) && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            {isDeleting
              ? "মুছছে..."
              : `ওয়েভার মুছতে ত্রুটি: ${deleteError?.status || "অজানা"
              } - ${JSON.stringify(deleteError?.data || {})}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddWaivers;
