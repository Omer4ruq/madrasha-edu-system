const mainMenu = [
  {
    id: "01",
    title: "প্রোফাইল",
    icon: false,
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
    icon: "HiOutlineHomeModern",
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
            title: "পার্ফরমেন্স ধরন",
            link: "/darul-iqam/settings/performance-type",
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
        title: "ক্লিন রিপোর্ট",
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
      {
        id: "04/06",
        title: "ছাত্রের উপস্থিতি",
        link: "/darul-iqam/student-attendance",
      },
    ],
  },
  {
    id: "05",
    title: "তালিমাত",
    icon: "HiOutlineBuildingStorefront",
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
        title: "Marks Cofig",
        link: "/talimat/marks-config",
        children: [
          {
            id: "05/03/01",
            title: "marks-config",
            link: "/talimat/marks-config",
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
        title: "Marks Given",
        link: "/talimat/marks-given",
        children: [
          {
            id: "05/06/01",
            title: "marks-given",
            link: "/talimat/marks-given",
          },
        ],
      },
      {
        id: "05/07",
        title: "Periods",
        link: "/talimat/periods",
        children: [
          {
            id: "05/07/01",
            title: "periods",
            link: "/talimat/periods",
          },
        ],
      },
      {
        id: "05/08",
        title: "teacher",
        link: "/talimat/teacher-subject-assign",
        children: [
          {
            id: "05/08/01",
            title: "periods",
            link: "/talimat/teacher-subject-assign",
          },
        ],
      },
      {
        id: "05/09",
        title: "স্বাক্ষর পত্র",
        link: "/talimat/signature-sheet",
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
    icon: "HiOutlineCalculator",
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
        title: "ফি প্যাকেজ",
        link: "/accounts/fee-packages",
      },
      {
        id: "07/06",
        title: "ফি নাম",
        link: "/accounts/fee-name",
      },
      {
        id: "07/07",
        title: "বর্তমান- ফি",
        link: "/accounts/current-fee",
      },
      {
        id: "07/08",
        title: "previous- ফি",
        link: "/accounts/previous-fee",
      },
      {
        id: "07/09",
        title: "Delete- ফি",
        link: "/accounts/delete-fee",
      },
    ],
  },
  {
    id: "08",
    title: "ইউজারস",
    icon: "HiOutlineCalculator",
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
    ],
  },
  // {
  //   id: "09",
  //   title: "কমিউনিকেশন",
  //   icon: "HiOutlineCalculator",
  //   link: "/communication",
  //   children: [
  //     {
  //       id: "09/01",
  //       title: "জেনারেল এসএমএস",
  //       link: "/communication/general-sms",
  //       children: [
  //         {
  //           id: "09/01/01",
  //           title: "এসএমএস পাঠান",
  //           link: "/communication/general-sms",
  //         },
  //         {
  //           id: "09/01/02",
  //           title: "এসএমএস টেমপ্লেট",
  //           link: "/communication/general-sms/sms-template",
  //         },
  //       ],
  //     },
  //     {
  //       id: "09/02",
  //       title: "বিজ্ঞপ্তি এসএমএস",
  //       link: "/communication/notification-sms",
  //       children: [
  //         {
  //           id: "09/02/01",
  //           title: "বিজ্ঞপ্তি এসএমএস পাঠান",
  //           link: "/communication/notification-sms",
  //         },
  //         {
  //           id: "09/02/02",
  //           title: "এসএমএস বিজ্ঞপ্তি টেমপ্লেট",
  //           link: "/communication/notification-sms/sms-notification-template",
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    id: "09",
    title: "বোর্ডিং",
    icon: "HiOutlineCalculator",
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
            link: "/boarding/settings/meal-type",
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
          {
            id: "09/01/04",
            title: "খাবারের স্ট্যাটাস",
            link: "/boarding/settings/meal-status",
          },
        ],
      },
    ],
  },

  {
    id: "10",
    title: "কমিউনিকেশন",
    icon: "HiOutlineCalculator",
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
    icon: "HiOutlineCalculator",
    link: "/layout",
    children: [
      {
        id: "11/01",
        title: "হাজিরা খাতা",
        link: "/layout/attendance-sheet",
      },
    ],
  },
];

export default mainMenu;
