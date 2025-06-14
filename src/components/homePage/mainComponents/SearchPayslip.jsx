import { FaDownload } from "react-icons/fa";
import SectionHeader from "../common/SectionHeader";
import SearchPayslipTable from "../tables/SearchPayslip";

import { useTranslation } from "react-i18next";
export default function SearchPayslip() {
  const { t } = useTranslation();

  return (
    <div className="rounded-md text-sm bg-white">
      <SectionHeader title={t("module.dashboard.search_online_payslip")} />
      <div className="p-2 sm:p-4 space-y-4">
        <h5 className="text-#DB9E30 font-medium tracking-wide text-lg leading-3 pt-2">
          {t("module.dashboard.student_id")}
        </h5>
        <div className="flex items-center gap-4">
          <input
            type="text"
            name="ID"
            placeholder="Type Student ID"
            className="w-9/12 bg-bgGray rounded p-2 text-textBlack font-medium outline-none border-2 border-transparent focus:border-#DB9E30"
          />
          <button className="w-3/12 bg-red text-white p-2 tracking-wide rounded">
            {t("module.dashboard.search")}
          </button>
        </div>

        {/* payslip table */}
        <div className="rounded">
          <h5 className="text-#DB9E30 font-bold bg-bgGreen p-2">
            {t("module.dashboard.payslip_id")}: 1234567
          </h5>
          <SearchPayslipTable />
        </div>

        {/* action buttons */}
        <div className="flex items-center justify-end gap-4">
          <FaDownload className="bg-green text-white rounded w-10 h-10 p-2" />
          <button className="rounded leading-10 px-6 bg-blue text-white font-medium tracking-wider">
            {t("module.dashboard.pay_now")}
          </button>
        </div>
      </div>
    </div>
  );
}
