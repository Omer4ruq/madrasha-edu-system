import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaAngleDown } from "react-icons/fa6";
import { NavLink, useLocation } from "react-router-dom";

export default function DropDownSearch({ data, searchTerm }) {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();
  const currentPath = useLocation();

  let show = structuredClone(data);

  if (show.children) {
    show.children = show.children.filter((child) =>
      t(child.title).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return (
    <li
      className={`text-[#ffffffab] group/dd duration-200 relative ${
        isOpen && show?.children && "bg-[#00000010]"
      }`}
    >
      <NavLink
        to={show?.link || currentPath.pathname}
        className={({ isActive }) =>
          `flex items-center gap-2 pl-12 pr-6 hover:bg-[#00000010] hover:text-white ${
            isActive ? "text-white font-semibold" : ""
          }`
        }
        // onClick={handleMenuClick}
      >
        <span
          className={`w-[5px] h-[5px] rounded-full group-hover/dd:w-[7px] group-hover/dd:h-[7px] duration-100 bg-[#ffffff65] group-hover/dd:bg-[#ffffff90] absolute top-4 left-7 ${
            isOpen && show?.children && "w-[7px] h-[7px] bg-[#ffffff90]"
          }`}
        ></span>
        <h5 className={`flex-1 ${isOpen && show?.children && "text-white"}`}>
          {t(data.title)}
        </h5>
      </NavLink>
    </li>
  );
}
