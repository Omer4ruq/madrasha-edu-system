import RoutineCard from "../cards/RoutineCard";
import SectionHeader from "../common/SectionHeader";
import ClassRoutineForm from "../forms/ClassRoutineForm";
import { useTranslation } from "react-i18next";

export default function ClassRoutine() {
  const { t } = useTranslation();
  
  const routines = [
    {
      name: "English 1st Paper",
      time: "10:00 Am - 11:00 Am",
    },
    {
      name: "English 2nd Paper",
      time: "10:00 Am - 11:00 Am",
    },
    {
      name: "Bangla 1st Paper",
      time: "10:00 Am - 11:00 Am",
    },
    {
      name: "Bangla 1st Paper",
      time: "10:00 Am - 11:00 Am",
    },
    {
      name: "Bangla 1st Paper",
      time: "10:00 Am - 11:00 Am",
    },
    {
      name: "Bangla 1st Paper",
      time: "10:00 Am - 11:00 Am",
    },
    {
      name: "Bangla 1st Paper",
      time: "10:00 Am - 11:00 Am",
    },
    {
      name: "Bangla 1st Paper",
      time: "10:00 Am - 11:00 Am",
    },
  ];

  return (
    <div className="rounded-md text-sm bg-white">
      <SectionHeader title="Class Routine" />
      <div className="p-2 sm:p-4">
        <ClassRoutineForm />
        <h4 className="text-textGray text-end text-xs mt-4 mb-1">
          {t("module.dashboard.total_class_found")}: <span className="text-green">06</span>
        </h4>
        <div className="rounded bg-bgBlue">
          <h3 className="rounded-t p-2 font-medium bg-[#6b6eff80]">
            12 July 2024 | Class: Nine | Section: A
          </h3>
          <div className="p-2 space-y-2 h-80 overflow-y-scroll scrollbar-table">
            {routines.map((routine, index) => (
              <RoutineCard key={index} routine={routine} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}