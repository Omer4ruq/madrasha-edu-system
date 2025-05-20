import { useTranslation } from "react-i18next";
import SectionHeader from "../common/SectionHeader";
import FeeInfoForm from "../forms/FeeInfoForm";
import PaymentStatGraph from "../graphs/PaymentStat";
import PayStatTable from "../tables/PayStatTable";

export default function PaymentStat() {
  const {t} = useTranslation();
  return (
    <div className="rounded-md text-sm bg-white">
      <SectionHeader title={t('module.dashboard.payment_statistics')} />
      <div className="p-2 sm:p-4 rounded-b-md">
        <FeeInfoForm />

        <h5 className="text-textGray text-end text-xs mt-4 mb-2">
        {t('module.dashboard.total_row_found')}: <span className="text-green">40</span>
        </h5>

        {/* table starts from here */}
        <div className="rounded-md border border-bgGreen text-textGray">
          {/* table heading */}
          <h4 className="bg-bgGreen font-bold p-2 text-center rounded-t-md">
          {t('module.dashboard.payment_due_summary')}
          </h4>

          <div className="sm:flex items-center gap-2 sm:pr-2 pb-2">
            {/* chart */}
            <div className="sm:w-1/3">
              <PaymentStatGraph />
              <h3 className="text-center text-lg text-textBlack font-medium">
              {t('module.dashboard.total_student')}
              </h3>
            </div>

            {/* main table */}
            <div className="sm:w-2/3">
              <PayStatTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
