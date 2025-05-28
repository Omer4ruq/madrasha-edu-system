import { useTranslation } from "react-i18next";
import { IoPrintOutline } from "react-icons/io5";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { useReactToPrint } from "react-to-print";

export default function StudentIdHeader({idCardsRef}) {
    const handlePrint = useReactToPrint({
        content: () => idCardsRef.current,
      });

      const {t} = useTranslation();

  return (
    <div className="flex justify-end items-center">
      <div className="btns flex gap-2">
          <button className="rounded p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200">
            {t('module.teacher.view_id_card')}
          </button>
          <button className="rounded p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200">
            <MdOutlineQrCodeScanner size={22} />
          </button>
          <button onClick={handlePrint} className="rounded p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200">
            <IoPrintOutline size={22} />
          </button>
        </div>
    </div>
  );
}
