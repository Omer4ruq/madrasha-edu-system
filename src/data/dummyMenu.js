const dummyMenu = [
   {
     id: "01",
     title: "sidebarSingle.profile",
     icon: false,
   },
   {
     id: "02",
     title: "sidebarSingle.dashboard",
     icon: "RiDashboardHorizontalFill",
     link: "/dashboard",
   },
   {
     id: "03",
     title: "sidebarSingle.insProfile",
     icon: "HiOutlineBuildingStorefront",
     link: "/institute-profile",
   },
   {
     id: "04",
     title: "sidebarSingle.appsAndPages",
     icon: false,
   },  
   {
     id: "05",
     title: "settings.title",
     icon: "IoMdSettings",
     children: [
       {
         id: "05/01",
         title: "settings.academicSetup",
         link: "settings/academic-setup",
       },
       {
         id: "05/02",
         title: "settings.classConfig",
         link: "settings/class-config",
       },
       {
         id: "05/03",
         title: "settings.classSubjectAssign",
         link: "settings/class-subject-assign",
       },
       {
         id: "05/04",
         title: "settings.teacherSubjectAssign",
         link: "settings/teacher-subject-assign",
       },
       {
         id: "05/05",
         title: "settings.markConfig",
         link: "settings/mark-config",
       },
       {
         id: "05/06",
         title: "settings.markDivide",
         link: "settings/mark-divide",
       },
       {
         id: "05/07",
         title: "settings.chooseableSubject",
         link: "settings/chooseable-subject",
       },
     ],
   },  
   {
     "id": "06",
     "title": "communication.title",
     "icon": "LiaSmsSolid",
     "children": [
       {
         "id": "06/01",
         "title": "communication.generalSms",
         "link": "communication/general-sms"
       },
       {
         "id": "06/02",
         "title": "communication.notifications",
         "link": "communication/notifications"
       },
       {
         "id": "06/03",
         "title": "communication.smsTemplate",
         "link": "communication/sms-template"
       }
     ]
   },  
   {
     id: "07",
     title: "attendance.title",
     icon: "FaRegCheckSquare",
     children: [
       {
         id: "07/01",
         title: "attendance.studentAttendance",
         link: "attendance/student-attendance",
       },
       {
         id: "07/02",
         title: "attendance.teacherAttendance",
         link: "attendance/teacher-attendance",
       },
       {
         id: "07/03",
         title: "attendance.stuffAttendance",
         link: "attendance/stuff-attendance",
       },
       {
         id: "07/04",
         title: "attendance.leaveType",
         link: "attendance/leave-type",
       },
       {
         id: "07/05",
         title: "attendance.leaveRequest",
         link: "attendance/leave-request",
       },
       {
         id: "07/06",
         title: "attendance.holiday",
         link: "attendance/holiday",
       },
     ],
   },
   {
     id: "08",
     title: "studentInfo.title",
     icon: "PiStudentBold",
     children: [
       {
         id: "08/01",
         title: "studentInfo.addStudent",
         link: "student-info/add-student",
       },
       {
         id: "08/02",
         title: "studentInfo.studentList",
         link: "student-info/student-list",
       },
       {
         id: "08/03",
         title: "studentInfo.studentTestimonial",
         link: "student-info/student-testimonial",
       },
       {
         id: "08/04",
         title: "studentInfo.studentWaiver",
         link: "student-info/student-waiver",
       },
       {
         id: "08/05",
         title: "studentInfo.studentIdCard",
         link: "student-info/student-id-card",
       },
       {
         id: "08/06",
         title: "studentInfo.rfidUpdate",
         link: "student-info/rfid-update",
       },
       {
         id: "08/07",
         title: "studentInfo.studentMigration",
         link: "student-info/student-migration",
       },
     ],
   },
   {
       "id": "09",
       "title": "stpInfo.parent",
       "icon": "RiParentFill",
       "children": [
         {
           "id": "09/01",
           "title": "stpInfo.addParent",
           "link": "parent-info/add-parent"
         },
         {
           "id": "09/02",
           "title": "stpInfo.parentList",
           "link": "parent-info/parent-list"
         }
       ]
     },
     {
       "id": "10",
       "title": "stpInfo.teacher",
       "icon": "PiChalkboardTeacherFill",
       "children": [
         {
           "id": "10/01",
           "title": "stpInfo.addTeacher",
           "link": "teacher-info/add-teacher"
         },
         {
           "id": "10/02",
           "title": "stpInfo.teacherList",
           "link": "teacher-info/teacher-list"
         },
         {
           "id": "10/03",
           "title": "stpInfo.teacherIdCard",
           "link": "teacher-info/teacher-id-card"
         }
       ]
     },
     {
       "id": "11",
       "title": "stpInfo.staff",
       "icon": "FaPeopleGroup",
       "children": [
         {
           "id": "11/01",
           "title": "stpInfo.addStaff",
           "link": "staff-info/add-staff"
         },
         {
           "id": "11/02",
           "title": "stpInfo.staffList",
           "link": "staff-info/staff-list"
         },
         {
           "id": "11/03",
           "title": "stpInfo.staffIdCard",
           "link": "staff-info/staff-id-card"
         }
       ]
     }
   ,
   {
     "id": "12",
     "title": "exam.title",
     "icon": "LuFileText",
     "children": [
       {
         "id": "12/01",
         "title": "exam.examName",
         "link": "exam/exam-name"
       },
       {
         "id": "12/02",
         "title": "exam.examSyllabus",
         "link": "exam/exam-syllabus"
       },
       {
         "id": "12/03",
         "title": "exam.examSchedule",
         "link": "exam/exam-schedule"
       },
       {
         "id": "12/04",
         "title": "exam.scheduleDownload",
         "link": "exam/schedule-download"
       },
       {
         "id": "12/05",
         "title": "exam.admitCard",
         "link": "exam/admit-card"
       },
       {
         "id": "12/06",
         "title": "exam.seatPlan",
         "link": "exam/seat-plan"
       },
       {
         "id": "12/07",
         "title": "exam.gradeRule",
         "link": "exam/grade-rule"
       },
       {
         "id": "12/08",
         "title": "exam.markBlankSheet",
         "link": "exam/mark-blank-sheet"
       },
       {
         "id": "12/09",
         "title": "exam.examSignatureSheet",
         "link": "exam/exam-signature-sheet"
       },
       {
         "id": "12/10",
         "title": "exam.examFeeSheet",
         "link": "exam/exam-fee-sheet"
       }
     ]
   },  
   {
     "id": "13",
     "title": "result.title",
     "icon": "PiExamBold",
     "children": [
       {
         "id": "13/01",
         "title": "result.markInput",
         "link": "result/mark-input"
       },
       {
         "id": "13/02",
         "title": "result.tabulationSheet",
         "link": "result/tabulation-sheet"
       },
       {
         "id": "13/03",
         "title": "result.progressReport",
         "link": "result/progress-report"
       },
       {
         "id": "13/04",
         "title": "result.meritList",
         "link": "result/merit-list"
       }
     ]
   },  
   {
     "id": "14",
     "title": "routine.title",
     "icon": "HiOutlineTableCells",
     "children": [
       {
         "id": "14/01",
         "title": "routine.routines",
         "link": "routine/routine-list"
       },
       {
         "id": "14/02",
         "title": "routine.classRoutine",
         "link": "routine/class-routine"
       },
       {
         "id": "14/03",
         "title": "routine.teacherSchedule",
         "link": "routine/teacher-schedule"
       }
     ]
   },  
   {
     "id": "15",
     "title": "studyMaterial.title",
     "icon": "FaCloudDownloadAlt",
     "link": "/study-material"
   },
   {
     "id": "16",
     "title": "event.title",
     "icon": "GrTableAdd",
     "children": [
       {
         "id": "16/01",
         "title": "event.eventList",
         "link": "event/event-list"
       }
     ]
   },  
   {
     "id": "17",
     "title": "fees.title",
     "icon": "CiDollar",
     "children": [
       {
         id: "17/07",
         title: "fees.collection.title",
         children: [
           {
             id: "17/07/01",
             title: "fees.collection.quickCollection",
             link: "fees/collection/quick-collection",
           },
           {
             id: "17/07/02",
             title: "fees.collection.classWiseCollection",
             link: "fees/collection/class-wise-collection",
           },
           {
             id: "17/07/02",
             title: "fees.collection.multiFeeConfig",
             link: "fees/collection/mult-fee-configuration",
           },
         ],
       },
       {
         "id": "17/01",
         "title": "fees.feesType",
         "link": "fees/fees-type"
       },
       {
         "id": "17/02",
         "title": "fees.feesAmount",
         "link": "fees/fees-amount"
       },
       {
         "id": "17/03",
         "title": "fees.feesMaster",
         "link": "fees/fees-master"
       },
       {
         "id": "17/04",
         "title": "fees.feesAllocation",
         "link": "fees/fees-allocation"
       },
       {
         "id": "17/05",
         "title": "fees.returnFee",
         "link": "fees/return-fee"
       },
       {
         "id": "17/06",
         "title": "fees.deleteFee",
         "link": "fees/delete-fee"
       }
     ]
   },
   {
     "id": "18",
     "title": "payroll.title",
     "icon": "FaMoneyCheckAlt",
     "children": [
       {
         "id": "18/01",
         "title": "payroll.addition",
         "link": "payroll/addition"
       },
       {
         "id": "18/02",
         "title": "payroll.deduction",
         "link": "payroll/deduction"
       },
       {
         "id": "18/03",
         "title": "payroll.salaryAssign",
         "link": "payroll/salary-assign"
       }
     ]
   },  
   {
     id: "19",
     title: "services.title",
     icon: "RiServiceLine",
     children: [
       {
         id: "19/01",
         title: "services.hostel.title",
         children: [
           {
             id: "19/01/01",
             title: "services.hostel.hostelPackage",
             link: "services/hostel/hostel-package",
           },
           {
             id: "19/01/02",
             title: "services.hostel.hostelAllocation",
             link: "services/hostel/hostel-allocation",
           },
         ],
       },
       {
         id: "19/02",
         title: "services.coaching.title",
         children: [
           {
             id: "19/02/01",
             title: "services.coaching.coachingPackage",
             link: "services/coaching/coaching-package",
           },
           {
             id: "19/02/02",
             title: "services.coaching.coachingAllocation",
             link: "services/coaching/coaching-allocation",
           },
         ],
       },
       {
         id: "19/03",
         title: "services.transport.title",
         children: [
           {
             id: "19/03/01",
             title: "services.transport.transportPackage",
             link: "services/transport/transport-package",
           },
           {
             id: "19/03/02",
             title: "services.transport.transportAllocation",
             link: "services/transport/transport-allocation",
           },
         ],
       },
     ],
   },  
   {
     id: "20",
     title: "income.title",
     icon: "GiReceiveMoney",
     children: [
       {
         id: "20/01",
         title: "income.income",
         link: "income/income",
       },
       {
         id: "20/02",
         title: "income.entryDateSearch",
         link: "income/entry-date-search",
       },
       {
         id: "20/03",
         title: "income.incomeHead",
         link: "income/income-head",
       },
     ],
   },
   {
     id: "21",
     title: "expense.title",
     icon: "GiPayMoney",
     children: [
       {
         id: "21/01",
         title: "expense.expense",
         link: "expense/expense",
       },
       {
         id: "21/02",
         title: "expense.entryDateSearch",
         link: "expense/entry-date-search",
       },
       {
         id: "21/03",
         title: "expense.expenseHead",
         link: "expense/expense-head",
       },
     ],
   },
   {
     id: "22",
     title: "withdraw.title",
     icon: "GiTakeMyMoney",
     children: [
       {
         id: "22/01",
         title: "withdraw.withdraw",
         link: "withdraw/withdraw",
       },
     ],
   },  
   {
     id: "23",
     title: "sidebarSingle.reports",
     icon: false,
   },
   {
     "id": "24",
     "title": "accountingReport.title",
     "icon": "MdAccountBalance",
     "children": [
       {
         "id": "24/01",
         "title": "accountingReport.accountStatement",
         "link": "accounting-report/account-statement"
       },
       {
         "id": "24/02",
         "title": "accountingReport.dateWiseIncome",
         "link": "accounting-report/date-wise-income"
       },
       {
         "id": "24/03",
         "title": "accountingReport.headWiseIncome",
         "link": "accounting-report/head-wise-income"
       },
       {
         "id": "24/04",
         "title": "accountingReport.dateWiseExpense",
         "link": "accounting-report/date-wise-expense"
       },
       {
         "id": "24/05",
         "title": "accountingReport.headWiseExpense",
         "link": "accounting-report/head-wise-expense"
       },
       {
         "id": "24/06",
         "title": "accountingReport.dateWiseWithdraw",
         "link": "accounting-report/date-wise-withdraw"
       }
     ]
   },
   {
     "id": "25",
     "title": "feesReport.title",
     "icon": "TbReportMoney",
     "children": [
       {
         "id": "25/01",
         "title": "feesReport.dateWisePaidFee",
         "link": "fees-report/date-wise-paid-fee"
       },
       {
         "id": "25/02",
         "title": "feesReport.studentWisePaidFee",
         "link": "fees-report/student-wise-paid-fee"
       },
       {
         "id": "25/03",
         "title": "feesReport.dueFee",
         "link": "fees-report/due-fee"
       }
     ]
   },  
   {
     "id": "26",
     "title": "attendanceReport.title",
     "icon": "PiPresentationChartBold",
     "children": [
       {
         "id": "26/01",
         "title": "attendanceReport.studentReport.title",
         "children": [
           {
             "id": "26/01/01",
             "title": "attendanceReport.studentReport.monthWiseReport",
             "link": "attendance-report/student-report/month-wise-report"
           },
           {
             "id": "26/01/02",
             "title": "attendanceReport.studentReport.dayViewReport",
             "link": "attendance-report/student-report/day-wise-report"
           },
           {
             "id": "26/01/03",
             "title": "attendanceReport.studentReport.timeWiseReport",
             "link": "attendance-report/student-report/time-wise-report"
           }
         ]
       },
       {
         "id": "26/02",
         "title": "attendanceReport.teacherReport.title",
         "children": [
           {
             "id": "26/02/01",
             "title": "attendanceReport.teacherReport.monthWiseReport",
             "link": "attendance-report/teacher-report/month-wise-report"
           },
           {
             "id": "26/02/03",
             "title": "attendanceReport.teacherReport.timeWiseReport",
             "link": "attendance-report/teacher-report/time-wise-report"
           }
         ]
       },
       {
         "id": "26/03",
         "title": "attendanceReport.staffReport.title",
         "children": [
           {
             "id": "26/03/01",
             "title": "attendanceReport.staffReport.monthWiseReport",
             "link": "attendance-report/staff-report/month-wise-report"
           },
           {
             "id": "26/03/02",
             "title": "attendanceReport.staffReport.timeWiseReport",
             "link": "attendance-report/staff-report/time-wise-report"
           }
         ]
       }
     ]
   },
   {
     id: "27",
     title: "smsReport.title",
     icon: "MdOutlineTextsms",
     children: [
       {
         id: "27/01",
         title: "smsReport.purchaseHistory",
         link: "sms-report/purchase-history",
       },
       {
         id: "27/02",
         title: "smsReport.smsSendSummary",
         link: "sms-report/sms-send-summary",
       },
       {
         id: "27/03",
         title: "smsReport.smsDelivery",
         link: "sms-report/sms-delivery",
       },
     ],
   },  
   {
     id: "28",
     title: "siteSettings.title",
     icon: false,
   },
   {
     id: "29",
     title: "siteSettings.title",
     icon: "MdVideoSettings",
     children: [
       {
         id: "29/01",
         title: "siteSettings.banner",
         link: "site-settings/banner",
       },
       {
         id: "29/02",
         title: "siteSettings.notice",
         link: "site-settings/notice",
       },
       {
         id: "29/03",
         title: "siteSettings.schoolService",
         link: "site-settings/school-service",
       },
       {
         id: "29/04",
         title: "siteSettings.pageContent",
         link: "site-settings/page-content",
       },
       {
         id: "29/05",
         title: "siteSettings.pictureGallery",
         link: "site-settings/picture-gallery",
       },
       {
         id: "29/06",
         title: "siteSettings.videoGallery",
         link: "site-settings/video-gallery",
       },
       {
         id: "29/07",
         title: "siteSettings.testimonial",
         link: "site-settings/testimonial",
       },
       {
         id: "29/08",
         title: "siteSettings.contact",
         link: "site-settings/contact",
       },
     ],
   }
   
 
   //nested menu item pattern
   // {
   //   id: "05",
   //   title: "Academic Events",
   //   icon: "MdOutlineEventAvailable",
   //   children: [
   //     {
   //       id: "05/01",
   //       title: "Events",
   //       link: "./",
   //     },
   //     {
   //       id: "05/02",
   //       title: "Event List",
   //       link: "./",
   //     },
   //   ],
   // },
   // {
   //   id: "06",
   //   title: "Communication",
   //   icon: "CgCommunity",
   //   children: [
   //     {
   //       id: "06/01",
   //       title: "SMS",
   //       children: [
   //         {
   //           id: "06/01/01",
   //           title: "Parents",
   //           link: "./",
   //         },
   //         {
   //           id: "06/01/02",
   //           title: "Payment",
   //           link: "./",
   //         },
   //         {
   //           id: "06/01/03",
   //           title: "Notification",
   //           link: "./",
   //         },
   //       ],
   //     },
   //     {
   //       id: "06/02",
   //       title: "Call",
   //       children: [
   //         {
   //           id: "06/02/01",
   //           title: "Parents",
   //           link: "./",
   //         },
   //         {
   //           id: "06/02/02",
   //           title: "Events",
   //           link: "./",
   //         },
   //         {
   //           id: "06/02/03",
   //           title: "Exams",
   //           link: "./",
   //         },
   //         {
   //           id: "06/02/04",
   //           title: "Result",
   //           link: "./",
   //         },
   //       ],
   //     },
   //   ],
   // },
 ];
 
 export default dummyMenu;
 