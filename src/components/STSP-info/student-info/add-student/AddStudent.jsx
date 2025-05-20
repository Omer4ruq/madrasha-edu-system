import AddSForm from "./AddSForm";
import AddSHeader from "./AddSHeader";

export default function AddStudent() {
    return (
      <div className="my-4 bg-white rounded-md p-4 md:p-6">
         <AddSHeader />

         <AddSForm />
      </div>
    );
}