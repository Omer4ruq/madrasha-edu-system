import { useTranslation } from "react-i18next";

export default function FeeTable() {
   const { t } = useTranslation();

   const dummyData = [
      {
         id: 1,
         name: "John Doe",
         roll: 1,
         class: "10th",
         dueAmount: "1000",
         dueDetails: "lorem ipsum dolor",
      },
      {
         id: 2,
         name: "Jane Doe",
         roll: 2,
         class: "11th",
         dueAmount: "2000",
         dueDetails: "lorem ipsum dolor",
      },
      {
         id: 3,
         name: "John Smith",
         roll: 3,
         class: "12th",
         dueAmount: "3000",
         dueDetails: "lorem ipsum dolor",
      }
   ];

  return (
   <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-center leading-6 sm:leading-8">
         <thead className="bg-bgBlue border-b-2 border-bgGray leading-10">
         <tr>
            <th className="w-1/12">#</th>
            <th className="w-3/12">{t("module.report.name")}</th>
            <th className="w-1/12 min-w-32">{t("module.report.roll")}</th>
            <th className="w-2/12">{t("module.report.class")}</th>
            <th className="w-2/12 min-w-20">{t("module.report.dueAmount")}</th>
            <th className="w-3/12 min-w-20">{t("module.report.dueDetails")}</th>
         </tr>
         </thead>
         <tbody className="divide-y font-medium">
         {dummyData.map((row, index) => (
            <tr key={index} className="text-center">
               <td className="w-1/12">{index + 1}</td>
               <td className="w-3/12">{row.name}</td>
               <td className="w-1/12">{row.roll}</td>
               <td className="w-2/12">{row.class}</td>
               <td className="w-2/12">{row.dueAmount}</td>
               <td className="w-3/12">{row.dueDetails}</td>
            </tr>
         ))}
         </tbody>
      </table>
   </div>
  );
}
