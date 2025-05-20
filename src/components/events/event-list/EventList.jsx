import { useState } from "react";
import DeleteModal from "../../common/DeleleModal";
import AddEvent from "./AddEvent";
import EventAddModal from "./EventAddModal";
import EventEditModal from "./EventEditModal";
import EventTable from "./EventTable";

export default function EventList() {
   const [isAdd, setIsAdd] = useState(false);
   const [isEdit, setIsEdit] = useState(false);
   const [isDelete, setIsDelete] = useState(false);
   const [toDelete, setToDelete] = useState("");
   const [editContent, setEditContent] = useState({
    name: "",
    start:"",
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
         <AddEvent setIsAdd={setIsAdd} />
         <EventTable handleEdit={handleEdit} handleDelete={handleDelete} />

         {/* The 3 modals: Add, Edit, Delete */}
         {/* show only when isAdd is true */}
         <EventAddModal isAdd={isAdd} onClose={()=>setIsAdd(false)} />

         {/* show only when isEdit is true */}
         <EventEditModal
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