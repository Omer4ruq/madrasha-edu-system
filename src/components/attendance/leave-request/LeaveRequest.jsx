import { useState } from "react";
import DeleteModal from "../../common/DeleleModal";
import AddLeaveType from "../leave-type/AddLeaveType";
import AddLRequestModal from "./AddLRequestModal";
import LReqEditModal from "./LReqEditModal";
import LRequestTable from "./LRequestTable";

export default function LeaveRequest() {
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
      <div className="bg-white rounded-md p-4 md:p-6  my-4">
         <AddLeaveType setIsAdd={setIsAdd} />

         <LRequestTable handleEdit={handleEdit} handleDelete={handleDelete} />

         {/* The 3 modals: Add, Edit, Delete */}
         {/* show only when isAdd is true */}
         <AddLRequestModal isAdd={isAdd} onClose={()=> setIsAdd(false)} />
         
         {/* show only when isEdit is true */}
         <LReqEditModal
         editContent={editContent}
         setEditContent={setEditContent}
         isEdit={isEdit} 
         onClose={()=>setIsEdit(false)}
         />


         {/* show only when isDelete is true */}
         <DeleteModal title={toDelete.toLowerCase()} isOpen={isDelete} onClose={()=>setIsDelete(false)} />

      </div>
    );
}