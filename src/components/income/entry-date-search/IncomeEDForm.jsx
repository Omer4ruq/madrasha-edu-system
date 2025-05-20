import { useTranslation } from "react-i18next"; // Import useTranslation
import TodayDate from "../../common/TodayDate";

export default function IncomeEDForm() {
    const { t } = useTranslation(); // Initialize useTranslation

    return (
        <div className="md:flex justify-between items-center">
            <div className="flex items-center md:w-2/3 lg:w-1/2 my-4 gap-2 md:gap-4">
                <label className="w-36">{t("module.income.selectDate")}</label> {/* Translate Select Date */}
                <input
                    type="date"
                    className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
                />
                <button className="bg-primary hover:bg-buttonHover w-24 sm:w-32 md:w-40 ml-1 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
                    {t("module.income.submit")} {/* Translate Submit */}
                </button>
            </div>
            <TodayDate />
        </div>
    );
}
