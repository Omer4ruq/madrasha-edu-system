import { FaSchool } from "react-icons/fa";
export default function SchoolName() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-white w-7 sm:w-8 h-7 sm:h-8 p-1 sm:p-[6px] rounded-full flex items-center justify-center">
        <FaSchool className="w-5 sm:w-7 h-5 sm:h-7" />
      </div>
      <h3 className="text-white text-lg hidden sm:block">
        Urban International International School and College
      </h3>
    </div>
  );
}
