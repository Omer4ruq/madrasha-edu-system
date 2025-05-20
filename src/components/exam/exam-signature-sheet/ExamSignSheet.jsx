import ExamSignContent from "./ExamSignContent";
import ExamSignHeader from "./ExamSignHeader";

export default function ExamSignSheet() {
    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
         <ExamSignHeader />

         <ExamSignContent />
      </div>
    );
}