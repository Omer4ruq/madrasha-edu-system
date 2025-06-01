import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import {
  BalanceSheet, CashBook, CashSummary, CategoryWiseLedger, ContraTransaction, DateWiseLedger, FundsFlow, IncomeStatement, JournalReport, JournalTransaction, LedgerCreate, LedgerSummary, PaymentTransaction, RecieveTransaction, TrialBalance, UserTransaction,
  VoucherDelete, VoucherList
} from "./components/accounts/accounts-index.js";
import Holiday from "./components/attendance/holiday/Holiday";
import LeaveRequest from "./components/attendance/leave-request/LeaveRequest";
import LeaveType from "./components/attendance/leave-type/LeaveType";
import StudentAttendance from "./components/attendance/student-attendance/StudentAttendance";
import StuffAttendance from "./components/attendance/teacher-stuff-attendance/StuffAttendance";
import TeacherAttendance from "./components/attendance/teacher-stuff-attendance/TeacherAttendance";
import GeneralSMS from "./components/communication/general/GeneralSMS";
import Notifications from "./components/communication/notification/Notifications";
import NewSMSTemplate from "./components/communication/template/NewSMSTemplate";
import SMSTemplate from "./components/communication/template/SMSTemplate";
import EventList from "./components/events/event-list/EventList";
import {
  AdmitCard,
  ExamFeeSheet,
  ExamName,
  ExamSchedule,
  ExamSignSheet,
  ExamSyllabus,
  GradeRule,
  MarkBlankSheet,
  ScheduleDownload,
  SeatPlan,
} from "./components/exam/exam-index";
import AddExamRoutine from "./components/exam/exam-schedule/AddExamRoutine";
import {
  AddExpense,
  Expense,
  ExpenseEntryDate,
  ExpenseHead,
} from "./components/expense/expense-index";
import {
  ClassWiseCollection,
  DeleteFee,
  FeesAllocation,
  FeesAmount,
  FeesMaster,
  FeesType,
  MultiFeeConfig,
  QuickCollection,
  ReturnFee
} from "./components/fees/fees-index.js";
import Home from "./components/homePage/Home";
import {
  AddIncome,
  Income,
  IncomeEntryDate,
  IncomeHead,
} from "./components/income/income-index";
import EditInstituteInfo from "./components/instituteProfile/EditInstituteInfo";
import InstituteProfile from "./components/instituteProfile/InstituteProfile";
import Deduction from "./components/payroll/deduction/Deduction";
import { Addition, SalaryAssign } from "./components/payroll/payroll-index";
import {
  AccountingStatement,
  DateWisePaidFee,
  DueFee,
  ExpenseDateWise,
  ExpenseHeadWise,
  IncomeDateWise,
  IncomeHeadWise,
  SmsDelivery,
  SmsPurchaseHistory,
  SmsSendSummary,
  StaMonthReport,
  StaTimeReport,
  StuDateReport,
  StudentWisePaidFee,
  StuMonthReport,
  StuTimeReport,
  TMonthReport,
  TTimeReport,
  WithdrawDateWise,
} from "./components/reports/reports-index";
import {
  MarkInput,
  MeritList,
  ProgressReport,
  TabulationSheet,
} from "./components/result/result-index";
import {
  ClassRoutine,
  CreateRoutine,
  RoutineList,
  TeacherSchedule,
} from "./components/routine/routine-index";
import {
  CoachingAllocation,
  CoachingPackage,
  HostelAllocation,
  HostelPackage,
  TransportAllocation,
  TransportPackage,
} from "./components/services/services-index";
import {
  AcademicSetup,
  ChooseableSubject,
  ClassConfig,
  ClassMarkConfig,
  ClassSubjectAssign,
  MarkConfig,
  MarkDivide,
  SectionConfig,
  SubjectMarkDivide,
  TeacherSubjectAssign,
} from "./components/settings/settings-index.js";
import {
  Banner,
  Contact,
  Notice,
  PageContent,
  PictureGallery,
  SchoolService,
  SSTestimonial,
  VideoGallery,
} from "./components/site-settings/siteSettingsIndex";
import StaffIdCard from "./components/STSP-info/staff-info/staff-id-card/StaffIdCard";
import {
  AddParents,
  AddStaff,
  AddStudent,
  AddTeacher,
  EditParent,
  EditStaff,
  EditStudent,
  EditTeacher,
  ParentsList,
  RfidUpdate,
  StaffList,
  StMigration,
  StudentIdCard,
  StudentList,
  StWaiver,
  TeacherList,
  TesData,
  TesSettings,
  Testimonial,
} from "./components/STSP-info/stsp-index";
import TeacherIdCard from "./components/STSP-info/teacher-info/teacher-id-card/TeacherIdCard";
import StudyMaterial from "./components/study-material/StudyMaterial";
import Dummy from "./components/to-be-deleted (trash templates)/Dummy";
import Test from "./components/to-be-deleted (trash templates)/Test";
import Withdraw from "./components/withdraw/Withdraw";
import {
  getParent,
  getSection,
  getStaff,
  getStudent,
  getTeacher,
} from "./loaders";
import ClassManagement from "./components/ClassManagement/ClassManagement";
import ClassTabs from "./components/ClassManagement/ClassTabs";
import Subjects from "./components/ClassManagement/Subjects";
import ClassTeacher from "./components/ClassManagement/ClassTeacher";
import Marks from "./components/ClassManagement/Marks";
import MarksConfig from "./components/ClassManagement/MarksConfig";
import AddSection from "./components/ClassManagement/AddSection";
import AddClass from "./components/ClassManagement/AddClass";
import AddShift from "./components/ClassManagement/AddShift";
import AddClassConfig from "./components/ClassManagement/AddClassConfig.jsx";
import StudentRegister from "./components/settings/academic-setup/student-register/StudentRegister";
import StuffRegister from "./components/settings/staff-register/StaffRegister";
import AddBehaviorType from "./components/behavior/AddBehaviorType";
import BehaviorMarks from "./components/behavior/BehaviorMarks";
import AddBehaviorMarks from "./components/behavior/AddBehaviorMarks";
import CleanReport from "./components/clean/CleanReport";


function Root() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      errorElement: <Dummy />,
      children: [
        {
          path: "/",
          element: <Home />,
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
                  path: "behavior-type",
                  element: <AddBehaviorType />,
                },
                {
                  path: "leave-type",
                  element: <LeaveType />,
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
          ],
        },
        {
          path: "Talimat",
          children: [
            {
              path: "behavior-marks",
              element: <AddBehaviorMarks />,
            },
            {
              path: "settings",
              children: [
                {
                  path: "behavior-type",
                  element: <AddBehaviorType />,
                },
                {
                  path: "leave-type",
                  element: <LeaveType />,
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}




export default Root;