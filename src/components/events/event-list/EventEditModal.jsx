import Modal from "../../common/Modal";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function EventEditModal({ editContent, setEditContent, isEdit, onClose }) {
  const { t } = useTranslation(); // Initialize translation function

  return (
    <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">{t("events.edit_event")}</h2> {/* Use translation key */}
      <div className="my-8 space-y-2">
        <div className="space-y-2">
          <label>{t("events.title")}</label> {/* Use translation key */}
          <input
            type="text"
            placeholder={t("events.title")} // Placeholder can also be translated
            value={editContent.name}
            onChange={(e) => setEditContent({ ...editContent, name: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label>{t("events.start")}</label> {/* Use translation key */}
          <input
            type="text"
            placeholder={t("events.start")} // Placeholder can also be translated
            value={editContent.start}
            onChange={(e) => setEditContent({ ...editContent, start: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label>{t("events.end")}</label> {/* Use translation key */}
          <input
            type="text"
            placeholder={t("events.end")} // Placeholder can also be translated
            value={editContent.end}
            onChange={(e) => setEditContent({ ...editContent, end: e.target.value })}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}
