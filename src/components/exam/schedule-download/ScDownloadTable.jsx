import { useTranslation } from "react-i18next";

export default function ScDownloadTable() {
    const { t } = useTranslation();

    const schedule = [
        {
            id: '1',
            subject: "Bangla 1st paper",
            date: "01/06/2024",
            start: "10:00 AM",
            end: "1:00 PM"
        },
        {
            id: '2',
            subject: "English 1st Paper",
            date: "03/06/2024",
            start: "10:00 AM",
            end: "1:00 PM"
        },
        {
            id: '3',
            subject: "Higher Math",
            date: "05/06/2024",
            start: "10:00 AM",
            end: "1:00 PM"
        },
        {
            id: '4',
            subject: "Bangla 2nd paper",
            date: "06/06/2024",
            start: "10:00 AM",
            end: "1:00 PM"
        },
    ];

    return (
        <div className="">
            <h3 className="text-center font-bold text-2xl">Urban High School & College</h3>
            <h3 className="text-center font-bold text-xl">{t('module.exam.finalTermExamRoutine')}</h3>

            <div className="flex justify-between mt-4 mb-6">
                <div>
                    <h3><span className="font-bold">{t('module.exam.class')}:</span> One</h3>
                    <h3><span className="font-bold">{t('module.exam.section')}:</span> Jaba</h3>
                    <h3><span className="font-bold">{t('module.exam.shift')}:</span> Morning</h3>
                    <h3><span className="font-bold">{t('module.exam.section')}:</span> Jaba</h3>
                </div>

                <div>
                    <h3><span className="font-bold">{t('module.exam.startDate')}:</span> 01/06/2024</h3>
                    <h3><span className="font-bold">{t('module.exam.endDate')}:</span> 24th May, 2024</h3>
                </div>
            </div>

            <table className="w-full text-textGray leading-10 mb-4">
                <thead className="bg-bgBlue">
                    <tr>
                        <th className="w-1/12">{t('module.exam.serial')}</th>
                        <th className="w-3/12">{t('module.exam.date')}</th>
                        <th className="w-4/12">{t('module.exam.subject')}</th>
                        <th className="w-2/12">{t('module.exam.start')}</th>
                        <th className="w-2/12">{t('module.exam.end')}</th>
                    </tr>
                </thead>
                <tbody>
                    {schedule.map(row => (
                        <tr key={row.id} className="text-center border-b-2 even:bg-slate-200">
                            <td className="w-1/12">{row.id}</td>
                            <td className="w-3/12">{row.date}</td>
                            <td className="w-4/12">{row.subject}</td>
                            <td className="w-2/12">{row.start}</td>
                            <td className="w-2/12">{row.end}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
