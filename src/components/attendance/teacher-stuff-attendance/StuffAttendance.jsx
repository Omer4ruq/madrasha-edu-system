import { useTranslation } from "react-i18next";
import TodayDate from "../../common/TodayDate";
import TeacherAttendTable from "./TeacherAttendTable";

export default function StuffAttendance() {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-md p-4 md:p-6  my-4">
      <div className="flex justify-between items-end">
        <h3 className="font-medium text-xl text-#DB9E30">
          {t("module.communication.staff_attendance")}
        </h3>

        <TodayDate />
      </div>

      <TeacherAttendTable />
    </div>
  );
}
