import { useTranslation } from "react-i18next";

export default function LedgerSummarySearch() {
  const { t } = useTranslation();

  return (
    <form className="">
      {/* From Date */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 items-end gap-4">
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.fromDate")}
          </label>
          <input
            type="date"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.toDate")}
          </label>
          <input
            type="date"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.select_ledger_type")}
          </label>
          <select className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="0">Select Ledger Type</option>
            <option value="Asset">Asset</option>
            <option value="Liability">Liability</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        <div className="space-y-2">
          <button
            type="submit"
            className="rounded w-full p-3 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
          >
            {t("module.accounts.search")}
          </button>
        </div>
      </div>
    </form>
  );
}
