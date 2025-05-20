import TabulTable from "./TabulTable";
import { useTranslation } from "react-i18next";

export default function TabulContent() {
    const { t } = useTranslation();

    return (
        <div>
            <h3 className="text-2xl text-center mt-8">{t('module.result.final_term_exam')}</h3>
            <div className="flex items-center text-center my-4">
                <h3 className="w-1/2 md:w-1/4">{t('module.result.class')}: One</h3>
                <h3 className="w-1/2 md:w-1/4">{t('module.result.section')}: Jaba</h3>
                <h3 className="w-1/2 md:w-1/4">{t('module.result.shift')}: Morning</h3>
                <h3 className="w-1/2 md:w-1/4">{t('module.result.session')}: 2024</h3>
            </div>

            <TabulTable />
        </div>
    );
}
