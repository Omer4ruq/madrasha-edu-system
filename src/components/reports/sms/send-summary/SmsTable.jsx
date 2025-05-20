import { useTranslation } from "react-i18next";

export default function SmsTable() {
  const { t } = useTranslation();

  const dummyData = [
    {
      sendDate: "2024-05-01",
      smsCount: 100,
    },
    {
      sendDate: "2024-05-02",
      smsCount: 150,
    },
    {
      sendDate: "2024-05-03",
      smsCount: 200,
    },
    {
      sendDate: "2024-05-04",
      smsCount: 250,
    },
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-center leading-6 sm:leading-8">
        <thead className="bg-bgBlue border-b-2 border-bgGray leading-10">
          <tr>
            <th className="w-1/12">#</th>
            <th className="w-4/12">{t("module.report.sendDate")}</th>
            <th className="w-1/12">{t("module.report.smsCount")}</th>
          </tr>
        </thead>
        <tbody className="divide-y font-medium">
          {dummyData.map((row, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-4/12">{row.sendDate}</td>
              <td className="w-1/12">{row.smsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
