import { useTranslation } from "react-i18next";
import LedgerCreateForm from "./ledger-create/LedgerCreateForm";
import DeleteModal from "../common/DeleleModal";
import { useState } from "react";
import LedgerEditModal from "./ledger-create/LedgerEditModal";
import LedgerTable from "./ledger-create/LedgerTable";

const LedgerCreate = () => {
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [toDelete, setToDelete] = useState("");
  const [editContent, setEditContent] = useState({
      type_name: "",
      late_fee: "",
      schedule_type: "",
      status: "",
      admission_year: "",
});

  function handleEdit(item) {
    setIsEdit(true);
    setEditContent({...item});
  }

  function handleDelete(title) {
    setIsDelete(true);
    setToDelete(title);
  }
  return (
    <>
      <div className="bg-white rounded-md p-4 md:p-6  my-4">
        <h3 className="text-2xl font-medium">
          {t("module.accounts.ledger_create")}
        </h3>

        <LedgerCreateForm />  

        <h3 className="text-2xl font-medium text-center mt-7">
          {t("module.accounts.general_ledger_list")}
        </h3>

        <div className="flex justify-end mt-2"> 
          <div className="inline-block relative w-44">
            <input
              placeholder={`${t("module.accounts.search_here")}...`}
              type="text"
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>

        <LedgerTable handleEdit={handleEdit} handleDelete={handleDelete}/>

         {/* show only when isEdit is true */}
         <LedgerEditModal
         editContent={editContent}
         setEditContent={setEditContent}
         isEdit={isEdit} 
         onClose={()=>setIsEdit(false)}
         />

         {/* show only when isDelete is true */}
         <DeleteModal title={toDelete.toLowerCase()} isOpen={isDelete} onClose={()=>setIsDelete(false)} />
      </div>
    </>
  );
};

export default LedgerCreate;
