import { useState } from "react";
import DeleteModal from "../../../common/DeleleModal";
import AddStWaiver from "./AddStWaiver";
import AddStWaiverModal from "./AddStWaiverModal";
import StWaiverEditModal from "./StWaiverEditModal";
import StWaiverForm from "./StWaiverForm";
import StWaiverTable from "./StWaiverTable";

export default function StWaiver() {
   const [isAdd, setIsAdd] = useState(false);
   const [isEdit, setIsEdit] = useState(false);
   const [isDelete, setIsDelete] = useState(false);
   const [toDelete, setToDelete] = useState("");
   const [editContent, setEditContent] = useState({
      name: "",
      type: "",
      start: "",
      end: "",
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
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <StWaiverForm />

      <AddStWaiver setIsAdd={setIsAdd} />

      <StWaiverTable handleEdit={handleEdit} handleDelete={handleDelete} />

      {/* The 3 modals: Add, Edit, Delete */}
      {/* show only when isAdd is true */}
      <AddStWaiverModal isAdd={isAdd} onClose={()=> setIsAdd(false)} />

      {/* show only when isEdit is true */}
      <StWaiverEditModal
      editContent={editContent}
      setEditContent={setEditContent}
      isEdit={isEdit}
      onClose={()=> setIsEdit(false)}
      />

  
      {/* show only when isDelete is true */}
      <DeleteModal title={toDelete.toLowerCase()} isOpen={isDelete} onClose={()=>setIsDelete(false)} />
    </div>
  )
}
