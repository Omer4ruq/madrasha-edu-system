import ParHisTable from "./ParHisTable";
import TimeForm from "./TimeForm";

export default function PurchaseHistory() {
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <TimeForm />

      <ParHisTable />
    </div>
  );
}
