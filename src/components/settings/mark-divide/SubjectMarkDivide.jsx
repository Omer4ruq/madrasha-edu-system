import SMDForm from "./SMDForm";
import SMDHeader from "./SMDHeader";

export default function SubjectMarkDivide() {
    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
         <SMDHeader />

         <SMDForm />
      </div>
    );
}