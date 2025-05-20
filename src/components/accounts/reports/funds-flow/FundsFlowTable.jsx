// import { useTranslation } from "react-i18next";

export default function FundsFlowTable() {
    //   const { t } = useTranslation();
  
    return (
      <div className="border my-6 rounded shadow-md">
        <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
          <thead className="border-b-2 bg-bgBlue">
            <tr>
              <th rowSpan={2} className="font-medium border-r-2">
                Particulars
              </th>
              <th colSpan={2} className="font-medium border-r-2">
                Working Capital
              </th>
              <th rowSpan={2} className="font-medium">
                Funds Flow
              </th>
            </tr>
            <tr>
                <th className="font-medium border-r-2 border-t-2">Opening</th>
                <th className="font-medium border-r-2 border-t-2">Closing</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 font-medium">
            <tr className="text-center py-2">
              <td className="border-r-2">
                January
              </td>
              <td className="border-r-2">
                0
              </td>
              <td className="border-r-2">
                7100
              </td>
              <td>7100</td>
            </tr>
            <tr className="text-center py-2">
              <td className="border-r-2">
                February
              </td>
              <td className="border-r-2">
                7000
              </td>
              <td className="border-r-2">
                14100
              </td>
              <td>7100</td>
            </tr>
            
          </tbody>
          
        </table>
      </div>
    );
  }
  