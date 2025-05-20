// import { useTranslation } from "react-i18next";
import BalanceSheetTable from "./reports/balance-sheet/BalanceSheetTable";
import SearchBySingleDate from "./reports/SearchBySingleDate";

const BalanceSheet = () => {
    // const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <SearchBySingleDate />

      <h3 className="text-2xl font-medium text-center mt-2">
        {/* {t("module.accounts.cash_summary_list")} */}
        Balance Sheet
      </h3>
      <BalanceSheetTable />
    </div>
  );
};

export default BalanceSheet;
