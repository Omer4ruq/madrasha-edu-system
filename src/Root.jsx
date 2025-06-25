import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import LeaveType from "./components/attendance/leave-type/LeaveType";
import Home from "./components/homePage/Home";
import EditInstituteInfo from "./components/instituteProfile/EditInstituteInfo";
import InstituteProfile from "./components/instituteProfile/InstituteProfile";
import Dummy from "./components/to-be-deleted (trash templates)/Dummy";
import ClassManagement from "./components/ClassManagement/ClassManagement";
import AddSection from "./components/ClassManagement/AddSection";
import AddClass from "./components/ClassManagement/AddClass";
import AddShift from "./components/ClassManagement/AddShift";
import AddClassConfig from "./components/ClassManagement/AddClassConfig.jsx";
import AddBehaviorType from "./components/behavior/AddBehaviorType";
import AddBehaviorMarks from "./components/behavior/AddBehaviorMarks";
import CleanReport from "./components/clean/CleanReport";
import AddExamTypes from "./components/exam/examType/AddExamTypes";
import AddMealsType from "./components/meals/AddMealsType";
import AddLeaveType from "./components/leave/AddLeaveType";
import AddLeaveRequest from "./components/leave/AddLeaveRequest";
import PerformanceType from "./components/performance/PerformanceType";
import TeacherPerformance from "./components/performance/TeacherPerformance";
import StaffRegistrationForm from "./components/users/staff-register/StaffRegistrationForm";
import StudentRegistrationForm from "./components/users/student-register/StudentRegistrationForm";
import AddFundsType from "./components/funds/AddFundsType";
import IncomeHead from "./components/income/IncomeHead";
import AddWaivers from "./components/waivers/AddWaivers";
import AddFeeHead from "./components/fees/AddFeeHead";
import IncomeItems from "./components/income/IncomeItems";
import ExpenseHead from "./components/expense/ExpenseHead";
import ExpenseItems from "./components/expense/ExpenseItems";
import StudentList from "./components/users/student-list/StudentList";
import StaffList from "./components/users/staff-list/StaffList";
import AddFeePackages from "./components/fees/AddFeePackages";
import AddFeesName from "./components/fees/AddFeesName";
import CurrentFees from "./components/fees/CurrentFees";
import DeleteStudentFees from "./components/fees/DeleteStudentFees";
import StudentAttendance from "./components/student-attendance/StudentAttendance";
import PreviousFees from "./components/fees/PreviousFees";
import MealItems from "./components/meals/MealItems";
import MealSetup from "./components/meals/MealSetup";
import MealStatus from "./components/meals/MealStatus";
import ClassSubject from "./components/SubjectManagement/ClassSubject";

import SentSms from "./components/Communication2/General-SMS/SendSms";
import SmsTemplate from "./components/Communication2/General-SMS/SmsTemplate";
import SentNotificationSMS from "./components/Communication2/Notification-SMS/SentNotificationSMS";
import SmsNotificationTemplate from "./components/Communication2/Notification-SMS/SmsNotificationTemplate";
import SubjectMarkConfigs from "./components/marks/SubjectMarkConfigs";
import SubjectMarks from "./components/marks/SubjectMarks";
import AttendanceSheet from "./components/layout/AttendanceSheet";
import ClassPeriodSetup from "./components/periods/ClassPeriodSetup";
import AdmitCard from "./components/admit-card/AdmitCard";
import SeatPlan from "./components/seat-plan/SeatPlan";
import TeacherSubjectAssign from "./components/teachers/TeacherSubjectAssign";
import SignatureSheet from "./components/signature-sheet/SignatureSheet";
import Event from "./components/event/Event";
import AddEvent from "./components/event/AddEvent";


function Root() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      errorElement: <Dummy />,
      children: [
        {
          path: "/",
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: "dashboard",
          element: <Home />,
        },
        {
          path: "institute-profile",
          element: <InstituteProfile />,
        },
        {
          path: "institute-profile/edit-info",
          element: <EditInstituteInfo />,
        },
        {
          path: "darul-iqam",
          children: [
            {
              path: "settings",
              children: [
                {
                  index: true,
                  element: <AddBehaviorType />,
                },
                {
                  path: "leave-type",
                  element: <AddLeaveType />,
                },

                {
                  path: "performance-type",
                  element: <PerformanceType />,
                },
                {
                  path: "performance-type",
                  element: <PerformanceType />,
                },
                {
                  path: "*",
                  element: <Navigate to="/darul-iqam/settings" replace />,
                },
              ],
            },
            {
              path: "behavior-marks",
              element: <AddBehaviorMarks />,
            },
            {
              path: "clean-report",
              element: <CleanReport />,
            },
            {
              path: "leave-request",
              element: <AddLeaveRequest />,
            },
            {
              path: "teacher-performance",
              element: <TeacherPerformance></TeacherPerformance>,
            },
            {
              path: "student-attendance",
              element: <StudentAttendance></StudentAttendance>,
            },
          ],
        },
        {
          path: "talimat",
          children: [
            {
              path: "settings",
              element: <ClassManagement />,
              children: [
                {
                  index: true,
                  element: <AddClass />,
                },
                {
                  path: "add-section",
                  element: <AddSection />,
                },
                {
                  path: "add-shift",
                  element: <AddShift />,
                },
                {
                  path: "add-config",
                  element: <AddClassConfig />,
                },
                {
                  path: "exam-type",
                  element: <AddExamTypes />,
                },
                {
                  path: "event-type",
                  element: <AddEvent />,
                },
              ],
            },
            {
              path: "class-subject",
              children: [
                {
                  index: true,
                  element: <ClassSubject />,
                },
              ],
            },
            {
              path: "marks-config",
              children: [
                {
                  index: true,
                  element: <SubjectMarkConfigs />,
                },
              ],
            },
            {
              path: "admit-card",
              element: <AdmitCard></AdmitCard>,
            },
            {
              path: "seat-plan",
              element: <SeatPlan></SeatPlan>,
            },
            {
              path: "marks-given",
              children: [
                {
                  index: true,
                  element: <SubjectMarks />,
                },
              ],
            },
            {
              path: "periods",
              children: [
                {
                  index: true,
                  element: <ClassPeriodSetup />,
                },
              ],
            },
            {
              path: "teacher-subject-assign",
              children: [
                {
                  index: true,
                  element: <TeacherSubjectAssign />,
                },
              ],
            },
             {
              path: "signature-sheet",
              element: <SignatureSheet></SignatureSheet>,
            },
             {
              path: "event",
              element: <Event></Event>,
            },
          ],
        },
        {
          path: "accounts",
          children: [
            {
              path: "settings",
              children: [
                {
                  index: true,
                  element: <AddFundsType />,
                },
                {
                  path: "income-heads",
                  element: <IncomeHead></IncomeHead>,
                },
                {
                  path: "expense-heads",
                  element: <ExpenseHead />,
                },
                {
                  path: "fee-heads",
                  element: <AddFeeHead />,
                },
              ],
            },
            {
              path: "waivers",
              element: <AddWaivers></AddWaivers>,
            },
            {
              path: "income-list",
              element: <IncomeItems />,
            },

            {
              path: "expense-list",
              element: <ExpenseItems />,
            },
            {
              path: "fee-packages",
              element: <AddFeePackages />,
            },
            {
              path: "fee-name",
              element: <AddFeesName />,
            },
            {
              path: "current-fee",
              element: <CurrentFees />,
            },
            {
              path: "previous-fee",
              element: <PreviousFees />,
            },
            {
              path: "delete-fee",
              element: <DeleteStudentFees />,
            },
          ],
        },
        {
          path: "boarding",
          children: [
            {
              path: "settings",
              children: [
                {
                  index: true,
                  element: <AddMealsType />,
                },
                {
                  path: "meal-type",
                  element: <AddMealsType />,
                },
                {
                  path: "meal-items",
                  element: <MealItems />,
                },
                {
                  path: "meal-setup",
                  element: <MealSetup />,
                },
                {
                  path: "meal-status",
                  element: <MealStatus />,
                },
              ],
            },
          ],
        },
        {
          path: "users",
          children: [
            {
              path: "student",
              children: [
                {
                  index: true,
                  element: <StudentRegistrationForm />,
                },
                {
                  path: "student-list",
                  element: <StudentList />,
                },
              ],
            },
            {
              path: "staff",
              children: [
                {
                  index: true,
                  element: <StaffRegistrationForm />,
                },
                {
                  path: "staff-list",
                  element: <StaffList />,
                },
              ],
            },
          ],
        },
        {
          path: "communication",
          children: [
            {
              path: "general-sms",
              children: [
                {
                  index: true,
                  element: <SentSms />,
                },
                {
                  path: "sms-template",
                  element: <SmsTemplate />,
                },
              ],
            },
            {
              path: "notification-sms",
              children: [
                {
                  index: true,
                  element: <SentNotificationSMS />,
                },
                {
                  path: "sms-notification-template",
                  element: <SmsNotificationTemplate />,
                },
              ],
            },
          ],
        },
        {
          path: "layout",
          children: [
            {
              path: "attendance-sheet",
              element: <AttendanceSheet />,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default Root;
