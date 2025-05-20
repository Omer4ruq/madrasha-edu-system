import SectionHeader from "../common/SectionHeader";
import ExpenseInfoForm from "../forms/ExpenseInfoForm";
import ExpenseInfoTable from "../tables/ExpenseInfoTable";
import { useTranslation } from "react-i18next";

export default function ExpenseInfo() {
  const { t } = useTranslation();

  return (
    <div className="rounded-md text-sm bg-white">
      <SectionHeader title={t("module.dashboard.expense_information")} />
      <div className="p-2 sm:p-4 rounded-b-md">
        <ExpenseInfoForm />
        <ExpenseInfoTable />
      </div>
    </div>
  );
}

