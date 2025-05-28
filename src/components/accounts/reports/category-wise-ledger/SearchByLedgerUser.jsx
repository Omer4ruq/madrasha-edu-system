import { useTranslation } from "react-i18next";
import Select from "react-select";

const colourOptions = [
  { value: "purple", label: "Purple", color: "#5243AA" },
  { value: "orange", label: "Orange", color: "#FF8B00" },
  { value: "yellow", label: "Yellow", color: "#FFC400" },
  { value: "green", label: "Green", color: "#36B37E" },
  { value: "forest", label: "Forest", color: "#00875A" },
];

export default function SearchByLedgerUser() {
  const { t } = useTranslation();

  return (
    <form className="">
      {/* From Date */}
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 items-end gap-4">
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.fromDate")}
          </label>
          <input
            type="date"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.toDate")}
          </label>
          <input
            type="date"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.select_ledger_type")}
          </label>

          <Select
            closeMenuOnSelect={false}
            isMulti
            name="colors"
            options={colourOptions}
            styles={{
              multiValueLabel: (bst) => ({
                ...bst,
                lineHeight: "16px",
                marginBottom: 0,
              }),
              input: (bst) => ({ ...bst, height: "35px" }),
            }}
          />
        </div>
        <div className="space-y-2">
          <label className="pr-2 whitespace-nowrap">
            {t("module.accounts.select_user")}
          </label>

          <Select
            closeMenuOnSelect={false}
            isMulti
            name="colors"
            options={colourOptions}
            styles={{
              multiValueLabel: (bst) => ({
                ...bst,
                lineHeight: "16px",
                marginBottom: 0,
              }),
              input: (bst) => ({ ...bst, height: "35px" }),
            }}
          />
        </div>
        <div className="space-y-2">
          <button
            type="submit"
            className="rounded w-full p-3 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
          >
            {t("module.accounts.search")}
          </button>
        </div>
      </div>
    </form>
  );
}
