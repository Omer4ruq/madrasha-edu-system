import { useTranslation } from "react-i18next";
import { FaRegEnvelope, FaRegStar } from "react-icons/fa6";
import { IoPerson } from "react-icons/io5";
import { MdOutlineLocalPhone } from "react-icons/md";

export default function InstituteContact({data}) {
   const {t} = useTranslation();

   const {headmaster_mobile, headmaster_name, ict_teacher, ict_teacher_email, ict_teacher_mobile, institute_email_address} = data;

    return (
      <div className="md:w-1/2 p-6 bg-white rounded-md text-textGray mb-4 md:mb-0">
         <h5 className="font-medium mb-2 text-lg">{t("general.contact02")} {t("general.information")}</h5>
         <div className="flex items-center gap-2 leading-9">
            <IoPerson />
            <h5 className="font-medium">{t("module.instituteInfo.principal")}:</h5>
            <h5>{headmaster_name}</h5>
         </div>
         <div className="flex items-center gap-2 leading-9">
            <MdOutlineLocalPhone />
            <h5 className="font-medium">{t("module.instituteInfo.principal")} {t("general.mobile")}:</h5>
            <h5>{headmaster_mobile}</h5>
         </div>
         <div className="flex items-center gap-2 leading-9">
            <FaRegStar />
            <h5 className="font-medium">
               {t("module.instituteInfo.incharge")}:</h5>
            <h5>{ict_teacher}</h5>
         </div>
         <div className="flex items-center gap-2 leading-9">
            <MdOutlineLocalPhone />
            <h5 className="font-medium">{t("module.instituteInfo.incharge")} {t("general.mobile")}:</h5>
            <h5>{ict_teacher_mobile}</h5>
         </div>
         <div className="flex items-center gap-2 leading-9">
            <FaRegEnvelope />
            <h5 className="font-medium">{t("module.instituteInfo.incharge")} {t("general.email")}:</h5>
            <h5>{ict_teacher_email}</h5>
         </div>
         <div className="flex items-center gap-2 leading-9">
            <FaRegEnvelope />
            <h5 className="font-medium">{t("module.instituteInfo.incharge")} {t("general.email")}:</h5>
            <h5>{institute_email_address}</h5>
         </div>
      </div>
    );
}