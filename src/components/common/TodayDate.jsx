import { useTranslation } from "react-i18next";

export default function TodayDate() {

   const today = new Date();
   // console.log(today);
   const dd = String(today.getDate()).padStart(2, '0'); // Pad day with leading zero if needed
   const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0, so add 1
 
   const yyyy = today.getFullYear();

   const formattedDate = dd + '-' + mm + '-' + yyyy;

   const {t} = useTranslation();
    return (
      <div className="flex justify-end">
         <div className="flex itemes-center gap-3 md:gap-7 rounded border-2 p-1 pl-3 md:pl-4">
            <h3 className="font-medium md:text-lg">{t('module.communication.date')}: </h3>
            <h3 className="bg-bgBlue px-6 lg:px-12 py-1 text-sm lg:text-base text-#DB9E30">{formattedDate}</h3>
         </div>
      </div>
    );
}