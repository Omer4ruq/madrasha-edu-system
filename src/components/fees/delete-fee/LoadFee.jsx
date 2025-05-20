import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function LoadFee() {
  const [activeSearch, setActiveSearch] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const { t } = useTranslation(); // Initialize translation function

  return (
    <div className="flex justify-between items-center">
      {/* load fee by student */}
      <div className="search_student_fee flex items-center gap-4">
        <div className="inline-block relative w-64">
          <input
            onFocus={() => setActiveSearch(true)}
            onBlur={() => setTimeout(() => { setActiveSearch(false) }, 300)}
            placeholder={t("module.fees.search_here")} // Use translation key
            type="text"
            onChange={(e) => setSelectedStudent(e.target.value)}
            value={selectedStudent}
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          />
          {activeSearch && (
            <div className="search_results absolute shadow border w-full z-10 bg-white">
              <ul>
                <li
                  onClick={() => { setSelectedStudent("Md. Nazmus Sakib"); setIsSelected(true); }}
                  className="p-2 cursor-pointer hover:bg-slate-400"
                >
                  Md. Nazmus Sakib
                </li>
                <li
                  onClick={() => { setSelectedStudent("Hosne Ara Khatun"); setIsSelected(true); }}
                  className="p-2 cursor-pointer hover:bg-slate-400"
                >
                  Hosne Ara Khatun
                </li>
              </ul>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="rounded w-20 p-2 bg-primary hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200 flex items-center justify-center gap-2"
        >
          {t("module.fees.load")} {/* Use translation key */}
        </button>
      </div>

      {/* selected student */}
      {isSelected && selectedStudent && (
        <div className="selected_student_fee">
          <h4>
            <b>{t("module.fees.name")}:</b> {selectedStudent} {/* Use translation key */}
          </h4>
        </div>
      )}
    </div>
  );
}
