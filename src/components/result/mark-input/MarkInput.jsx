import GetMarksForm from "./GetMarksForm";
import MarksTable from "./MarksTable";

export default function MarkInput() {
    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
         <GetMarksForm />

         <MarksTable />
      </div>
    );
}