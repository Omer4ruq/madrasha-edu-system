import { useTranslation } from "react-i18next";

export default function TimeWithHeadForm() {
  const { t } = useTranslation();

  return (
    <form className="md:flex gap-7 items-center justify-between mb-2">
      <div className="flex items-center gap-2 md:w-5/12 my-2">
        <label className="w-32">{t("module.report.selectDate")}</label>
        <input
          type="date"
          className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2 md:w-5/12 my-2">
        <label className="w-32">{t("module.report.selectHead")}</label>
        <select
          className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
        >
          <option value="Tution Fees">{t("module.report.tutionFees")}</option>
          <option value="Yearly Fees">{t("module.report.yearlyFees")}</option>
          <option value="Other">{t("module.report.other")}</option>
        </select>
      </div>

      {/* Submit button */}
      <div className="flex items-center gap-2 md:w-2/12 justify-end my-4">
        <button
          type="submit"
          className="rounded w-full p-3 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200"
        >
          {t("module.report.submit")}
        </button>
      </div>
    </form>
  );
}
