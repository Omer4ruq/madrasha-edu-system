import PersonInfoTable from "./PersonInfoTable";
import TableHead from "./TableHead";

export default function MediumTable({tableData1, tableData2, checkedState, handleCheckboxChange}) {
    return (
      <div>
         <div className="grid grid-cols-2">
            <TableHead borderStyle="border-r-2" />
            <TableHead borderStyle="" />
         </div>

         <div className="grid grid-cols-2 items-start max-h-80 overflow-auto scrollbar-table">
            <PersonInfoTable persons={tableData1} checkedState={checkedState} handleCheckboxChange={handleCheckboxChange} borderStyle="border-r-2"/>
            <PersonInfoTable persons={tableData2} checkedState={checkedState} handleCheckboxChange={handleCheckboxChange}/>
         </div>

      </div>
    );
}