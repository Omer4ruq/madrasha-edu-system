import PersonInfoTable from "./PersonInfoTable";
import TableHead from "./TableHead";

export default function SmallTable({persons, checkedState, handleCheckboxChange}) {
    return (
      <div>
         <TableHead borderStyle="" />

      <div className="max-h-80 overflow-auto scrollbar-table">
         <PersonInfoTable persons={persons} checkedState={checkedState} handleCheckboxChange={handleCheckboxChange} borderStyle="border-r-2"/>
      </div>

   </div>
    );
}