
import DateWiseLedgerTable from "./reports/date-wise-ledger/DateWiseLedgerTable";
import SearchByLedgerTypes from "./reports/SearchByLedgerTypes";

const DateWiseLedger = () => {
    // const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <SearchByLedgerTypes />

      <h3 className="text-2xl font-medium text-center mt-5">
        {/* {t("module.accounts.cash_summary_list")} */}
        Date Wise Ledger
      </h3>
      <DateWiseLedgerTable />
    </div>
  );
};

export default DateWiseLedger;
