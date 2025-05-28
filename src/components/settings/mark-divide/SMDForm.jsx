import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import SMDSingleForm from "./SMDSingleForm";
import { useTranslation } from "react-i18next";

export default function SMDForm() {
   const {t} = useTranslation();
   const SMDData = [
      {
         id: "01",
         subject: "bangla",
         type: "written",
         mark: "50",
         pass: "20"
      },
      {
         id: "02",
         subject: "bangla",
         type: "mcq",
         mark: "50",
         pass: "20"
      },
      {
         id: "03",
         subject: "english",
         type: "written",
         mark: "50",
         pass: "20"
      },
   ]

   const [subjects, setSubjects] = useState(SMDData);


   function handleAddField (){
      const maxId = subjects.reduce((acc, cur) => Math.max(acc, Number(cur.id)), 0);

      setSubjects([...subjects,
         {
            id: maxId+1,
            subject: "",
            type: "",
            mark: "",
            pass: ""
         }]);
   }

   function handleChange (subjectId, property, event) {
      const desiredObject = subjects.map(item => {
         if(item.id === subjectId){
            return {...item, [property]:event.target.value}
         } else {
            return item
         }
      });

      setSubjects(desiredObject)
   }

   function handleDeleteField(subjectId){
      const existingsubjects = subjects.filter (item => item.id !== subjectId);

      setSubjects(existingsubjects);
   }
    return (
      <div className="mt-2 space-y-4 md:space-y-1">
         {
            subjects.map(subject => <SMDSingleForm key={subject.id} subject={subject} handleDeleteField={handleDeleteField} handleChange={handleChange} />)
         }

         <div className="flex items-center gap-4 pt-6 pb-4">
            <button
               type="submit"
               onClick={handleAddField}
               className="rounded w-52 p-2 bg-green text-white shadow-md  hover:-translate-y-[2px] duration-200 text-lg"
            >
               <FiPlusCircle className="inline mb-1 mr-1 text-xl"/> {t('module.settings.add_a_field')}
            </button>
            {
               !!(subjects.length) &&  
                  <button
                     type="submit"
                     className="rounded w-32 p-[10px] bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
                  >
                     {t('module.settings.submit')}
                  </button>
            }
         </div>
      </div>
    );
}