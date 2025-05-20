import MeritContent from "./MeritContent";
import MeritForm from "./MeritForm";

export default function MeritList() {
    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
        <MeritForm />

        <MeritContent />
      </div>
    );
}