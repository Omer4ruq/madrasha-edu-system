import { useTranslation } from "react-i18next";

export default function StuDateTable() {
  const { t } = useTranslation();

  const dummyData = [
    {
      date: "2024-05-01",
      totalStudent: 50,
      present: 45,
      absent: 5,
    },
    {
      date: "2024-05-02",
      totalStudent: 50,
      present: 42,
      absent: 8,
    },
    {
      date: "2024-05-03",
      totalStudent: 50,
      present: 46,
      absent: 4,
    },
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-center leading-6 sm:leading-8">
        <thead className="bg-bgBlue border-b-2 border-bgGray sm:leading-10">
          <tr>
            <th className="w-1/12">#</th>
            <th className="w-2/12 min-w-32">{t("module.report.date")}</th>
            <th className="w-3/12">{t("module.report.totalStudent")}</th>
            <th className="w-3/12 min-w-16">{t("module.report.presentStudent")}</th>
            <th className="w-3/12 min-w-20">{t("module.report.absentStudent")}</th>
          </tr>
        </thead>
        <tbody className="divide-y font-medium">
          {dummyData.map((row, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-2/12">{row.date}</td>
              <td className="w-3/12">{row.totalStudent}</td>
              <td className="w-3/12">{row.present}</td>
              <td className="w-3/12">{row.absent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
