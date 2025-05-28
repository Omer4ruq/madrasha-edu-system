import { useState } from "react";
import SMSOverview from "./SMSOverview";
import SMSReceipents from "./SMSReceipents";
import SelectWise from "./SelectWise";
import TemplateAndBody from "./TemplateAndBody";
import { useTranslation } from "react-i18next";

export default function GeneralSMS() {
   const [selectedValue, setSelectedValue] = useState('PClass'); 
   const [characterCount, setCharacterCount] = useState(0);

   const handleChange = (event) => {
     setSelectedValue(event.target.value);
   };

   const {t} = useTranslation();
   
    return (
        <div className="bg-white rounded-md px-4 py-4 md:px-6 sm:py-6 my-4 space-y-4">
         <SelectWise selectedValue={selectedValue} handleChange={handleChange}/>
         <SMSReceipents selectedValue={selectedValue} />
         <TemplateAndBody setCharacterCount={setCharacterCount}/>
         <SMSOverview characterCount={characterCount} />

          <button
            type="submit"
            className="rounded w-36 p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
          >
            {t('module.communication.submit')}
          </button>
        </div>
    );
}