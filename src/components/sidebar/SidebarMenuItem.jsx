import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaAngleDown } from "react-icons/fa6";
import { useLocation, Link } from "react-router-dom";
import DropDown from "./DropDown";
import Icons from "./Icons";
import { useSelectedMenu } from "../../context/SelectedMenuContext";

export default function SidebarMenuItem({ item, itemId, setItemId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ddId, setDDId] = useState(null);
  const { setSelectedMenuItem } = useSelectedMenu();
  const { t } = useTranslation();
  const location = useLocation();

  // Check if this menu item or any of its children are active based on the current path
  const isActive = location.pathname === item.link || 
    (item.children && item.children.some(child => 
      child.link === location.pathname || 
      (child.children && child.children.some(subItem => subItem.link === location.pathname))
    ));

  // Open the menu item if it or any of its children are active
  useEffect(() => {
    if (isActive && !isOpen) {
      setIsOpen(true);
      setItemId(item.id);
      
      // Set selected menu item if it has children for breadcrumb tabs
      if (item.children) {
        setSelectedMenuItem(item);
      }
    }
  }, [location.pathname, isActive, isOpen, item, setItemId, setSelectedMenuItem]);

  // Close this dropdown if another one is opened
  useEffect(() => {
    if (isOpen && item.id !== itemId) {
      setIsOpen(false);
    }
  }, [itemId, isOpen, item.id]);

  function handleMenuClick() {
    // If the item has no children, navigation is handled by the Link component
    // If it has children, toggle the dropdown and set selected menu item
    if (item.children) {
      setIsOpen((state) => !state);
      setItemId(item.id);
      setSelectedMenuItem(item);
    }
  }

  return (
    <li
      className={`leading-10 group/main text-[#ffffff85] hover:text-[#ffffffab] hover:bg-[#00000010] duration-200 relative ${
        isOpen || isActive ? "bg-[#00000010] text-[#b4a0d2]" : ""
      }`}
    >
      {item.children ? (
        <div className="flex gap-2 items-center px-6 cursor-pointer" onClick={handleMenuClick}>
          <Icons name={item.icon} />
          <h4
            className={`text-[#ffffffab] group-hover/main:text-white duration-200 flex-1 ${
              isOpen || isActive ? "text-[#fff]" : ""
            }`}
          >
            {t(item.title)}
          </h4>
          <FaAngleDown
            className={`font-thin text-sm duration-200 ${
              isOpen && "rotate-180"
            }`}
          />
        </div>
      ) : (
        <Link
          to={item.link}
          className="flex gap-2 items-center px-6 cursor-pointer"
          onClick={() => {
            setItemId(item.id);
            setSelectedMenuItem(item);
          }}
        >
          <Icons name={item.icon} />
          <h4
            className={`text-[#ffffffab] group-hover/main:text-white duration-200 flex-1 ${
              isActive ? "text-[#fff]" : ""
            }`}
          >
            {t(item.title)}
          </h4>
        </Link>
      )}
      {isOpen && item?.children && (
        <ul className="py-2 before:content-[''] before:block before:absolute before:z-1 before:left-[30px] before:top-10 before:bottom-0 before:border-l before:border-solid before:border-[#ffffff35]">
          {item.children.map((dropdown) => (
            <DropDown
              key={dropdown.id}
              data={{ ...dropdown, parent: item }}
              ddId={ddId}
              setDDId={setDDId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}