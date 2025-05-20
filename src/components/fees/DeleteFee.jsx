import { useState } from "react";
import DeleteModal from "../common/DeleleModal";
import LoadFee from "./delete-fee/LoadFee";
import DeleteFeeTable from "./delete-fee/DeleteFeeTable";

const DeleteFee = () => {
  const [isDelete, setIsDelete] = useState(false);
  const [toDelete, setToDelete] = useState("");

  function handleDelete(title) {
    setIsDelete(true);
    setToDelete(title);
  }

  return (
    <div className="bg-white rounded-md p-4 md:p-6  my-4">
      <LoadFee/>
      <DeleteFeeTable handleDelete={handleDelete} />      

      {/* show only when isDelete is true */}
      <DeleteModal
        title={toDelete.toLowerCase()}
        isOpen={isDelete}
        onClose={() => setIsDelete(false)}
      />
    </div>
  );
};

export default DeleteFee;
