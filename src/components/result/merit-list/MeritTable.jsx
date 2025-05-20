import { studentsData } from "../../../data/studentList";
import { useTranslation } from "react-i18next";

export default function MeritTable() {
    const { t } = useTranslation();

    return (
        <div className="border border-black my-6 rounded shadow-md">
            <table className="w-full text-textGray leading-6 sm:leading-8 rounded-md">
                <thead className="text-lg leading-9 border-b-2 border-bgGray bg-bgGreen">
                    <tr className="divide-x-2 divide-bgGray">
                        <th className="w-1/12">{t('module.result.merit')}</th>
                        <th className="w-3/12">{t('module.result.name')}</th>
                        <th className="w-2/12">{t('module.result.roll')}</th>
                        <th className="w-2/12">{t('module.result.totalMarks')}</th>
                        <th className="w-2/12">{t('module.result.gpa')}</th>
                        <th className="w-2/12">{t('module.result.grade')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-bgGray font-medium">
                    {studentsData.map((item, index) => (
                        <tr key={index} className="text-center divide-x-2 divide-bgGray">
                            <td className="w-1/12">{index + 1}</td>
                            <td className="w-3/12">{item.name}</td>
                            <td className="w-2/12">{item.id}</td>
                            <td className="w-2/12">800</td>
                            <td className="w-2/12">5.00</td>
                            <td className="w-2/12">A</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
