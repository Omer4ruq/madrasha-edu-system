import { Link } from "react-router-dom";

export default function TesForm() {
    return (
      <div className="md:flex justify-between">
         <div className="w-full sm:mr-8 sm:flex items-center gap-2 sm:gap-3">
            <label className="min-w-10">Class</label>
            <select
            id=""
            name=""
            defaultValue="Select"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none min-w-40 lg:min-w-52 mb-2 sm:mb-0"
            >
               <option value="Select">Select Class</option>
               <option value="One Jaba">One Jaba</option>
               <option value="One Golap">One Golap</option>
               <option value="Two Jaba">Two Jaba</option>
               <option value="Two Golap">Two Golap</option>
            </select>
            
            <label className="min-w-12 ml-0 sm:ml-2">Section</label>
            <select
            id=""
            name=""
            defaultValue="Select"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none min-w-40 lg:min-w-52 mb-3 sm:mb-0"
            >
               <option value="Select">Select Class</option>
               <option value="One Jaba">One Jaba</option>
               <option value="One Golap">One Golap</option>
               <option value="Two Jaba">Two Jaba</option>
               <option value="Two Golap">Two Golap</option>
            </select>

            <button className="bg-blue min-w-28 xl:min-w-32s py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
            Submit
            </button>
         </div>

         <Link to="../testimonial-settings/" className="mt-3 md:mt-0 flex justify-end">
            <button className="bg-#DB9E30 hover:bg-buttonHover w-44 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
               Settings
            </button>
         </Link>
      </div>
    );
}