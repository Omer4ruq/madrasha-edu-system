import ChooseSubTable from "./chooseable-subject/ChooseSubTable";
import SelectClass from "./chooseable-subject/SelectClass";
import SelectSubject from "./chooseable-subject/SelectSubject";

export default function ChooseableSubject() {
  return (
    <div className="bg-white px-4 py-6 rounded mt-4">
      {/* select a particular class */}
      <SelectClass />

      {/* show all students */}
      <ChooseSubTable/>

      
      <SelectSubject />

      {/* save button */}
      {/* <button className="bg-#DB9E30 px-6 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
        Save
      </button> */}
    </div>
  );
}
