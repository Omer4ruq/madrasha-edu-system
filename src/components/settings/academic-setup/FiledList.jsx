import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Error from "../../common/Error";
import Loading from "../../common/Loading";
import SectionHeader from "../../common/SectionHeader";

export default function FieldList({field, handleEdit, handleDelete, pleaseReRender}) {
   const {t} = useTranslation();

   const [data, setData] = useState(null);
   const [error, setError] = useState(null);
   const [isLoading, setIsLoading] = useState(true);


   useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_SERVER_BASE_URL}/api/${field.path}/`); 
          setData(response.data); 
        } catch (err) {
          setError(err);
        } finally {
          setIsLoading(false); 
        }
      };
  
      fetchData(); 
    }, [field.path, pleaseReRender]);


   if(error) return <Error code={error.originalStatus} errorMessage={error.status}/>;

   if(isLoading) return <Loading />;   

  return (
   <SectionHeader title={field.title} headerStyle="text-center">
      {/* section content */}
      <table className="w-full text-textGray text-lg leading-10 mt-2">
      <thead className="border-b-2">
         <tr>
            <th className="w-2/12">{t('module.settings.serial')}</th>
            <th className="w-6/12">{t('module.settings.name')}</th>
            <th className="w-4/12">{t('module.settings.actions')}</th>
         </tr>
      </thead>
      <tbody className="divide-y-2">
         {data.map((row, index) => (
            <tr key={index} className="text-center">
               <td className="w-2/12">{index+1}</td>
               <td className="w-6/12">{row.name}</td>
               <td className="w-4/12 pb-1">
                  <button
                     className="bg-blue px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                     onClick={() => handleEdit(row, field)}
                  >
                     {t('module.settings.edit')}
                  </button>
                  <button
                     className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                     onClick={() => handleDelete(row, field)}
                  >
                     {t('module.settings.delete')}
                  </button>
               </td>
            </tr>
         ))}
      </tbody>
      </table>
   </SectionHeader>
  )
}
