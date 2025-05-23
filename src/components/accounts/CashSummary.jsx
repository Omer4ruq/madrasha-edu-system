import { useTranslation } from "react-i18next";
import CashSummaryList from "./reports/cash-summary/CashSummaryList";
import SearchByDateRange from "./reports/SearchByDateRange";

const CashSummary = () => {
    const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <SearchByDateRange />

      <h3 className="text-2xl font-medium text-center mt-2">
        {t("module.accounts.cash_summary_list")}
      </h3>
      <CashSummaryList />
    </div>
  );
};

export default CashSummary;
