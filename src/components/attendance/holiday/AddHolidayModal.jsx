import { useTranslation } from "react-i18next";
import Modal from "../../common/Modal";

export default function AddHolidayModal({isAdd, onClose}) {
   const {t} = useTranslation();
    return (
   <Modal isOpen={isAdd} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">{t('module.communication.add_holiday')}</h2>
      <div className="my-8 space-y-3">
         <div className="space-y-2">
            <label className="">{t('module.communication.holiday_name')}</label>
            <input
               type="text"
               placeholder="Holiday Name"
               className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>


         <div className="space-y-2">
            <label className="">{t('module.communication.date')}</label>
            <input
               type="date"
               className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         <div className="space-y-2">
            <label className="">{t('module.communication.session_year')}</label>
            <input
               type="text"
               placeholder="Session Year"
               className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>
      </div>
   </Modal>
    );
}