import { useTranslation } from "react-i18next";

export default function ReportClosing() {
    const { t } = useTranslation();

    return (
        <>
            <div className="flex justify-between gap-4">
                <table className="w-1/3 border-collapse border border-black text-center">
                    <tr className="divide-x divide-black border-b border-black">
                        <td>{t('module.result.resultStatus')}</td>
                        <td>{t('module.result.failed')}</td>
                    </tr>
                    <tr className="divide-x divide-black">
                        <td>{t('module.result.position')}: 10th</td>
                        <td>2</td>
                    </tr>
                </table>

                <div className="w-2/3 border border-black p-1">
                    {t('module.result.comments')} :
                </div>
            </div>

            <h3 className="mt-10 mb-2 text-center italic">
                {t('module.result.footerNote')}
            </h3>
        </>
    );
}
