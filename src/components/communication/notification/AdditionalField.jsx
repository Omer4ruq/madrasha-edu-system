import { useTranslation } from "react-i18next";

export default function AdditionalField({notificationType}) {
   const {t} = useTranslation();
    return (
   <>
   {
      notificationType === "Exam Result" &&
      <div className="space-y-2">
         <label className="">
         {t('module.communication.status')}</label>
         <select
         id=""
         name=""
         defaultValue="Select Status"
         className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="Select Status" disabled>Select Status</option>
            <option value="All">All</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
         </select>
      </div>
   }
   {
      notificationType === "Pay Slip Info" &&
      <div className="space-y-2">
      <label className="">
      {t('module.communication.select_fee_type')}</label>
      <select
      id=""
      name=""
      defaultValue="Select Fee Type"
      className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
      >
         <option value="Select Fee Type" disabled>Select Fee Type</option>
         <option value="March Fee">March Fee</option>
         <option value="April Fee">April Fee</option>
         <option value="May Fee">May Fee</option>
         <option value="1st Term Exam Fee">1st Term Exam Fee</option>
         <option value="2nd Term Exam Fee">2nd Term Exam Fee</option>
         <option value="Admision Fee">Admision Fee</option>
         <option value="Milad Fee">Milad Fee</option>
      </select>
   </div>
   }
   </>
    );
}