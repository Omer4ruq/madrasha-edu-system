import { useEffect, useRef } from "react";
import { useReactToPrint } from 'react-to-print';

export default function TesModal({ children, isOpen, onClose, width}) {

   const modalRef = useRef(null);

   const handlePrint = useReactToPrint({
      content: () => modalRef.current.querySelector('.modal-content'),
      documentTitle: 'Testimonial',
      onAfterPrint: () => console.log('Printed successfully'),
      pageStyle: `
         @page {
            size: A4 landscape;
            margin: 0;
         }
         @media print {
            body {
               width: 295mm;
               height: 210mm;
               padding-left: 1mm
            }
            .modal-content {
               margin: auto;
            }
         }
      `,
   });

   useEffect(() => {
     // check if clicked outside of modal area. if dom node exists, means modal is open, then modalRef.current has value. if so, then, check if it contains the clicked element on every mousedown event.
     const handleClickOutside = (event) => {
       if (modalRef.current && !modalRef.current.contains(event.target)) {
         onClose();
       }
     };
     //function assigned to eventListener.
     document.addEventListener('mousedown', handleClickOutside);

     //callback to remove the eventLitener.
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [isOpen, onClose]);

   // return modal jsx when isOpen is true.
   if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 transition duration-300 ease-in-out">
          <div ref={modalRef} className={`bg-white rounded-lg shadow-lg p-4 ${width}`}>

            {/* modal content */}
            {children}

            {/* action buttons */}
            <div className="flex justify-end items-center space-x-2 xl:space-x-3 mt-4">
              <button
                className="bg-blue px-4 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200"
                onClick={handlePrint}
              >
                Print
              </button>
              <button
                className="bg-red px-4 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
    );
}