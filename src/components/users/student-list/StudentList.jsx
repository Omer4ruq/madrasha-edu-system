import React, { useState, useCallback, useRef, useMemo } from "react";
import { FaEdit, FaSpinner, FaTrash, FaEye, FaDownload } from "react-icons/fa";
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

// --- PDF Imports and Setup ---
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
  Image,
} from "@react-pdf/renderer";

// Register Noto Sans Bengali font
try {
  Font.register({
    family: "NotoSansBengali",
    src: "https://fonts.gstatic.com/ea/notosansbengali/v3/NotoSansBengali-Regular.ttf",
  });
} catch (error) {
  console.error("Font registration failed:", error);
  Font.register({
    family: "Helvetica",
    src: "https://fonts.gstatic.com/s/helvetica/v13/Helvetica.ttf",
  });
}

// Simple Professional PDF Styles for Academic Use
const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: "NotoSansBengali",
    fontSize: 9,
    color: "#000000",
    backgroundColor: "#ffffff",
    lineHeight: 1.2,
  },

  // Header
  header: {
    textAlign: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  schoolAddress: {
    fontSize: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textDecoration: "underline",
  },

  // Main content layout
  mainContent: {
    flexDirection: "row",
    marginTop: 10,
  },
  leftSection: {
    width: "65%",
    paddingRight: 15,
  },
  rightSection: {
    width: "35%",
    alignItems: "center",
  },

  // Photo
  photoBox: {
    width: 100,
    height: 120,
    border: "2px solid #000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  photoText: {
    fontSize: 8,
    textAlign: "center",
  },

  // Section headers
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    padding: 4,
    marginTop: 8,
    marginBottom: 5,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#000000",
  },

  // Information table
  table: {
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
    minHeight: 18,
  },
  labelCell: {
    width: "35%",
    padding: 3,
    fontSize: 8,
    fontWeight: "bold",
    backgroundColor: "#f8f8f8",
    borderRightWidth: 0.5,
    borderRightColor: "#cccccc",
  },
  valueCell: {
    width: "65%",
    padding: 3,
    fontSize: 8,
  },

  // Two column table
  twoColRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
    minHeight: 18,
  },
  twoColLabel1: {
    width: "18%",
    padding: 3,
    fontSize: 8,
    fontWeight: "bold",
    backgroundColor: "#f8f8f8",
    borderRightWidth: 0.5,
    borderRightColor: "#cccccc",
  },
  twoColValue1: {
    width: "32%",
    padding: 3,
    fontSize: 8,
    borderRightWidth: 0.5,
    borderRightColor: "#cccccc",
  },
  twoColLabel2: {
    width: "18%",
    padding: 3,
    fontSize: 8,
    fontWeight: "bold",
    backgroundColor: "#f8f8f8",
    borderRightWidth: 0.5,
    borderRightColor: "#cccccc",
  },
  twoColValue2: {
    width: "32%",
    padding: 3,
    fontSize: 8,
  },

  // Status and signatures
  statusRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 15,
  },
  statusBox: {
    padding: 4,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#f0f0f0",
  },
  statusText: {
    fontSize: 8,
    fontWeight: "bold",
  },

  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
  },
  signatureBox: {
    width: "30%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    height: 15,
    marginBottom: 3,
  },
  signatureLabel: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },

  footer: {
    position: "absolute",
    bottom: 15,
    left: 25,
    right: 25,
    textAlign: "center",
    fontSize: 7,
    color: "#666666",
  },
});

// Simple Professional PDF Document Component
const StudentProfilePDF = ({ student }) => {
  const renderSimpleTable = (data) => (
    <View style={styles.table}>
      {data.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={styles.labelCell}>{item.label}</Text>
          <Text style={styles.valueCell}>{item.value}</Text>
        </View>
      ))}
    </View>
  );

  const renderTwoColumnTable = (data) => (
    <View style={styles.table}>
      {data.map((row, index) => (
        <View key={index} style={styles.twoColRow}>
          <Text style={styles.twoColLabel1}>{row.label1}</Text>
          <Text style={styles.twoColValue1}>{row.value1}</Text>
          <Text style={styles.twoColLabel2}>{row.label2}</Text>
          <Text style={styles.twoColValue2}>{row.value2}</Text>
        </View>
      ))}
    </View>
  );

  // Academic information
  const academicData = [
    { label: "ক্লাস", value: student.class_name || "N/A" },
    { label: "সেকশন", value: student.section_name || "N/A" },
    { label: "শিফট", value: student.shift_name || "N/A" },
    { label: "রোল নং", value: student.roll_no || "N/A" },
    { label: "ভর্তির বছর", value: student.admission_year || "N/A" },
  ];

  // Personal information in two columns
  const personalData = [
    {
      label1: "নাম",
      value1: student.name || "N/A",
      label2: "আইডি নং",
      value2: student.user_id || "N/A",
    },
    {
      label1: "জন্ম তারিখ",
      value1: student.dob || "N/A",
      label2: "লিঙ্গ",
      value2: student.gender || "N/A",
    },
    {
      label1: "রক্তের গ্রুপ",
      value1: student.blood_group || "N/A",
      label2: "ধর্ম",
      value2: student.religion || "N/A",
    },
    {
      label1: "মোবাইল নং",
      value1: student.phone_number || "N/A",
      label2: "ইমেইল",
      value2: student.email || "N/A",
    },
  ];

  // Family information
  const familyData = [
    {
      label1: "বাবার নাম",
      value1: student.father_name || "N/A",
      label2: "মায়ের নাম",
      value2: student.mother_name || "N/A",
    },
    {
      label1: "অভিভাবক",
      value1: student.guardian || "N/A",
      label2: "অভিভাবকের ফোন",
      value2: student.guardian_phone || "N/A",
    },
  ];

  // Address
  const fullAddress =
    [
      student.village,
      student.post_office,
      student.ps_or_upazilla,
      student.district,
    ]
      .filter(Boolean)
      .join(", ") || "N/A";

  const addressData = [
    { label: "বর্তমান ঠিকানা", value: fullAddress },
    { label: "স্থায়ী ঠিকানা", value: fullAddress },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.schoolName}>আদর্শ বিদ্যালয়</Text>
          <Text style={styles.schoolAddress}>
            ঢাকা, বাংলাদেশ | ফোন: ০১৭xxxxxxxx | ইমেইল: info@school.edu.bd
          </Text>
          <Text style={styles.title}>ছাত্র তথ্য প্রতিবেদন</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {/* Academic Information */}
            <Text style={styles.sectionTitle}>একাডেমিক তথ্য</Text>
            {renderSimpleTable(academicData)}

            {/* Personal Information */}
            <Text style={styles.sectionTitle}>ব্যক্তিগত তথ্য</Text>
            {renderTwoColumnTable(personalData)}

            {/* Family Information */}
            <Text style={styles.sectionTitle}>পারিবারিক তথ্য</Text>
            {renderTwoColumnTable(familyData)}

            {/* Address Information */}
            <Text style={styles.sectionTitle}>ঠিকানা</Text>
            {renderSimpleTable(addressData)}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {/* Photo */}
            <View style={styles.photoBox}>
              <Text style={styles.photoText}>ছাত্রের{"\n"}ছবি</Text>
            </View>

            {/* Status */}
            {/* <View style={styles.statusRow}>
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>
                  স্ট্যাটাস: {student.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </Text>
              </View>
            </View> */}
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>ছাত্রের স্বাক্ষর</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>অভিভাবকের স্বাক্ষর</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>প্রশাসনিক স্বাক্ষর</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          প্রতিবেদন তৈরি: {new Date().toLocaleDateString("bn-BD")} | আদর্শ
          বিদ্যালয় - ছাত্র ব্যবস্থাপনা সিস্টেম
        </Text>
      </Page>
    </Document>
  );
};

const StudentList = () => {
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
  const handleEditClick = (student) => {
    if (!hasChangePermission) {
      toast.error("ছাত্রের তথ্য সম্পাদনা করার অনুমতি নেই।");
      return;
    }
    setEditStudentId(student.id);
    setEditStudentData({
      name: student.name,
      user_id: student.user_id,
      class_name: student.class_name,
      section_name: student.section_name,
      shift_name: student.shift_name,
    });
  };

  // Handle update form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error("ছাত্রের তথ্য আপডেট করার অনুমতি নেই।");
      return;
    }
    if (!editStudentData.name.trim()) {
      toast.error("অনুগ্রহ করে ছাত্রের নাম লিখুন");
      return;
    }
    try {
      await updateStudent({ id: editStudentId, ...editStudentData }).unwrap();
      toast.success("ছাত্রের তথ্য সফলভাবে আপডেট হয়েছে!");
      setEditStudentId(null);
      setEditStudentData({
        name: "",
        user_id: "",
        class_name: "",
        section_name: "",
        shift_name: "",
      });
    } catch (err) {
      console.error("Error updating student:", err);
      toast.error(`ছাত্রের তথ্য আপডেট ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    }
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

    try {
      const doc = <StudentProfilePDF student={student} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const fileName = `ছাত্র_প্রোফাইল_${student.name || "অজানা"}_${
        student.user_id || "N/A"
      }_${new Date().toLocaleDateString("bn-BD")}.pdf`;

      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("প্রোফাইল সফলভাবে ডাউনলোড হয়েছে!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(
        `প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || "অজানা ত্রুটি"}`
      );
    }
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      background: "rgba(255, 255, 255, 0.1)",
      borderColor: "#9d9087",
      borderRadius: "0.5rem",
      padding: "0.2rem",
      color: "#441a05",
      boxShadow: "none",
      backdropFilter: "blur(10px)",
      "&:hover": {
        borderColor: "#DB9E30",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#DB9E30"
        : state.isFocused
        ? "#DB9E30"
        : "rgba(255, 255, 255, 0.9)",
      color: state.isSelected || state.isFocused ? "#fff" : "#441a05",
      "&:hover": {
        backgroundColor: "#94640f",
        color: "#fff",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#441a05",
    }),
    menu: (provided) => ({
      ...provided,
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      borderRadius: "0.5rem",
      border: "1px solid #9d9087",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#441a05",
      opacity: 0.7,
    }),
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
    { key: "name", label: "নাম", fixed: true, width: "150px" },
    { key: "user_id", label: "ইউজার আইডি", fixed: true, width: "120px" },
    { key: "roll_no", label: "রোল", fixed: false, width: "80px" },
    { key: "class_name", label: "ক্লাস", fixed: false, width: "100px" },
    { key: "section_name", label: "সেকশন", fixed: false, width: "100px" },
    { key: "shift_name", label: "শিফট", fixed: false, width: "100px" },
    // { key: 'status', label: 'স্ট্যাটাস', fixed: false, width: '100px' },
    { key: "phone_number", label: "ফোন নম্বর", fixed: false, width: "120px" },
    { key: "dob", label: "জন্ম তারিখ", fixed: false, width: "120px" },
    { key: "gender", label: "লিঙ্গ", fixed: false, width: "80px" },
    { key: "father_name", label: "বাবার নাম", fixed: false, width: "120px" },
    { key: "mother_name", label: "মায়ের নাম", fixed: false, width: "120px" },
    {
      key: "admission_year",
      label: "ভর্তির বছর",
      fixed: false,
      width: "120px",
    },
    {
      key: "actions",
      label: "কার্যক্রম",
      fixed: false,
      width: "120px",
      actions: true,
    },
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
          
          /* Enhanced Table Styles with Professional Background */
          .table-container {
            position: relative;
            max-height: 70vh;
            overflow: auto; /* Handles both vertical and horizontal scrolling */
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 1rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          table {
            width: 100%; /* Ensure table takes full width of container, allowing horizontal scroll if content overflows */
            border-collapse: separate; /* Required for sticky positioning on cells */
            border-spacing: 0;
          }
          
          .sticky-header th {
            position: sticky;
            top: 0;
            background: rgba(68, 26, 5, 0.95); /* Slightly less opaque to show blur */
            backdrop-filter: blur(10px);
            z-index: 20; /* Higher than fixed-col cells */
            border-bottom: 2px solid rgba(219, 158, 48, 0.3);
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: left; /* Ensure text alignment is consistent */
            padding: 12px 16px; /* Consistent padding */
          }

          /* Styles for fixed columns (both header and body cells) */
          .fixed-col {
            position: sticky;
            z-index: 10; /* Lower than header (20), but higher than regular cells */
            /* Default background for fixed columns - can be overridden by specific ones below */
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-right: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          /* Specific left positioning for each fixed column */
          .fixed-col.serial { 
            left: 0px; 
            /* Using a slightly darker/more opaque background for the first fixed column for distinction */
            background: rgba(68, 26, 5, 0.85); /* Corrected RGBA with alpha */
            color: rgba(255, 255, 255, 0.9); /* Lighter text for contrast */
          }
          .fixed-col.name { 
            left: 70px; /* Width of serial column */
            background: rgba(255, 255, 255, 0.15); /* Slightly different background for visual separation */
          }
          .fixed-col.user_id { 
            left: 220px; /* Width of serial (70) + name (150) */
            background: rgba(255, 255, 255, 0.2); /* Slightly different background for visual separation */
          }

          /* Ensure fixed header cells also use the specific backgrounds */
          .sticky-header .fixed-col.serial {
            background: rgba(68, 26, 5, 0.95); /* Match header background */
            color: rgba(255, 255, 255, 0.9);
          }
          .sticky-header .fixed-col.name {
            background: rgba(68, 26, 5, 0.95); /* Match header background */
            color: rgba(255, 255, 255, 0.9);
          }
          .sticky-header .fixed-col.user_id {
            background: rgba(68, 26, 5, 0.95); /* Match header background */
            color: rgba(255, 255, 255, 0.9);
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
          
          .table-row-edit {
            background: rgba(219, 158, 48, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(219, 158, 48, 0.3);
          }
          
          .table-cell {
            padding: 12px 16px;
            color: #441a05;
            font-weight: 500;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            /* This is important for separating sticky cells from the next scrolling cell */
            border-left: 1px solid rgba(255, 255, 255, 0.1); /* Added for better separation */
          }

          /* Ensure table cells don't have white background that conflicts with fixed-col */
          td {
            background: transparent; /* Cells should not have a solid background by default if they are inside a transparent row */
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
            background: rgba(239, 68, 68, 0.2);
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
          
          .action-view:hover { background: rgba(34, 197, 94, 0.2); color: #059669; }
          .action-edit:hover { background: rgba(59, 130, 246, 0.2); color: #2563eb; }
          .action-delete:hover { background: rgba(239, 68, 68, 0.2); color: #dc2626; }
          
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
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .edit-form-card {
            background: rgba(219, 158, 48, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(219, 158, 48, 0.3);
            box-shadow: 0 8px 32px rgba(219, 158, 48, 0.1);
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
              className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 outline-none border border-white/20 rounded-lg transition-all duration-300 focus:border-[#DB9E30] focus:bg-white/20"
              placeholder="নাম"
            />
            <input
              type="text"
              name="user_id"
              value={filters.user_id}
              onChange={handleFilterChange}
              className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 outline-none border border-white/20 rounded-lg transition-all duration-300 focus:border-[#DB9E30] focus:bg-white/20"
              placeholder="ইউজার আইডি"
            />
            <input
              type="text"
              name="roll"
              value={filters.roll}
              onChange={handleFilterChange}
              className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 outline-none border border-white/20 rounded-lg transition-all duration-300 focus:border-[#DB9E30] focus:bg-white/20"
              placeholder="রোল"
            />
            <input
              type="text"
              name="phone"
              value={filters.phone}
              onChange={handleFilterChange}
              className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 outline-none border border-white/20 rounded-lg transition-all duration-300 focus:border-[#DB9E30] focus:bg-white/20"
              placeholder="ফোন নম্বর"
            />
            <Select
              name="class"
              options={classOptions}
              onChange={handleSelectChange}
              placeholder="ক্লাস"
              isClearable
              isLoading={isClassesLoading}
              styles={customSelectStyles}
              className="w-full"
            />
            <Select
              name="section"
              options={sectionOptions}
              onChange={handleSelectChange}
              placeholder="সেকশন"
              isClearable
              isLoading={isSectionsLoading}
              styles={customSelectStyles}
              className="w-full"
            />
            <Select
              name="shift"
              options={shiftOptions}
              onChange={handleSelectChange}
              placeholder="শিফট"
              isClearable
              isLoading={isShiftsLoading}
              styles={customSelectStyles}
              className="w-full"
            />
            <Select
              name="admission_year"
              options={academicYearOptions}
              onChange={handleSelectChange}
              placeholder="ভর্তির বছর"
              isClearable
              isLoading={isAcademicYearsLoading}
              styles={customSelectStyles}
              className="w-full"
            />
            <Select
              name="status"
              options={statusOptions}
              onChange={handleSelectChange}
              placeholder="স্ট্যাটাস"
              isClearable
              styles={customSelectStyles}
              className="w-full"
            />
          </div>
        </div>

        {/* Edit Student Form */}
        {editStudentId && hasChangePermission && (
          <div className="edit-form-card p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
                ছাত্রের তথ্য সম্পাদনা
              </h3>
            </div>
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl"
            >
              <input
                type="text"
                name="name"
                value={editStudentData.name}
                onChange={(e) =>
                  setEditStudentData({
                    ...editStudentData,
                    name: e.target.value,
                  })
                }
                className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 border border-white/20 rounded-lg transition-all duration-300 animate-scaleIn focus:border-[#DB9E30] focus:bg-white/20"
                placeholder="নাম"
                disabled={isUpdating || !hasChangePermission}
              />
              <input
                type="text"
                name="user_id"
                value={editStudentData.user_id}
                onChange={(e) =>
                  setEditStudentData({
                    ...editStudentData,
                    user_id: e.target.value,
                  })
                }
                className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 border border-white/20 rounded-lg transition-all duration-300 animate-scaleIn focus:border-[#DB9E30] focus:bg-white/20"
                placeholder="ইউজার আইডি"
                disabled={isUpdating || !hasChangePermission}
              />
              <input
                type="text"
                name="class_name"
                value={editStudentData.class_name}
                onChange={(e) =>
                  setEditStudentData({
                    ...editStudentData,
                    class_name: e.target.value,
                  })
                }
                className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 border border-white/20 rounded-lg transition-all duration-300 animate-scaleIn focus:border-[#DB9E30] focus:bg-white/20"
                placeholder="ক্লাস"
                disabled={isUpdating || !hasChangePermission}
              />
              <input
                type="text"
                name="section_name"
                value={editStudentData.section_name}
                onChange={(e) =>
                  setEditStudentData({
                    ...editStudentData,
                    section_name: e.target.value,
                  })
                }
                className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 border border-white/20 rounded-lg transition-all duration-300 animate-scaleIn focus:border-[#DB9E30] focus:bg-white/20"
                placeholder="সেকশন"
                disabled={isUpdating || !hasChangePermission}
              />
              <input
                type="text"
                name="shift_name"
                value={editStudentData.shift_name}
                onChange={(e) =>
                  setEditStudentData({
                    ...editStudentData,
                    shift_name: e.target.value,
                  })
                }
                className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 border border-white/20 rounded-lg transition-all duration-300 animate-scaleIn focus:border-[#DB9E30] focus:bg-white/20"
                placeholder="শিফট"
                disabled={isUpdating || !hasChangePermission}
              />
              <button
                type="submit"
                disabled={isUpdating || !hasChangePermission}
                className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn btn-glow ${
                  isUpdating || !hasChangePermission
                    ? "cursor-not-allowed opacity-70"
                    : "hover:text-white hover:shadow-md"
                }`}
              >
                {isUpdating ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>আপডেট হচ্ছে...</span>
                  </span>
                ) : (
                  <span>আপডেট করুন</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditStudentId(null);
                  setEditStudentData({
                    name: "",
                    user_id: "",
                    class_name: "",
                    section_name: "",
                    shift_name: "",
                  });
                }}
                className="flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-gray-500/20 text-[#441a05] hover:bg-gray-500/30 hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            </form>
            {updateError && (
              <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
                ত্রুটি: {updateError?.status || "অজানা"} -{" "}
                {JSON.stringify(updateError?.data || {})}
              </div>
            )}
          </div>
        )}

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
            <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
              <thead className="sticky-header">
                <tr>
                  {tableHeaders.map((header) => {
                    const isFixed = header.fixed;
                    const headerClasses = `table-cell text-xs font-medium uppercase tracking-wider  ${
                      isFixed ? `fixed-col ${header.key}` : ""
                    }`;
                    const style = { width: header.width };
                    return (
                      <th
                        key={header.key}
                        className={headerClasses}
                        style={style}
                      >
                        {header.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const serial = (page - 1) * pageSize + index + 1;
                  const rowClasses = `table-row ${
                    editStudentId === student.id ? "table-row-edit" : ""
                  } animate-fadeIn`;

                  return (
                    <tr
                      key={student.id}
                      className={rowClasses}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Fixed Columns */}
                      <td
                        className="table-cell fixed-col serial"
                        style={{ width: "70px" }}
                      >
                        {serial}
                      </td>
                      <td
                        className="table-cell fixed-col name "
                        style={{ width: "150px" }}
                      >
                        <div className="font-semibold">{student.name}</div>
                        {student.name_in_bangla && (
                          <div className="text-xs opacity-75">
                            {student.name_in_bangla}
                          </div>
                        )}
                      </td>
                      <td
                        className="table-cell fixed-col user_id "
                        style={{ width: "120px" }}
                      >
                        <span className="font-mono /20 px- py-1 rounded text-xs">
                          {student.user_id}
                        </span>
                      </td>

                      {/* Scrollable Columns */}
                      <td
                        className="table-cell "
                        style={{ width: "80px" }}
                      >
                        {student.roll_no || "N/A"}
                      </td>
                      <td
                        className="table-cell "
                        style={{ width: "100px" }}
                      >
                        {student.class_name}
                      </td>
                      <td
                        className="table-cell "
                        style={{ width: "100px" }}
                      >
                        {student.section_name}
                      </td>
                      <td
                        className="table-cell "
                        style={{ width: "100px" }}
                      >
                        {student.shift_name}
                      </td>
                      {/* <td className="table-cell" style={{ width: '100px' }}>
                        <span className={`status-badge ${student.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                          {student.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td> */}
                      <td
                        className="table-cell  "
                        style={{ width: "120px" }}
                      >
                        {student.phone_number || "N/A"}
                      </td>
                      <td
                        className="table-cell "
                        style={{ width: "120px" }}
                      >
                        {student.dob || "N/A"}
                      </td>
                      <td
                        className="table-cell "
                        style={{ width: "80px" }}
                      >
                        {student.gender || "N/A"}
                      </td>
                      <td
                        className="table-cell "
                        style={{ width: "120px" }}
                      >
                        {student.father_name || "N/A"}
                      </td>
                      <td
                        className="table-cell "
                        style={{ width: "120px" }}
                      >
                        {student.mother_name || "N/A"}
                      </td>
                      <td
                        className="table-cell"
                        style={{ width: "120px" }}
                      >
                        {student.admission_year || "N/A"}
                      </td>

                      {/* Actions */}
                      {(hasChangePermission ||
                        hasDeletePermission ||
                        hasViewPermission) && (
                        <td className="table-cell" style={{ width: "120px" }}>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownloadProfile(student)}
                              className="action-button action-view"
                              aria-label={`প্রোফাইল দেখুন ${student.name}`}
                              title="প্রোফাইল দেখুন (PDF ডাউনলোড)"
                            >
                              <FaDownload className="w-4 h-4" />
                            </button>
                            {hasChangePermission && (
                              <button
                                onClick={() => handleEditClick(student)}
                                className="action-button action-edit"
                                aria-label={`সম্পাদনা ${student.name}`}
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
                      )}
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
                : `ছাত্র মুছতে ত্রুটি: ${
                    deleteError?.status || "অজানা"
                  } - ${JSON.stringify(deleteError?.data || {})}`}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!hasPreviousPage}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 btn-glow ${
                !hasPreviousPage
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
                className={`px-3 py-1 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm ${
                  page === pageNumber
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
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 btn-glow ${
                !hasNextPage
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
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow backdrop-blur-sm ${
                  isDeleting
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