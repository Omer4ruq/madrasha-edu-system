import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const parents = [
  {
    id: "001",
    parentName: "Ayman Hasin Sikdar",
    parentMobile: "01234567890",
    gender: "Male",
    relation: "Father",
    motherName: "Mrs. Halima Khatun",
    motherMobile: "01234567890",
  },
  {
    id: "002",
    parentName: "Salman Khan",
    parentMobile: "01234567890",
    gender: "Male",
    relation: "Father",
    motherName: "Salma Jahan",
    motherMobile: "01234567890",
  },
];

export default function PListTable({ handleDelete }) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-scroll border mt-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm">
        <thead className="border-b-2 bg-bgBlue leading-8">
          <tr>
            <th className="min-w-10 text-start pl-2">#</th>
            <th className="min-w-36 text-start">{t("module.communication.parent_name")}</th>
            <th className="min-w-28 text-start">{t("module.communication.mobile")}</th>
            <th className="min-w-16 text-start">{t("module.communication.gender")}</th>
            <th className="min-w-20 text-start">{t("module.communication.relation")}</th>
            <th className="min-w-36 text-start">{t("module.communication.father_name")}</th>
            <th className="min-w-[115px] text-start">{t("module.communication.father_mobile")}</th>
            <th className="min-w-36 text-start">{t("module.communication.mother_name")}</th>
            <th className="min-w-[115px] text-start">{t("module.communication.mother_mobile")}</th>
            <th className="min-w-40 text-center">{t("module.communication.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          {parents.map((item, index) => (
            <tr key={index} className="text-start leading-8 even:bg-slate-200">
              <td className="min-w-10 pl-2">{index + 1}</td>
              <td className="min-w-36">{item.parentName}</td>
              <td className="min-w-28">{item.parentMobile}</td>
              <td className="min-w-16">{item.gender}</td>
              <td className="min-w-20">{item.relation}</td>
              <td className="min-w-36">{item.parentName}</td>
              <td className="min-w-[115px]">{item.parentMobile}</td>
              <td className="min-w-36">{item.motherName}</td>
              <td className="min-w-[115px]">{item.motherMobile}</td>
              <td className="min-w-40 pb-1 text-center">
                <Link to={`/parent-info/edit-parent/${item.id}`}>
                  <button
                    className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  >
                    {t("module.communication.edit")}
                  </button>
                </Link>
                <button
                  className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleDelete(item.parentName)}
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
