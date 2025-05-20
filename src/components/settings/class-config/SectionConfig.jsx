import { useLoaderData } from "react-router-dom";
import SecConfigForm from "./SecConfigForm";
import SecConfigHeader from "./SecConfigHeader";

export default function SectionConfig() {
   const section = useLoaderData();

    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
         <SecConfigHeader section={section} />

         <SecConfigForm section={section.section} />
      </div>
    );
}