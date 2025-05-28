import { IoPrintOutline } from "react-icons/io5";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { useReactToPrint } from "react-to-print";

export default function StudentIdHeader({idCardsRef}) {
    const handlePrint = useReactToPrint({
        content: () => idCardsRef.current,
      });

  return (
    <div className="flex justify-between items-center">
      {/* load fee by student */}
      <div className="search_student_fee flex items-center justify-between gap-4">
        <div className="relative w-64">
          <select
            className="bg-bgGray appearance-none w-full rounded p-2 border-2 border-transparent focus:border-#DB9E30 focus:outline-none"
            defaultValue="1"
            name="status"
            id="status"
          >
            <option selected hidden value="1">
              Select Class
            </option>
            <option value="0">One</option>
            <option value="0">Two</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        
      </div>
      <div className="btns flex gap-2">
          <button className="rounded p-2 bg-#DB9E30 hover:bg-buttonHover text-white shadow-md  hover:-translate-y-[2px] duration-200">
            View Id Card
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
