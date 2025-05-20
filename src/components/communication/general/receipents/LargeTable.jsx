import PersonInfoTable from "./PersonInfoTable";
import TableHead from "./TableHead";

export default function LargeTable({tableData1, tableData2, tableData3, checkedState, handleCheckboxChange}) {
    return (
      <div>
         <div className="grid grid-cols-3">
            <TableHead borderStyle="border-r-2" />
            <TableHead borderStyle="border-r-2" />
            <TableHead borderStyle="" />
         </div>

         <div className="grid grid-cols-3 items-start h-60 overflow-auto scrollbar-table">
            <PersonInfoTable persons={tableData1} checkedState={checkedState} handleCheckboxChange={handleCheckboxChange} borderStyle="border-r-2"/>
            <PersonInfoTable persons={tableData2} checkedState={checkedState} handleCheckboxChange={handleCheckboxChange} borderStyle="border-r-2" />
            <PersonInfoTable persons={tableData3} checkedState={checkedState} handleCheckboxChange={handleCheckboxChange}/>
         </div>

      </div>
    );
}