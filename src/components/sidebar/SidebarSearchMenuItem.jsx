import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaAngleDown } from "react-icons/fa6";
import { NavLink, useLocation } from "react-router-dom";
import DropDownSearch from "./DropDownSearch";
import Icons from "./Icons";

export default function SidebarSearchMenuItem({ item, searchTerm }) {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();
  const currentPath = useLocation();

  function handleMenuClick() {
    setIsOpen((state) => !state);
  }

  let show = structuredClone(item);
  const existInTitle = t(item.title).toLowerCase().includes(searchTerm.toLowerCase());

  if (!existInTitle) {
    if (!item.children) return null;

    const existing = item.children.filter((child) => {
      const doesExist = t(child.title).toLowerCase().includes(searchTerm.toLowerCase());

      if (doesExist) return true;

      if (child.children) {
        const existing2 = child.children?.filter((childL2) =>
          t(childL2.title).toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (existing2.length > 0) return true;
      }

      return false;
    });

    if (existing.length > 0) {
      show.children = existing;
    } else {
      return null;
    }
  }

  return (
    <li
      className={`leading-10 group/main text-[#ffffff85] hover:text-[#ffffffab] hover:bg-[#00000010] duration-200 relative ${
        isOpen && "bg-[#00000010] text-[#b4a0d2]"
      }`}
    >
      <NavLink
        to={show?.link ? show.link : currentPath.pathname}
        className={({ isActive }) =>
          `flex gap-2 items-center px-6 ${
            isActive ? "text-white bg-[#00000010] font-semibold" : ""
          }`
        }
        onClick={handleMenuClick}
      >
        <Icons name={show.icon} />
        <h4
          className={` duration-200 flex-1 ${
            isOpen && "text-[#fff]"
          }`}
        >
          {t(show.title)}
        </h4>
        {show?.children && (
          <FaAngleDown
            className={`font-thin text-sm duration-200 ${
              isOpen && "rotate-180"
            }`}
          />
        )}
      </NavLink>

      {isOpen && show?.children && (
        <ul className="py-2 before:content-[''] before:block before:absolute before:z-1 before:left-[30px] before:top-10 before:bottom-0 before:border-l before:border-solid before:border-[#ffffff35]">
          {show.children.map((dropdown) => (
            <DropDownSearch
              key={dropdown.id}
              data={dropdown}
              searchTerm={searchTerm}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
