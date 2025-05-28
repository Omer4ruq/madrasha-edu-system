import { useTranslation } from "react-i18next";

export default function SupportForm() {
  const { t } = useTranslation();
  
  return (
    <div className="p-2 sm:p-4 space-y-2">
      <h4 className="text-#DB9E30 font-medium">{t("module.dashboard.title")}</h4>
      <input
        type="text"
        placeholder="Type your suggested title"
        className="w-full bg-bgGray rounded p-2 outline-none"
      />
      <h4 className="text-#DB9E30 font-medium">{t("module.dashboard.description")}</h4>
      <textarea
        placeholder="Write the problem in detail"
        rows="5"
        className="w-full bg-bgGray rounded p-2 outline-none"
      />

      <div className="flex justify-between items-center">
        <div>{/* input type file will be placed here. */}</div>
        <button className="text-white font-medium bg-blue rounded px-4 sm:px-6 leading-9 sm:leading-10">
          {t("module.dashboard.submit_token")}
        </button>
      </div>
    </div>
  );
}
