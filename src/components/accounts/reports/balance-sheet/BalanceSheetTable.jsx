// import { useTranslation } from "react-i18next";

export default function BalanceSheetTable() {
    //   const { t } = useTranslation();
  
    return (
      <div className="border my-6 rounded shadow-md">
        <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
          <thead className="border-b-2 bg-bgBlue">
            <tr>
              <th className="font-medium border-r-2">
                Account Ledger
              </th>
              <th className="font-medium border-r-2">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 font-medium">
            <tr className="text-center py-2">
              <th colSpan={2} className="border-r-2 py-1">
                Fixed Asset
              </th>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                Computer
              </td>
              <td>520</td>
            </tr>
            <tr className="text-center py-2">
              <th className="border-r-2">
                Total
              </th>
              <th>520</th>
            </tr>
            <tr className="text-center py-2">
              <th colSpan={2} className="border-r-2 py-1">
                Cash & Cash Equivalance
              </th>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                Cash
              </td>
              <td  className="border-r-2">4533333</td>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                Bank
              </td>
              <td>33333333</td>
            </tr>
            <tr className="text-center py-2">
              <th className="border-r-2">
                Total
              </th>
              <th>533320</th>
            </tr>
            <tr className="text-center py-2">
              <th colSpan={2} className="border-r-2 py-1">
                Account Recievable
              </th>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                Fees
              </td>
              <td>52000</td>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                Admission Fee
              </td>
              <td>-33333</td>
            </tr>
            <tr className="text-center py-2">
              <th className="border-r-2">
                Total
              </th>
              <th>533320</th>
            </tr>
            
            <tr className="text-center py-2">
              <th className="border-r-2">
                Profit
              </th>
              <th>5330</th>
            </tr>
          </tbody>
          
        </table>
      </div>
    );
  }
  