import { useTranslation } from "react-i18next";

export default function AccountTable() {
  const { t } = useTranslation();

  const dummyData = [
    {
      date: "2024-01-01",
      income: "10000",
      expense: "5000",
      withdraw: "2000",
      balance: "3000",
    },
    {
      date: "2024-01-02",
      income: "10000",
      expense: "5000",
      withdraw: "2000",
      balance: "3000",
    }
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-center leading-6 sm:leading-8">
        <thead className="bg-bgBlue border-b-2 border-bgGray leading-10">
          <tr>
            <th className="w-1/12">#</th>
            <th className="w-3/12">{t("module.report.date")}</th>
            <th className="w-2/12 min-w-32">{t("module.report.income")}</th>
            <th className="w-2/12">{t("module.report.expense")}</th>
            <th className="w-2/12 min-w-16">{t("module.report.withdraw")}</th>
            <th className="w-2/12 min-w-20">{t("module.report.balance")}</th>
          </tr>
        </thead>
        <tbody className="divide-y font-medium">
          {dummyData.map((row, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-3/12">{row.date}</td>
              <td className="w-2/12">{row.income}</td>
              <td className="w-2/12">{row.expense}</td>
              <td className="w-2/12">{row.withdraw}</td>
              <td className="w-2/12">{row.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
