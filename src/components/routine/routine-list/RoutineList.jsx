import RoutineListTable from "./RoutineListTable";
import { useTranslation } from "react-i18next";

export default function RoutineList() {
    const { t } = useTranslation();

    return (
      <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
         <h3 className="text-2xl font-bold mt-4 mb-8">{t("module.routine.routine_list_title")}</h3>

         <RoutineListTable />
      </div>
    );
}
