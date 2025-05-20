import { useTranslation } from "react-i18next";

export default function FundInfoTable() {
  const { t } = useTranslation();
  
  const funds = [
    {
      date: "12/04/2023",
      name: "General",
      debit: 1234,
      credit: 1234,
      remaining: 1234,
    },
    // ... (other fund entries remain unchanged)
  ];

  return (
    <div className="mt-4">
      <h5 className="text-textGray text-end text-xs mb-2">
        {t("module.dashboard.total_fund_available")}: <span className="text-red">2,50,000</span>
      </h5>
      <table className="w-full text-center">
        <thead>
          <tr className="bg-bgGreen text-textGray font-bold ">
            <td className="w-[20%] py-2">{t("module.dashboard.date")}</td>
            <td className="w-[20%] py-2">{t("module.dashboard.fund_name")}</td>
            <td className="w-[20%] py-2">{t("module.dashboard.debit")}</td>
            <td className="w-[20%] py-2">{t("module.dashboard.credit")}</td>
            <td className="w-[20%] py-2">{t("module.dashboard.remaining")}</td>
          </tr>
        </thead>
      </table>
      <div className="h-52 overflow-y-auto bg-bgBlue scrollbar-table">
        <table className="w-full text-center text-textGray divide-y">
          <tbody>
            {funds.map((fund, index) => (
              <tr key={index} className="border-b border-white">
                <td className="w-[20%] py-1">{fund.date}</td>
                <td className="w-[20%] py-1">{fund.name}</td>
                <td className="w-[20%] py-1">{fund.debit}</td>
                <td className="w-[20%] py-1">{fund.credit}</td>
                <td className="w-[20%] py-1">{fund.remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
