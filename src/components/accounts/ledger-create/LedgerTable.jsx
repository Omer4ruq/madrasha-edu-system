import { useTranslation } from "react-i18next";

export default function LedgerTable({ handleEdit, handleDelete }) {
  const { t } = useTranslation();

  const data = [
    {
      ledger_name: "Computer",
      category: "Fixed Asset",
      debit_credit: "Debit",
    },
    {
      ledger_name: "Gas Bill",
      category: "Regular Expense",
      debit_credit: "Credit",
    },
  ];

  return (
    <div className="border my-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th className="w-1/12">{t("module.accounts.serial")}</th>
            <th className="w-3/12">{t("module.accounts.ledger_name")}</th>
            <th className="w-2/12">{t("module.accounts.category")}</th>
            <th className="w-2/12">{t("module.accounts.debit_credit")}</th>
            <th className="w-2/12">{t("module.accounts.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          {data.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-3/12">{item.ledger_name}</td>
              <td className="w-2/12">{item.category}</td>
              <td className="w-2/12">{item.debit_credit}</td>
              <td className="w-3/12 pb-1">
                <button
                  className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleEdit(item)}
                >
                  {t("module.fees.edit")}
                </button>
                <button
                  className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleDelete(item.type_name)}
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
