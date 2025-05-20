import AttendanceInfo from "./mainComponents/AttendanceInfo";
import ClassRoutine from "./mainComponents/ClassRoutine";
import Events from "./mainComponents/Events";
import ExpenseInfo from "./mainComponents/ExpenseInfo";
import FeeInfo from "./mainComponents/FeeInfo";
import FundInfo from "./mainComponents/FundInfo";
import GenderWise from "./mainComponents/GenderWise";
import LeaveAndSmsInfo from "./mainComponents/LeaveAndSmsInfo";
import Notices from "./mainComponents/Notices";
import Overview from "./mainComponents/Overview";
import PaymentStat from "./mainComponents/PaymentStat";
import ProfileInfo from "./mainComponents/ProfileInfo";
import SearchPayslip from "./mainComponents/SearchPayslip";
import SupportToken from "./mainComponents/SupportToken";

export default function Home() {
  return (
    <div className="space-y-5 mt-4">
      <Overview />
      {/* profile info, attendace info, notices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProfileInfo />
        <AttendanceInfo />
        <Notices />
      </div>

      {/* Fees Info and Payment Statistics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <FeeInfo />
        <PaymentStat />
      </div>

      {/* Leave Info and SMS Info */}
      <LeaveAndSmsInfo />

      {/* payslip and routine */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <SearchPayslip />
        <ClassRoutine />
      </div>

      {/* Events and gender wise teacher and student info */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Events />
        <GenderWise />
      </div>

      {/* expense nad fund info */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <ExpenseInfo />
        <FundInfo />
      </div>

      {/* support token and ads */}
      <SupportToken />
    </div> 
  );
}
