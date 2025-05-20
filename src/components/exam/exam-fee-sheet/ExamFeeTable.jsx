import { useTranslation } from "react-i18next";
import { studentsData } from "../../../data/studentList";

export default function ExamFeeTable() {
    const { t } = useTranslation();

    return (
        <div className="border-2 border-black my-6 rounded shadow-md">
            <table className="w-full leading-6 sm:leading-8">
                <thead className="text-lg leading-9 border-b-2 border-black bg-bgGray">
                    <tr className="divide-x-2 divide-black">
                        <th className="w-2/12">{t('module.exam.roll')}</th>
                        <th className="w-4/12">{t('module.exam.name')}</th>
                        <th className="w-6/12">{t('module.exam.amount')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-black font-medium">
                    {studentsData.map((item, index) => (
                        <tr key={index} className="text-center divide-x-2 divide-black">
                            <td className="w-2/12">{item.id}</td>
                            <td className="w-4/12">{item.name}</td>
                            <td className="w-6/12"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
