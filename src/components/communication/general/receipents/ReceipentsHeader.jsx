export default function ReceipentsHeader({allChecked, handleAllCheckboxChange}) {
    return (
      <>
         <div className="flex items-center justify-between text-textGray px-2 pt-4 pb-2 font-medium">
            <h4 className="text-lg">Select Receipents</h4>
            <div className="flex gap-2">
               <input type="checkbox"
               checked={allChecked}
               onChange={handleAllCheckboxChange}/>
               <h4>Select All</h4>
            </div>
         </div>
      </>
    );
}