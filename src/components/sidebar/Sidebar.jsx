import { useEffect, useRef, useState } from "react";
import { MdHighlightOff } from "react-icons/md";
import SidebarHeader from "./SidebarHeader";
import SidebarMenu from "./SidebarMenu";
import SidebarSearchMenu from "./SidebarSearchMenu";

export default function Sidebar({ showSidebar, setShowSidebar }) {
  const sidebarRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowSidebar]);

  return (
    <nav
      ref={sidebarRef}
      id="sidebar-menu"
      className={`fixed transition-all duration-300 ease-in-out h-screen shadow-sm w-0 xl:w-72 ${
        showSidebar && "w-72"
      } z-20`}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-cover z-0"
        style={{
          backgroundImage:
            "url('https://shaha.ancorathemes.com/wp-content/uploads/2017/06/bg-15.jpg?id=370')",
        }}
      ></div>

      {/* Overlay Color */}
      {/* <div className="absolute inset-0 bg-black opacity-20 z-0"></div> */}

      {/* Sidebar Content */}
      <div className="relative h-full overflow-y-auto scrollbar-webkit z-10 text-white">
        <SidebarHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        {!searchTerm ? (
          <SidebarMenu />
        ) : (
          <SidebarSearchMenu searchTerm={searchTerm} />
        )}
        <MdHighlightOff
          className="text-white w-6 h-6 absolute top-[14px] right-3 xl:hidden cursor-pointer"
          onClick={() => setShowSidebar(false)}
        />
      </div>
    </nav>
  );
}
