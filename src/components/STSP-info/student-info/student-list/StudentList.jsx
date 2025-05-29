import { useState } from "react";
// import { studentsData } from "../../../../data/studentList";
import DeleteModal from "../../../common/DeleleModal";
import Pagination from "../../../common/Pagination";
import InfoAction from "../../InfoAction";
import SListTable from "./SListTable";
import { useGetStudentListApIByIdQuery, useGetStudentListApIQuery } from "../../../../redux/features/api/student/studentListApi";

export default function StudentList() {
   const [isDelete, setIsDelete] = useState(false);
   const [toDelete, setToDelete] = useState("");

   const [amountToShow, setAmountToShow] = useState("10");
   const [index, setIndex] = useState(0);
 const {data, isLoading, error} = useGetStudentListApIQuery()
 console.log(data?.students)
 const studentsData = data?.students
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

        <InfoAction amountToShow={amountToShow} handleAmountToShow={handleAmountToShow} />

        <SListTable studentsData={studentsData} amountToShow={amountToShow} index={index} handleDelete={handleDelete} />

        <Pagination show={amountToShow} total={studentsData?.length} index={index} setIndex={setIndex} />

         {/* show only when isDelete is true */}
        <DeleteModal title={toDelete} isOpen={isDelete} onClose={()=>setIsDelete(false)} />
      </div>
    );
}