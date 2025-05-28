import { useTranslation } from "react-i18next";

export default function ExamFeeHeader() {
    const { t } = useTranslation();

    return (
        <form className="md:flex gap-8 items-center justify-between mb-2">
            <div className="flex items-center gap-2 w-full my-2">
                <label className="">{t('module.exam.exam')}</label>
                <select
                    id=""
                    name=""
                    defaultValue="1st"
                    className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                >
                    <option value="1st">{t('module.exam.term1')}</option>
                    <option value="final">{t('module.exam.final')}</option>
                </select>
            </div>

            <div className="flex items-center gap-2 w-full my-2">
                <label className="">{t('module.exam.class')}</label>
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
                <label className="">{t('module.exam.section')}</label>
                <select
                    id=""
                    name=""
                    defaultValue="select"
                    className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                >
                    <option value="select">{t('module.exam.select')}</option>
                    <option value="Jaba">{t('module.exam.jaba')}</option>
                    <option value="Golap">{t('module.exam.golap')}</option>
                </select>
            </div>

            {/* create button */}
            <div className="flex items-center gap-2 justify-end my-4">
                <button
                    type="submit"
                    className="rounded w-28 p-3 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200"
                >
                    {t('module.exam.submit')}
                </button>
            </div>
        </form>
    );
}
