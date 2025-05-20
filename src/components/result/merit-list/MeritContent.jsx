import { useTranslation } from "react-i18next";
import MeritTable from "./MeritTable";

export default function MeritContent() {
    const { t } = useTranslation();

    return (
        <div>
            <h3 className="text-2xl text-center mt-10">{t('module.result.finalTermExam')}</h3>
            <h3 className="text-xl text-center my-3 underline">{t('module.result.meritList')}</h3>
            <div className="text-lg flex items-center text-center my-4">
                <h3 className="w-1/2 md:w-1/4">{t('module.result.class')}: One</h3>
                <h3 className="w-1/2 md:w-1/4">{t('module.result.section')}: Jaba</h3>
                <h3 className="w-1/2 md:w-1/4">{t('module.result.shift')}: Morning</h3>
                <h3 className="w-1/2 md:w-1/4">{t('module.result.session')}: 2024</h3>
            </div>

            <MeritTable />
        </div>
    );
}
