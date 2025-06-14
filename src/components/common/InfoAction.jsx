import { useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { Link } from "react-router-dom";
import ExportPdfCsv from "./ExportPdfCsv";
import { useTranslation } from "react-i18next";

export default function InfoAction({ addLink, amountToShow, handleAmountToShow }) {
    const { t } = useTranslation();
    const [isExport, setIsExport] = useState(false);
    
    function handleOutsideClick() {
        setIsExport(false);
    }

    return (
        <div className="md:flex justify-between">
            {/* left side buttons */}
            <div className="rounded flex items-center mb-4 md:mb-0">
                <Link to={addLink}>
                    <button className="text-white bg-#DB9E30 px-4 md:px-5 py-2 rounded-l">
                        {t("module.income.addNewRecord")}
                    </button>
                </Link>
                <div
                    className="flex items-center gap-1 bg-#DB9E30 px-4 md:px-5 py-2 rounded-r text-white relative"
                    onClick={() => setIsExport(state => !state)}
                >
                    <button>{t("module.income.export")}</button>
                    <FaAngleDown />
                    {isExport && <ExportPdfCsv handleOutsideClick={handleOutsideClick} />}
                </div>
            </div>

            {/* search box and selection */}
            <div className="flex items-center justify-between gap-6">
                <input
                    type="text"
                    placeholder={t("module.income.enterSearchTerm")}
                    className="bg-bgGray w-full md:w-64 rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                    <h3>{t("module.income.show")}</h3>
                    <select
                        value={amountToShow}
                        onChange={(e) => handleAmountToShow(e.target.value)}
                        className="bg-bgGray w-16 rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <h3>{t("module.income.entries")}</h3>
                </div>
            </div>
        </div>
    );
}
