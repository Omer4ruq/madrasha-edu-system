import { useTranslation } from "react-i18next";
import SingleMark from "./SingleMark";

export default function MarksTable() {
    const { t } = useTranslation();

    const studentMarks = [
        {
            id: '1',
            name: "Shamim Anwar",
            roll: '01',
        },
        {
            id: '2',
            name: "Shamim Anwar",
            roll: '02',
        },
        {
            id: '3',
            name: "Shamim Anwar",
            roll: '03',
        },
        {
            id: '4',
            name: "Shamim Anwar",
            roll: '04',
        },
        {
            id: '5',
            name: "Shamim Anwar",
            roll: '05',
        },
    ];

    return (
        <table className="w-full text-textGray text-lg leading-10 mt-4 mb-2">
            <thead className="border-b-2 bg-bgGreen">
                <tr>
                    <th className="w-2/12">{t('module.result.id')}</th>
                    <th className="w-3/12">{t('module.result.name')}</th>
                    <th className="w-1/12">{t('module.result.roll')}</th>
                    <th className="w-2/12">{t('module.result.written')}</th>
                    <th className="w-2/12">{t('module.result.mcq')}</th>
                    <th className="w-2/12">{t('module.result.total')}</th>
                </tr>
            </thead>
            <tbody className="divide-y-2">
                {studentMarks.map(row => <SingleMark key={row.id} data={row} />)}
            </tbody>
        </table>
    );
}
