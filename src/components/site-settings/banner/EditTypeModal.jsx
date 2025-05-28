import Modal from "../../common/Modal";
import { useTranslation } from "react-i18next";

export default function EditTypeModal({ editContent, setEditContent, isEdit, onClose }) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">{t("module.report.editBanner")}</h2>

      <div className="mt-2 mb-4 space-y-1">
        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.bannerImage")}</label>
          <input
            value={editContent?.image}
            onChange={(e) => setEditContent({ ...editContent, image: e.target.value })}
            className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
            type="file"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.subHeading")}</label>
          <input
            type="text"
            value={editContent?.subHeading}
            onChange={(e) => setEditContent({ ...editContent, subHeading: e.target.value })}
            placeholder={t("module.report.enterSubHeading")}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.mainHeading")}</label>
          <input
            type="text"
            value={editContent?.mainHeading}
            onChange={(e) => setEditContent({ ...editContent, mainHeading: e.target.value })}
            placeholder={t("module.report.enterMainHeading")}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.bannerText")}</label>
          <input
            type="text"
            value={editContent?.bannerText}
            onChange={(e) => setEditContent({ ...editContent, bannerText: e.target.value })}
            placeholder={t("module.report.enterBannerText")}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.readMoreLink")}</label>
          <input
            type="text"
            value={editContent?.readMoreLink}
            onChange={(e) => setEditContent({ ...editContent, readMoreLink: e.target.value })}
            placeholder={t("module.report.enterReadMoreLink")}
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
