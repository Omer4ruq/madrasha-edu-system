import { staffs } from "../components/STSP-info/staff-info/staff-list/SListTable.jsx";

export default async function getStaff({params}) {
   
const staff = staffs.find(p => p.id === params.id);

   return staff;
 }