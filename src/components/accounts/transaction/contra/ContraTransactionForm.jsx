import { useTranslation } from "react-i18next";

const ContraTransactionForm = () => {
  const { t } = useTranslation();

  return (
    <form>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label>{t("module.accounts.select_credit_ledger")}</label>
          <select
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            name="write_note"
            id="write_note"
          >
            <option value="0">Select Credit Ledger</option>
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
          <label>{t("module.accounts.select_debit_ledger")}</label>
          <select
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            name="write_note"
            id="write_note"
          >
            <option value="0">Select Debit Ledger</option>
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
          <label>{t("module.accounts.amount")}</label>
          <input
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Amount"
            name="write_note"
            id="write_note"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label>{t("module.accounts.select_date")}</label>
          <input
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Amount"
            name="write_note"
            id="write_note"
            type="date"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <label>{t("module.accounts.voucher_no")}</label>
          <input
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Voucher No."
            name="write_note"
            id="write_note"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label>{t("module.accounts.write_note")}</label>

          <input
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Note"
            name="write_note"
            id="write_note"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <button
            type="submit"
            className="rounded mt-4 w-full p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200"
          >
            {t("module.accounts.save")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ContraTransactionForm;
