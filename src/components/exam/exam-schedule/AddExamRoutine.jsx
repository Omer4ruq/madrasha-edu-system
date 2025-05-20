import AExRForm from "./AExRForm";
import AExRHeader from "./AExRHeader";

export default function AddExamRoutine() {
    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
         <AExRHeader />

         <AExRForm />
      </div>
    );
}