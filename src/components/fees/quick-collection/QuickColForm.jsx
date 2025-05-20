import { useTranslation } from "react-i18next";
import { months } from "../../../data/months";

const QuickColForm = () => {
  const { t } = useTranslation();

  return (
    <form>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label>{t("module.fees.select_session")}</label>

         <select
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
            defaultValue="0"
            name="select_session"
            id="select_session"
         >
            <option value="">{t("module.fees.select_session")}</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
         </select>
        </div>
        
        <div className="space-y-2">
          <label>{t("module.fees.select_id")}</label>
          <select
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
            defaultValue=""
            name="select_id"
            id="select_id"
         >
            <option value="" disabled>{t("module.fees.select_id")}</option>
            <option value="01">01</option>
            <option value="02">02</option>
            <option value="03">03</option>
         </select>
        </div>
        
        <div className="space-y-2">
          <label>{t("module.fees.payment_date")}</label>
          <input type="date" className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none" />
        </div>

        <div className="space-y-2">
          <label>{t("module.fees.up_to_month")}</label>

         <select
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
            defaultValue=""
            name="up_to_month"
            id="up_to_month"
         >
            <option value="" disabled>{t("module.fees.up_to_month")}</option>
            {months?.map((month) => (
               <option key={month} value={month}>{month}</option>
            ))}
         </select>
        </div>

      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded mt-4 w-44 p-2 bg-primary hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200 flex items-center justify-center gap-2"
        >
          {t("module.fees.get_student_data")}
        </button>
      </div>
    </form>
  );
};

export default QuickColForm;
