import { useTranslation } from "react-i18next";
import TableDataFeatures from "../../common/TableDataFeatures";


export default function TabHeading() {
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
  
     const printProps = {
        tableHead : ["ID", "Name", "Age", "Grade", "Email", "Address"],
        documentValues : [ "id", "name", "age", "grade", "email", "address" ],
     }
  
     const excelProps = {
        fileName : "hi",
     }
  
     const pdfProps = {
        tableHead : ["ID", "Name", "Age", "Grade", "Email", "Address"],
        documentValues : [ "id", "name", "age", "grade", "email", "address" ],
        fileName : "kaboom"
     }
const {t} = useTranslation();
    return (
   <div className="flex items-center justify-between mt-4 mb-6">
      <h3 className="text-2xl font-medium">{t('module.result.tabulation_sheet')}</h3>

      <TableDataFeatures data={students} pdfProps={pdfProps} excelProps={excelProps} printProps={printProps}/>

   </div>
    );
}