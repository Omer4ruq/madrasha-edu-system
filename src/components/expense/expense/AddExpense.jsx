import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function AddExpense() {
    const { t } = useTranslation();

    return (
        <div className="my-4 bg-white rounded-md p-4 md:p-6">
            <h3 className="text-2xl font-medium">{t("module.income.addEditExpenseEntry")}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
                <div className="space-y-1">
                    <label className="text-textGray">{t("module.income.id")}</label>
                    <input
                        type="text"
                        placeholder={t("module.income.enterId")}
                        className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-textGray">{t("module.income.name")}</label>
                    <input
                        type="text"
                        placeholder={t("module.income.enterName")}
                        className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-textGray">{t("module.income.amount")}</label>
                    <input
                        type="number"
                        placeholder={t("module.income.enterAmount")}
                        className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-textGray">{t("module.income.incomeHead")}</label>
                    <select
                        className="bg-bgGray w-full rounded px-1 py-2 border-2 text-textGray border-transparent focus:border-primary focus:outline-none"
                    >
                        <option value="Tuition Fee">{t("module.income.tuitionFee")}</option>
                        <option value="Maintenance Fee">{t("module.income.maintenanceFee")}</option>
                        <option value="Cultural Fee">{t("module.income.culturalFee")}</option>
                        <option value="Other">{t("module.income.other")}</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-textGray">{t("module.income.date")}</label>
                    <input
                        type="date"
                        className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-textGray">{t("module.income.invoiceNo")}</label>
                    <input
                        type="number"
                        placeholder={t("module.income.enterInvoice")}
                        className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-textGray">{t("module.income.document")}</label>
                    <input 
                        className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-primary focus:outline-none" 
                        placeholder={t("module.income.uploadDocument")}
                        type="file"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-textGray">{t("module.income.description")}</label>
                <textarea
                    className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-primary focus:outline-none"
                    rows="3"
                    placeholder={t("module.income.enterDescription")}
                ></textarea>
            </div>

            <div className="flex justify-end items-center gap-4 my-4">
                <button className="bg-blue w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
                    {t("module.income.save")}
                </button>

                <Link to="/income/income">
                    <button className="bg-red w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
                        {t("module.income.close")}
                    </button>
                </Link>
            </div>
        </div>
    );
}
