import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaAngleDown } from "react-icons/fa6";
import { useLocation, NavLink } from "react-router-dom";
import DropDown from "./DropDown";
import Icons from "./Icons";
import { useSelectedMenu } from "../../context/SelectedMenuContext";

export default function SidebarMenuItem({ item, itemId, setItemId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ddId, setDDId] = useState(null);
  const { setSelectedMenuItem } = useSelectedMenu();
  const { t } = useTranslation();
  const location = useLocation();

  const isChildActive = (children) => {
    if (!children) return false;
    return children.some((child) => child.link === location.pathname);
  };

  const isActive =
    item.link === location.pathname || isChildActive(item.children);

  useEffect(() => {
    if (isActive && !isOpen) {
      setIsOpen(true);
      setItemId(item.id);
      if (item.children) {
        setSelectedMenuItem(item);
      }
    }
  }, [location.pathname, isActive, item, setItemId, setSelectedMenuItem]);

  useEffect(() => {
    if (isOpen && item.id !== itemId) {
      setIsOpen(false);
    }
  }, [itemId, item.id]);

  function handleMenuClick() {
    if (item.children) {
      setIsOpen((prev) => !prev);
      setItemId(item.id);
      setSelectedMenuItem(item);
    }
  }

  return (
    <li
      className={`leading-10 group/main hover:bg-[#00000020] duration-300 relative ${
        isOpen || isActive ? "bg-[#00000020]" : "text-white"
      }`}
    >
      <style>
        {`
          @keyframes menuSlide {
            from { max-height: 0; opacity: 0; transform: translateY(-10px); }
            to { max-height: 5000px; opacity: 1; transform: translateY(0); }
          }
          @keyframes menuSlideUp {
            from { max-height: 0px; opacity: 1; transform: translateY(0); }
            to { max-height: 0; opacity: 0; transform: translateY(-10px); }
          }
          .menu-open {
            animation: menuSlide 0.4s ease-in-out forwards;
          }
          .menu-closed {
            animation: menuSlideUp 0.4s ease-in-out forwards;
          }
        `}
      </style>

      {item.children ? (
        <div
          className={`flex gap-2 items-center px-6 cursor-pointer ${isOpen || isActive ? "text-white font-bold bg-[#00000020]" : ""}`}
          onClick={handleMenuClick}
        >
          <Icons name={item.icon} />
          <h4 className={`flex-1 ${isOpen || isActive ? "text-white font-bold" : ""}`}>
            {t(item.title)}
          </h4>
          <FaAngleDown
            className={`font-thin text-sm duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      ) : (
        <NavLink
          to={item.link || "/"}
          className={({ isActive }) =>
            `flex gap-2 items-center px-6 cursor-pointer duration-300 ${
              isActive ? "text-white bg-[#00000020] font-bold" : ""
            }`
          }
          onClick={() => {
            setItemId(item.id);
            setSelectedMenuItem(item);
          }}
        >
          <Icons name={item.icon} />
          <h4 className="flex-1">{t(item.title)}</h4>
        </NavLink>
      )}

      {isOpen && item?.children && (
        <ul
          className={`py-2 before:content-[''] before:block before:absolute before:z-1 before:left-[30px] before:top-10 before:bottom-0 before:border-l before:border-solid before:border-[#ffffff35] ${
            isOpen ? "menu-open" : "menu-closed"
          }`}
        >
          {item.children.map((dropdown) => (
            <DropDown
              key={dropdown.id}
              data={{ ...dropdown, parent: item }}
              ddId={ddId}
              setDDId={setDDId}
              setItemId={setItemId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
