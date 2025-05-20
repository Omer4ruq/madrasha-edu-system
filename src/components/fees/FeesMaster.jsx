import FeesAllocationHeader from "./fees-allocation/FeesAllocationHeader";
import FeesMasterForm from "./fees-master/FeesMasterForm";

const FeesMaster = () => {
  return (
    <div className="bg-white rounded-md p-4 md:p-6  my-4">
      <FeesAllocationHeader />
      <FeesMasterForm />
    </div>
  );
};

export default FeesMaster;
