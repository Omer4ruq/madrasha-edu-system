import AccountTable from "./AccountTable";
import TimeWithHeadForm from "./TimeWithHeadForm";
export default function IncomeHeadWise() {
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <TimeWithHeadForm  />

      <AccountTable />
    </div>
  );
}
