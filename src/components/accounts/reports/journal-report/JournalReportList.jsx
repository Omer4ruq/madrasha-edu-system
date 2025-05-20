// import { useTranslation } from "react-i18next";

export default function JournalReportList() {
    //   const { t } = useTranslation();
  
    return (
      <div className="border my-6 rounded shadow-md">
        <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
          <thead className="border-b-2 bg-bgBlue">
            <tr>
              <th colSpan={3} className="py-2 font-medium">
              Receipt Voucher, Vouche ID: 84, Trn. Date: 2024-11-04
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 font-medium">
            <tr className="text-center py-2">
              <th className="border-r-2">
                Account Ledger
              </th>
              <th className="border-r-2">
                Debit
              </th>
              <th>Credit</th>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                ICT Fees
              </td>
              <td className="border-r-2">
                0
              </td>
              <td>520</td>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                Cash
              </td>
              <td className="border-r-2">
                520
              </td>
              <td>0</td>
            </tr>
            <tr className="text-center py-2">
              <th className="border-r-2">
                Total
              </th>
              <th className="border-r-2">
                520
              </th>
              <th>520</th>
            </tr>
          </tbody>
          
          <thead className="border-b-2 bg-bgBlue">
            <tr>
              <th colSpan={3} className="py-2 font-medium">
              Payment Voucher, Vouche ID: 84, Trn. Date: 2024-11-04
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 font-medium">
            <tr className="text-center py-2">
              <th className="border-r-2">
                Account Ledger
              </th>
              <th className="border-r-2">
                Debit
              </th>
              <th>Credit</th>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                Gas Bill
              </td>
              <td className="border-r-2">
                1000
              </td>
              <td>0</td>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                Cash
              </td>
              <td className="border-r-2">
                0
              </td>
              <td>1000</td>
            </tr>
            <tr className="text-center py-2">
              <th className="border-r-2">
                Total
              </th>
              <th className="border-r-2">
                1000
              </th>
              <th>1000</th>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  