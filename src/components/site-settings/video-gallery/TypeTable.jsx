import { useTranslation } from "react-i18next";

export default function TypeTable({ handleEdit, handleDelete }) {
  const { t } = useTranslation();

  const dummyDate = [
    { title: "Video 1", subTitle: "Video 1 Subtitle", youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Video 2", subTitle: "Video 2 Subtitle", youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Video 3", subTitle: "Video 3 Subtitle", youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { title: "Video 4", subTitle: "Video 4 Subtitle", youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-sm">
        <thead className="border-b-2 bg-bgBlue leading-10">
          <tr>
            <th className="w-1/12">{t("module.report.number")}</th>
            <th className="w-2/12 min-w-40">{t("module.report.videoTitle")}</th>
            <th className="w-2/12 min-w-40">{t("module.report.subTitle")}</th>
            <th className="w-1/12 min-w-20">{t("module.report.image")}</th>
            <th className="w-2/12 min-w-40">{t("module.report.youtubeLink")}</th>
            <th className="w-1/12">{t("module.report.status")}</th>
            <th className="w-3/12 min-w-40">{t("module.report.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium leading-5">
          {dummyDate.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-2/12">{item.title}</td>
              <td className="w-2/12">{item.subTitle}</td>
              <td className="w-1/12"></td>
              <td className="w-2/12">{item.youtubeLink}</td>
              <td className="w-1/12">{t("module.report.active")}</td>
              <td className="w-3/12">
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
