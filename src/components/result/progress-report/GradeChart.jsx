import { useTranslation } from "react-i18next";

export default function GradeChart() {
    const { t } = useTranslation();
  
    const grades = [
        {
            range: "100-80",
            grade: "A+",
            gpa: "5.00"
        },
        {
            range: "70-79",
            grade: "A",
            gpa: "4.00"
        },
        {
            range: "60-69",
            grade: "A-",
            gpa: "3.50"
        },
        {
            range: "50-59",
            grade: "B",
            gpa: "3.00"
        },
        {
            range: "40-49",
            grade: "C",
            gpa: "2.00"
        },
        {
            range: "0-39",
            grade: "F",
            gpa: "0.00"
        },
    ];

    return (
        <table className="border border-black min-w-60 text-sm leading-4">
            <thead>
                <tr className="divide-x divide-black">
                    <th>{t('module.result.range')}</th>
                    <th>{t('module.result.grade')}</th>
                    <th>{t('module.result.gpa')}</th>
                </tr>
            </thead>
            <tbody>
                {
                    grades.map((grade, i) => (
                        <tr key={i} className="divide-x divide-black border-t border-black text-center">
                            <td>{grade.range}</td>
                            <td>{grade.grade}</td>
                            <td>{grade.gpa}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}
