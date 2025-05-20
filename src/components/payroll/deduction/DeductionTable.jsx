import { useTranslation } from "react-i18next";

export default function DeductionTable({ handleEdit, handleDelete }) {
  const { t } = useTranslation();

  const data = [
    {
      name: "Provident Fund",
    },
    {
      name: "Home Rent",
    },
  ];

  return (
    <div className="border my-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th className="w-2/12">{t("module.payroll.serial")}</th>
            <th className="w-5/12">{t("module.payroll.deductionName")}</th>
            <th className="w-5/12">{t("module.payroll.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          {data.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="w-2/12">{index + 1}</td>
              <td className="w-5/12">{item.name}</td>
              <td className="w-5/12 pb-1">
                <button
                  className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleEdit(item)}
                >
                  {t("module.payroll.edit")}
                </button>
                <button
                  className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleDelete(item.name)}
                >
                  {t("module.payroll.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
