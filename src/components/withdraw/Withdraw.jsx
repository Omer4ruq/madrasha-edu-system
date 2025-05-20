import { useState } from "react";
import DeleteModal from "../common/DeleleModal";
import AddLTypeModal from "./AddLTypeModal";
import AddLeaveType from "./AddLeaveType";
import LTypeModal from "./LTypeModal";
import LTypeTable from "./LTypeTable";

export default function Withdraw() {
   const [isAdd, setIsAdd] = useState(false);
   const [isEdit, setIsEdit] = useState(false);
   const [isDelete, setIsDelete] = useState(false);
   const [toDelete, setToDelete] = useState("");
   const [editContent, setEditContent] = useState("");
 
   function handleEdit(item) {
     setIsEdit(true);
     setEditContent(item);
   }

   function handleDelete(title) {
     setIsDelete(true);
     setToDelete(title);
   }

    return (
      <div className="bg-white rounded-md p-4 md:p-6  my-4">
         <AddLeaveType setIsAdd={setIsAdd} />
         <LTypeTable handleEdit={handleEdit} handleDelete={handleDelete} />

         {/* The 3 modals: Add, Edit, Delete */}
         {/* show only when isAdd is true */}
         <AddLTypeModal isAdd={isAdd} onClose={()=>setIsAdd(false)} />
         {/* show only when isEdit is true */}
         <LTypeModal
         editContent={editContent}
         isEdit={isEdit} 
         onClose={()=>setIsEdit(false)}
         />

         {/* show only when isDelete is true */}
         <DeleteModal title={toDelete.toLowerCase()} isOpen={isDelete} onClose={()=>setIsDelete(false)} />
      </div>
    );
}