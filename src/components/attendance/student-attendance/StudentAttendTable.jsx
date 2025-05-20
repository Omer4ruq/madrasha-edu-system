import { useTranslation } from "react-i18next";
import PrevAttendHistory from "../sub-components/PrevAttendHistory";
import RadioAttendance from "../sub-components/RadioAttendance";

export default function StudentAttendTable() {
   const students = [
      {
         id:'000001',
         image: 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg',
         name: 'Shohanur Rahman',
         roll: "01",
         prevDays:[true, true, false, true, false, true]
      },
      {
         id:'000002',
         image: 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg',
         name: 'Shohanur Rahman',
         roll: "01",
         prevDays:[true, true, false, true, false, true]
      },
      {
         id:'000003',
         image: 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg',
         name: 'Shohanur Rahman',
         roll: "01",
         prevDays:[true, true, false, true, false, true]
      },
      {
         id:'000004',
         image: 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg',
         name: 'Shohanur Rahman',
         roll: "01",
         prevDays:[true, true, false, true, false, true]
      },
   ]

   
  const {t} = useTranslation();
    return (
      <div className="border my-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
      <thead className="border-b-2 bg-bgBlue">
        <tr>
          <th className="w-1/12">{t('module.communication.id')}</th>
          <th className="w-1/12">{t('module.communication.image')}</th>
          <th className="w-3/12">{t('module.communication.name')}</th>
          <th className="w-1/12">{t('module.communication.roll')}</th>
          <th className="w-2/12">{t('module.communication.status')}</th>
          <th className="w-4/12">{t('module.communication.previous_7_days_status')}</th>
        </tr>
      </thead>
      <tbody className="divide-y-2 font-medium">
        {students.map((row) => (
          <tr key={row.id} className="text-center">
            <td className="w-1/12">{row.id}</td>
            <td className="w-1/12"><img src={row.image} className="w-7 h-7 rounded-full m-auto" /></td>
            <td className="w-3/12">{row.name}</td>
            <td className="w-1/12">{row.roll}</td>
            <td className="w-2/12"><RadioAttendance /></td>
            <td className="w-4/12"><PrevAttendHistory history={row.prevDays} /></td>
          </tr>
        ))}
      </tbody>
    </table>
      </div>
    );
}