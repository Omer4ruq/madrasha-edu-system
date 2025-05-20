import { useTranslation } from "react-i18next";

export default function ParHisTable() {
  const { t } = useTranslation();

  const dummyData = [
    {
      date: "2024-01-01",
      smsCount: 100,
    },
    {
      date: "2024-01-02",
      smsCount: 150,
    },
    {
      date: "2024-01-03",
      smsCount: 40,
    }
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-center leading-7 sm:leading-8">
        <thead className="bg-bgBlue border-b-2 border-bgGray leading-10">
          <tr>
            <th className="w-2/12">#</th>
            <th className="w-5/12 min-w-32">{t("module.report.sendDate")}</th>
            <th className="w-5/12">{t("module.report.smsCount")}</th>
          </tr>
        </thead>
        <tbody className="divide-y font-medium">
          {dummyData.map((row, index) => (
            <tr key={index} className="text-center">
              <td className="w-2/12">{index + 1}</td>
              <td className="w-5/12">{row.date}</td>
              <td className="w-5/12">{row.smsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
