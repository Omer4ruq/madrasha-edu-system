import { useTranslation } from "react-i18next";

export default function AdditionalForm() {
   const {t} = useTranslation();

  return (
   <>
   <h3 className="text-lg font-semibold mt-8 xl:mt-10">Additional Info :</h3>
<form>
   <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
     <div className="space-y-2">
         <label>{t("module.fees.payment_type")}</label>

         <select
            className="bg-bgGray w-full rounded p-2 border-2 border-gray-500 focus:border-primary focus:outline-none"
            defaultValue="0"
            name="payment_type"
            id="payment_type"
         >
            <option value="">{t("module.fees.payment_type")}</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
         </select>
      </div>
      
      <div className="space-y-2">
         <label>{t("module.fees.note")}</label>
         <input type="text" name="" id="" placeholder="Enter Additional Note" className="bg-bgGray w-full rounded p-2 border-2 border-gray-500 focus:border-primary focus:outline-none" />

      </div>

   </div>
</form>
</>
  )
}
