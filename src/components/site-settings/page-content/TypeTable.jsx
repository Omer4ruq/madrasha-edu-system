import { useTranslation } from "react-i18next";

export default function TypeTable({ handleEdit, handleDelete }) {
  const { t } = useTranslation(); // Initialize translation function

  const dummyData = [
    {
      pageName: "Home",
      heading: "Welcome to our website",
      subHeading: "Introduction to our site",
      content: "Details about our welcome message",
    },
    {
      pageName: "About",
      heading: "About Us",
      subHeading: "Learn about our journey",
      content: "Information about our background and mission",
    }
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-sm">
        <thead className="border-b-2 bg-bgBlue leading-10">
          <tr>
            <th className="w-1/12">{t("module.report.serial")}</th>
            <th className="w-1/12 min-w-20">{t("module.report.pageName")}</th>
            <th className="w-2/12 min-w-40">{t("module.report.heading")}</th>
            <th className="w-2/12 min-w-40">{t("module.report.subHeading")}</th>
            <th className="w-1/12 min-w-40">{t("module.report.image")}</th>
            <th className="w-3/12 min-w-40">{t("module.report.content")}</th>
            <th className="w-1/12">{t("module.report.status")}</th>
            <th className="w-1/12 min-w-40">{t("module.report.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium leading-5">
          {dummyData.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-1/12">{item.pageName}</td>
              <td className="w-2/12">{item.heading}</td>
              <td className="w-2/12">{item.subHeading}</td>
              <td className="w-1/12">{item.imageName || "-"}</td>
              <td className="w-3/12">{item.content}</td>
              <td className="w-1/12">{t("module.report.active")}</td>
              <td className="w-1/12">
                <button
                  className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleEdit(item)}
                >
                  {t("module.report.edit")}
                </button>
                <button
                  className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleDelete(item.pageName)}
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
