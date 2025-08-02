import React, { useState, useCallback } from "react";
import { FaEdit, FaSpinner, FaTrash, FaDownload } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import debounce from "lodash.debounce";
import {
  useDeleteStaffListApIMutation,
  useGetStaffListApIQuery,
  useUpdateStaffListApIMutation,
} from "../../../redux/features/api/staff/staffListApi";
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
} from "@react-pdf/renderer";
import { useGetInstituteLatestQuery } from "../../../redux/features/api/institute/instituteLatestApi";

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

// Simple Professional PDF Document Component for Staff


const StaffList = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    name: "",
    user_id: "",
    phone_number: "",
    email: "",
    designation: "",
  });
  const [editStaffId, setEditStaffId] = useState(null);
  const [editStaffData, setEditStaffData] = useState({
    name: "",
    user_id: "",
    phone_number: "",
    email: "",
    designation: "",
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
    groupPermissions?.some((perm) => perm.codename === "view_staffprofile") ||
    false;
  const hasChangePermission =
    groupPermissions?.some((perm) => perm.codename === "change_staffprofile") ||
    false;
  const hasDeletePermission =
    groupPermissions?.some((perm) => perm.codename === "delete_staffprofile") ||
    false;

  // Fetch staff data
  const {
    data: staffData,
    isLoading,
    isError,
    error,
  } = useGetStaffListApIQuery(
    {
      page,
      page_size: pageSize,
      ...filters,
    },
    { skip: !hasViewPermission }
  );
  console.log("staffData", staffData);
  const [updateStaff, { isLoading: isUpdating, error: updateError }] =
    useUpdateStaffListApIMutation();
  const [deleteStaff, { isLoading: isDeleting, error: deleteError }] =
    useDeleteStaffListApIMutation();
      const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();

  const staff = staffData?.staff || [];
  const totalItems = staffData?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = !!staffData?.next;
  const hasPreviousPage = !!staffData?.previous;

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
  const handleEditClick = (staffMember) => {
    if (!hasChangePermission) {
      toast.error("স্টাফের তথ্য সম্পাদনা করার অনুমতি নেই।");
      return;
    }
    setEditStaffId(staffMember.id);
    setEditStaffData({
      name: staffMember.name,
      user_id: staffMember.user_id,
      phone_number: staffMember.phone_number,
      email: staffMember.email,
      designation: staffMember.designation,
    });
  };

  // Handle update form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasChangePermission) {
      toast.error("স্টাফের তথ্য আপডেট করার অনুমতি নেই।");
      return;
    }
    if (!editStaffData.name.trim()) {
      toast.error("অনুগ্রহ করে স্টাফের নাম লিখুন");
      return;
    }
    try {
      await updateStaff({ id: editStaffId, ...editStaffData }).unwrap();
      toast.success("স্টাফের তথ্য সফলভাবে আপডেট হয়েছে!");
      setEditStaffId(null);
      setEditStaffData({
        name: "",
        user_id: "",
        phone_number: "",
        email: "",
        designation: "",
      });
    } catch (err) {
      console.error("Error updating staff:", err);
      toast.error(`স্টাফের তথ্য আপডেট ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    }
  };

  // Handle delete
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error("স্টাফ মুছে ফেলার অনুমতি নেই।");
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
          toast.error("স্টাফ মুছে ফেলার অনুমতি নেই।");
          return;
        }
        await deleteStaff(modalData.id).unwrap();
        toast.success("স্টাফ সফলভাবে মুছে ফেলা হয়েছে!");
      }
    } catch (err) {
      console.error("Error deleting staff:", err);
      toast.error(`স্টাফ মুছে ফেলা ব্যর্থ: ${err.status || "অজানা ত্রুটি"}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle Profile PDF Download
  const handleDownloadProfile = async (staffMember) => {
    if (!hasViewPermission) {
      toast.error("প্রোফাইল দেখার অনুমতি নেই।");
      return;
    }

    try {
      const doc = <StaffProfilePDF staff={staffMember} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const fileName = `স্টাফ_প্রোফাইল_${staffMember.name || "অজানা"}_${
        staffMember.user_id || "N/A"
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

  if (isLoading || permissionsLoading) {
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
    { key: "phone_number", label: "ফোন নম্বর", fixed: false, width: "120px" },
    { key: "email", label: "ইমেইল", fixed: false, width: "150px" },
    { key: "designation", label: "পদবী", fixed: false, width: "120px" },
    { key: "department", label: "বিভাগ", fixed: false, width: "120px" },
    { key: "status", label: "স্ট্যাটাস", fixed: false, width: "100px" },
    {
      key: "actions",
      label: "কার্যক্রম",
      fixed: false,
      width: "120px",
      actions: true,
    },
  ];




const StaffProfilePDF = ({ staff }) => {

  


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

  // Basic information
  const basicData = [
    { label: "নাম", value: staff.name || "N/A" },
    { label: "ইউজার আইডি", value: staff.user_id || "N/A" },
    { label: "পদবী", value: staff.designation || "N/A" },
    { label: "বিভাগ", value: staff.department || "N/A" },
    { label: "যোগদানের তারিখ", value: staff.joining_date || "N/A" },
  ];

  // Personal information in two columns
  const personalData = [
    {
      label1: "ফোন নম্বর",
      value1: staff.phone_number || "N/A",
      label2: "ইমেইল",
      value2: staff.email || "N/A",
    },
    {
      label1: "জন্ম তারিখ",
      value1: staff.date_of_birth || "N/A",
      label2: "লিঙ্গ",
      value2: staff.gender || "N/A",
    },
    {
      label1: "রক্তের গ্রুপ",
      value1: staff.blood_group || "N/A",
      label2: "ধর্ম",
      value2: staff.religion || "N/A",
    },
    {
      label1: "জাতীয় পরিচয়পত্র",
      value1: staff.nid || "N/A",
      label2: "বৈবাহিক অবস্থা",
      value2: staff.marital_status || "N/A",
    },
  ];

  // Family information
  const familyData = [
    {
      label1: "বাবার নাম",
      value1: staff.father_name || "N/A",
      label2: "মায়ের নাম",
      value2: staff.mother_name || "N/A",
    },
    {
      label1: "স্বামী/স্ত্রীর নাম",
      value1: staff.spouse_name || "N/A",
      label2: "সন্তানের সংখ্যা",
      value2: staff.children_count || "N/A",
    },
  ];

  // Emergency contact
  const emergencyData = [
    {
      label1: "জরুরি যোগাযোগ",
      value1: staff.emergency_contact || "N/A",
      label2: "সম্পর্ক",
      value2: staff.emergency_relation || "N/A",
    },
  ];

  // Address
  const fullAddress =
    [staff.village, staff.post_office, staff.upazila, staff.district]
      .filter(Boolean)
      .join(", ") ||
    staff.address ||
    "N/A";

  const addressData = [
    { label: "বর্তমান ঠিকানা", value: fullAddress },
    { label: "স্থায়ী ঠিকানা", value: fullAddress },
  ];

  // Educational information
  const educationData = [
    { label: "শিক্ষাগত যোগ্যতা", value: staff.education || "N/A" },
    { label: "প্রতিষ্ঠান", value: staff.institution || "N/A" },
    { label: "পাসের বছর", value: staff.passing_year || "N/A" },
    { label: "বিষয়", value: staff.subject || "N/A" },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.schoolName}>{institute.institute_name || 'আদর্শ বিদ্যালয়, ঢাকা'}</Text>
          <Text style={styles.schoolAddress}>
           {institute.institute_address || '১২৩ মেইন রোড, ঢাকা, বাংলাদেশ'}
          </Text>
          <Text style={styles.title}>স্টাফ তথ্য প্রতিবেদন</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {/* Basic Information */}
            <Text style={styles.sectionTitle}>মৌলিক তথ্য</Text>
            {renderSimpleTable(basicData)}

            {/* Personal Information */}
            <Text style={styles.sectionTitle}>ব্যক্তিগত তথ্য</Text>
            {renderTwoColumnTable(personalData)}

            {/* Family Information */}
            <Text style={styles.sectionTitle}>পারিবারিক তথ্য</Text>
            {renderTwoColumnTable(familyData)}

            {/* Emergency Contact */}
            <Text style={styles.sectionTitle}>জরুরি যোগাযোগ</Text>
            {renderTwoColumnTable(emergencyData)}

            {/* Address Information */}
            <Text style={styles.sectionTitle}>ঠিকানা</Text>
            {renderSimpleTable(addressData)}

            {/* Educational Information */}
            <Text style={styles.sectionTitle}>শিক্ষাগত তথ্য</Text>
            {renderSimpleTable(educationData)}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {/* Photo */}
            <View style={styles.photoBox}>
              <Text style={styles.photoText}>স্টাফের{"\n"}ছবি</Text>
            </View>

            {/* Status */}
            <View style={styles.statusRow}>
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>
                  স্ট্যাটাস:{" "}
                  {staff.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>স্টাফের স্বাক্ষর</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>এইচআর স্বাক্ষর</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>প্রশাসনিক স্বাক্ষর</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          প্রতিবেদন তৈরি: {new Date().toLocaleDateString("bn-BD")} | আদর্শ
          বিদ্যালয় - স্টাফ ব্যবস্থাপনা সিস্টেম
        </Text>
      </Page>
    </Document>
  );
};








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
            background: rgba(255, 255, 255, 0.2);
          }

          table {
            width: 100%; /* Ensure table takes full width, allowing horizontal scroll */
            border-collapse: separate;
            text-align:center !important;
            border-spacing: 0;
          }
          
          .sticky-header th {
            text-align:center !important;
            font-size: 12px !important;
            text-wrap:nowrap;
            position: sticky;
            top: 0;
            background: #DB9E30;
            backdrop-filter: blur(10px);
            z-index: 2;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 12px 16px;
          }

          /* Styles for fixed columns (both header and body cells) */
          .fixed-col {
            position: sticky;
          font-size:14px;
            background: white;
            // backdrop-filter: blur(10px);
            transition: transform 0.3s ease; /* Smooth transition for fixed columns */
          }
          
          .fixed-col.serial { 
           font-size: 12px !important;
            left: 0px; 
            background: #DB9E30;
            color: rgba(255, 255, 255, 0.9);
            
          }
          .fixed-col.name { 
      
            left: 70px;
            background: rgba(255, 255, 255);
          }
          .fixed-col.user_id { 
            z-index:10px;
            left: 220px;
            background: rgba(255, 255, 255);
          }

          /* Ensure fixed header cells match the background */
          .sticky-header .fixed-col.serial {
            z-index: 10;
            background: #DB9E30;
            color: rgba(255, 255, 255);
          }
          .sticky-header .fixed-col.name {
            z-index: 10;
            background: #DB9E30;
            color: rgba(255, 255, 255);
          }
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
          
          .table-row-edit {
            background: rgba(219, 158, 48, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(219, 158, 48, 0.3);
          }
          
          .table-cell {
          text-wrap:nowrap;
          font-size:14px;
            padding: 12px 16px;
            color: #441a05;
            font-weight: 500;
           border-right: 1px solid rgba(219, 158, 64, 0.15);
border: 1px solid rgba(0, 0, 0, 0.05);

          }

          td {
            background: transparent;
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
            color: #000;
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
            background: rgba(0, 0, 0, 0.10);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          
          .edit-form-card {
            background: rgba(219, 158, 48, 0.1);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(219, 158, 48, 0.3);
            box-shadow: 0 8px 32px rgba(219, 158, 48, 0.1);
          }
        `}
      </style>

      <div className="filter-card p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <h3 className="text-2xl font-bold text-[#441a05] tracking-tight mb-6">
          স্টাফ তালিকা
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
              name="phone_number"
              value={filters.phone_number}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 outline-none border border-black/20 rounded-lg transition-all duration-300 focus:border-[#DB9E30]"
              placeholder="ফোন নম্বর"
            />
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 outline-none border border-black/20 rounded-lg transition-all duration-300 focus:border-[#DB9E30]"
              placeholder="ইমেইল"
            />
            <input
              type="text"
              name="designation"
              value={filters.designation}
              onChange={handleFilterChange}
              className="w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 outline-none border border-black/20 rounded-lg transition-all duration-300 focus:border-[#DB9E30]"
              placeholder="পদবী"
            />
          </div>
        </div>

        {/* Edit Staff Form */}
        {editStaffId && hasChangePermission && (
          <div className="edit-form-card p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6">
              <FaEdit className="text-3xl text-[#441a05]" />
              <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
                স্টাফের তথ্য সম্পাদনা
              </h3>
            </div>
            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl"
            >
              <input
                type="text"
                name="name"
                value={editStaffData.name}
                onChange={(e) =>
                  setEditStaffData({ ...editStaffData, name: e.target.value })
                }
                className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 border border-white/20 rounded-lg transition-all duration-300 animate-scaleIn focus:border-[#DB9E30] focus:bg-white/20"
                placeholder="নাম"
                disabled={isUpdating || !hasChangePermission}
              />
              <input
                type="text"
                name="user_id"
                value={editStaffData.user_id}
                onChange={(e) =>
                  setEditStaffData({
                    ...editStaffData,
                    user_id: e.target.value,
                  })
                }
                className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 border border-white/20 rounded-lg transition-all duration-300 animate-scaleIn focus:border-[#DB9E30] focus:bg-white/20"
                placeholder="ইউজার আইডি"
                disabled={isUpdating || !hasChangePermission}
              />
              <input
                type="text"
                name="phone_number"
                value={editStaffData.phone_number}
                onChange={(e) =>
                  setEditStaffData({
                    ...editStaffData,
                    phone_number: e.target.value,
                  })
                }
                className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 border border-white/20 rounded-lg transition-all duration-300 animate-scaleIn focus:border-[#DB9E30] focus:bg-white/20"
                placeholder="ফোন নম্বর"
                disabled={isUpdating || !hasChangePermission}
              />
              <input
                type="email"
                name="email"
                value={editStaffData.email}
                onChange={(e) =>
                  setEditStaffData({ ...editStaffData, email: e.target.value })
                }
                className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 border border-white/20 rounded-lg transition-all duration-300 animate-scaleIn focus:border-[#DB9E30] focus:bg-white/20"
                placeholder="ইমেইল"
                disabled={isUpdating || !hasChangePermission}
              />
              <input
                type="text"
                name="designation"
                value={editStaffData.designation}
                onChange={(e) =>
                  setEditStaffData({
                    ...editStaffData,
                    designation: e.target.value,
                  })
                }
                className="w-full bg-white/10 backdrop-blur-sm text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 border border-white/20 rounded-lg transition-all duration-300 animate-scaleIn focus:border-[#DB9E30] focus:bg-white/20"
                placeholder="পদবী"
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
                  setEditStaffId(null);
                  setEditStaffData({
                    name: "",
                    user_id: "",
                    phone_number: "",
                    email: "",
                    designation: "",
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

        {/* Staff Table */}
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
          ) : staff.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো স্টাফ পাওয়া যায়নি।</p>
          ) : (
            <table className="min-w-full">
              <thead className="sticky-header">
                <tr>
                  {tableHeaders.map((header) => {
                    const isFixed = header.fixed;
                    const headerClasses = `table-cell text-xs font-medium uppercase tracking-wider ${
                      isFixed ? `${header.key}` : ""
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
                {staff.map((staffMember, index) => {
                  const serial = (page - 1) * pageSize + index + 1;
                  const rowClasses = `table-row ${
                    editStaffId === staffMember.id ? "table-row-edit" : ""
                  } animate-fadeIn`;

                  return (
                    <tr
                      key={staffMember.id}
                      className={rowClasses}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Fixed Columns */}
                      <td
                        className="table-cell serial"
                        style={{ width: "70px" }}
                      >
                        {serial}
                      </td>
                      <td
                        className="table-cell name"
                        style={{ width: "150px" }}
                      >
                        <div className="font-semibold">{staffMember.name}</div>
                        {staffMember.designation && (
                          <div className="text-xs opacity-75">
                            {staffMember.designation}
                          </div>
                        )}
                      </td>
                      <td
                        className="table-cell user_id"
                        style={{ width: "120px" }}
                      >
                        <span className="font-mono px-2 py-1 rounded text-xs">
                          {staffMember.user_id}
                        </span>
                      </td>

                      {/* Scrollable Columns */}
                      <td className="table-cell" style={{ width: "120px" }}>
                        {staffMember.phone_number || "N/A"}
                      </td>
                      <td className="table-cell" style={{ width: "150px" }}>
                        {staffMember.email || "N/A"}
                      </td>
                      <td className="table-cell" style={{ width: "120px" }}>
                        {staffMember.designation || "N/A"}
                      </td>
                      <td className="table-cell" style={{ width: "120px" }}>
                        {staffMember.department || "N/A"}
                      </td>
                      <td className="table-cell" style={{ width: "100px" }}>
                        <span
                          className={`status-badge ${
                            staffMember.status === "active"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {staffMember.status === "active"
                            ? "সক্রিয়"
                            : "নিষ্ক্রিয়"}
                        </span>
                      </td>

                      {/* Actions */}
                      {(hasChangePermission ||
                        hasDeletePermission ||
                        hasViewPermission) && (
                        <td className="table-cell" style={{ width: "120px" }}>
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleDownloadProfile(staffMember)}
                              className="action-button action-view"
                              aria-label={`প্রোফাইল দেখুন ${staffMember.name}`}
                              title="প্রোফাইল দেখুন (PDF ডাউনলোড)"
                            >
                              <FaDownload className="w-4 h-4" />
                            </button>
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
                ? "স্টাফ মুছছে..."
                : `স্টাফ মুছতে ত্রুটি: ${
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
              স্টাফ মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই স্টাফটিকে মুছে ফেলতে চান?
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

export default StaffList;
