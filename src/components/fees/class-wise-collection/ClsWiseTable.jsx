import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ClsWiseTable() {
  const [allChecked, setAllChecked] = useState(false);
  const [checkedState, setCheckedState] = useState({});
  //console.log(checkedState);

  const [students, setStudents] = useState([
   {
      id: "001",
      title: "Tution Fee - February",
      waiver: 200,
      paidNow: 600,
      due: 400
   },
   {
      id: "002",
      title: "Tution Fee - March",
      waiver: 0,
      paidNow: 0,
      due: 1200
   },
   {
      id: "003",
      title: "Half Yearly Exam Fee",
      waiver: 200,
      paidNow: 600,
      due: 400
   }
  ]);

  function handleChange(e, id, property){
   const index = students.findIndex(item => item.id === id);
   const updatedState = [
      ...students,
   ];
   updatedState[index] = {
      ...updatedState[index],
      [property]: e.target.value
   };
   setStudents(updatedState)
  }

  const handleAllCheckboxChange = () => {
    const newCheckedState = {};
    students.forEach(student => {
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

      const allCheckedNow = students.every(student => newCheckedState[student.id]);
      setAllChecked(allCheckedNow);
    }
  };

  const { t } = useTranslation();

  return (
   <div className="overflow-x-scroll border border-gray-400 my-6 rounded">
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
         <th className="w-2/12 min-w-40">{t("module.fees.fee_head_sub_head")}</th>
         <th className="w-1/12 min-w-28">{t("module.fees.actual_amount")}</th>
         <th className="w-1/12 min-w-28">{t("module.fees.fine_amount")}</th>
         <th className="w-2/12 min-w-28">{t("module.fees.waiver_amount")}</th>
         <th className="w-1/12 min-w-28">{t("module.fees.payable_amount")}</th>
         <th className="w-2/12 min-w-28">{t("module.fees.paid_now")}</th>
         <th className="w-2/12 min-w-28">{t("module.fees.due_amount")}</th>
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
            <td className="w-2/12">{row.title}</td>
            <td className="w-1/12">1200</td>
            <td className="w-1/12">0</td>
            <td className="w-2/12">
               <input type="number"
               value={row.waiver}
               onChange={(e)=> handleChange(e, row.id, "waiver")}
               disabled={!checkedState[row.id]}
               className="bg-gray-100 disabled:bg-white w-full rounded px-2 my-1 border-2 leading-7 border-primary disabled:border-transparent focus:outline-none" />
            </td>
            <td className="w-1/12">1200</td>
            <td className="w-2/12">
               <input type="number"
                  value={row.paidNow}
                  onChange={(e)=> handleChange(e, row.id, "paidNow")}
                  disabled={!checkedState[row.id]}
                  className="bg-gray-100 disabled:bg-white w-full rounded px-2 my-1 border-2 leading-7 border-primary disabled:border-transparent focus:outline-none" />
            </td>
            <td className="w-2/12">
               <input type="number"
                  value={row.due}
                  onChange={(e)=> handleChange(e, row.id, "due")}
                  disabled={!checkedState[row.id]}
                  className="bg-gray-100 disabled:bg-white w-full rounded px-2 my-1 border-2 leading-7 border-primary disabled:border-transparent focus:outline-none" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
   </div>
  );
}
