import { useTranslation } from "react-i18next";

export default function TypeTable({ handleEdit, handleDelete }) {
  const { t } = useTranslation();
  const dummyDate = [
    {
      date: "2024-01-01",
      title: "lorem ipsum dolor",
      description: "lorem ipsum dolor",
      expireDate: "2024-01-01",
    },
    {
      date: "2024-01-01",
      title: "lorem ipsum dolor",
      description: "lorem ipsum dolor",
      expireDate: "2024-01-01",
    },
    {
      date: "2024-01-01",
      title: "lorem ipsum dolor",
      description: "lorem ipsum dolor",
      expireDate: "2024-01-01",
    },
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-sm">
        <thead className="border-b-2 bg-bgBlue leading-10">
          <tr>
            <th className="w-1/12 min-w-8">#</th>
            <th className="w-1/12 min-w-20">{t("module.report.date")}</th>
            <th className="w-3/12 min-w-40">{t("module.report.noticeTitle")}</th>
            <th className="w-3/12 min-w-40">{t("module.report.noticeDescription")}</th>
            <th className="w-1/12 min-w-20">{t("module.report.expireDate")}</th>
            <th className="w-1/12 min-w-24">{t("module.report.fileAttached")}</th>
            <th className="w-2/12 min-w-40">{t("module.report.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium leading-5">
          {dummyDate.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-1/12">{item.date}</td>
              <td className="w-3/12">{item.title}</td>
              <td className="w-3/12">{item.description}</td>
              <td className="w-1/12">{item.expireDate}</td>
              <td className="w-1/12"></td>
              <td className="w-1/12">
                <button
                  className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleEdit(item)}
                >
                  {t("module.report.edit")}
                </button>
                <button
                  className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleDelete(item.title)}
                >
                  {t("module.report.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
