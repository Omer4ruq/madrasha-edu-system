import { useState } from "react";
import DeleteModal from "../common/DeleleModal";
import AddDownload from "./AddDownload";
import DownloadAddModal from "./DownloadAddModal";
import DownloadEditModal from "./DownloadEditModal";
import DownloadTable from "./DownloadTable";

export default function StudyMaterial() {
   const [isAdd, setIsAdd] = useState(false);
   const [isEdit, setIsEdit] = useState(false);
   const [isDelete, setIsDelete] = useState(false);
   const [toDelete, setToDelete] = useState("");
   const [editContent, setEditContent] = useState({
    name: "",
    type:"",
    class: "",
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
         <AddDownload setIsAdd={setIsAdd} />
         <DownloadTable handleEdit={handleEdit} handleDelete={handleDelete} />

         {/* The 3 modals: Add, Edit, Delete */}
         {/* show only when isAdd is true */}
         <DownloadAddModal isAdd={isAdd} onClose={()=>setIsAdd(false)} />

         {/* show only when isEdit is true */}
         <DownloadEditModal
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