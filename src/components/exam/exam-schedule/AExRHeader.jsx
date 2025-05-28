import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AExRHeader() {
    const { t } = useTranslation();

    return (
        <div className="flex gap-4 items-center justify-between bg-bgGreen px-2 py-3 my-2 rounded">
            <div className="sm:flex gap-2 text-#DB9E30 font-bold divide-x-2 divide-#DB9E30">
                <h3 className="">{t('module.exam.class')}: One</h3>
                <h3 className="pl-2">{t('module.exam.section')}: Jaba</h3>
                <h3 className="pl-2">{t('module.exam.shift')}: Morning</h3>
            </div>
            <div className="flex items-center gap-2 justify-end">
                <Link to="../exam-schedule">
                    <button
                        type="submit"
                        className="rounded w-full px-4 py-2 bg-yellow text-white shadow-md hover:-translate-y-[2px] duration-200"
                    >
                        {t('module.exam.exam_schedule')}
                    </button>
                </Link>
            </div>
        </div>
    );
}
