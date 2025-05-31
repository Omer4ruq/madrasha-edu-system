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
  title: "Darul Iqam",
  icon: "HiOutlineBuildingStorefront",
  link: "/darul-iqam",
  children: [
    {
      id: "04/01",
      title: "setting",
      link: "/settings/behavior-type", // Updated to match router path
      children: [
        {
          id: "04/01/01",
          title: "behavior Type",
          link: "/settings/behavior-type", // Updated to absolute path
        },
        {
          id: "04/01/02",
          title: "Leave Type",
          link: "/settings/leave-type", // Corrected to match router path
        },
      ]
    },
  ]
}
  ,
    {
    id: "05",
    title: "Talimat",
    icon: "HiOutlineBuildingStorefront",
    link: "/class-management",
    children: [
      {
        id: "05/01",
        title: "Class Managment",
        link: "/class-management",
          children: [
      {
        id: "05/01",
        title: "Add Classes",
        link: "/class-management",
      },
        {
        id: "05/02",
        title: "Add Section",
        link: "/class-management/add-section",
      },
       {
        id: "05/03",
        title: "Add Shift",
        link: "/class-management/add-shift",
      },
       {
        id: "05/04",
        title: "Class Config",
        link: "/class-management/add-config",
      },
    ]
      },
      //   {
      //   id: "30/02",
      //   title: "Add Section",
      //   link: "/class-management/add-section",
      // },
      //  {
      //   id: "30/03",
      //   title: "Add Shift",
      //   link: "/class-management/add-shift",
      // },
      //  {
      //   id: "30/04",
      //   title: "Class Config",
      //   link: "/class-management/add-config",
      // },
    ]
  },
  {
    id: "04",
    title: "sidebarSingle.appsAndPages",
    icon: false,
  },

  


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

export default mainMenu;
