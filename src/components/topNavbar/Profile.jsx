import { useEffect, useRef, useState } from "react";
import { GoTriangleDown } from "react-icons/go";
import ProfileMenu from "./ProfileMenu";
import profileImage from "/images/profile.jpg";
export default function Profile() {
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
    <div className="flex items-center gap-1 pl-2 sm:pl-3 relative cursor-pointer" ref={modalRef}>
      <img
        src={profileImage}
        className="w-8 sm:w-9 h-8 sm:h-9 rounded-full"
        onClick={()=> setIsOpen(!isOpen)}
      />
      <GoTriangleDown className="text-[#441a05]" onClick={()=> setIsOpen(!isOpen)}/>

      {isOpen && <ProfileMenu />}

    </div>
  );
}
