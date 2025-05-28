import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import academicSetupList from "../../../data/academicSetupList";

export default function MarkConfTable() {
  const { t } = useTranslation();

  return (
    <table className="w-full text-textGray leading-10 mb-4">
      <thead className="bg-bgBlue">
        <tr>
          <th className="w-2/12">{t("module.settings.id")}</th>
          <th className="w-6/12">{t("module.settings.class")}</th>
          <th className="w-4/12">{t("module.settings.action")}</th>
        </tr>
      </thead>
      <tbody>
        {academicSetupList[0].content.map((row) => (
          <tr key={row.id} className="text-center border-b-2 even:bg-slate-200">
            <td className="w-2/12">{row.id}</td>
            <td className="w-6/12">{row.info}</td>
            <td className="w-4/12 min-w-40">
              <Link to={`../class-mark-config/${row.id}`}>
                <button
                  className="bg-#DB9E30 px-2 sm:px-3 py-1 sm:py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm my-1 sm:my-[6px]"
                >
                  {t("module.settings.add_class_mark_config")}
                </button>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
