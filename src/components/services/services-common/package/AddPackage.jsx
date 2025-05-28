import { LuPlusCircle } from "react-icons/lu";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function AddPackage({ title, setIsAdd }) {
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <button
      type="submit"
      onClick={() => setIsAdd(true)}
      className="rounded w-60 p-[10px] bg-#DB9E30 hover:bg-buttonHover text-white shadow-md hover:-translate-y-[2px] duration-200 flex items-center justify-center gap-3 my-5"
    >
      <LuPlusCircle className="text-white w-5 h-5" />
      {t("module.service.add")} {t(title)} {t("module.service.package")} {/* Translate button text */}
    </button>
  );
}
