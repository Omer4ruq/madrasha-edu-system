import DueForm from "./DueForm";
import FeeTable from "./FeeTable";
export default function DueFee() {
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <DueForm />

      <FeeTable />
    </div>
  );
}
