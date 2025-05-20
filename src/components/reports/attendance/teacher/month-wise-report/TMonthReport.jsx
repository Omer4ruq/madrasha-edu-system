import MonthForm from "./MonthForm";
import TMonthTable from "./TMonthTable";

export default function TMonthReport() {
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <MonthForm />

      <TMonthTable />
    </div>
  );
}
