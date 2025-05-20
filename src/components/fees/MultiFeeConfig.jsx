import { useTranslation } from "react-i18next";
import MultiFeeConfigSearchForm from "./multi-fee-config/MultiFeeConfigSearchForm";
import MultiFeeConfigTable from "./multi-fee-config/MultiFeeConfigTable";


const MultiFeeConfig = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-md p-4 md:p-6  my-4">
      <h3 className="text-2xl font-medium">{t("module.fees.multiFeeConfig")}</h3>
      <MultiFeeConfigSearchForm />
      <MultiFeeConfigTable/>

      <div className="flex justify-end items-center gap-4 my-4">
         <button className="bg-blue w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
            Save
         </button>

         <button className="bg-red w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
            Close
         </button>
      </div>
    </div>
  );
};

export default MultiFeeConfig;
