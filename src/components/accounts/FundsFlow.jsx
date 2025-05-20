// import { useTranslation } from "react-i18next";
import FundsFlowTable from "./reports/funds-flow/FundsFlowTable";
import SearchByYear from "./reports/SearchByYear";

const FundsFlow = () => {
    // const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <SearchByYear />

      <h3 className="text-2xl font-medium text-center mt-2">
        {/* {t("module.accounts.cash_summary_list")} */}
        Funds Flow
      </h3>
      <FundsFlowTable />
    </div>
  );
};

export default FundsFlow;
