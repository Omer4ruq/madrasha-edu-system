import ExamFeeTable from "./ExamFeeTable";
import { useTranslation } from "react-i18next";

export default function ExamFeeContent() {
    const { t } = useTranslation();

    return (
        <div className="text-center mt-6">
            <h3 className="text-2xl text-center">{t('module.exam.urban_high_school')}</h3>
            <h4>{t('module.exam.exam')}</h4>
            <div className="flex justify-center gap-4">
                <h3>{t('module.exam.class')}</h3>
                <h3>{t('module.exam.section')}</h3>
            </div>

            <ExamFeeTable />
        </div>
    );
}
