import { useTranslation } from "react-i18next";
import academicSetupList from "../../../data/academicSetupList";

export default function ClassSubjectAssign() {
  const { t } = useTranslation();

  return (
    <div className="bg-white px-4 py-6 rounded mt-4">
      {/* select a particular class */}
      <div className="flex items-center">
        <label className="w-24 sm:w-28 md:w-32">{t("module.settings.class_name")}: </label>
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
      </div>

      {/* show all subjects */}
      <div className="grid grid-cols-3 sm:grid-cols-5 my-6">
        {academicSetupList[2].content.map((singleSubject, index) => (
          <div key={index} className="space-x-2 border-b-2 py-3">
            <input
              type="checkbox"
              id=""
              name=""
              value="hi"
              className="text-#DB9E30"
            ></input>
            <label htmlFor="vehicle1">{singleSubject.info}</label>
          </div>
        ))}
      </div>

      {/* save button */}
      <button className="bg-#DB9E30 hover:bg-buttonHover px-6 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
        {t("module.settings.save")}
      </button>
    </div>
  );
}
