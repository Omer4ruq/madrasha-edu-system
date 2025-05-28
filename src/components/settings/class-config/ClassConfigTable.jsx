import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";



export default function ClassConfigTable({ classConfig }) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-scroll">
      <table className="w-full text-textGray leading-10 mb-4">
        <thead className="bg-bgBlue">
          <tr>
            <th className="w-1/12">{t('module.settings.serial')}</th>
            <th className="w-2/12">{t('module.settings.class')}</th>
            <th className="w-2/12">{t('module.settings.shift')}</th>
            <th className="w-4/12">{t('module.settings.section')}</th>
            <th className="w-3/12">{t('module.settings.action')}</th>
          </tr>
        </thead>
        <tbody>
          {classConfig.map(row => (
            <tr key={row.id} className="text-center border-b-2 even:bg-slate-200">
              <td className="w-1/12">{row.id}</td>
              <td className="w-2/12">{row.class}</td>
              <td className="w-2/12">{row.shift}</td>
              <td className="w-4/12 px-2">
                {row.section.map((item, index) => (
                  <p key={index} className="inline bg-red text-white px-2 py-1 rounded m-[2px]">
                    {item.name}
                  </p>
                ))}
              </td>
              <td className="w-3/12 min-w-40">
                <Link to={`../section-config/${row.id}`}>
                  <button
                    className="bg-#DB9E30 px-3 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm my-[6px]"
                  >
                    {t('module.settings.add_class_section')}
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
