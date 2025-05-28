import { useTranslation } from "react-i18next";

const RecieveTransactionForm = ({ totalTransaction }) => {
  const { t } = useTranslation();

  return (
    <form>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label>{t("module.accounts.total")}</label>

          <input
            value={totalTransaction}
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Amount"
            name="write_note"
            id="write_note"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label>{t("module.accounts.recieve_date")}</label>

          <input
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Amount"
            name="write_note"
            id="write_note"
            type="date"
          />
        </div>

        <div className="space-y-2">
          <label>{t("module.accounts.voucher_no")}</label>
          <input
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Amount"
            name="write_note"
            id="write_note"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label>{t("module.accounts.select_ledger")}</label>

          <select
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Amount"
            name="write_note"
            id="write_note"
          >
            <option value="0">Select Ledger</option>
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
      </div>

      <div className="flex gap-7 justify-between items-end mt-5">
        <div className="flex-1 space-y-2">
          <label>{t("module.accounts.description")}</label>
          <textarea
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            name=""
            id=""
          ></textarea>
        </div>
        <button
          type="submit"
          className="rounded mt-4 w-44 p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200"
        >
          {t("module.accounts.save")}
        </button>
      </div>
    </form>
  );
};

export default RecieveTransactionForm;
