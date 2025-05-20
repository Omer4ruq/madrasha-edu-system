import { useState } from "react";
import DeleteModal from "../../common/DeleleModal";
import AddGradeModal from "./AddGradeModal";
import AddGradeRule from "./AddGradeRule";
import EditGradeModal from "./EditGradeModal";
import GradeRuleTable from "./GradeRuleTable";

export default function GradeRule() {
   const [isAdd, setIsAdd] = useState(false);
   const [isEdit, setIsEdit] = useState(false);
   const [isDelete, setIsDelete] = useState(false);
   const [toDelete, setToDelete] = useState("");
   const [editContent, setEditContent] = useState({
    name: "",
    session: "",
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
         <AddGradeRule setIsAdd={setIsAdd} />
         <GradeRuleTable handleEdit={handleEdit} handleDelete={handleDelete} />

         {/* The 3 modals: Add, Edit, Delete */}
         {/* show only when isAdd is true */}
         <AddGradeModal isAdd={isAdd} onClose={()=>setIsAdd(false)} />

         {/* show only when isEdit is true */}
         <EditGradeModal
         editContent={editContent}
         setEditContent={setEditContent}
         isEdit={isEdit} 
         onClose={()=>setIsEdit(false)}
         />

         {/* show only when isDelete is true */}
         <DeleteModal title={toDelete} isOpen={isDelete} onClose={()=>setIsDelete(false)} />
      </div>
    );
}