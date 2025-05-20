import AllocationForm from "./AllocationForm";
import AllocationTable from "./AllocationTable";

export default function Allocation({title, data}) {
  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <AllocationForm />

      <AllocationTable title={title} data={data} />
    </div>
  )
}
