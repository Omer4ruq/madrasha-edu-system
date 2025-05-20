import Modal from "../../common/Modal";
import { useTranslation } from "react-i18next";

export default function LTypeModal({ editContent, isEdit, onClose }) {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
            {/* modal content */}
            <h2 className="text-2xl">{t("module.income.editLeaveType")}</h2>
            <div className="my-8 space-y-2">
                <h5 className="text-center text-lg">{t("module.income.leaveName")}</h5>
                <input
                    type="text"
                    defaultValue={editContent}
                    className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
                />
            </div>
        </Modal>
    );
}
