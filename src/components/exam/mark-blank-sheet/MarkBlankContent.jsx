import { useTranslation } from "react-i18next";
import MarkBlankTable from "./MarkBlankTable";

export default function MarkBlankContent() {
    const { t } = useTranslation();

    return (
        <div className="text-center mt-6">
            <h3 className="text-2xl text-center">{t('module.exam.schoolName')}</h3>
            <h4>{t('module.exam.finalExam')}</h4>
            <div className="flex justify-center gap-4">
                <h3>{t('module.exam.class')}: One</h3>
                <h3>{t('module.exam.section')}: Jaba</h3>
            </div>

            <MarkBlankTable />
        </div>
    );
}
