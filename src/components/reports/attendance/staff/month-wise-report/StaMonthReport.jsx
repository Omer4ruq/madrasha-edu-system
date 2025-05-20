import MonthForm from "./MonthForm";
import StaMonthTable from "./StaMonthTable";

export default function StaMonthReport() {
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <MonthForm />

      <StaMonthTable />
    </div>
  );
}
