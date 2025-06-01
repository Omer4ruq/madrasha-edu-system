const mainMenu = [
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
    title: "দারুল ইকাম",
    icon: "HiOutlineBuildingStorefront",
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
            link: "/darul-iqam/settings/behavior-type",
          },
          {
            id: "04/01/02",
            title: "ছুটির ধরন",
            link: "/darul-iqam/settings/leave-type",
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
    ],
  },
  {
    id: "05",
    title: "তালিমাত",
    icon: "HiOutlineBuildingStorefront",
    link: "/class-management",
    children: [
      {
        id: "05/01",
        title: "শ্রেনী পরিচালনা",
        link: "/class-management",
        children: [
          {
            id: "05/01/01",
            title: "শ্রেনী সংযোজন",
            link: "/class-management",
          },
          {
            id: "05/01/02",
            title: "সেকশন সংযোজন",
            link: "/class-management/add-section",
          },
          {
            id: "05/01/03",
            title: "শিফট সংযোজন",
            link: "/class-management/add-shift",
          },
          {
            id: "05/01/04",
            title: "ক্লাস কনফিগারেশন",
            link: "/class-management/add-config",
          },
        ],
      },
    ],
  },
  {
    id: "04",
    title: "sidebarSingle.appsAndPages",
    icon: false,
  },

  
];

export default mainMenu;
