import { FaRegFilePdf } from "react-icons/fa6";
import { MdLocalPrintshop } from "react-icons/md";
import { SiMicrosoftexcel } from "react-icons/si";
import generateExcel from "../../utils/generateExcel";
import generatePDF from "../../utils/generatePDF";
import generatePrint from "../../utils/generatePrint";

export default function TableDataFeatures({data, isPagination, link, printProps, pdfProps, excelProps}) {

   function fetchData(){
      //fetch from link
      //return data
   }

   function handlePrint () {
      const printData = !isPagination ? data : fetchData();
      generatePrint(printData, printProps)
   }

   function handlePDF () {
      const pdfData = !isPagination ? data : fetchData();
      generatePDF(pdfData, pdfProps)
   }

   function handleExcel () {
      const excelData = !isPagination ? data : fetchData();
      generateExcel(excelData, excelProps)
   }

    return (
      <div className="flex items-end gap-2">
         <button
         onClick={handlePrint}
         className="flex items-center gap-1 md:gap-2 rounded px-4 py-2 bg-blue text-white shadow-md hover:-translate-y-[2px] duration-200"
         >
            <MdLocalPrintshop className="text-xl" /> Print
         </button>
         
         <button
         onClick={handlePDF}
         className="flex items-center gap-1 md:gap-2 rounded px-4 py-2 bg-green text-white shadow-md hover:-translate-y-[2px] duration-200"
         >
            <FaRegFilePdf className="text-lg" /> PDF
         </button>
         
         <button
         onClick={handleExcel}
         className="flex items-center gap-1 md:gap-2 rounded px-4 py-2 bg-yellow text-white shadow-md hover:-translate-y-[2px] duration-200"
         >
            <SiMicrosoftexcel className="text-lg" /> Excel
         </button>
         
      </div>
    );
}