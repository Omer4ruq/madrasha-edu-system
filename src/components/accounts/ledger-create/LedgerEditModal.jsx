import { useTranslation } from "react-i18next";
import Modal from "../../common/Modal";

export default function LedgerEditModal({
  editContent,
  setEditContent,
  isEdit,
  onClose,
}) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isEdit} onClose={onClose} width="w-2/3 md:w-1/2">
      {/* modal content */}
      <h2 className="text-2xl">{t("module.fees.edit_fee_type")}</h2>
      <div className="my-8 space-y-3">
        <div className="space-y-2">
          <label>{t("module.accounts.select_category")}</label>

          <select
            onChange={(e) =>
              setEditContent({ ...editContent, category: e.target.value })
            }
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            defaultValue="0"
            name="select_category"
            id="select_category"
          >
            <option value="0">{t("module.accounts.select_category")}</option>
            <option value="Fixed Asset">Fixed Asset</option>
            <option value="Cash & Cash Equivalance">
              Cash & Cash Equivalance
            </option>
            <option value="Account Recievable">Account Recievable</option>
            <option value="OFPS Account">OFPS Account</option>
            <option value="Long Term Liability">Long Term Liability</option>
            <option value="Short Term Liability">Short Term Liability</option>
            <option value="Owner's Equity">Owner's Equity</option>
            <option value="Account Payable">Account Payable</option>
            <option value="Regular Income">Regular Income</option>
            <option value="Others Income">Others Income</option>
            <option value="Regular Expense">Regular Expense</option>
            <option value="Others Expense">Others Expense</option>
            <option value="General Expense">General Expense</option>
          </select>
        </div>
        <div className="space-y-2">
          <label>{t("module.accounts.ledger_name")}</label>
          <input
            onChange={(e) =>
              setEditContent({ ...editContent, ledger_name: e.target.value })
            }
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            placeholder="Ledger Name"
            name="ledger_name"
            id="ledger_name"
            type="text"
          />
        </div>
        <div className="space-y-2">
          <label>{t("module.accounts.write_note")}</label>
          <input
            onChange={(e) =>
              setEditContent({ ...editContent, write_note: e.target.value })
            }
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            placeholder="Write Note"
            name="write_note"
            id="write_note"
            type="text"
          />
        </div>
      </div>
    </Modal>
  );
}
