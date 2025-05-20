import LedgerSummarySearch from "./reports/ledger-summary/LedgerSummarySearch";
import LedgerSummaryTable from "./reports/ledger-summary/LedgerSummaryTable";

const LedgerSummary = () => {
  // const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <LedgerSummarySearch />

      <h3 className="text-2xl font-medium text-center mt-5">
        {/* {t("module.accounts.cash_summary_list")} */}
        Ledger Summary
      </h3>
      <LedgerSummaryTable />
    </div>
  );
};

export default LedgerSummary;
