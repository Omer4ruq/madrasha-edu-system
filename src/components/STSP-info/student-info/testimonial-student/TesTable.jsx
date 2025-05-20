
import { Link } from "react-router-dom";
import { studentsData } from "../../../../data/studentList";


export default function TesTable({handleViewClick}) {


    return (
   <div className="border border-black rounded mt-6 sm:mt-8">
      <table className="w-full text-center text-textGray">
         <thead className="border-b border-slate-300 rounded-lg bg-bgBlue leading-8">
            <tr className="divide-x divide-slate-300">
               <th className="py-1 w-2/12">ID</th>
               <th className="w-3/12">Name</th>
               <th className="w-2/12">Class</th>
               <th className="w-2/12">Section</th>
               <th className="w-3/12">Actions</th>
            </tr>
         </thead>
         <tbody className="divide-y divide-slate-300 font-medium">
         {studentsData.map((item, index) => (
            <tr key={index} className="leading-8 even:bg-slate-200 divide-x divide-slate-300">
               <td className="w-2/12">{item.id}</td>
               <td className="w-3/12">{item.name}</td>
               <td className="w-2/12">{item.class}</td>
               <td className="w-2/12">{item.section}</td>
               <td className="w-3/12">
                  <button
                  onClick={() => handleViewClick(item)}
                  className="bg-green px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 leading-6 m-1"
                  >
                     View
                  </button>
                  <Link to={`../testimonial-data/${item.id}`}>
                     <button
                        className="bg-yellow px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 leading-6 m-1"
                     >
                        Data
                     </button>
                  </Link>
               </td>
            </tr>
         ))}
         </tbody>
      </table>
    </div>
    );
}