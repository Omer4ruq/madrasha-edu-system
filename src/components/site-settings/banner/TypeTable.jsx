import { useTranslation } from "react-i18next";

export default function TypeTable({ handleEdit, handleDelete }) {
  const { t } = useTranslation();

  const dummyDate = [
    {
      id: 1,
      image: "",
      subHeading: "lorem ipsum dolor",
      mainHeading: "lorem ipsum dolor",
      bannerText: "lorem ipsum dolor",
      readMoreLink: "lorem ipsum dolor",
    },
    {
      id: 2,
      image: "",
      subHeading: "lorem ipsum dolor",
      mainHeading: "lorem ipsum dolor",
      bannerText: "lorem ipsum dolor",
      readMoreLink: "lorem ipsum dolor",
    }
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-sm">
        <thead className="border-b-2 bg-bgBlue leading-10">
          <tr>
            <th className="w-1/12">#</th>
            <th className="w-1/12 min-w-24">{t("module.report.bannerImage")}</th>
            <th className="w-2/12 min-w-40">{t("module.report.subHeading")}</th>
            <th className="w-2/12 min-w-40">{t("module.report.mainHeading")}</th>
            <th className="w-2/12 min-w-40">{t("module.report.bannerText")}</th>
            <th className="w-2/12 min-w-40">{t("module.report.readMoreLink")}</th>
            <th className="w-1/12">{t("module.report.status")}</th>
            <th className="w-1/12 min-w-40">{t("module.report.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium leading-5">
          {dummyDate.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-1/12">{item.image}</td>
              <td className="w-2/12">{item.subHeading}</td>
              <td className="w-2/12">{item.mainHeading}</td>
              <td className="w-2/12">{item.bannerText}</td>
              <td className="w-2/12">{item.readMoreLink}</td>
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
                  onClick={() => handleDelete(item.mainHeading)}
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
