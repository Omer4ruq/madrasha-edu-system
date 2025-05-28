import Modal from "../../common/Modal";
import { useTranslation } from "react-i18next";

export default function AddTypeModal({ isAdd, onClose }) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isAdd} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">{t("module.report.addService")}</h2>
      
      <div className="mt-2 mb-4 space-y-1">
        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.service")}</label>
          <input
            type="text"
            placeholder={t("module.report.servicePlaceholder")}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.package")}</label>
          <input
            type="text"
            placeholder={t("module.report.packagePlaceholder")}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.price")}</label>
          <input
            type="number"
            placeholder={t("module.report.pricePlaceholder")}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.description")}</label>
          <textarea
            placeholder={t("module.report.descriptionPlaceholder")}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.status")}</label>
          <select
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          >
            <option value="Active">{t("module.report.statusActive")}</option>
            <option value="Inactive">{t("module.report.statusInactive")}</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
