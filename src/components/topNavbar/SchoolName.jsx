import { FaSchool } from "react-icons/fa";
export default function SchoolName() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-[#DB9E30] w-7 sm:w-10 h-7 sm:h-10 p-1 sm:p-2 rounded-full flex items-center justify-center">
        <FaSchool className="w-4 sm:w-7 h-4 sm:h-7 text-[#441a05]  " />
      </div>
      <h3 className="text-[#441a05] font-bold text-base md:text-lg hidden sm:block">
        Urban International International School and College
      </h3>
    </div>
  );
}
