import { useTranslation } from "react-i18next";
import Modal from "../../common/Modal";

export default function EditTypeModal({ editContent, setEditContent, isEdit, onClose }) {
  const { t } = useTranslation(); // Initialize translation function

  return (
    <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* Modal content */}
      <h2 className="text-2xl">{t("module.report.editTitle")}</h2>
      <div className="mt-2 mb-4 space-y-1">
        
        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.pageName")}</label>
          <input
            type="text"
            placeholder={t("module.report.enterPageName")}
            value={editContent?.pageName}
            onChange={(e) => setEditContent({ ...editContent, pageName: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.heading")}</label>
          <input
            type="text"
            placeholder={t("module.report.enterHeading")}
            value={editContent?.heading}
            onChange={(e) => setEditContent({ ...editContent, heading: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.subHeading")}</label>
          <input
            type="text"
            placeholder={t("module.report.enterSubHeading")}
            value={editContent?.subHeading}
            onChange={(e) => setEditContent({ ...editContent, subHeading: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.image")}</label>
          <input
            type="file"
            value={editContent?.image}
            onChange={(e) => setEditContent({ ...editContent, image: e.target.value })}
            className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.content")}</label>
          <textarea
            rows="3"
            value={editContent?.content}
            onChange={(e) => setEditContent({ ...editContent, content: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          ></textarea>
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
