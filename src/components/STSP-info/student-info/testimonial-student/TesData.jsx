import { Link } from "react-router-dom";
import EditTesData from "./EditTesData";

export default function TesData() {
   // const student = useLoaderData();

    return (
      <div className="my-4 rounded p-4 md:p-6 bg-white">

         <div className="flex justify-between">
            <h3 className="text-2xl font-medium mb-4">Edit Student Data</h3>
            <button
            className="rounded px-6 py-1 md:py-3 bg-yellow  text-white shadow-md hover:-translate-y-[2px] duration-200"
            >
            Testimonial List
            </button>
         </div>

         <EditTesData />

         {/* form submit buttons */}
         <div className="flex justify-end items-center gap-4 mt-4 mb-2 md:mb-0">
            <button className="bg-blue w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
               Save
            </button>

            <Link to="/student-info/student-list">
               <button className="bg-red w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
                  Cancel
               </button>
            </Link>
         </div>
      </div>
    );
}