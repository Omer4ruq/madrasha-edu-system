import { classConfig } from "../data/classConfig";


export default async function getSection({params}) {
   
const section = classConfig.find(item => item.id === params.id);

   return section;
 }