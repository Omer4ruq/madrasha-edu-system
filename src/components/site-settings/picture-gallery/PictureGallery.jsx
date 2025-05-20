import { useState } from "react";
import DeleteModal from "../../common/DeleleModal";
import AddType from "../AddType";
import AddTypeModal from "./AddTypeModal";
import EditTypeModal from "./EditTypeModal";
import TypeTable from "./TypeTable";

export default function PictureGallery() {
   const [isAdd, setIsAdd] = useState(false);
   const [isEdit, setIsEdit] = useState(false);
   const [isDelete, setIsDelete] = useState(false);
   const [toDelete, setToDelete] = useState("");
   const [editContent, setEditContent] = useState({});
 
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
         <AddType setIsAdd={setIsAdd} title="Picture" />
         <TypeTable handleEdit={handleEdit} handleDelete={handleDelete} />

         {/* The 3 modals: Add, Edit, Delete */}
         {/* show only when isAdd is true */}
         <AddTypeModal isAdd={isAdd} onClose={()=>setIsAdd(false)} />
         {/* show only when isEdit is true */}
         <EditTypeModal
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