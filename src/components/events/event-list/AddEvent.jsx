import { LuPlusCircle } from "react-icons/lu";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function AddEvent({ setIsAdd }) {
  const { t } = useTranslation(); // Initialize translation function

  return (
    <button
      type="submit"
      onClick={() => setIsAdd(true)}
      className="rounded w-48 p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200 flex items-center justify-center gap-2"
    >
      <LuPlusCircle className="text-white w-4 h-4" />
      {t("events.add_new_event")} {/* Use translation key */}
    </button>
  );
}
