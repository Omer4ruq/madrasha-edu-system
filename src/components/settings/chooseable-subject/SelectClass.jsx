import { useTranslation } from "react-i18next";
import academicSetupList from "../../../data/academicSetupList";

export default function SelectClass() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <label className="w-24 sm:w-28 md:w-32">{t('module.settings.select_class')}: </label>
      <select
        id=""
        name=""
        className="bg-bgGray flex-1 rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
      >
        {academicSetupList[0].content.map((singleClass, index) => (
          <option value="" key={index}>
            {singleClass.info}
          </option>
        ))}
      </select>
      <button className="bg-#DB9E30 hover:bg-buttonHover px-6 md:px-8 lg:px-12 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200 ml-0 sm:ml-2 lg:ml-4">
      {t('module.settings.submit')}
      </button>
    </div>
  );
}
