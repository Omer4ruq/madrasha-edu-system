import { useTranslation } from "react-i18next";

export default function StudentInfo({ result }) {
    const { t } = useTranslation();

    return (
        <div>
            <h3><span className="text-textGray">{t('module.result.name')} : </span>{result.name}</h3>
            <h3><span className="text-textGray">{t('module.result.roll')} : </span>{result.roll}</h3>
            <h3><span className="text-textGray">{t('module.result.class')} : </span>{result.class}</h3>
            <h3><span className="text-textGray">{t('module.result.section')} : </span>{result.section}</h3>
            <h3><span className="text-textGray">{t('module.result.session')} : </span>{result.session}</h3>
            <h3><span className="text-textGray">{t('module.result.guardian')} : </span>{result.guardian}</h3>
        </div>
    );
}
