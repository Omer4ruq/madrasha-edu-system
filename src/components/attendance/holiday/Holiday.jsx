import { useState } from "react";
import DeleteModal from "../../common/DeleleModal";
import AddHoliday from "./AddHoliday";
import AddHolidayModal from "./AddHolidayModal";
import HolidayEditModal from "./HolidayEditModal";
import HolidayTable from "./HolidayTable";

export default function Holiday() {
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
         <AddHoliday setIsAdd={setIsAdd} />

         <HolidayTable handleEdit={handleEdit} handleDelete={handleDelete} />

         {/* The 3 modals: Add, Edit, Delete */}
         {/* show only when isAdd is true */}
         <AddHolidayModal isAdd={isAdd} onClose={()=> setIsAdd(false)} />

         {/* show only when isEdit is true */}
         <HolidayEditModal
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