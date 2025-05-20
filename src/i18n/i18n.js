import i18next from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import banglaWords from "./banglaWords";
import englishWords from "./englishWords";

export default function i18n() {}


i18next.use(I18nextBrowserLanguageDetector).use(initReactI18next).init({
   debug: true,
   lng: localStorage.getItem("school-dashboard-language") || "en", //language used
   resources: {
      en: {
        translation: englishWords
      },
      bn: {
        translation: banglaWords
      }
    }
})

