import { useTranslation } from "react-i18next";

export default function TabForm() {
    const { t } = useTranslation();

    return (
        <form className="sm:flex space-y-2 gap-2 sm:gap-3 md:gap-5 lg:gap-7 items-end mt-2 sm:mt-0 mb-2">
            {/* select exam */}
            <div className="space-y-1 w-full sm:w-1/4">
                <label>{t('module.result.select_exam')}</label>
                <select
                    defaultValue={t('module.result.select_exam')}
                    className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                >
                    <option value="Select Exam" disabled>{t('module.result.select_exam')}</option>
                    <option value="First Term">{t('module.result.first_term')}</option>
                    <option value="Second Term">{t('module.result.second_term')}</option>
                </select>
            </div>

            {/* select class */}
            <div className="space-y-1 w-full sm:w-1/4">
                <label>{t('module.result.select_class')}</label>
                <select
                    defaultValue={t('module.result.select_class')}
                    className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                >
                    <option value="Select Class" disabled>{t('module.result.select_class')}</option>
                    <option value="Nursery Jaba">{t('module.result.nursery_jaba')}</option>
                    <option value="Nursery Golap">{t('module.result.nursery_golap')}</option>
                    <option value="Class One Dalim">{t('module.result.class_one_dalim')}</option>
                </select>
            </div>

            {/* select section */}
            <div className="space-y-1 w-full sm:w-1/4 pb-2 sm:pb-0">
                <label>{t('module.result.select_section')}</label>
                <select
                    defaultValue={t('module.result.select_section')}
                    className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                >
                    <option value="Select Section" disabled>{t('module.result.select_section')}</option>
                    <option value="Jaba">{t('module.result.jaba')}</option>
                    <option value="Kodom">{t('module.result.kodom')}</option>
                    <option value="Golap">{t('module.result.golap')}</option>
                </select>
            </div>

            {/* load marks button */}
            <button
                type="submit"
                className="rounded w-full sm:w-1/4 p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200"
            >
                {t('module.result.load_marks')}
            </button>
        </form>
    );
}
