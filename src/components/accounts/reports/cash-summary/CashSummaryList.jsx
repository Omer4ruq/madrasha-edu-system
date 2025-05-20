// import { useTranslation } from "react-i18next";

export default function CashSummaryList() {
  //   const { t } = useTranslation();

  return (
    <div className="border my-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th colSpan={4} className="text-lg py-2 font-medium">
              Income List
            </th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          <tr className="text-center py-2">
            <th colSpan={3} className="border-r-2">
              Regular Income
            </th>
            <th>46660</th>
          </tr>
          <tr className="text-center py-2">
            <td colSpan={3} className="border-r-2">
              ICT Fees
            </td>
            <td>520</td>
          </tr>
          <tr className="text-center py-2">
            <td colSpan={3} className="border-r-2">
              Exam Fee Collection
            </td>
            <td>140</td>
          </tr>
          <tr className="text-center py-2">
            <th colSpan={3} className="border-r-2">
              Total Income
            </th>
            <th>46660</th>
          </tr>
        </tbody>
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th colSpan={4} className="text-lg py-2 font-medium">
              Expense List
            </th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          <tr className="text-center py-2">
            <th colSpan={3} className="border-r-2">
              Regular Expense
            </th>
            <th>46660</th>
          </tr>
          <tr className="text-center py-2">
            <td colSpan={3} className="border-r-2">
              Gas Bill
            </td>
            <td>5200</td>
          </tr>
          <tr className="text-center py-2">
            <th colSpan={3} className="border-r-2">
              Total Expense
            </th>
            <th>46660</th>
          </tr>
        </tbody>
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th colSpan={4} className="text-lg py-2 font-medium">
              Contra List
            </th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          <tr className="text-center py-2">
            <th className="border-r-2">Name</th>
            <th className="border-r-2">Debit</th>
            <th className="border-r-2">Credit</th>
            <th></th>
          </tr>
          <tr className="text-center py-2">
            <td className="border-r-2">Cash</td>
            <td className="border-r-2">5200</td>
            <td className="border-r-2">432</td>
            <td></td>
          </tr>
          <tr className="text-center py-2">
            <td className="border-r-2">Bank</td>
            <td className="border-r-2">123</td>
            <td className="border-r-2">5432</td>
            <td></td>
          </tr>
          <tr className="text-center py-2">
            <th colSpan={3} className="border-r-2">
              Operating Surplus(Deficit)
            </th>
            <th>46660</th>
          </tr>
        </tbody>
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th colSpan={4} className="text-lg py-2 font-medium">
              Plus Non Operating Movements
            </th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          <tr className="text-center py-2">
            <th colSpan={3} className="border-r-2">
              Net Cash Movement
            </th>
            <th>46660</th>
          </tr>
          <tr className="text-center py-2">
            <th colSpan={3} className="border-r-2">
              Opening Balance
            </th>
            <th>46660</th>
          </tr>
          <tr className="text-center py-2">
            <td colSpan={3} className="border-r-2">
              Bank
            </td>
            <td>5200</td>
          </tr>
          <tr className="text-center py-2">
            <td colSpan={3} className="border-r-2">
              Cash
            </td>
            <td>5200</td>
          </tr>
          <tr className="text-center py-2">
            <th colSpan={3} className="border-r-2">
              Closing Balance
            </th>
            <th>46660</th>
          </tr>
          <tr className="text-center py-2">
            <td colSpan={3} className="border-r-2">
              Bank
            </td>
            <td>5200</td>
          </tr>
          <tr className="text-center py-2">
            <td colSpan={3} className="border-r-2">
              Cash
            </td>
            <td>5200</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
