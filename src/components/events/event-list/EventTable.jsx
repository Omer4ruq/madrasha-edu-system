import { useTranslation } from "react-i18next"; // Import useTranslation

export default function EventTable({ handleEdit, handleDelete }) {
  const { t } = useTranslation(); // Initialize translation function

  const data = [
    {
      name: "Sports Day",
      start: "24th May, 9:00 AM",
      end: "24th May 4:00 PM",
    },
    {
      name: "Cultural Day",
      start: "04th June, 9:00 AM",
      end: "04th June 4:00 PM",
    },
  ];

  return (
    <div className="border my-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th className="w-1/12">{t("events.serial")}</th> {/* Use translation key */}
            <th className="w-4/12">{t("events.title")}</th> {/* Use translation key */}
            <th className="w-2/12">{t("events.start")}</th> {/* Use translation key */}
            <th className="w-2/12">{t("events.end")}</th> {/* Use translation key */}
            <th className="w-3/12">{t("events.actions")}</th> {/* Optional: If you have an actions label */}
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          {data.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="w-1/12">{index + 1}</td>
              <td className="w-4/12">{item.name}</td>
              <td className="w-2/12">{item.start}</td>
              <td className="w-2/12">{item.end}</td>
              <td className="w-3/12 pb-1">
                <button
                  className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleEdit(item)}
                >
                  {t("events.edit")} {/* Use translation key */}
                </button>
                <button
                  className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                  onClick={() => handleDelete(item.name)}
                >
                  {t("events.delete")} {/* Use translation key */}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
