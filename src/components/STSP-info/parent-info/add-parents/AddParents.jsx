import AddPForm from "./AddPForm";
import AddPHeader from "./AddPHeader";

export default function AddParents() {
    return (
      <div className="my-4 bg-white rounded-md p-4 md:p-6">

         <AddPHeader />

         <AddPForm />

         <div className="flex justify-end mt-4 mb-2 md:mb-0">
            <button
               type="submit"
               className="rounded w-40 p-3 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
               >
               Submit
            </button>
         </div>

      </div>
    );
}