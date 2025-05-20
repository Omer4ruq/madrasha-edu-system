import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

 const Test = () => {

   const students = [
      {
        id: 1,
        name: "John Doe",
        age: 18,
        grade: "A",
        email: "john.doe@example.com",
        address: "123 Main St, Cityville",
      },
      {
        id: 2,
        name: "Jane Smith",
        age: 19,
        grade: "B",
        email: "jane.smith@example.com",
        address: "456 Oak Ave, Townsville",
      },
      {
        id: 3,
        name: "Michael Johnson",
        age: 20,
        grade: "C",
        email: "michael.j@example.com",
        address: "789 Pine Rd, Villagetown",
      },
      {
        id: 4,
        name: "Emily Davis",
        age: 18,
        grade: "A",
        email: "emily.davis@example.com",
        address: "101 Maple St, Smalltown",
      },
      {
        id: 5,
        name: "Daniel Brown",
        age: 21,
        grade: "B",
        email: "daniel.brown@example.com",
        address: "202 Cedar Dr, Bigcity",
      },
    ];

    
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4'
    });
    const tableColumn = ["ID", "Name", "Age", "Grade"];
    const tableRows = [];

    students.forEach((student) => {
      const studentData = [student.id, student.name, student.age, student.grade];
      tableRows.push(studentData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("students.pdf");
  };

  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "students.xlsx");
  };

  const generatePrint = () => {
   const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Set font styles for title and metadata
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("XYZ High School & College", pageWidth / 2 , 20, { align: "center" }); // Center-aligned
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Class: 10 | Session: 2024 | Topic: Mathematics", 105, 30, { align: "center" });
  doc.text("Section: A | Teacher: Mr. Smith", 105, 36, { align: "center" });


   // Generate table
   doc.autoTable({
    startY: 45,
     head: [["ID", "Name", "Age", "Grade", "Email", "Address"]],
     body: students.map(student => [
       student.id,
       student.name,
       student.age,
       student.grade,
       student.email,
       student.address
     ]),
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
 

  return (
    <div className="p-4">
      <button onClick={generatePDF} className="bg-blue-500 text-white px-4 py-2 rounded">
        Download PDF
      </button>
      <button onClick={generateExcel} className="bg-green-500 text-white px-4 py-2 rounded ml-2">
        Download Excel
      </button>
      <button
        onClick={generatePrint}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Print PDF
      </button>
    </div>
  );
};

export default Test;
