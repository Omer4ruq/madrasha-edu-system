import { useTranslation } from "react-i18next";
import Modal from "../../common/Modal";

export default function AddLTypeModal({ isAdd, onClose }) {
  
  const {t} = useTranslation();  
  return (
    <Modal isOpen={isAdd} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">{t('module.communication.add_leave_type')}</h2>
      <div className="my-8 space-y-2">
        <h5 className="">{t('module.communication.new_leave_name')} :</h5>
        <input
          type="text"
          placeholder="Please type a name"
          className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
        />
      </div>
   </Modal>
    );
}