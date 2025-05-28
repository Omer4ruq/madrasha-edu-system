import { useTranslation } from "react-i18next";
import Modal from "../../common/Modal";

export default function AddTypeModal({ isAdd, onClose }) {
  const { t } = useTranslation(); // Initialize translation function

  return (
    <Modal isOpen={isAdd} onClose={onClose} width="w-2/3 md:w-1/2">
      <h2 className="text-2xl">{t("module.report.title")}</h2>
      <div className="mt-2 mb-4 space-y-2">
        
        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.titleLabel")}</label>
          <input
            type="text"
            placeholder={t("module.report.titlePlaceholder")}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.subHeadingLabel")}</label>
          <input
            type="text"
            placeholder={t("module.report.subHeadingPlaceholder")}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.imageLabel")}</label>
          <input
            className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
            aria-describedby=""
            id=""
            type="file"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.videoLinkLabel")}</label>
          <input
            type="text"
            placeholder={t("module.report.videoLinkPlaceholder")}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.statusLabel")}</label>
          <select
            id=""
            name=""
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          >
            <option value="Active">{t("module.report.active")}</option>
            <option value="Inactive">{t("module.report.inactive")}</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
