import { FaUserEdit } from "react-icons/fa";
import profileImg from "/images/profile.jpg";
import { useTranslation } from "react-i18next";

export default function ProfileInfo() {
  const {t} = useTranslation();
  const profile = [
    {
      title: `${t('module.dashboard.reg_no')}`,
      data: "1234667",
    },
    {
      title: `${t('module.dashboard.user_type')}`,
      data: "Admin",
    },
    {
      title: `${t('module.dashboard.designation')}`,
      data: "Principal",
    },
    {
      title: `${t('module.dashboard.mobile_no')}`,
      data: "01234567891",
    },
  ];

  return (
    <div className="bg-white col-span-1 order-1 rounded-md px-2 sm:px-4 py-3 sm:py-6 space-y-2 relative">
      {/* user image */}
      <div className="flex justify-center">
        <img
          src={profileImg}
          alt=""
          className="w-20 h-20 rounded-full border border-#DB9E30"
        />
      </div>

      {/* user name */}
      <h4 className="bg-#DB9E30 text-white text-center rounded p-1">
        Salauddin Ahmed
      </h4>

      {/* user data table */}
      <table className="rounded bg-bgBlue w-full font-medium text-sm">
        <tbody>
          {profile.map((row, index) => (
            <tr key={index}>
              <td className="text-end px-2 py-[3px] border border-white text-#DB9E30 ">
                {row.title}
              </td>
              <td className="text-start px-2 py-[3px] border border-white text-textGray">
                {row.data}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* edit icon */}
      <FaUserEdit className="w-8 h-8 p-1 text-[#c4c4c4] absolute top-1 right-3" />
    </div>
  );
}
