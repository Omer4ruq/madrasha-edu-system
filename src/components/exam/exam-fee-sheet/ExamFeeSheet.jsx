import ExamFeeContent from "./ExamFeeContent";
import ExamFeeHeader from "./ExamFeeHeader";

export default function ExamFeeSheet() {
    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
         <ExamFeeHeader />

         <ExamFeeContent />
     </div>
    );
}