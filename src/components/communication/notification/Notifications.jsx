import { useState } from "react";
import AdditionalField from "./AdditionalField";
import SelectClassSection from "./SelectClassSection";
import SelectNotification from "./SelectNotification";
import { useTranslation } from "react-i18next";

export default function Notifications() {
  const [notificationType, setNotificationType] = useState("Pay Slip Info");

  const {t} = useTranslation();
    return (
      <div className="bg-white rounded-md p-4 md:px-6 md:py-8 my-4 space-y-4">
        <SelectNotification notificationType={notificationType} setNotificationType={setNotificationType} />

        <SelectClassSection />

        <AdditionalField notificationType={notificationType} />

        {/* submit button */}
        <button
            type="submit"
            className="rounded w-36 p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200"
          >
            
            {t('module.communication.submit')}
        </button>
      </div>
    );
}