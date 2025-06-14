import { useEffect, useRef } from "react";

export default function ExportPdfCsv({handleOutsideClick}) {
   //to close export popup
   const exportRef = useRef(null);
   useEffect(() => {
     const handleClickOutside = (event) => {
       if (exportRef.current && !exportRef.current.contains(event.target)) {
         handleOutsideClick();
       }
     };
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [handleOutsideClick]);

   //empty csv file download
   function downloadCSV() {
      const csvContent = ""; // Empty string for empty CSV
   
      // A blob object is simply a group of bytes that holds the data stored in a file. It may seem like that a blob is a reference to the actual file but actually it is not. The blob data is stored in the memory or filesystem of a user depending on the browser features and size of the blob.
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'empty.csv';
      link.click();
    
      // Cleanup the temporary URL object
      window.URL.revokeObjectURL(url);
    }
    
   //empty pdf file download
    function downloadPDF() {
      const pdfContent = ""; // Empty string for empty PDF 
    
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'empty.pdf';
      link.click();
    
      // Cleanup the temporary URL object
      window.URL.revokeObjectURL(link.href);
    }

    return (
        <div ref={exportRef} className="absolute bg-white top-10 right-0 shadow-md rounded">
            <button className="text-#DB9E30 px-3 py-2  hover:bg-#DB9E30 hover:text-white duration-200 rounded-t w-28 block text-start" onClick={downloadCSV}>CSV</button>
            <button className="text-#DB9E30 px-3 py-2  hover:bg-#DB9E30 hover:text-white duration-200 hover:rounded-b-sm w-28  block text-start" onClick={downloadPDF}>PDF</button>
        </div>
    );
}