import StuTimeTable from "./StuTimeTable";
import TimeForm from "./TimeForm";
export default function StuTimeReport() {
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <TimeForm />

      <StuTimeTable />
    </div>
  );
}
