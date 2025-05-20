import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ChooseSubTable() {
  const [allChecked, setAllChecked] = useState(false);
  const [checkedState, setCheckedState] = useState({});
  //console.log(checkedState);

  const students = [
    {
      id: '001',
      name: "Zabbar Shah",
      roll: 10,
      class: "one",
      section: "Tiger"
    },
    {
      id: '002',
      name: "Alim Mia",
      roll: 2,
      class: "one",
      section: "Tiger"
    },
    {
      id: '003',
      name: "Halim Jaman",
      roll: 5,
      class: "one",
      section: "Tiger"
    },
  ];

  //when clicked on the allCheckedbox, take the whole students array and update each one of them with the opposite value of the current allChacked state.
  const handleAllCheckboxChange = () => {
    const newCheckedState = {};
    students.forEach(student => {
      //sob state er jonno allChecked er current value er opposite ta assign koro. 
      newCheckedState[student.id] = !allChecked;
    });
    //update the checkedState object
    setCheckedState(newCheckedState);
    //update the allChecked with opposite value
    setAllChecked(!allChecked);
  };

  //handle single checkbox and check+update whether all checkboxes have been checked or not. So that the ui automatically updated the allCheckbox state even if user manually selects all students. This much code in this function, for this simple feature. 
  const handleCheckboxChange = (id) => {
   //spread the current checkedState object. inside the object [id] will create a new entry or modify the existing entry.
   //means for example, 002:!checkedState.002;
    const newCheckedState = { ...checkedState, [id]: !checkedState[id] };
    //console.log([id], !checkedState[id]);
    //update the checkedState object.
    setCheckedState(newCheckedState);

    // If any checkbox is unchecked, uncheck the "allCheckbox"
    //render hobe puro eventListener complete hle. tai, apatoto current state tai dekhte pabo sudhu. so, current state ta jodi true thake, tarmane, amra setake false banacchi ekhn, jeta render hobar por update hobe. 
    //tai, checkedState.002 (for example) = true hle, take amra false banacchi, sejonno allChecked k false kori.
    if (checkedState[id]) {
      setAllChecked(false);
    } else {
      //Check if all checkboxes are checked. 
      //if, already false, then check, if each one of the rest of the students have true value in the newCheckedState state that we are assigning to the checkedState state.
      const allCheckedNow = students.every(student => newCheckedState[student.id]);
      //if every value is true, that means, all the students have been checked. so, we can update the setAllChecked to true. if the result is false, keep allChecked to false.
      setAllChecked(allCheckedNow);
    }
  };

  const { t } = useTranslation();

  return (
    <table className="w-full text-textGray text-sm leading-8 my-6">
      <thead className="border-b-2 bg-bgBlue">
        <tr>
          <th className="w-1/12 pt-2">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={handleAllCheckboxChange}
            />
          </th>
          <th className="w-2/12 pt-1">{t('module.dashboard.students')}</th>
          <th className="w-3/12 pt-1">{t('module.settings.name')}</th>
          <th className="w-2/12 pt-1">{t('module.settings.roll')}</th>
          <th className="w-2/12 pt-1">{t('module.settings.class')}</th>
          <th className="w-2/12 pt-1">{t('module.settings.section')}</th>
        </tr>
      </thead>
      <tbody className="divide-y-2 font-medium">
        {students.map((row) => (
          <tr key={row.id} className="text-center">
            <td className="w-1/12">
            {/* if this id does not exist in the checkedState object then give a value of false.*/}
              <input
                type="checkbox"
                checked={checkedState[row.id] || false}
                onChange={() => handleCheckboxChange(row.id)}
              />
            </td>
            <td className="w-2/12">{row.id}</td>
            <td className="w-3/12">{row.name}</td>
            <td className="w-2/12">{row.roll}</td>
            <td className="w-2/12">{row.class}</td>
            <td className="w-2/12">{row.section}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
