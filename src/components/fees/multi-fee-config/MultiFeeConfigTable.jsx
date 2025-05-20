import { useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";

const colourOptions = [
  { value: "purple", label: "Purple", color: "#5243AA" },
  { value: "orange", label: "Orange", color: "#FF8B00" },
  { value: "yellow", label: "Yellow", color: "#FFC400" },
  { value: "green", label: "Green", color: "#36B37E" },
  { value: "forest", label: "Forest", color: "#00875A" },
];

export default function MultiFeeConfigTable() {
  const [allChecked, setAllChecked] = useState(false);
  const [checkedState, setCheckedState] = useState({});
  const [students, setStudents] = useState([
    {
      id: "001",
      ledger: "Default Ledger",
      fee_head: "Admission Fee",
      amount: 600,
      sub_head_list: "January, February",
      fine_amount: 400,
    },
    {
      id: "002",
      ledger: "Default Ledger",
      fee_head: "Admission Fee",
      amount: 600,
      sub_head_list: "January, February",
      fine_amount: 400,
    },
    {
      id: "003",
      ledger: "Default Ledger",
      fee_head: "Admission Fee",
      amount: 600,
      sub_head_list: "January, February",
      fine_amount: 400,
    },
  ]);

  function handleChange(e, id, property) {
    const index = students.findIndex((item) => item.id === id);
    const updatedState = [...students];
    updatedState[index] = {
      ...updatedState[index],
      [property]: e.target.value,
    };
    setStudents(updatedState);
  }

  const handleAllCheckboxChange = () => {
    const newCheckedState = {};
    students.forEach((student) => {
      newCheckedState[student.id] = !allChecked;
    });
    setCheckedState(newCheckedState);
    setAllChecked(!allChecked);
  };

  const handleCheckboxChange = (id) => {
    const newCheckedState = { ...checkedState, [id]: !checkedState[id] };
    setCheckedState(newCheckedState);

    if (checkedState[id]) {
      setAllChecked(false);
    } else {
      const allCheckedNow = students.every(
        (student) => newCheckedState[student.id]
      );
      setAllChecked(allCheckedNow);
    }
  };

  const { t } = useTranslation();

  return (
    <div
      style={{ overflowX: "auto", overflowY: "visible" }}
      className="border max-h-[500px] border-gray-400 my-6 rounded scrollbar-table"
    >
      <table className="w-full text-sm leading-8">
        <thead className="border-b-2 bg-bgBlue">
          <tr>
            <th className="w-1/12 pt-2 px-2">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={handleAllCheckboxChange}
              />
            </th>
            <th className="w-2/12 min-w-40">{t("module.fees.ledger")}</th>
            <th className="w-1/12 min-w-28">{t("module.fees.fee_head")}</th>
            <th className="w-2/12 min-w-28">{t("module.fees.amount")}</th>
            <th className="w-1/12 min-w-28">{t("module.fees.sub_head")}</th>
            <th className="w-2/12 min-w-28">
              {t("module.fees.sub_head_list")}
            </th>
            <th className="w-2/12 min-w-28">{t("module.fees.fine_amount")}</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 font-medium">
          {students.map((row) => (
            <tr key={row.id} className="text-center even:bg-bgGreen">
              <td className="w-1/12 px-2">
                {/* if this id does not exist in the checkedState object then give a value of false.*/}
                <input
                  type="checkbox"
                  checked={checkedState[row.id] || false}
                  onChange={() => handleCheckboxChange(row.id)}
                />
              </td>
              <td className="w-2/12">{row.ledger}</td>
              <td className="w-2/12">{row.fee_head}</td>

              <td className="w-1/12">
                <input
                  type="number"
                  value={row.amount}
                  onChange={(e) => handleChange(e, row.id, "paidNow")}
                  disabled={!checkedState[row.id]}
                  className="bg-bgGray w-[60px] rounded px-2 my-1 border-2 leading-7 border-gray-600 disabled:border-none disabled:bg-transparent focus:outline-none"
                />
              </td>
              <td className="min-w-[240px] py-3">
                <Select
                  closeMenuOnSelect={false}
                  isMulti
                  isDisabled={!checkedState[row.id]}
                  name="colors"
                  options={colourOptions}
                  styles={{
                    multiValueLabel: (bst) => ({
                      ...bst,
                      lineHeight: "16px",
                      marginBottom: 0,
                    }),
                    input: (bst) => ({ ...bst, height: "30px" }),
                  }}
                />
              </td>
              <td className="w-1/12">{row.sub_head_list}</td>
              <td className="w-1/12">
                <input
                  type="number"
                  value={row.fine_amount}
                  onChange={(e) => handleChange(e, row.id, "paidNow")}
                  disabled={!checkedState[row.id]}
                  className="bg-bgGray w-[60px] rounded px-2 my-1 border-2 leading-7 border-gray-600 disabled:border-none disabled:bg-transparent focus:outline-none"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
