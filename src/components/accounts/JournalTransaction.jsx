import { useTranslation } from "react-i18next";
import { useState } from "react";
import AddJournalTransaction from "./transaction/journal/AddJournalTransaction";
import JournalTransactionForm from "./transaction/journal/JournalTransactionForm";

const JournalTransaction = () => {
  const { t } = useTranslation();
  const [totalTransaction, setTotalTransaction] = useState(0);
  return (
    <div className="bg-white rounded-md p-4 md:p-6  my-4">
      <h3 className="text-2xl font-medium text-center">
        {t("module.accounts.journal_transaction")}
      </h3>
      <AddJournalTransaction setTotalTransaction={setTotalTransaction}/>

      <hr />

      <h3 className="text-2xl font-medium text-center mt-2">
        {t("module.accounts.journal_transaction_form")}
      </h3>      
      {/* recieve trnsaction form */}
      <JournalTransactionForm totalTransaction={totalTransaction}/>
    </div>
  );
};

export default JournalTransaction;
