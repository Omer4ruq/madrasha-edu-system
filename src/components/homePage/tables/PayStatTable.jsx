import { useTranslation } from "react-i18next";

export default function PayStatTable() {
  const {t} = useTranslation();
  const payInfo = [
    {
      name: "Nursery",
      section: "A",
      totalStudents: 45,
      paid: 32,
      unpaid: 13,
    },
    {
      name: "Nursery",
      section: "B",
      totalStudents: 48,
      paid: 38,
      unpaid: 13,
    },
    {
      name: "Nursery",
      section: "A",
      totalStudents: 45,
      paid: 32,
      unpaid: 13,
    },
    {
      name: "Nursery",
      section: "B",
      totalStudents: 48,
      paid: 38,
      unpaid: 13,
    },
    {
      name: "Nursery",
      section: "A",
      totalStudents: 45,
      paid: 32,
      unpaid: 13,
    },
    {
      name: "Nursery",
      section: "B",
      totalStudents: 48,
      paid: 38,
      unpaid: 13,
    },
  ];
  return (
    <div className="mt-4">
      <table className="w-full text-center">
        <thead>
          <tr className="bg-blue text-white font-medium">
            <td className="w-[20%] py-2">{t('module.dashboard.class')}</td>
            <td className="w-[20%] py-2">
              
            </td>
            <td className="w-[20%] py-2">{t('module.dashboard.total_student')}</td>
            <td className="w-[20%] py-2">{t('module.dashboard.paid')}</td>
            <td className="w-[20%] py-2">{t('module.dashboard.unpaid')}</td>
          </tr>
        </thead>
      </table>
      <div className="h-40 overflow-y-auto bg-bgBlue scrollbar-table">
        <table className="w-full text-center text-textGray divide-y">
          <tbody>
            {payInfo.map((singleClass, index) => (
              <tr key={index}>
                <td className="w-[20%] py-1">{singleClass.name}</td>
                <td className="w-[20%] py-1">{singleClass.section}</td>
                <td className="w-[20%] py-1">{singleClass.totalStudents}</td>
                <td className="w-[20%] py-1 text-green">{singleClass.paid}</td>
                <td className="w-[20%] py-1 text-red">{singleClass.unpaid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
