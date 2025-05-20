import { useTranslation } from "react-i18next";

export default function AddSHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-medium">{t("module.communication.staffRegistration")}</h3>
      <div className="flex items-end gap-2">
        <button className="rounded px-6 py-2 md:py-3 bg-textGray text-white shadow-md hover:-translate-y-[2px] duration-200">
          {t("module.communication.sampleDownload")}
        </button>
        <button className="rounded px-6 py-2 md:py-3 bg-red text-white shadow-md hover:-translate-y-[2px] duration-200">
          {t("module.communication.bulkRegistration")}
        </button>
        <button className="rounded px-6 py-2 md:py-3 bg-yellow text-white shadow-md hover:-translate-y-[2px] duration-200">
          {t("module.communication.staffList")}
        </button>
      </div>
    </div>
  );
}
