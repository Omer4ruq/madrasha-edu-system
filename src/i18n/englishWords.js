import { accountsEn } from "./modules/accounts";
import { communicationEn } from "./modules/communication";
import { dashboardEn } from "./modules/dashboard";
import { examEn } from "./modules/exam";
import { expenseEn } from "./modules/expense";
import { feesEn } from "./modules/fees";
import generalEn from "./modules/generalEn";
import { incomeEn } from "./modules/income";
import { insInfoEn } from "./modules/instituteInfo";
import { payrollEn } from "./modules/payroll";
import { reportEn } from "./modules/report";
import { resultEn } from "./modules/result";
import { routineEn } from "./modules/routine";
import { serviceEn } from "./modules/service";
import { settingsEn } from "./modules/settings";
import { teacherEn } from "./modules/teacher";

const englishWords = {
  general: generalEn,
  module: {
    instituteInfo: insInfoEn,
    dashboard: dashboardEn,
    settings: settingsEn,
    communication: communicationEn,
    teacher: teacherEn,
    exam: examEn,
    result: resultEn,
    routine: routineEn,
    payroll: payrollEn,
    service: serviceEn,
    income: incomeEn,
    expense: expenseEn,
    report: reportEn,
    fees: feesEn,
    accounts: accountsEn
  },
  study_material: {
    add_new_item: "Add New Item",
    title: "Add Downloadable Document",
    title_label: "Title",
    class_label: "Class",
    document_type_label: "Document Type",
    upload_file_label: "Upload File",
    serial: "Serial",
    class: "Class",
    type: "Type",
    file: "File",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
  },
  events: {
    add_new_event: "Add New Event",
    add_event: "Add Event",
    title: "Title",
    start: "Start",
    end: "End",
    edit_event: "Edit Event",
    serial: "Serial",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
  },
  sidebarSingle: {
    profile: "Profiles",
    dashboard: "Dashboard",
    insProfile: "Institute Profile",
    appsAndPages: "Apps & Pages",
    reports: "Reports",
  },
  settings: {
    title: "Settings",
    academicSetup: "Academic Setup",
    classConfig: "Class Config",
    classSubjectAssign: "Class Subject Assign",
    teacherSubjectAssign: "Teacher Subject Assign",
    markConfig: "Mark Config",
    markDivide: "Mark Divide",
    chooseableSubject: "Chooseable Subject",
  },
  communication: {
    title: "Communication",
    generalSms: "General SMS",
    notifications: "Notifications",
    smsTemplate: "SMS Template",
  },
  attendance: {
    title: "Attendance",
    studentAttendance: "Student Attendance",
    teacherAttendance: "Teacher Attendance",
    stuffAttendance: "Stuff Attendance",
    leaveType: "Leave Type",
    leaveRequest: "Leave Request",
    holiday: "Holiday",
  },
  studentInfo: {
    title: "Student Info",
    addStudent: "Add Student",
    studentList: "Student List",
    studentTestimonial: "Student Testimonial",
    studentWaiver: "Student Waiver",
    studentIdCard: "Student ID Card",
    rfidUpdate: "RFID Update",
    studentMigration: "Student Migration",
  },
  stpInfo: {
    parent: "Parent Info",
    teacher: "Teacher Info",
    staff: "Staff Info",
    addParent: "Add Parent",
    parentList: "Parent List",
    addTeacher: "Add Teacher",
    teacherList: "Teacher List",
    teacherIdCard: "Teacher ID Card",
    addStaff: "Add Staff",
    staffList: "Staff List",
    staffIdCard: "Staff ID Card",
  },
  exam: {
    title: "Exam",
    examName: "Exam Name",
    examSyllabus: "Exam Syllabus",
    examSchedule: "Exam Schedule",
    scheduleDownload: "Schedule Download",
    admitCard: "Admit Card",
    seatPlan: "Seat Plan",
    gradeRule: "Grade Rule",
    markBlankSheet: "Mark Blank Sheet",
    examSignatureSheet: "Exam Signature Sheet",
    examFeeSheet: "Exam Fee Sheet",
  },
  result: {
    title: "Result",
    markInput: "Mark Input",
    tabulationSheet: "Tabulation Sheet",
    progressReport: "Progress Report",
    meritList: "Merit List",
  },
  routine: {
    title: "Routine",
    routines: "Routines",
    classRoutine: "Class Routine",
    teacherSchedule: "Teacher Schedule",
  },
  studyMaterial: {
    title: "Study Material",
  },
  event: {
    title: "Event",
    eventList: "Event List",
  },
  fees: {
    title: "Fees",
    feesType: "Fees Type",
    feesAmount: "Fees Amount",
    feesMaster: "Fees Master",
    feesAllocation: "Fees Allocation",
    returnFee: "Return Fee",
    deleteFee: "Delete Fee",
    collection : {
      title: "Fees Collection",
      quickCollection: "Quick Collection",
      classWiseCollection: "Class Wise Collection",
      multiFeeConfig: "Multi Fee Configuration",
    }
  },
  payroll: {
    title: "Payroll",
    addition: "Addition",
    deduction: "Deduction",
    salaryAssign: "Salary Assign",
  },
  services: {
    title: "Services",
    hostel: {
      title: "Hostel",
      hostelPackage: "Hostel Package",
      hostelAllocation: "Hostel Allocation",
    },
    coaching: {
      title: "Coaching",
      coachingPackage: "Coaching Package",
      coachingAllocation: "Coaching Allocation",
    },
    transport: {
      title: "Transport",
      transportPackage: "Transport Package",
      transportAllocation: "Transport Allocation",
    },
  },
  income: {
    title: "Income",
    income: "Income",
    entryDateSearch: "Entry Date Search",
    incomeHead: "Income Head",
  },
  expense: {
    title: "Expense",
    expense: "Expense",
    entryDateSearch: "Entry Date Search",
    expenseHead: "Expense Head",
  },
  withdraw: {
    title: "Withdraw",
    withdraw: "Withdraw",
  },
  accountingReport: {
    title: "Accounting Report",
    accountStatement: "Account Statement",
    dateWiseIncome: "Date Wise Income",
    headWiseIncome: "Head Wise Income",
    dateWiseExpense: "Date Wise Expense",
    headWiseExpense: "Head Wise Expense",
    dateWiseWithdraw: "Date Wise Withdraw",
  },
  feesReport: {
    title: "Fees Report",
    dateWisePaidFee: "Date Wise Paid Fee",
    studentWisePaidFee: "Student Wise Paid Fee",
    dueFee: "Due Fee",
  },
  attendanceReport: {
    title: "Attendance Report",
    studentReport: {
      title: "Student Report",
      monthWiseReport: "Month Wise Report",
      dayViewReport: "Day View Report",
      timeWiseReport: "Time Wise Report",
    },
    teacherReport: {
      title: "Teacher Report",
      monthWiseReport: "Month Wise Report",
      timeWiseReport: "Time Wise Report",
    },
    staffReport: {
      title: "Staff Report",
      monthWiseReport: "Month Wise Report",
      timeWiseReport: "Time Wise Report",
    },
  },
  smsReport: {
    title: "SMS Report",
    purchaseHistory: "Purchase History",
    smsSendSummary: "SMS Send Summary",
    smsDelivery: "SMS Delivery",
  },
  siteSettings: {
    title: "Site Settings",
    banner: "Banner",
    notice: "Notice",
    schoolService: "School Service",
    pageContent: "Page Content",
    pictureGallery: "Picture Gallery",
    videoGallery: "Video Gallery",
    testimonial: "Testimonial",
    contact: "Contact",
  },
};

export default englishWords;
