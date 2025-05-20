// import { useTranslation } from "react-i18next";

export default function DateWiseLedgerTable() {
    //   const { t } = useTranslation();
  
    return (
      <div className="border my-6 rounded shadow-md">
        <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
          <thead className="border-b-2 bg-bgBlue">
            <tr>
              <th className="font-medium border-r-2">
                Transaction Date
              </th>
              <th className="font-medium border-r-2">
                Debit
              </th>
              <th className="font-medium">
                Credit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 font-medium">
            <tr className="text-center py-2">
              <th colSpan={3} className="border-r-2 py-1">
                Fixed Asset
              </th>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                22-10-2023
              </td>
              <td  className="border-r-2">0</td>
              <td>520</td>
            </tr>
            <tr className="text-center py-2">
              <th className="border-r-2">
                Total
              </th>
              <th  className="border-r-2">0</th>
              <th>520</th>
            </tr>
            <tr className="text-center py-2">
              <th colSpan={3} className="border-r-2 py-1">
                Cash & Cash Equivalance
              </th>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                23-10-2023
              </td>
              <td  className="border-r-2">4533333</td>
              <td>520</td>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
              24-10-2023
              </td>
              <td  className="border-r-2">0</td>
              <td>33333333</td>
            </tr>
            <tr className="text-center py-2">
              <th className="border-r-2">
                Total
              </th>
              <th  className="border-r-2">43333332</th>
              <th>533320</th>
            </tr>
            <tr className="text-center py-2">
              <th colSpan={3} className="border-r-2 py-1">
                Regular Income
              </th>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
              25-10-2023
              </td>
              <td  className="border-r-2">0</td>
              <td>52000</td>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                26-10-2023
              </td>
              <td  className="border-r-2">0</td>
              <td>33333333</td>
            </tr>
            <tr className="text-center py-2">
              <th className="border-r-2">
                Total
              </th>
              <th  className="border-r-2">0</th>
              <th>533320</th>
            </tr>
            <tr className="text-center py-2">
              <th colSpan={3} className="border-r-2 py-1">
                Regular Expense
              </th>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
              25-10-2023
              </td>
              <td  className="border-r-2">52000</td>
              <td>0</td>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
              27-10-2023
              </td>
              <td  className="border-r-2">33333333</td>
              <td>0</td>
            </tr>
            <tr className="text-center py-2">
              <th className="border-r-2">
                Total
              </th>
              <th  className="border-r-2">533320</th>
              <th>0</th>
            </tr>
            <tr className="text-center py-2">
              <th className="border-r-2">
                Grand Total
              </th>
              <th  className="border-r-2">533320</th>
              <th>533320</th>
            </tr>
          </tbody>
          
        </table>
      </div>
    );
  }
  