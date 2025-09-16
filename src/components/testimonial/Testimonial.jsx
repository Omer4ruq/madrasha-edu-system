import React, { useRef, useState, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import Select from "react-select";
import { FaSpinner, FaPrint } from "react-icons/fa";
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
  const [customValues, setCustomValues] = useState({
    serial: "১",
    marks: "৭৬৫",
    division: "বিভাগ"
  });

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

  // Handle custom value changes
  const handleCustomValueChange = (field, value) => {
    setCustomValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate PDF report in new tab
  const generatePDFReport = () => {
    if (!selectedStudent || !selectedYear) {
      toast.error("ছাত্র এবং শিক্ষাবর্ষ নির্বাচন করুন।");
      return;
    }
    if (isInstituteLoading) {
      toast.error("ইনস্টিটিউট তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন!");
      return;
    }
    if (!instituteData) {
      toast.error("ইনস্টিটিউট তথ্য পাওয়া যায়নি!");
      return;
    }
    if (studentsError) {
      toast.error("ছাত্র তথ্য লোড করতে ত্রুটি ঘটেছে!");
      return;
    }
    if (yearsError) {
      toast.error("শিক্ষাবর্ষ তথ্য লোড করতে ত্রুটি ঘটেছে!");
      return;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("bn-BD", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>প্রত্যয়ন পত্র</title>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @page { 
            size: A4 landscape; 
            margin: 0; 
          }
          body {
            font-family: 'Noto Sans Bengali', sans-serif;
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .certificate-container {
            width: 297mm;
            height: 210mm;
            
            margin: 0 auto;
            padding: 20mm 30mm;
            box-sizing: border-box;
            position: relative;
            background-image: url('${frame}');
            background-size: cover;
            background-repeat: no-repeat;
            overflow: hidden;
          }
          .certificate-content {
            position: relative;
            z-index: 2;
          }
          .watermark-logo {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 150mm;
            height: 150mm;
            object-fit: contain;
            opacity: 0.2;
            z-index: 1;
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <img
            src="${instituteData?.institute_logo || "/logo.png"}"
            alt="Logo"
            class="watermark-logo"
          />
          <div class="certificate-content">
            <div class="text-center mt-5">
              <h1 class="font-bold text-black ${
                (instituteData?.institute_name || "আল ফারুক মাদ্রাসা").length > 30
                  ? "text-[8mm]"
                  : "text-[10mm]"
              }">
                ${instituteData?.institute_name || "আল ফারুক মাদ্রাসা"}
              </h1>
              <p class="text-[6mm]">
                ${instituteData?.institute_address || "কালিগঞ্জ, গাজীপুর"}
              </p>
              <p class="text-[5mm] mt-2">
                ${instituteData?.headmaster_mobile || "০১৭১২৩৪৫৬৭৮"}
              </p>
              <h1 class="bg-black text-white px-[10mm] mt-[3mm] w-fit mx-auto text-[6mm] py-[2mm] rounded-[10mm]">
                <span class="relative -top-[2px]">প্রত্যয়ন পত্র</span>
              </h1>
            </div>
            <div class="flex justify-between mt-[-8mm] text-[5mm] text-black w-[100%] absolute">
              <div>
                ক্রমিকঃ
                <span class="border-b border-black w-[20mm] text-center inline-block">${customValues.serial}</span>
              </div>
              <div>
                তারিখঃ
                <span class="w-[30mm] text-center inline-block border-b border-black">${formattedDate}</span>
              </div>
            </div>
            <div class="mt-[5mm] space-y-[4mm] text-[5mm] text-black leading-relaxed absolute">
              <p class="flex gap-[2mm] flex-wrap">
                এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,
                <span class="border-b border-dotted border-black text-center w-[150mm] inline-block">${selectedStudent?.name || "মোঃ আব্দুল করিম"}</span>
              </p>
              <p class="flex gap-[2mm] flex-wrap">
                পিতা:
                <span class="w-[100mm] border-b border-dotted border-black text-center inline-block">${selectedStudent?.father_name || "মোঃ রফিকুল ইসলাম"}</span>
                মাতা:
                <span class="w-[100mm] border-b border-dotted border-black text-center inline-block">${selectedStudent?.mother_name || "মোছাঃ রাবেয়া খাতুন"}</span>
                ।
              </p>
              <p class="flex gap-[2mm] flex-wrap">
                গ্রাম:
                <span class="w-[40mm] border-b border-dotted border-black text-center inline-block">${selectedStudent?.village || "আউটপাড়া"}</span>
                ডাক:
                <span class="w-[40mm] border-b border-dotted border-black text-center inline-block">${selectedStudent?.post_office || "মাওনা"}</span>
                উপজেলা:
                <span class="w-[40mm] border-b border-dotted border-black text-center inline-block">${selectedStudent?.ps_or_upazilla || "সদর"}</span>
                থানা:
                <span class="w-[40mm] border-b border-dotted border-black text-center inline-block">${selectedStudent?.ps_or_upazilla || "সদর"}</span>
                ।
              </p>
              <p class="flex gap-[2mm] flex-wrap">
                জেলা:
                <span class="w-[40mm] border-b border-dotted border-black text-center inline-block">${selectedStudent?.district || "গাজীপুর"}</span>
                ভর্তি রেজিস্ট্রি নম্বর:
                <span class="w-[40mm] border-b border-dotted border-black text-center inline-block">${selectedStudent?.username || "১১১"}</span>
                এবং জন্ম তারিখ:
                <span class="w-[40mm] border-b border-dotted border-black text-center inline-block">${selectedStudent?.dob || "১৫/০৫/১৯৮৮"}</span>
                ।
              </p>
              <p class="flex gap-[2mm] flex-wrap">
                সে অত্র মাদরাসায়
                <span class="w-[30mm] border-b border-dotted border-black text-center inline-block">${selectedStudent?.class_name || "দ্বিতীয়"}</span>
                হতে
                <span class="w-[30mm] border-b border-dotted border-black text-center inline-block">${selectedStudent?.class_name || "পঞ্চম"}</span>
                পর্যন্ত অধ্যয়ন করতঃ বিগত
                <span class="w-[20mm] border-b border-dotted border-black text-center inline-block">${selectedYear?.label || "২০২৪"}</span>
                শিক্ষাবর্ষে
                <span class="w-[20mm] border-b border-dotted border-black text-center inline-block">${selectedYear?.label || "২০২৪"}</span>
                বোর্ড পরীক্ষায় অংশগ্রহণ করে মোট নাম্বার
                <span class="w-[20mm] border-b border-dotted border-black text-center inline-block">${customValues.marks}</span>
                এবং
                <span class="w-[60mm] border-b border-dotted border-black text-center inline-block">${customValues.division}</span>
                বিভাগে উত্তীর্ণ হয়েছে।
              </p>
            </div>
            <div class="absolute bottom-[-113mm] left-[30mm] text-center">
              <div class="border-t border-dotted border-black w-[30mm] mx-auto"></div>
              <div class="text-black mt-[1mm] text-[5mm]">সীল</div>
            </div>
            <div class="absolute bottom-[-113mm]  left-1/2 -translate-x-1/2 text-center">
              <div class="border-t border-dotted border-black w-[30mm] mx-auto"></div>
              <div class="text-black mt-[1mm] text-[5mm]">নাজেম</div>
            </div>
            <div class="absolute bottom-[-113mm]  right-[30mm] text-center">
              <div class="border-t border-dotted border-black w-[30mm] mx-auto"></div>
              <div class="text-black mt-[1mm] text-[5mm]">মুহতামিম</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              setTimeout(() => {
                window.close();
              }, 100);
            }, 100);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('প্রত্যয়ন পত্র রিপোর্ট তৈরি হয়েছে!');
  };

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
        className="relative mx-auto print:bg-[url('/images/frame.jpg')] font-medium text-black w-[297mm] h-[210mm] bg-[url('/images/frame.jpg')] bg-cover bg-no-repeat box-border p-[20mm_30mm] print:overflow-hidden"
      >
        <img
          src={instituteData?.institute_logo || "/logo.png"}
          alt="Logo"
          className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[150mm] h-[150mm] object-contain opacity-20"
        />
        <div className="text-center mt-10">
          <h1
            className={`font-bold text-black ${
              (instituteData?.institute_name || "আল ফارুক মাদ্রাসা").length > 30
                ? "text-[8mm]"
                : "text-[10mm]"
            }`}
          >
            {instituteData?.institute_name || "আল ফারুক মাদ্রাসা"}
          </h1>
          <p className="text-[6mm] mt-[5mm]">
            {instituteData?.institute_address || "কালিগঞ্জ, গাজীপুর"}
          </p>
          <p className="text-[5mm] my-[3mm]">
            {instituteData?.headmaster_mobile || "০১৭১২৩৪৫৬৭৮"}
          </p>
          <h1 className="bg-black text-white px-[10mm] mt-[3mm] w-fit mx-auto text-[6mm] py-[2mm] rounded-[10mm]">
            <span className="relative -top-[2px]">প্রত্যয়ন পত্র</span>
          </h1>
        </div>
        <div className="flex justify-between mt-[-8mm] text-[5mm] text-black w-[80%] absolute">
          <div>
            ক্রমিকঃ
            <input
              className="border-b border-black w-[20mm] text-center bg-transparent outline-none"
              defaultValue={customValues.serial}
              onChange={(e) => handleCustomValueChange("serial", e.target.value)}
            />
          </div>
          <div>
            তারিখঃ
            <input
              className="w-[30mm] text-center bg-transparent border-b border-black outline-none"
              defaultValue={formattedDate}
              
            />
          </div>
        </div>
        <div className="mt-[8mm] space-y-[4mm] text-[5mm] text-black leading-relaxed absolute">
          <p className="flex gap-[2mm] flex-wrap">
            এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,
            <textarea
              
              defaultValue={selectedStudent?.name || "মোঃ আব্দুল করিম"}
              className="w-[150mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
          </p>
          <p className="flex gap-[2mm] flex-wrap">
            পিতা:
            <textarea
              
              defaultValue={selectedStudent?.father_name || "মোঃ রফিকুল ইসলাম"}
              className="w-[100mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            মাতা:
            <textarea
              
              defaultValue={selectedStudent?.mother_name || "মোছাঃ রাবেয়া খাতুন"}
              className="w-[100mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            ।
          </p>
          <p className="flex gap-[2mm] flex-wrap">
            গ্রাম:
            <textarea
              
              defaultValue={selectedStudent?.village || "আউটপাড়া"}
              className="w-[40mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            ডাক:
            <textarea
              
              defaultValue={selectedStudent?.post_office || "মাওনা"}
              className="w-[40mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            উপজেলা:
            <textarea
              
              defaultValue={selectedStudent?.ps_or_upazilla || "সদর"}
              className="w-[40mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            থানা:
            <textarea
              
              defaultValue={selectedStudent?.ps_or_upazilla || "সদর"}
              className="w-[40mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            ।
          </p>
          <p className="flex gap-[2mm] flex-wrap">
            জেলা:
            <textarea
              
              defaultValue={selectedStudent?.district || "গাজীপুর"}
              className="w-[40mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            ভর্তি রেজিস্ট্রি নম্বর:
            <textarea
              
              defaultValue={selectedStudent?.username || "১১১"}
              className="w-[40mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            এবং জন্ম তারিখ:
            <textarea
              
              defaultValue={selectedStudent?.dob || "১৫/০৫/১৯৮৮"}
              className="w-[40mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            ।
          </p>
          <p className="flex gap-[2mm] flex-wrap">
            সে অত্র মাদরাসায়
            <textarea
              
              defaultValue={selectedStudent?.class_name || "দ্বিতীয়"}
              className="w-[30mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            হতে
            <textarea
              
              defaultValue={selectedStudent?.class_name || "পঞ্চম"}
              className="w-[30mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            পর্যন্ত অধ্যয়ন করতঃ বিগত
            <textarea
              
              defaultValue={selectedYear?.label || "২০২৪"}
              className="w-[20mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            শিক্ষাবর্ষে
            <textarea
              
              defaultValue={selectedYear?.label || "২০২৪"}
              className="w-[20mm] border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
              
            />
            বোর্ড পরীক্ষায় অংশগ্রহণ করে মোট নাম্বার
            <input
              defaultValue={customValues.marks}
              onChange={(e) => handleCustomValueChange("marks", e.target.value)}
              className="w-[20mm] border-b border-dotted border-black text-center bg-transparent outline-none"
            />
            এবং
            <input
              defaultValue={customValues.division}
              onChange={(e) => handleCustomValueChange("division", e.target.value)}
              className="w-[60mm] border-b border-dotted border-black text-center bg-transparent outline-none"
            />
            বিভাগে উত্তীর্ণ হয়েছে।
          </p>
        </div>
        <div className="absolute bottom-[25mm] left-[30mm] text-center">
          <div className="border-t border-dotted border-black w-[25mm] mx-auto"></div>
          <div className="text-black mt-[1mm] text-[5mm]">সীল</div>
        </div>
        <div className="absolute bottom-[25mm] left-1/2 -translate-x-1/2 text-center">
          <div className="border-t border-dotted border-black w-[25mm] mx-auto"></div>
          <div className="text-black mt-[1mm] text-[5mm]">নাজেম</div>
        </div>
        <div className="absolute bottom-[25mm] right-[30mm] text-center">
          <div className="border-t border-dotted border-black w-[25mm] mx-auto"></div>
          <div className="text-black mt-[1mm] text-[5mm]">মুহতামিম</div>
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
              width: 297mm;
              height: 210mm;
            }
            .certificate-container {
              width: 297mm;
              height: 210mm;
              margin: 0;
              padding: 20mm 30mm;
              box-sizing: border-box;
              position: relative;
              background-image: url('/images/frame.jpg');
              background-size: cover;
              background-repeat: no-repeat;
              overflow: hidden;
            }
            img {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            * {
              overflow: hidden !important;
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
            onClick={generatePDFReport}
            className="bg-[#DB9E30] hover:bg-[#c68e27] text-[#441a05] font-bold py-2 px-4 rounded border-none transition-all btn-glow flex items-center"
          >
            <FaPrint className="mr-2" /> প্রিন্ট রিপোর্ট
          </button>
          {/* <button
            onClick={handlePrint}
            className="bg-[#441a05] hover:bg-[#2f1203] text-white font-bold py-2 px-4 rounded transition-all btn-glow flex items-center"
          >
            <FaPrint className="mr-2" /> প্রিন্ট
          </button> */}
        </div>
      )}
    </div>
  );
};

export default Testimonial;