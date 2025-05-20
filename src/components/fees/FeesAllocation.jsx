import FeesAllocationHeader from "./fees-allocation/FeesAllocationHeader";
import FeesAllocationForm from "./fees-allocation/FeesAllocationForm";

const FeesAllocation = () => {
  return (
    <div className="bg-white rounded-md p-4 md:p-6  my-4">
      <FeesAllocationHeader />
      <FeesAllocationForm />
    </div>
  );
};

export default FeesAllocation;
