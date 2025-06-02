// import { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";

// export default function LangSwitcher() {
//    const [lang, setLang] = useState(localStorage.getItem("school-dashboard-language") || "en");

//    const {i18n} = useTranslation();

//    useEffect(() => {
//      if (i18n.language !== lang) {
//        i18n.changeLanguage(lang);
//        localStorage.setItem("school-dashboard-language", lang);
//      }
//    }, [i18n, lang]);

//   return (
//    <div className="flex items-center justify-center w-full ">
//       <span className="text-[#441a05] font-semibold text-xs mr-2">{lang === "en" ? "English" : "বাংলা"}</span>
//       <label htmlFor="toggle" className="flex items-center cursor-pointer">
//          <input type="checkbox" id="toggle" className="sr-only peer" checked={lang === "bn"} onChange={e => setLang(e.target.checked ? "bn" : "en")} />
//          <div className="block relative bg-[#441a05] w-9 h-5 p-1 rounded-full before:absolute before:bg-[#DB9E30] before:w-3 before:h-3 before:p-1 before:rounded-full before:transition-all before:duration-500 before:left-1 peer-checked:before:left-5 peer-checked:before:bg-white"></div>
//       </label>
//    </div>
//   )
// }





import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LangSwitcher() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Always force "bn" as language
    if (i18n.language !== "bn") {
      i18n.changeLanguage("bn");
      localStorage.setItem("school-dashboard-language", "bn");
    }
  }, [i18n]);

  return null; // Hide the component from UI
}
