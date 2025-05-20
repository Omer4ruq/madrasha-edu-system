import { useTranslation } from "react-i18next";
import AssignFeeByMonth from "./AssignFeeByMonth";
import AssignedFees from "./AssignedFees";

const FeesMasterForm = () => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 flex flex-col">
          <label className="">{t("module.fees.fee_type")}</label>
          <div className="relative">
            <select
              className="bg-bgGray appearance-none w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
              defaultValue="0"
              name="fee_type"
              id="fee_type"
            >
              <option value="0">{t("module.fees.select_one")}</option>
              <option value="1">{t("module.fees.coaching_fee")}</option>
              <option value="2">{t("module.fees.transport_fee")}</option>
              <option value="3">{t("module.fees.hostel_fee")}</option>
              <option value="4">{t("module.fees.monthly_fee")}</option>
              <option value="5">{t("module.fees.test_exam")}</option>
              <option value="6">{t("module.fees.semester_exam")}</option>
              <option value="7">{t("module.fees.admission_fee")}</option>
              <option value="8">{t("module.fees.stationary_fee")}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="space-y-2 flex flex-col">
          <label className="">{t("module.fees.select_class")}</label>
          <div className="relative">
            <select
              className="bg-bgGray appearance-none w-full rounded p-2 border-2 border-transparent focus:border-primary focus:outline-none"
              defaultValue="0"
              name="class"
              id="class"
            >
              <option value="0">{t("module.fees.select_one")}</option>
              <option value="1">{t("module.fees.one")}</option>
              <option value="2">{t("module.fees.two")}</option>
              <option value="3">{t("module.fees.three")}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-5 gap-5">
        <AssignFeeByMonth />
        <AssignedFees />
      </div>
      <button
        type="submit"
        className="rounded mt-4 w-20 p-2 bg-primary hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200 flex items-center justify-center gap-2"
      >
        {t("module.fees.submit")}
      </button>
    </div>
  );
};

export default FeesMasterForm;
