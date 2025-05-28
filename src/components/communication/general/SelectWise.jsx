import { useTranslation } from "react-i18next";

export default function SelectWise({selectedValue, handleChange}) {
    const {t} = useTranslation();
    return (
      <div className="space-y-2">
         <label className="w-28 md:max-lg:w-32">
         {t('module.communication.select_wise')}</label>
         <select
         id=""
         name=""
         value={selectedValue}
         onChange={handleChange}
         className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
         >
            <option value="PClass">Parent(Class)</option>
            <option value="PSection">Parent(section)</option>
            <option value="Teacher">Teacher</option>
            <option value="Staff">Staff</option>
            <option value="Selected Parent">Selected Parent</option>
            <option value="Selected Employee">Selected Employee</option>
            <option value="Institute">Institute</option>
         </select>
     </div>
    );
}