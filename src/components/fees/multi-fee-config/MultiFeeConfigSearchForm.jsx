import { useTranslation } from "react-i18next";

const MultiFeeConfigSearchForm = () => {
  const { t } = useTranslation();

  return (
    <form>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label>{t("module.fees.select_year")}</label>

          <select
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
            defaultValue="0"
            name="select_year"
            id="select_year"
          >
            <option value="">{t("module.fees.select_year")}</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div className="space-y-2">
          <label>{t("module.fees.select_class")}</label>

          <select
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
            defaultValue="0"
            name="select_class"
            id="select_class"
          >
            <option value="">{t("module.fees.select_class")}</option>
            <option value="Jaba">One</option>
            <option value="Golap">Two</option>
          </select>
        </div>

        <div className="space-y-2">
          <label>{t("module.fees.select_group")}</label>

          <select
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
            defaultValue="0"
            name="select_group"
            id="select_group"
          >
            <option value="">{t("module.fees.select_group")}</option>
            <option value="Jaba">Jaba</option>
            <option value="Golap">Golap</option>
          </select>
        </div>

        <div className="space-y-2">
          <label>{t("module.fees.select_category")}</label>
          <select
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
            defaultValue=""
            name="select_category"
            id="select_category"
          >
            <option value="" disabled>
              {t("module.fees.select_category")}
            </option>
            <option value="01">Category 1</option>
            <option value="01">Category 2</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded mt-4 w-44 p-2 bg-primary hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200 flex items-center justify-center gap-2"
        >
          {t("module.fees.save")}
        </button>
      </div>
    </form>
  );
};

export default MultiFeeConfigSearchForm;
