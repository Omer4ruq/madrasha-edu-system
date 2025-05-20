import { teachers } from "../components/STSP-info/teacher-info/teacher-list/TListTable.jsx";

export default async function getTeacher({params}) {
   
const teacher = teachers.find(p => p.id === params.id);

   return teacher;
 }