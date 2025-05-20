
import CMCForm from "./CMCForm";
import CMCHeader from "./CMCHeader";

export default function ClassMarkConfig() {
    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
        <CMCHeader />

        <CMCForm />
      </div>
    );
}