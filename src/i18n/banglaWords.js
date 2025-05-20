import { accountsBn } from "./modules/accounts";
import { communicationBn } from "./modules/communication";
import { dashboardBn } from "./modules/dashboard";
import { examBn } from "./modules/exam";
import { expenseBn } from "./modules/expense";
import { feesBn } from "./modules/fees";
import generalBn from "./modules/generalBn";
import { incomeBn } from "./modules/income";
import { insInfoBn } from "./modules/instituteInfo";
import { payrollBn } from "./modules/payroll";
import { reportBn } from "./modules/report";
import { resultBn } from "./modules/result";
import { routineBn } from "./modules/routine";
import { serviceBn } from "./modules/service";
import { settingsBn } from "./modules/settings";
import { teacherBn } from "./modules/teacher";

const banglaWords = {
  general: generalBn,
  module: {
    instituteInfo: insInfoBn,
    dashboard: dashboardBn,
    settings: settingsBn,
    communication: communicationBn,
    teacher: teacherBn,
    exam: examBn,
    result: resultBn,
    routine: routineBn,
    payroll: payrollBn,
    service: serviceBn,
    income: incomeBn,
    expense: expenseBn,
    report: reportBn,
    fees: feesBn,
    accounts: accountsBn
  },
  study_material: {
    add_new_item: "নতুন আইটেম যোগ করুন",
    title: "ডাউনলোডযোগ্য নথি যোগ করুন",
    title_label: "শিরোনাম",
    class_label: "ক্লাস",
    document_type_label: "নথির প্রকার",
    upload_file_label: "ফাইল আপলোড করুন",
    serial: "ক্রমিক",
    class: "ক্লাস",
    type: "প্রকার",
    file: "ফাইল",
    actions: "ক্রিয়াকলাপ",
    edit: "সম্পাদনা করুন",
    delete: "মুছুন",
  },
  events: {
    add_new_event: "নতুন ইভেন্ট যোগ করুন",
    add_event: "ইভেন্ট যোগ করুন",
    title: "শিরোনাম",
    start: "শুরুর সময়",
    end: "শেষের সময়",
    edit_event: "ইভেন্ট সম্পাদনা করুন",
    serial: "ক্রমিক",
    edit: "সম্পাদনা",
    delete: "মুছুন",
    actions: "ক্রিয়াকলাপ",
  },
  sidebarSingle: {
    dashboard: "ড্যাশবোর্ড",
    profile: "প্রোফাইল",
    insProfile: "প্রতিষ্ঠানের তথ্য",
    appsAndPages: "অ্যাপস এবং পেজ",
    reports: "রিপোর্ট",
  },
  settings: {
    title: "সেটিংস",
    academicSetup: "একাডেমিক সেটআপ",
    classConfig: "ক্লাস কনফিগারেশন",
    classSubjectAssign: "ক্লাস বিষয় বরাদ্দ",
    teacherSubjectAssign: "শিক্ষক বিষয় বরাদ্দ",
    markConfig: "মার্ক কনফিগারেশন",
    markDivide: "মার্ক বিভাজন",
    chooseableSubject: "পছন্দনীয় বিষয়",
  },
  communication: {
    title: "যোগাযোগ",
    generalSms: "সাধারণ এসএমএস",
    notifications: "বিজ্ঞপ্তি",
    smsTemplate: "এসএমএস টেমপ্লেট",
  },
  attendance: {
    title: "উপস্থিতি",
    studentAttendance: "ছাত্র উপস্থিতি",
    teacherAttendance: "শিক্ষক উপস্থিতি",
    stuffAttendance: "স্টাফ উপস্থিতি",
    leaveType: "ছুটির ধরন",
    leaveRequest: "ছুটির অনুরোধ",
    holiday: "ছুটি",
  },
  studentInfo: {
    title: "ছাত্র তথ্য",
    addStudent: "ছাত্র যোগ করুন",
    studentList: "ছাত্র তালিকা",
    studentTestimonial: "ছাত্র প্রশংসাপত্র",
    studentWaiver: "ছাত্র মওকুফ",
    studentIdCard: "ছাত্র আইডি কার্ড",
    rfidUpdate: "RFID আপডেট",
    studentMigration: "ছাত্র স্থানান্তর",
  },
  stpInfo: {
    parent: "অভিভাবক তথ্য",
    teacher: "শিক্ষক তথ্য",
    staff: "স্টাফ তথ্য",
    addParent: "অভিভাবক যোগ করুন",
    parentList: "অভিভাবক তালিকা",
    addTeacher: "শিক্ষক যোগ করুন",
    teacherList: "শিক্ষক তালিকা",
    teacherIdCard: "শিক্ষক আইডি কার্ড",
    addStaff: "স্টাফ যোগ করুন",
    staffList: "স্টাফ তালিকা",
    staffIdCard: "স্টাফ আইডি কার্ড",
  },
  exam: {
    title: "পরীক্ষা",
    examName: "পরীক্ষার নাম",
    examSyllabus: "পরীক্ষার সিলেবাস",
    examSchedule: "পরীক্ষার সময়সূচী",
    scheduleDownload: "সময়সূচী ডাউনলোড",
    admitCard: "অ্যাডমিট কার্ড",
    seatPlan: "আসন পরিকল্পনা",
    gradeRule: "গ্রেড নিয়ম",
    markBlankSheet: "মার্ক ফাঁকা শীট",
    examSignatureSheet: "পরীক্ষার স্বাক্ষর শীট",
    examFeeSheet: "পরীক্ষার ফি শীট",
  },
  result: {
    title: "ফলাফল",
    markInput: "মার্ক ইনপুট",
    tabulationSheet: "ট্যাবুলেশন শীট",
    progressReport: "প্রগতি প্রতিবেদন",
    meritList: "মেধা তালিকা",
  },
  routine: {
    title: "রুটিন",
    routines: "রুটিনসমূহ",
    classRoutine: "ক্লাস রুটিন",
    teacherSchedule: "শিক্ষক সময়সূচী",
  },
  studyMaterial: {
    title: "পাঠ্য সামগ্রী",
  },
  event: {
    title: "ইভেন্ট",
    eventList: "ইভেন্ট তালিকা",
  },
  fees: {
    title: "ফি",
    feesType: "ফি প্রকার",
    feesAmount: "ফি পরিমাণ",
    feesMaster: "ফি মাস্টার",
    feesAllocation: "ফি বরাদ্দ",
    returnFee: "ফি ফেরত",
    deleteFee: "ফি মুছুন",
    collection: {
      title: "ফি সংযোজন",
      quickCollection: "ফি সংযোজন",
      classWiseCollection: "ক্লাস ফি সংযোজন",
      multiFeeConfig: "মাল্টি ফি কনফিগ"
    },
  },
  payroll: {
    title: "বেতন",
    addition: "বেতন সংযোজন",
    deduction: "বেতন কর্তন",
    salaryAssign: "বেতন বরাদ্দ",
  },
  services: {
    title: "সেবা",
    hostel: {
      title: "হোস্টেল",
      hostelPackage: "হোস্টেল প্যাকেজ",
      hostelAllocation: "হোস্টেল বরাদ্দ",
    },
    coaching: {
      title: "কোচিং",
      coachingPackage: "কোচিং প্যাকেজ",
      coachingAllocation: "কোচিং বরাদ্দ",
    },
    transport: {
      title: "পরিবহন",
      transportPackage: "পরিবহন প্যাকেজ",
      transportAllocation: "পরিবহন বরাদ্দ",
    },
  },
  income: {
    title: "আয়",
    income: "আয়",
    entryDateSearch: "এন্ট্রি তারিখ অনুসন্ধান",
    incomeHead: "আয় শিরোনাম",
  },
  expense: {
    title: "ব্যয়",
    expense: "ব্যয়",
    entryDateSearch: "এন্ট্রি তারিখ অনুসন্ধান",
    expenseHead: "ব্যয় শিরোনাম",
  },
  withdraw: {
    title: "প্রত্যাহার",
    withdraw: "প্রত্যাহার",
  },
  accountingReport: {
    title: "হিসাব রিপোর্ট",
    accountStatement: "অ্যাকাউন্ট বিবৃতি",
    dateWiseIncome: "তারিখ অনুযায়ী আয়",
    headWiseIncome: "শিরোনাম অনুযায়ী আয়",
    dateWiseExpense: "তারিখ অনুযায়ী ব্যয়",
    headWiseExpense: "শিরোনাম অনুযায়ী ব্যয়",
    dateWiseWithdraw: "তারিখ অনুযায়ী প্রত্যাহার",
  },
  feesReport: {
    title: "ফি রিপোর্ট",
    dateWisePaidFee: "তারিখ অনুযায়ী প্রদত্ত ফি",
    studentWisePaidFee: "ছাত্র অনুযায়ী প্রদত্ত ফি",
    dueFee: "বকেয়া ফি",
  },
  attendanceReport: {
    title: "উপস্থিতি রিপোর্ট",
    studentReport: {
      title: "ছাত্র রিপোর্ট",
      monthWiseReport: "মাস ভিত্তিক রিপোর্ট",
      dayViewReport: "দিনের ভিউ রিপোর্ট",
      timeWiseReport: "সময় ভিত্তিক রিপোর্ট",
    },
    teacherReport: {
      title: "শিক্ষক রিপোর্ট",
      monthWiseReport: "মাস ভিত্তিক রিপোর্ট",
      timeWiseReport: "সময় ভিত্তিক রিপোর্ট",
    },
    staffReport: {
      title: "স্টাফ রিপোর্ট",
      monthWiseReport: "মাস ভিত্তিক রিপোর্ট",
      timeWiseReport: "সময় ভিত্তিক রিপোর্ট",
    },
  },
  smsReport: {
    title: "এসএমএস রিপোর্ট",
    purchaseHistory: "ক্রয় ইতিহাস",
    smsSendSummary: "এসএমএস পাঠানোর সারাংশ",
    smsDelivery: "এসএমএস ডেলিভারি",
  },
  siteSettings: {
    title: "সাইট সেটিংস",
    banner: "ব্যানার",
    notice: "নোটিশ",
    schoolService: "স্কুল সার্ভিস",
    pageContent: "পৃষ্ঠার বিষয়বস্তু",
    pictureGallery: "ছবির গ্যালারি",
    videoGallery: "ভিডিও গ্যালারি",
    testimonial: "প্রশংসাপত্র",
    contact: "যোগাযোগ",
  },
};

export default banglaWords;
