import { useTranslation } from "react-i18next";

export default function AExRSingleForm({ exam, handleDeleteField, handleChange }) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="md:flex gap-4 flex-1">
                <div className="flex items-center gap-2 lg:gap-4 my-2 min-w-fit w-full">
                    <label>{t('module.exam.exam')}</label>
                    <select
                        id=""
                        name=""
                        value={exam.exam}
                        onChange={(e) => handleChange(exam.id, "exam", e)}
                        className="bg-bgGray min-w-36 w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    >
                        <option value="select">{t('module.exam.select')}</option>
                        <option value="1st Term">1st Term</option>
                        <option value="Final Term">Final Term</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 lg:gap-4 my-2 min-w-fit w-full">
                    <label>{t('module.exam.subject')}</label>
                    <select
                        id=""
                        name=""
                        value={exam.subject}
                        onChange={(e) => handleChange(exam.id, "subject", e)}
                        className="bg-bgGray min-w-36 w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    >
                        <option value="select">{t('module.exam.select')}</option>
                        <option value="bangla">Bangla</option>
                        <option value="english">English</option>
                        <option value="math">Math</option>
                        <option value="biology">Biology</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 lg:gap-4 my-2 min-w-fit w-full">
                    <label>{t('module.exam.date')}</label>
                    <input
                        type="date"
                        className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 lg:gap-4 my-2 min-w-fit w-full">
                    <label>{t('module.exam.start')}</label>
                    <input
                        type="time"
                        className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 lg:gap-4 my-2 min-w-fit w-full">
                    <label>{t('module.exam.end')}</label>
                    <input
                        type="time"
                        className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="flex items-center justify-end">
                    <button
                        type="submit"
                        onClick={() => handleDeleteField(exam.id)}
                        className="rounded w-28 md:w-20 lg:w-28 xl:ml-6 p-2 bg-red text-white shadow-md hover:-translate-y-[2px] duration-200"
                    >
                        {t('module.exam.delete')}
                    </button>
                </div>
            </div>
        </div>
    );
}
