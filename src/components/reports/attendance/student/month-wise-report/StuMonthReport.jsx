import MonthForm from "./MonthForm";
import StuMonthTable from "./StuMonthTable";

export default function StuMonthReport() {
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <MonthForm />

      <StuMonthTable />
    </div>
  );
}
