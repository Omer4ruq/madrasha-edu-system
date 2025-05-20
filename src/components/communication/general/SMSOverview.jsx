import { useTranslation } from "react-i18next";

export default function SMSOverview({characterCount}) {
    const {t} = useTranslation();
    return (
        <div className="flex justify-between pt-4">
         <h5>
         {t('module.communication.character_count')}: {characterCount}</h5>
         <h5>
         {t('module.communication.number_of_sms')}: 0</h5>
        </div>
    );
}