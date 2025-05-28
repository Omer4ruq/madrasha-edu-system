import { useTranslation } from "react-i18next";

export default function ScDownloadForm() {
    const { t } = useTranslation();

    return (
        <form className="md:flex gap-7 items-center justify-between mb-2">
            <div className="flex items-center gap-2 w-full my-2">
                <label>{t('module.exam.class')}</label>
                <select
                    id=""
                    name=""
                    defaultValue="Class"
                    className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                >
                    <option value="Nursery">{t('module.exam.nursery')}</option>
                    <option value="One">{t('module.exam.one')}</option>
                    <option value="Two">{t('module.exam.two')}</option>
                    <option value="Three">{t('module.exam.three')}</option>
                    <option value="Four">{t('module.exam.four')}</option>
                    <option value="Five">{t('module.exam.five')}</option>
                </select>
            </div>

            <div className="flex items-center gap-2 w-full my-2">
                <label>{t('module.exam.shift')}</label>
                <select
                    id=""
                    name=""
                    defaultValue="Morning"
                    className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                >
                    <option value="Morning">{t('module.exam.morning')}</option>
                    <option value="Day">{t('module.exam.day')}</option>
                    <option value="Evening">{t('module.exam.evening')}</option>
                </select>
            </div>

            <div className="flex items-center gap-2 w-full my-2">
                <label>{t('module.exam.exam')}</label>
                <select
                    id=""
                    name=""
                    defaultValue="1st"
                    className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                >
                    <option value="1st">{t('module.exam.firstTerm')}</option>
                    <option value="final">{t('module.exam.finalTerm')}</option>
                </select>
            </div>

            <div className="flex items-center gap-2 justify-end my-4">
                <button
                    type="submit"
                    className="rounded w-28 p-3 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
                >
                    {t('module.exam.submit')}
                </button>
            </div>
        </form>
    );
}
