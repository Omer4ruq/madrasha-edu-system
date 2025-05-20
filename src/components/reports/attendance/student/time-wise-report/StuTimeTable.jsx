import { useTranslation } from "react-i18next";

export default function StuTimeTable() {
  const { t } = useTranslation();

  const dummyData = [
    {
      id: "001",
      name: "John Doe",
      roll: "10",
      status: "Present",
      inTime: "08:30 AM",
      outTime: "03:30 PM"
    },
    {
      id: "002",
      name: "Jane Smith",
      roll: "11",
      status: "Absent",
      inTime: "",
      outTime: ""
    },
    {
      id: "003",
      name: "Michael Johnson",
      roll: "12",
      status: "Present",
      inTime: "08:45 AM",
      outTime: "03:45 PM"
    },
    {
      id: "004",
      name: "Emily Davis",
      roll: "13",
      status: "Present",
      inTime: "08:40 AM",
      outTime: "03:40 PM"
    },
    {
      id: "005",
      name: "William Brown",
      roll: "14",
      status: "Absent",
      inTime: "",
      outTime: ""
    },
    {
      id: "006",
      name: "Olivia Wilson",
      roll: "15",
      status: "Present",
      inTime: "08:35 AM",
      outTime: "03:35 PM"
    },
    {
      id: "007",
      name: "James Taylor",
      roll: "16",
      status: "Present",
      inTime: "08:50 AM",
      outTime: "03:50 PM"
    },
    {
      id: "008",
      name: "Sophia Martinez",
      roll: "17",
      status: "Absent",
      inTime: "",
      outTime: ""
    },
    {
      id: "009",
      name: "Benjamin Anderson",
      roll: "18",
      status: "Present",
      inTime: "08:55 AM",
      outTime: "03:55 PM"
    },
    {
      id: "010",
      name: "Isabella Thomas",
      roll: "19",
      status: "Present",
      inTime: "08:25 AM",
      outTime: "03:25 PM"
    }
  ];

  return (
    <div className="border my-6 rounded shadow-md overflow-x-scroll">
      <table className="w-full text-textGray text-center leading-6 sm:leading-8">
        <thead className="bg-bgBlue border-b-2 border-bgGray leading-10">
          <tr>
            <th className="w-1/12">{t("module.report.id")}</th>
            <th className="w-4/12 min-w-32">{t("module.report.name")}</th>
            <th className="w-1/12">{t("module.report.roll")}</th>
            <th className="w-2/12 min-w-16">{t("module.report.status")}</th>
            <th className="w-2/12 min-w-20">{t("module.report.inTime")}</th>
            <th className="w-2/12 min-w-20">{t("module.report.outTime")}</th>
          </tr>
        </thead>
        <tbody className="divide-y font-medium">
          {dummyData.map((row) => (
            <tr key={row.roll} className="text-center">
              <td className="w-1/12">{row.id}</td>
              <td className="w-4/12">{row.name}</td>
              <td className="w-1/12">{row.roll}</td>
              <td className="w-2/12">{row.status}</td>
              <td className="w-2/12">{row.inTime}</td>
              <td className="w-2/12">{row.outTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
