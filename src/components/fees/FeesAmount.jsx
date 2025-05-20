import { useState } from "react";
import DeleteModal from "../common/DeleleModal";
import AddFeeAmount from "./fees-amount/AddFeeAmount";
import FeeAmountTable from "./fees-amount/FeeAmountTable";
import FeeAmountAddModal from "./fees-amount/FeeAmountAddModal";
import FeeAmountEditModal from "./fees-amount/FeeAmountEditModal";

const FeesAmount = () => {
  const [isAdd, setIsAdd] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [toDelete, setToDelete] = useState("");
  const [editContent, setEditContent] = useState({
    class: "",
    fee_type: "",
    amount: "",
    admission_year: "",
  });

  function handleEdit(item) {
    setIsEdit(true);
    setEditContent({ ...item });
  }

  function handleDelete(title) {
    setIsDelete(true);
    setToDelete(title);
  }

  return (
    <div className="bg-white rounded-md p-4 md:p-6  my-4">
      <AddFeeAmount setIsAdd={setIsAdd} />
      <FeeAmountTable handleEdit={handleEdit} handleDelete={handleDelete} />

      {/* The 3 modals: Add, Edit, Delete */}
      {/* show only when isAdd is true */}
      <FeeAmountAddModal isAdd={isAdd} onClose={() => setIsAdd(false)} />

      {/* show only when isEdit is true */}
      <FeeAmountEditModal
        editContent={editContent}
        setEditContent={setEditContent}
        isEdit={isEdit}
        onClose={() => setIsEdit(false)}
      />

      {/* show only when isDelete is true */}
      <DeleteModal
        title={toDelete.toLowerCase()}
        isOpen={isDelete}
        onClose={() => setIsDelete(false)}
      />
    </div>
  );
};

export default FeesAmount;
