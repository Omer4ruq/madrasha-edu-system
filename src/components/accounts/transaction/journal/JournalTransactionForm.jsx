import { useTranslation } from "react-i18next";

const JournalTransactionForm = () => {
  const { t } = useTranslation();

  return (
    <form>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <label>{t("module.accounts.transaction_date")}</label>

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
            placeholder="Voucher No"
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

export default JournalTransactionForm;
