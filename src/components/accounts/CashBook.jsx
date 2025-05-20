// import { useTranslation } from "react-i18next";
// import CashSummaryList from "./reports/cash-summary/CashSummaryList";
import CashBookTable from "./reports/cash-book/CashBookTable";
import SearchByLedgerTypes from "./reports/SearchByLedgerTypes";

const CashBook = () => {
    // const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <SearchByLedgerTypes />

      <h3 className="text-2xl font-medium text-center mt-5">
        {/* {t("module.accounts.cash_summary_list")} */}
        Cash Book
      </h3>
      <CashBookTable />
    </div>
  );
};

export default CashBook;
