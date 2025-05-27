import { FaBars } from "react-icons/fa6";
import LangSwitcher from "./LangSwitcher";
import Mail from "./Mail";
import Notifications from "./Notifications";
import Profile from "./Profile";
import SchoolName from "./SchoolName";
import { useState, useEffect } from "react";
import './topNavbar.css'
export default function TopNavbar({ setShowSidebar }) {
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsFloating(true);
      } else {
        setIsFloating(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex items-center justify-between bg-slate-800 bg-[linear-gradient(270deg,rgba(51,148,225,0.18),transparent)] rounded-md p-3 sm:p-3">
      {/* school name */}
      <div className="flex gap-3 sm:gap-4 items-center">
        <FaBars
         className={`
  border border-white rounded w-6 sm:w-7 h-6 sm:h-7 p-1 xl:hidden cursor-pointer
  transition-all duration-300 ease-in-out
  ${isFloating
    ? "fixed top-4 left-4 z-50 bg-primary text-white scale-110 shadow-lg floating-bars"
    : "text-white"
  }
`}
          onClick={() => setShowSidebar((state) => !state)}
        />
        <SchoolName />
      </div>
      {/* actions */}
      <div className="flex items-center">
        <LangSwitcher />
        <Mail />
        <Notifications />
        <Profile />
      </div>
    </div>
  );
}