import { useEffect, useRef, useState } from "react";
import { FaRegBell } from "react-icons/fa";
import SingleNotif from "./SingleNotif";
export default function Notifications() {
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
    <div className="flex items-center px-[6px] sm:px-[10px] border-r-2 border-[#441a05] cursor-pointer relative" ref={modalRef} onClick={() => setIsOpen(!isOpen)}>
      <FaRegBell className="text-[#441a05] w-5 sm:w-6 h-5 sm:h-6" />

      {
        isOpen && <SingleNotif />
      }
    </div>
  );
}
