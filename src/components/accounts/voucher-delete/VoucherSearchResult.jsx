import { useTranslation } from "react-i18next";

export default function VoucherSearchResult() {
  const { t } = useTranslation();

  return (
    <form className="">
      {/* From Date */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 items-end gap-4">
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.voucher_id")}
          </label>
          <input
            disabled={true}
            value={45}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.voucher_type")}
          </label>
          <input
            disabled={true}
            value={"Journal"}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.transaction_amount")}
          </label>
          <input
            disabled={true}
            value={4500}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 items-end gap-4">
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.transaction_date")}
          </label>
          <input
            disabled={true}
            value={"11-12-2023"}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.entry_by")}
          </label>
          <input
            disabled={true}
            value={"Romjan Ali"}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.note")}
          </label>
          <input
            disabled={true}
            value={""}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
      </div>
    </form>
  );
}
