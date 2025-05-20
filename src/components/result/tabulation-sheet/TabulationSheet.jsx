import TabForm from "./TabForm";
import TabHeading from "./TabHeading";
import TabulContent from "./TabulContent";

export default function TabulationSheet() {
    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
        <TabHeading />
        
        <TabForm />

        <TabulContent />

      </div>
    );
}