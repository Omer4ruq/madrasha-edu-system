import Class from "./singleField/Class";
import Date from "./singleField/Date";
import Section from "./singleField/Section";

export default function ClassRoutineForm() {
  return (
    <div className="my-2 text-#DB9E30 flex items-center gap-2 sm:gap-4">
      <Date style="w-1/3" />
      <Class style="w-1/3" />
      <Section style="w-1/3" />
    </div>
  );
}
