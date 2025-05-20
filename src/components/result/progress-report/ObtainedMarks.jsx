import { useTranslation } from "react-i18next";

export default function ObtainedMarks() {
    const { t } = useTranslation();

    const marks = [
        {
            subject: "Bangla",
            full: "100",
            written: "54",
            mcq: "36",
            total: '90',
            grade: "5.00",
            letter: "A+"
        },
        {
            subject: "English",
            full: "100",
            written: "50",
            mcq: "28",
            total: '82',
            grade: "5.00",
            letter: "A+"
        },
        {
            subject: "Math",
            full: "100",
            written: "40",
            mcq: "25",
            total: '72',
            grade: "4.00",
            letter: "A"
        },
    ];

    return (
        <table className="border border-black w-full my-4">
            <thead>
                <tr className="divide-x divide-black">
                    <th>{t('module.result.subject')}</th>
                    <th>{t('module.result.fullMarks')}</th>
                    <th>
                        <h3>{t('module.result.obtainedMarks')}</h3>
                        <div className="flex border-t border-black divide-x divide-black">
                            <h3 className="w-1/2">{t('module.result.written')}</h3>
                            <h3 className="w-1/2">{t('module.result.mcq')}</h3>
                        </div>
                    </th>
                    <th>{t('module.result.total')}</th>
                    <th>{t('module.result.grade')}</th>
                    <th>{t('module.result.letter')}</th>
                </tr>
            </thead>
            <tbody>
                {
                    marks.map((mark, i) => (
                        <tr key={i} className="divide-x divide-black border-t border-black text-center">
                            <td>{mark.subject}</td>
                            <td>{mark.full}</td>
                            <td>
                                <div className="flex divide-x divide-black">
                                    <h3 className="w-1/2">{mark.written}</h3>
                                    <h3 className="w-1/2">{mark.mcq}</h3>
                                </div>
                            </td>
                            <td>{mark.total}</td>
                            <td>{mark.grade}</td>
                            <td>{mark.letter}</td>
                        </tr>
                    ))
                }

                <tr className="border-t border-black divide-x divide-black text-center font-medium">
                    <td>{t('module.result.totalMarks')}</td>
                    <td>300</td>
                    <td>
                        <div className="flex divide-x divide-black">
                            <h3 className="w-1/2">180</h3>
                            <h3 className="w-1/2">120</h3>
                        </div>
                    </td>
                    <td>320</td>
                    <td>4.50</td>
                    <td>A</td>
                </tr>
            </tbody>
        </table>
    );
}
