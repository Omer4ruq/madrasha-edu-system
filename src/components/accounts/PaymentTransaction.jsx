import { useTranslation } from "react-i18next";
import AddTransaction from "./transaction/recieve-transaction/AddTransaction";
import RecieveTransactionForm from "./transaction/recieve-transaction/RecieveTransactionForm";
import { useState } from "react";

const PaymentTransaction = () => {
  const { t } = useTranslation();
  const [totalTransaction, setTotalTransaction] = useState(0);
  return (
    <div className="bg-white rounded-md p-4 md:p-6  my-4">
      <h3 className="text-2xl font-medium text-center">
        {t("module.accounts.payment_transaction")}
      </h3>
      <AddTransaction setTotalTransaction={setTotalTransaction}/>

      <hr />

      <h3 className="text-2xl font-medium text-center mt-2">
        {t("module.accounts.payment_transaction_form")}
      </h3>      
      {/* recieve trnsaction form */}
      <RecieveTransactionForm totalTransaction={totalTransaction}/>
    </div>
  );
};

export default PaymentTransaction;
