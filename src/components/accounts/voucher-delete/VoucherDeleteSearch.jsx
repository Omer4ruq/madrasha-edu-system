import { useTranslation } from "react-i18next";

export default function VoucherDeleteSearch() {
  const { t } = useTranslation();

  return (
    <form className="md:flex gap-7 items-center mb-2">
      {/* Search Voucher By ID */}
      <div className="flex items-center w-full gap-2 my-2">
        <label className="pr-2 whitespace-nowrap">
          {t("module.accounts.voucher_search")}
        </label>
        <input
          placeholder="Search By Voucher Id"
          className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-2 md:w-2/12 justify-end my-4">
        <button
          type="submit"
          className="rounded w-full p-3 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
        >
          {t("module.accounts.search")}
        </button>
      </div>
    </form>
  );
}
