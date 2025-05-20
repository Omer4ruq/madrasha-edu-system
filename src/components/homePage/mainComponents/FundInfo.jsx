import SectionHeader from "../common/SectionHeader";
import FundInfoForm from "../forms/FundInfoForm";
import FundInfoTable from "../tables/FundInfoTable";
import { useTranslation } from "react-i18next";

export default function FundInfo() {
  const { t } = useTranslation();

  return (
    <div className="rounded-md text-sm bg-white">
      <SectionHeader title={t("module.dashboard.fund_information")} />
      <div className="p-2 sm:p-4 rounded-b-md">
        <FundInfoForm />
        <FundInfoTable />
      </div>
    </div>
  );
}
