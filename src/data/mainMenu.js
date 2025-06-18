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
            title: "খাবারের ধরন",
            link: "/darul-iqam/settings/meal-type",
          },
          {
            id: "04/01/04",
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
            title: "পরীক্ষার ধরন",
            link: "/talimat/settings",
          },
        ],
      },

      {
        id: "05/02",
        title: "শ্রেনী পরিচালনা",
        link: "/talimat/class-management",
        children: [
          {
            id: "05/02/01",
            title: "শ্রেনী সংযোজন",
            link: "/talimat/class-management",
          },
          {
            id: "05/02/02",
            title: "সেকশন সংযোজন",
            link: "/talimat/class-management/add-section",
          },
          {
            id: "05/02/03",
            title: "শিফট সংযোজন",
            link: "/talimat/class-management/add-shift",
          },
          {
            id: "05/02/04",
            title: "ক্লাস কনফিগারেশন",
            link: "/talimat/class-management/add-config",
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
        title: "ফি ছাড়",
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
];

export default mainMenu;
