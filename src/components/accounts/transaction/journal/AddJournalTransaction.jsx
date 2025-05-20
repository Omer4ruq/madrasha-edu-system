import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function AddJournalTransaction() {
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
  const [transactionItems, setTransactionItems] = useState([
    { ledger_type: "", debit: 0, credit: 0 },
  ]);
  const { t } = useTranslation();

  function handleAddItem() {
    setTransactionItems([...transactionItems, { ledger_type: "0", amount: 0 }]);
  }

  function handleDeleteItem(index) {
    const filteredItems = transactionItems.filter((_, i) => i !== index);
    setTransactionItems(filteredItems);
  }

  function handleChangleLedgerType(index, value) {
    const updatedItems = [...transactionItems];
    updatedItems[index].ledger_type = value;
    setTransactionItems(updatedItems);
  }
  function handleChangleLedgerDebit(index, value) {
    const updatedItems = [...transactionItems];
    updatedItems[index].debit = Number(value);
    setTransactionItems(updatedItems);

    const totalDebit = transactionItems.reduce((acc, item) => {
      return acc + item.debit;
    }, 0);
    setTotalDebit(totalDebit);
  }
  function handleChangleLedgerCredit(index, value) {
    const updatedItems = [...transactionItems];
    updatedItems[index].credit = Number(value);
    setTransactionItems(updatedItems);

    const totalCredit = transactionItems.reduce((acc, item) => {
      return acc + item.credit;
    }, 0);
    setTotalCredit(totalCredit);
  }
  return (
    <div className="border my-6 rounded shadow-md">
      <table className="w-full text-textGray text-sm leading-6 sm:leading-8">
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th className="">{t("module.accounts.ledger_name")}</th>
            <th className="">{t("module.accounts.debit")}</th>
            <th className="">{t("module.accounts.credit")}</th>
            <th className="">{t("module.accounts.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          {transactionItems?.map((item, index, arr) => (
            <>
              {arr.length - 1 !== index ? (
                <tr key={index} className="text-center transition-all">
                  <td className="px-5">
                    <select
                      onChange={(e) =>
                        handleChangleLedgerType(index, e.target.value)
                      }
                      defaultValue={item.ledger_type}
                      className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Amount"
                      name="write_note"
                      id="write_note"
                    >
                      <option value="0">Select Ledger</option>
                      <option value="Fixed Asset">Fixed Asset</option>
                      <option value="Cash & Cash Equivalance">
                        Cash & Cash Equivalance
                      </option>
                      <option value="Account Recievable">
                        Account Recievable
                      </option>
                      <option value="OFPS Account">OFPS Account</option>
                      <option value="Long Term Liability">
                        Long Term Liability
                      </option>
                      <option value="Short Term Liability">
                        Short Term Liability
                      </option>
                      <option value="Owner's Equity">Owner's Equity</option>
                      <option value="Account Payable">Account Payable</option>
                      <option value="Regular Income">Regular Income</option>
                      <option value="Others Income">Others Income</option>
                      <option value="Regular Expense">Regular Expense</option>
                      <option value="Others Expense">Others Expense</option>
                      <option value="General Expense">General Expense</option>
                    </select>
                  </td>
                  <td className="px-5 py-2">
                    <input
                      onChange={(e) =>
                        handleChangleLedgerDebit(index, e.target.value)
                      }
                      disabled={item.credit > 0}
                      defaultValue={item.debit}
                      className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Amount"
                      name="write_note"
                      id="write_note"
                      type="text"
                    />
                  </td>
                  <td className="px-5 py-2">
                    <input
                      onChange={(e) =>
                        handleChangleLedgerCredit(index, e.target.value)
                      }
                      disabled={item.debit > 0}
                      defaultValue={item.credit}
                      className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Amount"
                      name="write_note"
                      id="write_note"
                      type="text"
                    />
                  </td>
                  <td className="">
                    <button
                      className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                      onClick={() => handleDeleteItem(index)}
                    >
                      {t("module.accounts.delete")}
                    </button>
                  </td>
                </tr>
              ) : (
                <tr className="text-center">
                  <td className="px-5 py-2">
                    <select
                      onChange={(e) =>
                        handleChangleLedgerType(index, e.target.value)
                      }
                      defaultValue={item.ledger_type}
                      className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Amount"
                      name="write_note"
                      id="write_note"
                    >
                      <option value="0">Select Ledger</option>
                      <option value="Fixed Asset">Fixed Asset</option>
                      <option value="Cash & Cash Equivalance">
                        Cash & Cash Equivalance
                      </option>
                      <option value="Account Recievable">
                        Account Recievable
                      </option>
                      <option value="OFPS Account">OFPS Account</option>
                      <option value="Long Term Liability">
                        Long Term Liability
                      </option>
                      <option value="Short Term Liability">
                        Short Term Liability
                      </option>
                      <option value="Owner's Equity">Owner's Equity</option>
                      <option value="Account Payable">Account Payable</option>
                      <option value="Regular Income">Regular Income</option>
                      <option value="Others Income">Others Income</option>
                      <option value="Regular Expense">Regular Expense</option>
                      <option value="Others Expense">Others Expense</option>
                      <option value="General Expense">General Expense</option>
                    </select>
                  </td>
                  <td className="px-5">
                    <input
                      onChange={(e) =>
                        handleChangleLedgerDebit(index, e.target.value)
                      }
                      disabled={item.credit > 0}
                      defaultValue={item.debit}
                      className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Amount"
                      name="write_note"
                      id="write_note"
                      type="text"
                    />
                  </td>
                  <td className="px-5">
                    <input
                      onChange={(e) =>
                        handleChangleLedgerCredit(index, e.target.value)
                      }
                      disabled={item.debit > 0}
                      defaultValue={item.credit}
                      className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Amount"
                      name="write_note"
                      id="write_note"
                      type="text"
                    />
                  </td>
                  <td className="">
                    <button
                      className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                      onClick={() => handleAddItem()}
                    >
                      {t("module.accounts.add")}
                    </button>
                  </td>
                </tr>
              )}
              
            </>
          ))}
          <tr>
                <td className="text-center">Total</td>
                <td className="text-center py-2">{totalDebit}</td>
                <td className="text-center py-2">{totalCredit}</td>
                <td></td>
              </tr>
        </tbody>
      </table>
    </div>
  );
}
