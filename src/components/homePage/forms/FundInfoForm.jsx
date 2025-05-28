import { useTranslation } from "react-i18next";
import Fund from "./singleField/Fund";
import Month from "./singleField/Month";
import Year from "./singleField/Year";

export default function FundInfoForm() {
  const { t } = useTranslation();
  return (
    <div className="my-2 text-#DB9E30 flex items-center gap-1 sm:gap-4">
      <Year style="w-3/12" />
      <Month style="w-3/12" />
      <Fund style="w-3/12" />
      <button className="w-3/12 bg-red text-white p-2 tracking-wide rounded mt-6">
      {t("module.dashboard.search")}
      </button>
    </div>
  );
}
