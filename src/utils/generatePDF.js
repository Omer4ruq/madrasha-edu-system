import jsPDF from "jspdf";
import "jspdf-autotable";

const generatePDF = ( data, 
   {
      schoolName = "XYZ High School & College",
      documentName = "School Document",
      details1 = "Subject: Mathematics | Total: 100",
      details2 = "Class: 10 | Section: Jaba | Shift: Morning | Session: 2024",
      tableHead = ["ID", "Name", "Age", "Grade", "Email", "Address"],
      documentValues = [ "id", "name", "age", "grade", "email", "address" ],
      fileName = "Document",
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

   doc.save(fileName + ".pdf");
 };

 export default generatePDF;