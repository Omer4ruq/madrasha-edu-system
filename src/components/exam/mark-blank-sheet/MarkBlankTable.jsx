import { studentsData } from "../../../data/studentList";
import { useTranslation } from "react-i18next";

export default function MarkBlankTable() {
    const { t } = useTranslation();

    return (
        <div className="border-2 border-black my-6 rounded shadow-md">
            <table className="w-full leading-6 sm:leading-8">
                <thead className="text-lg leading-9 border-b-2 border-black bg-bgGray">
                    <tr className="divide-x-2 divide-black">
                        <th className="w-1/12">{t('module.exam.roll')}</th>
                        <th className="w-3/12">{t('module.exam.name')}</th>
                        <th className="w-2/12">{t('module.exam.written')}</th>
                        <th className="w-2/12">{t('module.exam.mcq')}</th>
                        <th className="w-2/12">{t('module.exam.viva')}</th>
                        <th className="w-2/12">{t('module.exam.total')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-black font-medium">
                    {studentsData.map((item, index) => (
                        <tr key={index} className="text-center divide-x-2 divide-black">
                            <td className="w-1/12">{item.id}</td>
                            <td className="w-3/12">{item.name}</td>
                            <td className="w-2/12"></td>
                            <td className="w-2/12"></td>
                            <td className="w-2/12"></td>
                            <td className="w-2/12"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
