import { useState } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function AllocationTable({ title, data: propData }) {
  const { t } = useTranslation(); // Initialize useTranslation

  const [data, setData] = useState(propData);

  const handleChange = (event, id) => {
    const updatedData = data.map((item) => {
      if (item.id === id) {
        item.package = event.target.value;
      }
      return item;
    });
    setData(updatedData);
  };

  return (
    <>
      <div className="border my-6 rounded shadow-md">
        <table className="w-full text-sm md:text-base text-textGray leading-6 sm:leading-8">
          <thead className="border-b-2 bg-bgBlue">
            <tr>
              <th className="w-2/12 p-2">{t("module.service.id")}</th> {/* Translate ID header */}
              <th className="w-3/12">{t("module.service.studentName")}</th> {/* Translate Student Name header */}
              <th className="w-2/12">{t("module.service.roll")}</th> {/* Translate Roll header */}
              <th className="w-5/12">{t(title)} {t("module.service.package")}</th> {/* Translate title and Package */}
            </tr>
          </thead>
          <tbody className="divide-y-2 font-medium">
            {data.map((item) => (
              <tr key={item.id} className="text-center">
                <td className="w-2/12">{item.id}</td>
                <td className="w-3/12">{item.name}</td>
                <td className="w-2/12">{item.roll}</td>
                <td className="w-5/12 p-1 pr-2">
                  <select
                    id=""
                    name=""
                    value={item.package}
                    onChange={(event) => handleChange(event, item.id)}
                    className="bg-bgGray w-full rounded px-1 py-[6px] border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
                  >
                    <option value="Package 1 - 1000">{t("module.service.package1")}</option> {/* Translate option */}
                    <option value="Package 2 - 2000">{t("module.service.package2")}</option> {/* Translate option */}
                    <option value="Package 3 - 3000">{t("module.service.package3")}</option> {/* Translate option */}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save and cancel buttons */}
      <div className="flex justify-end items-center gap-4 my-4">
        <button className="bg-blue w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
          {t("module.service.save")} {/* Translate Save button text */}
        </button>

        <button className="bg-red w-24 py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200">
          {t("module.service.cancel")} {/* Translate Cancel button text */}
        </button>
      </div>
    </>
  );
}
