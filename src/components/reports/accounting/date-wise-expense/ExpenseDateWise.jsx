import TimeForm from "../../TimeForm";
import AccountTable from "./AccountTable";
export default function ExpenseDateWise() {
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <TimeForm />

      <AccountTable />
    </div>
  );
}
