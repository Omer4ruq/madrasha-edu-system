import * as XLSX from "xlsx";

const generateExcel = (data, {fileName}) => {
   const worksheet = XLSX.utils.json_to_sheet(data);
   const workbook = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
   XLSX.writeFile(workbook, fileName + ".xlsx");
 };

 export default generateExcel;