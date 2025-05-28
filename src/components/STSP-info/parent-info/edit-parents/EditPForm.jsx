import { useTranslation } from "react-i18next";

export default function EditPForm({ parentData, handleChange }) {
   const { t } = useTranslation();

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
         {/* Avatar */}
         <div className="space-y-1">
            <label className="text-textGray" htmlFor="avatar">{t("module.communication.avatar")}</label>
            <input
               className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
               id="avatar"
               type="file"
            />
         </div>

         {/* Parent Name */}
         <div className="space-y-1">
            <label className="text-textGray">{t("module.communication.parent_name")}</label>
            <input
               type="text"
               placeholder={t("module.communication.enter_parent_name")}
               value={parentData.parentName}
               onChange={(event) => handleChange("parentName", event)}
               className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         {/* Phone Number */}
         <div className="space-y-1">
            <label className="text-textGray">{t("module.communication.phone_number")}</label>
            <input
               type="text"
               placeholder={t("module.communication.enter_phone_number")}
               value={parentData.parentMobile}
               onChange={(event) => handleChange("parentMobile", event)}
               className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         {/* Occupation */}
         <div className="space-y-1">
            <label className="text-textGray">{t("module.communication.occupation")}</label>
            <input
               type="text"
               placeholder={t("module.communication.enter_occupation")}
               value={parentData.occupation}
               onChange={(event) => handleChange("occupation", event)}
               className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         {/* NID */}
         <div className="space-y-1">
            <label className="text-textGray">{t("module.communication.nid")}</label>
            <input
               type="text"
               placeholder={t("module.communication.enter_nid")}
               value={parentData.parentNID}
               onChange={(event) => handleChange("parentNID", event)}
               className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         {/* Relation */}
         <div className="space-y-1">
            <label className="text-textGray">{t("module.communication.relation")}</label>
            <input
               type="text"
               placeholder={t("module.communication.enter_relation")}
               value={parentData.relation}
               onChange={(event) => handleChange("relation", event)}
               className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         {/* Father Name */}
         <div className="space-y-1">
            <label className="text-textGray">{t("module.communication.father_name")}</label>
            <input
               type="text"
               placeholder={t("module.communication.enter_father_name")}
               value={parentData.fatherName}
               onChange={(event) => handleChange("fatherName", event)}
               className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         {/* Father Phone No */}
         <div className="space-y-1">
            <label className="text-textGray">{t("module.communication.father_phone_no")}</label>
            <input
               type="text"
               placeholder={t("module.communication.enter_father_phone_no")}
               value={parentData.fatherMobile}
               onChange={(event) => handleChange("fatherMobile", event)}
               className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         {/* Mother Name */}
         <div className="space-y-1">
            <label className="text-textGray">{t("module.communication.mother_name")}</label>
            <input
               type="text"
               placeholder={t("module.communication.enter_mother_name")}
               value={parentData.motherName}
               onChange={(event) => handleChange("motherName", event)}
               className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         {/* Mother Phone No */}
         <div className="space-y-1">
            <label className="text-textGray">{t("module.communication.mother_phone_no")}</label>
            <input
               type="text"
               placeholder={t("module.communication.enter_mother_phone_no")}
               value={parentData.motherMobile}
               onChange={(event) => handleChange("motherMobile", event)}
               className="bg-bgGray text-textGray w-full rounded px-2 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>
      </div>
   );
}
