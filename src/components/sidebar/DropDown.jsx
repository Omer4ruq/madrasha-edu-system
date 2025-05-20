// src/components/sidebar/DropDown.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaAngleDown } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { useSelectedMenu } from "../../context/SelectedMenuContext";

export default function DropDown({ data, ddId, setDDId }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const { setSelectedMenuItem } = useSelectedMenu();
  
  // Check if this dropdown or any of its children are active
  const isActive = location.pathname === data.link || 
    (data.children && data.children.some(child => location.pathname === child.link));
    
  // Open dropdown if it or its children are active
  useEffect(() => {
    if (isActive && !isOpen && data.children) {
      setIsOpen(true);
      setDDId(data.id);
    }
  }, [location.pathname, isActive, isOpen, data, setDDId]);

  // Close dropdown if another one is opened
  useEffect(() => {
    if (isOpen && data.id !== ddId) {
      setIsOpen(false);
    }
  }, [ddId, isOpen, data.id]);

  function handleDropdownClick() {
    // For dropdowns with children, only toggle visibility, no navigation
    if (data.children) {
      setIsOpen((state) => !state);
      setDDId(data.id);
    }
  }

  return (
    <li
      className={`text-[#ffffffab] group/dd duration-200 relative ${
        isOpen || isActive ? "bg-[#00000010]" : ""
      }`}
    >
      {data.children ? (
        // For dropdowns with children - no Link wrapper, just toggle
        <div
          className="flex items-center gap-2 pl-12 pr-6 hover:bg-[#00000010] hover:text-white cursor-pointer"
          onClick={handleDropdownClick}
        >
          <span
            className={`w-[5px] h-[5px] rounded-full group-hover/dd:w-[7px] group-hover/dd:h-[7px] duration-100 bg-[#ffffff65] group-hover/dd:bg-[#ffffff90] absolute top-4 left-7 ${
              (isOpen || isActive) && "w-[7px] h-[7px] bg-[#ffffff90]"
            }`}
          ></span>
          <h5 className={`flex-1 ${(isOpen || isActive) && "text-white"}`}>
            {t(data.title)}
          </h5>
          <FaAngleDown
            className={`font-thin text-sm duration-200 ${
              isOpen && "rotate-180"
            }`}
          />
        </div>
      ) : (
        // For regular dropdown items - allow navigation with Link
        <Link 
          to={data.link} 
          onClick={() => {
            // Update selected menu context for breadcrumb
            setSelectedMenuItem({
              ...data.parent, // Keep parent info for tabs
              activeChild: data // Mark which child is active
            });
          }}
        >
          <div className="flex items-center gap-2 pl-12 pr-6 hover:bg-[#00000010] hover:text-white">
            <span
              className={`w-[5px] h-[5px] rounded-full group-hover/dd:w-[7px] group-hover/dd:h-[7px] duration-100 bg-[#ffffff65] group-hover/dd:bg-[#ffffff90] absolute top-4 left-7 ${
                isActive && "w-[7px] h-[7px] bg-[#ffffff90]"
              }`}
            ></span>
            <h5 className={`flex-1 ${isActive && "text-white"}`}>
              {t(data.title)}
            </h5>
          </div>
        </Link>
      )}
      
      {isOpen && data?.children && (
        <ul className="py-2">
          {data.children.map((innerDD) => (
            <Link 
              to={innerDD.link} 
              key={innerDD.id} 
              onClick={() => {
                // Update parent and active child info for breadcrumb
                setSelectedMenuItem({
                  ...data.parent, // Grandparent
                  activeChild: {
                    ...data, // Parent
                    activeChild: innerDD // Child
                  }
                });
              }}
            >
              <li className={`hover:bg-[#00000010] hover:text-white duration-200 pl-12 pr-6 ${
                location.pathname === innerDD.link ? "text-white bg-[#00000010]" : ""
              }`}>
                {t(innerDD.title)}
              </li>
            </Link>
          ))}
        </ul>
      )}
    </li>
  );
}