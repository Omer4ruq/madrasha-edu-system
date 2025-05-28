import { useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import CMCSingleForm from "./CMCSingleForm";
import { useTranslation } from "react-i18next";

export default function CMCForm() {
   
  const { t } = useTranslation();
   const CMCData = [
      {
         id: "01",
         subject: "bangla",
         type: "comp",
         serial : '1',
         mark: "100"
      },
      {
         id: "02",
         subject: "english",
         type: "comp",
         serial : '2',
         mark: "100"
      },
      {
         id: "03",
         subject: "math",
         type: "comp",
         serial : '3',
         mark: "100"
      },
      {
         id: "04",
         subject: "biology",
         type: "op",
         serial : '4',
         mark: "100"
      },
   ]

   const [subjects, setSubjects] = useState(CMCData);


   function handleAddField (){
      const maxId = subjects.reduce((acc, cur) => Math.max(acc, Number(cur.id)), 0);

      setSubjects([...subjects,
      {
         id: maxId+1,
         subject: "",
         type: "",
         serial : '',
         mark: ""
      },]);
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
            subjects.map(subject => <CMCSingleForm key={subject.id} subject={subject} handleDeleteField={handleDeleteField} handleChange={handleChange} />)
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