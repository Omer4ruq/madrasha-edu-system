import { useTranslation } from "react-i18next";
import Modal from "../../common/Modal";

export default function EditTypeModal({ editContent, setEditContent, isEdit, onClose }) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">{t("module.report.editNotice")}</h2>

      <div className="mt-2 mb-4 space-y-2">
        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.date")}</label>
          <input
            type="date"
            placeholder={t("module.report.enterDate")}
            value={editContent?.date}
            onChange={(e) =>
              setEditContent({ ...editContent, date: e.target.value })
            }
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.noticeTitle")}</label>
          <input
            type="text"
            placeholder={t("module.report.enterNoticeTitle")}
            value={editContent?.title}
            onChange={(e) =>
              setEditContent({ ...editContent, title: e.target.value })
            }
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.noticeDetails")}</label>
          <textarea
            placeholder={t("module.report.enterNoticeDetails")}
            value={editContent?.description}
            onChange={(e) =>
              setEditContent({ ...editContent, description: e.target.value })
            }
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.expireDate")}</label>
          <input
            type="date"
            placeholder={t("module.report.enterExpireDate")}
            value={editContent?.expireDate}
            onChange={(e) =>
              setEditContent({ ...editContent, expireDate: e.target.value })
            }
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-textGray">{t("module.report.fileAttached")}</label>
          <input
            type="file"
            placeholder={t("module.report.enterFileAttached")}
            value={editContent?.file}
            onChange={(e) =>
              setEditContent({ ...editContent, file: e.target.value })
            }
            className="block w-full cursor-pointer rounded bg-gray-100 text-textGray border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}
