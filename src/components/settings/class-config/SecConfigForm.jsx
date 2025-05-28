import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import SecConfigSingleForm from "./SecConfigSingleForm";

export default function SecConfigForm({ section }) {
  const { t } = useTranslation();
  const [sections, setSections] = useState(section);

  function handleAddField() {
    const maxId = sections.reduce((acc, cur) => Math.max(acc, Number(cur.id)), 0);
    setSections([...sections, { id: maxId + 1, name: "", group: "" }]);
  }

  function handleChange(sectionId, property, event) {
    const desiredObject = sections.map(item => 
      item.id === sectionId ? { ...item, [property]: event.target.value } : item
    );
    setSections(desiredObject);
  }

  function handleDeleteField(sectionId) {
    const existingSections = sections.filter(item => item.id !== sectionId);
    setSections(existingSections);
  }

  return (
    <div className="mt-2 space-y-4 sm:space-y-1">
      {sections.map((section, index) => (
        <SecConfigSingleForm
          key={index}
          section={section}
          handleDeleteField={handleDeleteField}
          handleChange={handleChange}
        />
      ))}

      <div className="flex items-center gap-4 pt-6 pb-4">
        <button
          type="button"
          onClick={handleAddField}
          className="rounded w-52 p-2 bg-green text-white shadow-md hover:-translate-y-[2px] duration-200 text-lg"
        >
          <FiPlusCircle className="inline mb-1 mr-1 text-xl" /> {t("module.settings.add_a_field")}
        </button>
        <button
          type="submit"
          className="rounded w-32 p-[10px] bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200"
        >
          {t("module.settings.submit")}
        </button>
      </div>
    </div>
  );
}
