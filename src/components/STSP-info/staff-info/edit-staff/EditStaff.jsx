import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import EditSForm from "./EditSForm";
import { useTranslation } from "react-i18next";

export default function EditStaff() {
   const { t } = useTranslation();
   const staff = useLoaderData();
   const [staffData, setStaffData] = useState(staff);

   function handleChange(field, data) {
      setStaffData({ ...staff, [field]: data.target.value });
   }

   return (
      <div className="my-4 rounded p-4 md:p-6 bg-white">
         <h3 className="text-2xl font-medium mb-4">{t("module.communication.edit_staff")}</h3>

         <EditSForm staffData={staffData} handleChange={handleChange} />

         {/* form submit buttons */}
         <div className="flex justify-end items-center gap-4 mt-4 mb-2 md:mb-0">
            <button className="bg-blue w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
               {t("module.communication.save")}
            </button>

            <Link to="/staff-info/staff-list">
               <button className="bg-red w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
                  {t("module.communication.cancel")}
               </button>
            </Link>
         </div>
      </div>
   );
}
