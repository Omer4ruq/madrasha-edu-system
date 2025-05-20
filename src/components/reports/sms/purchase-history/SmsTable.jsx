import { useTranslation } from "react-i18next";

export default function SmsTable() {
  const { t } = useTranslation();

  const dummyData = [
    {
      receivedDate: "2024-05-01",
      smsBalance: 100,
      smsPrice: 10,
      expireDateTime: "2024-05-01 10:00:00"
    },
    {
      receivedDate: "2024-05-02",
      smsBalance: 100,
      smsPrice: 10,
      expireDateTime: "2024-05-02 10:00:00"
    },
    {
      receivedDate: "2024-05-03",
      smsBalance: 100,
      smsPrice: 10,
      expireDateTime: "2024-05-03 10:00:00"
    }
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-center leading-6 sm:leading-8">
        <thead className="bg-bgBlue border-b-2 border-bgGray leading-10">
          <tr>
            <th className="w-1/12">#</th>
            <th className="w-2/12">{t("module.report.receivedDate")}</th>
            <th className="w-3/12">{t("module.report.smsBalance")}</th>
            <th className="w-3/12">{t("module.report.smsPrice")}</th>
            <th className="w-3/12">{t("module.report.expireDateTime")}</th>
          </tr>
        </thead>
        <tbody className="divide-y font-medium">
          {dummyData.map((row, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-2/12">{row.receivedDate}</td>
              <td className="w-3/12">{row.smsBalance}</td>
              <td className="w-3/12">{row.smsPrice}</td>
              <td className="w-3/12">{row.expireDateTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
