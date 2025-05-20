// import { useTranslation } from "react-i18next";

export default function LedgerSummaryTable() {
  //   const { t } = useTranslation();

  return (
    <div className="border my-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th className="font-medium border-r-2">Ledger Name</th>
            <th className="font-medium border-r-2">Debit</th>
            <th className="font-medium border-r-2">Credit</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          <tr className="text-center py-2">
            <td className="border-r-2">ICT Fees</td>
            <td className="border-r-2">1000</td>
            <td className="border-r-2">3000</td>
          </tr>
          <tr className="text-center py-2">
            <td className="border-r-2">ICT Fees</td>
            <td className="border-r-2">1000</td>
            <td className="border-r-2">3000</td>
          </tr>
          <tr className="text-center py-2">
            <td className="border-r-2">ICT Fees</td>
            <td className="border-r-2">1000</td>
            <td className="border-r-2">3000</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
