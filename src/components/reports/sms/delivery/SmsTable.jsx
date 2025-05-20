import { useTranslation } from "react-i18next";

export default function SmsTable() {
  const { t } = useTranslation();

  const dummyData = [
    {
      sendDate: "2024-05-01",
      sendTime: "10:00",
      receiver: "Md. Harun Ali",
      mobile: "9876543210",
      createdBy: "John Doe",
    },
    {
      sendDate: "2024-05-01",
      sendTime: "10:00",
      receiver: "Md. Liakot Ali",
      mobile: "9876543210",
      createdBy: "John Doe",
    }
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-center leading-6 sm:leading-8">
        <thead className="bg-bgBlue border-b-2 border-bgGray leading-10">
          <tr>
            <th className="w-1/12">#</th>
            <th className="w-2/12">{t("module.report.sendDate")}</th>
            <th className="w-1/12 min-w-32">{t("module.report.sendTime")}</th>
            <th className="w-3/12">{t("module.report.receiver")}</th>
            <th className="w-2/12 min-w-16">{t("module.report.mobile")}</th>
            <th className="w-1/12 min-w-20">{t("module.report.createdBy")}</th>
            <th className="w-2/12 min-w-20">{t("module.report.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y font-medium">
          {dummyData.map((row, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-2/12">{row.sendDate}</td>
              <td className="w-1/12">{row.sendTime}</td>
              <td className="w-3/12">{row.receiver}</td>
              <td className="w-2/12">{row.mobile}</td>
              <td className="w-1/12">{row.createdBy}</td>
              <td className="w-2/12">
                {/* Action buttons can be added here */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
