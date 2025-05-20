import CategoryWiseLedgerTable from "./reports/category-wise-ledger/CategoryWiseLedgerTable";
import SearchByLedgerUser from "./reports/category-wise-ledger/SearchByLedgerUser";

const CategoryWiseLedger = () => {
    // const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <SearchByLedgerUser />

      <h3 className="text-2xl font-medium text-center mt-5">
        {/* {t("module.accounts.cash_summary_list")} */}
        Category Wise Ledger Summary
      </h3>
      <CategoryWiseLedgerTable />
    </div>
  );
};

export default CategoryWiseLedger;
