import { studentsData } from "../../../data/studentList";
import SingleStPLan from "./SingleStPlan";

export default function AllStPlan() {
    return (
      <div className="mt-8 m-auto sm:w-3/4 md:w-1/2">
        {
         studentsData.map(student => <SingleStPLan key={student.id} student={student} />)
        }
      </div>
    );
}