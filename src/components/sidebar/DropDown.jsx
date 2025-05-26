import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaAngleDown } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { useSelectedMenu } from "../../context/SelectedMenuContext";

export default function DropDown({ data, ddId, setDDId, setItemId }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const { setSelectedMenuItem } = useSelectedMenu();
  const dropdownRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Recursive function to check if any child or subchild is active
  const isChildActive = (children) => {
    if (!children) return false;
    return children.some(
      (child) =>
        child.link === location.pathname ||
        (child.children && isChildActive(child.children))
    );
  };

  // Check if this dropdown or any of its children are active
  const isActive = data.link === location.pathname || isChildActive(data.children);

  // Open dropdown if it or its children are active
  useEffect(() => {
    if (isActive && !isOpen && data.children) {
      setIsOpen(true);
      setDDId(data.id);
    }
    console.log(`DropDown ${data.title}: isOpen=${isOpen}, isActive=${isActive}`);
  }, [location.pathname, isActive, data, setDDId]);

  // Close dropdown if another one is opened
  useEffect(() => {
    if (isOpen && data.id !== ddId) {
      setIsOpen(false);
    }
  }, [ddId, data.id]);

  // Calculate dropdown content height dynamically
  useEffect(() => {
    if (dropdownRef.current) {
      const height = dropdownRef.current.scrollHeight;
      setContentHeight(height);
      console.log(`DropDown ${data.title}: contentHeight=${height}px`);
    }
  }, [data.children, isOpen]);

  function handleDropdownClick() {
    if (data.children) {
      setIsOpen((prev) => !prev);
      setDDId(data.id);
      setItemId(data.parent.id); // Ensure parent dropdown remains open
    }
  }

  return (
    <li
      className={`text-[#ffffffab] group/dd duration-200 relative ${
        isOpen || isActive ? "bg-[#00000010]" : ""
      }`}
    >
      {data?.children ? (
        <div
          className="flex items-center gap-2 pl-12 pr-6 hover:bg-[#00000010] hover:text-white cursor-pointer"
          onClick={handleDropdownClick}
        >
          <span
            className={`w-[5px] h-[5px] rounded-full group-hover/dd:w-[7px] group-hover/dd:h-[7px] duration-100 bg-[#ffffff65] group-hover/dd:bg-[#ffffff90] absolute top-4 left-7 ${
              isOpen || isActive ? "w-[7px] h-[7px] bg-[#ffffff90]" : ""
            }`}
          ></span>
          <h5 className={`flex-1 ${isOpen || isActive ? "text-white" : ""}`}>
            {t(data.title)}
          </h5>
          <FaAngleDown
            className={`font-thin text-sm duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      ) : (
        <Link
          to={data.link || "#"}
          onClick={() => {
            setSelectedMenuItem({
              ...data.parent,
              activeChild: data,
            });
            setItemId(data.parent.id); // Keep parent dropdown open
          }}
        >
          <div className="flex items-center gap-2 pl-12 pr-6 hover:bg-[#00000010] hover:text-white">
            <span
              className={`w-[5px] h-[5px] rounded-full group-hover/dd:w-[7px] group-hover/dd:h-[7px] duration-100 bg-[#ffffff65] group-hover/dd:bg-[#ffffff90] absolute top-4 left-7 ${
                isActive ? "w-[7px] h-[7px] bg-[#ffffff90]" : ""
              }`}
            ></span>
            <h5 className={`flex-1 ${isActive ? "text-white" : ""}`}>
              {t(data.title)}
            </h5>
          </div>
        </Link>
      )}
      {data?.children && (
        <div
          className={`overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[max-height,opacity,transform] ${
            isOpen
              ? `max-h-[${contentHeight + 20}px] opacity-100 translate-y-0`
              : "max-h-0 opacity-0 -translate-y-2"
          }`}
          style={{ transitionProperty: "max-height, opacity, transform" }}
        >
          <ul ref={dropdownRef} className="py-2">
            {data.children.map((innerDD) => (
              <Link
                to={innerDD.link || "#"}
                key={innerDD.id}
                onClick={() => {
                  setSelectedMenuItem({
                    ...data.parent,
                    activeChild: {
                      ...data,
                      activeChild: innerDD,
                    },
                  });
                  setItemId(data.parent.id); // Keep parent dropdown open
                  setDDId(innerDD.id); // Set sub-dropdown ID
                }}
              >
                <li
                  className={`hover:bg-[#00000010] hover:text-white duration-200 pl-12 pr-6 ${
                    location.pathname === innerDD.link
                      ? "text-white bg-[#00000010]"
                      : ""
                  }`}
                >
                  {t(innerDD.title)}
                </li>
              </Link>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}