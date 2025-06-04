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

  const isChildActive = (children) => {
    if (!children) return false;
    return children.some((child) => {
      if (child.link === location.pathname) return true;
      if (child.children) return isChildActive(child.children);
      return false;
    });
  };

  const isActive = data.link === location.pathname || isChildActive(data.children);

  const childrenToShow = data.children?.filter(child => !child.children) || [];

  useEffect(() => {
    if (isActive && !isOpen && childrenToShow.length > 0) {
      setIsOpen(true);
      setDDId(data.id);
    }
  }, [location.pathname, isActive, data, setDDId]);

  useEffect(() => {
    if (isOpen && data.id !== ddId) {
      setIsOpen(false);
    }
  }, [ddId, data.id]);

  useEffect(() => {
    if (dropdownRef.current) {
      const height = dropdownRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [childrenToShow, isOpen]);

  function handleDropdownClick() {
    if (childrenToShow.length > 0) {
      setIsOpen(prev => !prev);
      setDDId(data.id);
      setItemId(data.parent.id);
      setSelectedMenuItem({ ...data.parent, activeChild: data });
    }
  }

  return (
    <li
      className={`text-white group/dd duration-300 relative ${
        isActive ? "bg-[#00000020]" : ""
      }`}
    >
      <style>
        {`
          @keyframes dropdownSlide {
            from { max-height: 0; opacity: 0; transform: translateY(-10px); }
            to { max-height: ${contentHeight + 20}px; opacity: 1; transform: translateY(0); }
          }
          @keyframes dropdownSlideUp {
            from { max-height: ${contentHeight + 20}px; opacity: 1; transform: translateY(0); }
            to { max-height: 0; opacity: 0; transform: translateY(-10px); }
          }
          .dropdown-open {
            animation: dropdownSlide 0.5s ease-in-out forwards;
          }
          .dropdown-closed {
            animation: dropdownSlideUp 0.5s ease-in-out forwards;
          }
        `}
      </style>

      {/* Dropdown Parent */}

        <Link
          to={data.link || "#"}
          onClick={() => {
            setSelectedMenuItem({ ...data.parent, activeChild: data });
            setItemId(data.parent.id);
          }}
        >
          <div className="flex items-center gap-2 pl-12 pr-6 hover:bg-[#00000010] hover:text-white duration-300">
            <span
              className={`w-[5px] h-[5px] rounded-full absolute top-4 left-7 duration-150 ${
                isActive ? "w-[7px] h-[7px] bg-[#ffffff90]" : "bg-[#441a05] group-hover/dd:bg-[#ffffff90]"
              }`}
            ></span>
            <h5 className={`flex-1 ${isActive ? "text-white font-semibold" : ""}`}>
              {t(data.title)}
            </h5>
          </div>
        </Link>


    </li>
  );
}
