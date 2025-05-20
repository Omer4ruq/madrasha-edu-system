import { useTranslation } from "react-i18next";

export default function DeleteFeeTable({ handleDelete }) {
  const { t } = useTranslation(); // Initialize translation function

  const data = [
    {
      fee_name: "September Month Fee",
      amount: 500,
      discount: 100,
      status: "paid",
    },
    {
      fee_name: "September Month Fee",
      amount: 500,
      discount: 100,
      status: "unpaid",
    },
  ];

  return (
    <div className="border my-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th className="w-1/12">{t("module.fees.serial")}</th>
            <th className="w-2/12">{t("module.fees.fee_name")}</th>
            <th className="w-2/12">{t("module.fees.amount")}</th>
            <th className="w-2/12">{t("module.fees.discount")}</th>
            <th className="w-2/12">{t("module.fees.final_amount")}</th>
            <th className="w-1/12">{t("module.fees.status")}</th>
            <th className="w-2/12">{t("module.fees.action")}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          {data.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-2/12">{item.fee_name}</td>
              <td className="w-2/12">{item.amount}</td>
              <td className="w-2/12">{item.discount}</td>
              <td className="w-2/12">{item.amount - item.discount}</td>
              <td className="w-1/12">{item.status}</td>
              <td className="w-2/12 pb-1">
                <button
                  className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleDelete(item.fee_name)}
                >
                  {t("module.fees.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
