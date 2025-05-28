import Modal from "../../../common/Modal";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function PackageEditModal({ editContent, setEditContent, isEdit, onClose }) {
    const { t } = useTranslation(); // Initialize useTranslation

    return (
        <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
            {/* modal content */}
            <h2 className="text-2xl">{t("module.service.editStudentWaiver")}</h2> 
            <div className="my-8 space-y-2">
                <div className="space-y-2">
                    <label className="">{t("module.service.studentName")}</label> 
                    <input
                        type="text"
                        placeholder={t("module.service.studentName")} 
                        value={editContent.name}
                        onChange={(e) => setEditContent({ ...editContent, name: e.target.value })}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="">{t("module.service.packageAmount")}</label> 
                    <input
                        type="number"
                        placeholder={t("module.service.packageAmount")} 
                        value={editContent.amount}
                        onChange={(e) => setEditContent({ ...editContent, amount: e.target.value })}
                        className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                    />
                </div>
            </div>
        </Modal>
    );
}
