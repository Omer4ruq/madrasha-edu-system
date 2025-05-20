import { useTranslation } from "react-i18next";
import { studentsData } from "../../../data/studentList";

export default function IncomeTable() {
    const { t } = useTranslation();

    return (
        <div className="overflow-x-scroll border mt-6 rounded shadow-md">
            <table className="w-full text-textGray">
                <thead className="border-b-2 bg-bgBlue leading-10">
                    <tr>
                        <th className="min-w-12">{t("module.income.id")}</th>
                        <th className="min-w-[72px]">{t("module.income.image")}</th>
                        <th className="min-w-36">{t("module.income.name")}</th>
                        <th className="min-w-12">{t("module.income.roll")}</th>
                        <th className="min-w-12">{t("module.income.amount")}</th>
                        <th className="min-w-28">{t("module.income.incomeHead")}</th>
                        <th className="min-w-32">{t("module.income.description")}</th>
                        <th className="min-w-20">{t("module.income.document")}</th>
                        <th className="min-w-24">{t("module.income.invoiceNo")}</th>
                        <th className="min-w-24">{t("module.income.createdBy")}</th>
                        <th className="min-w-24">{t("module.income.updatedBy")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 font-medium text-sm">
                    {studentsData.map((item, index) => (
                        <tr key={index} className="text-center leading-8 even:bg-slate-200">
                            <td className="min-w-12">{item.id}</td>
                            <td className="min-w-[72px]">
                                <img 
                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp0Bjks3GU1iN8K5J-D9JIcL2OR2rF4WX6mg&s"
                                    className="w-8 h-8 rounded-full m-auto" 
                                />
                            </td>
                            <td className="min-w-36">{item.name}</td>
                            <td className="min-w-12">{item.rfid}</td>
                            <td className="min-w-12">12,000</td>
                            <td className="min-w-12">{t("module.income.tuitionFee")}</td>
                            <td className="min-w-32">{t("module.income.tuitionFeePaid")}</td>
                            <td className="min-w-20">
                                <button className="text-red leading-5 p-1 rounded hover:bg-red hover:text-white duration-200">
                                    {t("module.income.download")}
                                </button>
                            </td>
                            <td className="min-w-20">1234567</td>
                            <td className="min-w-20">{t("module.income.admin")}</td>
                            <td className="min-w-20">{t("module.income.admin")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
