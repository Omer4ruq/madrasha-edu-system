import { useTranslation } from "react-i18next";
import SingleNotice from "../cards/SingleNotice";

export default function Notices() {
  const {t} = useTranslation();

  const notices = [
    {
      id: "01",
      date: "16 June, 2024",
      type: "info",
      content: "Lorem ipsum dolor sit amet consect, adipisicing elit.",
    },
    {
      id: "02",
      date: "16 June, 2024",
      type: "warning",
      content: "Lorem ipsum dolor sit amet consect, adipisicing elit.",
    },
    {
      id: "03",
      date: "16 June, 2024",
      type: "vacation",
      content: "Lorem ipsum dolor sit amet consect, adipisicing elit.",
    },
  ];

  return (
    <div className="bg-white col-span-1 order-3 sm:order-2 lg:order-3 rounded-md relative">
      {/* component heading */}
      <h3 className="bg-#DB9E30 text-white text-xl p-4 leading-[33px] rounded-t-md shadow-md">
        {t('module.dashboard.notices_events')}
      </h3>

      {/* notices */}
      <div className="divide-y-2 p-2">
        {notices.map((notice) => (
          <SingleNotice key={notice.id} notice={notice} />
        ))}
      </div>

      {/* view more botton */}
      <div className="flex justify-end p-2 mt-4">
        <button className="bg-tertiary text-white text-sm font-medium shadow py-1 px-4 rounded absolute bottom-3 right-3">
        {t('module.dashboard.view_all')}
        </button>
      </div>
    </div>
  );
}
