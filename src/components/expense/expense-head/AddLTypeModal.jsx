import Modal from "../../common/Modal";
import { useTranslation } from "react-i18next";

export default function AddLTypeModal({ isAdd, onClose }) {
    const { t } = useTranslation();

    return (
        <Modal isOpen={isAdd} onClose={onClose} width="w-2/3 md:w-1/2">
            {/* modal content */}
            <h2 className="text-2xl">{t("module.income.addLeaveType")}</h2>
            <div className="my-8 space-y-2">
                <h5>{t("module.income.newLeaveName")}</h5>
                <input
                    type="text"
                    placeholder={t("module.income.pleaseTypeName")}
                    className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
                />
            </div>
        </Modal>
    );
}
