import { useState } from "react";
import DeleteModal from "../../../common/DeleleModal";
import AddPackage from "./AddPackage";
import AddPackageModal from "./AddPackageModal";
import PackageEditModal from "./PackageEditModal";
import PackageTable from "./PackageTable";

export default function Package({title,data}) {
   const [isAdd, setIsAdd] = useState(false);
   const [isEdit, setIsEdit] = useState(false);
   const [isDelete, setIsDelete] = useState(false);
   const [toDelete, setToDelete] = useState("");
   const [editContent, setEditContent] = useState({
      name: "",
      amount: "",
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

      <AddPackage title={title} setIsAdd={setIsAdd} />

      <PackageTable data={data} handleEdit={handleEdit} handleDelete={handleDelete} />

      {/* The 3 modals: Add, Edit, Delete */}
      {/* show only when isAdd is true */}
      <AddPackageModal isAdd={isAdd} onClose={()=> setIsAdd(false)} />

      {/* show only when isEdit is true */}
      <PackageEditModal
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
