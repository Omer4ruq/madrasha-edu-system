import TimeForm from "../../TimeForm";
import SmsTable from "./SmsTable";
export default function SmsPurchaseHistory() {
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <TimeForm />

      <SmsTable />
    </div>
  );
}
