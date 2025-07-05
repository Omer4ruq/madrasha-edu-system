import { Navigate, useNavigate } from "react-router-dom";
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
import { useSelector, useDispatch } from 'react-redux';
import { logout } from "../../redux/features/slice/authSlice";

export default function Home() {

  const { user, role, profile } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  console.log(user, role, profile);


  return (
    <div className="space-y-5 mt-4">
      <div className={`${user ? "" : "hidden"}`}>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          স্বাগতম, {user?.name || 'ব্যবহারকারী'}, {user?.user_id}, {role}
        </h2>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-lg transition duration-300 font-semibold shadow-md"
        >
          লগআউট করুন
        </button>
      </div>
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
      {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Events />
        <GenderWise />
      </div>

      {/* expense nad fund info */}
      {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <ExpenseInfo />
        <FundInfo />
      </div> */}

      {/* support token and ads */}
      {/* <SupportToken /> */}
    </div>
  );
}
