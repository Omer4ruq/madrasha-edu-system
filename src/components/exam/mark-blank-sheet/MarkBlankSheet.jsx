import MarkBlankContent from "./MarkBlankContent";
import MarkBlankHeader from "./MarkBlankHeader";

export default function MarkBlankSheet() {
    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
         <MarkBlankHeader />

         <MarkBlankContent />
     </div>
    );
}