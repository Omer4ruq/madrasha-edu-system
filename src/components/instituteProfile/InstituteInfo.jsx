import { useTranslation } from "react-i18next";
import { GoDotFill } from "react-icons/go";


export default function InstituteInfo({data}) {
   const {t} = useTranslation();

   const {institute_id, institute_name, institute_eiin_no, education_board_id, education_division_id, education_district_id, education_thana_id, status } = data;

    return (
      <div className="md:w-1/2 p-6 bg-white rounded-md text-textGray">
         <h5 className="font-medium mb-2 text-lg">{t("general.institute")} {t("general.information")}</h5>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("general.id")}:</h5>
            <h5>{institute_id}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("module.instituteInfo.eiin")}:</h5>
            <h5>{institute_eiin_no}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("general.name")}:</h5>
            <h5>{institute_name}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.education")} {t("module.instituteInfo.board")}:</h5>
            <h5>{}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("module.instituteInfo.division")}:</h5>
            <h5>{}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("module.instituteInfo.district")}:</h5>
            <h5>{}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("module.instituteInfo.thana")}:</h5>
            <h5>{}</h5>
         </div>
         <div className="flex items-center gap-2 leading-7">
            <GoDotFill className="text-xs"/>
            <h5 className="font-medium">{t("general.institute")} {t("general.status")}:</h5>
            <h5>{status}</h5>
         </div>
      </div>
    );
}