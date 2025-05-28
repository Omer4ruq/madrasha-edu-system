import { useTranslation } from "react-i18next";

export default function MonthForm() {
   const { t } = useTranslation();

   return (
      <form className="md:flex gap-7 items-center justify-between mb-2">
         {/* Month Input */}
         <div className="flex items-center gap-2 md:w-5/12 my-2">
            <label className="w-32">{t("module.report.selectMonth")}</label>
            <input
               type="month"
               className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         {/* Class Select */}
         <div className="flex items-center gap-2 md:w-5/12 my-2">
            <label className="w-32">{t("module.report.selectClass")}</label>
            <select
               id=""
               name=""
               defaultValue="Class"
               className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            >
               <option value="Nursery Jaba">{t("module.report.nurseryJaba")}</option>
               <option value="Nursary Golap">{t("module.report.nurseryGolap")}</option>
               <option value="Nursary Kodom">{t("module.report.nurseryKodom")}</option>
            </select>
         </div>

         {/* Submit Button */}
         <div className="flex items-center gap-2 md:w-2/12 justify-end my-4">
            <button
               type="submit"
               className="rounded w-full p-3 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200"
            >
               {t("module.report.submit")}
            </button>
         </div>
      </form>
   );
}
