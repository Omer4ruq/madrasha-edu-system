import React, { useRef, useState, useMemo } from "react";
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";
import Select from "react-select";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useGetStudentActiveApiQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";
import selectStyles from "../../utilitis/selectStyles";
import frame from "../../../public/images/frame.jpg";

const Testimonial = () => {
  const printRef = useRef();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  // Fetch institute data
  const {
    data: instituteData,
    isLoading: isInstituteLoading,
    error: instituteError,
  } = useGetInstituteLatestQuery();

  // Fetch active students
  const {
    data: studentsData,
    isLoading: isStudentsLoading,
    error: studentsError,
  } = useGetStudentActiveApiQuery();
  const studentOptions = useMemo(
    () =>
      studentsData?.map((student) => ({
        value: student.id,
        label: `${student.name} (${student.username})`,
        ...student,
      })) || [],
    [studentsData]
  );

  // Fetch academic years
  const {
    data: yearsData,
    isLoading: isYearsLoading,
    error: yearsError,
  } = useGetAcademicYearApiQuery();
  const yearOptions = useMemo(
    () =>
      yearsData?.map((year) => ({
        value: year.id,
        label: year.name,
      })) || [],
    [yearsData]
  );

  // Handle PDF download
  const handleDownloadPDF = () => {
    const toastId = toast.loading("প্রত্যয়ন পত্র ডাউনলোড হচ্ছে...");
    try {
      html2pdf()
        .from(printRef.current)
        .set({
          margin: 0,
          filename: selectedStudent
            ? `${selectedStudent.name}_certificate.pdf`
            : "certificate.pdf",
          image: { type: "jpeg", quality: 1 },
          html2canvas: {
            scale: 3,
            useCORS: true,
            scrollY: 0,
            backgroundColor: null,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "landscape",
          },
        })
        .save();
      toast.success("প্রত্যয়ন পত্র সফলভাবে ডাউনলোড হয়েছে!", { id: toastId });
    } catch (err) {
      toast.error(`ত্রুটি: ${err.message || "অজানা"}`, { id: toastId });
    }
  };

  // Handle print
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: selectedStudent
      ? `${selectedStudent.name}_certificate`
      : "certificate",
    removeAfterPrint: true,
    onAfterPrint: () => toast.success("প্রত্যয়ন পত্র প্রিন্ট করা হয়েছে!"),
    onPrintError: () => toast.error("প্রিন্ট করতে ত্রুটি ঘটেছে!"),
  });

  // Auto-grow textarea
  const autoGrow = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Render certificate content
  const renderCertificate = () => {
    if (!selectedStudent || !selectedYear) {
      return (
        <p className="p-4 text-[#441a05]/70 animate-fadeIn">
          ছাত্র এবং শিক্ষাবর্ষ নির্বাচন করুন
        </p>
      );
    }
    if (isStudentsLoading || isYearsLoading || isInstituteLoading) {
      return (
        <p className="p-4 text-[#441a05]/70 animate-fadeIn">
          <FaSpinner className="animate-spin text-lg mr-2" />
          প্রত্যয়ন পত্র ডেটা লোড হচ্ছে...
        </p>
      );
    }
    if (instituteError) {
      return (
        <div
          className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
          style={{ animationDelay: "0.4s" }}
        >
          ইনস্টিটিউট ত্রুটি: {instituteError.status || "অজানা"} -{" "}
          {JSON.stringify(instituteError.data || {})}
        </div>
      );
    }
    if (studentsError) {
      return (
        <div
          className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
          style={{ animationDelay: "0.4s" }}
        >
          ছাত্র ত্রুটি: {studentsError.status || "অজানা"} -{" "}
          {JSON.stringify(studentsError.data || {})}
        </div>
      );
    }
    if (yearsError) {
      return (
        <div
          className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
          style={{ animationDelay: "0.4s" }}
        >
          শিক্ষাবর্ষ ত্রুটি: {yearsError.status || "অজানা"} -{" "}
          {JSON.stringify(yearsError.data || {})}
        </div>
      );
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("bn-BD", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return (
      <div
        ref={printRef}
        className="relative mx-auto print:bg-[url('/images/frame.jpg')]"
        style={{
          backgroundImage: `url(${frame})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          width: "297mm", // A4 landscape width
          height: "210mm", // A4 landscape height
          boxSizing: "border-box",
          padding: "20mm 30mm", // Adjusted margins for A4
          fontFamily: "'Noto Sans Bengali', sans-serif",
        }}
      >
        {/* Logo */}
        <img
          src={instituteData?.institute_logo || "/logo.png"}
          alt="Logo"
          className="absolute top-[20mm] left-[25mm] w-[30mm] h-[30mm] object-contain"
        />

        {/* Header */}
        <div className="text-center mt-[3mm]">
          <h1
            className={`font-bold text-[#441a05] ${
              (instituteData?.institute_name || "আল ফারুক মাদ্রাসা").length > 30
                ? "text-[8mm]"
                : "text-[10mm]"
            }`}
          >
            {instituteData?.institute_name || "আল ফারুক মাদ্রাসা"}
          </h1>
          <p className="text-[6mm] mt-[3mm]">
            {instituteData?.institute_address || "কালিগঞ্জ, গাজীপুর"}
          </p>
          <p className="text-[5mm] my-[2mm]">
            {instituteData?.headmaster_mobile || "০১৭১২৩৪৫৬৭৮"}
          </p>
          <h1 className="bg-[#441a05] text-white px-[10mm] mt-[3mm] w-fit mx-auto text-[6mm] py-[2mm] rounded-[10mm]">
            <span className="translate-y-[-12px]">প্রত্যয়ন পত্র</span>
          </h1>
        </div>

        {/* Serial and Date */}
        <div className="flex justify-between mt-[0mm] text-[5mm] text-[#441a05]">
          <div>
            ক্রমিকঃ{" "}
            <input
              className="border-b border-[#441a05] w-[20mm] text-center bg-transparent"
              defaultValue="১"
            />
          </div>
          <div>
            তারিখঃ{" "}
            <input
              className="w-[30mm] text-center bg-transparent border-b border-[#441a05]"
              defaultValue={formattedDate}
            />
          </div>
        </div>

        {/* Certificate Body */}
        <div className="mt-[8mm] space-y-[4mm] text-[5mm] text-[#441a05] leading-relaxed">
          <p className="flex gap-[2mm] flex-wrap">
            এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,
            <textarea
              onInput={autoGrow}
              value={selectedStudent?.name || "মোঃ আব্দুল করিম"}
              className="w-[80mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              readOnly
            />
          </p>
          <p className="flex gap-[2mm] flex-wrap">
            পিতা:
            <textarea
              onInput={autoGrow}
              value={selectedStudent?.father_name || "মোঃ রফিকুল ইসলাম"}
              className="w-[60mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              readOnly
            />
            মাতা:
            <textarea
              onInput={autoGrow}
              value={selectedStudent?.mother_name || "মোছাঃ রাবেয়া খাতুন"}
              className="w-[60mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              readOnly
            />
            ।
          </p>
          <p className="flex gap-[2mm] flex-wrap">
            গ্রাম:
            <textarea
              onInput={autoGrow}
              value={selectedStudent?.village || "আউটপাড়া"}
              className="w-[30mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              readOnly
            />
            ডাক:
            <textarea
              onInput={autoGrow}
              value={selectedStudent?.post_office || "মাওনা"}
              className="w-[30mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              readOnly
            />
            উপজেলা:
            <textarea
              onInput={autoGrow}
              value={selectedStudent?.ps_or_upazilla || "সদর"}
              className="w-[30mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              readOnly
            />
            থানা:
            <textarea
              onInput={autoGrow}
              value={selectedStudent?.ps_or_upazilla || "সদর"}
              className="w-[30mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              readOnly
            />
            ।
          </p>
          <p className="flex gap-[2mm] flex-wrap">
            জেলা:
            <textarea
              onInput={autoGrow}
              value={selectedStudent?.district || "গাজীপুর"}
              className="w-[30mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              readOnly
            />
            ভর্তি রেজিস্ট্রি নম্বর:
            <textarea
              onInput={autoGrow}
              // value={selectedStudent?.username || "১১১"}
              className="w-[30mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              // readOnly
            />
            এবং জন্ম তারিখ:
            <textarea
              onInput={autoGrow}
              value={selectedStudent?.dob || "১৫/০৫/১৯৮৮"}
              className="w-[25mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              readOnly
            />
            ।
          </p>
          <p className="flex gap-[2mm] flex-wrap">
            সে অত্র মাদরাসায়
            <textarea
              onInput={autoGrow}
              // value={selectedStudent?.class_name || "দ্বিতীয়"}
              className="w-[30mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              // readOnly
            />
            হতে
            <textarea
              onInput={autoGrow}
              // value={selectedStudent?.class_name || "পঞ্চম"}
              className="w-[30mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              // readOnly
            />
            পর্যন্ত অধ্যয়ন করতঃ বিগত
            <textarea
              onInput={autoGrow}
              // value={selectedYear?.label || "২০২৪"}
              className="w-[20mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              // readOnly
            />
            শিক্ষাবর্ষে
            <textarea
              onInput={autoGrow}
              // value={selectedYear?.label || "২০২৪"}
              className="w-[20mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              // readOnly
            />
            বোর্ড পরীক্ষায় অংশগ্রহণ করে মোট নাম্বার
            <textarea
              onInput={autoGrow}
              defaultValue="৭৬৫"
              className="w-[20mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            এবং
            <textarea
              onInput={autoGrow}
              placeholder="বিভাগ"
              className="w-[40mm] border-b border-dotted border-[#441a05] text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            বিভাগে উত্তীর্ণ হয়েছে।
          </p>
        </div>

        {/* Signatures */}
        <div className="absolute bottom-[25mm] left-[30mm] text-center">
          <div className="border-t border-dotted border-[#441a05] w-[25mm] mx-auto"></div>
          <div className="text-[#441a05] mt-[1mm] text-[5mm]">সীল</div>
        </div>
        <div className="absolute bottom-[25mm] left-1/2 -translate-x-1/2 text-center">
          <div className="border-t border-dotted border-[#441a05] w-[25mm] mx-auto"></div>
          <div className="text-[#441a05] mt-[1mm] text-[5mm]">নাজেম</div>
        </div>
        <div className="absolute bottom-[25mm] right-[30mm] text-center">
          <div className="border-t border-dotted border-[#441a05] w-[25mm] mx-auto"></div>
          <div className="text-[#441a05] mt-[1mm] text-[5mm]">মুহতামিম</div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 w-full relative mx-auto">
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
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
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
          @media print {
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              margin: 0;
            }
          }
        `}
      </style>

      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-2 mb-6">
          <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
            প্রত্যয়ন পত্র
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex items-center space-x-4 animate-fadeIn">
            <span className="text-[#441a05] sm:text-base text-xs font-medium text-nowrap">
              ছাত্র নির্বাচন করুন:
            </span>
            <div className="w-full">
              <Select
                options={studentOptions}
                value={selectedStudent}
                onChange={setSelectedStudent}
                placeholder="ছাত্র নির্বাচন"
                isLoading={isStudentsLoading}
                isDisabled={isStudentsLoading}
                styles={selectStyles}
                className="animate-scaleIn"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isClearable
                isSearchable
              />
            </div>
          </label>
          <label className="flex items-center space-x-4 animate-fadeIn">
            <span className="text-[#441a05] sm:text-base text-xs font-medium text-nowrap">
              শিক্ষাবর্ষ নির্বাচন করুন:
            </span>
            <div className="w-full">
              <Select
                options={yearOptions}
                value={selectedYear}
                onChange={setSelectedYear}
                placeholder="শিক্ষাবর্ষ নির্বাচন"
                isLoading={isYearsLoading}
                isDisabled={isYearsLoading}
                styles={selectStyles}
                className="animate-scaleIn"
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isClearable
                isSearchable
              />
            </div>
          </label>
        </div>
        {(isStudentsLoading || isYearsLoading || isInstituteLoading) && (
          <div className="flex items-center space-x-2 text-[#441a05]/70 animate-fadeIn mt-4">
            <FaSpinner className="animate-spin text-lg" />
            <span>ডেটা লোড হচ্ছে...</span>
          </div>
        )}
        {instituteError && (
          <div
            className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            ইনস্টিটিউট ত্রুটি: {instituteError.status || "অজানা"} -{" "}
            {JSON.stringify(instituteError.data || {})}
          </div>
        )}
        {studentsError && (
          <div
            className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            ছাত্র ত্রুটি: {studentsError.status || "অজানা"} -{" "}
            {JSON.stringify(studentsError.data || {})}
          </div>
        )}
        {yearsError && (
          <div
            className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            শিক্ষাবর্ষ ত্রুটি: {yearsError.status || "অজানা"} -{" "}
            {JSON.stringify(yearsError.data || {})}
          </div>
        )}
      </div>

      <div className="">{renderCertificate()}</div>
      {selectedStudent && selectedYear && (
        <div className="flex justify-center gap-4 mt-6 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="bg-[#DB9E30] hover:bg-[#c68e27] text-[#441a05] font-bold py-2 px-4 rounded border-none transition-all btn-glow"
          >
            PDF ডাউনলোড
          </button>
          <button
            onClick={handlePrint}
            className="bg-[#441a05] hover:bg-[#2f1203] text-white font-bold py-2 px-4 rounded transition-all btn-glow"
          >
            প্রিন্ট
          </button>
        </div>
      )}
    </div>
  );
};

export default Testimonial;
