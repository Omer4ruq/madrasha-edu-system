import jsPDF from "jspdf";
import "jspdf-autotable";


const generatePrint = (data,
   {
      schoolName = "XYZ High School & College",
      documentName = "School Document",
      details1 = "Subject: Mathematics | Total: 100",
      details2 = "Class: 10 | Section: Jaba | Shift: Morning | Session: 2024",
      tableHead = ["ID", "Name", "Age", "Grade", "Email", "Address"],
      documentValues = [ "id", "name", "age", "grade", "email", "address" ],
      landscape
   }
) => {
   
   const doc = new jsPDF({
    orientation: landscape ? 'l':'p',
    unit: 'mm',
    format: 'a4'
  });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Set font styles for title and metadata
  doc.setFontSize(18);
//   doc.setFont("helvetica", "bold");
  doc.text(schoolName, pageWidth / 2 , 20, { align: "center" }); // Center-aligned
  doc.setFontSize(15);
  doc.text(documentName, pageWidth / 2, 28, { align: "center" });
  doc.setFontSize(12);
  doc.text(details1, pageWidth / 2, 35, { align: "center" });
  doc.setFontSize(12);
  doc.text(details2, pageWidth / 2, 40, { align: "center" });


   // Generate table
   doc.autoTable({
    startY: 45,
     head: [tableHead],
     body: data.map(item => documentValues.map(item2 => item[item2])),
   });
 
   // This line uses the jsPDF method output("blob") to create a Blob object from the PDF document. A Blob is a binary data object that can be used to represent the PDF content.
   const pdfBlob = doc.output("blob");
   
 
   // Create an iframe element in the dom. An iframe (inline frame) can embed another HTML document or resource within the current page.
   const iframe = document.createElement('iframe');

  //   appends the created iframe element to the body of the HTML document.
   document.body.appendChild(iframe);
 
   // create a temporary URL (Blob URL) that points to the PDF data stored in the pdfBlob object.
   const blobUrl = URL.createObjectURL(pdfBlob);
   //sets the src attribute of the iframe to the newly created Blob URL. This tells the iframe to load the PDF data from the Blob object.
   iframe.src = blobUrl;
 
   // Wait for iframe to load and trigger print
   iframe.onload = function () {
     iframe.contentWindow.print();
   };

// This approach separates the PDF generation from the user interface manipulation. The user experience is improved by hiding the iframe during the process, making it seamless for the user. The Blob URL created is temporary and can be revoked once the print action is complete, ensuring proper memory management.
 };

 export default generatePrint;