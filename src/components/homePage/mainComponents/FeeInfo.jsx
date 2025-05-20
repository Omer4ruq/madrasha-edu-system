import { useTranslation } from "react-i18next";
import SectionHeader from "../common/SectionHeader";
import FeeInfoForm from "../forms/FeeInfoForm";
import FeeInfoTable from "../tables/FeeInfoTable";

export default function FeeInfo() {
  const {t} = useTranslation();
  return (
    <div className="rounded-md text-sm bg-white">
      <SectionHeader title={t('module.dashboard.fees_information')} />
      <div className="p-2 sm:p-4 rounded-b-md">
        <FeeInfoForm />
        <FeeInfoTable />
      </div>
    </div>
  );
}
