import Modal from "../../../common/Modal";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function AddPackageModal({ isAdd, onClose }) {
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <Modal isOpen={isAdd} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">{t("module.service.newPackage")}</h2> {/* Translate title */}
      <div className="my-8 space-y-3">
        <div className="space-y-2">
          <label className="">{t("module.service.packageName")}</label> {/* Translate label */}
          <input
            type="text"
            placeholder={t("module.service.packageName")} 
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="">{t("module.service.packageAmount")}</label> {/* Translate label */}
          <input
            type="number"
            placeholder={t("module.service.packageAmount")} 
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}
