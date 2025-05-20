import StaTimeTable from "./StaTimeTable";
import TimeForm from "./TimeForm";
export default function StaTimeReport() {
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <TimeForm />

      <StaTimeTable />
    </div>
  );
}
