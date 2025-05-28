import { useTranslation } from "react-i18next";

export default function AdmitHeader() {
    const { t } = useTranslation();

    return (
        <form className="md:flex gap-8 items-center justify-between mb-2">
            <div className="flex items-center gap-4 w-full my-2">
                <label className="">{t('module.exam.class')}</label>
                <select
                    id=""
                    name=""
                    defaultValue="Class"
                    className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                >
                    <option value="Nursery">Nursery</option>
                    <option value="One">One</option>
                    <option value="Two">Two</option>
                    <option value="Three">Three</option>
                    <option value="Four">Four</option>
                    <option value="Five">Five</option>
                </select>
            </div>

            <div className="flex items-center gap-4 w-full my-2">
                <label className="">{t('module.exam.exam')}</label>
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
                    className="rounded w-44 p-[10px] bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200"
                >
                    {t('module.exam.viewAdmitCard')}
                </button>
            </div>
        </form>
    );
}
