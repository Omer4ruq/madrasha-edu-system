import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateInstituteMutation } from "../../../redux/features/api/institute/instituteApi";


export default function AcademicSetupForm({acSetupFields}) {
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState("student-class");
  const [typeValue, setTypeValue] = useState("");
  const {data, isLoading, error} = useCreateInstituteMutation()

  async function handleSubmit(e) {
    e.preventDefault();
    setSelectedType("student-class");
    setTypeValue("");
    
    try {
      console.log(selectedType, typeValue);

      const response = await axios.post(`${import.meta.env.VITE_SERVER_BASE_URL}/api/${selectedType}/`, {name: typeValue});
      return response.data; 
    } catch (error) {
      console.error('Error updating institute information:');
      throw error; 
    } 
  }


  return (
    <div className="bg-white rounded-md px-4 py-2 my-2 sm:my-4">
      <form className="md:flex gap-7 items-center justify-between" onSubmit={handleSubmit}>
        {/* select what type of data to entry */}
        {/* select field */}
        <div className="flex items-center gap-2 md:w-5/12 my-2">
          <label className="w-32 sm:max-lg:w-40">{t('module.settings.select_type')}</label>
          <select
            id=""
            name=""
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          >
          {
            acSetupFields.map((field, index) => (
              <option key={index} value={field.path}>{field.title}</option>
            ))
          }
          </select>
        </div>

        <div className="flex items-center gap-2 md:w-5/12 my-2">
          <label className="w-32 md:max-lg:w-40">{t('module.settings.type_name')}</label>
          <input
            type="text"
            placeholder="Enter Item Name"
            value={typeValue}
            onChange={(e) => setTypeValue(e.target.value)}
            className="bg-bgGray w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
          />
        </div>

        {/* create button */}
        <div className="flex items-center gap-2 md:w-2/12 justify-end my-4">
          <button
            type="submit"
            className="rounded w-full p-3 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200"
          >
            {t('module.settings.create')}
          </button>
        </div>
      </form>

    </div>
  );
}
