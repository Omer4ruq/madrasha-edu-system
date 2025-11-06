const mainMenu = [
  {
    id: "01",
    title: "প্রোফাইল",
    icon: false,
    link: "/profile",
  },
  {
    id: "02",
    title: "ড্যাশবোর্ড",
    icon: "RiDashboardHorizontalFill",
    link: "/dashboard",
  },
  {
    id: "03",
    title: "প্রতিষ্ঠানের তথ্য",
    icon: "HiOutlineBuildingStorefront",
    link: "/institute-profile",
  },
  {
    id: "04",
    title: "দারুল ইকামা",
    icon: "FaPlaceOfWorship",
    link: "/darul-iqam",
    children: [
      {
        id: "04/01",
        title: "সেটিং",
        link: "/darul-iqam/settings",
        children: [
          {
            id: "04/01/01",
            title: "আচরন ধরন",
            link: "/darul-iqam/settings",
          },
          {
            id: "04/01/02",
            title: "ছুটির ধরন",
            link: "/darul-iqam/settings/leave-type",
          },

          {
            id: "04/01/03",
            title: "শিক্ষকের পারফরমেন্সের ধরন",
            link: "/darul-iqam/settings/performance-type",
          },
          {
            id: "04/01/04",
            title: "পরিছন্নতার ধরন",
            link: "/darul-iqam/settings/clean-type",
          },
        ],
      },
      {
        id: "04/02",
        title: "আচরন মার্কস",
        link: "/darul-iqam/behavior-marks",
      },
      {
        id: "04/03",
        title: "পরিছন্নতার রিপোর্ট",
        link: "/darul-iqam/clean-report",
      },
      {
        id: "04/04",
        title: "ছুটির আবেদন",
        link: "/darul-iqam/leave-request",
      },
      {
        id: "04/05",
        title: "শিক্ষকের পারফরমেন্স",
        link: "/darul-iqam/teacher-performance",
      },
    ],
  },
  {
    id: "05",
    title: "তালিমাত",
    icon: "HiAcademicCap",
    link: "/talimat",
    children: [
      {
        id: "05/01",
        title: "সেটিং",
        link: "/talimat/settings",
        children: [
          {
            id: "05/01/01",
            title: "শ্রেনী সংযোজন",
            link: "/talimat/settings",
          },
          {
            id: "05/01/02",
            title: "সেকশন সংযোজন",
            link: "/talimat/settings/add-section",
          },
          {
            id: "05/01/03",
            title: "শিফট সংযোজন",
            link: "/talimat/settings/add-shift",
          },
          {
            id: "05/01/04",
            title: "ক্লাস কনফিগারেশন",
            link: "/talimat/settings/add-config",
          },
          {
            id: "05/01/05",
            title: "পরীক্ষার ধরন",
            link: "/talimat/settings/exam-type",
          },
          {
            id: "05/01/06",
            title: "ইভেন্ট তৈরি",
            link: "/talimat/settings/event-type",
          },
          {
            id: "05/01/07",
            title: "গ্রেড কনফিগারেশন",
            link: "/talimat/settings/result-config",
          },
        ],
      },
      {
        id: "05/02",
        title: "সাবজেক্ট",
        link: "/talimat/class-subject",
        children: [
          {
            id: "05/02/01",
            title: "সাবজেক্ট নির্বাচন",
            link: "/talimat/class-subject",
          },
        ],
      },
      {
        id: "05/03",
        title: "মার্কস কনফিগার",
        link: "/talimat/marks",
        children: [
                {
            id: "05/03/01",
            title: "বিষয়-কনফিগারেশন",
            link: "/talimat/marks",
          },
          {
            id: "05/03/02",
            title: "মার্কস-কনফিগার",
            link: "/talimat/marks/mark-config",
          },
       
          
        ],
      },
      {
        id: "05/04",
        title: "প্রবেশপত্র",
        link: "/talimat/admit-card",
      },
      {
        id: "05/05",
        title: "সিট প্ল্যান",
        link: "/talimat/seat-plan",
      },
      {
        id: "05/06",
        title: "প্রাপ্তনম্বর",
        link: "/talimat/marks-given",
        children: [
          {
            id: "05/06/01",
            title: "মার্ক্স প্রদান",
            link: "/talimat/marks-given",
          },
        ],
      },
      {
        id: "05/07",
        title: "জামাত ঘন্টা",
        link: "/talimat/periods",
        children: [
          {
            id: "05/07/01",
            title: "জামাত ঘন্টা",
            link: "/talimat/periods",
          },
        ],
      },
      {
        id: "05/08",
        title: "শিক্ষকের সাবজেক্ট",
        link: "/talimat/teacher-subject-assign",
        children: [
          {
            id: "05/08/01",
            title: "বিষয় অ্যাসাইনমেন্ট",
            link: "/talimat/teacher-subject-assign",
          },
        ],
      },
      {
        id: "05/09",
        title: "স্বাক্ষর পত্র",
        link: "/talimat/signature-sheet",
      },
      {
        id: "05/10",
        title: "ইভেন্ট ক্যালেন্ডার",
        link: "/talimat/event",
      },
      {
        id: "05/11",
        title: "নোটিশ",
        link: "/talimat/notice",
      },
      {
        id: "05/12",
        title: "রুটিন",
        link: "/talimat/routine",
      },
      {
        id: "05/13",
        title: "পরীক্ষার রুটিন",
        link: "/talimat/exam-routine",
      },
      {
        id: "05/14",
        title: "ছাত্রের উপস্থিতি",
        link: "/talimat/student-attendance",
      },
      {
        id: "05/15",
        title: "প্রত্যয়ন পত্র",
        link: "/talimat/testimonial",
      },
      {
        id: "05/16",
        title: "রেজাল্ট",
        link: "/talimat/result",
        children: [
          {
            id: "05/16/01",
            title: "ফলাফল পত্র",
            link: "/talimat/result",
          },
          {
            id: "05/16/02",
            title: "নম্বরপত্র",
            link: "/talimat/result/mark-sheet",
          },
          // {
          //   id: "05/16/03",
          //   title: "ব্যক্তিগত নম্বরপত্র",
          //   link: "/talimat/result/personal-mark-sheet",
          // },
          {
            id: "05/16/04",
            title: "মেধা স্থান",
            link: "/talimat/result/merit-list",
          },
        ],
      },
    ],
  },
  {
    id: "06",
    title: "অ্যাপস এবং পেজ",
    icon: false,
  },
  {
    id: "07",
    title: "হিসাব বিভাগ",
    icon: "BsBank",
    link: "/accounts",
    children: [
      {
        id: "07/01",
        title: "সেটিং",
        link: "/accounts/settings",
        children: [
          {
            id: "07/01/01",
            title: "ফান্ডের ধরন",
            link: "/accounts/settings",
          },
          {
            id: "07/01/02",
            title: "আয়ের খাতসমূহ",
            link: "/accounts/settings/income-heads",
          },
          {
            id: "07/01/03",
            title: "ব্যয়ের ধরন",
            link: "/accounts/settings/expense-heads",
          },
          {
            id: "07/01/04",
            title: "ফিসের ধরন",
            link: "/accounts/settings/fee-heads",
          },
            {
            id: "07/01/05",
            title: "দায়ের ধরন",
            link: "/accounts/settings/liability-heads",
          },
        ],
      },
      {
        id: "07/02",
        title: "বৃত্তি প্রদান",
        link: "/accounts/waivers",
      },
      {
        id: "07/03",
        title: "আয়ের লিস্ট",
        link: "/accounts/income-list",
      },
      {
        id: "07/04",
        title: "ব্যয়ের লিস্ট",
        link: "/accounts/expense-list",
      },
      {
        id: "07/05",
        title: "ফিস প্যাকেজ",
        link: "/accounts/fee-packages",
      },
      {
        id: "07/06",
        title: "ফিসের নাম",
        link: "/accounts/fee-name",
      },
      {
        id: "07/07",
        title: "ফিস গ্রহণ",
        link: "/accounts/fee-summary",
      },
      // {
      //   id: "07/08",
      //   title: "পূর্বের - ফি",
      //   link: "/accounts/previous-fee",
      // },
      {
        id: "07/09",
        title: "ডিলিট - ফি",
        link: "/accounts/delete-fee",
      },
       {
        id: "07/11",
        title: "পার্টিস",
        link: "/accounts/parties",
      },
       {
        id: "07/12",
        title: "উত্তলন",
        link: "/accounts/withdraws",
      },
             {
        id: "07/13",
        title: "দায় এন্ট্রিস",
        link: "/accounts/liability-entries",
      },
        {
        id: "07/14",
        title: "রিপোর্ট",
        link: "/accounts/expense-items-list",
        children: [
          {
            id: "07/10/01",
            title: "ব্যয়ের লিস্ট",
            link: "/accounts/expense-items-list",
          },
          {
            id: "07/10/02",
            title: "আয়ের লিস্ট",
            link: "/accounts/income-items-list",
          },
             {
            id: "07/10/03",
            title: "উত্তলন লিস্ট",
            link: "/accounts/withdraws-list",
          },
             {
            id: "07/10/04",
            title: "দায় লিস্ট",
            link: "/accounts/liability-list",
          },
           {
            id: "07/10/05",
            title: "পেইড লিস্ট",
            link: "/accounts/paid-list",
          },
             {
            id: "07/10/06",
            title: "বকেয়া লিস্ট",
            link: "/accounts/due-fees-list",
          },
        ],
      },
    ],
  },
  {
    id: "08",
    title: "ইউজারস",
    icon: "FaUsers ",
    link: "/users",
    children: [
      {
        id: "08/01",
        title: "ছাত্র",
        link: "/users/student",
        children: [
          {
            id: "08/01/01",
            title: "ছাত্র নিবন্ধন",
            link: "/users/student",
          },
          {
            id: "08/01/02",
            title: "ছাত্রদের তালিকা",
            link: "/users/student/student-list",
          },
        ],
      },
      {
        id: "08/02",
        title: "কর্মকর্তা",
        link: "/users/staff",
        children: [
          {
            id: "08/02/01",
            title: "কর্মকর্তা নিবন্ধন",
            link: "/users/staff",
          },
          {
            id: "08/02/02",
            title: "কর্মকর্তাদের তালিকা",
            link: "/users/staff/staff-list",
          },
        ],
      },
      {
        id: "08/03",
        title: "ভূমিকা-ভিত্তিক অনুমতি",
        link: "/users/role-permission",
      },
      {
        id: "08/04",
        title: "ভূমিকা সংযোজন",
        link: "/users/role-types",
      },
    ],
  },
  {
    id: "09",
    title: "বোর্ডিং",
    icon: "FaHotel",
    link: "/boarding",
    children: [
      {
        id: "09/01",
        title: "সেটিং",
        link: "/boarding/settings",
        children: [
          {
            id: "09/01/01",
            title: "খাবারের ধরন",
            link: "/boarding/settings",
          },
          {
            id: "09/01/02",
            title: "খাবারের আইটেম",
            link: "/boarding/settings/meal-items",
          },
          {
            id: "09/01/03",
            title: "খাবারের সেটাপ",
            link: "/boarding/settings/meal-setup",
          },
        ],
      },
      {
        id: "09/02",
        title: "খাবারের স্ট্যাটাস",
        link: "/boarding/meal-status",
      },
      {
        id: "09/03",
        title: "বোর্ডিং - ফি",
        link: "/boarding/boarding-fee",
      },
    ],
  },

  {
    id: "10",
    title: "কমিউনিকেশন",
    icon: "GiNetworkBars",
    link: "/communication",
    children: [
      {
        id: "10/01",
        title: "জেনারেল এসএমএস",
        link: "/communication/general-sms",
        children: [
          {
            id: "10/01/01",
            title: "এসএমএস পাঠান",
            link: "/communication/general-sms",
          },
          {
            id: "10/01/02",
            title: "এসএমএস টেমপ্লেট",
            link: "/communication/general-sms/sms-template",
          },
        ],
      },
      {
        id: "10/02",
        title: "বিজ্ঞপ্তি এসএমএস",
        link: "/communication/notification-sms",
        children: [
          {
            id: "10/02/01",
            title: "বিজ্ঞপ্তি এসএমএস পাঠান",
            link: "/communication/notification-sms",
          },
          {
            id: "10/02/02",
            title: "এসএমএস বিজ্ঞপ্তি টেমপ্লেট",
            link: "/communication/notification-sms/sms-notification-template",
          },
        ],
      },
    ],
  },
  {
    id: "11",
    title: "লেআউট",
    icon: "TbReportAnalytics",
    link: "/layout",
    children: [
      {
        id: "11/01",
        title: "হাজিরা খাতা",
        link: "/layout/attendance-sheet",
      },
      {
        id: "11/02",
        title: "মুতালায়া ও সবক রিপোর্ট",
        link: "/layout/mutalaya-report",
      },
    ],
  },
  {
    id: "12",
    title: "Attendace",
    icon: "TbReportAnalytics",
    link: "/attendance",
    children: [
      {
        id: "12/01",
        title: "Students Attendance",
        link: "/attendance/GiveStudent-attendance",
      },
    ],
  },
];

export default mainMenu;
