import { useTranslation } from "react-i18next";
import ContraTransactionForm from "./transaction/contra/ContraTransactionForm";

const ContraTransaction = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="bg-white rounded-md p-4 md:p-6  my-4">
        <h3 className="text-2xl font-medium text-center mt-2">
          {t("module.accounts.contra_transaction_form")}
        </h3>
        {/* recieve trnsaction form */}
        <ContraTransactionForm />
      </div>
    </>
  );
};

export default ContraTransaction;
