import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";

const Testimonial = () => {
  const printRef = useRef();

  const handleDownloadPDF = () => {
    html2pdf()
      .from(printRef.current)
      .set({
        margin: 0,
        filename: "certificate.pdf",
        image: { type: "jpeg", quality: 1 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          scrollY: 0,
          backgroundColor: null,
        },
        jsPDF: {
          unit: "px",
          format: [1123, 794],
          orientation: "landscape",
        },
      })
      .save();
  };

   const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "certificate",
    removeAfterPrint: true,
  });

//   const handlePrint = () => window.print();

  const autoGrow = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="p-4 min-h-screen flex flex-col items-center font-bengali">
      <div
        ref={printRef}
        className="relative print:bg-[url('https://i.postimg.cc/MGJSHC9D/IMG-20250705-210734.jpg')]"
        style={{
          backgroundImage:
            "url('https://i.postimg.cc/MGJSHC9D/IMG-20250705-210734.jpg')",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          width: "1123px",
          height: "794px",
          boxSizing: "border-box",
          padding: "60px 70px",
        }}
      >
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Logo"
          className="absolute top-[50px] left-[60px] w-14 h-14 object-contain"
        />

        {/* Header */}
        <div className="text-center mt-[10px]">
          <h1 className="text-3xl font-bold text-black">
            জামেয়া ইসলামিয়া আরাবিয়া (ডেমু)
          </h1>
          <p className="text-xl mt-3">
            কাজলা, ডেমুপ্রেস, যাত্রাবাড়ী, ঢাকা-১২৩৬
          </p>
          <p className="text-base my-2">০১৮২২৫৫৫৫৫৫ # ০১৯৯২৯৫৫৫৫৫</p>

          <h1 className=" bg-black text-white px-5 mt-3 w-fit mx-auto text-2xl py-2 rounded-3xl">
            <span className="translate-y-[-10px]">প্রত্যয়ন পত্র</span>
          </h1>
        </div>

        {/* Serial and Date */}
        <div className="flex justify-between mt-6 text-lg text-black">
          <div>
            ক্রমিকঃ{" "}
            <input
              className="border-b border-black w-16 text-center bg-transparent"
              defaultValue="১"
            />
          </div>
          <div>
            তারিখঃ{" "}
            <input
              className=" w-32 text-center bg-transparent"
              defaultValue="২০/০৭/১৪৪৫"
            />
          </div>
        </div>

        {/* Certificate Body */}
        <div className="mt-6 space-y-4 text-lg text-black leading-relaxed">
          <p className="flex gap-2 flex-wrap">
            এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,
            <textarea
              onInput={autoGrow}
              placeholder="নাম"
              className="w-96 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
          </p>
          <p className="flex gap-2 flex-wrap">
            পিতা:
            <textarea
              onInput={autoGrow}
              placeholder="পিতার নাম"
              className="w-80 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            মাতা:
            <textarea
              onInput={autoGrow}
              placeholder="মায়ের নাম"
              className="w-80 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            ।
          </p>
          <p className="flex gap-2 flex-wrap">
            গ্রাম:
            <textarea
              onInput={autoGrow}
              placeholder="গ্রাম"
              className="w-40 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            ডাক:
            <textarea
              onInput={autoGrow}
              placeholder="ডাকঘর"
              className="w-40 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            উপজেলা:
            <textarea
              onInput={autoGrow}
              placeholder="উপজেলা"
              className="w-40 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            থানা:
            <textarea
              onInput={autoGrow}
              placeholder="থানা"
              className="w-40 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            ।
          </p>
          <p className="flex gap-2 flex-wrap">
            জেলা:
            <textarea
              onInput={autoGrow}
              defaultValue="গাজীপুর"
              className="w-40 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            ভর্তি রেজিস্ট্রি নম্বর:
            <textarea
              onInput={autoGrow}
              defaultValue="১১১"
              className="w-24 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            এবং জন্ম তারিখ:
            <textarea
              onInput={autoGrow}
              defaultValue="১৫/০৫/১৯৮৮"
              className="w-32 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            ।
          </p>
          <p className="flex gap-2 flex-wrap">
            সে অত্র মাদরাসায়
            <textarea
              onInput={autoGrow}
              placeholder="শ্রেণী"
              className="w-40 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            হতে
            <textarea
              onInput={autoGrow}
              placeholder="শ্রেণী"
              className="w-40 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            পর্যন্ত অধ্যয়ন করতঃ বিগত
            <textarea
              onInput={autoGrow}
              defaultValue="২০২৪"
              className="w-20 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            শিক্ষাবর্ষে
            <textarea
              onInput={autoGrow}
              defaultValue="2024"
              className="w-20 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            বোর্ড পরীক্ষায় অংশগ্রহণ করে মোট নাম্বার
            <textarea
              onInput={autoGrow}
              defaultValue="৭৬৫"
              className="w-24 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            এবং
            <textarea
              onInput={autoGrow}
              placeholder="বিভাগ"
              className="w-36 border-b border-dotted border-black text-center bg-transparent resize-none overflow-hidden"
              rows={1}
            />
            বিভাগে উত্তীর্ণ হয়েছে।
          </p>
        </div>

        {/* Signatures */}
        <div className="absolute bottom-[100px] left-[120px] text-center">
          <div className="border-t border-dotted border-black w-[100px] mx-auto"></div>
          <div className="text-black mt-1">সীল</div>
        </div>
        <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 text-center">
          <div className="border-t border-dotted border-black w-[100px] mx-auto"></div>
          <div className="text-black mt-1">নাজেম</div>
        </div>
        <div className="absolute bottom-[100px] right-[120px] text-center">
          <div className="border-t border-dotted border-black w-[100px] mx-auto"></div>
          <div className="text-black mt-1">মুহতামিম</div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-4 mt-6 print:hidden">
        <button
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded border-none"
        >
          PDF Download
        </button>
 <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Print
        </button>
      </div>

      {/* Print Notice */}
      <p className="text-sm text-gray-500 mt-2 print:hidden">
        ⚠️ প্রিন্ট করার আগে ব্রাউজারে "Print background graphics" চালু করুন।
      </p>
    </div>
  );
};

export default Testimonial;
