import { useTranslation } from "react-i18next";
import VoucherDeleteSearch from "./voucher-delete/VoucherDeleteSearch";
import VoucherDeleteTable from "./voucher-delete/VoucherDeleteTable";
import VoucherSearchResult from "./voucher-delete/VoucherSearchResult";

const VoucherDelete = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <VoucherDeleteSearch />

      <VoucherSearchResult/>

      <h3 className="text-2xl font-medium text-center mt-5">
        {/* {t("module.accounts.cash_summary_list")} */}
        Voucher Details
      </h3>
      <VoucherDeleteTable />

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded px-6 p-3 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
        >
          {t("module.fees.save")}
        </button>
      </div>
    </div>
  );
};

export default VoucherDelete;
