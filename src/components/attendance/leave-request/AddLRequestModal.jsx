import { useTranslation } from "react-i18next";
import Modal from "../../common/Modal";

export default function AddLRequestModal({isAdd, onClose}) {
   const {t} = useTranslation(); 
   return (
   <Modal isOpen={isAdd} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">{t('module.communication.new_leave_request')}</h2>
      <div className="my-8 space-y-3">
         <div className="space-y-2">
            <label className="">{t('module.communication.employee_name')}</label>
            <input
               type="text"
               placeholder="Employee Name"
               className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         <div className="space-y-2">
            <label className="">{t('module.communication.leave_type')}</label>
            <select
            id=""
            name=""
            defaultValue="Sick Leave"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            >
               <option value="Sick Leave">Sick Leave</option>
               <option value="Special Leave">Special Leave</option>
               <option value="Paid Leave">Paid Leave</option>
            </select>
         </div>

         <div className="space-y-2">
            <label className="">{t('module.communication.start_date')}</label>
            <input
               type="date"
               className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>

         <div className="space-y-2">
            <label className="">{t('module.communication.end_date')}</label>
            <input
               type="date"
               className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            />
         </div>
      </div>
   </Modal>
    );
}