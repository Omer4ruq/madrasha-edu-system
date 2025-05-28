import { useTranslation } from "react-i18next";
import Modal from "../../common/Modal";

export default function EditPopup({ editContent, setEditContent, isEdit, onClose, handleConfirmEdit }) {

  const {t} = useTranslation();

  return (
    <Modal isOpen={isEdit} onClose={onClose} handleSave={handleConfirmEdit} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl"> {t('module.settings.edit')} {editContent?.field?.title}</h2>
      <div className="my-8 space-y-2">
        <h5 className="text-center text-lg">{editContent?.filed?.title}</h5>
        <input
          type="text"
          value={editContent?.item?.name}
          onChange={(e) => setEditContent({...editContent, item:{...editContent?.item, name:e.target.value}})}
          className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
        />
      </div>
    </Modal>
  );
}
