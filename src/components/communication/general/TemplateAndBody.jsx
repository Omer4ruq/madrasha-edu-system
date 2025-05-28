import { useTranslation } from "react-i18next";

export default function TemplateAndBody({setCharacterCount}) {
    const {t} = useTranslation();
    return (
        <>
         <div className="space-y-2">
            <label className="">
            {t('module.communication.select_template')}</label>
            <select
            id=""
            name=""
            defaultValue="First Template"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            >
                <option value="First Template">First Template</option>
                <option value="Second Template">Second Template</option>
                <option value="Third Template">Third Template</option>
            </select>
         </div>

         <div className="space-y-2">
            <label className="">
            {t('module.communication.sms_body')}</label>
            <textarea 
            rows="4"
            className="bg-bgGray w-full rounded px-1 py-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            onChange={(e)=> setCharacterCount(e.target.value.length)}></textarea>
         </div>
        </>
    );
}