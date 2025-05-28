import { useTranslation } from "react-i18next";
import Modal from "../../common/Modal";

export default function HolidayEditModal({ editContent, setEditContent, isEdit, onClose }) {
   const {t} = useTranslation(); 
   return (
      <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
         <h2 className="text-2xl">{t('module.communication.edit_holiday')}</h2>
         <div className="my-8 space-y-3">
         <div className="space-y-2">
            <label className="">{t('module.communication.holiday_name')}</label>
            <input
               type="text"
               value={editContent.name}
               onChange={(e)=> setEditContent({...editContent, name:e.target.value})}
               className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>


         <div className="space-y-2">
            <label className="">{t('module.communication.date')}</label>
            <input
               type="date"
               value={editContent.date}
               onChange={(e)=> setEditContent({...editContent, date:e.target.value})}
               className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         <div className="space-y-2">
            <label className="">{t('module.communication.session_year')}</label>
            <input
               type="text"
               value={editContent.session}
               onChange={(e)=> setEditContent({...editContent, session:e.target.value})}
               placeholder="Session Year"
               className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>
      </div>
      </Modal>
    );
}