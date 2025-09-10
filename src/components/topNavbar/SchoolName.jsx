import { FaSchool } from "react-icons/fa";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";

export default function SchoolName() {
  const {
    data: instituteData,
    isLoading,
    error,
  } = useGetInstituteLatestQuery();

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full">
        <img
          className="w-7 sm:w-10 h-7 sm:h-10 rounded-full"
          src={instituteData?.institute_logo}
          alt=""
        />
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
          {instituteData?.institute_name ||
            "আল জামিয়াতুল ইসলামিয়া মাইজদী, নোয়াখালী বাংলাদেশ"}
        </h3>
      )}
    </div>
  );
}
