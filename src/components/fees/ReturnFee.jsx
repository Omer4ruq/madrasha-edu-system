import { useState } from "react";
import LoadFee from "./delete-fee/LoadFee";
import ReturnFeeTable from "./return-fee/ReturnFeeTable";
import ReturnFeeModal from "./return-fee/ReturnFeeModal";

const ReturnFee = () => {
  const [isDelete, setIsDelete] = useState(false);
  const [toDelete, setToDelete] = useState("");

  function handleDelete(title) {
    setIsDelete(true);
    setToDelete(title);
  }

  return (
    <div className="bg-white rounded-md p-4 md:p-6  my-4">
      <LoadFee/>
      <ReturnFeeTable handleDelete={handleDelete} />      

      {/* show only when isDelete is true */}
      <ReturnFeeModal
        title={toDelete.toLowerCase()}
        isOpen={isDelete}
        onClose={() => setIsDelete(false)}
      />
    </div>
  );
};

export default ReturnFee;
