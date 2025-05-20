import ExamSignTable from "./ExamSignTable";
import { useTranslation } from "react-i18next";

export default function ExamSignContent() {
    const { t } = useTranslation();

    return (
        <div className="text-center mt-6">
            <h3 className="text-2xl text-center">{t('module.exam.urban_high_school')}</h3>
            <h4 className="underline text-lg">{t('module.exam.exam_signature_sheet')}</h4>
            <h4>{t('module.exam.final_term_exam')}</h4>
            <div className="flex justify-center gap-4">
                <h3>{t('module.exam.class')}: One</h3>
                <h3>{t('module.exam.section')}: Jaba</h3>
            </div>

            <ExamSignTable />
        </div>
    );
}
