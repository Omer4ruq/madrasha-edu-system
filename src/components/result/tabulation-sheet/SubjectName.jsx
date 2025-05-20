import { useTranslation } from "react-i18next";

export default function SubjectName({ data }) {
    const { t } = useTranslation();

    return (
        <th className="min-w-20 pt-1">
            {data}
            <div className="text-base -rotate-[91deg] mt-1 mb-2 leading-7">
                <h3>{t('module.result.written')}</h3>
                <h3>{t('module.result.mcq')}</h3>
            </div>
        </th>
    );
}
