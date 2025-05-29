import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetStaffListApIQuery } from "../../../../redux/features/api/staff/staffListApi";

export const staffs = [
   {
      id: "001",
      name: "Md. Hafijur Rahman",
      role: "Accountant",
      designation: "Accountant",
      jobType: "permanent",
      mobile: "01234567890",
      gender: "Male",
   },
   {
      id: "003",
      name: "Md. Hafijur Rahman",
      role: "Accountant",
      designation: "Accountant",
      jobType: "permanent",
      mobile: "01234567890",
      gender: "Male",
   },
   {
      id: "007",
      name: "Md. Hafijur Rahman",
      role: "Accountant",
      designation: "Accountant",
      jobType: "permanent",
      mobile: "01234567890",
      gender: "Male",
   },
];

export default function SListTable({ handleDelete }) {
   const { t } = useTranslation();
   const {data , isLoading: isListLoading, error: listError} = useGetStaffListApIQuery()
const staffList = data?.staffs   
console.log(data)

   return (
      <div className="overflow-x-scroll border mt-6 rounded shadow-md">
         <table className="w-full text-textGray text-sm">
            <thead className="border-b-2 bg-bgBlue leading-8">
               <tr>
                  <th className="min-w-10 text-start pl-2">#</th>
                  <th className="min-w-12 text-start">{t("module.communication.user_id")}</th>
                  <th className="min-w-[72px] text-start">{t("module.communication.picture")}</th>
                  <th className="min-w-36 text-start">{t("module.communication.name")}</th>
                  <th className="min-w-20 text-start">{t("module.communication.role")}</th>
                  <th className="min-w-16 text-start">{t("module.communication.email")}</th>
                  <th className="min-w-28 text-start">{t("module.communication.designation")}</th>
                  <th className="min-w-20 text-start">{t("module.communication.job_type")}</th>
                  <th className="min-w-20 text-start">{t("module.communication.mobile")}</th>
                  <th className="min-w-40 text-center">{t("module.communication.actions")}</th>
               </tr>
            </thead>
            <tbody className="divide-y-2 font-medium">
               {staffList?.map((item, index) => (
                  <tr key={index} className="text-start leading-8 even:bg-slate-200">
                     <td className="min-w-10 pl-2">#</td>
                     <td className="min-w-12">{item.id}</td>
                     <td className="min-w-[72px]">
                        <img
                           src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp0Bjks3GU1iN8K5J-D9JIcL2OR2rF4WX6mg&s"
                           className="w-8 h-8 rounded-full ml-2"
                           alt={t("module.communication.picture")}
                        />
                     </td>
                     <td className="min-w-36">{item?.name}</td>
                     <td className="min-w-20">{item?.role}</td>
                     <td className="min-w-16">{item?.gender}</td>
                     <td className="min-w-28">{item?.designation}</td>
                     <td className="min-w-20">{item?.jobType}</td>
                     <td className="min-w-20">{item?.mobile}</td>
                     <td className="min-w-40 pb-1 text-center">
                        <Link to={`/staff-info/edit-staff/${item.id}`}>
                           <button
                              className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                           >
                              {t("module.communication.edit")}
                           </button>
                        </Link>
                        <button
                           className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                           onClick={() => handleDelete(item.name)}
                        >
                           {t("module.communication.delete")}
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
}
