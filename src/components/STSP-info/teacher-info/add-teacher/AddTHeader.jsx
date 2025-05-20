import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AddTHeader() {
    const { t } = useTranslation();

    return (
        <div className="flex items-end justify-between">
            <h3 className="text-2xl font-medium">{t("module.teacher.registration")}</h3>
            <div className="flex items-end gap-2">
                <button
                    className="rounded px-6 py-2 md:py-3 bg-textGray text-white shadow-md hover:-translate-y-[2px] duration-200"
                >
                    {t("module.teacher.sample_download")}
                </button>
                <button
                    className="rounded px-6 py-2 md:py-3 bg-red text-white shadow-md hover:-translate-y-[2px] duration-200"
                >
                    {t("module.teacher.bulk_registration")}
                </button>
                <Link to="/teacher-info/teacher-list">
                    <button
                        className="rounded px-6 py-2 md:py-3 bg-yellow text-white shadow-md hover:-translate-y-[2px] duration-200"
                    >
                        {t("module.teacher.teacher_list")}
                    </button>
                </Link>
            </div>
        </div>
    );
}
