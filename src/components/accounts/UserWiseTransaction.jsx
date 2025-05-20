// import { useTranslation } from "react-i18next";
import SearchByDateRange from "./reports/SearchByDateRange";
import UserTransactionTable from "./reports/user-transaction/UserTransactionTable";

const UserTransaction = () => {
    // const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <SearchByDateRange />

      <h3 className="text-2xl font-medium text-center mt-2">
        {/* {t("module.accounts.cash_summary_list")} */}
        User Wise Transaction Overview
      </h3>
      <UserTransactionTable />
    </div>
  );
};

export default UserTransaction;
