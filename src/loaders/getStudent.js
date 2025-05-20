import { studentsData } from "../data/studentList";

export default async function getStudent({params}) {
   
const student = studentsData.find(p => p.id === params.id);

   return student;
 }