import { useTranslation } from "react-i18next";
import ExScTable from "./ExScTable";

export default function ExamSchedule() {
    const { t } = useTranslation();

    return (
        <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
            <h3 className="text-2xl font-bold mt-4 mb-8">{t('module.exam.exam_schedule')}</h3>
            <ExScTable />
        </div>
    );
}
