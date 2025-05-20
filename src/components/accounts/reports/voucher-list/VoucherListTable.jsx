// import { useTranslation } from "react-i18next";

export default function VoucherListTable() {
  //   const { t } = useTranslation();

  return (
    <div className="border my-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th className="font-medium border-r-2">User Name</th>
            <th className="font-medium border-r-2">Date</th>
            <th className="font-medium border-r-2">Ledger Name</th>
            <th className="font-medium border-r-2">Trn Type</th>
            <th className="font-medium border-r-2">Amount</th>
            <th className="font-medium border-r-2">Voucher Id</th>
            <th className="font-medium border-r-2">Voucher Note</th>
            <th className="font-medium border-r-2">Voucher No</th>
            <th className="font-medium">Download</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          <tr className="text-center py-2">
            <td className="border-r-2">Abu Sayeed</td>
            <td className="border-r-2">05/11/2023</td>
            <td className="border-r-2">Tution Fee</td>
            <td className="border-r-2">Reciept</td>
            <td className="border-r-2">500</td>
            <td className="border-r-2">88</td>
            <td className="border-r-2">Manual Fee Collection</td>
            <td className="border-r-2">1122</td>
            <td>
              <button className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1">
                Download
              </button>
            </td>
          </tr>
          <tr className="text-center py-2">
            <td className="border-r-2">Abu Sayeed</td>
            <td className="border-r-2">05/11/2023</td>
            <td className="border-r-2">Tution Fee</td>
            <td className="border-r-2">Reciept</td>
            <td className="border-r-2">500</td>
            <td className="border-r-2">88</td>
            <td className="border-r-2">Manual Fee Collection</td>
            <td className="border-r-2">1122</td>
            <td>
              <button className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1">
                Download
              </button>
            </td>
          </tr>
          <tr className="text-center py-2">
            <td className="border-r-2">Abu Sayeed</td>
            <td className="border-r-2">05/11/2023</td>
            <td className="border-r-2">Tution Fee</td>
            <td className="border-r-2">Reciept</td>
            <td className="border-r-2">500</td>
            <td className="border-r-2">88</td>
            <td className="border-r-2">Manual Fee Collection</td>
            <td className="border-r-2">1122</td>
            <td>
              <button className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1">
                Download
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
