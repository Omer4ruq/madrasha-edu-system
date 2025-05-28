import { useTranslation } from "react-i18next";
import GradeChart from "./GradeChart";
import ObtainedMarks from "./ObtainedMarks";
import ReportClosing from "./ReportClosing";
import StudentInfo from "./StudentInfo";

export default function ReportCard({ result }) {
    const { t } = useTranslation();

    return (
        <div className="p-4 border border-#DB9E30 rounded">
            <h3 className="text-center text-2xl font-medium">{t('module.result.schoolName')}</h3>
            <div className="flex items-center gap-3 my-4">
                <div className="flex-1 bg-bgGreen w-full h-5 block rounded"></div>
                <h3 className="text-center text-xl">{t('module.result.progressReport')}</h3>
            </div>

            <div className="flex items-start justify-between gap-2">
                <StudentInfo result={result} />
                <GradeChart />
            </div>

            <ObtainedMarks />

            <ReportClosing />
        </div>
    );
}
