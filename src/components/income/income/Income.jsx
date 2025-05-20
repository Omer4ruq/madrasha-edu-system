import { useState } from "react";
import { studentsData } from "../../../data/studentList";
import DeleteModal from "../../common/DeleleModal";
import InfoAction from "../../common/InfoAction";
import Pagination from "../../common/Pagination";
import IncomeTable from "./IncomeTable";

export default function Income() {
   const [isDelete, setIsDelete] = useState(false);
   const [toDelete, setToDelete] = useState("");

   const [amountToShow, setAmountToShow] = useState("10");
   const [index, setIndex] = useState(0);
 
   function handleDelete(name) {
     setIsDelete(true);
     setToDelete(name);
   }

   function handleAmountToShow (value) {
    setAmountToShow(value);
    setIndex(0);
   }
   
    return (
      <div className="my-4 bg-white rounded-md p-4 md:p-6">

        <InfoAction addLink="/income/add-income" amountToShow={amountToShow} handleAmountToShow={handleAmountToShow} />

        <IncomeTable studentsData={studentsData} amountToShow={amountToShow} index={index} handleDelete={handleDelete} />

        <Pagination show={amountToShow} total={studentsData.length} index={index} setIndex={setIndex} />

         {/* show only when isDelete is true */}
        <DeleteModal title={toDelete} isOpen={isDelete} onClose={()=>setIsDelete(false)} />
      </div>
    );
}