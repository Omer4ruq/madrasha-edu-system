import Month from "./singleField/Month";
import Year from "./singleField/Year";
import { useTranslation } from "react-i18next";
export default function ExpenseInfoForm() {
  const { t } = useTranslation();
  return (
    <div className="my-2 text-#DB9E30 flex items-center gap-2 sm:gap-4">
      <Year style="w-1/3" />
      <Month style="w-1/3" />
      <button className="w-1/3 bg-red text-white p-2 tracking-wide rounded mt-6">
      {t("module.dashboard.search")}
      </button>
    </div>
  );
}
