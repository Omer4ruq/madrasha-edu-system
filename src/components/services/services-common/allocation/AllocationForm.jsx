import { useTranslation } from "react-i18next"; // Import useTranslation

export default function AllocationForm() {
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <form className="md:flex gap-7 items-center justify-between mb-2">
      <div className="flex items-center gap-2 md:w-5/12 my-2">
        <label className="w-32">{t("module.service.selectClass")}</label> {/* Translate label */}
        <select
          id=""
          name=""
          defaultValue={t("module.service.class")}
          className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
        >
          <option value={t("module.service.class")}>{t("module.service.class")}</option> {/* Translate option */}
          <option value="Nursery">{t("module.service.nursery")}</option> {/* Translate options */}
          <option value="One">{t("module.service.one")}</option>
          <option value="Two">{t("module.service.two")}</option>
          <option value="Three">{t("module.service.three")}</option>
          <option value="Four">{t("module.service.four")}</option>
          <option value="Five">{t("module.service.five")}</option>
        </select>
      </div>

      <div className="flex items-center gap-2 md:w-5/12 my-2">
        <label className="w-36">{t("module.service.selectSection")}</label> {/* Translate label */}
        <select
          id=""
          name=""
          className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
        >
          <option value={t("module.service.section")}>{t("module.service.section")}</option> {/* Translate option */}
          <option value="Jaba">{t("module.service.jaba")}</option> {/* Translate options */}
          <option value="Golap">{t("module.service.golap")}</option>
        </select>
      </div>

      {/* create button */}
      <div className="flex items-center gap-2 md:w-2/12 justify-end my-4">
        <button
          type="submit"
          className="rounded w-full p-[10px] bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200"
        >
          {t("module.service.submit")} {/* Translate button text */}
        </button>
      </div>
    </form>
  );
}
