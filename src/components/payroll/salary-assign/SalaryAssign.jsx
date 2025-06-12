import { useState } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import "../../../styles/salary-assign.css";

const SalaryAssign = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [allChecked, setAllChecked] = useState(false);
  const [checkedState, setCheckedState] = useState({});
  const students = [
    {
      id: "001",
      name: "Zabbar Shah",
      designation: "Manager",
      basic_salary: 10000,
      addition: 20000,
      deduction: 0,
    },
    {
      id: "002",
      name: "Gabbar Shah",
      designation: "Officer",
      basic_salary: 100000,
      addition: 20000,
      deduction: 10000,
    },
  ];

  const [employeeData, setEmployeeData] = useState(students);

  function updateEmployeeData(index, property, value) {
    const newData = [...employeeData];
    newData[index][property] = Number(value);
    setEmployeeData(newData);
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

  return (
    <div className="bg-white rounded-md p-4 md:p-6 my-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-medium">{t("module.payroll.createFee")}</h3>
        <button
          type="submit"
          className="rounded w-20 p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200 flex items-center justify-center gap-2"
        >
          {t("module.payroll.listFee")}
        </button>
      </div>
      <div className="border rounded shadow-md bg-white">
        <table className="w-full text-textGray text-sm leading-8">
          <thead className="border-b-2 bg-bgBlue">
            <tr>
              <th className="w-1/12 pt-2">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleAllCheckboxChange}
                />
              </th>
              <th className="px-1 whitespace-nowrap w-1/12 pt-1">{t("module.payroll.id")}</th>
              <th className="px-1 whitespace-nowrap w-2/12 pt-1">{t("module.payroll.name")}</th>
              <th className="px-1 whitespace-nowrap w-2/12 pt-1">
                {t("module.payroll.designation")}
              </th>
              <th className="px-1 whitespace-nowrap w-2/12 pt-1">
                {t("module.payroll.netSalary")}
              </th>
              <th className="px-1 whitespace-nowrap w-2/12 pt-1">
                {t("module.payroll.basicSalary")}
              </th>
              <th className="px-1 whitespace-nowrap w-1/12 pt-1">
                {t("module.payroll.+Addition")}
              </th>
              <th className="px-1 whitespace-nowrap w-1/12 pt-1">
                {t("module.payroll.-Deduction")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 font-medium">
            {employeeData.map((row, i) => (
              <tr key={row.id} className="text-center">
                <td className="px-1 whitespace-nowrap w-1/12">
                  <input
                    type="checkbox"
                    checked={checkedState[row.id] || false}
                    onChange={() => handleCheckboxChange(row.id)}
                  />
                </td>
                <td className="px-1 whitespace-nowrap w-1/12">{row.id}</td>
                <td className="px-1 whitespace-nowrap w-2/12">{row.name}</td>
                <td className="px-1 whitespace-nowrap w-2/12">{row.designation}</td>
                <td className="px-1 whitespace-nowrap w-2/12">
                  {row.basic_salary + row.addition - row.deduction}
                </td>
                <td className="px-1 whitespace-nowrap w-2/12">
                  <input
                    onChange={(e) =>
                      updateEmployeeData(i, "basic_salary", e.target.value)
                    }
                    className="px-1 whitespace-nowrap w-16 disabled:bg-transparent disabled:border-none border pl-1 my-1"
                    disabled={!checkedState[row.id]}
                    type="number"
                    defaultValue={row.basic_salary}
                  />
                </td>
                <td className="px-1 whitespace-nowrap w-1/12">
                  <input
                    onChange={(e) =>
                      updateEmployeeData(i, "addition", e.target.value)
                    }
                    className="px-1 whitespace-nowrap w-16 disabled:bg-transparent disabled:border-none border pl-1 my-1"
                    disabled={!checkedState[row.id]}
                    type="number"
                    defaultValue={row.addition}
                  />
                </td>
                <td className="px-1 whitespace-nowrap w-1/12">
                  <input
                    onChange={(e) =>
                      updateEmployeeData(i, "deduction", e.target.value)
                    }
                    className="w-16 disabled:bg-transparent disabled:border-none border pl-1 my-1"
                    disabled={!checkedState[row.id]}
                    type="number"
                    defaultValue={row.deduction}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryAssign;
