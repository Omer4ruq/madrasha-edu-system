import { useTranslation } from "react-i18next";

export default function AddPHeader() {
    const { t } = useTranslation();

    return (
        <div className="flex items-end justify-between mb-6">
            <h3 className="text-2xl font-medium">{t("module.communication.parent_registration")}</h3>
            <div className="flex items-end gap-2">
                <button
                    className="rounded px-6 py-2 md:py-3 bg-textGray text-white shadow-md hover:-translate-y-[2px] duration-200"
                >
                    {t("module.communication.sample_download")}
                </button>
                <button
                    className="rounded px-6 py-2 md:py-3 bg-red text-white shadow-md hover:-translate-y-[2px] duration-200"
                >
                    {t("module.communication.bulk_registration")}
                </button>
                <button
                    className="rounded px-6 py-2 md:py-3 bg-yellow text-white shadow-md hover:-translate-y-[2px] duration-200"
                >
                    {t("module.communication.parent_list")}
                </button>
            </div>
        </div>
    );
}
