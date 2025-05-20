import IncomeStatementTable from "./reports/income-statement/IncomeStatementTable";
import SearchByDateRange from "./reports/SearchByDateRange";

const IncomeStatement = () => {
    // const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <SearchByDateRange />

      <h3 className="text-2xl font-medium text-center mt-2">
        {/* {t("module.accounts.cash_summary_list")} */}
        Income Statement
      </h3>
      <IncomeStatementTable />
    </div>
  );
};

export default IncomeStatement;
