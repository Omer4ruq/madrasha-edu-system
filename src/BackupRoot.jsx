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
import StudentRegister from "./components/users/student-register/StudentRegister";
import StuffRegister from "./components/users/staff-register/StaffRegister";
import AddBehaviorType from "./components/behavior/AddBehaviorType";
import BehaviorMarks from "./components/behavior/BehaviorMarks";
import AddBehaviorMarks from "./components/behavior/AddBehaviorMarks";
import CleanReport from "./components/clean/CleanReport";


function BackupRoot() {
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
          path: "class-management",
          element: <ClassManagement />,
          children: [
            {
              index: true, // Default route for /class-management
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
              // element: <ClassConfig />,
              element: <AddClassConfig />,
            },
            {
              path: ":classId",
              element: <ClassTabs />,
              children: [
                {
                  path: "subjects",
                  element: <Subjects />,
                },
                {
                  path: "teachers",
                  element: <ClassTeacher />,
                },
                {
                  path: "marks",
                  element: <Marks />,
                },
                {
                  path: "marks-config",
                  element: <MarksConfig />,
                },
              ],
            },
          ],
        },
        {
          path: "class-management/:classId",
          element: <ClassTabs />,
          children: [
            {
              path: "subjects",
              element: <Subjects />,
            },
            {
              path: "teachers",
              element: <ClassTeacher />,
            },
            {
              path: "marks",
              element: <Marks />,
            },
            {
              path: "marks-config",
              element: <MarksConfig />,
            },
          ],
        },
        {
          path: "settings",
          children: [
            {
              path: "academic-setup",
              element: <AcademicSetup />,
            },
                {
              path: "student-registration",
              element: <StudentRegister></StudentRegister>,
            },
                 {
              path: "stuff-registration",
              element: <StuffRegister></StuffRegister>,
            },
             {
              path: "behavior-type",
              element: <AddBehaviorType />,
            },
              
            {
              path: "class-config",
              element: <ClassConfig />,
            },
            {
              path: "section-config/:id",
              element: <SectionConfig />,
              loader: getSection,
            },
            {
              path: "class-subject-assign",
              element: <ClassSubjectAssign />,
            },
            {
              path: "mark-config",
              element: <MarkConfig />,
            },
            {
              path: "class-mark-config/:id",
              element: <ClassMarkConfig />,
            },
            {
              path: "mark-divide",
              element: <MarkDivide />,
            },
            {
              path: "subject-mark-divide/:id",
              element: <SubjectMarkDivide />,
            },
            {
              path: "teacher-subject-assign",
              element: <TeacherSubjectAssign />,
            },
            {
              path: "chooseable-subject",
              element: <ChooseableSubject />,
            },
          ],
        },
        {
          path: "communication",
          children: [
            {
              path: "general-sms",
              element: <GeneralSMS />,
            },
            {
              path: "notifications",
              element: <Notifications />,
            },
            {
              path: "sms-template",
              element: <SMSTemplate />,
            },
            {
              path: "add-sms-template",
              element: <NewSMSTemplate />,
            },
          ],
        },
        {
          path: "attendance",
          children: [
            {
              path: "student-attendance",
              element: <StudentAttendance />,
            },
            {
              path: "teacher-attendance",
              element: <TeacherAttendance />,
            },
            {
              path: "stuff-attendance",
              element: <StuffAttendance />,
            },
            {
              path: "leave-type",
              element: <LeaveType />,
            },
            {
              path: "leave-request",
              element: <LeaveRequest />,
            },
            {
              path: "holiday",
              element: <Holiday />,
            },
          ],
        },
        {
          path: "student-info",
          children: [
            {
              path: "add-student",
              element: <AddStudent />,
            },
            {
              path: "student-list",
              element: <StudentList />,
            },
            {
              path: "edit-student/:id",
              element: <EditStudent />,
              loader: getStudent,
            },
            {
              path: "student-testimonial",
              element: <Testimonial />,
            },
            {
              path: "testimonial-settings",
              element: <TesSettings />,
            },
            {
              path: "testimonial-data/:id",
              element: <TesData />,
              loader: getStudent,
            },
            {
              path: "student-waiver",
              element: <StWaiver />,
            },
            {
              path: "student-id-card",
              element: <StudentIdCard />,
            },
            {
              path: "student-migration",
              element: <StMigration />,
            },
               
            {
              path: "rfid-update",
              element: <RfidUpdate />,
            },
          ],
        },
        {
          path: "parent-info",
          children: [
            {
              path: "add-parent",
              element: <AddParents />,
            },
            {
              path: "parent-list",
              element: <ParentsList />,
            },
            {
              path: "edit-parent/:id",
              element: <EditParent />,
              loader: getParent,
            },
          ],
        },
        {
          path: "teacher-info",
          children: [
            {
              path: "add-teacher",
              element: <AddTeacher />,
            },
            {
              path: "teacher-list",
              element: <TeacherList />,
            },
            {
              path: "teacher-id-card",
              element: <TeacherIdCard />,
            },
            {
              path: "edit-teacher/:id",
              element: <EditTeacher />,
              loader: getTeacher,
            },
          ],
        },
        {
          path: "staff-info",
          children: [
            {
              path: "add-staff",
              element: <AddStaff />,
            },
            {
              path: "staff-list",
              element: <StaffList />,
            },
            {
              path: "staff-id-card",
              element: <StaffIdCard />,
            },
            {
              path: "edit-staff/:id",
              element: <EditStaff />,
              loader: getStaff,
            },
          ],
        },
        {
          path: "routine",
          children: [
            {
              path: "routine-list",
              element: <RoutineList />,
            },
            {
              path: "create-routine",
              element: <CreateRoutine />,
            },
            {
              path: "class-routine",
              element: <ClassRoutine />,
            },
            {
              path: "teacher-schedule",
              element: <TeacherSchedule />,
            },
          ],
        },
        {
          path: "exam",
          children: [
            {
              path: "exam-name",
              element: <ExamName />,
            },
            {
              path: "exam-syllabus",
              element: <ExamSyllabus />,
            },
            {
              path: "exam-schedule",
              element: <ExamSchedule />,
            },
            {
              path: "add-exam-routine/:id",
              element: <AddExamRoutine />,
            },
            {
              path: "schedule-download",
              element: <ScheduleDownload />,
            },
            {
              path: "admit-card",
              element: <AdmitCard />,
            },
            {
              path: "seat-plan",
              element: <SeatPlan />,
            },
            {
              path: "grade-rule",
              element: <GradeRule />,
            },
            {
              path: "mark-blank-sheet",
              element: <MarkBlankSheet />,
            },
            {
              path: "exam-signature-sheet",
              element: <ExamSignSheet />,
            },
            {
              path: "exam-fee-sheet",
              element: <ExamFeeSheet />,
            },
          ],
        },
        {
          path: "result",
          children: [
            {
              path: "mark-input",
              element: <MarkInput />,
            },
            {
              path: "tabulation-sheet",
              element: <TabulationSheet />,
            },
            {
              path: "progress-report",
              element: <ProgressReport />,
            },
            {
              path: "merit-list",
              element: <MeritList />,
            },
          ],
        },
        {
          path: "study-material",
          element: <StudyMaterial />,
        },
        {
          path: "event",
          children: [
            {
              path: "event-list",
              element: <EventList />,
            },
          ],
        },
        {
          path: "fees",
          children: [
            {
              path: "fees-type",
              element: <FeesType />,
            },
            {
              path: "fees-amount",
              element: <FeesAmount />,
            },
            {
              path: "fees-master",
              element: <FeesMaster />,
            },
            {
              path: "fees-allocation",
              element: <FeesAllocation />,
            },
            {
              path: "delete-fee",
              element: <DeleteFee />,
            },
            {
              path: "return-fee",
              element: <ReturnFee />,
            },
            {
              path: "collection/quick-collection/",
              element: <QuickCollection />,
            },
            {
              path: "collection/class-wise-collection/",
              element: <ClassWiseCollection />,
            },
            {
              path: "collection/mult-fee-configuration/",
              element: <MultiFeeConfig />,
            },
          ],
        },
        {
          path: "payroll",
          children: [
            {
              path: "addition",
              element: <Addition />,
            },
            {
              path: "deduction",
              element: <Deduction />,
            },
            {
              path: "salary-assign",
              element: <SalaryAssign />,
            },
          ],
        },
        {
          path: "services",
          children: [
            {
              path: "hostel",
              children: [
                {
                  path: "hostel-package",
                  element: <HostelPackage />,
                },
                {
                  path: "hostel-allocation",
                  element: <HostelAllocation />,
                },
              ],
            },
            {
              path: "coaching",
              children: [
                {
                  path: "coaching-package",
                  element: <CoachingPackage />,
                },
                {
                  path: "coaching-allocation",
                  element: <CoachingAllocation />,
                },
              ],
            },
            {
              path: "transport",
              children: [
                {
                  path: "transport-package",
                  element: <TransportPackage />,
                },
                {
                  path: "transport-allocation",
                  element: <TransportAllocation />,
                },
              ],
            },
          ],
        },
        {
          path: "income",
          children: [
            {
              path: "income",
              element: <Income />,
            },
            {
              path: "add-income",
              element: <AddIncome />,
            },
            {
              path: "entry-date-search",
              element: <IncomeEntryDate />,
            },
            {
              path: "income-head",
              element: <IncomeHead />,
            },
          ],
        },
        {
          path: "expense",
          children: [
            {
              path: "expense",
              element: <Expense />,
            },
            {
              path: "add-expense",
              element: <AddExpense />,
            },
            {
              path: "entry-date-search",
              element: <ExpenseEntryDate />,
            },
            {
              path: "expense-head",
              element: <ExpenseHead />,
            },
          ],
        },
        {
          path: "withdraw",
          children: [
            {
              path: "withdraw",
              element: <Withdraw />,
            },
          ],
        },
        {
          path: "accounts",
          children: [
            {
              path: "ledger-create",
              element: <LedgerCreate />,
            },
            {
              path: "transaction-recieve",
              element: <RecieveTransaction />,
            },
            {
              path: "transaction-payment",
              element: <PaymentTransaction />,
            },
            {
              path: "transaction-contra",
              element: <ContraTransaction />,
            },
            {
              path: "transaction-journal",
              element: <JournalTransaction />,
            },
            {
              path: "cash-summary",
              element: <CashSummary />,
            },
            {
              path: "trial-balance",
              element: <TrialBalance />,
            },
            {
              path: "balance-sheet",
              element: <BalanceSheet />,
            },
            {
              path: "income-statement",
              element: <IncomeStatement />,
            },
            {
              path: "voucher-list",
              element: <VoucherList />,
            },
            {
              path: "funds-flow",
              element: <FundsFlow />,
            },
            {
              path: "journal-report-list",
              element: <JournalReport />,
            },
            {
              path: "cash-book",
              element: <CashBook />,
            },
            {
              path: "date-wise-ledger",
              element: <DateWiseLedger />,
            },
            {
              path: "ledger-summary",
              element: <LedgerSummary />,
            },
            {
              path: "category-wise-summary",
              element: <CategoryWiseLedger />,
            },
            {
              path: "user-wise-summary",
              element: <UserTransaction />,
            },
            {
              path: "voucher-delete",
              element: <VoucherDelete />,
            },
          ],
        },
        {
          path: "accounting-report",
          children: [
            {
              path: "account-statement",
              element: <AccountingStatement />,
            },
            {
              path: "date-wise-income",
              element: <IncomeDateWise />,
            },
            {
              path: "head-wise-income",
              element: <IncomeHeadWise />,
            },
            {
              path: "date-wise-expense",
              element: <ExpenseDateWise />,
            },
            {
              path: "head-wise-expense",
              element: <ExpenseHeadWise />,
            },
            {
              path: "date-wise-withdraw",
              element: <WithdrawDateWise />,
            },
          ],
        },
        {
          path: "fees-report",
          children: [
            {
              path: "date-wise-paid-fee",
              element: <DateWisePaidFee />,
            },
            {
              path: "student-wise-paid-fee",
              element: <StudentWisePaidFee />,
            },
            {
              path: "due-fee",
              element: <DueFee />,
            },
          ],
        },
        {
          path: "attendance-report",
          children: [
            {
              path: "student-report",
              children: [
                {
                  path: "month-wise-report",
                  element: <StuMonthReport />,
                },
                {
                  path: "day-wise-report",
                  element: <StuDateReport />,
                },
                {
                  path: "time-wise-report",
                  element: <StuTimeReport />,
                },
              ],
            },
            {
              path: "teacher-report",
              children: [
                {
                  path: "month-wise-report",
                  element: <TMonthReport />,
                },
                {
                  path: "time-wise-report",
                  element: <TTimeReport />,
                },
              ],
            },
            {
              path: "staff-report",
              children: [
                {
                  path: "month-wise-report",
                  element: <StaMonthReport />,
                },
                {
                  path: "time-wise-report",
                  element: <StaTimeReport />,
                },
              ],
            },
          ],
        },
        {
          path: "sms-report",
          children: [
            {
              path: "purchase-history",
              element: <SmsPurchaseHistory />,
            },
            {
              path: "sms-send-summary",
              element: <SmsSendSummary />,
            },
            {
              path: "sms-delivery",
              element: <SmsDelivery />,
            },
          ],
        },
        {
          path: "site-settings",
          children: [
            {
              path: "banner",
              element: <Banner />,
            },
            {
              path: "notice",
              element: <Notice />,
            },
            {
              path: "school-service",
              element: <SchoolService />,
            },
            {
              path: "page-content",
              element: <PageContent />,
            },
            {
              path: "picture-gallery",
              element: <PictureGallery />,
            },
            {
              path: "video-gallery",
              element: <VideoGallery />,
            },
            {
              path: "testimonial",
              element: <SSTestimonial />,
            },
            {
              path: "contact",
              element: <Contact />,
            },
          ],
        },
       {
          path: "darul-iqam",
          element: <AddBehaviorType />, 
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
              // element: <BehaviorMarks />,
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
        {
          path: "test",
          element: <Test />,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default BackupRoot;