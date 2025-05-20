import VoucherListTable from "./reports/voucher-list/VoucherListTable";
import VoucherSearch from "./reports/voucher-list/VoucherSearch";

const VoucherList = () => {
  // const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <VoucherSearch />

      <h3 className="text-2xl font-medium text-center mt-5">
        {/* {t("module.accounts.cash_summary_list")} */}
        Voucher List
      </h3>
      <VoucherListTable />
    </div>
  );
};

export default VoucherList;
