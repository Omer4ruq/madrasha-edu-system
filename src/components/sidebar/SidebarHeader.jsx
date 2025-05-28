import { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import sidebarCover from "/images/sidebar-cover.jpg";


export default function SidebarHeader({searchTerm, setSearchTerm}) {
  const [showSearchBar, setShowSearchBar] = useState(false);

  if (!showSearchBar) { setSearchTerm(""); }  

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-white p-4 pt-6">Dashboard</h2>
      {/* show cover image or searchbar */}
      {showSearchBar ? (
        <div className="flex gap-2 items-center justify-center bg-[#00000065] px-3 py-[9px] mx-6 rounded-md border border-transparent has-[:focus]:border-tertiary has-[:focus]:shadow-md duration-200">
          <input
            type="text"
            placeholder="Search term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm outline-none focus:text-sm"
          />
          <FaAngleUp
            className="text-white text-xl p-[2px] rounded-sm hover:bg-[#DB9E30] duration-100"
            onClick={() => {
              setShowSearchBar(false);
            }}
          />
        </div>
      ) : (
        <div className="relative">
          <div
            className="group/angle absolute top-0 right-1/2 translate-x-1/2 px-2 pb-[2px] pt-0 rounded-b-full bg-[#DB9E30] z-10 hover:border-[#441a05] duration-100"
            onClick={() => {
              setShowSearchBar(true);
            }}
          >
            <FaAngleDown className="text-white text-md group-hover/angle:scale-110 duration-100" />
          </div>
          <img src={sidebarCover} alt="" className="opacity-90" />
        </div>
      )}
    </div>
  );
}
