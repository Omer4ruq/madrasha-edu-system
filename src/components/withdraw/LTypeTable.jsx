import { useTranslation } from "react-i18next";

export default function LTypeTable({ handleEdit, handleDelete }) {
  const { t } = useTranslation();

  const withdraws = [
    {
      note: "Note 1",
      withdrawnAmount: 1000,
      receivedBy: "John Doe",
      date: "2021-01-01",
    },
    {
      note: "Note 2",
      withdrawnAmount: 2000,
      receivedBy: "Jane Doe",
      date: "2021-01-02",
    },
    {
      note: "Note 3",
      withdrawnAmount: 3000,
      receivedBy: "John Smith",
      date: "2021-01-03",
    }
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-sm leading-8">
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th className="w-1/12">#</th>
            <th className="w-1/12 px-1">{t("module.income.amount")}</th>
            <th className="w-2/12 min-w-32">{t("module.income.receivedBy")}</th>
            <th className="w-1/12 min-w-20">{t("module.income.date")}</th>
            <th className="w-3/12">{t("module.income.note")}</th>
            <th className="w-1/12 min-w-20">{t("module.income.createdBy")}</th>
            <th className="w-1/12 min-w-20">{t("module.income.updatedBy")}</th>
            <th className="w-2/12 min-w-36">{t("module.income.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          {withdraws.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-1/12">{item.withdrawnAmount}</td>
              <td className="w-2/12">{item.receivedBy}</td>
              <td className="w-1/12">{item.date}</td>
              <td className="w-3/12">{item.note}</td>
              <td className="w-1/12">Admin</td>
              <td className="w-1/12">Admin</td>
              <td className="w-2/12 pb-1">
                <button
                  className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleEdit(item)}
                >
                  {t("module.income.edit")}
                </button>
                <button
                  className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleDelete(item)}
                >
                  {t("module.income.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
