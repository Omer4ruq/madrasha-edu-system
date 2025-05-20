import { useTranslation } from "react-i18next";
import { GoDotFill } from "react-icons/go";

export default function InstituteInfo() {
   const {t} = useTranslation();


    return (
      <div className="md:w-1/2 p-6 bg-white rounded-md text-textGray">
         <h5 className="font-medium mb-2 text-lg">{t("general.institute")} {t("general.information")}</h5>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("general.id")}:</h5>
            <h5>{t("module.instituteInfo.idNumber")}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("module.instituteInfo.eiin")}:</h5>
            <h5>{t("module.instituteInfo.eiinNumber")}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("general.name")}:</h5>
            <h5>{t("module.instituteInfo.schoolName")}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.education")} {t("module.instituteInfo.board")}:</h5>
            <h5>{t("module.instituteInfo.boardName")}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("module.instituteInfo.division")}:</h5>
            <h5>{t("module.instituteInfo.divisionName")}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("module.instituteInfo.district")}:</h5>
            <h5>{t("module.instituteInfo.districtName")}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("module.instituteInfo.thana")}:</h5>
            <h5>{t("module.instituteInfo.thanaName")}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("general.status")}:</h5>
            <h5>{t("module.instituteInfo.active")}</h5>
         </div>
      </div>
    );
}