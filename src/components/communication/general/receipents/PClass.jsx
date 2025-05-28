import { useTranslation } from "react-i18next";

export default function PClass() {
  const {t} = useTranslation();
    return (
      <div className="space-y-2">
         <label className="w-28 md:max-lg:w-32">
         {t('module.communication.select_class')}</label>
         <input
         type="text"
         placeholder="Enter Class"
         className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         />
      </div>
    );
}