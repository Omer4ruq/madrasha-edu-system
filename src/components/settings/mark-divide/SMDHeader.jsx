import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function SMDHeader() {
   const { t } = useTranslation();
    return (
      <div className="flex gap-4 items-center justify-between bg-bgGreen px-2 py-3 my-2 rounded">
         <div className="text-#DB9E30 font-bold">
            <h3 className="">{t('module.settings.class')} : One</h3>
         </div>
         <div className="flex items-center gap-2 justify-end">
            <Link to="../mark-divide">
               <button
                  type="submit"
                  className="rounded w-full px-4 py-2 bg-yellow text-white shadow-md  hover:-translate-y-[2px] duration-200"
               >
                  {t('module.settings.list_subject_config')}
               </button>
            </Link>
         </div>
      </div>
    );
}