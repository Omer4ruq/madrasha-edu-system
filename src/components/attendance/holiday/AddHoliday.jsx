import { useTranslation } from "react-i18next";
import { LuPlusCircle } from "react-icons/lu";

export default function AddHoliday({setIsAdd}) {
   const {t} = useTranslation();
    return (
      <button
      type="submit"
      onClick={()=> setIsAdd(true)}
      className="rounded w-48 p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200 flex items-center justify-center gap-2"
   >
      <LuPlusCircle className="text-white w-4 h-4"/>
      {t('module.communication.add_holiday')}
   </button>
    );
}