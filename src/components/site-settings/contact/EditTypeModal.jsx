import Modal from "../../common/Modal";
import { useTranslation } from "react-i18next";

export default function EditTypeModal({ editContent, setEditContent, isEdit, onClose }) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">{t("module.report.title")}</h2>

      <div className="mt-2 mb-4 space-y-1">
        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.text")}</label>
          <input
            type="text"
            placeholder={t("module.report.enterText")}
            value={editContent?.text}
            onChange={(e) => setEditContent({ ...editContent, text: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.officeAddress")}</label>
          <input
            type="text"
            placeholder={t("module.report.enterOfficeAddress")}
            value={editContent?.officeAddress}
            onChange={(e) => setEditContent({ ...editContent, officeAddress: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.mobile")}</label>
          <input
            type="text"
            placeholder={t("module.report.enterMobile")}
            value={editContent?.mobile}
            onChange={(e) => setEditContent({ ...editContent, mobile: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.email")}</label>
          <input
            type="email"
            placeholder={t("module.report.enterEmail")}
            value={editContent?.email}
            onChange={(e) => setEditContent({ ...editContent, email: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.googleMapLink")}</label>
          <input
            type="text"
            placeholder={t("module.report.enterGoogleMapLink")}
            value={editContent?.map}
            onChange={(e) => setEditContent({ ...editContent, map: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.status")}</label>
          <select
            value={editContent?.status}
            onChange={(e) => setEditContent({ ...editContent, status: e.target.value })}
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
