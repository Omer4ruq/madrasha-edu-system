import { useTranslation } from "react-i18next";
import SinglePresentField from "./SinglePresentField";

export default function StaMonthTable() {
  const { t } = useTranslation();

  const studentsAttendance = [
    {
      name: "শাহিনুর রহমান",
      roll: 1,
      attendance: ["p", "a", "p", "p", "a", "p", "h", "p", "p", "a", "p", "p", "a", "h", "p", "a", "p", "p", "a", "p", "h", "p", "p", "a", "p", "p", "a", "h", "p", "a"]
    },
    {
      name: "মাহমুদুল হাসান",
      roll: 2,
      attendance: ["a", "p", "p", "a", "p", "p", "h", "a", "p", "p", "a", "p", "p", "h", "a", "p", "p", "a", "p", "p", "h", "a", "p", "p", "a", "p", "p", "h", "a", "p"]
    },
    {
      name: "মোঃ রফিকুল ইসলাম",
      roll: 3,
      attendance: ["p", "p", "a", "p", "p", "a", "h", "p", "p", "a", "p", "p", "a", "h", "p", "p", "a", "p", "p", "a", "h", "p", "p", "a", "p", "p", "a", "h", "p", "p"]
    },
    {
      name: "মোঃ সাইফুল ইসলাম",
      roll: 4,
      attendance: ["a", "a", "p", "p", "a", "p", "h", "a", "a", "p", "p", "a", "p", "h", "a", "a", "p", "p", "a", "p", "h", "a", "a", "p", "p", "a", "p", "h", "a", "a"]
    },
    {
      name: "মোঃ কামরুল হাসান",
      roll: 5,
      attendance: ["p", "a", "a", "p", "p", "p", "h", "p", "a", "a", "p", "p", "p", "h", "p", "a", "a", "p", "p", "p", "h", "p", "a", "a", "p", "p", "p", "h", "p", "a"]
    }
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-sm text-center leading-6 sm:leading-7">
        <thead className="bg-bgBlue border-b-2 border-bgGray">
          <tr>
            <th className="px-1 min-w-10 w-1/12">{t("module.report.roll")}</th>
            <th className="px-1 min-w-40 w-3/12">{t("module.report.name")}</th>
            <th className="border-x-2 border-bgGray">
              <p>{t("module.report.attendance")}</p>
              <div className="flex border-t-2 border-bgGray">
                {studentsAttendance[0].attendance.map((_, index) => (
                  <div key={index} className={`min-w-6 grow leading-7 border-x border-bgGray ${index === 0 ? "border-l-0" : ""} ${index === studentsAttendance[0].attendance.length - 1 ? "border-r-0" : ""}`}>
                    {index + 1}
                  </div>
                ))}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y font-medium">
          {studentsAttendance.map((row) => (
            <tr key={row.roll} className="text-center">
              <td className="w-1/12">{row.roll}</td>
              <td className="w-3/12">{row.name}</td>
              <td className="flex border-x">
                {row.attendance.map((status, index2) => (
                  <SinglePresentField key={index2} index={index2} status={status} />
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
