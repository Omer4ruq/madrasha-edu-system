import AllStPlan from "./AllStPlan";
import SeatPlanHeader from "./StPlanHeader";

export default function SeatPlan() {
   return (
     <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <SeatPlanHeader />
      
      <AllStPlan />
     </div>
   );
}