import { useEffect, useRef, useState } from "react";
import { FaRegEnvelope } from "react-icons/fa";
import Singlemail from "./Singlemail";

export default function Mail() {
  const[isOpen, setIsOpen] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    // check if clicked outside of modal area. if dom node exists, means modal is open, then modalRef.current has value. if so, then, check if it contains the clicked element on every mousedown event.
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    //function assigned to eventListener.
    document.addEventListener('mousedown', handleClickOutside);

    //callback to remove the eventLitener.
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className="flex items-center pr-2 sm:pr-3 border-r-2 border-[#441a05] relative cursor-pointer"  ref={modalRef}  onClick={() => setIsOpen(!isOpen)}>
      <FaRegEnvelope className="text-[#441a05] w-5 sm:w-6 h-5 sm:h-6" />

      {
        isOpen && <Singlemail/>
      }
    </div>
  );
}
