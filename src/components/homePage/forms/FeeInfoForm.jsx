import Class from "./singleField/Class";
import Month from "./singleField/Month";
import Year from "./singleField/Year";

export default function FeeInfoForm() {
  return (
    <div className="my-2 text-#DB9E30 flex items-center justify-between gap-2 sm:gap-4">
      <Year style="w-1/3" />
      <Month style="w-1/3" />
      <Class style="w-1/3" />
    </div>
  );
}
