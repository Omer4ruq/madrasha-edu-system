import { studentsData } from "../../../data/studentList";
import SingleAdmitCard from "./SingleAdmitCard";

export default function AllAdmitCards() {
    return (
      <div className="mt-6">
        {
         studentsData.map(student => <SingleAdmitCard key={student.id} student={student} />)
        }
      </div>
    );
}