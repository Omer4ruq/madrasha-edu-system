import { FaSchool } from "react-icons/fa";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";


export default function SchoolName() {
  const { data: instituteData, isLoading, error } = useGetInstituteLatestQuery();

  return (
    <div className="flex items-center gap-2">
      <div className="bg-[#DB9E30] w-7 sm:w-10 h-7 sm:h-10 p-1 sm:p-2 rounded-full flex items-center justify-center">
        <FaSchool className="w-4 sm:w-7 h-4 sm:h-7 text-[#441a05]" />
      </div>
      {isLoading ? (
        <h3 className="text-[#441a05] font-bold text-base md:text-lg hidden sm:block">
          লোড হচ্ছে...
        </h3>
      ) : error ? (
        <h3 className="text-[#441a05] font-bold text-base md:text-lg hidden sm:block">
          ত্রুটি: ইনস্টিটিউট ডেটা লোড করা যায়নি
        </h3>
      ) : (
        <h3 className="text-[#441a05] font-bold text-base md:text-lg hidden sm:block">
          {instituteData?.institute_name || "আল জামিয়াতুল ইসলামিয়া মাইজদী, নোয়াখালী বাংলাদেশ"}
        </h3>
      )}
    </div>
  );
}