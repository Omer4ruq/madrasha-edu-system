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

  
];

export default mainMenu;
