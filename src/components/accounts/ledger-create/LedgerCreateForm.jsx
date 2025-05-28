import { useTranslation } from "react-i18next";

const LedgerCreateForm = () => {
  const { t } = useTranslation();

  return (
    <form>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label>{t("module.accounts.select_category")}</label>

          <select
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
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            placeholder="Write Note"
            name="write_note"
            id="write_note"
            type="text"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded mt-4 w-44 p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200 flex items-center justify-center gap-2"
        >
          {t("module.accounts.save")}
        </button>
      </div>
    </form>
  );
};

export default LedgerCreateForm;
