import { PiDotsThreeCircleFill } from "react-icons/pi";
import StudentAttendance from "../graphs/StudentAttendance";
import TeacherAttendance from "../graphs/TeacherAttendance";
import { useTranslation } from "react-i18next";
export default function AttendanceInfo() {
  const {t} = useTranslation();
  return (
    <div className="bg-white cols-span-1 sm:col-span-2 order-2 sm:order-3 lg:order-2 rounded-md">
      {/* component title */}
      <h3 className="bg-#DB9E30 text-white text-xl p-4 leading-[33px] rounded-t-md shadow-md">
      {t('module.dashboard.attendance_information')}
      </h3>

      {/* graph section */}
      <div className="sm:flex gap-2 p-2 space-y-2 sm:space-y-0">
        {/* students graph */}
        <div className="relative p-2 bg-[#f0f0ff] rounded-md sm:w-1/2">
          <StudentAttendance />

          {/* graph title */}
          <h5 className="text-center text-#DB9E30 text-lg font-medium">
          {t('module.dashboard.students')}
          </h5>

          {/* graph info  */}
          <div className="flex text-center divide-x-2 divide-blue">
            <div className="w-1/2">
              <h5 className="text-green font-medium">{t('module.dashboard.user_type')}</h5>
              <h5 className="text-textBlack font-medium">300</h5>
            </div>
            <div className="w-1/2">
              <h5 className="text-red font-medium">{t('module.dashboard.absent')}</h5>
              <h5 className="text-textBlack font-medium">45</h5>
            </div>
          </div>

          {/* link icon */}
          <PiDotsThreeCircleFill className="absolute top-2 right-2 w-7 h-7 text-#DB9E30" />
        </div>

        {/* Teachers graph */}
        <div className="relative p-2 bg-[#fcf8e8] rounded-md sm:w-1/2">
          <TeacherAttendance />

          {/* graph title */}
          <h5 className="text-center text-#DB9E30 text-lg font-medium ">
          {t('module.dashboard.teachers')}
          </h5>

          {/* graph info  */}
          <div className="flex text-center divide-x-2 divide-yellow">
            <div className="w-1/2">
              <h5 className="text-green font-medium">{t('module.dashboard.present')}</h5>
              <h5 className="text-textBlack font-medium">30</h5>
            </div>
            <div className="w-1/2">
              <h5 className="text-red font-medium">{t('module.dashboard.absent')}</h5>
              <h5 className="text-textBlack font-medium">2</h5>
            </div>
          </div>

          {/* link icon */}
          <PiDotsThreeCircleFill className="absolute top-2 right-2 w-7 h-7 text-#DB9E30" />
        </div>
      </div>
    </div>
  );
}
