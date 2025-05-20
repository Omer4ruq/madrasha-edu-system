import { useTranslation } from "react-i18next";

export default function FeeTypeTable({ handleEdit, handleDelete }) {
    const { t } = useTranslation();

    const data = [
        {
            type_name: "Stationary Fee",
            late_fee: 3.05,
            schedule_type: "Annually",
            status: "Active",
        },
        {
            type_name: "Stationary Fee",
            late_fee: 3.09,
            schedule_type: "Annually",
            status: "Active",
        },
    ];

    return (
        <div className="border my-6 rounded shadow-md">
            <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
                <thead className="border-b-2 bg-bgBlue">
                    <tr>
                        <th className="w-1/12">{t("module.fees.serial")}</th>
                        <th className="w-3/12">{t("module.fees.type_name")}</th>
                        <th className="w-2/12">{t("module.fees.late_fee")}</th>
                        <th className="w-2/12">{t("module.fees.schedule_type")}</th>
                        <th className="w-2/12">{t("module.fees.status")}</th>
                        <th className="w-3/12">{t("module.fees.actions")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 font-medium">
                    {data.map((item, index) => (
                        <tr key={index} className="text-center">
                            <td className="w-1/12">{index + 1}</td>
                            <td className="w-3/12">{item.type_name}</td>
                            <td className="w-2/12">{item.late_fee}</td>
                            <td className="w-2/12">{item.schedule_type}</td>
                            <td className="w-1/12">{item.status}</td>
                            <td className="w-3/12 pb-1">
                                <button
                                    className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                                    onClick={() => handleEdit(item)}
                                >
                                    {t("module.fees.edit")}
                                </button>
                                <button
                                    className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                                    onClick={() => handleDelete(item.type_name)}
                                >
                                    {t("module.fees.delete")}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
