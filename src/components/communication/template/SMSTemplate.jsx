import { useState } from "react";
import { Link } from "react-router-dom";
import DeleteModal from "../../common/DeleleModal";
import { useTranslation } from "react-i18next";

export default function SMSTemplate() {
  const [isDelete, setIsDelete] = useState(false);

  function handleDelete() {
    setIsDelete(true);
  }

  const templates= [
    {
      id: '001',
      name: "First Template",
      body: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas, temporibus.',
    },
    {
      id: '002',
      name: "Second Template",
      body: 'Lorem ipsum elit. Voluptas, temporibus. Totam animi aliquid exercitationem, deleniti sequi obcaecati?',
    }
  ]

  
  const {t} = useTranslation();
    return (
      <div className="bg-white p-4 md:p-6 rounded-md my-4">
        <h3 className="text-lg md:text-xl font-medium">
        {t('module.communication.submit')}</h3>

        <div className="flex justify-end mt-2 mb-4">
          <Link to="/communication/add-sms-template">
            <button
            type="submit"
            className="rounded w-52 p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
            >
            
            {t('module.communication.add_new_template')}
            </button> 
          </Link>
        </div>

         <table className="w-full text-textGray leading-10 mb-4">
          <thead className="bg-bgBlue">
            <tr>
              <th className="w-2/12">
              {t('module.communication.id')}</th>
              <th className="w-3/12">
              {t('module.communication.title')}</th>
              <th className="w-5/12">
              {t('module.communication.template')}</th>
              <th className="w-2/12">
              {t('module.communication.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((row, index) => (
              <tr key={index} className="text-center border-b-2 even:bg-slate-200">
                <td className="w-2/12">{row.id}</td>
                <td className="w-3/12">{row.name}</td>
                <td className="w-5/12">{row.body.length > 35 ? row.body.slice(0, 35) + "..." : row.body}</td>
                <td className="w-2/12">
                  <button
                    className="bg-red px-3 py-1 rounded shadow text-white hover:-translate-y-[2px] duration-200 text-sm m-1"
                    onClick={handleDelete}
                  >
                    
            {t('module.communication.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
      </table>

      {/* show only when isDelete is true */}
      <DeleteModal title="SMS template" isOpen={isDelete} onClose={()=>setIsDelete(false)} handleDelete={handleDelete} />
      </div>
    );
}