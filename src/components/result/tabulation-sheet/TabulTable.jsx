import { studentsData } from "../../../data/studentList";
import SubjectName from "./SubjectName";
import SubjectNumber from "./SubjectNumber";
import { useTranslation } from "react-i18next";

export default function TabulTable() {
   const { t } = useTranslation();
   
   const subjects = [
      t("module.result.bangla"),
      t("module.result.english"),
      t("module.result.mathematics"),
      t("module.result.history"),
      t("module.result.art"),
   ];

   const numbers = [
      { written: "55", MCQ: "32" },
      { written: "45", MCQ: "38" },
      { written: "51", MCQ: "34" },
      { written: "28", MCQ: "26" },
      { written: "45", MCQ: "34" },
   ];

   return (
      <div className="overflow-x-scroll overflow-y-clip border border-#DB9E30 rounded-md">
         <table className="w-full text-textGray leading-10">
            <thead className="border-b-2 bg-bgGreen text-lg">
               <tr className="divide-x-2 divide-bgGray">
                  <th className="min-w-12">{t("module.result.roll")}</th>
                  <th className="min-w-40">{t("module.result.name")}</th>
                  {subjects.map((subject, index) => (
                     <SubjectName key={index} data={subject} />
                  ))}
                  <th className="min-w-12">{t("module.result.total")}</th>
                  <th className="min-w-12">{t("module.result.gpa")}</th>
                  <th className="min-w-12">{t("module.result.grade")}</th>
               </tr>
            </thead>
            <tbody className="divide-y-2">
               {studentsData.map((row, index) => (
                  <tr key={index} className="text-center leading-6 divide-x-2 divide-bgGray">
                     <td className="min-w-12">{row.id}</td>
                     <td className="min-w-40">{row.name}</td>
                     {numbers.map((score, index) => (
                        <SubjectNumber key={index} data={score} />
                     ))}
                     <td className="min-w-12">100</td>
                     <td className="min-w-12">5.00</td>
                     <td className="min-w-12">A+</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}
