import { useState } from "react";
import DeleteModal from "../../../common/DeleleModal";
import InfoAction from "../../InfoAction";
import TListTable from "./TListTable";

export default function TeacherList() {
   const [isDelete, setIsDelete] = useState(false);
   const [toDelete, setToDelete] = useState("");
 
   function handleDelete(name) {
     setIsDelete(true);
     setToDelete(name);
   }
   
    return (
      <div className="my-4 bg-white rounded-md p-4 md:p-6">

         <InfoAction />

         <TListTable handleDelete={handleDelete} />

         {/* show only when isDelete is true */}
        <DeleteModal title={toDelete} isOpen={isDelete} onClose={()=>setIsDelete(false)} />
      </div>
    );
}