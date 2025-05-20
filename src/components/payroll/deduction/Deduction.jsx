import { useState } from "react";
import DeleteModal from "../../common/DeleleModal";
import AddDeduction from "./AddDeduction";
import DeductionTable from "./DeductionTable";
import AddDeductionModal from "./AddDeductionModal";
import EditDeductionModal from "./EditDeductionModal";

const Deduction = () => {
    const [isAdd, setIsAdd] = useState(false);
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
        <div className="bg-white rounded-md p-4 md:p-6  my-4">
         <AddDeduction setIsAdd={setIsAdd} />
         <DeductionTable handleEdit={handleEdit} handleDelete={handleDelete} />

         {/* The 3 modals: Add, Edit, Delete */}
         {/* show only when isAdd is true */}
         <AddDeductionModal isAdd={isAdd} onClose={()=>setIsAdd(false)} />

         {/* show only when isEdit is true */}
         <EditDeductionModal
         editContent={editContent}
         setEditContent={setEditContent}
         isEdit={isEdit} 
         onClose={()=>setIsEdit(false)}
         />

         {/* show only when isDelete is true */}
         <DeleteModal title={toDelete.toLowerCase()} isOpen={isDelete} onClose={()=>setIsDelete(false)} />
      </div>
    );
};

export default Deduction;