import { useTranslation } from "react-i18next";

export default function LRequestTable({handleEdit, handleDelete}) {

   const leaveRequests = [
      {
         name: "Shams Ohon",
         type: "Alloted Leave",
         start: "2024-07-06",
         end: "2024-07-08",
      },
      {
         name: "Shams Ohon",
         type: "Alloted Leave",
         start: "2024-07-06",
         end: "2024-07-19",
      },
      {
         name: "Shams Ohon",
         type: "Alloted Leave",
         start: "2024-07-06",
         end: "2024-07-06",
      },
   ]

   const {t} = useTranslation();
    return (
      <div className="border my-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
      <thead className="border-b-2 bg-bgBlue">
        <tr>
          <th className="w-1/12">#</th>
          <th className="w-2/12">{t('module.communication.employee_name')}</th>
          <th className="w-2/12">{t('module.communication.leave_type')}</th>
          <th className="w-2/12">{t('module.communication.start_date')}</th>
          <th className="w-2/12">{t('module.communication.end_date')}</th>
          <th className="w-3/12">{t('module.communication.actions')}</th>
        </tr>
      </thead>
      <tbody className="divide-y-2 font-medium">
        {leaveRequests.map((item, index) => (
          <tr key={index} className="text-center">
            <td className="w-1/12">{index+1}</td>
            <td className="w-2/12">{item.name}</td>
            <td className="w-2/12">{item.type}</td>
            <td className="w-2/12">{item.start}</td>
            <td className="w-2/12">{item.end}</td>
            <td className="w-3/12 pb-1">
                <button
                  className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleEdit(item)}
                >
                  {t('module.communication.edit')}
                </button>
                <button
                  className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={()=>handleDelete(item.type)}
                >
                  {t('module.communication.delete')}
                </button>
              </td>
          </tr>
        ))}
      </tbody>
    </table>
      </div>
    );
}