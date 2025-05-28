import Modal from "../../common/Modal";
import { useTranslation } from "react-i18next";

export default function EditAdditionModal({
  editContent,
  setEditContent,
  isEdit,
  onClose,
}) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">{t("module.payroll.edit_addition")}</h2>
      <div className="my-8 space-y-3">
        <div className="space-y-2">
          <label className="">{t("module.payroll.name")}</label>
          <input
            onChange={(e) =>
              setEditContent({ ...editContent, name: e.target.value })
            }
            type="text"
            placeholder={t("module.payroll.name_placeholder")}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}
