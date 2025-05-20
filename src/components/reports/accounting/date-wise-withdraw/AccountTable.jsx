import { useTranslation } from "react-i18next";

export default function AccountTable() {
   const { t } = useTranslation();

   const dummyData = [
      {
         name: "Md. Hasan Ali",
         amount: 10000,
         incomeHead: "Maintenance",
         date: "2024-01-01",
         description: "Income from sales",
         invoiceNo: "INV/2024/001",
      },
      {
         name: "Md. Hasan Ali",
         amount: 10000,
         incomeHead: "Bonus",
         date: "2024-01-01",
         description: "Income from sales",
         invoiceNo: "INV/2024/001",
      },
      {
         name: "Md. Hasan Ali",
         amount: 10000,
         incomeHead: "Salary",
         date: "2024-01-01",
         description: "Income from sales",
         invoiceNo: "INV/2024/001",
      }
   ];

   return (
      <div className="border my-6 rounded shadow-md overflow-x-scroll">
         <table className="w-full text-textGray text-center leading-6 sm:leading-8">
            <thead className="bg-bgBlue border-b-2 border-bgGray leading-10">
               <tr>
                  <th className="w-1/12">#</th>
                  <th className="w-2/12 min-w-20">{t("module.report.amount")}</th>
                  <th className="w-1/12 min-w-32">{t("module.report.receivedBy")}</th>
                  <th className="w-2/12 min-w-24">{t("module.report.date")}</th>
                  <th className="w-3/12 min-w-40">{t("module.report.description")}</th>
                  <th className="w-1/12 min-w-24">{t("module.report.document")}</th>
                  <th className="w-1/12 min-w-24">{t("module.report.createdBy")}</th>
                  <th className="w-1/12 min-w-24">{t("module.report.updatedBy")}</th>
               </tr>
            </thead>
            <tbody className="divide-y font-medium">
               {dummyData.map((row, index) => (
                  <tr key={index} className="text-center">
                     <td className="w-1/12">{index + 1}</td>
                     <td className="w-2/12">{row.amount}</td>
                     <td className="w-1/12">{row.incomeHead}</td>
                     <td className="w-2/12">{row.date}</td>
                     <td className="w-3/12">{row.description}</td>
                     <td className="w-1/12">{row.document}</td>
                     <td className="w-1/12">Admin</td>
                     <td className="w-1/12">Admin</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}
